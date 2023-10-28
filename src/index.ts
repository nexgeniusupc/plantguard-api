import { error, json } from "itty-router";

import { AppEnv, createRouter } from "./utils/router";

const router = createRouter();

router.get("/", () => {
  return { success: true, message: "Hello, world!" };
});

export default {
  fetch(request: Request, env: AppEnv, ctx: ExecutionContext): Promise<Response> {
    return router.handle(request, env, ctx).then(json).catch(error);
  },
};
