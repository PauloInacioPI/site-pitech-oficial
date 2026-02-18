import { useState, useEffect } from 'react'
import '../styles/Header.css'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNavClick = (e, id) => {
    e.preventDefault()
    setMenuOpen(false)
    const el = document.getElementById(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="container header-inner">
        <a href="#" className="logo">
          <img src="/logo-jotta.png" alt="PiTech Sistemas" className="logo-img" />
        </a>

        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          {[
            { id: 'inicio', label: 'Início' },
            { id: 'projetos', label: 'Projetos' },
            { id: 'pacotes', label: 'Planos' },
            { id: 'sobre', label: 'Sobre' },
            { id: 'contato', label: 'Contato' },
          ].map(({ id, label }) => (
            <a key={id} href={`#${id}`} onClick={e => handleNavClick(e, id)}>
              {label}
            </a>
          ))}
        </nav>

        <a href="#contato" className="btn btn-primary btn-header" onClick={e => handleNavClick(e, 'contato')}>
          Fale Conosco
        </a>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>
    </header>
  )
}
