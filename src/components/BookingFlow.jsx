import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/BookingFlow.css'

const API = 'http://localhost:3002/api/public'

export default function BookingFlow({ showAll = false }) {
  const navigate = useNavigate()
  const [trips, setTrips] = useState([])
  const [isMobile, setIsMobile] = useState(false)
  const [step, setStep] = useState(null) // null=closed, detail, seats, checkout, payment, confirmation
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [seats, setSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [payMethod, setPayMethod] = useState(null)
  const [pixData, setPixData] = useState(null)
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetch(`${API}/trips`).then(r => r.json()).then(data => {
      setTrips(Array.isArray(data) ? data : [])
    })

    // Detectar retorno do Stripe Checkout
    const params = new URLSearchParams(window.location.search)
    const bookingCode = params.get('booking_success')
    if (bookingCode) {
      window.history.replaceState({}, '', window.location.pathname)
      fetch(`${API}/bookings/${bookingCode}`)
        .then(r => r.json())
        .then(data => {
          if (data.id) {
            setBooking({ booking_id: data.id, booking_code: data.booking_code, total_price: data.total_price, total_passengers: data.total_passengers })
            setSelectedTrip(data)
            setStep('stripe_success')
            document.body.style.overflow = 'hidden'
          }
        })
        .catch(() => {})
    }
  }, [])

  const openTrip = async (trip) => {
    setLoading(true)
    setStep('detail')
    document.body.style.overflow = 'hidden'
    try {
      const res = await fetch(`${API}/trips/${trip.id}`)
      const data = await res.json()
      setSelectedTrip(data)
    } catch {
      setStep(null)
      document.body.style.overflow = ''
    }
    setLoading(false)
  }

  const closeModal = () => {
    setStep(null)
    setSelectedTrip(null)
    setSelectedSeats([])
    setBooking(null)
    setPixData(null)
    setPayMethod(null)
    document.body.style.overflow = ''
  }

  const openSeats = async () => {
    setLoading(true)
    const res = await fetch(`${API}/trips/${selectedTrip.id}/seats`)
    const data = await res.json()
    setSeats(Array.isArray(data) ? data : [])
    setSelectedSeats([])
    setStep('seats')
    setLoading(false)
  }

  const toggleSeat = (seat) => {
    if (seat.status !== 'disponivel') return
    setSelectedSeats(prev =>
      prev.find(s => s.id === seat.id)
        ? prev.filter(s => s.id !== seat.id)
        : [...prev, seat]
    )
  }

  const openCheckout = () => {
    setForm({ name: '', email: '', phone: '' })
    setPayMethod(null)
    setStep('checkout')
  }

  const handleBook = async () => {
    if (!form.name || !form.email || !form.phone) {
      alert('Preencha todos os campos')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: selectedTrip.id,
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          seat_ids: selectedSeats.map(s => s.id),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBooking(data)
      setStep('payment')
    } catch (err) {
      alert(err.message)
    }
    setLoading(false)
  }

  const generatePix = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/bookings/${booking.booking_id}/pix`, { method: 'POST' })
      const data = await res.json()
      setPixData(data)
      setPayMethod('pix')
    } catch {
      alert('Erro ao gerar PIX')
    }
    setLoading(false)
  }

  const handleStripeCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/bookings/${booking.booking_id}/checkout`, { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Erro ao criar checkout')
      }
    } catch (err) {
      alert('Erro ao processar pagamento: ' + err.message)
    }
    setLoading(false)
  }

  const copyPix = () => {
    navigator.clipboard.writeText(pixData.pix_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const goToConfirmation = () => setStep('confirmation')

  const formatCurrency = (v) => parseFloat(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-'
  const categoryIcons = { praia: 'fa-umbrella-beach', aventura: 'fa-mountain', cultural: 'fa-landmark', natureza: 'fa-leaf' }

  const seatRows = []
  if (seats.length > 0) {
    const maxRow = Math.max(...seats.map(s => s.seat_row))
    for (let r = 1; r <= maxRow; r++) {
      const row = seats.filter(s => s.seat_row === r).sort((a, b) => a.column_position.localeCompare(b.column_position))
      seatRows.push(row)
    }
  }

  const getSeatClass = (seat) => {
    if (seat.status === 'reservado' || seat.status === 'bloqueado') return 'seat-taken'
    if (selectedSeats.find(s => s.id === seat.id)) return 'seat-selected'
    return 'seat-available'
  }

  const isWindow = (col) => col === 'A' || col === 'D'

  const stepTitles = {
    detail: 'Detalhes da Excursão',
    seats: 'Escolher Assentos',
    checkout: 'Finalizar Reserva',
    payment: 'Pagamento',
    confirmation: 'Confirmação',
  }

  const goBack = () => {
    if (step === 'detail') closeModal()
    else if (step === 'seats') setStep('detail')
    else if (step === 'checkout') setStep('seats')
  }

  const limit = showAll ? Infinity : (isMobile ? 3 : 6)
  const visibleTrips = trips.slice(0, limit)
  const hasMore = trips.length > limit

  return (
    <section className={`booking-flow ${showAll ? 'booking-flow-full' : ''}`} id="excursoes">
      <div className="container">
        <div className="section-header">
          <p className="section-tag">{showAll ? 'Todas as' : 'Próximas'} Excursões</p>
          <h2 className="section-title">{showAll ? 'Nossas ' : 'Reserve Sua '}<span className="highlight">{showAll ? 'Excursões' : 'Aventura'}</span></h2>
        </div>
        {trips.length === 0 ? (
          <div className="bf-empty">
            <i className="fas fa-bus"></i>
            <p>Nenhuma excursão disponível no momento</p>
          </div>
        ) : (
          <div className="bf-trips-grid">
            {visibleTrips.map(trip => (
              <div key={trip.id} className="bf-trip-card" onClick={() => openTrip(trip)}>
                <div className="bf-trip-img">
                  <img src={trip.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80'} alt={trip.title} />
                  <div className="bf-trip-badges">
                    {trip.bate_volta ? <span className="bf-badge bf-badge-bv">Bate-volta</span> : null}
                    <span className="bf-badge bf-badge-cat">
                      <i className={`fas ${categoryIcons[trip.category] || 'fa-map'}`}></i> {trip.category}
                    </span>
                  </div>
                  {trip.original_price && parseFloat(trip.original_price) > parseFloat(trip.price) && (
                    <div className="bf-discount">
                      -{Math.round((1 - trip.price / trip.original_price) * 100)}%
                    </div>
                  )}
                </div>
                <div className="bf-trip-body">
                  <h3>{trip.title}</h3>
                  <p className="bf-trip-dest"><i className="fas fa-map-marker-alt"></i> {trip.destination}</p>
                  <div className="bf-trip-meta">
                    <span><i className="fas fa-calendar"></i> {formatDate(trip.departure_date)}</span>
                    {trip.duration && <span><i className="fas fa-clock"></i> {trip.duration}</span>}
                  </div>
                  <div className="bf-trip-footer">
                    {trip.original_price && parseFloat(trip.original_price) > parseFloat(trip.price) && (
                      <span className="bf-price-old">{formatCurrency(trip.original_price)}</span>
                    )}
                    <span className="bf-price">{formatCurrency(trip.price)}</span>
                    <span className="bf-price-per">/pessoa</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {hasMore && (
          <div className="bf-ver-todas">
            <button onClick={() => navigate('/excursoes')}>
              Ver todas as excursões <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* === MODAL === */}
      {step && (
        <div className="bf-modal-overlay" onClick={closeModal}>
          <div className="bf-modal" onClick={e => e.stopPropagation()}>
            <div className="bf-modal-header">
              {step !== 'payment' && step !== 'confirmation' && (
                <button className="bf-modal-back" onClick={goBack}>
                  <i className="fas fa-arrow-left"></i>
                </button>
              )}
              <h3 className="bf-modal-title">{stepTitles[step]}</h3>
              <button className="bf-modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="bf-modal-body">
              {loading && !selectedTrip && (
                <div className="bf-modal-loading">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Carregando...</p>
                </div>
              )}

              {/* DETALHES */}
              {step === 'detail' && selectedTrip && (
                <div className="bf-detail-modal">
                  <div className="bf-detail-top">
                    <div className="bf-detail-img">
                      <img src={selectedTrip.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&q=80'} alt={selectedTrip.title} />
                      {selectedTrip.original_price && parseFloat(selectedTrip.original_price) > parseFloat(selectedTrip.price) && (
                        <div className="bf-detail-discount">-{Math.round((1 - selectedTrip.price / selectedTrip.original_price) * 100)}%</div>
                      )}
                    </div>
                    <div className="bf-detail-info">
                      <span className="bf-badge bf-badge-cat">
                        <i className={`fas ${categoryIcons[selectedTrip.category] || 'fa-map'}`}></i> {selectedTrip.category}
                      </span>
                      <h2>{selectedTrip.title}</h2>
                      <p className="bf-detail-dest"><i className="fas fa-map-marker-alt"></i> {selectedTrip.destination}</p>
                      <div className="bf-detail-facts">
                        <span className="bf-fact"><i className="fas fa-calendar-alt"></i> {formatDate(selectedTrip.departure_date)}</span>
                        <span className="bf-fact"><i className="fas fa-calendar-check"></i> {formatDate(selectedTrip.return_date)}</span>
                        {selectedTrip.duration && <span className="bf-fact"><i className="fas fa-clock"></i> {selectedTrip.duration}</span>}
                        <span className="bf-fact"><i className="fas fa-users"></i> {selectedTrip.total_seats} lugares</span>
                      </div>
                      <div className="bf-detail-price-row">
                        {selectedTrip.original_price && parseFloat(selectedTrip.original_price) > parseFloat(selectedTrip.price) && (
                          <span className="bf-price-old">{formatCurrency(selectedTrip.original_price)}</span>
                        )}
                        <span className="bf-price-big">{formatCurrency(selectedTrip.price)}</span>
                        <span className="bf-price-per">/pessoa</span>
                        <button className="bf-btn bf-btn-primary" onClick={openSeats} disabled={loading}>
                          {loading ? <><i className="fas fa-spinner fa-spin"></i> Carregando...</> : <><i className="fas fa-ticket-alt"></i> Escolher Assentos</>}
                        </button>
                      </div>
                    </div>
                  </div>

                  {(selectedTrip.description || selectedTrip.included?.length > 0) && (
                    <div className="bf-detail-content">
                      {selectedTrip.description && (
                        <div className="bf-detail-card">
                          <h4><i className="fas fa-info-circle"></i> Sobre a viagem</h4>
                          <p>{selectedTrip.description}</p>
                        </div>
                      )}
                      {selectedTrip.included?.length > 0 && (
                        <div className="bf-detail-card">
                          <h4><i className="fas fa-check-double"></i> O que está incluso</h4>
                          <ul className="bf-included-list">
                            {selectedTrip.included.map((item, i) => (
                              <li key={i}><i className="fas fa-check-circle"></i> {item.item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ASSENTOS */}
              {step === 'seats' && (
                <div className="bf-seats-modal">
                  <div className="bf-seats-left">
                    <div className="bf-legend">
                      <div className="bf-legend-item"><div className="seat-mini seat-available"></div> Disponível</div>
                      <div className="bf-legend-item"><div className="seat-mini seat-selected"></div> Selecionado</div>
                      <div className="bf-legend-item"><div className="seat-mini seat-taken"></div> Ocupado</div>
                      <div className="bf-legend-item"><i className="fas fa-wind bf-window-icon"></i> Janela</div>
                    </div>

                    <div className="bus-container">
                      <div className="bus-front">
                        <i className="fas fa-steering-wheel"></i>
                        <span>Motorista</span>
                      </div>
                      <div className="bus-seats">
                        {seatRows.map((row, i) => (
                          <div key={i} className="bus-row">
                            <div className="bus-pair">
                              {row.filter(s => s.column_position === 'A' || s.column_position === 'B').map(seat => (
                                <button key={seat.id} className={`seat ${getSeatClass(seat)}`} onClick={() => toggleSeat(seat)} disabled={seat.status !== 'disponivel'} title={`${seat.seat_number} - ${isWindow(seat.column_position) ? 'Janela' : 'Corredor'}`}>
                                  <span className="seat-num">{seat.seat_number}</span>
                                  {isWindow(seat.column_position) && <i className="fas fa-wind seat-window-icon"></i>}
                                </button>
                              ))}
                            </div>
                            <div className="bus-aisle"></div>
                            <div className="bus-pair">
                              {row.filter(s => s.column_position === 'C' || s.column_position === 'D').map(seat => (
                                <button key={seat.id} className={`seat ${getSeatClass(seat)}`} onClick={() => toggleSeat(seat)} disabled={seat.status !== 'disponivel'} title={`${seat.seat_number} - ${isWindow(seat.column_position) ? 'Janela' : 'Corredor'}`}>
                                  <span className="seat-num">{seat.seat_number}</span>
                                  {isWindow(seat.column_position) && <i className="fas fa-wind seat-window-icon"></i>}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bf-seats-right">
                    <div className="bf-summary-card-inline">
                      <h4>{selectedTrip.title}</h4>
                      <p className="bf-summary-dest"><i className="fas fa-map-marker-alt"></i> {selectedTrip.destination}</p>
                      <p className="bf-summary-date"><i className="fas fa-calendar"></i> {formatDate(selectedTrip.departure_date)}</p>
                      <div className="bf-summary-divider"></div>
                      <div className="bf-summary-label">Assentos selecionados ({selectedSeats.length})</div>
                      {selectedSeats.length === 0 ? (
                        <p className="bf-summary-empty">Nenhum assento selecionado</p>
                      ) : (
                        <div className="bf-selected-seats">
                          {selectedSeats.map(seat => (
                            <div key={seat.id} className="bf-selected-seat">
                              <span className="bf-seat-badge">{seat.seat_number}</span>
                              <span className="bf-seat-type">{isWindow(seat.column_position) ? 'Janela' : 'Corredor'}</span>
                              <span className="bf-seat-price">{formatCurrency(selectedTrip.price)}</span>
                              <button className="bf-seat-remove" onClick={() => toggleSeat(seat)}><i className="fas fa-times"></i></button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="bf-summary-divider"></div>
                      <div className="bf-summary-total">
                        <span>Total</span>
                        <strong>{formatCurrency(selectedTrip.price * selectedSeats.length)}</strong>
                      </div>
                      <button className="bf-btn bf-btn-primary bf-btn-full" disabled={selectedSeats.length === 0} onClick={openCheckout}>
                        <i className="fas fa-arrow-right"></i> Continuar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CHECKOUT */}
              {step === 'checkout' && (
                <div className="bf-checkout-modal">
                  <div className="bf-checkout-form">
                    <h2>Dados do Passageiro</h2>
                    <p>Preencha seus dados para finalizar a reserva</p>
                    <div className="bf-form-group">
                      <label><i className="fas fa-user"></i> Nome Completo</label>
                      <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Seu nome completo" />
                    </div>
                    <div className="bf-form-group">
                      <label><i className="fas fa-envelope"></i> E-mail</label>
                      <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="seu@email.com" />
                    </div>
                    <div className="bf-form-group">
                      <label><i className="fas fa-phone"></i> Telefone / WhatsApp</label>
                      <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="(21) 99999-9999" />
                    </div>
                  </div>

                  <div className="bf-checkout-summary">
                    <div className="bf-summary-card-inline">
                      <h4>Resumo da Reserva</h4>
                      <div className="bf-summary-divider"></div>
                      <p className="bf-summary-trip"><strong>{selectedTrip.title}</strong></p>
                      <p className="bf-summary-dest"><i className="fas fa-map-marker-alt"></i> {selectedTrip.destination}</p>
                      <p className="bf-summary-date"><i className="fas fa-calendar"></i> {formatDate(selectedTrip.departure_date)}</p>
                      <div className="bf-summary-divider"></div>
                      <div className="bf-summary-label">Assentos ({selectedSeats.length})</div>
                      <div className="bf-checkout-seats">
                        {selectedSeats.map(s => (
                          <span key={s.id} className="bf-seat-chip">{s.seat_number} <small>({isWindow(s.column_position) ? 'Janela' : 'Corredor'})</small></span>
                        ))}
                      </div>
                      <div className="bf-summary-divider"></div>
                      <div className="bf-summary-row">
                        <span>{selectedSeats.length}x assento</span>
                        <span>{formatCurrency(selectedTrip.price * selectedSeats.length)}</span>
                      </div>
                      <div className="bf-summary-total">
                        <span>Total</span>
                        <strong>{formatCurrency(selectedTrip.price * selectedSeats.length)}</strong>
                      </div>
                      <button className="bf-btn bf-btn-primary bf-btn-full" onClick={handleBook} disabled={loading}>
                        {loading ? <><i className="fas fa-spinner fa-spin"></i> Processando...</> : <><i className="fas fa-lock"></i> Finalizar Reserva</>}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* PAGAMENTO */}
              {step === 'payment' && booking && (() => {
                const isPartial = booking.deposit_amount && parseFloat(booking.deposit_amount) < parseFloat(booking.total_price)
                return (
                <div className="bf-payment-modal">
                  <div className="bf-payment-header">
                    <div className="bf-payment-icon"><i className="fas fa-check-circle"></i></div>
                    <h2>Reserva Realizada!</h2>
                    <p>Código: <strong className="bf-code">{booking.booking_code}</strong></p>
                  </div>

                  {isPartial && (
                    <div className="bf-deposit-info">
                      <div className="bf-deposit-row">
                        <span>Valor total</span>
                        <span>{formatCurrency(booking.total_price)}</span>
                      </div>
                      <div className="bf-deposit-row bf-deposit-highlight">
                        <span><i className="fas fa-tag"></i> Entrada ({booking.deposit_percent}%)</span>
                        <span>{formatCurrency(booking.deposit_amount)}</span>
                      </div>
                      <div className="bf-deposit-row bf-deposit-remaining">
                        <span>Restante a pagar</span>
                        <span>{formatCurrency(booking.total_price - booking.deposit_amount)}</span>
                      </div>
                    </div>
                  )}

                  <h3 className="bf-payment-title">Escolha a forma de pagamento</h3>
                  {isPartial && <p className="bf-payment-subtitle">Pagamento da entrada de {formatCurrency(booking.deposit_amount)}</p>}
                  <div className="bf-payment-methods">
                    <div className={`bf-pay-card ${payMethod === 'pix' ? 'active' : ''}`} onClick={generatePix}>
                      <div className="bf-pay-icon"><i className="fas fa-qrcode"></i></div>
                      <h4>PIX</h4>
                      <p>Pagamento instantâneo via QR Code</p>
                      <span className="bf-pay-tag">Sem juros</span>
                    </div>
                    <div className={`bf-pay-card ${payMethod === 'card' ? 'active' : ''}`} onClick={handleStripeCheckout}>
                      <div className="bf-pay-icon"><i className="fas fa-credit-card"></i></div>
                      <h4>Cartao de Credito</h4>
                      <p>Pagamento seguro via Stripe</p>
                      <span className="bf-pay-tag">Ate 12x</span>
                    </div>
                  </div>

                  {payMethod === 'pix' && pixData && (
                    <div className="bf-pix-box">
                      <div className="bf-pix-qr"><img src={pixData.pix_qrcode} alt="QR Code PIX" /></div>
                      <div className="bf-pix-info">
                        <h4>Escaneie o QR Code ou copie o código</h4>
                        <p>Valor: <strong>{formatCurrency(pixData.amount)}</strong></p>
                        <div className="bf-pix-code-box">
                          <input type="text" value={pixData.pix_code} readOnly />
                          <button onClick={copyPix} className="bf-btn bf-btn-sm">
                            {copied ? <><i className="fas fa-check"></i> Copiado!</> : <><i className="fas fa-copy"></i> Copiar</>}
                          </button>
                        </div>
                        <p className="bf-pix-note">Após o pagamento, a confirmação será automática.</p>
                      </div>
                      <button className="bf-btn bf-btn-primary bf-btn-full" onClick={goToConfirmation} style={{ marginTop: 20 }}>
                        <i className="fas fa-check"></i> Já realizei o pagamento
                      </button>
                    </div>
                  )}

                  {payMethod === 'card' && (
                    <div className="bf-card-box">
                      <div className="bf-card-info" style={{ textAlign: 'center', padding: '30px 20px' }}>
                        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#111827', marginBottom: 12 }}></i>
                        <h4>Redirecionando para pagamento seguro...</h4>
                        <p>Voce sera redirecionado para a pagina do Stripe.</p>
                      </div>
                    </div>
                  )}
                </div>
                )
              })()}

              {/* SUCESSO STRIPE */}
              {step === 'stripe_success' && booking && selectedTrip && (
                <div className="bf-confirmation-modal">
                  <div className="bf-conf-icon" style={{ color: '#22c55e' }}><i className="fas fa-check-circle"></i></div>
                  <h2>Pagamento Confirmado!</h2>
                  <p className="bf-conf-sub">Seu pagamento foi processado com sucesso</p>
                  <div className="bf-conf-code">{booking.booking_code}</div>
                  <div className="bf-conf-card">
                    <div className="bf-conf-row">
                      <div className="bf-conf-item"><label>Excursao</label><strong>{selectedTrip.title || selectedTrip.trip_title}</strong></div>
                      <div className="bf-conf-item"><label>Destino</label><strong>{selectedTrip.destination}</strong></div>
                    </div>
                    <div className="bf-conf-row">
                      <div className="bf-conf-item"><label>Passageiros</label><strong>{booking.total_passengers}</strong></div>
                      <div className="bf-conf-item"><label>Valor Total</label><strong className="bf-conf-total">{formatCurrency(booking.total_price)}</strong></div>
                    </div>
                  </div>
                  <p className="bf-conf-note"><i className="fas fa-credit-card"></i> Pagamento via cartao confirmado automaticamente</p>
                  <button className="bf-btn bf-btn-primary" onClick={closeModal}><i className="fas fa-check"></i> Fechar</button>
                </div>
              )}

              {/* CONFIRMAÇÃO */}
              {step === 'confirmation' && booking && (
                <div className="bf-confirmation-modal">
                  <div className="bf-conf-icon"><i className="fas fa-check-circle"></i></div>
                  <h2>Reserva Confirmada!</h2>
                  <p className="bf-conf-sub">Guarde seu código de reserva</p>
                  <div className="bf-conf-code">{booking.booking_code}</div>
                  <div className="bf-conf-card">
                    <div className="bf-conf-row">
                      <div className="bf-conf-item"><label>Excursão</label><strong>{selectedTrip.title}</strong></div>
                      <div className="bf-conf-item"><label>Destino</label><strong>{selectedTrip.destination}</strong></div>
                    </div>
                    <div className="bf-conf-row">
                      <div className="bf-conf-item"><label>Data da Viagem</label><strong>{formatDate(selectedTrip.departure_date)}</strong></div>
                      <div className="bf-conf-item"><label>Retorno</label><strong>{formatDate(selectedTrip.return_date)}</strong></div>
                    </div>
                    <div className="bf-conf-row">
                      <div className="bf-conf-item"><label>Passageiros</label><strong>{booking.total_passengers}</strong></div>
                      <div className="bf-conf-item"><label>Assentos</label><strong>{selectedSeats.map(s => s.seat_number).join(', ')}</strong></div>
                    </div>
                    <div className="bf-conf-row">
                      <div className="bf-conf-item"><label>Passageiro</label><strong>{form.name}</strong></div>
                      <div className="bf-conf-item"><label>Valor Total</label><strong className="bf-conf-total">{formatCurrency(booking.total_price)}</strong></div>
                    </div>
                  </div>
                  <p className="bf-conf-note"><i className="fas fa-envelope"></i> E-mail de confirmação enviado para <strong>{form.email}</strong></p>
                  <button className="bf-btn bf-btn-primary" onClick={closeModal}><i className="fas fa-check"></i> Fechar</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
