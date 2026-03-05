import type { Request, Response } from "express";
import { HTTP_STATUS } from "../../../../shared/constants/http-status";
import type { CreateCardUseCase } from "../../../../application/use-cases/CreateCardUseCase";

export class CardController {
  constructor(private readonly createCardUseCase: CreateCardUseCase) {}

  public async create(request: Request, response: Response): Promise<void> {
    const card = await this.createCardUseCase.execute({
      userId: String(request.body.userId ?? ""),
      cardNumber: String(request.body.cardNumber ?? ""),
      limitCents: Number(request.body.limitCents)
    });

    response.status(HTTP_STATUS.CREATED).json(card.toJSON());
  }
}
