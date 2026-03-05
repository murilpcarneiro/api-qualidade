import { CardStatus } from "../../shared/constants/card-status";
import { BusinessRuleError } from "../../shared/errors/BusinessRuleError";
import { ValidationError } from "../../shared/errors/ValidationError";

export interface CardProps {
  id: string;
  userId: string;
  last4: string;
  limitCents: number;
  availableLimitCents: number;
  status: CardStatus;
  createdAt: Date;
}

export class Card {
  private constructor(private readonly props: CardProps) {}

  public static create(props: CardProps): Card {
    if (!props.id.trim()) {
      throw new ValidationError("Card id is required");
    }

    if (!props.userId.trim()) {
      throw new ValidationError("Card userId is required");
    }

    if (!/^\d{4}$/.test(props.last4)) {
      throw new ValidationError("Card last4 must have exactly 4 digits");
    }

    if (!Number.isInteger(props.limitCents) || props.limitCents <= 0) {
      throw new ValidationError("Card limit must be a positive integer in cents");
    }

    if (!Number.isInteger(props.availableLimitCents) || props.availableLimitCents < 0) {
      throw new ValidationError("Card available limit must be a non-negative integer in cents");
    }

    if (props.availableLimitCents > props.limitCents) {
      throw new ValidationError("Card available limit cannot exceed card limit");
    }

    return new Card(props);
  }

  public reserve(amountCents: number): boolean {
    if (this.props.status !== CardStatus.ACTIVE) {
      throw new BusinessRuleError("Card is not active");
    }

    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      throw new ValidationError("Transaction amount must be a positive integer in cents");
    }

    if (amountCents > this.props.availableLimitCents) {
      return false;
    }

    this.props.availableLimitCents -= amountCents;
    return true;
  }

  public release(amountCents: number): void {
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      throw new ValidationError("Release amount must be a positive integer in cents");
    }

    this.props.availableLimitCents = Math.min(this.props.limitCents, this.props.availableLimitCents + amountCents);
  }

  public toJSON(): CardProps {
    return { ...this.props };
  }

  public get id(): string {
    return this.props.id;
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get availableLimitCents(): number {
    return this.props.availableLimitCents;
  }
}
