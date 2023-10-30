import { StatusError } from "itty-router";
import { z, ZodTypeAny } from "zod";

export const assertModel = async <T extends ZodTypeAny>(value: unknown, model: T): Promise<z.infer<T>> => {
  const parsed = await model.safeParseAsync(value);
  if (!parsed.success) {
    throw new StatusError(400, parsed.error);
  }
  return parsed.data;
};

export const parseBody = async <T extends ZodTypeAny>(request: Request, model: T): Promise<z.infer<T>> => {
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError && error.message.includes("JSON")) {
      throw new StatusError(400, error.message);
    }
    throw error;
  }
  return assertModel<T>(body, model);
};
