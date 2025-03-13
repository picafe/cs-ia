import express, { Request, Response, NextFunction } from "express";
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
import { createClass, getAllClasses, joinClass } from "./utils/class";

dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  optionsSuccessStatus: 200,
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

// Input validation interfaces
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

interface ClassJoinQuery {
  code: string;
}

interface ClassCreateQuery {
  name: string;
  courseCode: string;
  description: string;
  endDate: Date;
}

// Authentication middleware
app.use(async (req: Request, res: Response, next: NextFunction) => {
  // routes which don't require authentication
  const publicRoutes = ["/user/create", "/user/login"];

  if (publicRoutes.includes(req.originalUrl)) {
    next();
    return;
  }

  const token = req.signedCookies["session"];
  if (!token) {
    res.status(401).json({
      success: false,
      error: "Authentication required",
    });
    return;
  }

  try {
    const { session, user } = await validateSessionToken(token);

    if (!session || !user) {
      res.clearCookie("session", {
        httpOnly: true,
        path: "/",
        secure: (process.env.NODE_ENV || "development") !== "development",
        sameSite: "lax",
        signed: true,
      });

      res.status(401).json({
        success: false,
        error: "Invalid or expired session",
      });
      return;
    }

    // Store user info
    req.app.locals.user = user;
    req.app.locals.session = session;

    // Refresh cookie if expiring soon
    const oneHour = 60 * 60 * 1000;
    if (session.expiresAt.getTime() - Date.now() < oneHour) {
      res.cookie("session", token, {
        httpOnly: true,
        path: "/",
        secure: (process.env.NODE_ENV || "development") !== "development",
        sameSite: "lax",
        expires: session.expiresAt,
        signed: true,
      });
    }

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      error: "Authentication failed",
    });
    return;
  }
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});


app.get("/user/session", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {user: {name: req.app.locals.user.name, role: req.app.locals.user.role}},
  });
});

app.post(
  "/user/create",
  async (req: Request<{}, {}, UserQuery>, res: Response) => {
    try {
      const { email, name, password, role } = req.body;

      // Input validation
      if (!email || !name || !password || !role) {
        res.status(400).json({
          success: false,
          error: "All fields are required",
        });
        return;
      }

      if (!verifyNameInput(name)) {
        res.status(400).json({
          success: false,
          error: "Invalid name format",
        });
        return;
      }

      if (!verifyEmailInput(email)) {
        res.status(400).json({
          success: false,
          error: "Invalid email format or domain",
        });
        return;
      }

      if (!verifyPasswordStrength(password)) {
        res.status(400).json({
          success: false,
          error:
            "Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters",
        });
        return;
      }

      if (role !== Role.STUDENT && role !== Role.TEACHER) {
        res.status(400).json({
          success: false,
          error: "Invalid role specified",
        });
        return;
      }

      // Check email availability
      const emailAvailable = await checkEmailAvailability(email);
      if (!emailAvailable) {
        res.status(400).json({
          success: false,
          error: "Email is already in use",
        });
        return;
      }

      // Create user and session
      const user = await createUser(email, name, password, role);
      const sessionToken = generateSessionToken();
      const session = await createSession(sessionToken, user.id);

      // Set cookie
      res.cookie("session", sessionToken, {
        httpOnly: true,
        path: "/",
        secure: (process.env.NODE_ENV || "development") !== "development",
        sameSite: "lax",
        expires: session.expiresAt,
        signed: true,
      });

      res.status(200).json({
        success: true,
        data: { message: "User created successfully" },
      });
      return;
    } catch (error) {
      console.error("User creation error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create user",
      });
      return;
    }
  }
);

app.post(
  "/user/login",
  async (req: Request<{}, {}, LoginQuery>, res: Response) => {
    try {
      const { email, password } = req.body;

      // Input validation
      if (!email || !password) {
        res.status(400).json({
          success: false,
          error: "Email and password are required",
        });
        return;
      }

      // Find user
      const user = await getUserFromEmail(email);
      if (!user) {
        res.status(401).json({
          success: false,
          error: "Invalid credentials",
        });
        return;
      }

      // Verify password
      const passwordHash = await getUserPasswordHash(user.id);
      const validPassword = await verifyPasswordHash(passwordHash, password);

      if (!validPassword) {
        res.status(401).json({
          success: false,
          error: "Invalid credentials",
        });
        return;
      }

      // Create session
      const sessionToken = generateSessionToken();
      const session = await createSession(sessionToken, user.id);

      // Set cookie
      res.cookie("session", sessionToken, {
        httpOnly: true,
        path: "/",
        secure: (process.env.NODE_ENV || "development") !== "development",
        sameSite: "lax",
        expires: session.expiresAt,
        signed: true,
      });

      res.status(200).json({
        success: true,
        data: { message: "Login successful" },
      });
      return;
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        error: "Login failed",
      });
      return;
    }
  }
);

app.post("/user/logout", async (req: Request, res: Response) => {
  try {
    const token = req.signedCookies["session"];
    if (token) {
      await invalidateSession(token);
    }

    res.clearCookie("session", {
      httpOnly: true,
      path: "/",
      secure: (process.env.NODE_ENV || "development") !== "development",
      sameSite: "lax",
      signed: true,
    });

    res.status(200).json({
      success: true,
      data: { message: "Logout successful" },
    });
    return;
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Logout failed",
    });
    return;
  }
});

app.get("/user/classes", async (req: Request, res: Response) => {
  try {

    const classes = await getUserClasses(req.app.locals.user.id);

    res.status(200).json({
      success: true,
      data: classes || [],
    });
    return;
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve classes",
    });
    return;
  }
});

app.post(
  "/class/join",
  async (req: Request<{}, {}, ClassJoinQuery>, res: Response) => {
    try {
      const user = req.app.locals.user;

      // Authorization check
      if (!user || user.role !== "STUDENT") {
        res.status(403).json({
          success: false,
          error: "Only students can join classes",
        });
        return;
      }

      // Input validation
      const { code } = req.body;
      if (!code || typeof code !== "string" || code.length !== 6) {
        res.status(400).json({
          success: false,
          error: "Valid class code is required",
        });
        return;
      }

      // Join class
      const result = await joinClass({
        classCode: code,
        userId: user.id,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
      return;
    } catch (error) {
      console.error("Class join error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to join class",
      });
      return;
    }
  }
);

app.get("/classes", async (req: Request, res: Response) => {
  try {
    const user = req.app.locals.user;

    if (!user || user.role !== "TEACHER") {
      res.status(403).json({
        success: false,
        error: "Only teachers can view all classes",
      });
      return;
    }

    const classes = await getAllClasses();

    res.status(200).json({
      success: true,
      data: classes || [],
    });
    return;
  }
  catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve classes",
    });
    return;
  }
});

app.post(
  "/class/create",
  async (req: Request<{}, {}, ClassCreateQuery>, res: Response) => {
    try {
      const user = req.app.locals.user;

      // Authorization check
      if (!user || user.role !== "TEACHER") {
        res.status(403).json({
          success: false,
          error: "Only teachers can create classes",
        });
        return;
      }

      // Input validation
      const { name, courseCode, description, endDate } = req.body;

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: "Class name is required",
        });
        return;
      }

      if (
        courseCode &&
        (typeof courseCode !== "string" || courseCode.length > 20)
      ) {
        res.status(400).json({
          success: false,
          error: "Course code must be a valid string under 20 characters",
        });
        return;
      }

      if (
        description &&
        (typeof description !== "string" || description.length > 500)
      ) {
        res.status(400).json({
          success: false,
          error: "Description must be under 500 characters",
        });
        return;
      }

      if (endDate && isNaN(new Date(endDate).getTime())) {
        res.status(400).json({
          success: false,
          error: "End date must be a valid date",
        });
        return;
      }

      const result = await createClass({
        ...req.body,
        teacherId: user.id,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
      return;
    } catch (error) {
      console.error("Class creation error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create class",
      });
      return;
    }
  }
);

// Start server with error handling
app
  .listen(PORT, () => {
    console.log("Server running at PORT:", PORT);
  })
  .on("error", (error) => {
    console.error("Server startup error:", error);
    process.exit(1);
  });
