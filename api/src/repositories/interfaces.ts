import { Card, Payment } from '../types';

export interface AuthUserRecord {
  id: number;
  email: string;
  password_hash: string;
}

export interface PublicUserRecord {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}

export interface UserRepository {
  existsByEmail(email: string): Promise<boolean>;
  create(name: string, email: string, passwordHash: string): Promise<PublicUserRecord>;
  findAuthByEmail(email: string): Promise<AuthUserRecord | null>;
  findPublicById(id: number): Promise<PublicUserRecord | null>;
}

export interface CreateCardInput {
  user_id: number;
  last_four: string;
  cardholder_name: string;
  expiration_date: string;
  card_type: Card['card_type'];
}

export interface CardRepository {
  create(input: CreateCardInput): Promise<Card>;
  findByUserId(userId: number): Promise<Card[]>;
  existsByIdAndUser(cardId: number, userId: number): Promise<boolean>;
}

export interface PaymentHistoryRow {
  total: string;
  id: number;
  user_id: number;
  card_id: number;
  amount: number;
  status: Payment['status'];
  description: string | null;
  created_at: Date;
  last_four: string | null;
  card_type: Card['card_type'] | null;
}

export interface CreatePaymentInput {
  user_id: number;
  card_id: number;
  amount: number;
  status: Payment['status'];
  description?: string | null;
}

export interface PaymentRepository {
  create(input: CreatePaymentInput): Promise<Payment>;
  findByUserIdPaginated(userId: number, limit: number, offset: number): Promise<PaymentHistoryRow[]>;
}
