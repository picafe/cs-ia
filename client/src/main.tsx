import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"
import { MantineProvider, createTheme } from '@mantine/core';
import App from './App.tsx'
import './index.css'
import '@mantine/core/styles.css';
import Test from './components/Test.tsx';
import ErrorPage from './pages/Error.tsx';
import Auth from './pages/Auth.tsx';
import ClassList from './pages/ClassList.tsx';



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
        path: 'classes',
        element: <ClassList/>,
      }

    ]
  },
  {
    path: "/login",
    element: <Auth />
  },
  {
    path: "/signup",
    element: <Auth />
  }
]);

const theme = createTheme({
  primaryColor: 'cyan',
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
     <MantineProvider theme={theme}>
       <RouterProvider router={router} />
     </MantineProvider>
  </React.StrictMode>,
)
