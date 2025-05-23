// THIS FILE IS CHATGPT GENERATED
import { PrismaClient, Role } from "../node_modules/.prisma/client";
import { hash } from "@node-rs/argon2";

const prisma = new PrismaClient();

async function main() {
  // Create teacher users
  const teacherPassword = await hash("!Teacher123", {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  const teacher1 = await prisma.user.create({
    data: {
      email: "tea.cher@tdsb.on.ca",
      name: "John Teacher",
      password_hash: teacherPassword,
      role: Role.TEACHER,
      teacher: {
        create: {},
      },
  
    },
    include: {
      teacher: true,
    },
  });

  // Create multiple student users
  const studentPassword = await hash("!Student123", {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: "student.1@student.tdsb.on.ca",
        name: "Alice Student",
        password_hash: studentPassword,
        role: Role.STUDENT,
        student: {
          create: {
            totalHours: 0,
          },
        },
      },
      include: { student: true },
    }),
    prisma.user.create({
      data: {
        email: "student.2@student.tdsb.on.ca",
        name: "Bob Student",
        password_hash: studentPassword,
        role: Role.STUDENT,
        student: {
          create: {
            totalHours: 0,
          },
        },
      },
      include: { student: true },
    }),
    prisma.user.create({
      data: {
        email: "student.3@student.tdsb.on.ca",
        name: "Carol Student",
        password_hash: studentPassword,
        role: Role.STUDENT,
        student: {
          create: {
            totalHours: 0,
          },
        },
      },
      include: { student: true },
    }),
  ]);

  // Create classes with unique codes
  const classes = await Promise.all([
    prisma.class.create({
      data: {
        name: "Computer Science HL",
        courseCode: "CSHL1",
        description: "IB Computer Science Higher Level",
        code: "cs2024",
        teacherId: teacher1.id,
        endDate: new Date("2024-12-31"),
        dueDates: {
          create: [
            {
              dueDate: new Date("2025-06-30"),
              requiredHours: 10,
            },
            {
              dueDate: new Date("2025-04-31"),
              requiredHours: 20,
            },
          ],
        },
      },
    }),
    prisma.class.create({
      data: {
        name: "Advanced Programming",
        courseCode: "AP101",
        description: "Advanced Programming Concepts",
        code: "ap2024",
        teacherId: teacher1.id,
        endDate: new Date("2024-12-31"),
        dueDates: {
          create: [
            {
              dueDate: new Date("2025-07-31"),
              requiredHours: 15,
            },
          ],
        },
      },
    }),
  ]);

  // Add students to classes
  await Promise.all(
    students.map((student, index) =>
      prisma.studentUser.update({
        where: {
          id: student.student!.id,
        },
        data: {
          class: {
            connect: {
              id: classes[index % 2].id, // Alternately assign students to classes
            },
          },
        },
      })
    )
  );

  // Create more activities and logs
  const activities = [
    {
      name: "Programming Practice",
      description: "Working on Python exercises",
      userId: students[0].student!.id,
      logs: [
        { hours: 1.0, date: "2024-03-01" },
        { hours: 1.5, date: "2024-03-05" },
      ],
    },
    {
      name: "Database Design",
      description: "Designing SQL databases",
      userId: students[0].student!.id,
      logs: [{ hours: 2.0, date: "2024-03-10" }],
    },
    {
      name: "Web Development",
      description: "Building a personal website",
      userId: students[1].student!.id,
      logs: [
        { hours: 3.0, date: "2024-03-02" },
        { hours: 2.0, date: "2024-03-08" },
      ],
    },
    {
      name: "Algorithm Study",
      description: "Sorting and searching algorithms",
      userId: students[2].student!.id,
      logs: [
        { hours: 1.0, date: "2024-03-05" },
        { hours: 0.5, date: "2024-03-07" },
      ],
    },
  ];

  // Create activities and logs
  for (const activity of activities) {
    const createdActivity = await prisma.activity.create({
      data: {
        name: activity.name,
        description: activity.description,
        userId: activity.userId
      },
    });

    // Create logs for the activity
    for (const log of activity.logs) {
      await prisma.log.create({
        data: {
          userId: activity.userId,
          activityId: createdActivity.id,
          typingTime: 3600,
          hours: log.hours,
          createdAt: new Date(log.date),
          updatedAt: new Date(log.date),
        } as any,
      });
    }
  }

  // Update student statuses
  await prisma.studentUser.update({
    where: { id: students[0].student!.id },
    data: { status: "ON_TRACK" },
  });

  await prisma.studentUser.update({
    where: { id: students[1].student!.id },
    data: { status: "ON_TRACK" },
  });

  await prisma.studentUser.update({
    where: { id: students[2].student!.id },
    data: { status: "CONCERN" },
  });

  console.log("Database seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    //@ts-ignore
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
