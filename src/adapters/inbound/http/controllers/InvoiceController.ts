import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../../../shared/constants/http-status";
import type { GenerateInvoiceUseCase } from "../../../../application/use-cases/GenerateInvoiceUseCase";

export class InvoiceController {
  constructor(private readonly generateInvoiceUseCase: GenerateInvoiceUseCase) {}

  public async generate(request: Request, response: Response): Promise<void> {
    const invoice = await this.generateInvoiceUseCase.execute({
      cardId: String(request.params.cardId),
      referenceMonth: String(request.query.referenceMonth ?? "")
    });

    response.status(HTTP_STATUS.OK).json(invoice.toJSON());
  }
}
