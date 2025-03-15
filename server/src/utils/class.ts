import { Class, StudentUser } from "@prisma/client";
import { prisma } from "../db";
import { generateRandomString } from "@oslojs/crypto/random";
import type { RandomReader } from "@oslojs/crypto/random";

type ClassQuery = {
  name: string;
  courseCode: string;
  description: string;
  endDate: Date;
  teacherId: number;
};

export async function createClass(params: ClassQuery): Promise<Class> {
  const random: RandomReader = {
    read(bytes) {
      crypto.getRandomValues(bytes);
    },
  };

  const alphabet = "abcdefghijklmnopqrstuvwxyz1234567890";
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
}): Promise<StudentUser> {
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

export async function getAllClasses(): Promise<Class[]> {
  return await prisma.class.findMany({
    include: {
      students: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      TeacherUser: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
}

export async function getClassById(id: number): Promise<Class | null> {
  const cls = await prisma.class.findUnique({
    where: { id },
    include: {
      students: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
      TeacherUser: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return cls || null;
}

export async function updateClass(
  id: number,
  data: Partial<ClassQuery>
): Promise<Class> {
  return await prisma.class.update({
    where: { id },
    data,
  });
}
