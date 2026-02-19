import { useState, useEffect } from 'react'
import { API, getToken, authHeaders } from '../api'
import '../styles/Bookings.css'

export default function Bookings() {
  const [contracts, setContracts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [detail, setDetail] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  const load = async () => {
    try {
      const res = await fetch(`${API}/contracts`, { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      setContracts(Array.isArray(data) ? data : [])
    } catch { setContracts([]) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openDetail = async (id) => {
    const res = await fetch(`${API}/contracts/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } })
    const data = await res.json()
    setDetail(data)
    setShowDetail(true)
  }

  const updateStatus = async (id, status) => {
    await fetch(`${API}/contracts/${id}/status`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status })
    })
    load()
    if (detail?.id === id) openDetail(id)
  }

  const updatePayment = async (id, payment_status) => {
    await fetch(`${API}/contracts/${id}/payment`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify({ payment_status })
    })
    load()
    if (detail?.id === id) openDetail(id)
  }

  const filtered = contracts.filter(c => {
    const matchSearch = c.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.contract_code?.toLowerCase().includes(search.toLowerCase()) ||
      c.project_title?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'todos' || c.status === filterStatus
    return matchSearch && matchStatus
  })

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-'
  const formatCurrency = (v) => parseFloat(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const contractTypeLabels = {
    mensal: 'Mensal',
    avulso: 'Avulso',
    manutencao: 'Manutenção',
  }

  if (loading) return (
    <div className="admin-loading">
      <i className="fas fa-spinner fa-spin"></i><span>Carregando...</span>
    </div>
  )

  return (
    <div className="bookings-page">
      <div className="page-header">
        <div>
          <h1>Contratos</h1>
          <p>Gerencie todos os contratos e propostas</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Buscar por nome, código ou projeto..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-group">
          {['todos', 'pendente', 'ativo', 'concluido', 'cancelado'].map(s => (
            <button key={s} className={`filter-btn ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <span className="toolbar-count">{filtered.length} contrato(s)</span>
      </div>

      <div className="admin-card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-file-contract"></i>
            <p>Nenhum contrato encontrado</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Projeto</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Pagamento</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td><span className="booking-code">{c.contract_code}</span></td>
                    <td>
                      <div className="client-cell">
                        <strong>{c.customer_name}</strong>
                        <small>{c.customer_email}</small>
                      </div>
                    </td>
                    <td>{c.project_title || '-'}</td>
                    <td><span className={`badge badge-contract-${c.contract_type}`}>{contractTypeLabels[c.contract_type] || c.contract_type || '-'}</span></td>
                    <td><strong>{formatCurrency(c.total_value)}</strong></td>
                    <td><span className={`badge badge-${c.status}`}>{c.status}</span></td>
                    <td><span className={`badge badge-pay-${c.payment_status}`}>{c.payment_status}</span></td>
                    <td>{formatDate(c.created_at)}</td>
                    <td>
                      <button className="action-btn view" onClick={() => openDetail(c.id)} title="Detalhes">
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDetail && detail && (
        <div className="modal-overlay" onClick={() => setShowDetail(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Contrato #{detail.contract_code}</h2>
              <button className="modal-close" onClick={() => setShowDetail(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-section">
                  <h4><i className="fas fa-user"></i> Cliente</h4>
                  <div className="detail-info">
                    <p><strong>Nome:</strong> {detail.customer_name}</p>
                    <p><strong>Email:</strong> {detail.customer_email}</p>
                    <p><strong>Telefone:</strong> {detail.customer_phone}</p>
                  </div>
                </div>

                <div className="detail-section">
                  <h4><i className="fas fa-laptop-code"></i> Projeto</h4>
                  <div className="detail-info">
                    <p><strong>Projeto:</strong> {detail.project_title}</p>
                    <p><strong>Tipo:</strong> {contractTypeLabels[detail.contract_type] || detail.contract_type || '-'}</p>
                    {detail.start_date && <p><strong>Período:</strong> {formatDate(detail.start_date)} - {formatDate(detail.end_date)}</p>}
                    <p><strong>Valor Total:</strong> {formatCurrency(detail.total_value)}</p>
                  </div>
                </div>
              </div>

              {detail.description && (
                <div className="detail-section">
                  <h4><i className="fas fa-clipboard-list"></i> Escopo</h4>
                  <div className="detail-info">
                    <p>{detail.description}</p>
                  </div>
                </div>
              )}

              <div className="detail-actions-row">
                <div className="detail-action-group">
                  <label>Status do Contrato</label>
                  <div className="btn-group">
                    {['pendente', 'ativo', 'concluido', 'cancelado'].map(s => (
                      <button
                        key={s}
                        className={`btn-admin btn-admin-sm ${detail.status === s ? `btn-${s}` : 'btn-admin-ghost'}`}
                        onClick={() => updateStatus(detail.id, s)}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="detail-action-group">
                  <label>Status do Pagamento</label>
                  <div className="btn-group">
                    {['aguardando', 'pago', 'reembolsado'].map(s => (
                      <button
                        key={s}
                        className={`btn-admin btn-admin-sm ${detail.payment_status === s ? `btn-pay-${s}` : 'btn-admin-ghost'}`}
                        onClick={() => updatePayment(detail.id, s)}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
