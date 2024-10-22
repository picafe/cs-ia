import type { RequestHandler } from "express";
import { validateSessionToken } from "./utils/session";

export const authMiddleware: RequestHandler = async (req, res, next) => {
  const token = req.cookies["session"] ?? null;
  if (token === null) {
    res.locals.userId = null;
    res.locals.user = null;
    res.status(401).send("Unauthorized");
  }
  const { session, user } = await validateSessionToken(token);
  if (session !== null) {
    res.cookie("session", token, {
      httpOnly: true,
      path: "/",
      secure: (process.env.NODE_ENV || "development") !== "development",
      sameSite: "lax",
      expires: session.expiresAt,
    });
  } else {
    res.cookie("session", "", {
      httpOnly: true,
      path: "/",
      secure: (process.env.NODE_ENV || "development") !== "development",
      sameSite: "lax",
      maxAge: 0,
    });
  }
  req.app.locals.user = user;
  req.app.locals.session = session;

  next();
};
