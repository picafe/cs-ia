import { prisma } from "../db";
import { hashPassword } from "./password";

export async function createUser(
  email: string,
  name: string,
  password: string,
): Promise<User> {
  const passwordHash = await hashPassword(password);
  const usr = await prisma.user.create({
    data: {
      email: email,
      name: name,
      password_hash: passwordHash,
    },
  });
  const user: User = {
    id: usr.id,
    name: usr.name,
    email: usr.email,
  };
  return user;
}

export async function updateUserPassword(
  userId: number,
  password: string,
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
  email: string,
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

export async function getUserFromEmail(email: string): Promise<User | null> {
  const usr = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (usr === null) {
    return null;
  }
  const user: User = {
    id: usr.id,
    email: usr.email,
    name: usr.name,
  };
  return user;
}

export interface User {
  id: number;
  email: string;
  name: string;
}
