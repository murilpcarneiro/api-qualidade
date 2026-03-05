import { promises as fs } from "node:fs";
import path from "node:path";

export interface DatabaseSchema {
  users: unknown[];
  cards: unknown[];
  transactions: unknown[];
  invoices: unknown[];
}

const DEFAULT_DB: DatabaseSchema = {
  users: [],
  cards: [],
  transactions: [],
  invoices: []
};

export class JsonDatabase {
  private readonly filePath: string;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor(filePath?: string) {
    this.filePath = filePath ?? path.resolve(process.cwd(), "src/infrastructure/database/db.json");
  }

  public async read(): Promise<DatabaseSchema> {
    await this.ensureDatabaseFile();
    const content = await fs.readFile(this.filePath, "utf-8");
    return JSON.parse(content) as DatabaseSchema;
  }

  public async write(data: DatabaseSchema): Promise<void> {
    await this.ensureDatabaseFile();

    this.writeQueue = this.writeQueue.then(async () => {
      await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), "utf-8");
    });

    await this.writeQueue;
  }

  private async ensureDatabaseFile(): Promise<void> {
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify(DEFAULT_DB, null, 2), "utf-8");
    }
  }
}
