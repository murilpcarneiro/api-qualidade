import { TransactionStatus } from "../../shared/constants/transaction-status";
import { BusinessRuleError } from "../../shared/errors/BusinessRuleError";
import { ValidationError } from "../../shared/errors/ValidationError";

export interface TransactionProps {
  id: string;
  cardId: string;
  userId: string;
  amountCents: number;
  description: string;
  status: TransactionStatus;
  referenceMonth: string;
  createdAt: Date;
  cancelledAt?: Date;
  chargebackAt?: Date;
}

export class Transaction {
  private constructor(private readonly props: TransactionProps) {}

  public static create(props: TransactionProps): Transaction {
    if (!props.id.trim()) {
      throw new ValidationError("Transaction id is required");
    }

    if (!props.cardId.trim() || !props.userId.trim()) {
      throw new ValidationError("Transaction cardId and userId are required");
    }

    if (!Number.isInteger(props.amountCents) || props.amountCents <= 0) {
      throw new ValidationError("Transaction amount must be a positive integer in cents");
    }

    if (!props.description.trim()) {
      throw new ValidationError("Transaction description is required");
    }

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(props.referenceMonth)) {
      throw new ValidationError("Reference month must be in YYYY-MM format");
    }

    return new Transaction(props);
  }

  public cancel(cancelledAt: Date): void {
    if (this.props.status !== TransactionStatus.APPROVED) {
      throw new BusinessRuleError("Only approved transactions can be cancelled");
    }

    this.props.status = TransactionStatus.CANCELLED;
    this.props.cancelledAt = cancelledAt;
  }

  public chargeback(chargebackAt: Date): void {
    if (this.props.status !== TransactionStatus.APPROVED) {
      throw new BusinessRuleError("Only approved transactions can receive chargeback");
    }

    this.props.status = TransactionStatus.CHARGEBACK;
    this.props.chargebackAt = chargebackAt;
  }

  public toJSON(): TransactionProps {
    return { ...this.props };
  }

  public get id(): string {
    return this.props.id;
  }

  public get cardId(): string {
    return this.props.cardId;
  }

  public get userId(): string {
    return this.props.userId;
  }

  public get referenceMonth(): string {
    return this.props.referenceMonth;
  }

  public get amountCents(): number {
    return this.props.amountCents;
  }

  public get status(): TransactionStatus {
    return this.props.status;
  }
}
