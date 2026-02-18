import { useState } from 'react'
import '../styles/Contact.css'

const WHATSAPP = '5522981605315'

const services = [
  'Template de Site',
  'Sistema SaaS',
  'Sistema Personalizado',
  'Aplicativo Web',
  'Consultoria em TI',
  'Outro',
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const text = `Olá, PiTech! Sou *${form.name}*.\n\n📌 *Serviço:* ${form.service || 'Não informado'}\n📧 *E-mail:* ${form.email}\n📞 *Telefone:* ${form.phone}\n\n💬 *Mensagem:*\n${form.message}`
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`, '_blank')
    setSent(true)
    setTimeout(() => setSent(false), 5000)
  }

  return (
    <section className="contact-section" id="contato">
      <div className="container contact-wrapper">

        <div className="contact-info">
          <p className="section-tag">Fale Conosco</p>
          <h2 className="contact-title">Vamos <span className="highlight">Conversar</span>?</h2>
          <p className="contact-desc">
            Conte-nos sobre seu projeto. Nossa equipe retorna em até 24h com uma proposta personalizada e sem compromisso.
          </p>

          <div className="contact-items">
            <div className="contact-item">
              <div className="contact-item-icon whatsapp-icon"><i className="fab fa-whatsapp"></i></div>
              <div className="contact-item-text">
                <strong>WhatsApp</strong>
                <span>Resposta rápida, geralmente em até 1h</span>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-item-icon email-icon"><i className="fas fa-envelope"></i></div>
              <div className="contact-item-text">
                <strong>contato@pitechsistemas.com.br</strong>
                <span>Para propostas e contratos formais</span>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-item-icon clock-icon"><i className="fas fa-clock"></i></div>
              <div className="contact-item-text">
                <strong>Seg a Sex — 8h às 18h</strong>
                <span>Horário de atendimento</span>
              </div>
            </div>
          </div>

          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
          >
            <i className="fab fa-whatsapp"></i> Chamar no WhatsApp
          </a>
        </div>

        <div className="contact-form-box">
          <h3>Envie sua Solicitação</h3>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label>Nome completo *</label>
              <input
                type="text"
                placeholder="Seu nome"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>E-mail *</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Telefone *</label>
                <input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Tipo de projeto</label>
              <select value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
                <option value="">Selecione o serviço...</option>
                {services.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Mensagem</label>
              <textarea
                placeholder="Descreva brevemente o que você precisa..."
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                rows={4}
              />
            </div>
            <button type="submit" className={`btn btn-submit${sent ? ' sent' : ''}`}>
              {sent
                ? <><i className="fas fa-check"></i> WhatsApp aberto!</>
                : <><i className="fab fa-whatsapp"></i> Enviar pelo WhatsApp</>
              }
            </button>
          </form>
        </div>

      </div>
    </section>
  )
}
