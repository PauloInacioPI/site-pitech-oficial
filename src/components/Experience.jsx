import { useRef } from 'react'
import useInView from '../hooks/useInView'
import '../styles/Experience.css'

const benefits = [
  'Guias turísticos especializados e multilíngues',
  'Hospedagens selecionadas com conforto garantido',
  'Roteiros personalizados para cada grupo',
  'Suporte 24h durante toda a viagem',
  'Seguro viagem completo incluso',
]

export default function Experience() {
  const ref = useRef()
  const isVisible = useInView(ref, 0.15)

  return (
    <section className="experience-section" ref={ref}>
      <div className="container experience-inner">
        <div className="experience-images">
          <div className="exp-img-grid">
            <img src="https://images.unsplash.com/photo-1526392060635-9d6019884377?w=500&q=80" alt="Machu Picchu" className="exp-img exp-img-1" />
            <img src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=500&q=80" alt="Lago montanha" className="exp-img exp-img-2" />
            <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&q=80" alt="Estrada viagem" className="exp-img exp-img-3" />
          </div>
        </div>
        <div className="experience-content">
          <p className="section-tag">Nossas Experiências</p>
          <h2 className="section-title">Destinos <span className="highlight">Incríveis</span> Todos os Meses</h2>
          <p className="experience-desc">
            Descubra novos lugares todos os meses com nossos pacotes exclusivos.
            Cada viagem é planejada com cuidado para garantir momentos inesquecíveis.
          </p>
          <ul className="experience-list">
            {benefits.map((item, i) => (
              <li
                key={i}
                className={`fade-up ${isVisible ? 'visible' : ''}`}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <i className="fas fa-check-circle"></i> {item}
              </li>
            ))}
          </ul>
          <a href="#contato" className="btn btn-primary btn-lg">Saiba Mais</a>
        </div>
      </div>
    </section>
  )
}
