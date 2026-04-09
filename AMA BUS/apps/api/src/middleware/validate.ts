import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { AppError } from "../lib/errors.js";

export const validateBody =
  (schema: ZodTypeAny) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(
        new AppError(
          400,
          result.error.flatten().formErrors.join(", ") || "Invalid payload",
          "VALIDATION_ERROR"
        )
      );
    }

    req.body = result.data;
    return next();
  };
