import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { createTheme, MantineProvider } from "@mantine/core";
import App from "./App.tsx";
import "./index.css";
import "@mantine/core/styles.css";
import Test from "./components/Test.tsx";
import ErrorPage from "./pages/Error.tsx";
import Auth from "./pages/Auth.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import JoinClass from "./pages/JoinClass.tsx";
import CreateClass from "./pages/CreateClass.tsx";
import UserSettings from "./pages/UserSettings.tsx";
import BaseApp from "./BaseApp.tsx";
import TeacherSettings from "./pages/TeacherSettings.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,

    children: [
      {
        path: "test",
        element: <Test />,
      },
      {
        path: "/",
        element: <Dashboard />,
        children: [
          {
            path: "teacher/settings",
            element: <TeacherSettings />,
          },
        ],
      },

      {
        path: "class/new",
        element: <CreateClass />,
      },
    ],
  },
  {
    path: "/login",
    element: <Auth />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/signup",
    element: <Auth />,
    errorElement: <ErrorPage />,
  },
  {
    element: <BaseApp />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/class/join",
        element: <JoinClass />,
      },
      {
        path: "/settings",
        element: <UserSettings />,
      },
    ],
  },
]);

const theme = createTheme({
  white: "#f5f5f5",
  primaryColor: "cyan",
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <RouterProvider router={router} />
    </MantineProvider>
  </React.StrictMode>,
);
