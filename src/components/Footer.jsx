import '../styles/Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-col">
          <a href="#" className="logo footer-logo">
            <img src="/logo-jotta.png" alt="JA Excursões" className="logo-img footer-logo-img" />
          </a>
          <p>Transformando sonhos em viagens inesquecíveis desde 2010. Sua aventura começa aqui.</p>
          <div className="social-links">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-youtube"></i></a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Links Rápidos</h4>
          <a href="#inicio">Início</a>
          <a href="#destinos">Destinos</a>
          <a href="#pacotes">Pacotes</a>
          <a href="#sobre">Sobre Nós</a>
        </div>
        <div className="footer-col">
          <h4>Destinos</h4>
          <a href="#">Rio de Janeiro</a>
          <a href="#">Capadócia</a>
          <a href="#">Alpes Suíços</a>
          <a href="#">Maldivas</a>
        </div>
        <div className="footer-col">
          <h4>Contato</h4>
          <p><i className="fas fa-phone"></i> (11) 99999-9999</p>
          <p><i className="fas fa-envelope"></i> contato@jaexcursoes.com</p>
          <p><i className="fas fa-map-marker-alt"></i> São Paulo, SP - Brasil</p>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; 2026 JA Excursões. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
