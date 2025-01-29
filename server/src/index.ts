import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { checkEmailAvailability, verifyEmailInput } from "./utils/email";
import cors from "cors";
import { verifyPasswordHash, verifyPasswordStrength } from "./utils/password";
import {
  createUser,
  getUserClasses,
  getUserFromEmail,
  getUserPasswordHash,
  getUserType,
  verifyNameInput,
} from "./utils/user";
import {
  createSession,
  generateSessionToken,
  invalidateSession,
  validateSessionToken,
} from "./utils/session";
import { authMiddleware } from "./middleware";
import { Role } from "@prisma/client";
import { createClass } from "./utils/class";

dotenv.config();
const app = express();

const PORT = process.env.PORT;

const corsOptions = {
  origin: "http://127.0.0.1:5173",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
};

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cors(corsOptions));
app.use(express.json());

export interface RequestLocals extends Request {
  locals: AppLocals;
}

interface AppLocals {
  userId: number;
  user: string;
}

app.get("/", async (request: Request, response: Response) => {
  console.log(request.cookies["cookieName"]);
  let a = request.app.locals.userId;

  response.status(200).send(a);
});

interface UserQuery {
  email: string;
  name: string;
  password: string;
  role: Role;
}

interface LoginQuery {
  email: string;
  password: string;
}

app.use(async (req, res, next) => {
  if(req.originalUrl === "/user/create" || req.originalUrl === "/user/login") {
    next();
    return;
  }
  
  const token = req.signedCookies["session"] ?? null;
  if (token === null) {
    res.locals.userId = null;
    res.locals.user = null;
    res.status(401).send("Unauthorized");
    return;
  }

  const { session, user } = await validateSessionToken(token);
  req.app.locals.user = user;
  req.app.locals.session = session;

  if (session !== null) {
    // Only sets cookie if it's about to expire
    const oneHour = 60 * 60 * 1000;
    if (session.expiresAt.getTime() - Date.now() < oneHour) {
      res.signecookie("session", token, {
        httpOnly: true,
        path: "/",
        secure: (process.env.NODE_ENV || "development") !== "development",
        sameSite: "lax",
        expires: session.expiresAt,
        signed: true,
      });
    }
  } else {
    if (token) {
      res.cookie("session", "", {
        httpOnly: true,
        path: "/",
        secure: (process.env.NODE_ENV || "development") !== "development",
        sameSite: "lax",
        maxAge: 0,
        signed: true,
      });
    }
  }
  
  next();
});

app.post(
  "/user/create",
  async (request: Request<{}, {}, UserQuery>, response: Response) => {
    const { email, name, password, role } = request.body;
    // validate input
    if (
      !name || !email || !password || !role ||
      typeof name !== "string" ||
      !verifyEmailInput(email) ||
      !verifyPasswordStrength(password) ||
      (role !== Role.STUDENT && role !== Role.TEACHER)
    ) {
      response.status(400).send("Invalid or missing fields");
      return;
    }
    if (!(await checkEmailAvailability(email))) {
      response.status(400).send("Email is already in use");
      return;
    }
    const user = await createUser(email, name, password, role);
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id);
    response.cookie("session", sessionToken, {
      httpOnly: true,
      path: "/",
      secure: (process.env.NODE_ENV || "development") !== "development",
      sameSite: "lax",
      expires: session.expiresAt,
      signed: true,
    });
    response.status(200).send(true);
  }
);

app.post(
  "/user/login",
  async (req: Request<{}, {}, LoginQuery>, res: Response) => {
    const { email, password } = req.body;
    const user = await getUserFromEmail(email);
    if (user === null) {
      res.status(400).send("User not found");
      return;
    }
    const passwordHash = await getUserPasswordHash(user!.id);
    const validPassword = await verifyPasswordHash(passwordHash, password);
    if (!validPassword) {
      res.status(400).send("Invalid password");
      return;
    }
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user!.id);
    res.cookie("session", sessionToken, {
      httpOnly: true,
      path: "/",
      secure: (process.env.NODE_ENV || "development") !== "development",
      sameSite: "lax",
      expires: session.expiresAt,
      signed: true
    });
    res.status(200).send(true);
  }
);

app.post("/user/logout", async (req: Request, res: Response) => {
  invalidateSession(req.signedCookies["session"]);
  res.cookie("session", "", {
		httpOnly: true,
		path: "/",
    secure: (process.env.NODE_ENV || "development") !== "development",
		sameSite: "lax",
		maxAge: 0
	});
  res.status(204);
  return;
});

app.get("/password/reset", async (req: Request, res: Response) => {});

app.get("/user/session", async (req: Request, res: Response) => {
  const token = req.signedCookies["session"] ?? null;
  if (token == null) {
    res.status(401).send("Invalid session token");
    return;
  }
  const result = await validateSessionToken(token);
  if (result.session === null) {
    res.clearCookie("session");
    res.status(401).send("Invalid session token");
    return;
  }
  res.status(200).send(result.user);
});

app.get("/user/classes", async (req: Request, res: Response) => {
  const result = await getUserClasses(req.app.locals.userId);
  if (result === null) {
    res.status(404).send("You are not enrolled in any classes.");
    return;
  } else {
    res.status(200).send(result);
  }
});

app.get("/user/role", async (req: Request, res: Response) => {});

app.post("/class/create", async (req: Request, res: Response) => {
  try{
    if (req.app.locals.user.role !== "TEACHER") {
      res.status(403).send("Unauthorized");
      return;
    }

    if (!req.body || !req.body.name) {
      res.status(400).send("Invalid request body");
      return;
    }

    const result = await createClass({
      ...req.body,
      teacherId: req.app.locals.user.id,
    });

    if (!result) {
      res.status(404).send("Class not created");
      return;
    }
    res.status(200).json(result)
    return;

  } catch (error) {
    res.status(500).send("Internal server error");
    console.error(error);
    return;
  }
});

app
  .listen(PORT, () => {
    console.log("Server running at PORT: ", PORT);
  })
  .on("error", (error) => {
    // gracefully handle error
    throw new Error(error.message);
  });
