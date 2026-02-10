import { Router } from 'express'
import Stripe from 'stripe'
import pool from '../db.js'
import QRCode from 'qrcode'

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('COLOQUE')) {
    throw new Error('Stripe nao configurado. Coloque sua STRIPE_SECRET_KEY no .env')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}

const router = Router()

// Banner slides
router.get('/banners', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT banner_slides FROM site_settings WHERE id = 1')
    if (rows.length === 0) return res.json([])
    const slides = typeof rows[0].banner_slides === 'string' ? JSON.parse(rows[0].banner_slides) : (rows[0].banner_slides || [])
    res.json(slides)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Listar viagens ativas
router.get('/trips', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM trips WHERE is_active = 1 AND departure_date >= CURDATE() ORDER BY departure_date ASC'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Detalhes de uma viagem
router.get('/trips/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM trips WHERE id = ? AND is_active = 1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Viagem não encontrada' })

    const [included] = await pool.query('SELECT * FROM trip_included WHERE trip_id = ? ORDER BY display_order', [req.params.id])
    const [itinerary] = await pool.query('SELECT * FROM trip_itinerary WHERE trip_id = ? ORDER BY day_number', [req.params.id])

    res.json({ ...rows[0], included, itinerary })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Assentos disponíveis de uma viagem
router.get('/trips/:id/seats', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, seat_number, seat_row, column_position, seat_type, status, price_modifier FROM seats WHERE trip_id = ? ORDER BY seat_row, column_position',
      [req.params.id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Criar reserva
router.post('/bookings', async (req, res) => {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()

    const { trip_id, customer_name, customer_email, customer_phone, seat_ids } = req.body

    if (!trip_id || !customer_name || !customer_email || !customer_phone || !seat_ids?.length) {
      return res.status(400).json({ error: 'Dados incompletos' })
    }

    // Verificar se os assentos estão disponíveis
    const [seats] = await conn.query(
      "SELECT id FROM seats WHERE id IN (?) AND trip_id = ? AND status = 'disponivel'",
      [seat_ids, trip_id]
    )
    if (seats.length !== seat_ids.length) {
      await conn.rollback()
      return res.status(400).json({ error: 'Alguns assentos já foram reservados. Tente novamente.' })
    }

    // Buscar preço e porcentagem de entrada da viagem
    const [[trip]] = await conn.query('SELECT price, deposit_percent FROM trips WHERE id = ?', [trip_id])
    const totalPrice = parseFloat(trip.price) * seat_ids.length
    const depositPercent = parseInt(trip.deposit_percent) || 100
    const depositAmount = Math.round((totalPrice * depositPercent / 100) * 100) / 100

    // Gerar código de reserva
    const bookingCode = 'JE' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase()

    // Criar a reserva
    const [result] = await conn.query(
      "INSERT INTO bookings (booking_code, trip_id, customer_name, customer_email, customer_phone, total_passengers, total_price, deposit_amount, status, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendente', 'aguardando')",
      [bookingCode, trip_id, customer_name, customer_email, customer_phone, seat_ids.length, totalPrice, depositAmount]
    )
    const bookingId = result.insertId

    // Reservar os assentos e criar passageiros
    for (const seatId of seat_ids) {
      await conn.query("UPDATE seats SET status = 'reservado' WHERE id = ?", [seatId])
      await conn.query(
        'INSERT INTO booking_passengers (booking_id, seat_id, passenger_name) VALUES (?, ?, ?)',
        [bookingId, seatId, customer_name]
      )
    }

    await conn.commit()
    conn.release()

    res.json({
      booking_id: bookingId,
      booking_code: bookingCode,
      total_price: totalPrice,
      deposit_amount: depositAmount,
      deposit_percent: depositPercent,
      total_passengers: seat_ids.length,
    })
  } catch (err) {
    await conn.rollback()
    conn.release()
    res.status(500).json({ error: err.message })
  }
})

// Gerar pagamento PIX
router.post('/bookings/:id/pix', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, t.title, t.destination FROM bookings b
       LEFT JOIN trips t ON b.trip_id = t.id
       WHERE b.id = ?`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Reserva não encontrada' })

    const booking = rows[0]
    const chargeAmount = parseFloat(booking.deposit_amount) || parseFloat(booking.total_price)

    // Gerar código PIX (simulado - em produção usaria API de pagamento)
    const pixKey = 'contato@jottaexcursoes.com.br'
    const pixCode = `00020126580014BR.GOV.BCB.PIX0136${pixKey}5204000053039865404${chargeAmount.toFixed(2)}5802BR5913JOTTA EXCURSOES6009SAO PAULO62140510${booking.booking_code}6304`

    // Gerar QR Code
    const qrcode = await QRCode.toDataURL(pixCode, { width: 300, margin: 2 })

    // Salvar no banco
    await pool.query(
      "INSERT INTO payments (booking_id, pix_code, pix_qrcode, amount, status) VALUES (?, ?, ?, ?, 'pending') ON DUPLICATE KEY UPDATE pix_code=VALUES(pix_code), pix_qrcode=VALUES(pix_qrcode)",
      [req.params.id, pixCode, qrcode, chargeAmount]
    )

    res.json({
      pix_code: pixCode,
      pix_qrcode: qrcode,
      amount: chargeAmount,
      total_price: parseFloat(booking.total_price),
      deposit_amount: chargeAmount,
      booking_code: booking.booking_code,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Buscar reserva pelo código
router.get('/bookings/:code', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, t.title as trip_title, t.destination, t.departure_date, t.return_date, t.duration, t.image_url
       FROM bookings b
       LEFT JOIN trips t ON b.trip_id = t.id
       WHERE b.booking_code = ?`,
      [req.params.code]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Reserva não encontrada' })

    const [passengers] = await pool.query(
      `SELECT bp.passenger_name, s.seat_number FROM booking_passengers bp
       LEFT JOIN seats s ON bp.seat_id = s.id
       WHERE bp.booking_id = ?`,
      [rows[0].id]
    )

    res.json({ ...rows[0], passengers })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Criar Stripe Checkout Session
router.post('/bookings/:id/checkout', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, t.title, t.destination, t.image_url FROM bookings b
       LEFT JOIN trips t ON b.trip_id = t.id
       WHERE b.id = ?`,
      [req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Reserva nao encontrada' })

    const booking = rows[0]
    const chargeAmount = parseFloat(booking.deposit_amount) || parseFloat(booking.total_price)
    const isPartial = chargeAmount < parseFloat(booking.total_price)

    const sessionParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'brl',
          product_data: {
            name: booking.title || 'Excursao',
            description: isPartial
              ? `${booking.destination} - ${booking.total_passengers} passageiro(s) - Entrada de ${Math.round(chargeAmount / parseFloat(booking.total_price) * 100)}% - Reserva ${booking.booking_code}`
              : `${booking.destination} - ${booking.total_passengers} passageiro(s) - Reserva ${booking.booking_code}`,
          },
          unit_amount: Math.round(chargeAmount * 100),
        },
        quantity: 1,
      }],
      metadata: { booking_id: String(booking.id), booking_code: booking.booking_code },
      success_url: `${req.headers.origin || 'http://localhost:5173'}/?booking_success=${booking.booking_code}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5173'}/?booking_cancel=${booking.booking_code}`,
    }

    if (booking.image_url) {
      sessionParams.line_items[0].price_data.product_data.images = [booking.image_url]
    }

    // Verificar se existe conta conectada para repasse
    const [acctRows] = await pool.query('SELECT stripe_account_id, stripe_charges_enabled FROM stripe_account WHERE id = 1')
    const connectedAccount = acctRows[0]
    if (connectedAccount?.stripe_account_id && connectedAccount.stripe_charges_enabled) {
      sessionParams.payment_intent_data = {
        transfer_data: {
          destination: connectedAccount.stripe_account_id,
        },
      }
    }

    const stripe = getStripe()
    const session = await stripe.checkout.sessions.create(sessionParams)
    res.json({ url: session.url })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
