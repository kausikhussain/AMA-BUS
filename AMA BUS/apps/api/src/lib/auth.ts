import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { UserRole } from "@amaride/shared";
import { env } from "./env.js";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  name: string;
}

export const hashPassword = async (password: string) => bcrypt.hash(password, 10);

export const comparePassword = async (password: string, hashedPassword: string) =>
  bcrypt.compare(password, hashedPassword);

export const signToken = (payload: AuthTokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });

export const verifyToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
