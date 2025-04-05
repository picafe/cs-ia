import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { checkEmailAvailability, verifyEmailInput } from "./utils/email";
import cors from "cors";
import { verifyPasswordHash, verifyPasswordStrength } from "./utils/password";
import {
  createUser,
  deleteUser,
  editStudentUser,
  getNotificationPreferences,
  getStudentUserById,
  getUserClasses,
  getUserFromEmail,
  getUserPasswordHash,
  getUserProfile,
  updateUserEmail,
  updateUserName,
  updateUserNotificationPreferences,
  updateUserPassword,
  verifyNameInput,
} from "./utils/user";
import {
  createSession,
  generateSessionToken,
  invalidateSession,
  validateSessionToken,
} from "./utils/session";
import { Role } from "@prisma/client";
import {
  createClass,
  getAllClasses,
  getClassById,
  getStudentDetailData,
  getTeacherDashboardData,
  joinClass,
  updateClass,
} from "./utils/class";
import { error } from "console";

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
  // Routes which don't require authentication
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
    data: {
      user: { name: req.app.locals.user.name, role: req.app.locals.user.role },
    },
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

//UNUSED
app.get("/user/student/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const studentId = Number(id);
    const userType = req.app.locals.user.role;

    if (userType === "TEACHER") {
      const student = await getStudentUserById(studentId);
      if (!student) {
        res.status(404).json({ success: false, message: "Student not found" });
        return;
      }

      res.json({ success: true, data: student });
      return;
    } else {
      res.status(403).json({
        success: false,
        error: "Only teachers can view student details",
      });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
    return;
  }
});

app.post("/user/student/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const studentId = Number(id);
    const data = req.body
    if (req.app.locals.user.role === "TEACHER") {
      if (!data.status || typeof data.status !== "string" || typeof data.totalHours !== "number" || Number(data.totalHours) < 0) {
        res.status(400).json({
          success: false,
          error: "All fields are required",
        });
        return;
      }
      const result = await editStudentUser(studentId, req.body);
      res.json({ success: true, data: result });
      return;
    } else {
      res.status(403).json({
        success: false,
        error: "Only teachers can edit student details",
      });
      return;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
    return;
  }
});

// Add this endpoint after other user-related endpoints

// Get user profile information
app.get("/user/profile", async (req: Request, res: Response) => {
  try {
    const user = req.app.locals.user;
    
    const userInfo = await getUserProfile(user.id);    
    
    if (!userInfo) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: userInfo,
    });
    return;
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user profile",
    });
    return;
  }
});

app.put("/user/profile", async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    const userId = req.app.locals.user.id;

    // Input validation
    if (!name || !email) {
      res.status(400).json({
        success: false,
        error: "Name and email are required",
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

    // Check if email is already in use by another user
    if (email !== req.app.locals.user.email) {
      const emailAvailable = await checkEmailAvailability(email);
      if (!emailAvailable) {
        res.status(400).json({
          success: false,
          error: "Email is already in use",
        });
        return;
      }
    }

    // Update user profile
    await updateUserName(userId, name);
    
    if (email !== req.app.locals.user.email) {
      await updateUserEmail(userId, email);
    }

    res.status(200).json({
      success: true,
      data: { message: "Profile updated successfully" },
    });
    return;
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
    });
    return;
  }
});

// Update user password
app.put("/user/password", async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.app.locals.user.id;

    // Input validation
    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: "Current password and new password are required",
      });
      return;
    }

    if (!verifyPasswordStrength(newPassword)) {
      res.status(400).json({
        success: false,
        error:
          "Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters",
      });
      return;
    }

    // Verify current password
    const passwordHash = await getUserPasswordHash(userId);
    const validPassword = await verifyPasswordHash(passwordHash, currentPassword);

    if (!validPassword) {
      res.status(401).json({
        success: false,
        error: "Current password is incorrect",
      });
      return;
    }

    // Update password
    await updateUserPassword(userId, newPassword);

    res.status(200).json({
      success: true,
      data: { message: "Password updated successfully" },
    });
    return;
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update password",
    });
    return;
  }
});


// Get user notification settings
app.get("/user/notifications", async (req: Request, res: Response) => {
  try {
    const user = req.app.locals.user;
    
    const userSettings = await getNotificationPreferences(user.id)
    
    // If settings don't exist yet, return default values
    if (!userSettings) {
      res.status(404).json({
        success: false,
        error: "Notification settings not found",
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: userSettings,
    });
    return;
  } catch (error) {
    console.error("Notification settings fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch notification settings",
    });
    return;
  }
});

// Update notification preferences
app.put("/user/notifications", async (req: Request, res: Response) => {
  try {
    const { emailNotifications, browserNotifications } = req.body;
    const userId = req.app.locals.user.id;

    // Input validation
    if (browserNotifications == null || emailNotifications == null) {
      res.status(400).json({
        success: false,
        error: "Notification preferences are required",
      });
      return;
    }

    // Update notification preferences
    await updateUserNotificationPreferences(userId, browserNotifications, emailNotifications);

    res.status(200).json({
      success: true,
      data: { message: "Notification preferences updated successfully" },
    });
    return;
  } catch (error) {
    console.error("Notification preferences update error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update notification preferences",
    });
    return;
  }
});

// Delete user account
app.delete("/user/account", async (req: Request, res: Response) => {
  try {
    const userId = req.app.locals.user.id;

    // Delete user account
    await deleteUser(userId);
    
    // Clear session
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
      data: { message: "Account deleted successfully" },
    });
    return;
  } catch (error) {
    console.error("Account deletion error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete account",
    });
    return;
  }
});

app.post(
  "/class/join",
  async (req: Request<{}, {}, ClassJoinQuery>, res: Response) => {
    try {
      const user = req.app.locals.user;

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
  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve classes",
    });
    return;
  }
});

app.get("class/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const classData = await getClassById(Number(id));

    if (!classData) {
      res.status(404).json({ success: false, message: "Class not found" });
      return;
    }

    res.json({ success: true, data: classData });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
    return;
  }
});

app.post(
  "/class/create",
  async (req: Request<{}, {}, ClassCreateQuery>, res: Response) => {
    try {
      const user = req.app.locals.user;

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

// Get specific class by ID
app.get("/class/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.app.locals.user;

    if (user.role !== "TEACHER") {
      res.status(403).json({
        success: false,
        error: "Only teachers can view class details",
      });
      return;
    }

    const classData = await getClassById(Number(id));

    if (!classData) {
      res.status(404).json({ 
        success: false, 
        error: "Class not found" 
      });
      return;
    }

    res.json({ 
      success: true, 
      data: classData 
    });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      error: "Server error" 
    });
    return;
  }
});

// Update class
app.put("/class/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.app.locals.user;
    
    if (user.role !== "TEACHER") {
      res.status(403).json({
        success: false,
        error: "Only teachers can update classes",
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

    if (courseCode && (typeof courseCode !== "string" || courseCode.length > 20)) {
      res.status(400).json({
        success: false,
        error: "Course code must be a valid string under 20 characters",
      });
      return;
    }

    if (description && (typeof description !== "string" || description.length > 500)) {
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

    // Update the class
    const updatedClass = await updateClass(Number(id), {
      name,
      courseCode,
      description,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    res.status(200).json({
      success: true,
      data: updatedClass,
    });
    return;
  } catch (error) {
    console.error("Class update error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update class",
    });
    return;
  }
});

app.get("/teacher/dashboard", async (req: Request, res: Response) => {
  try {
    const user = req.app.locals.user;

    if (user.role !== "TEACHER") {
      res.status(403).json({
        success: false,
        error: "Only teachers can access this data",
      });
      return;
    }

    const dashboardData = await getTeacherDashboardData(user.id);

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
    return;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve dashboard data",
    });
    return;
  }
});

// Get student detail view
app.get("/student/:id/details", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.app.locals.user;
    const studentId = Number(id);

    if (user.role !== "TEACHER") {
      res.status(403).json({
        success: false,
        error: "Only teachers can view student details",
      });
      return;
    }

    const studentData = await getStudentDetailData(studentId);
    
    if (!studentData) {
      res.status(404).json({
        success: false,
        error: "Student not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: studentData,
    });
    return;
  } catch (error) {
    console.error("Error fetching student details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve student details",
    });
    return;
  }
});

// Start server
app
  .listen(PORT, () => {
    console.log("Server running at PORT:", PORT);
  })
  .on("error", (error) => {
    console.error("Server startup error:", error);
    process.exit(1);
  });
