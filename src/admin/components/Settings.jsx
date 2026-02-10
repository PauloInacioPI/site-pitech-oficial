import { useState, useEffect, useRef } from 'react'
import { API, getToken } from '../api'
import '../styles/Settings.css'

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
  }, [])

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
                        <input type="text" value={slideForm.subtitle || ''} onChange={e => setSlideForm({ ...slideForm, subtitle: e.target.value })} placeholder="Ex: Descubra" />
                      </div>
                      <div className="form-group">
                        <label>Título</label>
                        <input type="text" value={slideForm.title || ''} onChange={e => setSlideForm({ ...slideForm, title: e.target.value })} placeholder="Ex: O Mundo" />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Descrição</label>
                      <textarea value={slideForm.description || ''} onChange={e => setSlideForm({ ...slideForm, description: e.target.value })} rows={3} placeholder="Texto descritivo do slide..." />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Texto Botão Primário</label>
                        <input type="text" value={slideForm.btn_primary_text || ''} onChange={e => setSlideForm({ ...slideForm, btn_primary_text: e.target.value })} placeholder="Ex: Explorar Pacotes" />
                      </div>
                      <div className="form-group">
                        <label>Link Botão Primário</label>
                        <input type="text" value={slideForm.btn_primary_link || ''} onChange={e => setSlideForm({ ...slideForm, btn_primary_link: e.target.value })} placeholder="Ex: #pacotes" />
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
                      <label>Imagem do Viajante</label>
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
            </div>
          </div>

          <div className="admin-card settings-card">
            <div className="card-header">
              <h3><i className="fas fa-chart-bar"></i> Estatísticas do Site</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label>Clientes</label>
                <input type="text" value={getStat('clientes')} onChange={e => updateStats('clientes', e.target.value)} placeholder="Ex: 5.000+" />
              </div>
              <div className="form-group">
                <label>Destinos</label>
                <input type="text" value={getStat('destinos')} onChange={e => updateStats('destinos', e.target.value)} placeholder="Ex: 50+" />
              </div>
              <div className="form-group">
                <label>Avaliação</label>
                <input type="text" value={getStat('avaliacao')} onChange={e => updateStats('avaliacao', e.target.value)} placeholder="Ex: 4.9" />
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
    </div>
  )
}
