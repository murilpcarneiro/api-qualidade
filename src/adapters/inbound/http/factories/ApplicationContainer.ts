import { CreateCardUseCase } from "../../../../application/use-cases/CreateCardUseCase";
import { CreateUserUseCase } from "../../../../application/use-cases/CreateUserUseCase";
import { ProcessTransactionUseCase } from "../../../../application/use-cases/ProcessTransactionUseCase";
import { CancelTransactionUseCase } from "../../../../application/use-cases/CancelTransactionUseCase";
import { SimulateChargebackUseCase } from "../../../../application/use-cases/SimulateChargebackUseCase";
import { GenerateInvoiceUseCase } from "../../../../application/use-cases/GenerateInvoiceUseCase";
import { JsonDatabase } from "../../../../infrastructure/database/JsonDatabase";
import { JsonUserRepository } from "../../../outbound/persistence/JsonUserRepository";
import { JsonCardRepository } from "../../../outbound/persistence/JsonCardRepository";
import { JsonTransactionRepository } from "../../../outbound/persistence/JsonTransactionRepository";
import { JsonInvoiceRepository } from "../../../outbound/persistence/JsonInvoiceRepository";
import { BcryptPasswordHasher } from "../../../outbound/persistence/BcryptPasswordHasher";
import { UuidGenerator } from "../../../outbound/persistence/UuidGenerator";

export class ApplicationContainer {
  public readonly createUserUseCase: CreateUserUseCase;
  public readonly createCardUseCase: CreateCardUseCase;
  public readonly processTransactionUseCase: ProcessTransactionUseCase;
  public readonly cancelTransactionUseCase: CancelTransactionUseCase;
  public readonly simulateChargebackUseCase: SimulateChargebackUseCase;
  public readonly generateInvoiceUseCase: GenerateInvoiceUseCase;

  constructor() {
    const database = new JsonDatabase(process.env.DB_FILE_PATH);

    const userRepository = new JsonUserRepository(database);
    const cardRepository = new JsonCardRepository(database);
    const transactionRepository = new JsonTransactionRepository(database);
    const invoiceRepository = new JsonInvoiceRepository(database);

    const saltRounds = Number(process.env.SALT_ROUNDS ?? 10);
    const passwordHasher = new BcryptPasswordHasher(saltRounds);
    const idGenerator = new UuidGenerator();

    this.createUserUseCase = new CreateUserUseCase(userRepository, passwordHasher, idGenerator);
    this.createCardUseCase = new CreateCardUseCase(userRepository, cardRepository, idGenerator);
    this.processTransactionUseCase = new ProcessTransactionUseCase(cardRepository, transactionRepository, idGenerator);
    this.cancelTransactionUseCase = new CancelTransactionUseCase(transactionRepository, cardRepository);
    this.simulateChargebackUseCase = new SimulateChargebackUseCase(transactionRepository, cardRepository);
    this.generateInvoiceUseCase = new GenerateInvoiceUseCase(cardRepository, transactionRepository, invoiceRepository, idGenerator);
  }
}
