import type { CreateCardInputDto } from "../dto/requests";
import type { CardRepository } from "../ports/CardRepository";
import type { UserRepository } from "../ports/UserRepository";
import type { IdGenerator } from "../ports/IdGenerator";
import { NotFoundError } from "../../shared/errors/NotFoundError";
import { ValidationError } from "../../shared/errors/ValidationError";
import { Card } from "../../domain/entities/Card";
import { CardStatus } from "../../shared/constants/card-status";
import { MIN_LIMIT_CENTS } from "../../shared/constants/business-rules";

export class CreateCardUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cardRepository: CardRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  public async execute(input: CreateCardInputDto): Promise<Card> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!/^\d{16}$/.test(input.cardNumber)) {
      throw new ValidationError("Card number must have exactly 16 digits");
    }

    if (!Number.isInteger(input.limitCents) || input.limitCents < MIN_LIMIT_CENTS) {
      throw new ValidationError(`Card limit must be at least ${MIN_LIMIT_CENTS} cents`);
    }

    const card = Card.create({
      id: this.idGenerator.generate(),
      userId: input.userId,
      last4: input.cardNumber.slice(-4),
      limitCents: input.limitCents,
      availableLimitCents: input.limitCents,
      status: CardStatus.ACTIVE,
      createdAt: new Date()
    });

    await this.cardRepository.save(card);
    return card;
  }
}
