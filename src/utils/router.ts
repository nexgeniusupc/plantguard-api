import { IRequest, Router, RouterOptions } from "itty-router";

export type AppRequest = {
  // This is just defined so that the correct types in itty-router are used
  placeholder: never,
} & IRequest;

export interface AppEnv { }

export type RouteArgs = [env: AppEnv, ctx: ExecutionContext];

export function createRouter(options?: RouterOptions) {
  return Router<AppRequest, RouteArgs>(options);
}
