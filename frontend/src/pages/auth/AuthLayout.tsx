import type { ReactNode } from 'react'
import { Logo } from '../../components/Logo'

type Props = { title: string; subtitle: string; children: ReactNode }

export function AuthLayout({ title, subtitle, children }: Props) {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <Logo />
        </div>
        <h1>{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>
        {children}
      </div>
    </main>
  )
}
