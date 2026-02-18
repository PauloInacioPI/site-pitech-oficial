import '../styles/Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-col">
          <a href="#" className="logo footer-logo">
            <img src="/logo-pitech.jpg" alt="PiTech Sistemas" className="logo-img footer-logo-img" />
          </a>
          <p>Transformando ideias em soluções tecnológicas desde 2010. Seu projeto começa aqui.</p>
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
          <a href="#projetos">Projetos</a>
          <a href="#pacotes">Planos</a>
          <a href="#sobre">Sobre Nós</a>
        </div>
        <div className="footer-col">
          <h4>Soluções</h4>
          <a href="#">Desenvolvimento Web</a>
          <a href="#">Sistemas Personalizados</a>
          <a href="#">Consultoria em TI</a>
          <a href="#">Suporte Técnico</a>
        </div>
        <div className="footer-col">
          <h4>Contato</h4>
          <p><i className="fas fa-phone"></i> (11) 99999-9999</p>
          <p><i className="fas fa-envelope"></i> contato@pitechsistemas.com.br</p>
          <p><i className="fas fa-map-marker-alt"></i> São Paulo, SP - Brasil</p>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; 2026 PiTech Sistemas. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
