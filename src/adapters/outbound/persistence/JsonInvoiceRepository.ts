import type { InvoiceRepository } from "../../../application/ports/InvoiceRepository";
import { Invoice } from "../../../domain/entities/Invoice";
import type { JsonDatabase } from "../../../infrastructure/database/JsonDatabase";

interface InvoiceRecord {
  id: string;
  cardId: string;
  userId: string;
  referenceMonth: string;
  totalCents: number;
  transactionIds: string[];
  generatedAt: string;
}

export class JsonInvoiceRepository implements InvoiceRepository {
  constructor(private readonly database: JsonDatabase) {}

  public async findByCardAndMonth(cardId: string, referenceMonth: string): Promise<Invoice | null> {
    const db = await this.database.read();
    const record = (db.invoices as InvoiceRecord[]).find(
      (invoice) => invoice.cardId === cardId && invoice.referenceMonth === referenceMonth
    );

    return record ? this.toEntity(record) : null;
  }

  public async save(invoice: Invoice): Promise<void> {
    const db = await this.database.read();
    const record = this.toRecord(invoice);
    const invoices = db.invoices as InvoiceRecord[];
    const index = invoices.findIndex((currentInvoice) => currentInvoice.id === record.id);

    if (index >= 0) {
      invoices[index] = record;
    } else {
      invoices.push(record);
    }

    await this.database.write(db);
  }

  private toEntity(record: InvoiceRecord): Invoice {
    return Invoice.create({
      id: record.id,
      cardId: record.cardId,
      userId: record.userId,
      referenceMonth: record.referenceMonth,
      totalCents: record.totalCents,
      transactionIds: record.transactionIds,
      generatedAt: new Date(record.generatedAt)
    });
  }

  private toRecord(invoice: Invoice): InvoiceRecord {
    const data = invoice.toJSON();
    return {
      id: data.id,
      cardId: data.cardId,
      userId: data.userId,
      referenceMonth: data.referenceMonth,
      totalCents: data.totalCents,
      transactionIds: data.transactionIds,
      generatedAt: data.generatedAt.toISOString()
    };
  }
}
