import { useState, useEffect } from 'react'
import { API, getToken, authHeaders } from '../api'
import '../styles/Bookings.css'

export default function Bookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const [detail, setDetail] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  const load = async () => {
    const res = await fetch(`${API}/bookings`, { headers: { Authorization: `Bearer ${getToken()}` } })
    const data = await res.json()
    setBookings(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openDetail = async (id) => {
    const res = await fetch(`${API}/bookings/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } })
    const data = await res.json()
    setDetail(data)
    setShowDetail(true)
  }

  const updateStatus = async (id, status) => {
    await fetch(`${API}/bookings/${id}/status`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status })
    })
    load()
    if (detail?.id === id) openDetail(id)
  }

  const updatePayment = async (id, payment_status) => {
    await fetch(`${API}/bookings/${id}/payment`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify({ payment_status })
    })
    load()
    if (detail?.id === id) openDetail(id)
  }

  const filtered = bookings.filter(b => {
    const matchSearch = b.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      b.booking_code?.toLowerCase().includes(search.toLowerCase()) ||
      b.trip_title?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'todos' || b.status === filterStatus
    return matchSearch && matchStatus
  })

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-'
  const formatCurrency = (v) => parseFloat(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  if (loading) return (
    <div className="admin-loading">
      <i className="fas fa-spinner fa-spin"></i><span>Carregando...</span>
    </div>
  )

  return (
    <div className="bookings-page">
      <div className="page-header">
        <div>
          <h1>Reservas</h1>
          <p>Gerencie todas as reservas dos clientes</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Buscar por nome, código ou viagem..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-group">
          {['todos', 'pendente', 'confirmado', 'cancelado'].map(s => (
            <button key={s} className={`filter-btn ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <span className="toolbar-count">{filtered.length} reserva(s)</span>
      </div>

      <div className="admin-card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-ticket-alt"></i>
            <p>Nenhuma reserva encontrada</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>Viagem</th>
                  <th>Passageiros</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Pagamento</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td><span className="booking-code">{b.booking_code}</span></td>
                    <td>
                      <div className="client-cell">
                        <strong>{b.customer_name}</strong>
                        <small>{b.customer_email}</small>
                      </div>
                    </td>
                    <td>{b.trip_title || '-'}</td>
                    <td className="text-center">{b.passenger_count || b.total_passengers}</td>
                    <td><strong>{formatCurrency(b.total_price)}</strong></td>
                    <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                    <td><span className={`badge badge-pay-${b.payment_status}`}>{b.payment_status}</span></td>
                    <td>{formatDate(b.created_at)}</td>
                    <td>
                      <button className="action-btn view" onClick={() => openDetail(b.id)} title="Detalhes">
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
              <h2>Reserva #{detail.booking_code}</h2>
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
                  <h4><i className="fas fa-route"></i> Viagem</h4>
                  <div className="detail-info">
                    <p><strong>Destino:</strong> {detail.trip_title} - {detail.destination}</p>
                    <p><strong>Passageiros:</strong> {detail.total_passengers}</p>
                    <p><strong>Valor Total:</strong> {formatCurrency(detail.total_price)}</p>
                  </div>
                </div>
              </div>

              <div className="detail-actions-row">
                <div className="detail-action-group">
                  <label>Status da Reserva</label>
                  <div className="btn-group">
                    {['pendente', 'confirmado', 'cancelado'].map(s => (
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

              {detail.passengers?.length > 0 && (
                <div className="detail-section">
                  <h4><i className="fas fa-users"></i> Passageiros</h4>
                  <table className="admin-table admin-table-sm">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Assento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.passengers.map(p => (
                        <tr key={p.id}>
                          <td>{p.passenger_name}</td>
                          <td><span className="seat-badge">{p.seat_number || '-'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
