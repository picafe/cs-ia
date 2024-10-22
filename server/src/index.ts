import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { checkEmailAvailability, verifyEmailInput } from "./utils/email";
import cors from "cors";
import { verifyPasswordHash, verifyPasswordStrength } from "./utils/password";
import {
  createUser,
  getUserFromEmail,
  getUserPasswordHash,
  verifyNameInput,
} from "./utils/user";
import { createSession, generateSessionToken, validateSessionToken } from "./utils/session";
import { authMiddleware } from "./middleware";

dotenv.config();
const app = express();

const PORT = process.env.PORT;

const corsOptions = {
  origin: "http://127.0.0.1:5173",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true,
};

app.use(cookieParser());
app.use(cors(corsOptions));

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
}

interface LoginQuery {
  email: string;
  password: string;
}

app.use("/password/reset", async (req, res, next) => {
  await authMiddleware(req, res, next);
  next();
});

app.get(
  "/user/create",
  async (request: Request<{}, {}, {}, UserQuery>, response: Response) => {
    const { query } = request;
    if (
      typeof query.name !== "string" || typeof query.email !== "string" ||
      !verifyEmailInput(query.email) || typeof query.password !== "string" ||
      !verifyPasswordStrength(query.password)
    ) {
      response.status(400).send("Invalid or missing fields");
      return;
    }
    if (!await checkEmailAvailability(query.email)) {
      response.status(400).send("Email is already in use");
      return;
    }
    const user = await createUser(query.email, query.name, query.password);
    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id);
    response.cookie("session", sessionToken, {
      httpOnly: true,
      path: "/",
      secure: (process.env.NODE_ENV || "development") !== "development",
      sameSite: "lax",
      expires: session.expiresAt,
    });
    response.status(200).send(true);
  },
);

app.get(
  "/user/login",
  async (req: Request<{}, {}, {}, LoginQuery>, res: Response) => {
    const { email, password } = req.query;
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
    });
    res.status(200).send(true);
  },
);

app.get("/password/reset", async (req: Request, res: Response) => {
});

app.get("/user/session", async (req: Request, res: Response) => {
  const token = req.cookies["session"] ?? null;
  if (token == null) {
    res.status(401).send("Invalid session token");
    return;
  }
  const result = await validateSessionToken(token);
  if (result.session === null) {
    res.redirect("/login");
    return;
  }
  res.status(200).send(result.session);
});

app.listen(PORT, () => {
  console.log("Server running at PORT: ", PORT);
}).on("error", (error) => {
  // gracefully handle error
  throw new Error(error.message);
});
