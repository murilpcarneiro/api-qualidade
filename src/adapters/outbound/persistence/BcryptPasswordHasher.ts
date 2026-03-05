import bcrypt from "bcrypt";
import type { PasswordHasher } from "../../../application/ports/PasswordHasher";

const DEFAULT_SALT_ROUNDS = 10;

export class BcryptPasswordHasher implements PasswordHasher {
  constructor(private readonly saltRounds: number = DEFAULT_SALT_ROUNDS) {}

  public async hash(plainValue: string): Promise<string> {
    return bcrypt.hash(plainValue, this.saltRounds);
  }
}
