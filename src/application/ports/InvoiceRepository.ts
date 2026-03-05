import type { Invoice } from "../../domain/entities/Invoice";

export interface InvoiceRepository {
  findByCardAndMonth(cardId: string, referenceMonth: string): Promise<Invoice | null>;
  save(invoice: Invoice): Promise<void>;
}
