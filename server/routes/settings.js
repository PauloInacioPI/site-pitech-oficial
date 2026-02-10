import { Router } from 'express'
import pool from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM site_settings WHERE id = 1')
    if (rows.length === 0) return res.status(404).json({ error: 'Configurações não encontradas' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/', async (req, res) => {
  try {
    const { contact_phone, contact_email, contact_whatsapp, social_links, stats, banner_slides } = req.body
    await pool.query(
      'UPDATE site_settings SET contact_phone=?, contact_email=?, contact_whatsapp=?, social_links=?, stats=?, banner_slides=? WHERE id = 1',
      [contact_phone, contact_email, contact_whatsapp, JSON.stringify(social_links), JSON.stringify(stats), JSON.stringify(banner_slides)]
    )
    res.json({ message: 'Configurações atualizadas com sucesso' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
