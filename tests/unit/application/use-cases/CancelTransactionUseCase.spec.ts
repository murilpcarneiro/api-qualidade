import { describe, expect, it, vi } from "vitest";
import { CancelTransactionUseCase } from "../../../../src/application/use-cases/CancelTransactionUseCase";
import type { TransactionRepository } from "../../../../src/application/ports/TransactionRepository";
import type { CardRepository } from "../../../../src/application/ports/CardRepository";
import { Transaction } from "../../../../src/domain/entities/Transaction";
import { TransactionStatus } from "../../../../src/shared/constants/transaction-status";
import { Card } from "../../../../src/domain/entities/Card";
import { CardStatus } from "../../../../src/shared/constants/card-status";
import { NotFoundError } from "../../../../src/shared/errors/NotFoundError";

function buildSut() {
  const transaction = Transaction.create({
    id: "tx-1",
    cardId: "card-1",
    userId: "user-1",
    amountCents: 500,
    description: "Market",
    status: TransactionStatus.APPROVED,
    referenceMonth: "2026-03",
    createdAt: new Date()
  });

  const card = Card.create({
    id: "card-1",
    userId: "user-1",
    last4: "1234",
    limitCents: 1000,
    availableLimitCents: 500,
    status: CardStatus.ACTIVE,
    createdAt: new Date()
  });

  const transactionRepository: TransactionRepository = {
    findById: vi.fn().mockResolvedValue(transaction),
    findByCardAndMonth: vi.fn(),
    save: vi.fn()
  };

  const cardRepository: CardRepository = {
    findById: vi.fn().mockResolvedValue(card),
    findByUserId: vi.fn(),
    save: vi.fn()
  };

  const useCase = new CancelTransactionUseCase(transactionRepository, cardRepository);

  return { useCase, transactionRepository, cardRepository };
}

describe("CancelTransactionUseCase", () => {
  it("should cancel transaction and release card limit", async () => {
    const { useCase, cardRepository, transactionRepository } = buildSut();

    const transaction = await useCase.execute({ transactionId: "tx-1" });

    expect(transaction.status).toBe(TransactionStatus.CANCELLED);
    expect(transactionRepository.save).toHaveBeenCalledOnce();
    expect(cardRepository.save).toHaveBeenCalledOnce();
  });

  it("should throw when transaction does not exist", async () => {
    const { useCase, transactionRepository } = buildSut();
    vi.mocked(transactionRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute({ transactionId: "missing" })).rejects.toThrow(NotFoundError);
  });
});
