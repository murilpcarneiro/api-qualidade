export interface CreateUserInputDto {
  name: string;
  email: string;
  password: string;
}

export interface CreateCardInputDto {
  userId: string;
  cardNumber: string;
  limitCents: number;
}

export interface ProcessTransactionInputDto {
  userId: string;
  cardId: string;
  amountCents: number;
  description: string;
}

export interface TransactionByIdInputDto {
  transactionId: string;
}

export interface GenerateInvoiceInputDto {
  cardId: string;
  referenceMonth: string;
}
