import pool from '../../config/db';
import { Payment } from '../../types';
import { CreatePaymentInput, PaymentHistoryRow, PaymentRepository } from '../interfaces';

export class PgPaymentRepository implements PaymentRepository {
  async create(input: CreatePaymentInput): Promise<Payment> {
    const result = await pool.query(
      'INSERT INTO payments (user_id, card_id, amount, status, description) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, card_id, amount, status, description, created_at',
      [input.user_id, input.card_id, input.amount, input.status, input.description ?? null]
    );

    return result.rows[0] as Payment;
  }

  async findByUserIdPaginated(userId: number, limit: number, offset: number): Promise<PaymentHistoryRow[]> {
    const result = await pool.query(
      `SELECT
        COUNT(*) OVER() as total,
        p.id,
        p.user_id,
        p.card_id,
        p.amount,
        p.status,
        p.description,
        p.created_at,
        t.last_four,
        t.card_type
      FROM payments p
      LEFT JOIN cards t ON p.card_id = t.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows as PaymentHistoryRow[];
  }
}
