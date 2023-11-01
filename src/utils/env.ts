import { IRequest } from "itty-router";

import { AppJwtPayload, User } from "../models/user";
import { HashingService } from "../services/hashing";
import { JwtService } from "../services/jwt";

export interface AppRequest extends IRequest {
  user?: User;
}

export interface AuthenticatedRequest extends AppRequest {
  user: User;
}

export interface AppBindings {
  // Secrets
  JWT_SECRET: string;
  // KV
  users: KVNamespace;
}

export interface AppEnv extends AppBindings {
  jwt: JwtService<AppJwtPayload>;
  hasher: HashingService;
}
