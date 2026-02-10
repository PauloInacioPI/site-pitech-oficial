import { Router } from 'express'
import pool from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

router.get('/stats', async (req, res) => {
  try {
    const [[trips]] = await pool.query('SELECT COUNT(*) as total FROM trips')
    const [[activeTrips]] = await pool.query('SELECT COUNT(*) as total FROM trips WHERE is_active = 1')
    const [[bookings]] = await pool.query('SELECT COUNT(*) as total FROM bookings')
    const [[confirmedBookings]] = await pool.query("SELECT COUNT(*) as total FROM bookings WHERE status = 'confirmado'")
    const [[revenue]] = await pool.query("SELECT COALESCE(SUM(total_price), 0) as total FROM bookings WHERE status != 'cancelado'")
    const [[paidRevenue]] = await pool.query("SELECT COALESCE(SUM(total_price), 0) as total FROM bookings WHERE status != 'cancelado' AND payment_status = 'pago'")
    const [[totalSeats]] = await pool.query('SELECT COUNT(*) as total FROM seats')
    const [[availableSeats]] = await pool.query("SELECT COUNT(*) as total FROM seats WHERE status = 'disponivel'")
    const [[passengers]] = await pool.query('SELECT COUNT(*) as total FROM booking_passengers')

    const [[openRevenue]] = await pool.query(`
      SELECT COALESCE(SUM(b.total_price), 0) as total
      FROM bookings b
      INNER JOIN trips t ON b.trip_id = t.id
      WHERE b.status != 'cancelado' AND t.departure_date >= CURDATE()
    `)
    const [[openPaidRevenue]] = await pool.query(`
      SELECT COALESCE(SUM(b.total_price), 0) as total
      FROM bookings b
      INNER JOIN trips t ON b.trip_id = t.id
      WHERE b.payment_status = 'pago' AND b.status != 'cancelado' AND t.departure_date >= CURDATE()
    `)

    res.json({
      trips: { total: trips.total, active: activeTrips.total },
      bookings: { total: bookings.total, confirmed: confirmedBookings.total },
      revenue: { total: revenue.total, paid: paidRevenue.total, pending: revenue.total - paidRevenue.total },
      seats: { total: totalSeats.total, available: availableSeats.total },
      passengers: passengers.total,
      openExcursions: { total: openRevenue.total, paid: openPaidRevenue.total },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/revenue-by-trip', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        t.id, t.title, t.destination, t.departure_date, t.price,
        COALESCE(SUM(CASE WHEN b.status != 'cancelado' THEN b.total_price ELSE 0 END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN b.payment_status = 'pago' AND b.status != 'cancelado' THEN b.total_price ELSE 0 END), 0) as paid_revenue,
        COUNT(CASE WHEN b.status != 'cancelado' THEN b.id END) as booking_count,
        (SELECT COUNT(*) FROM booking_passengers bp
         INNER JOIN bookings b2 ON bp.booking_id = b2.id
         WHERE b2.trip_id = t.id AND b2.status != 'cancelado') as passenger_count,
        (SELECT COUNT(*) FROM seats s WHERE s.trip_id = t.id) as total_seats
      FROM trips t
      LEFT JOIN bookings b ON b.trip_id = t.id
      WHERE t.is_active = 1
      GROUP BY t.id
      ORDER BY t.departure_date ASC
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/recent-bookings', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.*, t.title as trip_title, t.destination
      FROM bookings b
      LEFT JOIN trips t ON b.trip_id = t.id
      ORDER BY b.created_at DESC LIMIT 10
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
