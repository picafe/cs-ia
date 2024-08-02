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



const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "test",
        element: <Test />,
      }
    ]
  },
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
