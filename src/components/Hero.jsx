import { useState, useEffect, useCallback } from 'react'
import '../styles/Hero.css'

const API = 'http://localhost:3002/api'

// Fallback se não houver slides no banco
const defaultSlide = {
  type: 'text',
  bg_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80',
  subtitle: 'Descubra',
  title: 'O Mundo',
  description: 'Explore destinos incríveis com os melhores pacotes de viagem. Aventuras inesquecíveis esperam por você com a JA Excursões.',
  traveler_image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
  badge_number: '60%',
  badge_text: 'DESCONTO',
  btn_primary_text: 'Explorar Pacotes',
  btn_primary_link: '#pacotes',
  btn_secondary_text: 'Saiba Mais',
  btn_secondary_link: '#sobre',
}

export default function Hero() {
  const [slides, setSlides] = useState([defaultSlide])
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    fetch(`${API}/public/banners`)
      .then(r => r.json())
      .then(data => {
        if (data && data.length > 0) setSlides(data)
      })
      .catch(() => {})
  }, [])

  const goTo = useCallback((index) => {
    if (animating || index === current) return
    setAnimating(true)
    setCurrent(index)
    setTimeout(() => setAnimating(false), 600)
  }, [animating, current])

  const next = useCallback(() => {
    goTo((current + 1) % slides.length)
  }, [current, slides.length, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length)
  }, [current, slides.length, goTo])

  // Auto-play
  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [slides.length, next])

  const slide = slides[current]

  return (
    <section className="hero" id="inicio">
      {/* Background slides */}
      {slides.map((s, i) => (
        <div key={i} className={`hero-bg ${i === current ? 'hero-bg-active' : ''}`}>
          <img src={s.bg_image} alt="" className="hero-bg-img" />
          {s.type === 'text' && <div className="hero-overlay"></div>}
          {s.type === 'image' && <div className="hero-overlay-light"></div>}
        </div>
      ))}

      <div className="hero-torn-edge"></div>

      {/* Content - only for text slides */}
      {slide.type === 'text' && (
        <div className="container hero-content hero-content-animated">
          <div className="hero-text">
            {slide.subtitle && <p className="hero-subtitle">{slide.subtitle}</p>}
            {slide.title && <h1 className="hero-title">{slide.title}</h1>}
            {slide.description && <p className="hero-desc">{slide.description}</p>}
            <div className="hero-buttons">
              {slide.btn_primary_text && (
                <a href={slide.btn_primary_link || '#'} className="btn btn-primary btn-lg">{slide.btn_primary_text}</a>
              )}
              {slide.btn_secondary_text && (
                <a href={slide.btn_secondary_link || '#'} className="btn btn-outline btn-lg">{slide.btn_secondary_text}</a>
              )}
            </div>
          </div>

          {slide.traveler_image && (
            <div className="hero-image">
              <img src={slide.traveler_image} alt="Viajante" className="hero-traveler" />
              {slide.badge_number && (
                <div className="hero-badge">
                  <span className="badge-number">{slide.badge_number}</span>
                  <span className="badge-text">{slide.badge_text}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation - only if more than 1 slide */}
      {slides.length > 1 && (
        <>
          <button className="hero-arrow hero-arrow-left" onClick={prev} aria-label="Anterior">
            <i className="fas fa-chevron-left"></i>
          </button>
          <button className="hero-arrow hero-arrow-right" onClick={next} aria-label="Próximo">
            <i className="fas fa-chevron-right"></i>
          </button>

          <div className="hero-dots">
            {slides.map((_, i) => (
              <button
                key={i}
                className={`hero-dot ${i === current ? 'hero-dot-active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
