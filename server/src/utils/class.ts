import { Class } from "@prisma/client";
import { prisma } from "../db";
import { generateRandomString } from "@oslojs/crypto/random";
import type { RandomReader } from "@oslojs/crypto/random";

type ClassQuery = {
  name: string;
  courseCode: string;
  description: string;
  endDate: Date;
  teacherId: number;
}

export async function createClass(params: ClassQuery): Promise<Class> {
  const random: RandomReader = {
    read(bytes) {
      crypto.getRandomValues(bytes);
    },
  };

  const alphabet = "abcdefghijklmnopqrstuvwxyz1234567890"
  const code = generateRandomString(random, alphabet, 6);

  const cls = await prisma.class.create({
    data: {
      name: params.name,
      courseCode: params.courseCode,
      description: params.description,
      endDate: params.endDate,
      teacherId: params.teacherId,
      code: code,
    },
  });
  return cls;
}

export async function joinClass(params: {
  userId: number;
  classCode: string;
}): Promise<any> {
  const res = await prisma.studentUser.update({
    where: { userId: params.userId },
    data: {
      class: {
        connect: {
          code: params.classCode,
        },
      },
    },
  });
  return res;
}
