// src/routes/student.ts
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import type { AppEnv } from "../index";
import { Role } from "@prisma/client";
import { joinClass } from "../lib/db";

const joinClassSchema = z.object({
  code: z.string().length(6, "Class code must be 6 characters"),
});

const studentRoutes: Hono<AppEnv> = new Hono<AppEnv>()

  // Middleware: Ensure user is logged in
  .use("/*", async (c, next) => {
    if (!c.var.user) {
      throw new HTTPException(401, { message: "Authentication required" });
    }
    await next();
  })

  // Student joins a class
  .post("/join-class", zValidator("json", joinClassSchema), async (c) => {
    const user = c.var.user!;
    if (user.role !== Role.STUDENT) {
      throw new HTTPException(403, {
        message: "Only students can join classes",
      });
    }
    const { code } = c.req.valid("json");

    try {
      const result = await joinClass(user.id, code);
      return c.json({ success: true, data: result }, 200);
    } catch (error: any) {
      console.error("Class join error:", error);
      if (error.message === "Student already in a class") {
        throw new HTTPException(400, { message: error.message });
      }
      // Handle class not found error from prisma potentially
      if (error.code === "P2025") {
        // Example Prisma error code for record not found
        throw new HTTPException(404, { message: "Invalid class code" });
      }
      throw new HTTPException(500, { message: "Failed to join class" });
    }
  });

// Get student details (viewed by Teacher) - Moved from /user/student/:id/details
// This route logically fits better under a teacher's scope, see teacher.ts
// If students need to view their own details, create a separate route here.

// --- Add other student-specific routes if needed ---
// e.g., GET /student/dashboard, GET /student/activities

export default studentRoutes;
