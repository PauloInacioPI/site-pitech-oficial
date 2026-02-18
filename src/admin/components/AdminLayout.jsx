import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import '../styles/Admin.css'

export default function AdminLayout() {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [admin, setAdmin] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const adminData = localStorage.getItem('admin')
    if (!token || !adminData) {
      navigate('/admin/login')
      return
    }
    setAdmin(JSON.parse(adminData))
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
    navigate('/admin/login')
  }

  if (!admin) return null

  return (
    <div className="admin-wrapper">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/logo-jotta.png" alt="PiTech Sistemas" className="sidebar-logo-img" />
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-label">MENU PRINCIPAL</span>
          <NavLink to="/admin" end onClick={() => setSidebarOpen(false)}>
            <i className="fas fa-chart-pie"></i> Dashboard
          </NavLink>
          <NavLink to="/admin/viagens" onClick={() => setSidebarOpen(false)}>
            <i className="fas fa-route"></i> Viagens
          </NavLink>
          <NavLink to="/admin/reservas" onClick={() => setSidebarOpen(false)}>
            <i className="fas fa-ticket-alt"></i> Reservas
          </NavLink>

          <span className="sidebar-label">SISTEMA</span>
          <NavLink to="/admin/configuracoes" onClick={() => setSidebarOpen(false)}>
            <i className="fas fa-cog"></i> Configurações
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {admin.nome?.charAt(0) || 'A'}
            </div>
            <div className="sidebar-user-info">
              <strong>{admin.nome}</strong>
              <span>{admin.email}</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      <main className="admin-main">
        <header className="admin-topbar">
          <button className="topbar-menu" onClick={() => setSidebarOpen(true)}>
            <i className="fas fa-bars"></i>
          </button>
          <div className="topbar-right">
            <a href="/" target="_blank" className="topbar-link">
              <i className="fas fa-external-link-alt"></i> Ver Site
            </a>
            <div className="topbar-user">
              <div className="topbar-avatar">{admin.nome?.charAt(0) || 'A'}</div>
              <span>{admin.nome?.split(' ')[0]}</span>
            </div>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
