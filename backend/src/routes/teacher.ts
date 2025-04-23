// src/routes/teacher.ts
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import type { AppEnv } from "../index";
import { Role, UserStatus } from "@prisma/client";
import {
  getTeacherDashboardData,
  getStudentDetailData,
  editStudentUser, // Assuming this helper exists and is updated
  getStudentUserById, // Assuming this helper exists and is updated
} from "../lib/db";

// Schema for updating student status/hours by teacher
const studentUpdateSchema = z.object({
  status: z.nativeEnum(UserStatus).optional(),
  totalHours: z.number().min(0).optional(),
});

const teacherRoutes: Hono<AppEnv> = new Hono<AppEnv>()
  // Middleware: Ensure user is logged in and is a TEACHER
  .use("/*", async (c, next) => {
    const user = c.var.user;
    if (!user) {
      throw new HTTPException(401, { message: "Authentication required" });
    }
    if (user.role !== Role.TEACHER) {
      throw new HTTPException(403, {
        message: "Only teachers can access this section",
      });
    }
    await next();
  })
  // Get teacher dashboard data

  .get("/dashboard", async (c) => {
    const user = c.var.user!;
    try {
      const dashboardData = await getTeacherDashboardData(user.id); // Ensure this helper is updated
      return c.json({ success: true, data: dashboardData }, 200);
    } catch (error) {
      console.error("Error fetching teacher dashboard data:", error);
      throw new HTTPException(500, {
        message: "Failed to retrieve dashboard data",
      });
    }
  })
  // Get detailed view of a specific student (replaces /student/:id/details)
  .get("/student/:studentId/details", async (c) => {
    const user = c.var.user!;
    const studentId = parseInt(c.req.param("studentId"), 10);

    if (isNaN(studentId)) {
      throw new HTTPException(400, { message: "Invalid student ID format" });
    }

    try {
      const studentData = await getStudentDetailData(studentId);
      if (!studentData) {
        throw new HTTPException(404, { message: "Student not found" });
      }
      // Add auth check result here
      // if (!isAuthorized) throw new HTTPException(403, { message: "Forbidden" });

      return c.json({ success: true, data: studentData }, 200);
    } catch (error: any) {
      console.error("Error fetching student details:", error);
      if (error instanceof HTTPException) throw error;
      throw new HTTPException(500, {
        message: "Failed to retrieve student details",
      });
    }
  })
  // Get basic student info (replaces GET /user/student/:id) - Less common if details view exists
  .get("/student/:studentId", async (c) => {
    const user = c.var.user!;
    const studentId = parseInt(c.req.param("studentId"), 10);

    if (isNaN(studentId)) {
      throw new HTTPException(400, { message: "Invalid student ID format" });
    }

    try {
      // TODO: Add authorization check: Does this teacher teach this student?
      const student = await getStudentUserById(studentId);
      if (!student) {
        throw new HTTPException(404, { message: "Student not found" });
      }
      // Add auth check result here

      return c.json({ success: true, data: student }, 200);
    } catch (error: any) {
      console.error("Error fetching student:", error);
      if (error instanceof HTTPException) throw error;
      throw new HTTPException(500, { message: "Server error" });
    }
  })
  // Update student details (status, hours) by teacher (replaces POST /user/student/:id)
  .put(
    "/student/:studentId",
    zValidator("json", studentUpdateSchema),
    async (c) => {
      const user = c.var.user!;
      const studentId = parseInt(c.req.param("studentId"), 10);

      if (isNaN(studentId)) {
        throw new HTTPException(400, { message: "Invalid student ID format" });
      }

      const data = c.req.valid("json");

      if (Object.keys(data).length === 0) {
        throw new HTTPException(400, { message: "No update data provided" });
      }

      try {
        await editStudentUser(studentId, data);

        // Fetch the updated student data to return in response
        const updatedStudent = await getStudentUserById(studentId);
        if (!updatedStudent) {
          throw new HTTPException(404, {
            message: "Student not found after update",
          });
        }
        // Add auth check result here

        return c.json({ success: true, data: updatedStudent }, 200);
      } catch (error: any) {
        console.error("Error updating student:", error);
        if (error instanceof HTTPException) throw error;
        throw new HTTPException(500, { message: "Server error" });
      }
    }
  );

export default teacherRoutes;
