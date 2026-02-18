import { useRef } from 'react'
import useInView from '../hooks/useInView'
import '../styles/Destinations.css'

const projects = [
  {
    name: 'PiTech Solar',
    category: 'Energia Solar',
    type: 'Landing Page',
    img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=500&q=80',
    link: 'https://pitechsolar.netlify.app',
  },
  {
    name: 'Bem Cuidar',
    category: 'Saúde',
    type: 'Site Institucional',
    img: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&q=80',
    link: 'https://bemcuidar.netlify.app',
  },
  {
    name: 'Larissa Ribeiro',
    category: 'Profissional Liberal',
    type: 'Site Pessoal',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=80',
    link: 'https://larissaribeiro.netlify.app',
  },
  {
    name: 'Moda Fina',
    category: 'Moda & Vestuário',
    type: 'E-commerce',
    img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&q=80',
    link: 'https://modafina.netlify.app',
  },
  {
    name: 'Paulo Inácio',
    category: 'Portfólio',
    type: 'Site Pessoal',
    img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80',
    link: 'https://paulo-inacio.netlify.app',
  },
  {
    name: 'Mais Sorriso',
    category: 'Odontologia',
    type: 'Site Institucional',
    img: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=500&q=80',
    link: 'https://mais-sorriso.netlify.app',
  },
  {
    name: 'PiTech Finanças',
    category: 'Finanças',
    type: 'Sistema Web',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&q=80',
    link: 'https://pitech-financas.netlify.app',
  },
  {
    name: 'PiTech Maquiagem',
    category: 'Beleza',
    type: 'Landing Page',
    img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&q=80',
    link: 'https://pitech-maquiagem.netlify.app',
  },
  {
    name: 'Campos Construtora',
    category: 'Construção Civil',
    type: 'Site Institucional',
    img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80',
    link: 'https://camposconstrutora.netlify.app',
  },
  {
    name: 'Master Gestão',
    category: 'Gestão Empresarial',
    type: 'Sistema Web',
    img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&q=80',
    link: 'https://master-gestao.netlify.app',
  },
  {
    name: 'PiTech Rio Comerce',
    category: 'Comércio',
    type: 'E-commerce',
    img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500&q=80',
    link: 'https://pitech-riocomerce.netlify.app',
  },
  {
    name: 'Conecta Louvor',
    category: 'Religioso / Música',
    type: 'Site Institucional',
    img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=500&q=80',
    link: 'https://conecta-louvor.netlify.app',
  },
]

export default function Destinations() {
  const ref = useRef()
  const isVisible = useInView(ref, 0.1)

  return (
    <section className="destinations-section" id="projetos" ref={ref}>
      <div className="container">
        <div className="section-header">
          <p className="section-tag">Nosso Portfólio</p>
          <h2 className="section-title">Projetos <span className="highlight">Entregues</span></h2>
        </div>
        <div className="destinations-grid">
          {projects.map((proj, i) => (
            <div
              key={i}
              className={`destination-card fade-up ${isVisible ? 'visible' : ''}`}
              style={{ transitionDelay: `${i * 0.07}s` }}
            >
              <div className="destination-img">
                <img src={proj.img} alt={proj.name} />
                <div className="destination-overlay">
                  <span className="destination-price">{proj.type}</span>
                </div>
              </div>
              <div className="destination-info">
                <h3>{proj.name}</h3>
                <p><i className="fas fa-tag"></i> {proj.category}</p>
                <div className="destination-meta">
                  <a href={proj.link} target="_blank" rel="noopener noreferrer">
                    <i className="fas fa-external-link-alt"></i> Ver Projeto
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
