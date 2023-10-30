export type MaybePromise<T> = T | Promise<T>;

export interface ErrorOptions {
  cause?: unknown;
}

export class CustomError extends Error {
  public cause?: unknown;

  constructor(name: string, message?: string, options?: ErrorOptions) {
    super(message);
    this.name = name;
    this.cause = options?.cause;
  }
}
