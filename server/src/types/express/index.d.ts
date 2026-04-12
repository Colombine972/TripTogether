import type { JwtPayload } from "jsonwebtoken";
import "express";
import type { UserType } from "../userType";

declare global {
  export type MyPayload = JwtPayload & { sub: string };

  namespace Express {
    export interface Request {
      auth: MyPayload;
    }
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user?: Pick<UserType, "id" | "email">;
  }
}