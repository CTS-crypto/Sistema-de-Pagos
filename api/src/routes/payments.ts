import { Router } from 'express';
import { body, query } from 'express-validator';
import { authenticate } from '../middleware/authenticate';
import { createPayment, getUserPayments } from '../controllers/paymentController';

const router: Router = Router();

// Create payment (protected)
router.post(
  '/payments',
  authenticate,
  [
    body('card_id').isInt().withMessage('Valid card ID is required'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    body('cvv')
      .isString()
      .trim()
      .matches(/^\d{3,4}$/)
      .withMessage('CVV must be 3 or 4 digits'),
    body('description').optional().trim(),
  ],
  createPayment
);

// Get user payments with pagination (protected)
router.get(
  '/users/:id/payments',
  authenticate,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  getUserPayments
);

export default router;
