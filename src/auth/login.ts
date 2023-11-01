import { StatusError } from "itty-router";

import { LoginRequest, User } from "../models/user";
import { HashingService } from "../services/hashing";

export async function login(db: KVNamespace, hasher: HashingService, req: LoginRequest): Promise<User> {
  const data = await db.get(req.email);
  if (!data) {
    throw new StatusError(401, "Invalid email or password");
  }
  const user = User.parse(JSON.parse(data));

  const isValid = await hasher.compare(req.password, user.password);
  if (!isValid) {
    throw new StatusError(401, "Invalid email or password");
  }

  return user;
}
