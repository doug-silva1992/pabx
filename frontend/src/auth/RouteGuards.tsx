import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './useAuth'

function FullPageLoading() {
  return <div className="page-loading">Carregando...</div>
}

/** Só permite acesso a usuários autenticados. */
export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullPageLoading />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />

  return <Outlet />
}

/** Telas de login/cadastro: quem já está logado vai direto para o PABX. */
export function GuestOnly() {
  const { user, loading } = useAuth()

  if (loading) return <FullPageLoading />
  if (user) return <Navigate to="/pabx" replace />

  return <Outlet />
}
