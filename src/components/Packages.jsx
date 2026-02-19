import { useRef } from 'react'
import useInView from '../hooks/useInView'
import '../styles/Packages.css'

const packages = [
  {
    name: 'Starter',
    price: '1.497',
    features: [
      { text: 'Página única para seu negócio', included: true },
      { text: 'Design moderno e profissional', included: true },
      { text: 'Formulário de contato', included: true },
      { text: 'Botão direto pro WhatsApp', included: true },
      { text: 'Área para você editar conteúdo', included: false },
      { text: 'Suporte prioritário', included: false },
    ],
  },
  {
    name: 'Pro',
    price: '3.497',
    featured: true,
    features: [
      { text: 'Site completo com todas as páginas', included: true },
      { text: 'Design personalizado para sua marca', included: true },
      { text: 'Formulários com envio automático', included: true },
      { text: 'Botão direto pro WhatsApp', included: true },
      { text: 'Área para você editar conteúdo', included: true },
      { text: 'Suporte prioritário', included: true },
    ],
  },
  {
    name: 'Enterprise',
    price: 'Sob consulta',
    features: [
      { text: 'Sistema feito sob medida', included: true },
      { text: 'Banco de dados próprio', included: true },
      { text: 'Cobranças e pagamentos online', included: true },
      { text: 'Conexão com outros sistemas', included: true },
      { text: 'Painel completo de gestão', included: true },
      { text: 'Suporte dedicado', included: true },
    ],
  },
]

export default function Packages() {
  const ref = useRef()
  const isVisible = useInView(ref, 0.1)

  return (
    <section className="packages-section" id="pacotes" ref={ref}>
      <div className="packages-bg">
        <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1600&q=80" alt="Código" className="packages-bg-img" />
        <div className="packages-overlay"></div>
      </div>
      <div className="container packages-content">
        <div className="section-header light">
          <p className="section-tag">Nossos Planos</p>
          <h2 className="section-title">Escolha o Plano <span className="highlight">Ideal</span></h2>
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
                  {pkg.price !== 'Sob consulta' && <span className="currency">R$</span>}
                  <span className="amount">{pkg.price}</span>
                  {pkg.price !== 'Sob consulta' && <span className="period">/projeto</span>}
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
                Solicitar Orçamento
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
