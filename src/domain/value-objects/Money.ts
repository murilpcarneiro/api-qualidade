import { ValidationError } from "../../shared/errors/ValidationError";

export class Money {
  private readonly valueInCents: number;

  private constructor(valueInCents: number) {
    this.valueInCents = valueInCents;
  }

  public static fromCents(valueInCents: number): Money {
    if (!Number.isInteger(valueInCents) || valueInCents < 0) {
      throw new ValidationError("Amount must be a non-negative integer in cents");
    }

    return new Money(valueInCents);
  }

  public toCents(): number {
    return this.valueInCents;
  }

  public add(other: Money): Money {
    return new Money(this.valueInCents + other.valueInCents);
  }

  public subtract(other: Money): Money {
    if (other.valueInCents > this.valueInCents) {
      throw new ValidationError("Insufficient amount for subtraction");
    }

    return new Money(this.valueInCents - other.valueInCents);
  }
}
