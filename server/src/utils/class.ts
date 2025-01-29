import { Class } from "@prisma/client";
import { prisma } from "../db";
import { generateRandomString } from "@oslojs/crypto/random";
import type { RandomReader } from "@oslojs/crypto/random";

export async function createClass(params: Class): Promise<Class> {
  const random: RandomReader = {
    read(bytes) {
      crypto.getRandomValues(bytes);
    },
  };

  const alphabet = "abcdefghijklmnopqrstuvwxyz1234567890"
  const code = generateRandomString(random, alphabet, 6);
  console.log(params)


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
  classId: number;
}): Promise<void> {
  await prisma.studentUser.update({
    where: { userId: params.userId },
    data: {
      class: {
        connect: {
          id: params.classId,
        },
      },
    },
  });
}
