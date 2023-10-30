import { error, json } from "itty-router";

import { routerV1 } from "./api";
import { AppJwtPayload } from "./models/user";
import { BcryptService } from "./services/bcrypt";
import { JwtService } from "./services/jwt";
import { AppBindings, AppEnv } from "./utils/env";
import { createRouter } from "./utils/router";

const router = createRouter();

router.all("/api/v1/*", routerV1.handle);

router.all("*", () => error(404));

export default {
  fetch(request: Request, bindings: AppBindings, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    const env: AppEnv = {
      ...bindings,
      jwt: new JwtService<AppJwtPayload>(bindings.JWT_SECRET, {
        aud: url.hostname,
        exp: JwtService.exp("30d"),
      }),
      hasher: new BcryptService(),
    };

    return router.handle(request, env, ctx).then(json).catch(error);
  },
};
