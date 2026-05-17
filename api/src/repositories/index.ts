import { CardRepository, PaymentRepository, UserRepository } from './interfaces';
import { PgCardRepository } from './pg/cardRepository';
import { PgPaymentRepository } from './pg/paymentRepository';
import { PgUserRepository } from './pg/userRepository';

export interface PersistenceProvider {
  userRepository: UserRepository;
  cardRepository: CardRepository;
  paymentRepository: PaymentRepository;
}

// Single composition point: swap these implementations to change persistence technology.
export const persistence: PersistenceProvider = {
  userRepository: new PgUserRepository(),
  cardRepository: new PgCardRepository(),
  paymentRepository: new PgPaymentRepository(),
};
