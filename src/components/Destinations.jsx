import { useRef, useState, useEffect } from 'react'
import useInView from '../hooks/useInView'
import '../styles/Destinations.css'

const templates = [
  {
    name: 'PiTech Solar',
    category: 'Energia Solar',
    type: 'Landing Page',
    status: 'Disponível',
    img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80',
    link: 'https://pitechsolar.netlify.app',
    desc: 'Template profissional para empresas de energia solar. Focado em geração de leads qualificados com formulário inteligente, seção de economia projetada e prova social integrada.',
    features: [
      'Formulário de captação de leads com validação',
      'Simulador de economia de energia',
      'Seção de depoimentos e cases reais',
      'Integração direta com WhatsApp',
      'SEO otimizado para buscas locais',
      'Design 100% responsivo (mobile-first)',
    ],
    tech: ['React', 'CSS3', 'Netlify'],
  },
  {
    name: 'Moda Fina',
    category: 'Moda & Vestuário',
    type: 'E-commerce',
    status: 'Disponível',
    img: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80',
    link: 'https://modafina.netlify.app',
    desc: 'Loja virtual completa para moda feminina com catálogo dinâmico, experiência de compra fluida e checkout integrado a múltiplos meios de pagamento.',
    features: [
      'Catálogo de produtos com filtros por categoria/cor/tamanho',
      'Carrinho de compras com persistência',
      'Checkout com Pix, cartão e boleto',
      'Painel administrativo para gerenciar produtos',
      'Galeria de looks e inspirações',
      'Notificações de pedido por e-mail',
    ],
    tech: ['React', 'Node.js', 'MySQL', 'Stripe'],
  },
  {
    name: 'Mais Sorriso',
    category: 'Odontologia',
    type: 'Site Institucional',
    status: 'Disponível',
    img: 'https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800&q=80',
    link: 'https://mais-sorriso.netlify.app',
    desc: 'Site institucional para clínicas odontológicas com apresentação completa dos serviços, galeria de transformações e agendamento facilitado via WhatsApp ou formulário.',
    features: [
      'Apresentação de todos os procedimentos oferecidos',
      'Galeria antes/depois com lightbox',
      'Agendamento via WhatsApp e formulário',
      'Google Maps integrado',
      'Depoimentos de pacientes',
      'Totalmente otimizado para SEO local',
    ],
    tech: ['React', 'CSS3', 'Netlify'],
  },
  {
    name: 'PiTech Maquiagem',
    category: 'Beleza & Estética',
    type: 'Landing Page',
    status: 'Disponível',
    img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
    link: 'https://pitech-maquiagem.netlify.app',
    desc: 'Landing page sofisticada para maquiadoras e profissionais de beleza. Portfólio visual impactante, agenda integrada e CTA direto no WhatsApp para converter visitas em clientes.',
    features: [
      'Portfólio de trabalhos em grid elegante',
      'Seção de serviços com tabela de preços',
      'Agendamento direto via WhatsApp',
      'Galeria com lightbox interativo',
      'Depoimentos de clientes com foto',
      'Link na bio personalizado para Instagram',
    ],
    tech: ['React', 'CSS3', 'Netlify'],
  },
  {
    name: 'Campos Construtora',
    category: 'Construção Civil',
    type: 'Site Institucional',
    status: 'Disponível',
    img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
    link: 'https://camposconstrutora.netlify.app',
    desc: 'Site corporativo completo para construtoras e incorporadoras. Portfólio de obras com timeline, credenciais técnicas e formulário de orçamento para captação de novos contratos.',
    features: [
      'Portfólio de obras com fotos e detalhes',
      'Formulário de solicitação de orçamento',
      'Seção de diferenciais e certificações',
      'Timeline de projetos concluídos',
      'Equipe técnica com perfis',
      'Alta performance e carregamento rápido',
    ],
    tech: ['React', 'CSS3', 'Netlify'],
  },
  {
    name: 'Master Gestão',
    category: 'Gestão Empresarial',
    type: 'Sistema Web',
    status: 'Disponível',
    img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    link: 'https://master-gestao.netlify.app',
    desc: 'Sistema web completo para gestão empresarial com dashboard analítico em tempo real, controle de tarefas por equipe e relatórios gerenciais exportáveis.',
    features: [
      'Dashboard com gráficos e KPIs em tempo real',
      'Gestão de tarefas com Kanban',
      'Controle de equipes e permissões por cargo',
      'Relatórios exportáveis em PDF e Excel',
      'Histórico completo de atividades',
      'Notificações internas e por e-mail',
    ],
    tech: ['React', 'Node.js', 'MySQL', 'Chart.js'],
  },
]

const saas = [
  {
    name: 'PiTech Finanças',
    category: 'Finanças',
    type: 'SaaS',
    status: 'Online',
    img: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    link: 'https://pitech-financas.techfluxar.com/landing',
    desc: 'Plataforma financeira completa para micro e pequenas empresas. Controle total de entradas, saídas, fluxo de caixa e geração de relatórios — tudo em um painel simples e intuitivo.',
    features: [
      'Controle de receitas e despesas por categoria',
      'Fluxo de caixa com projeções futuras',
      'Relatórios financeiros em PDF e Excel',
      'Suporte a múltiplas empresas no mesmo plano',
      'Categorias personalizáveis e recorrências',
      'Acesso via qualquer dispositivo (web)',
    ],
    tech: ['React', 'Node.js', 'MySQL', 'Chart.js'],
    price: 'A partir de R$ 29/mês',
  },
  {
    name: 'Conecta Louvor',
    category: 'Igrejas & Ministérios',
    type: 'SaaS',
    status: 'Online',
    img: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80',
    link: 'https://conecta-louvor.netlify.app',
    desc: 'Plataforma de gestão completa para igrejas e ministérios de louvor. Organiza repertório, escalas automáticas, membros e comunicados em um só lugar — acessível do celular ou computador.',
    features: [
      'Banco de músicas com cifras e letras',
      'Escalas automáticas com notificação por e-mail',
      'App mobile para músicos confirmarem presença',
      'Comunicados internos por grupo/ministério',
      'Histórico de cultos e repertórios usados',
      'Suporte a múltiplos ministérios',
    ],
    tech: ['React', 'Node.js', 'MySQL', 'Push Notifications'],
    price: 'A partir de R$ 39/mês',
  },
  {
    name: 'Capta Cliente',
    category: 'Prospecção & Marketing',
    type: 'SaaS',
    status: 'Online',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    link: 'https://captacliente.techfluxar.com',
    desc: 'Sistema de prospecção ativa que encontra leads no Google Maps, conecta seu WhatsApp e dispara mensagens em massa com follow-up automático — tudo sem sair da plataforma. Ideal para quem quer escalar vendas B2B com pouco esforço manual.',
    features: [
      'Busca de leads no Google Maps por ramo + cidade (nome, telefone, avaliações, site)',
      'Campanhas organizadas com acompanhamento de quem recebeu, respondeu ou ignorou',
      'Envio via WhatsApp conectado na plataforma com monitoramento em tempo real',
      'Busca automática diária de novos leads ao ativar uma campanha',
      'Follow-up automático para quem não respondeu no prazo definido',
      'Envio agendado — programa o disparo para o dia e hora que quiser',
      'Dashboard com total de leads, mensagens enviadas, taxa de resposta e conversão',
      'PWA — instala como app no celular e acessa pelo navegador',
    ],
    tech: ['React', 'Node.js', 'MySQL', 'Google Maps API', 'WhatsApp API'],
    price: 'A partir de R$ 49/mês',
  },
  {
    name: 'Barber Pro',
    category: 'Barbearia & Salão',
    type: 'SaaS',
    status: 'Online',
    img: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800&q=80',
    link: 'http://barberpro.techfluxar.com/',
    desc: 'Sistema de agendamento e gestão completa para barbearias. Clientes agendam online 24/7, o barbeiro gerencia sua agenda e o dono acompanha faturamento em tempo real.',
    features: [
      'Agendamento online 24h pelos clientes',
      'Agenda individual por barbeiro',
      'Lembretes automáticos via WhatsApp',
      'Controle financeiro com comissões',
      'Histórico e fidelidade de clientes',
      'Relatório de faturamento por período',
    ],
    tech: ['React', 'Node.js', 'MySQL', 'WhatsApp API'],
    price: 'A partir de R$ 59/mês',
  },
]

export default function Destinations() {
  const ref = useRef()
  const isVisible = useInView(ref, 0.1)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!selected) return
    const onKey = (e) => { if (e.key === 'Escape') setSelected(null) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [selected])

  const renderCards = (list, offset = 0) =>
    list.map((proj, i) => (
      <div
        key={i}
        className={`destination-card fade-up ${isVisible ? 'visible' : ''}`}
        style={{ transitionDelay: `${(i + offset) * 0.07}s` }}
        onClick={() => setSelected(proj)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && setSelected(proj)}
      >
        <div className="destination-img">
          <img src={proj.img} alt={proj.name} />
          <div className="destination-overlay">
            <span className="destination-price">{proj.type}</span>
          </div>
          <div className="destination-hover-cta">
            <i className="fas fa-eye"></i> Ver Detalhes
          </div>
        </div>
        <div className="destination-info">
          <h3>{proj.name}</h3>
          <p><i className="fas fa-tag"></i> {proj.category}</p>
        </div>
      </div>
    ))

  return (
    <section className="destinations-section" id="projetos" ref={ref}>
      <div className="container">
        <div className="section-header">
          <p className="section-tag">Nosso Portfólio</p>
          <h2 className="section-title">Nossas <span className="highlight">Soluções</span></h2>
        </div>

        <div className="destinations-group-label">
          <i className="fas fa-store"></i> Templates de Site à Venda
        </div>
        <div className="destinations-grid">
          {renderCards(templates, 0)}
        </div>

        <div className="destinations-group-label" style={{ marginTop: '3rem' }}>
          <i className="fas fa-cloud"></i> SaaS — Pagamento Mensal
        </div>
        <div className="destinations-grid">
          {renderCards(saas, templates.length)}
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {selected && (
        <div className="proj-modal-overlay" onClick={() => setSelected(null)}>
          <div className="proj-modal" onClick={e => e.stopPropagation()}>

            {/* Coluna esquerda */}
            <div className="proj-modal-left">
              <img src={selected.img} alt={selected.name} className="proj-modal-img" />
              <div className="proj-modal-img-gradient" />
              <div className="proj-modal-img-footer">
                <span className="proj-modal-badge">{selected.type}</span>
                <span className={`proj-modal-status ${selected.status === 'Online' ? 'online' : 'available'}`}>
                  <span className="proj-status-dot"></span>
                  {selected.status}
                </span>
              </div>
            </div>

            {/* Coluna direita */}
            <div className="proj-modal-right">
              <button className="proj-modal-close" onClick={() => setSelected(null)} aria-label="Fechar">
                <i className="fas fa-times"></i>
              </button>

              <div className="proj-modal-scroll">
                <p className="proj-modal-category">
                  <i className="fas fa-folder-open"></i> {selected.category}
                </p>
                <h2 className="proj-modal-title">{selected.name}</h2>
                <div className="proj-modal-divider" />
                <p className="proj-modal-desc">{selected.desc}</p>

                <div className="proj-modal-features">
                  <h4><i className="fas fa-check-double"></i> O que inclui</h4>
                  <ul>
                    {selected.features.map((f, i) => (
                      <li key={i}><i className="fas fa-check"></i> {f}</li>
                    ))}
                  </ul>
                </div>

                <div className="proj-modal-tech">
                  <h4><i className="fas fa-code"></i> Tecnologias</h4>
                  <div className="proj-tech-tags">
                    {selected.tech.map((t, i) => (
                      <span key={i} className="proj-tech-tag">{t}</span>
                    ))}
                  </div>
                </div>

                {selected.price && (
                  <div className="proj-modal-price">
                    <i className="fas fa-tag"></i> {selected.price}
                  </div>
                )}
              </div>

              <div className="proj-modal-actions">
                <a
                  href={`https://wa.me/5522981605315?text=${encodeURIComponent(`Olá! Tenho interesse no produto *${selected.name}*. Pode me passar mais detalhes?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="proj-btn proj-btn-whatsapp"
                >
                  <i className="fab fa-whatsapp"></i> Tenho Interesse
                </a>
                <a
                  href={selected.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="proj-btn proj-btn-outline"
                >
                  <i className="fas fa-external-link-alt"></i> Ver ao Vivo
                </a>
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  )
}
