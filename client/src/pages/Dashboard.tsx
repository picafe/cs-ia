import { useOutletContext } from "react-router-dom";
import { User } from "../types";
import TeacherDashboard from "../components/TeacherDashboard";
import StudentDashBoard from "../components/StudentDashboard";

export default function Dashboard() {
  const user: User = useOutletContext();

  // const getClasses = async () => {
  //     setLoading(true);
  //     try {
  //         const res = await axios.get( serverUrl + "/user/classes", { withCredentials: true })

  //         console.log(res.data);
  //     } catch (error) {
  //         console.error(error);
  //     }
  // }
  return (
    <>
      {user.role === "TEACHER" ? <TeacherDashboard /> : <StudentDashBoard />}
    </>
  );
}
