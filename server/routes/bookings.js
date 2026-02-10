import { Router } from 'express'
import pool from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.*, t.title as trip_title, t.destination,
      (SELECT COUNT(*) FROM booking_passengers bp WHERE bp.booking_id = b.id) as passenger_count
      FROM bookings b
      LEFT JOIN trips t ON b.trip_id = t.id
      ORDER BY b.created_at DESC
    `)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT b.*, t.title as trip_title, t.destination
      FROM bookings b
      LEFT JOIN trips t ON b.trip_id = t.id
      WHERE b.id = ?
    `, [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Reserva não encontrada' })

    const [passengers] = await pool.query(`
      SELECT bp.*, s.seat_number
      FROM booking_passengers bp
      LEFT JOIN seats s ON bp.seat_id = s.id
      WHERE bp.booking_id = ?
    `, [req.params.id])

    const [payments] = await pool.query('SELECT * FROM payments WHERE booking_id = ?', [req.params.id])

    res.json({ ...rows[0], passengers, payments })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id])

    if (status === 'cancelado') {
      const [passengers] = await pool.query('SELECT seat_id FROM booking_passengers WHERE booking_id = ?', [req.params.id])
      for (const p of passengers) {
        await pool.query("UPDATE seats SET status = 'disponivel' WHERE id = ?", [p.seat_id])
      }
    }
    res.json({ message: 'Status atualizado com sucesso' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/:id/payment', async (req, res) => {
  try {
    const { payment_status } = req.body
    await pool.query('UPDATE bookings SET payment_status = ? WHERE id = ?', [payment_status, req.params.id])
    if (payment_status === 'pago') {
      await pool.query("UPDATE bookings SET status = 'confirmado' WHERE id = ? AND status = 'pendente'", [req.params.id])
      await pool.query("UPDATE payments SET status = 'paid', paid_at = NOW() WHERE booking_id = ?", [req.params.id])
    }
    res.json({ message: 'Pagamento atualizado com sucesso' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
