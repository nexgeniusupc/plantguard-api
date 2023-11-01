import { authRouter } from "./auth/router";
import { usersRouter } from "./users/router";
import { createRouter } from "./utils/router";

const router = createRouter({ base: "/api/v1" });

router.all("/auth/*", authRouter.handle);
router.all("/users/*", usersRouter.handle);

export { router as routerV1 };
