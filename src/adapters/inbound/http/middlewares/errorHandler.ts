import type { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../../../../shared/constants/http-status";
import { AppError } from "../../../../shared/errors/AppError";

export function errorHandler(error: Error, _request: Request, response: Response, _next: NextFunction): void {
  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message
      }
    });
    return;
  }

  response.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error"
    }
  });
}
