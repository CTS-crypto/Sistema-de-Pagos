import pool from '../../config/db';
import { AuthUserRecord, PublicUserRecord, UserRepository } from '../interfaces';

export class PgUserRepository implements UserRepository {
  async existsByEmail(email: string): Promise<boolean> {
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    return result.rows.length > 0;
  }

  async create(name: string, email: string, passwordHash: string): Promise<PublicUserRecord> {
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
      [name, email, passwordHash]
    );

    return result.rows[0] as PublicUserRecord;
  }

  async findAuthByEmail(email: string): Promise<AuthUserRecord | null> {
    const result = await pool.query('SELECT id, email, password_hash FROM users WHERE email = $1', [email]);
    return (result.rows[0] as AuthUserRecord | undefined) ?? null;
  }

  async findPublicById(id: number): Promise<PublicUserRecord | null> {
    const result = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = $1', [id]);
    return (result.rows[0] as PublicUserRecord | undefined) ?? null;
  }
}
