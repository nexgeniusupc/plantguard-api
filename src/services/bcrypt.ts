import * as bcrypt from "bcryptjs";

import { HashingService } from "./hashing";

export class BcryptService implements HashingService {
  constructor(private rounds: number = 10) {}

  salt(): Promise<string> {
    return bcrypt.genSalt(this.rounds);
  }

  async hash(str: string): Promise<string> {
    const salt = await this.salt();
    return bcrypt.hash(str, salt);
  }

  compare(str: string, hash: string): Promise<boolean> {
    return bcrypt.compare(str, hash);
  }
}
