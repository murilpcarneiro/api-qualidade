import type { CardRepository } from "../../../application/ports/CardRepository";
import { Card } from "../../../domain/entities/Card";
import type { JsonDatabase } from "../../../infrastructure/database/JsonDatabase";
import type { CardStatus } from "../../../shared/constants/card-status";

interface CardRecord {
  id: string;
  userId: string;
  last4: string;
  limitCents: number;
  availableLimitCents: number;
  status: CardStatus;
  createdAt: string;
}

export class JsonCardRepository implements CardRepository {
  constructor(private readonly database: JsonDatabase) {}

  public async findById(id: string): Promise<Card | null> {
    const db = await this.database.read();
    const record = (db.cards as CardRecord[]).find((card) => card.id === id);
    return record ? this.toEntity(record) : null;
  }

  public async findByUserId(userId: string): Promise<Card[]> {
    const db = await this.database.read();
    return (db.cards as CardRecord[])
      .filter((card) => card.userId === userId)
      .map((record) => this.toEntity(record));
  }

  public async save(card: Card): Promise<void> {
    const db = await this.database.read();
    const record = this.toRecord(card);
    const cards = db.cards as CardRecord[];
    const index = cards.findIndex((currentCard) => currentCard.id === record.id);

    if (index >= 0) {
      cards[index] = record;
    } else {
      cards.push(record);
    }

    await this.database.write(db);
  }

  private toEntity(record: CardRecord): Card {
    return Card.create({
      id: record.id,
      userId: record.userId,
      last4: record.last4,
      limitCents: record.limitCents,
      availableLimitCents: record.availableLimitCents,
      status: record.status,
      createdAt: new Date(record.createdAt)
    });
  }

  private toRecord(card: Card): CardRecord {
    const data = card.toJSON();
    return {
      id: data.id,
      userId: data.userId,
      last4: data.last4,
      limitCents: data.limitCents,
      availableLimitCents: data.availableLimitCents,
      status: data.status,
      createdAt: data.createdAt.toISOString()
    };
  }
}
