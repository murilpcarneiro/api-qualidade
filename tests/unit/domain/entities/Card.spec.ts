import { describe, expect, it } from "vitest";
import { Card } from "../../../../src/domain/entities/Card";
import { CardStatus } from "../../../../src/shared/constants/card-status";
import { BusinessRuleError } from "../../../../src/shared/errors/BusinessRuleError";
import { ValidationError } from "../../../../src/shared/errors/ValidationError";

describe("Card entity", () => {
  it("should reserve available limit when amount fits", () => {
    const card = Card.create({
      id: "card-1",
      userId: "user-1",
      last4: "1234",
      limitCents: 1000,
      availableLimitCents: 1000,
      status: CardStatus.ACTIVE,
      createdAt: new Date()
    });

    const approved = card.reserve(300);

    expect(approved).toBe(true);
    expect(card.availableLimitCents).toBe(700);
  });

  it("should return false when amount exceeds available limit", () => {
    const card = Card.create({
      id: "card-1",
      userId: "user-1",
      last4: "1234",
      limitCents: 1000,
      availableLimitCents: 200,
      status: CardStatus.ACTIVE,
      createdAt: new Date()
    });

    const approved = card.reserve(300);

    expect(approved).toBe(false);
    expect(card.availableLimitCents).toBe(200);
  });

  it("should throw when card is blocked", () => {
    const card = Card.create({
      id: "card-1",
      userId: "user-1",
      last4: "1234",
      limitCents: 1000,
      availableLimitCents: 1000,
      status: CardStatus.BLOCKED,
      createdAt: new Date()
    });

    expect(() => card.reserve(100)).toThrow(BusinessRuleError);
  });

  it("should throw for invalid last4", () => {
    expect(() =>
      Card.create({
        id: "card-1",
        userId: "user-1",
        last4: "12",
        limitCents: 1000,
        availableLimitCents: 1000,
        status: CardStatus.ACTIVE,
        createdAt: new Date()
      })
    ).toThrow(ValidationError);
  });

  it("should throw when release amount is invalid", () => {
    const card = Card.create({
      id: "card-1",
      userId: "user-1",
      last4: "1234",
      limitCents: 1000,
      availableLimitCents: 800,
      status: CardStatus.ACTIVE,
      createdAt: new Date()
    });

    expect(() => card.release(0)).toThrow(ValidationError);
  });
});
