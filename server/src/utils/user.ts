import { Class, Role, StudentUser, User, UserStatus } from "@prisma/client";
import { prisma } from "../db";
import { hashPassword } from "./password";

export async function createUser(
  email: string,
  name: string,
  password: string,
  role: Role
): Promise<UserBInfo> {
  const passwordHash = await hashPassword(password);
  let usr: UserBInfo | null = null;
  if (role === "STUDENT") {
    usr = await prisma.user.create({
      data: {
        email: email,
        name: name,
        password_hash: passwordHash,
        role: role,
        student: {
          create: {
            
          }
        }
      },
    });
  } else if (role === "TEACHER") {
    usr = await prisma.user.create({
      data: {
        email: email,
        name: name,
        password_hash: passwordHash,
        role: role,
        teacher: {
          create: {
            
          }
        }
      },
    });
  }
  if (!usr) {
    throw new Error("User creation failed");
  }
  const user: UserBInfo = {
    id: usr.id,
    name: usr.name,
    email: usr.email,
  };
  return user;
}

export async function updateUserPassword(
  userId: number,
  password: string
): Promise<void> {
  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: userId },
    data: {
      password_hash: passwordHash,
    },
  });
}

export async function updateUserEmailAndSetEmailAsVerified(
  userId: number,
  email: string
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      email: email,
    },
  });
}

export function verifyNameInput(name: string): boolean {
  return name.length > 2 && name.length < 256;
}

export async function getUserPasswordHash(userId: number): Promise<string> {
  const usr = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (usr === null) {
    throw new Error("Invalid user ID");
  }
  return usr.password_hash;
}

export async function getUserFromEmail(email: string): Promise<UserBInfo | null> {
  const usr = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (usr === null) {
    return null;
  }
  const user: UserBInfo = {
    id: usr.id,
    email: usr.email,
    name: usr.name,
  };
  return user;
}

export async function getUserClasses(userId: number): Promise<Class | null> {
  const userClass = await prisma.studentUser.findUnique({
    where: { userId: userId },
    include: { class: true },
  });
  return userClass?.class || null;
}

export async function getUserType(userId: number): Promise<Role | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  return user?.role || null;
}

export interface UserBInfo {
  id: number;
  email: string;
  name: string;
}

export async function getStudentUserById(id: number): Promise<StudentUser | null> {
  const user = await prisma.studentUser.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  return user;
}

export async function editStudentUser(
  id: number,
  data: Partial<StudentUser>
): Promise<void> {
  await prisma.studentUser.update({
    where: { id },
    data,
  });
}