// src/routes/class.ts
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import type { AppEnv } from "../index";
import { Role } from "@prisma/client";
import {
  createClass,
  getClassById,
  updateClass,
  getAllClasses,
} from "../lib/db";

// Schemas
const classCreateSchema = z.object({
  name: z.string().min(1, "Class name is required").max(255),
  courseCode: z.string().max(20).optional(),
  description: z.string().max(500).optional(),
  endDate: z.coerce.date().optional(), // coerce transforms input to Date
});

const classUpdateSchema = classCreateSchema.partial().extend({
  name: z.string().min(1, "Class name is required").max(255).optional(), // Name is optional on update but must be valid if provided
});

const classRoutes: Hono<AppEnv> = new Hono<AppEnv>()
  .use("/*", async (c, next) => {
    const user = c.var.user;
    if (!user) {
      throw new HTTPException(401, { message: "Authentication required" });
    }
    if (user.role !== Role.TEACHER) {
      throw new HTTPException(403, {
        message: "Only teachers can manage classes",
      });
    }
    await next();
  })
  // Get all classes (for the logged-in teacher)
  .get("/", async (c) => {
    const user = c.var.user!;
    try {
      const classes = await getAllClasses(user.id);
      return c.json({ success: true, data: classes || [] }, 200);
    } catch (error) {
      console.error("Error fetching teacher's classes:", error);
      throw new HTTPException(500, { message: "Failed to retrieve classes" });
    }
  })
  // Create a new class
  .post("/create", zValidator("json", classCreateSchema), async (c) => {
    const user = c.var.user!;
    const data = c.req.valid("json");
    try {
      const newClass = await createClass({
        ...data,
        teacherUserId: user.id,
      });
      return c.json({ success: true, data: newClass }, 201); // 201 Created
    } catch (error) {
      console.error("Class creation error:", error);
      throw new HTTPException(500, { message: "Failed to create class" });
    }
  })
  // Get a specific class by ID
  .get("/:id{[0-9]+}", async (c) => {
    const user = c.var.user!;
    const id = parseInt(c.req.param("id"), 10);
    try {
      const classData = await getClassById(id, user.id, user.role);
      if (!classData) {
        throw new HTTPException(404, { message: "Class not found or not authorized" });
      }
      return c.json({ success: true, data: classData }, 200);
    } catch (error: any) {
      console.error("Get class by ID error:", error);
      if (error instanceof HTTPException) throw error;
      throw new HTTPException(500, { message: "Server error" });
    }
  })
  // Update a class
  .put("/:id{[0-9]+}", zValidator("json", classUpdateSchema), async (c) => {
    const id = parseInt(c.req.param("id"), 10);
    const data = c.req.valid("json");

    try {
      const updatedClass = await updateClass(id, data);
      if (!updatedClass) {
        throw new HTTPException(404, { message: "Class not found or not authorized to update" });
      }
      return c.json({ success: true, data: updatedClass }, 200);
    } catch (error: any) {
      console.error("Class update error:", error);
      if (error instanceof HTTPException) throw error;
      throw new HTTPException(500, { message: "Failed to update class" });
    }
  });

// Export the classApp router to be mounted in the main application
export default classRoutes;
