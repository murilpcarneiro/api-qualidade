import { describe, expect, it, vi } from "vitest";
import { GenerateInvoiceUseCase } from "../../../../src/application/use-cases/GenerateInvoiceUseCase";
import type { CardRepository } from "../../../../src/application/ports/CardRepository";
import type { TransactionRepository } from "../../../../src/application/ports/TransactionRepository";
import type { InvoiceRepository } from "../../../../src/application/ports/InvoiceRepository";
import type { IdGenerator } from "../../../../src/application/ports/IdGenerator";
import { Card } from "../../../../src/domain/entities/Card";
import { CardStatus } from "../../../../src/shared/constants/card-status";
import { Transaction } from "../../../../src/domain/entities/Transaction";
import { TransactionStatus } from "../../../../src/shared/constants/transaction-status";
import { Invoice } from "../../../../src/domain/entities/Invoice";

function buildSut(existingInvoice: Invoice | null = null) {
  const card = Card.create({
    id: "card-1",
    userId: "user-1",
    last4: "1234",
    limitCents: 1000,
    availableLimitCents: 300,
    status: CardStatus.ACTIVE,
    createdAt: new Date()
  });

  const approved = Transaction.create({
    id: "tx-1",
    cardId: "card-1",
    userId: "user-1",
    amountCents: 500,
    description: "Market",
    status: TransactionStatus.APPROVED,
    referenceMonth: "2026-03",
    createdAt: new Date()
  });

  const declined = Transaction.create({
    id: "tx-2",
    cardId: "card-1",
    userId: "user-1",
    amountCents: 200,
    description: "Store",
    status: TransactionStatus.DECLINED,
    referenceMonth: "2026-03",
    createdAt: new Date()
  });

  const cardRepository: CardRepository = {
    findById: vi.fn().mockResolvedValue(card),
    findByUserId: vi.fn(),
    save: vi.fn()
  };

  const transactionRepository: TransactionRepository = {
    findById: vi.fn(),
    findByCardAndMonth: vi.fn().mockResolvedValue([approved, declined]),
    save: vi.fn()
  };

  const invoiceRepository: InvoiceRepository = {
    findByCardAndMonth: vi.fn().mockResolvedValue(existingInvoice),
    save: vi.fn()
  };

  const idGenerator: IdGenerator = {
    generate: vi.fn().mockReturnValue("inv-1")
  };

  const useCase = new GenerateInvoiceUseCase(cardRepository, transactionRepository, invoiceRepository, idGenerator);

  return { useCase, invoiceRepository };
}

describe("GenerateInvoiceUseCase", () => {
  it("should generate invoice using only approved transactions", async () => {
    const { useCase, invoiceRepository } = buildSut();

    const invoice = await useCase.execute({
      cardId: "card-1",
      referenceMonth: "2026-03"
    });

    expect(invoice.toJSON().totalCents).toBe(500);
    expect(invoiceRepository.save).toHaveBeenCalledOnce();
  });

  it("should return existing invoice when already generated", async () => {
    const existing = Invoice.create({
      id: "inv-existing",
      cardId: "card-1",
      userId: "user-1",
      referenceMonth: "2026-03",
      totalCents: 500,
      transactionIds: ["tx-1"],
      generatedAt: new Date()
    });

    const { useCase, invoiceRepository } = buildSut(existing);

    const result = await useCase.execute({
      cardId: "card-1",
      referenceMonth: "2026-03"
    });

    expect(result.toJSON().id).toBe("inv-existing");
    expect(invoiceRepository.save).not.toHaveBeenCalled();
  });
});
