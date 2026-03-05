import { describe, expect, it } from "vitest";
import { Invoice } from "../../../../src/domain/entities/Invoice";
import { ValidationError } from "../../../../src/shared/errors/ValidationError";

describe("Invoice entity", () => {
  it("should create invoice with valid data", () => {
    const invoice = Invoice.create({
      id: "inv-1",
      cardId: "card-1",
      userId: "user-1",
      referenceMonth: "2026-03",
      totalCents: 1000,
      transactionIds: ["tx-1"],
      generatedAt: new Date()
    });

    expect(invoice.toJSON().id).toBe("inv-1");
  });

  it("should throw for invalid month format", () => {
    expect(() =>
      Invoice.create({
        id: "inv-1",
        cardId: "card-1",
        userId: "user-1",
        referenceMonth: "2026/03",
        totalCents: 1000,
        transactionIds: ["tx-1"],
        generatedAt: new Date()
      })
    ).toThrow(ValidationError);
  });
});
