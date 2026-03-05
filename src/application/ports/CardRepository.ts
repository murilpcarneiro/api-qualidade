import type { Card } from "../../domain/entities/Card";

export interface CardRepository {
  findById(id: string): Promise<Card | null>;
  findByUserId(userId: string): Promise<Card[]>;
  save(card: Card): Promise<void>;
}
