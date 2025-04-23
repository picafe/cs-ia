import { useOutletContext } from "react-router-dom";
import TeacherDashboard from "../components/TeacherDashboard";
import StudentDashBoard from "../components/StudentDashboard";
import { User } from "better-auth/types";

export default function Dashboard() {
  const user: User = useOutletContext();
  console.log("User in Dashboard:", user);

  return (
    <>
      {user.role === "TEACHER"
        ? (
          <>
            <TeacherDashboard />
          </>
        )
        : (
          <>
            <StudentDashBoard />
          </>
        )}
    </>
  );
}
