import { authRouter } from "./auth/router";
import { devicesRouter } from "./devices/router";
import { pairRouter } from "./pair/router";
import { usersRouter } from "./users/router";
import { createRouter } from "./utils/router";

const router = createRouter({ base: "/api/v1" });

router.all("/auth/*", authRouter.handle);
router.all("/users/*", usersRouter.handle);
router.all("/devices/*", devicesRouter.handle);
router.all("/pair/*", pairRouter.handle);

export { router as routerV1 };
