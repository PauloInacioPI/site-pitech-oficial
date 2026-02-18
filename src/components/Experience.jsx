import { useRef } from 'react'
import useInView from '../hooks/useInView'
import '../styles/Experience.css'

const benefits = [
  'Equipe técnica especializada e certificada',
  'Soluções personalizadas para cada cliente',
  'Suporte técnico 24h dedicado',
  'Integrações e APIs robustas e seguras',
  'Atualizações e melhorias contínuas',
]

export default function Experience() {
  const ref = useRef()
  const isVisible = useInView(ref, 0.15)

  return (
    <section className="experience-section" ref={ref}>
      <div className="container experience-inner">
        <div className="experience-images">
          <div className="exp-img-grid">
            <img src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&q=80" alt="Código" className="exp-img exp-img-1" />
            <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500&q=80" alt="Equipe tech" className="exp-img exp-img-2" />
            <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?w=500&q=80" alt="Desenvolvimento" className="exp-img exp-img-3" />
          </div>
        </div>
        <div className="experience-content">
          <p className="section-tag">Por Que Nos Escolher</p>
          <h2 className="section-title">Tecnologia <span className="highlight">Inovadora</span> Para o Seu Negócio</h2>
          <p className="experience-desc">
            Desenvolvemos sistemas sob medida com foco em performance e usabilidade.
            Cada projeto é planejado com cuidado para entregar resultados reais e duradouros.
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
