import { useState } from 'react'
import Meteors from './Meteors'
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
      <Meteors number={25} />
      <div className="container">

        {/* Header */}
        <div className="contact-header">
          <p className="section-tag">Fale Conosco</p>
          <h2 className="contact-title">
            Vamos Transformar sua <span className="highlight">Ideia em Realidade</span>?
          </h2>
          <p className="contact-desc">
            Conte-nos sobre seu projeto. Nossa equipe retorna em até 24h com uma proposta personalizada e sem compromisso.
          </p>
        </div>

        {/* Quick action cards */}
        <div className="contact-cards">
          <a
            href={`https://wa.me/${WHATSAPP}`}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-card"
          >
            <div className="contact-card-icon whatsapp">
              <i className="fab fa-whatsapp"></i>
            </div>
            <div className="contact-card-text">
              <strong>WhatsApp</strong>
              <span>Resposta rápida, geralmente em até 1h</span>
            </div>
            <span className="contact-card-arrow"><i className="fas fa-arrow-right"></i></span>
          </a>

          <a href="mailto:contato@pitechsistemas.com.br" className="contact-card">
            <div className="contact-card-icon email">
              <i className="fas fa-envelope"></i>
            </div>
            <div className="contact-card-text">
              <strong>contato@pitechsistemas.com.br</strong>
              <span>Para propostas e contratos formais</span>
            </div>
            <span className="contact-card-arrow"><i className="fas fa-arrow-right"></i></span>
          </a>

          <div className="contact-card">
            <div className="contact-card-icon location">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <div className="contact-card-text">
              <strong>Santo Antônio de Pádua, RJ</strong>
              <span>Atendemos todo o Brasil remotamente</span>
            </div>
          </div>
        </div>

        {/* Main: form + CTA */}
        <div className="contact-main">

          {/* Form */}
          <div className="contact-form-box">
            <h3>Envie sua Solicitação</h3>
            <p className="contact-form-subtitle">Preencha o formulário e enviaremos pelo WhatsApp</p>
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
              <button type="submit" className={`btn-submit${sent ? ' sent' : ''}`}>
                {sent
                  ? <><i className="fas fa-check"></i> WhatsApp aberto!</>
                  : <><i className="fab fa-whatsapp"></i> Enviar pelo WhatsApp</>
                }
              </button>
            </form>
          </div>

          {/* Right panel */}
          <div className="contact-cta-panel">

            {/* WhatsApp CTA */}
            <div className="contact-cta-box">
              <div className="contact-cta-icon">
                <i className="fab fa-whatsapp"></i>
              </div>
              <h4>Prefere conversar direto?</h4>
              <p>Fale com nossa equipe agora mesmo pelo WhatsApp. Sem formulários, sem espera.</p>
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp-cta"
              >
                <i className="fab fa-whatsapp"></i> Chamar no WhatsApp
              </a>
            </div>

            {/* Trust badges */}
            <div className="contact-trust">
              <h4><i className="fas fa-shield-alt"></i> Por que a PiTech?</h4>
              <div className="trust-items">
                <div className="trust-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Proposta gratuita e sem compromisso</span>
                </div>
                <div className="trust-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Suporte dedicado durante todo o projeto</span>
                </div>
                <div className="trust-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Código fonte entregue ao cliente</span>
                </div>
                <div className="trust-item">
                  <i className="fas fa-check-circle"></i>
                  <span>Garantia de 30 dias após entrega</span>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="contact-schedule">
              <i className="fas fa-clock"></i>
              <div className="contact-schedule-text">
                <strong>Seg a Sex — 8h às 18h</strong>
                <span>Horário de atendimento</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}
