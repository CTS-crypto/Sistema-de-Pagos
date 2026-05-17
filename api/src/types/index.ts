export interface Payment {
  id: number;
  user_id: number;
  card_id: number;
  amount: number;
  status: 'APPROVED' | 'REJECTED';
  description: string | null;
  created_at: Date;
}

export interface Card {
  id: number;
  user_id: number;
  last_four: string;
  cardholder_name: string;
  expiration_date: string;
  card_type: 'VISA' | 'MASTERCARD' | 'AMEX';
  created_at: Date;
}

export interface JwtPayload {
  id: number;
  email: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
