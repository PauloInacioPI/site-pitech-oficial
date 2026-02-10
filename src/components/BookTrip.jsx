import { useRef } from 'react'
import useInView from '../hooks/useInView'
import '../styles/BookTrip.css'

const steps = [
  { num: '01', title: 'Escolha Seu Destino', desc: 'Selecione entre diversos destinos nacionais e internacionais.' },
  { num: '02', title: 'Personalize Seu Pacote', desc: 'Monte o pacote ideal com hospedagem, passeios e translados.' },
  { num: '03', title: 'Confirme e Viaje', desc: 'Finalize sua reserva e prepare-se para uma experiência única.' },
]

export default function BookTrip() {
  const ref = useRef()
  const isVisible = useInView(ref, 0.15)

  return (
    <section className="book-section" ref={ref}>
      <div className="container book-inner">
        <div className="book-content">
          <p className="section-tag">Como Funciona</p>
          <h2 className="section-title">Passos Fáceis Para <span className="highlight">Sua Próxima Viagem</span></h2>
          <div className="book-steps">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`book-step fade-up ${isVisible ? 'visible' : ''}`}
                style={{ transitionDelay: `${i * 0.15}s` }}
              >
                <div className="book-step-number">{step.num}</div>
                <div className="book-step-info">
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="book-image">
          <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80" alt="Viajante planejando" className="book-img" />
          <div className="book-stat-badge">
            <span className="book-stat-number">48+</span>
            <span className="book-stat-text">Destinos pelo mundo</span>
          </div>
        </div>
      </div>
    </section>
  )
}
