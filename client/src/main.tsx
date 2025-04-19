import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {
  ActionIcon,
  Card,
  colorsTuple,
  Container,
  createTheme,
  MantineColorsTuple,
  MantineProvider,
  MantineThemeOverride,
  Paper,
  rem,
  Select,
  Table,
  virtualColor,
} from "@mantine/core";
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
import EditClass from "./pages/EditClass.tsx";
import StudentDetailView from "./pages/StudentDetailView.tsx";

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
            path: "teacher/settings/*",
            element: <TeacherSettings />,
          },
          {
            path: "teacher/student/:studentId",
            element: <StudentDetailView />,
          },
          {
            path: "class/:id/edit",
            element: <EditClass />,
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

const dark: MantineColorsTuple = [
  "#f5f5ff", // plum12 (lightest)
  "#e796f3", // plum11
  "#92549c", // plum8
  "#734079", // plum7
  "#303060", // plum6
  "#512454", // plum5
  "#1a1a2e", // plum4
  "#0f0f1a", // plum3
  "#201320", // plum2
  "#181118", // plum1 (darkest)
];

const CONTAINER_SIZES: Record<string, string> = {
  xxs: rem("200px"),
  xs: rem("300px"),
  sm: rem("400px"),
  md: rem("500px"),
  lg: rem("600px"),
  xl: rem("1400px"),
  xxl: rem("1600px"),
};

export const theme: MantineThemeOverride = createTheme({
  white: "#f5f5ff",
  black: "#0f0f1a",
  defaultRadius: "md",
  fontFamily: "Inter, sans-serif",
  colors: {
    lightTable: colorsTuple("#f2f2fc"),
    darkTable: colorsTuple("#19192f"),
    table: virtualColor({
      name: "table",
      dark: "darkTable",
      light: "lightTable",
    }),
    // dark: dark,
  },
  primaryShade: { light: 5, dark: 5 },

  fontSizes: {
    xs: rem("12px"),
    sm: rem("14px"),
    md: rem("16px"),
    lg: rem("18px"),
    xl: rem("20px"),
    "2xl": rem("24px"),
    "3xl": rem("30px"),
    "4xl": rem("36px"),
    "5xl": rem("48px"),
  },
  spacing: {
    "3xs": rem("4px"),
    "2xs": rem("8px"),
    xs: rem("10px"),
    sm: rem("12px"),
    md: rem("16px"),
    lg: rem("20px"),
    xl: rem("24px"),
    "2xl": rem("28px"),
    "3xl": rem("32px"),
  },
  primaryColor: "grape",
  components: {
    /** Put your mantine component override here */
    Container: Container.extend({
      vars: (_, { size, fluid }) => ({
        root: {
          "--container-size": fluid
            ? "100%"
            : size !== undefined && size in CONTAINER_SIZES
            ? CONTAINER_SIZES[size]
            : rem(size),
        },
      }),
    }),
    Table: Table.extend({
      defaultProps: {
        striped: "even",
        stripedColor: "table",
        highlightOnHover: true,
        highlightOnHoverColor: "table",
      },
    }),
    ActionIcon: ActionIcon.extend({
      styles: (theme) => ({
        root: {
          backgroundColor: theme.colors.table[0],
        },
      }),
    }),

    Paper: Paper.extend({
      defaultProps: {
        p: "md",
        shadow: "xl",
        radius: "md",
        withBorder: true,
      },
    }),

    Card: Card.extend({
      defaultProps: {
        p: "xl",
        shadow: "xl",
        radius: "var(--mantine-radius-default)",
        withBorder: true,
      },
    }),
    Select: Select.extend({
      defaultProps: {
        checkIconPosition: "right",
      },
    }),
  },
  other: {
    style: "mantine",
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <RouterProvider router={router} />
    </MantineProvider>
  </React.StrictMode>,
);
