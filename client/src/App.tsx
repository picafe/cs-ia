import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import "@mantine/dates/styles.css";
import { Loader } from "@mantine/core";
import { User } from "./types";
import { authClient } from "./lib/auth-client"; // import the auth client

function App() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>();
  async function fetchUser() {
    const session = await authClient.getSession();
    if (session) {
      setUser(session?.data?.user);
    } else {
      navigate("/login");
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <>
      <div
        id="shell"
        className="min-h-screen px-auto sm:px-8 lg:px-10 sm:mx-auto p-8 antialiased sm:max-w-2xl md:max-w-6xl overflow-hidden md:overflow-visible"
      >
        {/* <Navbar user={user} /> */}
        <main>
          {/* <Outlet context={user} /> */}
        </main>
      </div>
      <Footer />
    </>
  );
}

export default App;
