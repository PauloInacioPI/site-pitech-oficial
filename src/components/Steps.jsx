import { useRef } from 'react'
import useInView from '../hooks/useInView'
import '../styles/Steps.css'

const steps = [
  { icon: 'fa-map-marked-alt', title: 'Escolha o Destino', desc: 'Navegue por nossos destinos e encontre o lugar perfeito para sua próxima aventura.' },
  { icon: 'fa-calendar-check', title: 'Selecione a Data', desc: 'Escolha as melhores datas para sua viagem com flexibilidade e comodidade.' },
  { icon: 'fa-credit-card', title: 'Faça o Pagamento', desc: 'Pagamento seguro e facilitado com diversas opções de parcelamento.' },
  { icon: 'fa-umbrella-beach', title: 'Aproveite a Viagem', desc: 'Relaxe e aproveite cada momento da sua viagem dos sonhos conosco.' },
]

export default function Steps() {
  const ref = useRef()
  const isVisible = useInView(ref, 0.15)

  return (
    <section className="steps-section" id="sobre" ref={ref}>
      <div className="container">
        <div className="section-header">
          <p className="section-tag">Simples e Rápido</p>
          <h2 className="section-title">Passos Fáceis <span className="highlight">Para Reservar</span></h2>
        </div>
        <div className="steps-grid">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`step-card fade-up ${isVisible ? 'visible' : ''}`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="step-icon">
                <i className={`fas ${step.icon}`}></i>
              </div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
