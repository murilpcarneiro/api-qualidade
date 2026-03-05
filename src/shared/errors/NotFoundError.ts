import { HTTP_STATUS } from "../constants/http-status";
import { AppError } from "./AppError";

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, HTTP_STATUS.NOT_FOUND, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}
