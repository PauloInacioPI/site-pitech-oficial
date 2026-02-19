import { useRef } from 'react'
import useInView from '../hooks/useInView'
import '../styles/Experience.css'

const benefits = [
  { icon: 'fa-code', title: 'Código próprio', desc: 'Cada projeto é desenvolvido do zero, sem templates prontos. Seu sistema é único.' },
  { icon: 'fa-mobile-alt', title: 'Responsivo de verdade', desc: 'Funciona em qualquer tela — celular, tablet ou desktop.' },
  { icon: 'fa-headset', title: 'Suporte direto', desc: 'Fale diretamente com quem desenvolve. Sem fila, sem robô.' },
  { icon: 'fa-sync-alt', title: 'Melhorias contínuas', desc: 'Atualizações e ajustes inclusos enquanto durar o contrato.' },
]

export default function Experience() {
  const ref = useRef()
  const isVisible = useInView(ref, 0.15)

  return (
    <section className="experience-section" ref={ref}>
      <div className="container">
        <div className="section-header">
          <p className="section-tag">Diferenciais</p>
          <h2 className="section-title">Por que escolher a <span className="highlight">PiTech</span>?</h2>
        </div>
        <div className="experience-grid">
          {benefits.map((item, i) => (
            <div
              key={i}
              className={`exp-card fade-up ${isVisible ? 'visible' : ''}`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="exp-card-icon">
                <i className={`fas ${item.icon}`}></i>
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
