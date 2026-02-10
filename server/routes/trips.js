import { Router } from 'express'
import pool from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM trips ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM trips WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Viagem não encontrada' })

    const [included] = await pool.query('SELECT * FROM trip_included WHERE trip_id = ? ORDER BY display_order', [req.params.id])
    const [itinerary] = await pool.query('SELECT * FROM trip_itinerary WHERE trip_id = ? ORDER BY day_number', [req.params.id])
    const [seats] = await pool.query('SELECT * FROM seats WHERE trip_id = ? ORDER BY seat_row, column_position', [req.params.id])

    res.json({ ...rows[0], included, itinerary, seats })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id/stats', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM trips WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Viagem nao encontrada' })
    const trip = rows[0]

    const [[totalSeats]] = await pool.query('SELECT COUNT(*) as total FROM seats WHERE trip_id = ?', [trip.id])
    const [[availableSeats]] = await pool.query("SELECT COUNT(*) as total FROM seats WHERE trip_id = ? AND status = 'disponivel'", [trip.id])
    const [[reservedSeats]] = await pool.query("SELECT COUNT(*) as total FROM seats WHERE trip_id = ? AND status = 'reservado'", [trip.id])

    const [[totalBookings]] = await pool.query("SELECT COUNT(*) as total FROM bookings WHERE trip_id = ?", [trip.id])
    const [[confirmedBookings]] = await pool.query("SELECT COUNT(*) as total FROM bookings WHERE trip_id = ? AND status = 'confirmado'", [trip.id])
    const [[pendingBookings]] = await pool.query("SELECT COUNT(*) as total FROM bookings WHERE trip_id = ? AND status = 'pendente'", [trip.id])
    const [[cancelledBookings]] = await pool.query("SELECT COUNT(*) as total FROM bookings WHERE trip_id = ? AND status = 'cancelado'", [trip.id])

    const [[revenue]] = await pool.query("SELECT COALESCE(SUM(total_price), 0) as total FROM bookings WHERE trip_id = ? AND status != 'cancelado'", [trip.id])
    const [[paidRevenue]] = await pool.query("SELECT COALESCE(SUM(total_price), 0) as total FROM bookings WHERE trip_id = ? AND status != 'cancelado' AND payment_status = 'pago'", [trip.id])

    const [[passengers]] = await pool.query(
      "SELECT COUNT(*) as total FROM booking_passengers bp INNER JOIN bookings b ON bp.booking_id = b.id WHERE b.trip_id = ? AND b.status != 'cancelado'",
      [trip.id]
    )

    const [recentBookings] = await pool.query(
      "SELECT id, booking_code, customer_name, total_price, status, payment_status, created_at FROM bookings WHERE trip_id = ? ORDER BY created_at DESC LIMIT 10",
      [trip.id]
    )

    const seatCapacity = parseInt(trip.total_seats) || totalSeats.total
    const projection = parseFloat(trip.price) * seatCapacity

    res.json({
      trip,
      seats: { total: seatCapacity, available: availableSeats.total, reserved: reservedSeats.total },
      bookings: { total: totalBookings.total, confirmed: confirmedBookings.total, pending: pendingBookings.total, cancelled: cancelledBookings.total },
      revenue: { total: revenue.total, paid: paidRevenue.total, pending: revenue.total - paidRevenue.total },
      passengers: passengers.total,
      projection,
      recentBookings,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { title, destination, description, price, original_price, duration, departure_date, return_date, image_url, category, total_seats, seat_rows, seats_per_row, bate_volta, telefone } = req.body
    const [result] = await pool.query(
      'INSERT INTO trips (title, destination, description, price, original_price, duration, departure_date, return_date, image_url, category, total_seats, seat_rows, seats_per_row, bate_volta, telefone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, destination, description, price, original_price, duration, departure_date, return_date, image_url, category, total_seats || 44, seat_rows || 11, seats_per_row || 4, bate_volta || 0, telefone]
    )

    const tripId = result.insertId
    const rows = seat_rows || 11
    const cols = seats_per_row || 4
    const columns = ['A', 'B', 'C', 'D']
    const seatValues = []
    for (let r = 1; r <= rows; r++) {
      for (let c = 0; c < cols; c++) {
        seatValues.push([tripId, `${r}${columns[c]}`, r, columns[c], 'regular', 'disponivel', 0])
      }
    }
    if (seatValues.length > 0) {
      await pool.query('INSERT INTO seats (trip_id, seat_number, seat_row, column_position, seat_type, status, price_modifier) VALUES ?', [seatValues])
    }

    res.json({ id: tripId, message: 'Viagem criada com sucesso' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id', async (req, res) => {
  try {
    const { title, destination, description, price, original_price, duration, departure_date, return_date, image_url, category, total_seats, bate_volta, telefone, is_active } = req.body
    await pool.query(
      'UPDATE trips SET title=?, destination=?, description=?, price=?, original_price=?, duration=?, departure_date=?, return_date=?, image_url=?, category=?, total_seats=?, bate_volta=?, telefone=?, is_active=? WHERE id=?',
      [title, destination, description, price, original_price, duration, departure_date, return_date, image_url, category, total_seats, bate_volta, telefone, is_active, req.params.id]
    )
    res.json({ message: 'Viagem atualizada com sucesso' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM seats WHERE trip_id = ?', [req.params.id])
    await pool.query('DELETE FROM trip_included WHERE trip_id = ?', [req.params.id])
    await pool.query('DELETE FROM trip_itinerary WHERE trip_id = ?', [req.params.id])
    await pool.query('DELETE FROM trips WHERE id = ?', [req.params.id])
    res.json({ message: 'Viagem excluída com sucesso' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
