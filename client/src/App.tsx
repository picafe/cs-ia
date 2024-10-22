import { Outlet, useNavigate } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import axios from 'axios'
import { useEffect } from 'react'

function App() {
  const navigate = useNavigate();
  const fetchSession = () => {
    axios.get("http://localhost:3000/user/session", { withCredentials: true })
      .catch(err => {
        if (err.response.status === 401) navigate('/login');
        else {
          window.alert("An unexpected error occurred. Please try again later.")
        }
      });
  }

  useEffect(() => {
    fetchSession();
  }, []);
  return (
    <>
      <div className='min-h-screen px-auto sm:px-8 lg:px-10 sm:mx-auto p-8 antialiased sm:max-w-2xl md:max-w-6xl overflow-hidden md:overflow-visible'>
        <Navbar />
        <main>
          <Outlet />
        </main>
      </div>
      <Footer />
    </>

  )
}

export default App;
