import type { ProcessTransactionInputDto } from "../dto/requests";
import type { CardRepository } from "../ports/CardRepository";
import type { TransactionRepository } from "../ports/TransactionRepository";
import type { IdGenerator } from "../ports/IdGenerator";
import { NotFoundError } from "../../shared/errors/NotFoundError";
import { ValidationError } from "../../shared/errors/ValidationError";
import { Transaction } from "../../domain/entities/Transaction";
import { TransactionStatus } from "../../shared/constants/transaction-status";
import { MAX_TRANSACTION_DESCRIPTION_LENGTH } from "../../shared/constants/business-rules";

export class ProcessTransactionUseCase {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  public async execute(input: ProcessTransactionInputDto): Promise<Transaction> {
    if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) {
      throw new ValidationError("amountCents must be a positive integer");
    }

    if (!input.description.trim() || input.description.length > MAX_TRANSACTION_DESCRIPTION_LENGTH) {
      throw new ValidationError(`description must have 1 to ${MAX_TRANSACTION_DESCRIPTION_LENGTH} characters`);
    }

    const card = await this.cardRepository.findById(input.cardId);
    if (!card) {
      throw new NotFoundError("Card not found");
    }

    if (card.userId !== input.userId) {
      throw new ValidationError("Card does not belong to this user");
    }

    const reserved = card.reserve(input.amountCents);
    const status = reserved ? TransactionStatus.APPROVED : TransactionStatus.DECLINED;

    const transaction = Transaction.create({
      id: this.idGenerator.generate(),
      cardId: input.cardId,
      userId: input.userId,
      amountCents: input.amountCents,
      description: input.description.trim(),
      status,
      referenceMonth: ProcessTransactionUseCase.resolveReferenceMonth(new Date()),
      createdAt: new Date()
    });

    await this.cardRepository.save(card);
    await this.transactionRepository.save(transaction);

    return transaction;
  }

  private static resolveReferenceMonth(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }
}
