import { Outlet } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

function App() {

  return (
    <>
      <div className="w-full h-full">
        
        <div className='px-auto sm:px-8 lg:px-10 sm:mx-auto mb-10 antialiased sm:max-w-2xl md:max-w-6xl overflow-hidden md:overflow-visible'>
        <Navbar />
          <Outlet />
        </div>
        <Footer />
      </div>
    </>
  )
}

export default App
