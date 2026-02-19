import { useState, useEffect, useCallback } from 'react'
import '../styles/Hero.css'

const defaultSlide = {
  type: 'text',
  bg_video: 'https://assets.mixkit.co/videos/26774/26774-720.mp4',
  bg_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80',
  subtitle: 'PiTech Sistemas',
  title: 'Desenvolvemos sistemas que geram resultado.',
  description: 'Sites, plataformas SaaS e sistemas sob medida para empresas que querem crescer com tecnologia.',
  btn_primary_text: 'Ver Projetos',
  btn_primary_link: '#projetos',
  btn_secondary_text: 'Fale Conosco',
  btn_secondary_link: '#contato',
}

export default function Hero() {
  const [slides, setSlides] = useState([defaultSlide])
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

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
          {s.bg_video ? (
            <video
              className="hero-bg-img"
              src={s.bg_video}
              poster={s.bg_image}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img src={s.bg_image} alt="" className="hero-bg-img" />
          )}
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
