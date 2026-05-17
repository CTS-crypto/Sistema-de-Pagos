import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { persistence } from '../repositories';

export const createCard = async (req: any, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const user_id = req.user?.id;
    const { card_number, cardholder_name, expiration_date, card_type } = req.body;

    if (!user_id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Extract last 4 digits
    const last_four = card_number.slice(-4);

    // Create card
    const card = await persistence.cardRepository.create({
      user_id,
      last_four,
      cardholder_name,
      expiration_date,
      card_type,
    });

    res.status(201).json(card);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create card' });
  }
};

export const getUserCards = async (req: any, res: Response): Promise<void> => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const cards = await persistence.cardRepository.findByUserId(user_id);

    res.status(200).json(cards);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
};
