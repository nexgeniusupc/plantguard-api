import { SanitizedUser } from "../models/user";
import { createAuthenticatedRouter } from "../utils/router";

const router = createAuthenticatedRouter({ base: "/api/v1/users" });

router.get("/me", (request): SanitizedUser => {
  return SanitizedUser.parse(request.user);
});

export { router as usersRouter };
