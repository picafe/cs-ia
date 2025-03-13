import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "@mantine/dates/styles.css";
import { Loader } from "@mantine/core";
import { User } from "./types";

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const response = await axios.get("http://localhost:3000/user/session", {
        withCredentials: true,
      });
      setUser(response.data.data.user);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        navigate("/login");
      } else {
        window.alert("An unexpected error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center align-middle min-h-screen px-auto sm:px-8 lg:px-10 sm:mx-auto p-8 antialiased sm:max-w-2xl md:max-w-6xl overflow-hidden md:overflow-visible">
        <Loader color="gray" type="bars" />
      </div>
    );
  }

  return (
    <>
      <div
        id="shell"
        className="min-h-screen px-auto sm:px-8 lg:px-10 sm:mx-auto p-8 antialiased sm:max-w-2xl md:max-w-6xl overflow-hidden md:overflow-visible"
      >
        <Navbar user={user} />
        <main>
          <Outlet context={user} />
        </main>
      </div>
      <Footer />
    </>
  );
}

export default App;
