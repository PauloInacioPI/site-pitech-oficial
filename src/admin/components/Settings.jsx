import { useState, useEffect, useRef } from 'react'
import { API, getToken } from '../api'
import '../styles/Settings.css'

const emptyStripeAccount = {
  business_name: '', owner_name: '', cpf_cnpj: '', birth_date: '', email: '', phone: '',
  address_line: '', address_city: '', address_state: '', address_postal: '',
  bank_name: '', bank_agency: '', bank_account: '', bank_account_type: 'checking',
}

const bankList = [
  'Banco do Brasil (001)', 'Bradesco (237)', 'Itau (341)', 'Santander (033)',
  'Caixa Economica (104)', 'Nubank (260)', 'Inter (077)', 'C6 Bank (336)',
  'PagBank (290)', 'Mercado Pago (323)', 'Outro',
]

export default function Settings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [bannerSlides, setBannerSlides] = useState([])
  const [editingSlide, setEditingSlide] = useState(null)
  const [slideForm, setSlideForm] = useState({})
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadingTraveler, setUploadingTraveler] = useState(false)
  const bannerFileRef = useRef(null)
  const travelerFileRef = useRef(null)

  // Stripe Account
  const [stripeAccount, setStripeAccount] = useState(emptyStripeAccount)
  const [stripeStatus, setStripeStatus] = useState(null)
  const [savingStripe, setSavingStripe] = useState(false)
  const [connectingStripe, setConnectingStripe] = useState(false)
  const [stripeMsg, setStripeMsg] = useState(null)

  useEffect(() => {
    fetch(`${API}/settings`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(data => {
        setSettings(data)
        const slides = typeof data.banner_slides === 'string' ? JSON.parse(data.banner_slides) : (data.banner_slides || [])
        setBannerSlides(slides)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    // Carregar dados de pagamento
    fetch(`${API}/payment-config`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(data => {
        if (data) {
          setStripeAccount(prev => ({ ...prev, ...data }))
          setStripeStatus({
            has_account: data.has_stripe_account,
            status: data.status,
            charges_enabled: data.stripe_charges_enabled,
            payouts_enabled: data.stripe_payouts_enabled,
          })
        }
      })
      .catch(() => {})
  }, [])

  const saveStripeAccount = async () => {
    setSavingStripe(true)
    setStripeMsg(null)
    try {
      const res = await fetch(`${API}/payment-config`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(stripeAccount),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStripeMsg({ type: 'success', text: 'Dados salvos com sucesso!' })
      setTimeout(() => setStripeMsg(null), 3000)
    } catch (err) {
      setStripeMsg({ type: 'error', text: err.message })
    }
    setSavingStripe(false)
  }

  const connectStripe = async () => {
    if (!confirm('Confirma a criacao da conta no Stripe com os dados informados?')) return
    setConnectingStripe(true)
    setStripeMsg(null)
    try {
      const res = await fetch(`${API}/payment-config/create`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStripeMsg({ type: 'success', text: 'Conta conectada ao Stripe! Aguarde a verificacao.' })
      setStripeStatus({ has_account: true, status: 'verificando', charges_enabled: data.charges_enabled, payouts_enabled: data.payouts_enabled })
    } catch (err) {
      setStripeMsg({ type: 'error', text: err.message })
    }
    setConnectingStripe(false)
  }

  const refreshStripeStatus = async () => {
    try {
      const res = await fetch(`${API}/payment-config/status`, { headers: { Authorization: `Bearer ${getToken()}` } })
      const data = await res.json()
      setStripeStatus({ has_account: true, status: data.status, charges_enabled: data.charges_enabled, payouts_enabled: data.payouts_enabled })
      setStripeMsg({ type: 'success', text: `Status: ${data.status}` })
      setTimeout(() => setStripeMsg(null), 3000)
    } catch (err) {
      setStripeMsg({ type: 'error', text: err.message })
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      await fetch(`${API}/settings`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, banner_slides: bannerSlides }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      alert('Erro ao salvar: ' + err.message)
    }
    setSaving(false)
  }

  const updateSocial = (key, value) => {
    const social = typeof settings.social_links === 'string' ? JSON.parse(settings.social_links) : (settings.social_links || {})
    social[key] = value
    setSettings({ ...settings, social_links: social })
  }

  const updateStats = (key, value) => {
    const st = typeof settings.stats === 'string' ? JSON.parse(settings.stats) : (settings.stats || {})
    st[key] = value
    setSettings({ ...settings, stats: st })
  }

  const getSocial = (key) => {
    const social = typeof settings?.social_links === 'string' ? JSON.parse(settings.social_links) : (settings?.social_links || {})
    return social[key] || ''
  }

  const getStat = (key) => {
    const st = typeof settings?.stats === 'string' ? JSON.parse(settings.stats) : (settings?.stats || {})
    return st[key] || ''
  }

  // Banner Slides Management
  const openSlideEditor = (index) => {
    if (index === null) {
      // New slide - if it's the first slide, type=text, otherwise type=image
      const type = bannerSlides.length === 0 ? 'text' : 'image'
      setSlideForm({
        type,
        bg_image: '',
        subtitle: '', title: '', description: '',
        traveler_image: '', badge_number: '', badge_text: '',
        btn_primary_text: '', btn_primary_link: '',
        btn_secondary_text: '', btn_secondary_link: '',
      })
      setEditingSlide('new')
    } else {
      setSlideForm({ ...bannerSlides[index] })
      setEditingSlide(index)
    }
  }

  const saveSlide = () => {
    if (!slideForm.bg_image) {
      alert('Informe a imagem de fundo do slide')
      return
    }
    const updated = [...bannerSlides]
    if (editingSlide === 'new') {
      updated.push(slideForm)
    } else {
      updated[editingSlide] = slideForm
    }
    setBannerSlides(updated)
    setEditingSlide(null)
    setSlideForm({})
  }

  const deleteSlide = (index) => {
    if (!confirm('Remover este slide?')) return
    setBannerSlides(bannerSlides.filter((_, i) => i !== index))
  }

  const moveSlide = (index, dir) => {
    const updated = [...bannerSlides]
    const target = index + dir
    if (target < 0 || target >= updated.length) return
    ;[updated[index], updated[target]] = [updated[target], updated[index]]
    setBannerSlides(updated)
  }

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingBanner(true)
    const formData = new FormData()
    formData.append('image', file)
    try {
      const res = await fetch(`${API}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      })
      const data = await res.json()
      if (data.url) setSlideForm({ ...slideForm, bg_image: data.url })
    } catch (err) {
      alert('Erro no upload: ' + err.message)
    }
    setUploadingBanner(false)
  }

  const handleTravelerUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploadingTraveler(true)
    const formData = new FormData()
    formData.append('image', file)
    try {
      const res = await fetch(`${API}/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      })
      const data = await res.json()
      if (data.url) setSlideForm({ ...slideForm, traveler_image: data.url })
    } catch (err) {
      alert('Erro no upload: ' + err.message)
    }
    setUploadingTraveler(false)
  }

  if (loading) return (
    <div className="admin-loading">
      <i className="fas fa-spinner fa-spin"></i><span>Carregando...</span>
    </div>
  )

  if (!settings) return (
    <div className="empty-state">
      <i className="fas fa-exclamation-triangle"></i>
      <p>Configurações não encontradas</p>
    </div>
  )

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h1>Configurações</h1>
          <p>Configure as informações do site</p>
        </div>
        {saved && (
          <div className="save-success">
            <i className="fas fa-check-circle"></i> Salvo com sucesso!
          </div>
        )}
      </div>

      <form onSubmit={handleSave}>
        {/* Banner Carousel Management */}
        <div className="admin-card settings-card banner-card">
          <div className="card-header">
            <h3><i className="fas fa-images"></i> Banner Carrossel</h3>
            <button type="button" className="btn-admin btn-admin-primary btn-admin-sm" onClick={() => openSlideEditor(null)}>
              <i className="fas fa-plus"></i> Novo Slide
            </button>
          </div>
          <div className="card-body">
            {bannerSlides.length === 0 ? (
              <div className="empty-slides">
                <i className="fas fa-image"></i>
                <p>Nenhum slide adicionado</p>
              </div>
            ) : (
              <div className="slides-list">
                {bannerSlides.map((slide, i) => (
                  <div key={i} className="slide-item">
                    <div className="slide-preview">
                      <img src={slide.bg_image} alt={`Slide ${i + 1}`} />
                      <div className="slide-badge-type">
                        {slide.type === 'text' ? (
                          <><i className="fas fa-font"></i> Com Texto</>
                        ) : (
                          <><i className="fas fa-image"></i> Imagem</>
                        )}
                      </div>
                    </div>
                    <div className="slide-info">
                      <h4>Slide {i + 1}</h4>
                      {slide.type === 'text' && <p>{slide.subtitle} {slide.title}</p>}
                      {slide.type === 'image' && <p>Apenas imagem</p>}
                    </div>
                    <div className="slide-actions">
                      <button type="button" className="btn-icon" onClick={() => moveSlide(i, -1)} disabled={i === 0} title="Mover para cima">
                        <i className="fas fa-chevron-up"></i>
                      </button>
                      <button type="button" className="btn-icon" onClick={() => moveSlide(i, 1)} disabled={i === bannerSlides.length - 1} title="Mover para baixo">
                        <i className="fas fa-chevron-down"></i>
                      </button>
                      <button type="button" className="btn-icon btn-icon-edit" onClick={() => openSlideEditor(i)} title="Editar">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button type="button" className="btn-icon btn-icon-delete" onClick={() => deleteSlide(i)} title="Remover">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Slide Editor Modal */}
        {editingSlide !== null && (
          <div className="modal-overlay" onClick={() => setEditingSlide(null)}>
            <div className="modal-content slide-modal" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2><i className="fas fa-edit"></i> {editingSlide === 'new' ? 'Novo Slide' : `Editar Slide ${editingSlide + 1}`}</h2>
                <button type="button" className="modal-close" onClick={() => setEditingSlide(null)}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body slide-editor-body">
                <div className="form-group">
                  <label>Tipo do Slide</label>
                  <select value={slideForm.type || 'image'} onChange={e => setSlideForm({ ...slideForm, type: e.target.value })}>
                    <option value="text">Com Texto (Título, descrição, botões)</option>
                    <option value="image">Apenas Imagem</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Imagem de Fundo *</label>
                  <div className="image-input-group">
                    <input type="text" value={slideForm.bg_image || ''} onChange={e => setSlideForm({ ...slideForm, bg_image: e.target.value })} placeholder="URL da imagem ou faça upload" />
                    <input type="file" ref={bannerFileRef} accept="image/*" onChange={handleBannerUpload} style={{ display: 'none' }} />
                    <button type="button" className="btn-admin btn-admin-outline btn-admin-sm" onClick={() => bannerFileRef.current?.click()} disabled={uploadingBanner}>
                      {uploadingBanner ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-upload"></i>}
                    </button>
                  </div>
                  {slideForm.bg_image && (
                    <div className="image-preview-sm">
                      <img src={slideForm.bg_image} alt="Preview" />
                    </div>
                  )}
                </div>

                {slideForm.type === 'text' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Subtítulo</label>
                        <input type="text" value={slideForm.subtitle || ''} onChange={e => setSlideForm({ ...slideForm, subtitle: e.target.value })} placeholder="Ex: Soluções em" />
                      </div>
                      <div className="form-group">
                        <label>Título</label>
                        <input type="text" value={slideForm.title || ''} onChange={e => setSlideForm({ ...slideForm, title: e.target.value })} placeholder="Ex: Tecnologia" />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Descrição</label>
                      <textarea value={slideForm.description || ''} onChange={e => setSlideForm({ ...slideForm, description: e.target.value })} rows={3} placeholder="Descrição do slide para o site da empresa..." />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Texto Botão Primário</label>
                        <input type="text" value={slideForm.btn_primary_text || ''} onChange={e => setSlideForm({ ...slideForm, btn_primary_text: e.target.value })} placeholder="Ex: Nossos Serviços" />
                      </div>
                      <div className="form-group">
                        <label>Link Botão Primário</label>
                        <input type="text" value={slideForm.btn_primary_link || ''} onChange={e => setSlideForm({ ...slideForm, btn_primary_link: e.target.value })} placeholder="Ex: #projetos" />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Texto Botão Secundário</label>
                        <input type="text" value={slideForm.btn_secondary_text || ''} onChange={e => setSlideForm({ ...slideForm, btn_secondary_text: e.target.value })} placeholder="Ex: Saiba Mais" />
                      </div>
                      <div className="form-group">
                        <label>Link Botão Secundário</label>
                        <input type="text" value={slideForm.btn_secondary_link || ''} onChange={e => setSlideForm({ ...slideForm, btn_secondary_link: e.target.value })} placeholder="Ex: #sobre" />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Imagem Ilustrativa</label>
                      <div className="image-input-group">
                        <input type="text" value={slideForm.traveler_image || ''} onChange={e => setSlideForm({ ...slideForm, traveler_image: e.target.value })} placeholder="URL da imagem ou faça upload" />
                        <input type="file" ref={travelerFileRef} accept="image/*" onChange={handleTravelerUpload} style={{ display: 'none' }} />
                        <button type="button" className="btn-admin btn-admin-outline btn-admin-sm" onClick={() => travelerFileRef.current?.click()} disabled={uploadingTraveler}>
                          {uploadingTraveler ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-upload"></i>}
                        </button>
                      </div>
                      {slideForm.traveler_image && (
                        <div className="image-preview-sm">
                          <img src={slideForm.traveler_image} alt="Preview" />
                        </div>
                      )}
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Badge Número</label>
                        <input type="text" value={slideForm.badge_number || ''} onChange={e => setSlideForm({ ...slideForm, badge_number: e.target.value })} placeholder="Ex: 60%" />
                      </div>
                      <div className="form-group">
                        <label>Badge Texto</label>
                        <input type="text" value={slideForm.badge_text || ''} onChange={e => setSlideForm({ ...slideForm, badge_text: e.target.value })} placeholder="Ex: DESCONTO" />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-admin btn-admin-outline" onClick={() => setEditingSlide(null)}>Cancelar</button>
                <button type="button" className="btn-admin btn-admin-primary" onClick={saveSlide}>
                  <i className="fas fa-check"></i> Salvar Slide
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="settings-grid">
          <div className="admin-card settings-card">
            <div className="card-header">
              <h3><i className="fas fa-phone-alt"></i> Contato</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label>Telefone</label>
                <input type="text" value={settings.contact_phone || ''} onChange={e => setSettings({...settings, contact_phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input type="email" value={settings.contact_email || ''} onChange={e => setSettings({...settings, contact_email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>WhatsApp (com DDI)</label>
                <input type="text" value={settings.contact_whatsapp || ''} onChange={e => setSettings({...settings, contact_whatsapp: e.target.value})} placeholder="5521999999999" />
              </div>
            </div>
          </div>

          <div className="admin-card settings-card">
            <div className="card-header">
              <h3><i className="fas fa-share-alt"></i> Redes Sociais</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label><i className="fab fa-instagram text-accent"></i> Instagram</label>
                <input type="url" value={getSocial('instagram')} onChange={e => updateSocial('instagram', e.target.value)} placeholder="https://instagram.com/..." />
              </div>
              <div className="form-group">
                <label><i className="fab fa-facebook text-accent"></i> Facebook</label>
                <input type="url" value={getSocial('facebook')} onChange={e => updateSocial('facebook', e.target.value)} placeholder="https://facebook.com/..." />
              </div>
              <div className="form-group">
                <label><i className="fab fa-youtube text-accent"></i> YouTube</label>
                <input type="url" value={getSocial('youtube')} onChange={e => updateSocial('youtube', e.target.value)} placeholder="https://youtube.com/..." />
              </div>
              <div className="form-group">
                <label><i className="fab fa-linkedin text-accent"></i> LinkedIn</label>
                <input type="url" value={getSocial('linkedin')} onChange={e => updateSocial('linkedin', e.target.value)} placeholder="https://linkedin.com/company/..." />
              </div>
              <div className="form-group">
                <label><i className="fab fa-github text-accent"></i> GitHub</label>
                <input type="url" value={getSocial('github')} onChange={e => updateSocial('github', e.target.value)} placeholder="https://github.com/..." />
              </div>
            </div>
          </div>

          <div className="admin-card settings-card">
            <div className="card-header">
              <h3><i className="fas fa-chart-bar"></i> Estatísticas do Site</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label>Projetos Entregues</label>
                <input type="text" value={getStat('projetos_entregues')} onChange={e => updateStats('projetos_entregues', e.target.value)} placeholder="Ex: 150+" />
              </div>
              <div className="form-group">
                <label>Clientes Ativos</label>
                <input type="text" value={getStat('clientes_ativos')} onChange={e => updateStats('clientes_ativos', e.target.value)} placeholder="Ex: 80+" />
              </div>
              <div className="form-group">
                <label>Anos de Experiência</label>
                <input type="text" value={getStat('anos_experiencia')} onChange={e => updateStats('anos_experiencia', e.target.value)} placeholder="Ex: 10+" />
              </div>
              <div className="form-group">
                <label>Satisfação</label>
                <input type="text" value={getStat('satisfacao')} onChange={e => updateStats('satisfacao', e.target.value)} placeholder="Ex: 98%" />
              </div>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button type="submit" className="btn-admin btn-admin-primary btn-admin-lg" disabled={saving}>
            {saving ? <><i className="fas fa-spinner fa-spin"></i> Salvando...</> : <><i className="fas fa-save"></i> Salvar Configurações</>}
          </button>
        </div>
      </form>

      {/* Stripe Connect / Dados Bancários */}
      <div className="admin-card settings-card stripe-card">
        <div className="card-header">
          <h3><i className="fab fa-stripe-s"></i> Dados Bancários / Stripe Connect</h3>
          {stripeStatus?.has_account && (
            <button type="button" className="btn-admin btn-admin-outline btn-admin-sm" onClick={refreshStripeStatus}>
              <i className="fas fa-sync-alt"></i> Atualizar Status
            </button>
          )}
        </div>
        <div className="card-body">
          {stripeMsg && (
            <div className={`stripe-msg stripe-msg-${stripeMsg.type}`}>
              <i className={`fas ${stripeMsg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
              {stripeMsg.text}
            </div>
          )}

          {stripeStatus?.has_account && (
            <div className="stripe-status-cards">
              <div className={`stripe-status-badge stripe-status-${stripeStatus.status}`}>
                <i className={`fas ${stripeStatus.status === 'ativo' ? 'fa-check-circle' : stripeStatus.status === 'restrito' ? 'fa-ban' : stripeStatus.status === 'verificando' ? 'fa-clock' : 'fa-hourglass-half'}`}></i>
                <div>
                  <span className="stripe-status-label">Status</span>
                  <span className="stripe-status-value">{stripeStatus.status === 'ativo' ? 'Ativo' : stripeStatus.status === 'verificando' ? 'Verificando' : stripeStatus.status === 'restrito' ? 'Restrito' : 'Pendente'}</span>
                </div>
              </div>
              <div className={`stripe-status-badge ${stripeStatus.charges_enabled ? 'stripe-status-ativo' : 'stripe-status-pendente'}`}>
                <i className={`fas ${stripeStatus.charges_enabled ? 'fa-credit-card' : 'fa-times-circle'}`}></i>
                <div>
                  <span className="stripe-status-label">Pagamentos</span>
                  <span className="stripe-status-value">{stripeStatus.charges_enabled ? 'Habilitado' : 'Desabilitado'}</span>
                </div>
              </div>
              <div className={`stripe-status-badge ${stripeStatus.payouts_enabled ? 'stripe-status-ativo' : 'stripe-status-pendente'}`}>
                <i className={`fas ${stripeStatus.payouts_enabled ? 'fa-university' : 'fa-times-circle'}`}></i>
                <div>
                  <span className="stripe-status-label">Repasses</span>
                  <span className="stripe-status-value">{stripeStatus.payouts_enabled ? 'Habilitado' : 'Desabilitado'}</span>
                </div>
              </div>
            </div>
          )}

          <div className="stripe-section-title"><i className="fas fa-building"></i> Dados da Empresa</div>
          <div className="form-row">
            <div className="form-group">
              <label>Nome da Empresa</label>
              <input type="text" value={stripeAccount.business_name || ''} onChange={e => setStripeAccount({ ...stripeAccount, business_name: e.target.value })} placeholder="Ex: PiTech Sistemas Ltda" />
            </div>
            <div className="form-group">
              <label>Nome do Responsável</label>
              <input type="text" value={stripeAccount.owner_name || ''} onChange={e => setStripeAccount({ ...stripeAccount, owner_name: e.target.value })} placeholder="Nome completo" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>CPF / CNPJ</label>
              <input type="text" value={stripeAccount.cpf_cnpj || ''} onChange={e => setStripeAccount({ ...stripeAccount, cpf_cnpj: e.target.value })} placeholder="Somente números" />
            </div>
            <div className="form-group">
              <label>Data de Nascimento</label>
              <input type="date" value={stripeAccount.birth_date || ''} onChange={e => setStripeAccount({ ...stripeAccount, birth_date: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>E-mail</label>
              <input type="email" value={stripeAccount.email || ''} onChange={e => setStripeAccount({ ...stripeAccount, email: e.target.value })} placeholder="email@empresa.com" />
            </div>
            <div className="form-group">
              <label>Telefone</label>
              <input type="text" value={stripeAccount.phone || ''} onChange={e => setStripeAccount({ ...stripeAccount, phone: e.target.value })} placeholder="+5521999999999" />
            </div>
          </div>

          <div className="stripe-section-title"><i className="fas fa-map-marker-alt"></i> Endereço</div>
          <div className="form-group">
            <label>Rua / Logradouro</label>
            <input type="text" value={stripeAccount.address_line || ''} onChange={e => setStripeAccount({ ...stripeAccount, address_line: e.target.value })} placeholder="Rua, número, complemento" />
          </div>
          <div className="form-row form-row-3">
            <div className="form-group">
              <label>Cidade</label>
              <input type="text" value={stripeAccount.address_city || ''} onChange={e => setStripeAccount({ ...stripeAccount, address_city: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select value={stripeAccount.address_state || ''} onChange={e => setStripeAccount({ ...stripeAccount, address_state: e.target.value })}>
                <option value="">Selecione</option>
                {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>CEP</label>
              <input type="text" value={stripeAccount.address_postal || ''} onChange={e => setStripeAccount({ ...stripeAccount, address_postal: e.target.value })} placeholder="00000-000" />
            </div>
          </div>

          <div className="stripe-section-title"><i className="fas fa-university"></i> Dados Bancários</div>
          <div className="form-row">
            <div className="form-group">
              <label>Banco</label>
              <select value={stripeAccount.bank_name || ''} onChange={e => setStripeAccount({ ...stripeAccount, bank_name: e.target.value })}>
                <option value="">Selecione o banco</option>
                {bankList.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Tipo de Conta</label>
              <select value={stripeAccount.bank_account_type || 'checking'} onChange={e => setStripeAccount({ ...stripeAccount, bank_account_type: e.target.value })}>
                <option value="checking">Conta Corrente</option>
                <option value="savings">Poupança</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Agência</label>
              <input type="text" value={stripeAccount.bank_agency || ''} onChange={e => setStripeAccount({ ...stripeAccount, bank_agency: e.target.value })} placeholder="0000" />
            </div>
            <div className="form-group">
              <label>Conta</label>
              <input type="text" value={stripeAccount.bank_account || ''} onChange={e => setStripeAccount({ ...stripeAccount, bank_account: e.target.value })} placeholder="00000-0" />
            </div>
          </div>

          <div className="stripe-actions">
            <button type="button" className="btn-admin btn-admin-primary" onClick={saveStripeAccount} disabled={savingStripe}>
              {savingStripe ? <><i className="fas fa-spinner fa-spin"></i> Salvando...</> : <><i className="fas fa-save"></i> Salvar Dados</>}
            </button>
            {!stripeStatus?.has_account && (
              <button type="button" className="btn-admin btn-stripe" onClick={connectStripe} disabled={connectingStripe}>
                {connectingStripe ? <><i className="fas fa-spinner fa-spin"></i> Conectando...</> : <><i className="fab fa-stripe-s"></i> Conectar ao Stripe</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
