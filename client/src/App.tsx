import { Outlet, useNavigate, useOutletContext } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import type { User } from "./types";
import { useEffect, useState } from "react"; // Add useState
import { authClient } from "./lib/client";
import { Loader } from "@mantine/core";

function App() {
  const navigate = useNavigate();
  let user: User | null = null;

  // Use the session hook
  const {
    data: session,
    isPending: loading,
    error,
  } = authClient.useSession();

  if (loading) {
    return (
      <div className="flex justify-center align-middle min-h-screen px-auto sm:px-8 lg:px-10 sm:mx-auto p-8 antialiased sm:max-w-2xl md:max-w-6xl overflow-hidden md:overflow-visible">
        <Loader color="gray" type="bars" />
      </div>
    );
  }

  if (error) {
    console.error("Session fetch error:", error);
    window.alert("Session expired or invalid. Please log in again.");
  } else if (!loading && !session?.user) {
    navigate("/login");
  } else if (session) {
    user = session.user;
  }

  // Only render the main application when we have a user
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
