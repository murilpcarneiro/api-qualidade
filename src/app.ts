import express from "express";
import swaggerUi from "swagger-ui-express";
import { buildRoutes } from "./adapters/inbound/http/routes";
import { errorHandler } from "./adapters/inbound/http/middlewares/errorHandler";
import { ApplicationContainer } from "./adapters/inbound/http/factories/ApplicationContainer";
import { openApiDocument } from "./adapters/inbound/http/docs/openapi";

export function createApp(): express.Express {
  const app = express();
  const container = new ApplicationContainer();

  app.use(express.json());
  app.get("/api/docs.json", (_request, response) => {
    response.json(openApiDocument);
  });
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use("/api", buildRoutes(container));
  app.use(errorHandler);

  return app;
}
