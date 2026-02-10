import { useRef, useEffect, useState } from 'react'
import useInView from '../hooks/useInView'
import '../styles/Stats.css'

function AnimatedNumber({ target, duration = 2000 }) {
  const [value, setValue] = useState(0)
  const ref = useRef()
  const isVisible = useInView(ref, 0.3)

  useEffect(() => {
    if (!isVisible) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setValue(target)
        clearInterval(timer)
      } else {
        setValue(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isVisible, target, duration])

  return <span ref={ref}>{value}</span>
}

export default function Stats() {
  return (
    <section className="stats-section">
      <div className="container stats-inner">
        <div className="stats-content">
          <div className="stats-number-wrapper">
            <span className="stats-big-number"><AnimatedNumber target={48} /></span>
            <span className="stats-plus">+</span>
          </div>
          <h2>Passeios e Pacotes de Viagem, <span className="highlight">Globalmente</span></h2>
          <p>Oferecemos os melhores pacotes de viagem para destinos ao redor do mundo, com experiências únicas e preços imbatíveis.</p>
          <div className="stats-row">
            <div className="stat-item">
              <div><span className="stat-number"><AnimatedNumber target={500} /></span><span className="stat-suffix">+</span></div>
              <span className="stat-label">Clientes Felizes</span>
            </div>
            <div className="stat-item">
              <div><span className="stat-number"><AnimatedNumber target={120} /></span><span className="stat-suffix">+</span></div>
              <span className="stat-label">Destinos</span>
            </div>
            <div className="stat-item">
              <div><span className="stat-number"><AnimatedNumber target={15} /></span><span className="stat-suffix">+</span></div>
              <span className="stat-label">Anos de Experiência</span>
            </div>
          </div>
        </div>
        <div className="stats-image">
          <img src="https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=600&q=80" alt="Viajante explorando" className="stats-img" />
        </div>
      </div>
    </section>
  )
}
