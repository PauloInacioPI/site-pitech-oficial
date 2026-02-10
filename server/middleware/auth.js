import jwt from 'jsonwebtoken'

const JWT_SECRET = 'jotta-excursoes-secret-2026'

export function generateToken(admin) {
  return jwt.sign({ id: admin.id, email: admin.email, nome: admin.nome }, JWT_SECRET, { expiresIn: '24h' })
}

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Token não fornecido' })

  try {
    req.admin = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Token inválido' })
  }
}
