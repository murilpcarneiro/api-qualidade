import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../../../shared/constants/http-status";
import type { ProcessTransactionUseCase } from "../../../../application/use-cases/ProcessTransactionUseCase";
import type { CancelTransactionUseCase } from "../../../../application/use-cases/CancelTransactionUseCase";
import type { SimulateChargebackUseCase } from "../../../../application/use-cases/SimulateChargebackUseCase";

export class TransactionController {
  constructor(
    private readonly processTransactionUseCase: ProcessTransactionUseCase,
    private readonly cancelTransactionUseCase: CancelTransactionUseCase,
    private readonly simulateChargebackUseCase: SimulateChargebackUseCase
  ) {}

  public async process(request: Request, response: Response): Promise<void> {
    const transaction = await this.processTransactionUseCase.execute({
      userId: String(request.body.userId ?? ""),
      cardId: String(request.body.cardId ?? ""),
      amountCents: Number(request.body.amountCents),
      description: String(request.body.description ?? "")
    });

    response.status(HTTP_STATUS.CREATED).json(transaction.toJSON());
  }

  public async cancel(request: Request, response: Response): Promise<void> {
    const transaction = await this.cancelTransactionUseCase.execute({
      transactionId: String(request.params.transactionId)
    });

    response.status(HTTP_STATUS.OK).json(transaction.toJSON());
  }

  public async chargeback(request: Request, response: Response): Promise<void> {
    const transaction = await this.simulateChargebackUseCase.execute({
      transactionId: String(request.params.transactionId)
    });

    response.status(HTTP_STATUS.OK).json(transaction.toJSON());
  }
}
