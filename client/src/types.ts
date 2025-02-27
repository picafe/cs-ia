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

export type { User, Role };