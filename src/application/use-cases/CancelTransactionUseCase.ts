import type { TransactionByIdInputDto } from "../dto/requests";
import type { TransactionRepository } from "../ports/TransactionRepository";
import type { CardRepository } from "../ports/CardRepository";
import { NotFoundError } from "../../shared/errors/NotFoundError";
import type { Transaction } from "../../domain/entities/Transaction";

export class CancelTransactionUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly cardRepository: CardRepository
  ) {}

  public async execute(input: TransactionByIdInputDto): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(input.transactionId);
    if (!transaction) {
      throw new NotFoundError("Transaction not found");
    }

    const card = await this.cardRepository.findById(transaction.cardId);
    if (!card) {
      throw new NotFoundError("Card not found");
    }

    transaction.cancel(new Date());
    card.release(transaction.amountCents);

    await this.transactionRepository.save(transaction);
    await this.cardRepository.save(card);

    return transaction;
  }
}
