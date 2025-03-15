type User = {
  name: string;
  id: number;
  email: string;
  password_hash: string;
  role: Role;
};

enum Role {
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
}

enum UserStatus {
  NOT_STARTED = "NOT_STARTED",
  ON_TRACK = "ON_TRACK",
  CONCERN = "CONCERN",
  ALERT = "ALERT",
  COMPLETED = "COMPLETED",
}

interface DueDate {
  id: number;
  classId: number;
  dueDate: Date;
  requiredHours: number;
}

interface ClassDetails {
  id: number;
  name: string;
  courseCode: string;
  description: string;
  code: string;
  teacherId: number;
  endDate: Date | null;
  students: Array<{
    id: number;
    status: UserStatus;
    totalHours: number;

    user: {
      name: string;
      email: string;
    };
  }>;
  TeacherUser: {
    user: {
      name: string;
      email: string;
    };
  };
  dueDates: DueDate[];
}

export type { Role, User, ClassDetails, UserStatus, DueDate };
