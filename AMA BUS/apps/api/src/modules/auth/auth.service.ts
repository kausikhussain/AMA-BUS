import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../lib/errors.js";
import { comparePassword, hashPassword, signToken } from "../../lib/auth.js";
import { createSystemLog } from "../../lib/activity.js";

const buildSession = (user: { id: string; name: string; email: string; role: "PASSENGER" | "DRIVER" | "ADMIN" }) => ({
  token: signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    name: user.name
  }),
  user
});

export const authService = {
  async register(input: { name: string; email: string; password: string; phone?: string }) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: input.email
      }
    });

    if (existingUser) {
      throw new AppError(409, "Email address is already registered", "EMAIL_TAKEN");
    }

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwordHash: await hashPassword(input.password)
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    await createSystemLog("auth.register", `New passenger account created for ${user.email}`, user.id);

    return buildSession(user);
  },

  async login(input: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: {
        email: input.email
      }
    });

    if (!user) {
      throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
    }

    const isPasswordValid = await comparePassword(input.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
    }

    await createSystemLog("auth.login", `${user.email} signed in`, user.id);

    return buildSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  },

  async getProfile(userId: string) {
    const profile = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    if (!profile) {
      throw new AppError(404, "User not found", "USER_NOT_FOUND");
    }

    return profile;
  }
};
