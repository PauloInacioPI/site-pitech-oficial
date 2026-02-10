import Header from './Header'
import BookingFlow from './BookingFlow'
import Footer from './Footer'

export default function AllTrips() {
  return (
    <>
      <Header />
      <div style={{ paddingTop: '80px' }}>
        <BookingFlow showAll />
      </div>
      <Footer />
    </>
  )
}
