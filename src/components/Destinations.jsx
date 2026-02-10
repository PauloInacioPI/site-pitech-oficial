import { useRef } from 'react'
import useInView from '../hooks/useInView'
import '../styles/Destinations.css'

const destinations = [
  {
    name: 'Rio de Janeiro',
    country: 'Brasil',
    price: 'R$ 1.200',
    days: '5 dias',
    rating: '4.8',
    img: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=500&q=80',
  },
  {
    name: 'Capadócia',
    country: 'Turquia',
    price: 'R$ 4.800',
    days: '7 dias',
    rating: '4.9',
    img: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&q=80',
  },
  {
    name: 'Alpes Suíços',
    country: 'Suíça',
    price: 'R$ 6.500',
    days: '10 dias',
    rating: '4.9',
    img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=500&q=80',
  },
  {
    name: 'Maldivas',
    country: 'Ásia',
    price: 'R$ 8.900',
    days: '8 dias',
    rating: '5.0',
    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80',
  },
]

export default function Destinations() {
  const ref = useRef()
  const isVisible = useInView(ref, 0.1)

  return (
    <section className="destinations-section" id="destinos" ref={ref}>
      <div className="container">
        <div className="section-header">
          <p className="section-tag">Principais Lugares</p>
          <h2 className="section-title">Destinos <span className="highlight">Populares</span></h2>
        </div>
        <div className="destinations-grid">
          {destinations.map((dest, i) => (
            <div
              key={i}
              className={`destination-card fade-up ${isVisible ? 'visible' : ''}`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="destination-img">
                <img src={dest.img} alt={dest.name} />
                <div className="destination-overlay">
                  <span className="destination-price">{dest.price}</span>
                </div>
              </div>
              <div className="destination-info">
                <h3>{dest.name}</h3>
                <p><i className="fas fa-map-marker-alt"></i> {dest.country}</p>
                <div className="destination-meta">
                  <span><i className="fas fa-clock"></i> {dest.days}</span>
                  <span><i className="fas fa-star"></i> {dest.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
