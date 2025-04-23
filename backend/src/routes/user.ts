// src/routes/user.ts
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";
import type { AppEnv } from "../index"; // Import Env type from server
import {
  getUserProfile,
  getNotificationPreferences,
  updateUserNotificationPreferences,
  getUserClasses,
} from "../lib/db";

const notificationSchema = z.object({
  browserNotifications: z.boolean(),
  emailNotifications: z.boolean(),
});

const userRoutes: Hono<AppEnv> = new Hono<AppEnv>()

  // Middleware to ensure user is logged in for all /user routes
  .use("/*", async (c, next) => {
    if (!c.var.user) {
      throw new HTTPException(401, { message: "Authentication required" });
    }
    await next();
  })

  // Get current user session info (name, role) - replaces /user/session
  .get("/session", async (c) => {
    const session = c.get("session");
    const user = c.get("user");

    if (!user) return c.body(null, 401);

    return c.json({
      session,
      user,
    });
  })

  // Get user's classes (student or teacher)
  .get("/classes", async (c) => {
    const user = c.var.user!;
    try {
      const classes = await getUserClasses(user.id, user.role);
      return c.json({ success: true, data: classes || [] }, 200);
    } catch (error) {
      console.error("Error fetching user classes:", error);
      throw new HTTPException(500, { message: "Failed to retrieve classes" });
    }
  })

  // Get user profile
  .get("/profile", async (c) => {
    const user = c.var.user!;
    try {
      const profile = await getUserProfile(user.id);
      if (!profile) {
        throw new HTTPException(404, { message: "Profile not found" });
      }
      return c.json({ success: true, data: profile }, 200);
    } catch (error: any) {
      console.error("Profile fetch error:", error);
      if (error instanceof HTTPException) throw error;
      throw new HTTPException(500, { message: "Failed to fetch profile" });
    }
  })

  // Get notification preferences
  .get("/notifications", async (c) => {
    const user = c.var.user!;
    try {
      const preferences = await getNotificationPreferences(user.id);
      return c.json({ success: true, data: preferences }, 200);
    } catch (error) {
      console.error("Notification settings fetch error:", error);
      throw new HTTPException(500, {
        message: "Failed to fetch notification settings",
      });
    }
  })

  // Update notification preferences
  .put("/notifications", zValidator("json", notificationSchema), async (c) => {
    const user = c.var.user!;
    const { browserNotifications, emailNotifications } = c.req.valid("json");
    try {
      await updateUserNotificationPreferences(
        user.id,
        browserNotifications,
        emailNotifications
      );
      return c.json(
        {
          success: true,
          data: { message: "Notification preferences updated successfully" },
        },
        200
      );
    } catch (error) {
      console.error("Notification preferences update error:", error);
      throw new HTTPException(500, {
        message: "Failed to update notification preferences",
      });
    }
  });

export default userRoutes;
