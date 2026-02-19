import type { JwtPayload } from "jsonwebtoken";

declare global {
  export type MyPayload = JwtPayload & { sub: string };

  namespace Express {
    export interface Request {
      auth: MyPayload;
    }
  }
}
