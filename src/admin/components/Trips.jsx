import { useState, useEffect } from 'react'
import { API, getToken, authHeaders as headers } from '../api'
import '../styles/Trips.css'

const emptyProject = {
  title: '', client_name: '', client_email: '', client_phone: '',
  description: '', type: 'site_template',
  status: 'em_andamento', total_value: '', paid_value: '',
  start_date: '', deadline: '', progress_percent: 0,
  technologies: '', repository_url: '', staging_url: '', production_url: '',
  notes: '', image_url: '', is_active: 1,
}

const typeLabels = {
  site_template: 'Template de Site',
  saas: 'Sistema SaaS',
  sistema_personalizado: 'Sistema Personalizado',
  app_web: 'Aplicativo Web',
  consultoria: 'Consultoria em TI',
}

const statusLabels = {
  em_andamento: 'Em Andamento',
  concluido: 'Concluído',
  pausado: 'Pausado',
  cancelado: 'Cancelado',
}

export default function Trips() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyProject)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [imageMode, setImageMode] = useState('url')
  const [uploading, setUploading] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [detailProject, setDetailProject] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const load = async () => {
    try {
      const res = await fetch(`${API}/projects`, { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      setProjects(Array.isArray(data) ? data : [])
    } catch { setProjects([]) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch(`${API}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      })
      const data = await res.json()
      if (data.url) setForm(prev => ({ ...prev, image_url: data.url }))
    } catch (err) {
      alert('Erro no upload: ' + err.message)
    }
    setUploading(false)
  }

  const openNew = () => {
    setEditing(null)
    setForm(emptyProject)
    setImageMode('url')
    setShowModal(true)
  }

  const openEdit = (project) => {
    setEditing(project.id)
    setForm({
      ...project,
      start_date: project.start_date?.split('T')[0] || '',
      deadline: project.deadline?.split('T')[0] || '',
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editing ? `${API}/projects/${editing}` : `${API}/projects`
      await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: headers(),
        body: JSON.stringify(form),
      })
      setShowModal(false)
      load()
    } catch (err) {
      alert('Erro ao salvar: ' + err.message)
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return
    await fetch(`${API}/projects/${id}`, { method: 'DELETE', headers: headers() })
    load()
  }

  const openDetail = async (projectId) => {
    setLoadingDetail(true)
    setShowDetail(true)
    try {
      const res = await fetch(`${API}/projects/${projectId}/stats`, { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      setDetailProject(data)
    } catch (err) {
      alert('Erro ao carregar detalhes: ' + err.message)
      setShowDetail(false)
    }
    setLoadingDetail(false)
  }

  const toggleActive = async (project) => {
    await fetch(`${API}/projects/${project.id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ ...project, is_active: project.is_active ? 0 : 1 }),
    })
    load()
  }

  const filtered = projects.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.client_name?.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-'
  const formatCurrency = (v) => parseFloat(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  if (loading) return (
    <div className="admin-loading">
      <i className="fas fa-spinner fa-spin"></i><span>Carregando...</span>
    </div>
  )

  return (
    <div className="trips-page">
      <div className="page-header">
        <div>
          <h1>Projetos</h1>
          <p>Gerencie todos os projetos de desenvolvimento</p>
        </div>
        <button className="btn-admin btn-admin-primary" onClick={openNew}>
          <i className="fas fa-plus"></i> Novo Projeto
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar projetos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="toolbar-count">{filtered.length} projeto(s)</span>
      </div>

      <div className="admin-card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-laptop-code"></i>
            <p>Nenhum projeto encontrado</p>
            <button className="btn-admin btn-admin-primary" onClick={openNew}>
              <i className="fas fa-plus"></i> Criar primeiro projeto
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Projeto</th>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Início</th>
                  <th>Prazo</th>
                  <th>Progresso</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(project => (
                  <tr key={project.id} onClick={() => openDetail(project.id)} className="clickable-row">
                    <td>
                      <div className="trip-cell">
                        {project.image_url ? (
                          <img src={project.image_url} alt={project.title} className="trip-thumb" />
                        ) : (
                          <div className="trip-thumb-placeholder"><i className="fas fa-laptop-code"></i></div>
                        )}
                        <div className="trip-info">
                          <strong>{project.title}</strong>
                          <span className="mini-badge">{typeLabels[project.type] || project.type}</span>
                        </div>
                      </div>
                    </td>
                    <td><i className="fas fa-building text-accent"></i> {project.client_name}</td>
                    <td><span className={`badge badge-type-${project.type}`}>{typeLabels[project.type] || project.type}</span></td>
                    <td><strong>{formatCurrency(project.total_value)}</strong></td>
                    <td>{formatDate(project.start_date)}</td>
                    <td>{formatDate(project.deadline)}</td>
                    <td>
                      <div className="progress-mini">
                        <div className="progress-mini-bar">
                          <div className="progress-mini-fill" style={{ width: `${project.progress_percent || 0}%` }}></div>
                        </div>
                        <span className="progress-mini-text">{project.progress_percent || 0}%</span>
                      </div>
                    </td>
                    <td>
                      <button className={`toggle-btn ${project.is_active ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleActive(project) }}>
                        {project.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn edit" onClick={(e) => { e.stopPropagation(); openEdit(project) }} title="Editar">
                          <i className="fas fa-pen"></i>
                        </button>
                        <button className="action-btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(project.id) }} title="Excluir">
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal trip-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2><i className="fas fa-chart-bar"></i> Detalhes do Projeto</h2>
              <button className="modal-close" onClick={() => setShowDetail(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {loadingDetail ? (
                <div className="admin-loading" style={{ padding: '60px 0' }}>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Carregando detalhes...</span>
                </div>
              ) : detailProject ? (() => {
                const { project, contracts = {}, revenue = {}, recentContracts = [] } = detailProject
                const progressPercent = project.progress_percent || 0
                const paidPercent = parseFloat(project.total_value) > 0
                  ? Math.round((parseFloat(project.paid_value || 0) / parseFloat(project.total_value)) * 100)
                  : 0
                const pendingValue = parseFloat(project.total_value || 0) - parseFloat(project.paid_value || 0)

                return (
                  <>
                    <div className="trip-detail-top">
                      {project.image_url ? (
                        <img src={project.image_url} alt={project.title} className="trip-detail-img" />
                      ) : (
                        <div className="trip-detail-img-placeholder"><i className="fas fa-laptop-code"></i></div>
                      )}
                      <div className="trip-detail-info">
                        <h3>{project.title}</h3>
                        <div className="trip-detail-meta">
                          <span><i className="fas fa-building"></i> {project.client_name}</span>
                          <span><i className="fas fa-calendar"></i> {formatDate(project.start_date)} - {formatDate(project.deadline)}</span>
                          <span className={`badge badge-status-${project.status}`}>{statusLabels[project.status] || project.status}</span>
                          <span className={`badge badge-type-${project.type}`}>{typeLabels[project.type] || project.type}</span>
                        </div>
                        {project.technologies && (
                          <div className="trip-detail-meta">
                            <span><i className="fas fa-code"></i> {project.technologies}</span>
                          </div>
                        )}
                        <div className="trip-detail-price">
                          <span className="trip-detail-current">{formatCurrency(project.total_value)}</span>
                          <span className="trip-detail-per">valor total</span>
                        </div>
                      </div>
                    </div>

                    <div className="trip-detail-stats">
                      <div className="td-stat-card td-stat-blue">
                        <div className="td-stat-icon"><i className="fas fa-tasks"></i></div>
                        <div className="td-stat-data">
                          <span className="td-stat-value">{progressPercent}%</span>
                          <span className="td-stat-label">Progresso</span>
                          <span className="td-stat-sub">{project.status === 'concluido' ? 'Projeto concluído' : 'Em desenvolvimento'}</span>
                        </div>
                      </div>
                      <div className="td-stat-card td-stat-green">
                        <div className="td-stat-icon"><i className="fas fa-file-contract"></i></div>
                        <div className="td-stat-data">
                          <span className="td-stat-value">{contracts.total || 0}</span>
                          <span className="td-stat-label">Contratos</span>
                          <span className="td-stat-sub">{contracts.active || 0} ativos / {contracts.completed || 0} concluídos</span>
                        </div>
                      </div>
                      <div className="td-stat-card td-stat-gold">
                        <div className="td-stat-icon"><i className="fas fa-dollar-sign"></i></div>
                        <div className="td-stat-data">
                          <span className="td-stat-value">{formatCurrency(project.paid_value)}</span>
                          <span className="td-stat-label">Faturamento</span>
                          <span className="td-stat-sub">de {formatCurrency(project.total_value)}</span>
                        </div>
                      </div>
                      <div className="td-stat-card td-stat-purple">
                        <div className="td-stat-icon"><i className="fas fa-hourglass-half"></i></div>
                        <div className="td-stat-data">
                          <span className="td-stat-value">{formatCurrency(pendingValue)}</span>
                          <span className="td-stat-label">Valor Pendente</span>
                          <span className="td-stat-sub">prazo: {formatDate(project.deadline)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="trip-detail-bars">
                      <div className="td-bar">
                        <div className="td-bar-header">
                          <span className="td-bar-label"><i className="fas fa-tasks"></i> Progresso do Desenvolvimento</span>
                          <span className="td-bar-percent">{progressPercent}%</span>
                        </div>
                        <div className="td-bar-track">
                          <div className="td-bar-fill td-bar-blue" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <span className="td-bar-sub">{statusLabels[project.status] || project.status}</span>
                      </div>
                      <div className="td-bar">
                        <div className="td-bar-header">
                          <span className="td-bar-label"><i className="fas fa-wallet"></i> Faturamento Recebido</span>
                          <span className="td-bar-percent">{paidPercent}%</span>
                        </div>
                        <div className="td-bar-track">
                          <div className="td-bar-fill td-bar-green" style={{ width: `${paidPercent}%` }}></div>
                        </div>
                        <span className="td-bar-sub">{formatCurrency(project.paid_value || 0)} de {formatCurrency(project.total_value)} recebido</span>
                      </div>
                    </div>

                    {(project.repository_url || project.staging_url || project.production_url) && (
                      <div className="project-links">
                        <h4><i className="fas fa-link"></i> Links do Projeto</h4>
                        {project.repository_url && (
                          <a href={project.repository_url} target="_blank" rel="noopener noreferrer" className="project-link">
                            <i className="fab fa-github"></i> Repositório
                          </a>
                        )}
                        {project.staging_url && (
                          <a href={project.staging_url} target="_blank" rel="noopener noreferrer" className="project-link">
                            <i className="fas fa-globe"></i> Homologação
                          </a>
                        )}
                        {project.production_url && (
                          <a href={project.production_url} target="_blank" rel="noopener noreferrer" className="project-link">
                            <i className="fas fa-rocket"></i> Produção
                          </a>
                        )}
                      </div>
                    )}

                    {project.notes && (
                      <div className="trip-detail-bookings">
                        <h4><i className="fas fa-sticky-note"></i> Notas Internas</h4>
                        <p style={{ fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.6, padding: '12px 16px', background: '#f9fafb', borderRadius: '10px' }}>
                          {project.notes}
                        </p>
                      </div>
                    )}

                    {recentContracts && recentContracts.length > 0 && (
                      <div className="trip-detail-bookings">
                        <h4><i className="fas fa-file-contract"></i> Contratos Vinculados</h4>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Código</th>
                              <th>Cliente</th>
                              <th>Status</th>
                              <th>Pagamento</th>
                              <th>Valor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentContracts.map(c => (
                              <tr key={c.id}>
                                <td><span className="booking-code">{c.contract_code}</span></td>
                                <td>{c.customer_name}</td>
                                <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                                <td><span className={`badge badge-${c.payment_status === 'pago' ? 'confirmado' : 'pendente'}`}>{c.payment_status}</span></td>
                                <td>{formatCurrency(c.total_value)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )
              })() : null}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Editar Projeto' : 'Novo Projeto'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSave} className="modal-body">
              <h4 className="form-section-title"><i className="fas fa-info-circle"></i> Informações do Projeto</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Título do Projeto</label>
                  <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="Ex: Site Corporativo ACME" />
                </div>
                <div className="form-group">
                  <label>Tipo de Projeto</label>
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    {Object.entries(typeLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea rows="3" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} placeholder="Descreva o escopo do projeto..."></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <h4 className="form-section-title"><i className="fas fa-user"></i> Cliente</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Nome do Cliente</label>
                  <input type="text" value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} required placeholder="Nome ou empresa" />
                </div>
                <div className="form-group">
                  <label>E-mail</label>
                  <input type="email" value={form.client_email || ''} onChange={e => setForm({...form, client_email: e.target.value})} placeholder="cliente@email.com" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Telefone</label>
                  <input type="text" value={form.client_phone || ''} onChange={e => setForm({...form, client_phone: e.target.value})} placeholder="(00) 00000-0000" />
                </div>
              </div>

              <h4 className="form-section-title"><i className="fas fa-dollar-sign"></i> Financeiro</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Valor Total (R$)</label>
                  <input type="number" step="0.01" value={form.total_value} onChange={e => setForm({...form, total_value: e.target.value})} required placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Valor Pago (R$)</label>
                  <input type="number" step="0.01" value={form.paid_value || ''} onChange={e => setForm({...form, paid_value: e.target.value})} placeholder="0.00" />
                </div>
              </div>

              <h4 className="form-section-title"><i className="fas fa-calendar-alt"></i> Cronograma</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Data de Início</label>
                  <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Prazo de Entrega</label>
                  <input type="date" value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Progresso ({form.progress_percent || 0}%)</label>
                <input type="range" min="0" max="100" value={form.progress_percent || 0} onChange={e => setForm({...form, progress_percent: parseInt(e.target.value)})} />
              </div>

              <h4 className="form-section-title"><i className="fas fa-code"></i> Técnico</h4>
              <div className="form-group">
                <label>Tecnologias</label>
                <input type="text" value={form.technologies || ''} onChange={e => setForm({...form, technologies: e.target.value})} placeholder="Ex: React, Node.js, PostgreSQL" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Repositório</label>
                  <input type="url" value={form.repository_url || ''} onChange={e => setForm({...form, repository_url: e.target.value})} placeholder="https://github.com/..." />
                </div>
                <div className="form-group">
                  <label>URL de Homologação</label>
                  <input type="url" value={form.staging_url || ''} onChange={e => setForm({...form, staging_url: e.target.value})} placeholder="https://staging.exemplo.com" />
                </div>
              </div>
              <div className="form-group">
                <label>URL de Produção</label>
                <input type="url" value={form.production_url || ''} onChange={e => setForm({...form, production_url: e.target.value})} placeholder="https://www.exemplo.com" />
              </div>

              <div className="form-group">
                <label>Notas Internas</label>
                <textarea rows="2" value={form.notes || ''} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Observações internas sobre o projeto..."></textarea>
              </div>

              <h4 className="form-section-title"><i className="fas fa-image"></i> Imagem</h4>
              <div className="form-group">
                <div className="image-tabs">
                  <button type="button" className={`image-tab ${imageMode === 'url' ? 'active' : ''}`} onClick={() => setImageMode('url')}>
                    <i className="fas fa-link"></i> Link
                  </button>
                  <button type="button" className={`image-tab ${imageMode === 'upload' ? 'active' : ''}`} onClick={() => setImageMode('upload')}>
                    <i className="fas fa-upload"></i> Upload
                  </button>
                </div>
                {imageMode === 'url' ? (
                  <input type="url" value={form.image_url || ''} onChange={e => setForm({...form, image_url: e.target.value})} placeholder="https://..." />
                ) : (
                  <div className="upload-area">
                    <label className="upload-label" htmlFor="project-image">
                      {uploading ? (
                        <><i className="fas fa-spinner fa-spin"></i> Enviando...</>
                      ) : (
                        <><i className="fas fa-cloud-upload-alt"></i> Clique para selecionar imagem</>
                      )}
                    </label>
                    <input type="file" id="project-image" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </div>
                )}
                {form.image_url && (
                  <div className="image-preview">
                    <img src={form.image_url} alt="Preview" onError={e => e.target.style.display = 'none'} />
                    <button type="button" className="image-remove" onClick={() => setForm({...form, image_url: ''})}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-check">
                  <input type="checkbox" id="is_active" checked={!!form.is_active} onChange={e => setForm({...form, is_active: e.target.checked ? 1 : 0})} />
                  <label htmlFor="is_active">Projeto Ativo</label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-admin btn-admin-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn-admin btn-admin-primary" disabled={saving}>
                  {saving ? <><i className="fas fa-spinner fa-spin"></i> Salvando...</> : <><i className="fas fa-check"></i> {editing ? 'Atualizar' : 'Criar'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
