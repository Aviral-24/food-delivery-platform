import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { ApiError } from "../../utils/ApiError.js";
import { authStore } from "./auth.store.js";

const signToken = (user) =>
  jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );

const sanitizeUser = ({ passwordHash, ...safeUser }) => safeUser;

export const authService = {
  async register({ name, email, password, role }) {
    const existing = authStore.findByEmail(email);
    if (existing) {
      throw new ApiError(409, "Email is already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = authStore.create({
      id: crypto.randomUUID(),
      name,
      email,
      role,
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    const token = signToken(user);
    return { user: sanitizeUser(user), token };
  },

  async login({ email, password }) {
    const user = authStore.findByEmail(email);
    if (!user) {
      throw new ApiError(401, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, "Invalid email or password");
    }

    const token = signToken(user);
    return { user: sanitizeUser(user), token };
  },

  getProfile(userId) {
    const user = authStore.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    return sanitizeUser(user);
  },
};
