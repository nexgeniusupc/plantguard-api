import * as jwt from "@tsndr/cloudflare-worker-jwt";
import ms from "ms";

import { CustomError, ErrorOptions } from "../utils/types";

export class JwtError extends CustomError {
  constructor(message?: string, options?: ErrorOptions) {
    super("JwtError", message, options);
  }
}

export class JwtService<TPayload extends jwt.JwtPayload> {
  constructor(
    private secret: string,
    private defaultPayload?: Partial<TPayload>,
  ) {}

  private normalizeError(error: unknown): never {
    if (error instanceof Error) {
      throw new JwtError(error.message);
    }
    if (typeof error === "string") {
      throw new JwtError(error);
    }
    throw error;
  }

  private createPayload(payload: TPayload): TPayload {
    return Object.assign({}, this.defaultPayload, payload);
  }

  static exp(duration: number | string): number {
    if (typeof duration === "string") duration = ms(duration);
    return Math.floor(Date.now() / 1000 + duration / 1000);
  }

  exp(duration: number | string): number {
    return JwtService.exp(duration);
  }

  async sign(payload: TPayload): Promise<string> {
    payload = this.createPayload(payload);
    try {
      return await jwt.sign(payload, this.secret);
    } catch (error) {
      this.normalizeError(error);
    }
  }

  async verify(token: string): Promise<boolean> {
    try {
      return await jwt.verify(token, this.secret);
    } catch (error) {
      this.normalizeError(error);
    }
  }

  decode(token: string): TPayload {
    try {
      const { payload } = jwt.decode(token);
      // TODO: Validate with Zod
      return payload as TPayload;
    } catch (error) {
      this.normalizeError(error);
    }
  }
}
