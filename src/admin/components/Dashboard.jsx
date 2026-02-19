import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API, getToken } from '../api'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recentContracts, setRecentContracts] = useState([])
  const [revenueByProject, setRevenueByProject] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const headers = { Authorization: `Bearer ${getToken()}` }
    Promise.all([
      fetch(`${API}/dashboard/stats`, { headers }).then(r => r.json()),
      fetch(`${API}/dashboard/recent-contracts`, { headers }).then(r => r.json()),
      fetch(`${API}/dashboard/revenue-by-project`, { headers }).then(r => r.json()),
    ]).then(([statsData, contractsData, revenueData]) => {
      setStats(statsData)
      setRecentContracts(Array.isArray(contractsData) ? contractsData : [])
      setRevenueByProject(Array.isArray(revenueData) ? revenueData : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="admin-loading">
      <i className="fas fa-spinner fa-spin"></i>
      <span>Carregando...</span>
    </div>
  )

  const formatCurrency = (val) => {
    return parseFloat(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-'

  const statusLabels = {
    em_andamento: 'Em Andamento',
    concluido: 'Concluído',
    pausado: 'Pausado',
    cancelado: 'Cancelado',
  }

  const typeLabels = {
    site_template: 'Template de Site',
    saas: 'Sistema SaaS',
    sistema_personalizado: 'Sistema Personalizado',
    app_web: 'Aplicativo Web',
    consultoria: 'Consultoria em TI',
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral dos projetos e contratos</p>
        </div>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="stats-cards">
        <div className="stat-card stat-card-gold">
          <div className="stat-card-icon"><i className="fas fa-chart-line"></i></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{formatCurrency(stats?.revenue?.total)}</span>
            <span className="stat-card-label">Faturamento Geral</span>
            <span className="stat-card-sub">{formatCurrency(stats?.revenue?.paid)} recebido</span>
          </div>
        </div>

        <div className="stat-card stat-card-teal">
          <div className="stat-card-icon"><i className="fas fa-laptop-code"></i></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{formatCurrency(stats?.activeProjects?.total)}</span>
            <span className="stat-card-label">Projetos em Andamento</span>
            <span className="stat-card-sub">{formatCurrency(stats?.activeProjects?.paid)} recebido</span>
          </div>
        </div>

        <div className="stat-card stat-card-purple">
          <div className="stat-card-icon"><i className="fas fa-users"></i></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats?.clients || 0}</span>
            <span className="stat-card-label">Clientes Ativos</span>
            <span className="stat-card-sub">em {stats?.contracts?.total || 0} contratos</span>
          </div>
        </div>

        <div className="stat-card stat-card-blue">
          <div className="stat-card-icon"><i className="fas fa-code"></i></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats?.projects?.total || 0}</span>
            <span className="stat-card-label">Projetos</span>
            <span className="stat-card-sub">{stats?.projects?.active || 0} ativos</span>
          </div>
        </div>

        <div className="stat-card stat-card-green">
          <div className="stat-card-icon"><i className="fas fa-file-contract"></i></div>
          <div className="stat-card-info">
            <span className="stat-card-value">{stats?.contracts?.total || 0}</span>
            <span className="stat-card-label">Contratos</span>
            <span className="stat-card-sub">{stats?.contracts?.confirmed || 0} confirmados</span>
          </div>
        </div>
      </div>

      {/* ===== FATURAMENTO POR PROJETO ===== */}
      <div className="dashboard-card revenue-by-trip-card">
        <div className="card-header">
          <h3><i className="fas fa-laptop-code"></i> Faturamento por Projeto</h3>
        </div>
        <div className="card-body">
          {revenueByProject.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-inbox"></i>
              <p>Nenhum projeto ativo</p>
            </div>
          ) : (
            <div className="trip-revenue-list">
              {revenueByProject.map(project => {
                const paidPercent = parseFloat(project.total_value) > 0
                  ? Math.round((parseFloat(project.paid_value || 0) / parseFloat(project.total_value)) * 100)
                  : 0
                const progressPercent = project.progress_percent || 0

                return (
                  <div key={project.id} className="trip-revenue-item">
                    <div className="trip-revenue-header">
                      <div className="trip-revenue-title">
                        <strong>{project.title}</strong>
                        <span className="trip-revenue-dest">
                          <i className="fas fa-building"></i> {project.client_name}
                        </span>
                      </div>
                      <div className="trip-revenue-meta">
                        <span className={`badge badge-status-${project.status}`}>
                          {statusLabels[project.status] || project.status}
                        </span>
                        <span className={`badge badge-type-${project.type}`}>
                          {typeLabels[project.type] || project.type}
                        </span>
                        <span className="trip-revenue-date">
                          <i className="fas fa-calendar"></i> {formatDate(project.start_date)} - {formatDate(project.deadline)}
                        </span>
                      </div>
                    </div>

                    <div className="trip-revenue-stats">
                      <div className="trip-revenue-amount">
                        <span className="trip-revenue-total">{formatCurrency(project.total_value)}</span>
                        <span className="trip-revenue-detail">
                          {formatCurrency(project.paid_value || 0)} pago &bull; {formatCurrency(parseFloat(project.total_value || 0) - parseFloat(project.paid_value || 0))} pendente
                        </span>
                      </div>
                    </div>

                    <div className="trip-revenue-bars">
                      <div className="revenue-bar">
                        <div className="revenue-bar-label">Pagamento</div>
                        <div className="revenue-bar-track">
                          <div className="revenue-bar-fill revenue-bar-paid" style={{ width: `${paidPercent}%` }}></div>
                        </div>
                        <div className="revenue-bar-percent">{paidPercent}%</div>
                      </div>
                      <div className="revenue-bar">
                        <div className="revenue-bar-label">Progresso</div>
                        <div className="revenue-bar-track">
                          <div className="revenue-bar-fill revenue-bar-occupancy" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <div className="revenue-bar-percent">{progressPercent}%</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ===== CONTRATOS RECENTES + ACESSO RAPIDO ===== */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3><i className="fas fa-clock"></i> Contratos Recentes</h3>
            <Link to="/admin/contratos" className="card-link">Ver todos</Link>
          </div>
          <div className="card-body">
            {recentContracts.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-inbox"></i>
                <p>Nenhum contrato ainda</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Cliente</th>
                    <th>Projeto</th>
                    <th>Status</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {recentContracts.map(c => (
                    <tr key={c.id}>
                      <td><span className="booking-code">{c.contract_code}</span></td>
                      <td>{c.customer_name}</td>
                      <td>{c.project_title || '-'}</td>
                      <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                      <td>{formatCurrency(c.total_value)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="dashboard-card dashboard-card-small">
          <div className="card-header">
            <h3><i className="fas fa-bolt"></i> Acesso Rápido</h3>
          </div>
          <div className="card-body">
            <div className="quick-actions">
              <Link to="/admin/projetos" className="quick-action">
                <div className="quick-action-icon green"><i className="fas fa-plus"></i></div>
                <span>Novo Projeto</span>
              </Link>
              <Link to="/admin/contratos" className="quick-action">
                <div className="quick-action-icon blue"><i className="fas fa-list"></i></div>
                <span>Ver Contratos</span>
              </Link>
              <Link to="/admin/configuracoes" className="quick-action">
                <div className="quick-action-icon gold"><i className="fas fa-cog"></i></div>
                <span>Configurações</span>
              </Link>
              <a href="/" target="_blank" className="quick-action">
                <div className="quick-action-icon purple"><i className="fas fa-globe"></i></div>
                <span>Ver Site</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
