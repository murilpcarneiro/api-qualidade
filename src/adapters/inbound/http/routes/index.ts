import { Router } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import type { ApplicationContainer } from "../factories/ApplicationContainer";
import { UserController } from "../controllers/UserController";
import { CardController } from "../controllers/CardController";
import { TransactionController } from "../controllers/TransactionController";
import { InvoiceController } from "../controllers/InvoiceController";

export function buildRoutes(container: ApplicationContainer): Router {
  const router = Router();

  const userController = new UserController(container.createUserUseCase);
  const cardController = new CardController(container.createCardUseCase);
  const transactionController = new TransactionController(
    container.processTransactionUseCase,
    container.cancelTransactionUseCase,
    container.simulateChargebackUseCase
  );
  const invoiceController = new InvoiceController(container.generateInvoiceUseCase);

  router.post("/users", asyncHandler((request, response) => userController.create(request, response)));
  router.post("/cards", asyncHandler((request, response) => cardController.create(request, response)));
  router.post("/transactions", asyncHandler((request, response) => transactionController.process(request, response)));
  router.post(
    "/transactions/:transactionId/cancel",
    asyncHandler((request, response) => transactionController.cancel(request, response))
  );
  router.post(
    "/transactions/:transactionId/chargeback",
    asyncHandler((request, response) => transactionController.chargeback(request, response))
  );
  router.get("/cards/:cardId/invoice", asyncHandler((request, response) => invoiceController.generate(request, response)));

  return router;
}
