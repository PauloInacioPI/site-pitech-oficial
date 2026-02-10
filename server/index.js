import 'dotenv/config'
import express from 'express'
import Stripe from 'stripe'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from './db.js'
import authRoutes from './routes/auth.js'
import dashboardRoutes from './routes/dashboard.js'
import tripRoutes from './routes/trips.js'
import bookingRoutes from './routes/bookings.js'
import settingsRoutes from './routes/settings.js'
import uploadRoutes from './routes/upload.js'
import publicRoutes from './routes/public.js'
import stripeAccountRoutes from './routes/stripe-account.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3002
app.use(cors())

// Stripe webhook precisa do body raw - ANTES do express.json()
app.post('/api/public/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET && !process.env.STRIPE_WEBHOOK_SECRET.startsWith('whsec_COLOQUE')) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } else {
      event = JSON.parse(req.body)
    }
  } catch (err) {
    console.log('Webhook signature error:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const bookingId = session.metadata?.booking_id

    if (bookingId) {
      try {
        await pool.query("UPDATE bookings SET payment_status = 'pago', status = 'confirmado' WHERE id = ? AND status != 'cancelado'", [bookingId])
        await pool.query("UPDATE payments SET status = 'paid', paid_at = NOW() WHERE booking_id = ?", [bookingId])
        console.log(`Pagamento confirmado para reserva #${bookingId}`)
      } catch (err) {
        console.log('Erro ao atualizar pagamento:', err.message)
      }
    }
  }

  // Atualizar status da conta conectada
  if (event.type === 'account.updated') {
    const account = event.data.object
    try {
      let status = 'verificando'
      if (account.charges_enabled && account.payouts_enabled) status = 'ativo'
      else if (account.requirements?.disabled_reason) status = 'restrito'

      await pool.query(
        `UPDATE stripe_account SET status=?, stripe_details_submitted=?, stripe_charges_enabled=?, stripe_payouts_enabled=? WHERE stripe_account_id=?`,
        [status, account.details_submitted ? 1 : 0, account.charges_enabled ? 1 : 0, account.payouts_enabled ? 1 : 0, account.id]
      )
      console.log(`Conta ${account.id} atualizada: ${status}`)
    } catch (err) {
      console.log('Erro ao atualizar conta conectada:', err.message)
    }
  }

  res.json({ received: true })
})

app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/public', publicRoutes)
app.use('/api/stripe-account', stripeAccountRoutes)

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})
