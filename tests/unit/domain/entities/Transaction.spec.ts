import { describe, expect, it } from "vitest";
import { Transaction } from "../../../../src/domain/entities/Transaction";
import { TransactionStatus } from "../../../../src/shared/constants/transaction-status";
import { BusinessRuleError } from "../../../../src/shared/errors/BusinessRuleError";
import { ValidationError } from "../../../../src/shared/errors/ValidationError";

describe("Transaction entity", () => {
  it("should cancel approved transaction", () => {
    const transaction = Transaction.create({
      id: "tx-1",
      cardId: "card-1",
      userId: "user-1",
      amountCents: 500,
      description: "Purchase",
      status: TransactionStatus.APPROVED,
      referenceMonth: "2026-03",
      createdAt: new Date()
    });

    transaction.cancel(new Date());

    expect(transaction.status).toBe(TransactionStatus.CANCELLED);
  });

  it("should reject cancel for non-approved transaction", () => {
    const transaction = Transaction.create({
      id: "tx-1",
      cardId: "card-1",
      userId: "user-1",
      amountCents: 500,
      description: "Purchase",
      status: TransactionStatus.DECLINED,
      referenceMonth: "2026-03",
      createdAt: new Date()
    });

    expect(() => transaction.cancel(new Date())).toThrow(BusinessRuleError);
  });

  it("should mark approved transaction as chargeback", () => {
    const transaction = Transaction.create({
      id: "tx-1",
      cardId: "card-1",
      userId: "user-1",
      amountCents: 500,
      description: "Purchase",
      status: TransactionStatus.APPROVED,
      referenceMonth: "2026-03",
      createdAt: new Date()
    });

    transaction.chargeback(new Date());

    expect(transaction.status).toBe(TransactionStatus.CHARGEBACK);
  });

  it("should validate reference month format", () => {
    expect(() =>
      Transaction.create({
        id: "tx-1",
        cardId: "card-1",
        userId: "user-1",
        amountCents: 500,
        description: "Purchase",
        status: TransactionStatus.APPROVED,
        referenceMonth: "2026/03",
        createdAt: new Date()
      })
    ).toThrow(ValidationError);
  });
});
