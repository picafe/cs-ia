// src/server.ts
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { HTTPException } from "hono/http-exception";

import { auth } from "./lib/auth";
import userRoutes from "./routes/user";
import classRoutes from "./routes/class";
import studentRoutes from "./routes/student";
import teacherRoutes from "./routes/teacher";

export type AppEnv = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
};

const app: Hono<AppEnv> = new Hono<AppEnv>()
  .basePath("/")
  .use("*", logger())
  .use("*", secureHeaders())
  .use(
    "/api/*",
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      allowHeaders: ["Content-Type", "Authorization"], // Ensure Authorization is allowed for better-auth
      allowMethods: ["POST", "GET", "OPTIONS", "PUT", "DELETE"], // Add PUT/DELETE
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      credentials: true,
    })
  )
  .use("*", async (c, next) => {
    // Use c.req.raw.headers for better-auth compatibility if needed, or just c.req.header()
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      c.set("user", null);
      c.set("session", null);
    } else {
      c.set("user", session.user);
      c.set("session", session.session);
    }
    await next();
  })
  .on(["POST", "GET"], "/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
  })
  .get("/", (c) => c.text("Server is running!"))

  // routes
  .route("/api/user", userRoutes)
  .route("/api/class", classRoutes)
  .route("/api/student", studentRoutes)
  .route("/api/teacher", teacherRoutes)

  .onError((err, c) => {
    console.error("Global Error:", err);
    if (err instanceof HTTPException) {
      // Use the response from HTTPException
      return err.getResponse();
    }
    // Default internal server error
    return c.json({ success: false, error: "Internal Server Error" }, 500);
  })

  // --- Not Found ---
  .notFound((c) => {
    return c.json({ success: false, error: "Not Found" }, 404);
  });

export type AppType = typeof app;

// --- Server Start ---
const port = parseInt(process.env.PORT || "3000", 10);
console.log(`Server running at http://localhost:${port}`);

export default {
  port: 3000,
  fetch: app.fetch,
};
