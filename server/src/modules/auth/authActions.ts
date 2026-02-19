import argon2 from "argon2";
import type { Request, RequestHandler } from "express";
import jwt, {
  JsonWebTokenError,
  TokenExpiredError,
  type JwtPayload,
} from "jsonwebtoken";
import userRepository from "../user/userRepository";

interface MyPayload extends JwtPayload {
  sub: string;
}

type RequestWithAuth = Request & {
  auth: MyPayload;
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const user = await userRepository.readByEmail(req.body.email);
    if (!user) {
      res.sendStatus(403);
      return;
    }

    const verified = await argon2.verify(user.password, req.body.password);
    if (!verified) {
      res.sendStatus(401);
      return;
    }

    const { password, ...userWithoutHashedPassword } = user;

    const payload: MyPayload = {
      sub: user.id.toString(),
    };

    const token = jwt.sign(payload, process.env.APP_SECRET as string, {
      expiresIn: "3h",
    });

    res.json({ token, user: userWithoutHashedPassword });
  } catch (err) {
    next(err);
  }
};

export const hashPassword: RequestHandler = async (req, _res, next) => {
  try {
    const { password, ...otherBodyProps } = req.body;

    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 19 * 1024,
      timeCost: 2,
      parallelism: 1,
    });

    req.body = {
      ...otherBodyProps,
      hashed_password: hashedPassword,
    };

    next();
  } catch (err) {
    next(err);
  }
};

export const verifyToken: RequestHandler = (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header is missing" });
    }

    const [type, token] = authHeader.split(" ");

    if (
      type !== "Bearer" ||
      !token ||
      token === "null" ||
      token === "undefined"
    ) {
      return res
        .status(401)
        .json({ error: "Authorization header must be a valid Bearer token" });
    }

    const decoded = jwt.verify(
      token,
      process.env.APP_SECRET as string,
    ) as MyPayload;

    (req as RequestWithAuth).auth = decoded;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err);

    if (err instanceof TokenExpiredError) {
      return res.status(401).json({ error: "Token expired" });
    }

    if (err instanceof JsonWebTokenError) {
      return res.status(401).json({ error: "Invalid token" });
    }

    return res.status(401).json({ error: "Unauthorized" });
  }
};
