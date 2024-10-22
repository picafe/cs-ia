import { prisma } from "../db";
import { encodeHexLowerCase } from "@oslojs/encoding";
import { generateRandomOTP } from "./password";
import { sha256 } from "@oslojs/crypto/sha2";
import type { User } from "./user";
import { Request, Response } from "express";

// VERY SKETCHY, MUST TEST!!!!!!! (EVERY FUNCTION) (AND THE WHOLE FILE)
export function createPasswordResetSession(
  token: string,
  userId: number,
  email: string,
): PasswordResetSession {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: PasswordResetSession = {
    id: sessionId,
    userId,
    email,
    expiresAt: new Date(Date.now() + 1000 * 60 * 10),
    code: generateRandomOTP(),
    emailVerified: false,
  };
  prisma.passwordReset.create({
    data: {
      id: session.id,
      userId: session.userId,
      email: session.email,
      code: session.code,
      expiresAt: session.expiresAt,
      emailVerified: session.emailVerified,
    },
  });
  // db.execute("INSERT INTO password_reset_session (id, user_id, email, code, expires_at) VALUES (?, ?, ?, ?, ?)", [
  // 	session.id,
  // 	session.userId,
  // 	session.email,
  // 	session.code,
  // 	Math.floor(session.expiresAt.getTime() / 1000)
  // ]);
  return session;
}

export async function validatePasswordResetSessionToken(
  token: string,
): Promise<PasswordResetSessionValidationResult> {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const ses = await prisma.passwordReset.findUnique({
    where: {
      id: sessionId,
    },

    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  }).then((ses) => {
    if (!ses) {
      return { session: null, user: null };
    }

    const session: PasswordResetSession = {
      id: ses.id,
      userId: ses.user.id,
      email: ses.email,
      code: ses.code,
      expiresAt: ses.expiresAt,
      emailVerified: ses.emailVerified,
    };

    const user: User = {
      id: ses.user.id,
      email: ses.user.email,
      name: ses.user.name,
    };

    if (Date.now() >= session.expiresAt.getTime()) {
      return prisma.passwordReset.delete({
        where: {
          id: session.id,
        },
      }).then(() => ({ session: null, user: null }));
    }
    return { session, user };
  });
  return ses;
}

export async function setPasswordResetSessionAsEmailVerified(
  sessionId: string,
): Promise<void> {
  await prisma.passwordReset.update({
    where: {
      id: sessionId,
    },
    data: {
      emailVerified: true,
    },
  });
}

export async function invalidateUserPasswordResetSessions(
  userId: number,
): Promise<void> {
  await prisma.passwordReset.deleteMany({
    where: {
      userId: userId,
    },
  });
}

export async function validatePasswordResetSessionRequest(
  req: Request,
  res: Response,
): Promise<PasswordResetSessionValidationResult> {
  const token = req.cookies["password_reset_session"] ?? null;
  if (token === null) {
    return { session: null, user: null };
  }
  const result = validatePasswordResetSessionToken(token);
  if ((await result).session === null) {
    deletePasswordResetSessionTokenCookie(res);
  }
  return result;
}

export function setPasswordResetSessionTokenCookie(
  context: Response,
  token: string,
  expiresAt: Date,
): void {
  context.cookie("password_reset_session", token, {
    expires: expiresAt,
    sameSite: "lax",
    httpOnly: true,
    path: "/",
    secure: (process.env.NODE_ENV || "development") !== "development",
  });
}

export function deletePasswordResetSessionTokenCookie(context: Response): void {
  context.cookie("password_reset_session", "", {
    maxAge: 0,
    sameSite: "lax",
    httpOnly: true,
    path: "/",
    secure: (process.env.NODE_ENV || "development") !== "development",
  });
}

export function sendPasswordResetEmail(email: string, code: string): void {
  console.log(`To ${email}: Your reset code is ${code}`);
}

export interface PasswordResetSession {
  id: string;
  userId: number;
  email: string;
  expiresAt: Date;
  code: string;
  emailVerified: boolean;
}

export type PasswordResetSessionValidationResult =
  | { session: PasswordResetSession; user: User }
  | { session: null; user: null };
