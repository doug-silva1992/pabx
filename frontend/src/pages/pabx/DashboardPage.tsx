import { Link } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import { Icon } from '../../components/Icon'
import { menu } from '../../layouts/menu'

export function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.name.split(' ')[0]

  return (
    <>
      <div className="page-header">
        <h1>Olá, {firstName}</h1>
        <p>Bem-vindo ao painel do PABX. Escolha um módulo para começar.</p>
      </div>

      <div className="module-grid">
        {menu
          .filter((item) => !item.end)
          .map((item) => (
            <Link key={item.to} to={item.to} className="module-card">
              <span className="module-icon">
                <Icon name={item.icon} size={20} />
              </span>
              <strong>{item.label}</strong>
            </Link>
          ))}
      </div>
    </>
  )
}
