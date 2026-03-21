import type { JwtPayload } from "jsonwebtoken";

declare global {
  export type MyPayload = JwtPayload & { sub: string };

  namespace Express {
    export interface Request {
      auth: MyPayload;
    }
  }
}

import "express";
import type { UserType } from "../userType";

declare module "express-serve-static-core" {
  interface Request {
    user: Pick<UserType, "id" | "email">;
  }
}