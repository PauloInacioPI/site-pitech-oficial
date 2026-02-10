import { Router } from 'express'
import pool from '../db.js'
import { generateToken } from '../middleware/auth.js'

const router = Router()

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body
    const [rows] = await pool.query('SELECT * FROM admins WHERE email = ?', [email])
    if (rows.length === 0) return res.status(401).json({ error: 'Credenciais inválidas' })

    const admin = rows[0]
    if (admin.senha !== senha) return res.status(401).json({ error: 'Credenciais inválidas' })

    const token = generateToken(admin)
    res.json({ token, admin: { id: admin.id, nome: admin.nome, email: admin.email } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Não autenticado' })

  try {
    const jwt = await import('jsonwebtoken')
    const decoded = jwt.default.verify(token, 'jotta-excursoes-secret-2026')
    res.json({ admin: { id: decoded.id, nome: decoded.nome, email: decoded.email } })
  } catch {
    res.status(401).json({ error: 'Token inválido' })
  }
})

export default router
