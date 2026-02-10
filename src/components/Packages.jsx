import { useRef } from 'react'
import useInView from '../hooks/useInView'
import '../styles/Packages.css'

const packages = [
  {
    name: 'Básico',
    price: '899',
    features: [
      { text: 'Passagem aérea inclusa', included: true },
      { text: '3 noites de hospedagem', included: true },
      { text: 'Café da manhã', included: true },
      { text: 'Traslado aeroporto', included: true },
      { text: 'Passeios guiados', included: false },
      { text: 'Seguro viagem premium', included: false },
    ],
  },
  {
    name: 'Premium',
    price: '1.899',
    featured: true,
    features: [
      { text: 'Passagem aérea inclusa', included: true },
      { text: '5 noites de hospedagem', included: true },
      { text: 'Pensão completa', included: true },
      { text: 'Traslado aeroporto', included: true },
      { text: 'Passeios guiados', included: true },
      { text: 'Seguro viagem premium', included: true },
    ],
  },
  {
    name: 'Luxo',
    price: '3.499',
    features: [
      { text: 'Passagem executiva', included: true },
      { text: '7 noites resort 5 estrelas', included: true },
      { text: 'All inclusive', included: true },
      { text: 'Transfer VIP', included: true },
      { text: 'Tours exclusivos', included: true },
      { text: 'Concierge 24h', included: true },
    ],
  },
]

export default function Packages() {
  const ref = useRef()
  const isVisible = useInView(ref, 0.1)

  return (
    <section className="packages-section" id="pacotes" ref={ref}>
      <div className="packages-bg">
        <img src="https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1600&q=80" alt="Montanhas" className="packages-bg-img" />
        <div className="packages-overlay"></div>
      </div>
      <div className="container packages-content">
        <div className="section-header light">
          <p className="section-tag">Nossos Pacotes</p>
          <h2 className="section-title">Pronto Para Viajar <span className="highlight">O Mundo</span></h2>
        </div>
        <div className="packages-grid">
          {packages.map((pkg, i) => (
            <div
              key={i}
              className={`package-card ${pkg.featured ? 'featured' : ''} fade-up ${isVisible ? 'visible' : ''}`}
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              {pkg.featured && <div className="package-badge">Mais Popular</div>}
              <div className="package-header">
                <h3>{pkg.name}</h3>
                <div className="package-price">
                  <span className="currency">R$</span>
                  <span className="amount">{pkg.price}</span>
                  <span className="period">/pessoa</span>
                </div>
              </div>
              <ul className="package-features">
                {pkg.features.map((feat, j) => (
                  <li key={j} className={feat.included ? '' : 'disabled'}>
                    <i className={`fas ${feat.included ? 'fa-check' : 'fa-times'}`}></i>
                    {feat.text}
                  </li>
                ))}
              </ul>
              <a href="#contato" className={`btn btn-package ${pkg.featured ? 'btn-package-featured' : ''}`}>
                Reservar Agora
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
