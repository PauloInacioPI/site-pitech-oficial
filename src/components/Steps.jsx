import { useRef, useState, useEffect, useCallback } from 'react'
import useInView from '../hooks/useInView'
import '../styles/Steps.css'

const steps = [
  { icon: 'fa-search', title: 'Conheça as Soluções', desc: 'Explore nosso portfólio e encontre o sistema ideal para o seu negócio.' },
  { icon: 'fa-clipboard-list', title: 'Solicite um Orçamento', desc: 'Preencha o formulário e receba uma proposta personalizada.' },
  { icon: 'fa-handshake', title: 'Feche o Contrato', desc: 'Assine o contrato com segurança e comece o desenvolvimento.' },
  { icon: 'fa-rocket', title: 'Seu Sistema no Ar', desc: 'Receba sua solução funcionando e com suporte dedicado!' },
]

export default function Steps() {
  const ref = useRef()
  const trackRef = useRef()
  const isVisible = useInView(ref, 0.15)
  const [active, setActive] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Touch swipe
  const touchStart = useRef(0)
  const touchEnd = useRef(0)

  const handleTouchStart = useCallback((e) => {
    touchStart.current = e.touches[0].clientX
    touchEnd.current = e.touches[0].clientX
  }, [])

  const handleTouchMove = useCallback((e) => {
    touchEnd.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(() => {
    const diff = touchStart.current - touchEnd.current
    if (Math.abs(diff) > 50) {
      if (diff > 0 && active < steps.length - 1) setActive(a => a + 1)
      if (diff < 0 && active > 0) setActive(a => a - 1)
    }
  }, [active])

  // Auto-play no mobile
  useEffect(() => {
    if (!isMobile) return
    const timer = setInterval(() => {
      setActive(a => (a + 1) % steps.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [isMobile])

  return (
    <section className="steps-section" id="sobre" ref={ref}>
      <div className="container">
        <div className="section-header">
          <p className="section-tag">Simples e Rápido</p>
          <h2 className="section-title">Como <span className="highlight">Contratar</span></h2>
          <p className="section-subtitle">Em apenas 4 passos seu sistema está pronto</p>
        </div>

        {/* Desktop: grid normal */}
        <div className="steps-grid steps-desktop">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`step-card fade-up ${isVisible ? 'visible' : ''}`}
              style={{ transitionDelay: `${i * 0.12}s` }}
            >
              <span className="step-number">{String(i + 1).padStart(2, '0')}</span>
              <div className="step-icon">
                <i className={`fas ${step.icon}`}></i>
              </div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              {i < steps.length - 1 && <div className="step-connector"><i className="fas fa-chevron-right"></i></div>}
            </div>
          ))}
        </div>

        {/* Mobile: carrossel */}
        <div
          className="steps-carousel"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="steps-track"
            ref={trackRef}
            style={{ transform: `translateX(-${active * 100}%)` }}
          >
            {steps.map((step, i) => (
              <div key={i} className="step-slide">
                <div className={`step-card-mobile fade-up ${isVisible ? 'visible' : ''}`}>
                  <span className="step-number-mobile">{String(i + 1).padStart(2, '0')}</span>
                  <div className="step-icon-mobile">
                    <i className={`fas ${step.icon}`}></i>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="steps-dots">
            {steps.map((_, i) => (
              <button
                key={i}
                className={`step-dot ${i === active ? 'active' : ''}`}
                onClick={() => setActive(i)}
                aria-label={`Passo ${i + 1}`}
              />
            ))}
          </div>

          <div className="steps-progress">
            <div className="steps-progress-bar" style={{ width: `${((active + 1) / steps.length) * 100}%` }} />
          </div>
        </div>
      </div>
    </section>
  )
}
