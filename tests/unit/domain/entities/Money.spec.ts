import { describe, expect, it } from "vitest";
import { Money } from "../../../../src/domain/value-objects/Money";
import { ValidationError } from "../../../../src/shared/errors/ValidationError";

describe("Money value object", () => {
  it("should sum and subtract values", () => {
    const amount = Money.fromCents(1000);
    const sum = amount.add(Money.fromCents(500));
    const result = sum.subtract(Money.fromCents(300));

    expect(result.toCents()).toBe(1200);
  });

  it("should throw for negative values", () => {
    expect(() => Money.fromCents(-1)).toThrow(ValidationError);
  });
});
