import { RouteHandler, Router, RouterOptions } from "itty-router";

import { authMiddleware } from "../auth/middleware";
import { AppEnv, AppRequest, AuthenticatedRequest } from "./env";

export type AppRouteArgs = [env: AppEnv, ctx: ExecutionContext];

export type AppRouteHandler<TRequest extends AppRequest = AppRequest> = RouteHandler<TRequest, AppRouteArgs>;
export type AppMiddleware<TRequest extends AppRequest = AppRequest> = AppRouteHandler<TRequest>;

export function createRouter<TRequest extends AppRequest = AppRequest>(options?: RouterOptions) {
  return Router<TRequest, AppRouteArgs>(options);
}

export function createAuthenticatedRouter(options?: RouterOptions) {
  const router = createRouter<AuthenticatedRequest>(options);
  router.all("*", authMiddleware);
  return router;
}

export type AuthenticatedRouteHandler = AppRouteHandler<AuthenticatedRequest>;
export type AuthenticatedMiddleware = AppMiddleware<AuthenticatedRequest>;
