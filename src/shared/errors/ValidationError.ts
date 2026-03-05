import { HTTP_STATUS } from "../constants/http-status";
import { AppError } from "./AppError";

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, HTTP_STATUS.BAD_REQUEST, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}
