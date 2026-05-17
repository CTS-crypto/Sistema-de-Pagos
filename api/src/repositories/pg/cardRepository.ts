import pool from '../../config/db';
import { Card } from '../../types';
import { CardRepository, CreateCardInput } from '../interfaces';

export class PgCardRepository implements CardRepository {
  async create(input: CreateCardInput): Promise<Card> {
    const result = await pool.query(
      'INSERT INTO cards (user_id, last_four, cardholder_name, expiration_date, card_type) VALUES ($1, $2, $3, $4, $5) RETURNING id, user_id, last_four, cardholder_name, expiration_date, card_type, created_at',
      [input.user_id, input.last_four, input.cardholder_name, input.expiration_date, input.card_type]
    );

    return result.rows[0] as Card;
  }

  async findByUserId(userId: number): Promise<Card[]> {
    const result = await pool.query(
      'SELECT id, user_id, last_four, cardholder_name, expiration_date, card_type, created_at FROM cards WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return result.rows as Card[];
  }

  async existsByIdAndUser(cardId: number, userId: number): Promise<boolean> {
    const result = await pool.query('SELECT id FROM cards WHERE id = $1 AND user_id = $2', [cardId, userId]);
    return result.rows.length > 0;
  }
}
