import type { UserRepository } from "../../../application/ports/UserRepository";
import { User } from "../../../domain/entities/User";
import type { JsonDatabase } from "../../../infrastructure/database/JsonDatabase";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export class JsonUserRepository implements UserRepository {
  constructor(private readonly database: JsonDatabase) {}

  public async findById(id: string): Promise<User | null> {
    const db = await this.database.read();
    const record = (db.users as UserRecord[]).find((user) => user.id === id);
    return record ? this.toEntity(record) : null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    const db = await this.database.read();
    const record = (db.users as UserRecord[]).find((user) => user.email === normalized);
    return record ? this.toEntity(record) : null;
  }

  public async save(user: User): Promise<void> {
    const db = await this.database.read();
    const record = this.toRecord(user);
    const users = db.users as UserRecord[];
    const index = users.findIndex((currentUser) => currentUser.id === record.id);

    if (index >= 0) {
      users[index] = record;
    } else {
      users.push(record);
    }

    await this.database.write(db);
  }

  private toEntity(record: UserRecord): User {
    return User.create({
      id: record.id,
      name: record.name,
      email: record.email,
      passwordHash: record.passwordHash,
      createdAt: new Date(record.createdAt)
    });
  }

  private toRecord(user: User): UserRecord {
    const data = user.toJSON();
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      createdAt: data.createdAt.toISOString()
    };
  }
}
