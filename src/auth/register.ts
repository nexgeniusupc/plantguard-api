import { StatusError } from "itty-router";

import { RegisterRequest, User } from "../models/user";
import { HashingService } from "../services/hashing";

export async function register(db: KVNamespace, hasher: HashingService, req: RegisterRequest): Promise<User> {
  const possibleDuplicate = await db.get(req.email);
  if (possibleDuplicate) {
    throw new StatusError(400, "Another user already exists with that email");
  }

  const id = crypto.randomUUID();
  const password = await hasher.hash(req.password);

  const now = new Date();
  const user: User = {
    ...req,
    id,
    password,
    createdAt: now,
    updatedAt: now,
    lastPasswordUpdate: now,
  };

  await db.put(req.email, JSON.stringify(user));
  return user;
}
