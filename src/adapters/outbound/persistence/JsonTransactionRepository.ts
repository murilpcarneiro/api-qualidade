import type { TransactionRepository } from "../../../application/ports/TransactionRepository";
import { Transaction } from "../../../domain/entities/Transaction";
import type { JsonDatabase } from "../../../infrastructure/database/JsonDatabase";
import type { TransactionStatus } from "../../../shared/constants/transaction-status";

interface TransactionRecord {
  id: string;
  cardId: string;
  userId: string;
  amountCents: number;
  description: string;
  status: TransactionStatus;
  referenceMonth: string;
  createdAt: string;
  cancelledAt?: string;
  chargebackAt?: string;
}

export class JsonTransactionRepository implements TransactionRepository {
  constructor(private readonly database: JsonDatabase) {}

  public async findById(id: string): Promise<Transaction | null> {
    const db = await this.database.read();
    const record = (db.transactions as TransactionRecord[]).find((transaction) => transaction.id === id);
    return record ? this.toEntity(record) : null;
  }

  public async findByCardAndMonth(cardId: string, referenceMonth: string): Promise<Transaction[]> {
    const db = await this.database.read();
    return (db.transactions as TransactionRecord[])
      .filter((transaction) => transaction.cardId === cardId && transaction.referenceMonth === referenceMonth)
      .map((record) => this.toEntity(record));
  }

  public async save(transaction: Transaction): Promise<void> {
    const db = await this.database.read();
    const record = this.toRecord(transaction);
    const transactions = db.transactions as TransactionRecord[];
    const index = transactions.findIndex((currentTransaction) => currentTransaction.id === record.id);

    if (index >= 0) {
      transactions[index] = record;
    } else {
      transactions.push(record);
    }

    await this.database.write(db);
  }

  private toEntity(record: TransactionRecord): Transaction {
    return Transaction.create({
      id: record.id,
      cardId: record.cardId,
      userId: record.userId,
      amountCents: record.amountCents,
      description: record.description,
      status: record.status,
      referenceMonth: record.referenceMonth,
      createdAt: new Date(record.createdAt),
      cancelledAt: record.cancelledAt ? new Date(record.cancelledAt) : undefined,
      chargebackAt: record.chargebackAt ? new Date(record.chargebackAt) : undefined
    });
  }

  private toRecord(transaction: Transaction): TransactionRecord {
    const data = transaction.toJSON();
    return {
      id: data.id,
      cardId: data.cardId,
      userId: data.userId,
      amountCents: data.amountCents,
      description: data.description,
      status: data.status,
      referenceMonth: data.referenceMonth,
      createdAt: data.createdAt.toISOString(),
      cancelledAt: data.cancelledAt ? data.cancelledAt.toISOString() : undefined,
      chargebackAt: data.chargebackAt ? data.chargebackAt.toISOString() : undefined
    };
  }
}
