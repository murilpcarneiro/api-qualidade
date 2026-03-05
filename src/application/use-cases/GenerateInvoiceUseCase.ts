import type { GenerateInvoiceInputDto } from "../dto/requests";
import type { CardRepository } from "../ports/CardRepository";
import type { TransactionRepository } from "../ports/TransactionRepository";
import type { InvoiceRepository } from "../ports/InvoiceRepository";
import type { IdGenerator } from "../ports/IdGenerator";
import { NotFoundError } from "../../shared/errors/NotFoundError";
import { Invoice } from "../../domain/entities/Invoice";
import { TransactionStatus } from "../../shared/constants/transaction-status";

export class GenerateInvoiceUseCase {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  public async execute(input: GenerateInvoiceInputDto): Promise<Invoice> {
    const card = await this.cardRepository.findById(input.cardId);
    if (!card) {
      throw new NotFoundError("Card not found");
    }

    const existingInvoice = await this.invoiceRepository.findByCardAndMonth(input.cardId, input.referenceMonth);
    if (existingInvoice) {
      return existingInvoice;
    }

    const transactions = await this.transactionRepository.findByCardAndMonth(input.cardId, input.referenceMonth);
    const approvedTransactions = transactions.filter((transaction) => transaction.status === TransactionStatus.APPROVED);

    const totalCents = approvedTransactions.reduce((sum, transaction) => sum + transaction.amountCents, 0);

    const invoice = Invoice.create({
      id: this.idGenerator.generate(),
      cardId: input.cardId,
      userId: card.userId,
      referenceMonth: input.referenceMonth,
      totalCents,
      transactionIds: approvedTransactions.map((transaction) => transaction.id),
      generatedAt: new Date()
    });

    await this.invoiceRepository.save(invoice);
    return invoice;
  }
}
