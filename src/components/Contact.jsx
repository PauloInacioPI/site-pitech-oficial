import { useState } from 'react'
import '../styles/Contact.css'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' })

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(`Obrigado ${form.name}! Entraremos em contato em breve.`)
    setForm({ name: '', email: '', phone: '' })
  }

  return (
    <section className="cta-section" id="contato">
      <div className="container cta-inner">
        <h2>Pronto Para Transformar Seu Negócio?</h2>
        <p>Entre em contato conosco e descubra como nossas soluções tecnológicas podem impulsionar sua empresa.</p>
        <form className="cta-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Seu nome"
            className="cta-input"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Seu e-mail"
            className="cta-input"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="tel"
            placeholder="Seu telefone"
            className="cta-input"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
            required
          />
          <button type="submit" className="btn btn-primary btn-lg cta-btn">
            Entrar em Contato
          </button>
        </form>
      </div>
    </section>
  )
}
