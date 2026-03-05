import { describe, expect, it, vi } from "vitest";
import { ProcessTransactionUseCase } from "../../../../src/application/use-cases/ProcessTransactionUseCase";
import type { CardRepository } from "../../../../src/application/ports/CardRepository";
import type { TransactionRepository } from "../../../../src/application/ports/TransactionRepository";
import type { IdGenerator } from "../../../../src/application/ports/IdGenerator";
import { Card } from "../../../../src/domain/entities/Card";
import { CardStatus } from "../../../../src/shared/constants/card-status";
import { TransactionStatus } from "../../../../src/shared/constants/transaction-status";
import { ValidationError } from "../../../../src/shared/errors/ValidationError";

function createCard(availableLimitCents: number): Card {
  return Card.create({
    id: "card-1",
    userId: "user-1",
    last4: "1234",
    limitCents: 1000,
    availableLimitCents,
    status: CardStatus.ACTIVE,
    createdAt: new Date()
  });
}

function buildSut(card: Card) {
  const cardRepository: CardRepository = {
    findById: vi.fn().mockResolvedValue(card),
    findByUserId: vi.fn(),
    save: vi.fn()
  };

  const transactionRepository: TransactionRepository = {
    findById: vi.fn(),
    findByCardAndMonth: vi.fn(),
    save: vi.fn()
  };

  const idGenerator: IdGenerator = {
    generate: vi.fn().mockReturnValue("tx-1")
  };

  const useCase = new ProcessTransactionUseCase(cardRepository, transactionRepository, idGenerator);

  return { useCase, cardRepository, transactionRepository };
}

describe("ProcessTransactionUseCase", () => {
  it("should approve transaction when there is enough limit", async () => {
    const { useCase, cardRepository, transactionRepository } = buildSut(createCard(1000));

    const transaction = await useCase.execute({
      userId: "user-1",
      cardId: "card-1",
      amountCents: 500,
      description: "Market"
    });

    expect(transaction.status).toBe(TransactionStatus.APPROVED);
    expect(cardRepository.save).toHaveBeenCalledOnce();
    expect(transactionRepository.save).toHaveBeenCalledOnce();
  });

  it("should decline transaction when there is no limit", async () => {
    const { useCase } = buildSut(createCard(100));

    const transaction = await useCase.execute({
      userId: "user-1",
      cardId: "card-1",
      amountCents: 500,
      description: "Market"
    });

    expect(transaction.status).toBe(TransactionStatus.DECLINED);
  });

  it("should fail when card does not belong to user", async () => {
    const { useCase } = buildSut(createCard(1000));

    await expect(
      useCase.execute({
        userId: "user-2",
        cardId: "card-1",
        amountCents: 100,
        description: "Market"
      })
    ).rejects.toThrow(ValidationError);
  });

  it("should validate amount before processing", async () => {
    const { useCase } = buildSut(createCard(1000));

    await expect(
      useCase.execute({
        userId: "user-1",
        cardId: "card-1",
        amountCents: 0,
        description: "Market"
      })
    ).rejects.toThrow(ValidationError);
  });
});
