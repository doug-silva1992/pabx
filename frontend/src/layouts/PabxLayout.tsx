import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { Icon } from '../components/Icon'
import { Logo } from '../components/Logo'
import { menu } from './menu'

export function PabxLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const initials = (user?.name ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')

  return (
    <div className={`app-shell ${menuOpen ? 'menu-open' : ''}`}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Logo />
        </div>
        <nav className="sidebar-nav" aria-label="Menu do PABX">
          {menu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="sidebar-backdrop" onClick={() => setMenuOpen(false)} />

      <div className="main">
        <header className="topbar">
          <button
            className="icon-btn menu-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Abrir menu"
          >
            <Icon name="menu" />
          </button>
          <div className="topbar-spacer" />
          <div className="user-chip">
            <span className="avatar" aria-hidden="true">{initials}</span>
            <span className="user-info">
              <strong>{user?.name}</strong>
              <small>{user?.email}</small>
            </span>
          </div>
          <button className="icon-btn" onClick={handleLogout} title="Sair" aria-label="Sair">
            <Icon name="logout" />
          </button>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
