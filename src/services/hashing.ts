import { MaybePromise } from "../utils/types";

export interface HashingService {
  salt(): MaybePromise<string>;
  hash(str: string): MaybePromise<string>;
  compare(str: string, hashed: string): MaybePromise<boolean>;
}
