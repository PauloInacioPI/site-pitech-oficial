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
            <span className="stats-big-number"><AnimatedNumber target={10} /></span>
            <span className="stats-plus">+</span>
          </div>
          <h2>Projetos Entregues, <span className="highlight">Clientes Satisfeitos</span></h2>
          <p>Desenvolvemos sites, sistemas e SaaS para empresas de diferentes segmentos — com foco em qualidade, prazo e resultado.</p>
          <div className="stats-row">
            <div className="stat-item">
              <div><span className="stat-number"><AnimatedNumber target={10} /></span><span className="stat-suffix">+</span></div>
              <span className="stat-label">Projetos Entregues</span>
            </div>
            <div className="stat-item">
              <div><span className="stat-number"><AnimatedNumber target={4} /></span><span className="stat-suffix">+</span></div>
              <span className="stat-label">SaaS em Operação</span>
            </div>
            <div className="stat-item">
              <div><span className="stat-number"><AnimatedNumber target={100} /></span><span className="stat-suffix">%</span></div>
              <span className="stat-label">Satisfação Garantida</span>
            </div>
          </div>
        </div>
        <div className="stats-image">
          <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&q=80" alt="Desenvolvedor trabalhando" className="stats-img" />
        </div>
      </div>
    </section>
  )
}
