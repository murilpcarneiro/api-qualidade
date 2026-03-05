export interface PasswordHasher {
  hash(plainValue: string): Promise<string>;
}
