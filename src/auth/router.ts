import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, SanitizedUser } from "../models/user";
import { parseBody } from "../utils/model-parser";
import { createRouter } from "../utils/router";
import { login } from "./login";
import { register } from "./register";

const router = createRouter({ base: "/api/v1/auth" });

router.post("/register", async (request, env): Promise<RegisterResponse> => {
  const req = await parseBody(request, RegisterRequest);

  const user = await register(env.users, env.hasher, req);

  return {
    success: true,
    user: SanitizedUser.parse(user),
  };
});

router.post("/login", async (request, env): Promise<LoginResponse> => {
  const req = await parseBody(request, LoginRequest);

  const user = await login(env.users, env.hasher, req);

  const token = await env.jwt.sign({
    sub: user.id,
    name: user.fullName,
    email: user.email,
  });

  return {
    jwt: token,
    user: SanitizedUser.parse(user),
  };
});

export { router as authRouter };
