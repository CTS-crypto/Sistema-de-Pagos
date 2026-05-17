import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/authenticate';
import { createCard, getUserCards } from '../controllers/cardController';

const router: Router = Router();

// Create card (protected)
router.post(
  '/',
  authenticate,
  [
    body('card_number')
      .matches(/^\d{16}$/)
      .withMessage('Card number must be 16 digits'),
    body('cardholder_name').trim().notEmpty().withMessage('Cardholder name is required'),
    body('expiration_date')
      .matches(/^\d{2}\/\d{2}$/)
      .withMessage('Expiration date must be in MM/YY format'),
    body('card_type')
      .isIn(['VISA', 'MASTERCARD', 'AMEX'])
      .withMessage('Invalid card type'),
  ],
  createCard
);

// Get user cards (protected)
router.get('/', authenticate, getUserCards);

export default router;
