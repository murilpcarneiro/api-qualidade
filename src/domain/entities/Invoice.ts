import { ValidationError } from "../../shared/errors/ValidationError";

export interface InvoiceProps {
  id: string;
  cardId: string;
  userId: string;
  referenceMonth: string;
  totalCents: number;
  transactionIds: string[];
  generatedAt: Date;
}

export class Invoice {
  private constructor(private readonly props: InvoiceProps) {}

  public static create(props: InvoiceProps): Invoice {
    if (!props.id.trim()) {
      throw new ValidationError("Invoice id is required");
    }

    if (!props.cardId.trim() || !props.userId.trim()) {
      throw new ValidationError("Invoice cardId and userId are required");
    }

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(props.referenceMonth)) {
      throw new ValidationError("Reference month must be in YYYY-MM format");
    }

    if (!Number.isInteger(props.totalCents) || props.totalCents < 0) {
      throw new ValidationError("Invoice total must be a non-negative integer in cents");
    }

    return new Invoice(props);
  }

  public toJSON(): InvoiceProps {
    return { ...this.props };
  }

  public get cardId(): string {
    return this.props.cardId;
  }

  public get referenceMonth(): string {
    return this.props.referenceMonth;
  }
}
