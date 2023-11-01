import { StatusError } from "itty-router";

import { User } from "../models/user";
import { JwtError } from "../services/jwt";
import { AppMiddleware } from "../utils/router";

export const authMiddleware: AppMiddleware = async (request, env) => {
  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    throw new StatusError(401, "No credentials were provided");
  }

  const token = header.split(" ")[1];
  let isValid: boolean;
  try {
    isValid = await env.jwt.verify(token);
  } catch (error) {
    if (error instanceof JwtError) {
      throw new StatusError(400, error.message);
    }
    throw error;
  }
  if (!isValid) {
    throw new StatusError(401, "Invalid JWT");
  }

  const { email } = env.jwt.decode(token);
  if (!email) {
    throw new StatusError(401, "Invalid JWT");
  }

  const data = await env.users.get(email);
  if (!data) {
    throw new StatusError(401, "The user associated with this token doesn't exist");
  }

  const user = User.parse(JSON.parse(data));
  request.user = user;
};
