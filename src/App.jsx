import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import Steps from './components/Steps'
import Stats from './components/Stats'
import Experience from './components/Experience'
import Destinations from './components/Destinations'
import Reach from './components/Reach'
import Packages from './components/Packages'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Login from './admin/components/Login'
import AdminLayout from './admin/components/AdminLayout'
import Dashboard from './admin/components/Dashboard'
import Trips from './admin/components/Trips'
import Bookings from './admin/components/Bookings'
import Settings from './admin/components/Settings'

function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Steps />
      <Stats />
      <Destinations />
      <Experience />
      <Reach />
      <Packages />
      <Contact />
      <Footer />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projetos" element={<Trips />} />
          <Route path="contratos" element={<Bookings />} />
          <Route path="configuracoes" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
