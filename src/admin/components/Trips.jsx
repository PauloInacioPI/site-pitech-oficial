import { useState, useEffect } from 'react'
import { API, getToken, authHeaders as headers } from '../api'
import '../styles/Trips.css'

const emptyTrip = {
  title: '', destination: '', description: '', price: '', original_price: '',
  duration: '', departure_date: '', return_date: '', image_url: '',
  category: 'praia', total_seats: 44, deposit_percent: 100, seat_rows: 11, seats_per_row: 4,
  bate_volta: 0, telefone: '', is_active: 1,
}

export default function Trips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyTrip)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [imageMode, setImageMode] = useState('url')
  const [uploading, setUploading] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [detailTrip, setDetailTrip] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const load = async () => {
    const res = await fetch(`${API}/trips`, { headers: { Authorization: `Bearer ${getToken()}` } })
    const data = await res.json()
    setTrips(Array.isArray(data) ? data : [])
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
    setForm(emptyTrip)
    setImageMode('url')
    setShowModal(true)
  }

  const openEdit = (trip) => {
    setEditing(trip.id)
    setForm({
      ...trip,
      departure_date: trip.departure_date?.split('T')[0] || '',
      return_date: trip.return_date?.split('T')[0] || '',
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const url = editing ? `${API}/trips/${editing}` : `${API}/trips`
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
    if (!confirm('Tem certeza que deseja excluir esta viagem?')) return
    await fetch(`${API}/trips/${id}`, { method: 'DELETE', headers: headers() })
    load()
  }

  const openDetail = async (tripId) => {
    setLoadingDetail(true)
    setShowDetail(true)
    try {
      const res = await fetch(`${API}/trips/${tripId}/stats`, { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      setDetailTrip(data)
    } catch (err) {
      alert('Erro ao carregar detalhes: ' + err.message)
      setShowDetail(false)
    }
    setLoadingDetail(false)
  }

  const toggleActive = async (trip) => {
    await fetch(`${API}/trips/${trip.id}`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ ...trip, is_active: trip.is_active ? 0 : 1 }),
    })
    load()
  }

  const filtered = trips.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.destination?.toLowerCase().includes(search.toLowerCase())
  )

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-'
  const formatCurrency = (v) => parseFloat(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  const categoryLabels = { praia: 'Praia', aventura: 'Aventura', cultural: 'Cultural', natureza: 'Natureza' }

  if (loading) return (
    <div className="admin-loading">
      <i className="fas fa-spinner fa-spin"></i><span>Carregando...</span>
    </div>
  )

  return (
    <div className="trips-page">
      <div className="page-header">
        <div>
          <h1>Viagens</h1>
          <p>Gerencie todas as viagens e excursões</p>
        </div>
        <button className="btn-admin btn-admin-primary" onClick={openNew}>
          <i className="fas fa-plus"></i> Nova Viagem
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar viagens..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="toolbar-count">{filtered.length} viagem(ns)</span>
      </div>

      <div className="admin-card">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-route"></i>
            <p>Nenhuma viagem encontrada</p>
            <button className="btn-admin btn-admin-primary" onClick={openNew}>
              <i className="fas fa-plus"></i> Criar primeira viagem
            </button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Viagem</th>
                  <th>Destino</th>
                  <th>Data</th>
                  <th>Preço</th>
                  <th>Categoria</th>
                  <th>Assentos</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(trip => (
                  <tr key={trip.id} onClick={() => openDetail(trip.id)} className="clickable-row">
                    <td>
                      <div className="trip-cell">
                        {trip.image_url ? (
                          <img src={trip.image_url} alt={trip.title} className="trip-thumb" />
                        ) : (
                          <div className="trip-thumb-placeholder"><i className="fas fa-image"></i></div>
                        )}
                        <div className="trip-info">
                          <strong>{trip.title}</strong>
                          {trip.bate_volta ? <span className="mini-badge">Bate-volta</span> : null}
                        </div>
                      </div>
                    </td>
                    <td><i className="fas fa-map-marker-alt text-accent"></i> {trip.destination}</td>
                    <td>{formatDate(trip.departure_date)}</td>
                    <td><strong>{formatCurrency(trip.price)}</strong></td>
                    <td><span className={`badge badge-cat-${trip.category}`}>{categoryLabels[trip.category] || trip.category}</span></td>
                    <td>{trip.total_seats}</td>
                    <td>
                      <button className={`toggle-btn ${trip.is_active ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleActive(trip) }}>
                        {trip.is_active ? 'Ativa' : 'Inativa'}
                      </button>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="action-btn edit" onClick={(e) => { e.stopPropagation(); openEdit(trip) }} title="Editar">
                          <i className="fas fa-pen"></i>
                        </button>
                        <button className="action-btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(trip.id) }} title="Excluir">
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
              <h2><i className="fas fa-chart-bar"></i> Detalhes da Viagem</h2>
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
              ) : detailTrip ? (() => {
                const { trip, seats, bookings, revenue, passengers, projection, recentBookings } = detailTrip
                const occupancyPercent = seats.total > 0 ? Math.round(((seats.total - seats.available) / seats.total) * 100) : 0
                const revenuePercent = projection > 0 ? Math.round((parseFloat(revenue.total) / projection) * 100) : 0
                const paidPercent = parseFloat(revenue.total) > 0 ? Math.round((parseFloat(revenue.paid) / parseFloat(revenue.total)) * 100) : 0

                return (
                  <>
                    <div className="trip-detail-top">
                      {trip.image_url ? (
                        <img src={trip.image_url} alt={trip.title} className="trip-detail-img" />
                      ) : (
                        <div className="trip-detail-img-placeholder"><i className="fas fa-image"></i></div>
                      )}
                      <div className="trip-detail-info">
                        <h3>{trip.title}</h3>
                        <div className="trip-detail-meta">
                          <span><i className="fas fa-map-marker-alt"></i> {trip.destination}</span>
                          <span><i className="fas fa-calendar"></i> {formatDate(trip.departure_date)} - {formatDate(trip.return_date)}</span>
                          {trip.duration && <span><i className="fas fa-clock"></i> {trip.duration}</span>}
                          <span className={`badge badge-cat-${trip.category}`}>{categoryLabels[trip.category] || trip.category}</span>
                        </div>
                        <div className="trip-detail-price">
                          {trip.original_price && parseFloat(trip.original_price) > parseFloat(trip.price) && (
                            <span className="trip-detail-original">{formatCurrency(trip.original_price)}</span>
                          )}
                          <span className="trip-detail-current">{formatCurrency(trip.price)}</span>
                          <span className="trip-detail-per">por pessoa</span>
                        </div>
                      </div>
                    </div>

                    <div className="trip-detail-stats">
                      <div className="td-stat-card td-stat-blue">
                        <div className="td-stat-icon"><i className="fas fa-chair"></i></div>
                        <div className="td-stat-data">
                          <span className="td-stat-value">{seats.available} / {seats.total}</span>
                          <span className="td-stat-label">Assentos Disponiveis</span>
                          <span className="td-stat-sub">{seats.reserved} reservados</span>
                        </div>
                      </div>
                      <div className="td-stat-card td-stat-green">
                        <div className="td-stat-icon"><i className="fas fa-ticket-alt"></i></div>
                        <div className="td-stat-data">
                          <span className="td-stat-value">{bookings.total}</span>
                          <span className="td-stat-label">Reservas</span>
                          <span className="td-stat-sub">{bookings.confirmed} confirmadas / {bookings.pending} pendentes</span>
                        </div>
                      </div>
                      <div className="td-stat-card td-stat-gold">
                        <div className="td-stat-icon"><i className="fas fa-dollar-sign"></i></div>
                        <div className="td-stat-data">
                          <span className="td-stat-value">{formatCurrency(revenue.total)}</span>
                          <span className="td-stat-label">Faturamento</span>
                          <span className="td-stat-sub">{formatCurrency(revenue.paid)} pago</span>
                        </div>
                      </div>
                      <div className="td-stat-card td-stat-purple">
                        <div className="td-stat-icon"><i className="fas fa-chart-line"></i></div>
                        <div className="td-stat-data">
                          <span className="td-stat-value">{formatCurrency(projection)}</span>
                          <span className="td-stat-label">Projecao Maxima</span>
                          <span className="td-stat-sub">{passengers} passageiros</span>
                        </div>
                      </div>
                    </div>

                    <div className="trip-detail-bars">
                      <div className="td-bar">
                        <div className="td-bar-header">
                          <span className="td-bar-label"><i className="fas fa-chair"></i> Ocupacao</span>
                          <span className="td-bar-percent">{occupancyPercent}%</span>
                        </div>
                        <div className="td-bar-track">
                          <div className="td-bar-fill td-bar-blue" style={{ width: `${occupancyPercent}%` }}></div>
                        </div>
                        <span className="td-bar-sub">{seats.total - seats.available} de {seats.total} assentos ocupados</span>
                      </div>
                      <div className="td-bar">
                        <div className="td-bar-header">
                          <span className="td-bar-label"><i className="fas fa-chart-line"></i> Faturamento vs Projecao</span>
                          <span className="td-bar-percent">{revenuePercent}%</span>
                        </div>
                        <div className="td-bar-track">
                          <div className="td-bar-fill td-bar-gold" style={{ width: `${Math.min(revenuePercent, 100)}%` }}></div>
                        </div>
                        <span className="td-bar-sub">{formatCurrency(revenue.total)} de {formatCurrency(projection)}</span>
                      </div>
                      <div className="td-bar">
                        <div className="td-bar-header">
                          <span className="td-bar-label"><i className="fas fa-wallet"></i> Pagamentos Recebidos</span>
                          <span className="td-bar-percent">{paidPercent}%</span>
                        </div>
                        <div className="td-bar-track">
                          <div className="td-bar-fill td-bar-green" style={{ width: `${paidPercent}%` }}></div>
                        </div>
                        <span className="td-bar-sub">{formatCurrency(revenue.paid)} de {formatCurrency(revenue.total)} recebido</span>
                      </div>
                    </div>

                    {recentBookings && recentBookings.length > 0 && (
                      <div className="trip-detail-bookings">
                        <h4><i className="fas fa-clock"></i> Ultimas Reservas</h4>
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Codigo</th>
                              <th>Cliente</th>
                              <th>Status</th>
                              <th>Pagamento</th>
                              <th>Valor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentBookings.map(b => (
                              <tr key={b.id}>
                                <td><span className="booking-code">{b.booking_code}</span></td>
                                <td>{b.customer_name}</td>
                                <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                                <td><span className={`badge badge-${b.payment_status === 'pago' ? 'confirmado' : 'pendente'}`}>{b.payment_status}</span></td>
                                <td>{formatCurrency(b.total_price)}</td>
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
              <h2>{editing ? 'Editar Viagem' : 'Nova Viagem'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleSave} className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Título</label>
                  <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Destino</label>
                  <input type="text" value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} required />
                </div>
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea rows="3" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})}></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Preço (R$)</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Preço Original (R$)</label>
                  <input type="number" step="0.01" value={form.original_price || ''} onChange={e => setForm({...form, original_price: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Entrada (%)</label>
                  <div className="deposit-input-wrap">
                    <input type="number" min="1" max="100" value={form.deposit_percent ?? 100} onChange={e => setForm({...form, deposit_percent: e.target.value})} />
                    <span className="deposit-hint">
                      {form.price && form.deposit_percent && form.deposit_percent < 100
                        ? `= ${formatCurrency(form.price * form.deposit_percent / 100)}/pessoa`
                        : 'Valor integral'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duração</label>
                  <input type="text" value={form.duration || ''} onChange={e => setForm({...form, duration: e.target.value})} placeholder="Ex: 3 dias" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Data de Ida</label>
                  <input type="date" value={form.departure_date} onChange={e => setForm({...form, departure_date: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Data de Volta</label>
                  <input type="date" value={form.return_date} onChange={e => setForm({...form, return_date: e.target.value})} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Categoria</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    <option value="praia">Praia</option>
                    <option value="aventura">Aventura</option>
                    <option value="cultural">Cultural</option>
                    <option value="natureza">Natureza</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Total de Assentos</label>
                  <input type="number" value={form.total_seats} onChange={e => setForm({...form, total_seats: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Telefone</label>
                  <input type="text" value={form.telefone || ''} onChange={e => setForm({...form, telefone: e.target.value})} />
                </div>
              </div>

              <div className="form-group">
                <label>Imagem</label>
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
                    <label className="upload-label" htmlFor="trip-image">
                      {uploading ? (
                        <><i className="fas fa-spinner fa-spin"></i> Enviando...</>
                      ) : (
                        <><i className="fas fa-cloud-upload-alt"></i> Clique para selecionar imagem</>
                      )}
                    </label>
                    <input type="file" id="trip-image" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
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
                  <input type="checkbox" id="bate_volta" checked={!!form.bate_volta} onChange={e => setForm({...form, bate_volta: e.target.checked ? 1 : 0})} />
                  <label htmlFor="bate_volta">Bate e Volta</label>
                </div>
                <div className="form-check">
                  <input type="checkbox" id="is_active" checked={!!form.is_active} onChange={e => setForm({...form, is_active: e.target.checked ? 1 : 0})} />
                  <label htmlFor="is_active">Viagem Ativa</label>
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
