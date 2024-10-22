import { prisma } from "../db";

export function verifyEmailInput(email: string): boolean {
  return /^\S+\.+\S+@(student\.)?tdsb\.on\.ca+$/.test(email) &&
    email.length < 256;
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
  const row = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  return row === null;
}
