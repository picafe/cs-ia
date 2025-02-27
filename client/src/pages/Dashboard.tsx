import axios from "axios";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { User } from "../types";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const user: User = useOutletContext();

  useEffect(() => {
    // getClasses();
    console.log(user);
  });

  // const getClasses = async () => {
  //     setLoading(true);
  //     try {
  //         const res = await axios.get( serverUrl + "/user/classes", { withCredentials: true })

  //         console.log(res.data);
  //     } catch (error) {
  //         console.error(error);
  //     }
  // }
  return <div></div>;
}
