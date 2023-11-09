import { JwtPayload } from "@tsndr/cloudflare-worker-jwt";
import { z } from "zod";

import { ZodDate } from "../utils/zod-date";

export const User = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(1),
  preferredName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).max(72),
  createdAt: ZodDate,
  updatedAt: ZodDate,
  lastPasswordUpdate: ZodDate,
});
export type User = z.infer<typeof User>;

export const SanitizedUser = User.omit({ password: true });
export type SanitizedUser = z.infer<typeof SanitizedUser>;

export const RegisterRequest = User.pick({
  fullName: true,
  preferredName: true,
  email: true,
  password: true,
});
export type RegisterRequest = z.infer<typeof RegisterRequest>;

export const RegisterResponse = z.object({
  success: z.boolean(),
  user: SanitizedUser,
});
export type RegisterResponse = z.infer<typeof RegisterResponse>;

export const LoginRequest = User.pick({ email: true, password: true });
export type LoginRequest = z.infer<typeof LoginRequest>;

export const LoginResponse = z.object({
  jwt: z.string(),
  user: SanitizedUser,
});
export type LoginResponse = z.infer<typeof LoginResponse>;

export interface AppJwtPayload extends JwtPayload {
  name?: string;
  email?: string;
}
