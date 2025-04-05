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

export async function getTeacherDashboardData(userId: number): Promise<any> {
  // Get teacher's classes
  const classes = await prisma.class.findMany({
    where: {
      TeacherUser: {
        userId,
      },
    },
    include: {
      students: {
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          activities: {
            include: {
              logs: true,
            },
          },
        },
      },
      dueDates: true,
    },
  });

  if (!classes || classes.length === 0) {
    return {
      classes: [],
    };
  }

  // Step 1: Update all students' status and totalHours first
  const updatePromises: Promise<any>[] = [];

  classes.forEach((cls) => {
    cls.students.forEach((student) => {
      // calculate total hours
      const totalHours = student.activities.reduce((sum, activity) => {
        return sum + activity.logs.reduce((logSum, log) => logSum + log.hours, 0);
      }, 0);

      // determine status based on due dates and progress
      let status = student.status;

      if (totalHours >= cls.dueDates[cls.dueDates.length - 1]?.requiredHours) {
        status = "COMPLETED";
      } else if (totalHours > 0) {
        // find next due date
        const nextDueDate = cls.dueDates
          .filter((dd) => new Date(dd.dueDate) > new Date())
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

        if (nextDueDate) {
          const daysUntilDue = Math.ceil(
            (new Date(nextDueDate.dueDate).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
          );
          const requiredHoursForDue = nextDueDate.requiredHours;

          if (totalHours >= requiredHoursForDue * 0.7) {
            status = "ON_TRACK";
          } else if (daysUntilDue < 14 && totalHours < requiredHoursForDue * 0.5) {
            status = "ALERT";
          } else if (totalHours < requiredHoursForDue * 0.3) {
            status = "CONCERN";
          }
        }
      }

      // add update operation to promises array
      updatePromises.push(
        prisma.studentUser.update({
          where: { id: student.id },
          data: { 
            totalHours,
            status 
          },
        })
      );
    });
  });

  await Promise.all(updatePromises);

  // Step 2: fetch updated student data
  const updatedClasses = await prisma.class.findMany({
    where: {
      TeacherUser: {
        userId,
      },
    },
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
      dueDates: true,
    },
  });

  // Step 3: transform data for dashboard using updated values
  const transformedClasses = await Promise.all(
    updatedClasses.map(async (cls) => {
      const studentsData = cls.students.map((student) => {
        return {
          id: student.id,
          name: student.user.name,
          email: student.user.email,
          status: student.status,
          totalHours: student.totalHours,
          requiredHours:
            cls.dueDates[cls.dueDates.length - 1]?.requiredHours || 0,
          progress: cls.dueDates[cls.dueDates.length - 1]?.requiredHours
            ? Math.min(
                100,
                Math.round(
                  (student.totalHours /
                    cls.dueDates[cls.dueDates.length - 1].requiredHours) *
                    100
                )
              )
            : 0,
        };
      });

      // class statistics
      const onTrackCount = studentsData.filter(
        (s) => s.status === "ON_TRACK" || s.status === "COMPLETED"
      ).length;
      const concernCount = studentsData.filter(
        (s) => s.status === "CONCERN"
      ).length;
      const alertCount = studentsData.filter(
        (s) => s.status === "ALERT"
      ).length;

      const avgProgress =
        studentsData.length > 0
          ? Math.round(
              studentsData.reduce((sum, student) => sum + student.progress, 0) / 
              studentsData.length
            )
          : 0;

      const dueDates = cls.dueDates
        .map((dd) => ({
          date: new Date(dd.dueDate).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          required: dd.requiredHours,
          completed: studentsData.filter(
            (s) => s.totalHours >= dd.requiredHours
          ).length,
        }))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

      return {
        id: cls.id,
        name: cls.name,
        courseCode: cls.courseCode,
        students: studentsData,
        totalStudents: studentsData.length,
        avgProgress,
        onTrackCount,
        concernCount,
        alertCount,
        dueDates,
      };
    })
  );

  return {
    classes: transformedClasses,
  };
}

// get detailed student data for student view
export async function getStudentDetailData(studentId: number): Promise<any> {
  const student = await prisma.studentUser.findUnique({
    where: { id: studentId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      class: {
        include: {
          dueDates: true,
        },
      },
      activities: {
        include: {
          logs: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!student) {
    return null;
  }

  const totalHours = student.activities.reduce((sum, activity) => {
    return sum + activity.logs.reduce((logSum, log) => logSum + log.hours, 0);
  }, 0);

  const activities = student.activities.map((activity) => {
    const activityHours = activity.logs.reduce(
      (sum, log) => sum + log.hours,
      0
    );

    return {
      id: activity.id,
      name: activity.name,
      description: activity.description,
      totalHours: activityHours,
      logs: activity.logs.map((log) => ({
        id: log.id,
        date: new Date(log.createdAt).toLocaleDateString(),
        hours: log.typingTime / 3600,
      })),
      createdAt: new Date(activity.createdAt).toLocaleDateString(),
    };
  });

  return {
    id: student.id,
    name: student.user.name,
    email: student.user.email,
    totalHours,
    status: student.status,
    className: student.class?.name,
    requiredHours:
      student.class?.dueDates[student.class.dueDates.length - 1]
        ?.requiredHours || 0,
    activities,
    createdAt: new Date(student.createdAt).toLocaleDateString(),
  };
}
