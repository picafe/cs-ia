import { Loader } from "@mantine/core";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { authClient } from "./lib/client"; // Import authClient
import type { InferResponseType } from "hono/client";
import type { User } from "better-auth/types";
function BaseApp() {
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

  return (
    <>
      <div
        id="shell"
        className="min-h-screen overflow-hidden md:overflow-visible"
      >
        {user ? <Outlet context={user} /> : null /* Or handle no user case */}
      </div>
    </>
  );
}

export default BaseApp;
