import { useOutletContext } from "react-router-dom";
import { User } from "../types";
import TeacherDashboard from "../components/TeacherDashboard";
import StudentDashBoard from "../components/StudentDashboard";

export default function Dashboard() {
  const user: User = useOutletContext();

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
