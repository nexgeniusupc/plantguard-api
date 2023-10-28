import { error, json } from "itty-router";
import { AppEnv, createRouter } from "./utils/router";

const router = createRouter();

router.get('/', (request, env, ctx) => {
  return { success: true, message: 'Hello, world!' };
});

export default {
  fetch(request: Request, env: AppEnv, ctx: ExecutionContext) {
    return router
      .handle(request, env, ctx)
      .then(json)
      .catch(error);
  }
}
