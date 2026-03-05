import { HTTP_STATUS } from "../constants/http-status";
import { AppError } from "./AppError";

export class BusinessRuleError extends AppError {
  constructor(message: string) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, "BUSINESS_RULE_ERROR");
    this.name = "BusinessRuleError";
  }
}
