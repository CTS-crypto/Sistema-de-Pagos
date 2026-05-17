import { Response } from 'express';
import axios from 'axios';
import { validationResult } from 'express-validator';
import { PaginatedResponse, Payment } from '../types';
import { persistence } from '../repositories';

const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:8000';

export const createPayment = async (req: any, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const user_id = req.user?.id;
    const { card_id, amount, cvv, description } = req.body;

    if (!user_id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Verify card belongs to user
    const cardExists = await persistence.cardRepository.existsByIdAndUser(card_id, user_id);

    if (!cardExists) {
      res.status(404).json({ error: 'Card not found' });
      return;
    }

    // Call payment service
    let status: Payment['status'] = 'REJECTED';
    try {
      const paymentResponse = await axios.post(
        `${PAYMENT_SERVICE_URL}/process-payment`,
        { amount, cvv },
        { timeout: 5000 }
      );
      status = paymentResponse.data.approved ? 'APPROVED' : 'REJECTED';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Payment service error:', errorMessage);
      status = 'REJECTED';
    }

    // Create payment record
    const payment = await persistence.paymentRepository.create({
      user_id,
      card_id,
      amount,
      status,
      description: description || null,
    });

    res.status(201).json(payment);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to create payment:', errorMessage);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

export const getUserPayments = async (req: any, res: Response): Promise<void> => {
  try {
    const user_id = req.user?.id;
    const userId = parseInt(req.params.id, 10);
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(parseInt(req.query.limit || '10', 10), 100);
    const offset = (page - 1) * limit;

    if (!user_id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Ownership check: user can only see their own payments
    if (user_id !== userId) {
      res.status(403).json({ error: 'Forbidden: Cannot view other users payments' });
      return;
    }

    // Get total count and paginated data in one query
    const result = await persistence.paymentRepository.findByUserIdPaginated(user_id, limit, offset);

    if (result.length === 0) {
      const emptyResponse: PaginatedResponse<Payment> = {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
      res.status(200).json(emptyResponse);
      return;
    }

    const total = parseInt(result[0].total, 10);
    const totalPages = Math.ceil(total / limit);

    const data = result.map((row) => ({
      id: row.id,
      user_id: row.user_id,
      card_id: row.card_id,
      amount: row.amount,
      status: row.status,
      description: row.description,
      created_at: row.created_at,
      card: {
        last_four: row.last_four,
        card_type: row.card_type,
      },
    }));

    const response: PaginatedResponse<any> = {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};
