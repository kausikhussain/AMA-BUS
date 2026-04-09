import type { NextFunction, Request, Response } from "express";
import { AppError } from "../lib/errors.js";
import { verifyToken } from "../lib/auth.js";

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new AppError(401, "Authorization token missing", "AUTH_REQUIRED"));
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    req.auth = verifyToken(token);
    return next();
  } catch {
    return next(new AppError(401, "Invalid or expired token", "INVALID_TOKEN"));
  }
};
