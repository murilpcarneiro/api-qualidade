import { describe, expect, it, vi } from "vitest";
import { SimulateChargebackUseCase } from "../../../../src/application/use-cases/SimulateChargebackUseCase";
import type { TransactionRepository } from "../../../../src/application/ports/TransactionRepository";
import type { CardRepository } from "../../../../src/application/ports/CardRepository";
import { Transaction } from "../../../../src/domain/entities/Transaction";
import { TransactionStatus } from "../../../../src/shared/constants/transaction-status";
import { Card } from "../../../../src/domain/entities/Card";
import { CardStatus } from "../../../../src/shared/constants/card-status";

describe("SimulateChargebackUseCase", () => {
  it("should mark transaction as chargeback and release card limit", async () => {
    const transaction = Transaction.create({
      id: "tx-1",
      cardId: "card-1",
      userId: "user-1",
      amountCents: 300,
      description: "Store",
      status: TransactionStatus.APPROVED,
      referenceMonth: "2026-03",
      createdAt: new Date()
    });

    const card = Card.create({
      id: "card-1",
      userId: "user-1",
      last4: "1234",
      limitCents: 1000,
      availableLimitCents: 700,
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

    const useCase = new SimulateChargebackUseCase(transactionRepository, cardRepository);
    const result = await useCase.execute({ transactionId: "tx-1" });

    expect(result.status).toBe(TransactionStatus.CHARGEBACK);
    expect(cardRepository.save).toHaveBeenCalledOnce();
    expect(transactionRepository.save).toHaveBeenCalledOnce();
  });
});
