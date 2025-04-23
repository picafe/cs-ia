import { PrismaClient, Role, UserStatus, Class } from "@prisma/client";

export const prisma = new PrismaClient();

export async function getUserClasses(
  userId: string,
  role: Role,
): Promise<Class[]> {
  if (role === Role.STUDENT) {
    const studentUser = await prisma.studentUser.findUnique({
      where: { userId },
      include: { class: true },
    });
    return studentUser?.class ? [studentUser.class] : [];
  } else if (role === Role.TEACHER) {
    return prisma.class.findMany({
      where: { teacher: { userId } },
    });
  }
  return [];
}

export async function getUserProfile(
  userId: string,
): Promise<{ email: string; name: string } | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, name: true },
  });
}

export async function getNotificationPreferences(
  userId: string,
): Promise<{ browserNotifications: boolean; emailNotifications: boolean }> {
  const prefs = await prisma.user.findUnique({
    where: { id: userId },
    select: { browserNotifications: true, emailNotifications: true },
  });
  // Return defaults if not found, though the schema has defaults
  return prefs || { browserNotifications: false, emailNotifications: false };
}

export async function updateUserNotificationPreferences(
  userId: string,
  browserNotifications: boolean,
  emailNotifications: boolean,
) {
  await prisma.user.update({
    where: { id: userId },
    data: { browserNotifications, emailNotifications },
  });
}

export async function deleteUserAndRelatedData(userId: string) {
  // This needs careful implementation based on cascade rules or manual deletion
  // better-auth might offer account deletion APIs
  console.warn("User deletion logic needs verification with better-auth setup");
  // Example: Delete sessions first (better-auth might handle this)
  await prisma.session.deleteMany({ where: { userId } });
  // Delete accounts (better-auth might handle this)
  await prisma.account.deleteMany({ where: { userId } });
  // Delete student/teacher specific data
  await prisma.studentUser.deleteMany({ where: { userId } });
  await prisma.teacherUser.deleteMany({ where: { userId } });
  // Finally delete user
  await prisma.user.delete({ where: { id: userId } });
}

export async function getClassById(
  classId: number,
  requestingUserId: string,
  requestingUserRole: Role,
): Promise<Class | null> {
  const cls = await prisma.class.findUnique({
    where: { id: classId },
    include: {
      students: { include: { user: { select: { name: true, email: true } } } },
      teacher: { include: { user: { select: { name: true, email: true } } } },
    },
  });

  // Authorization check: Only the teacher of the class or an admin (if applicable) should view details
  if (!cls) return null;
  if (
    requestingUserRole === Role.TEACHER &&
    cls.teacher?.userId === requestingUserId
  ) {
    return cls;
  }
  // Add student access check if students should see their own class details
  // if (requestingUserRole === Role.STUDENT && cls.students.some(s => s.userId === requestingUserId)) {
  //   return cls; // Or a subset of data
  // }
  return null; // Not authorized or class doesn't exist
}

// --- Add ALL other necessary helper functions (createClass, joinClass, updateClass, etc.) ---
// --- Remember to adapt them for the NEW SCHEMA (String IDs, relations) ---

// Example placeholder for createClass
export async function createClass(data: {
  name: string;
  courseCode?: string;
  description?: string;
  endDate?: Date;
  teacherUserId: string; // Use the string ID
}): Promise<Class> {
  const alphabet = "abcdefghijklmnopqrstuvwxyz1234567890";
  const code = generateRandomString(6, alphabet); // Assuming generateRandomString exists

  return prisma.class.create({
    data: {
      name: data.name,
      courseCode: data.courseCode,
      description: data.description,
      endDate: data.endDate,
      code: code,
      teacher: {
        connect: { userId: data.teacherUserId },
      },
    },
  });
}

// Example placeholder for joinClass
export async function joinClass(userId: string, classCode: string) {
  // Check if user is already in a class?
  const existingStudent = await prisma.studentUser.findUnique({
    where: { userId },
  });
  if (!existingStudent) {
    throw new Error("Student profile not found"); // Or create one if needed
  }
  if (existingStudent.classId) {
    throw new Error("Student already in a class");
  }

  return prisma.studentUser.update({
    where: { userId },
    data: {
      class: {
        connect: { code: classCode },
      },
    },
  });
}

export async function updateClass(
  classId: number,
  data: Partial<{
    name: string;
    courseCode: string;
    description: string;
    endDate: Date;
  }>
): Promise<Class> {
  return prisma.class.update({
    where: { id: classId },
    data,
  });
}

export async function getAllClasses(teacherUserId: string): Promise<Class[]> {
  return prisma.class.findMany({
    where: {
      teacher: {
        userId: teacherUserId,
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
      teacher: {
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
}

export async function getTeacherDashboardData(teacherUserId: string): Promise<any> {
  // Get teacher's classes
  const classes = await prisma.class.findMany({
    where: {
      teacher: {
        userId: teacherUserId,
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
    return { classes: [] };
  }

  // Step 1: Update all students' status and totalHours first
  const updatePromises: Promise<any>[] = [];

  classes.forEach((cls) => {
    cls.students.forEach((student) => {
      // Calculate total hours
      const totalHours = student.activities.reduce((sum, activity) => {
        return sum + activity.logs.reduce((logSum, log) => logSum + log.hours, 0);
      }, 0);

      // Determine status based on due dates and progress
      let status = student.status;

      if (totalHours >= (cls.dueDates[cls.dueDates.length - 1]?.requiredHours || 0)) {
        status = UserStatus.COMPLETED;
      } else if (totalHours > 0) {
        // Find next due date
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
            status = UserStatus.ON_TRACK;
          } else if (daysUntilDue < 14 && totalHours < requiredHoursForDue * 0.5) {
            status = UserStatus.ALERT;
          } else if (totalHours < requiredHoursForDue * 0.3) {
            status = UserStatus.CONCERN;
          }
        }
      }

      // Add update operation to promises array
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

  // Step 2: Fetch updated student data
  const updatedClasses = await prisma.class.findMany({
    where: {
      teacher: {
        userId: teacherUserId,
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

  // Step 3: Transform data for dashboard using updated values
  const transformedClasses = await Promise.all(
    updatedClasses.map(async (cls) => {
      const studentsData = cls.students.map((student) => {
        return {
          id: student.id,
          name: student.user.name,
          email: student.user.email,
          status: student.status,
          totalHours: student.totalHours,
          requiredHours: cls.dueDates[cls.dueDates.length - 1]?.requiredHours || 0,
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

      // Class statistics
      const onTrackCount = studentsData.filter(
        (s) => s.status === UserStatus.ON_TRACK || s.status === UserStatus.COMPLETED
      ).length;
      const concernCount = studentsData.filter(
        (s) => s.status === UserStatus.CONCERN
      ).length;
      const alertCount = studentsData.filter(
        (s) => s.status === UserStatus.ALERT
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
        hours: log.hours,
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

export async function editStudentUser(
  studentId: number,
  data: Partial<{
    status: UserStatus;
    totalHours: number;
  }>
): Promise<void> {
  await prisma.studentUser.update({
    where: { id: studentId },
    data,
  });
}

export async function getStudentUserById(studentId: number): Promise<any> {
  return prisma.studentUser.findUnique({
    where: { id: studentId },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}

// Helper function for generating random strings (used in createClass)
function generateRandomString(length: number, alphabet: string): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }
  return result;
}
