import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "@amaride/shared";
import { AppError } from "../lib/errors.js";

export const requireRole =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new AppError(401, "Unauthorized", "UNAUTHORIZED"));
    }

    if (!roles.includes(req.auth.role)) {
      return next(new AppError(403, "Insufficient permissions", "FORBIDDEN"));
    }

    return next();
  };
