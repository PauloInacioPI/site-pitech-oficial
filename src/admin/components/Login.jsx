import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../api'
import '../styles/Login.css'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', senha: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      localStorage.setItem('token', data.token)
      localStorage.setItem('admin', JSON.stringify(data.admin))
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-overlay"></div>
      </div>
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <img src="/logo-jotta.png" alt="PiTech Sistemas" className="login-logo-img" />
          </div>
          <p>Painel Administrativo</p>
        </div>

        {error && (
          <div className="login-error">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <i className="fas fa-envelope"></i>
            <input
              type="email"
              placeholder="Seu e-mail"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="login-field">
            <i className="fas fa-lock"></i>
            <input
              type="password"
              placeholder="Sua senha"
              value={form.senha}
              onChange={e => setForm({ ...form, senha: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Entrando...</>
            ) : (
              <><i className="fas fa-sign-in-alt"></i> Entrar</>
            )}
          </button>
        </form>

        <div className="login-footer">
          <a href="/"><i className="fas fa-arrow-left"></i> Voltar ao site</a>
        </div>
      </div>
    </div>
  )
}
