import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import Steps from './components/Steps'
import Stats from './components/Stats'
import BookingFlow from './components/BookingFlow'
import Experience from './components/Experience'
import BookTrip from './components/BookTrip'
import Contact from './components/Contact'
import Footer from './components/Footer'
import AllTrips from './components/AllTrips'
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
      <BookingFlow />
      <Experience />
      <BookTrip />
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
        <Route path="/excursoes" element={<AllTrips />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="viagens" element={<Trips />} />
          <Route path="reservas" element={<Bookings />} />
          <Route path="configuracoes" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
