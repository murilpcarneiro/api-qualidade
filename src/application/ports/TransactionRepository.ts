import type { Transaction } from "../../domain/entities/Transaction";

export interface TransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findByCardAndMonth(cardId: string, referenceMonth: string): Promise<Transaction[]>;
  save(transaction: Transaction): Promise<void>;
}
