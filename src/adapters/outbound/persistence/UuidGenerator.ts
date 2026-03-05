import { randomUUID } from "node:crypto";
import type { IdGenerator } from "../../../application/ports/IdGenerator";

export class UuidGenerator implements IdGenerator {
  public generate(): string {
    return randomUUID();
  }
}
