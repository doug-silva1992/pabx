import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../../auth/useAuth'
import type { RegisterData } from '../../auth/AuthContext'
import { ApiError } from '../../lib/api'
import { AuthLayout } from './AuthLayout'

type Field = keyof RegisterData

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<RegisterData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function update(field: Field, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setErrors({})

    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: 'As senhas não conferem.' })
      return
    }

    setSubmitting(true)
    try {
      await register(form)
      navigate('/pabx', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        const fieldErrors: Partial<Record<Field, string>> = {}
        for (const [key, messages] of Object.entries(err.errors)) {
          fieldErrors[key as Field] = messages[0]
        }
        setErrors(fieldErrors)
      } else {
        setError(err instanceof ApiError ? err.message : 'Não foi possível conectar ao servidor.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Criar usuário" subtitle="Cadastre-se para acessar o PABX">
      <form className="form" onSubmit={handleSubmit} noValidate>
        {error && <div className="alert alert-error">{error}</div>}

        <label className="field">
          <span>Nome</span>
          <input
            autoComplete="name"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            aria-invalid={!!errors.name}
            autoFocus
          />
          {errors.name && <small className="field-error">{errors.name}</small>}
        </label>

        <label className="field">
          <span>E-mail</span>
          <input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            aria-invalid={!!errors.email}
          />
          {errors.email && <small className="field-error">{errors.email}</small>}
        </label>

        <label className="field">
          <span>Senha</span>
          <input
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            aria-invalid={!!errors.password}
          />
          {errors.password ? (
            <small className="field-error">{errors.password}</small>
          ) : (
            <small className="field-hint">Mínimo de 8 caracteres</small>
          )}
        </label>

        <label className="field">
          <span>Confirmar senha</span>
          <input
            type="password"
            autoComplete="new-password"
            value={form.password_confirmation}
            onChange={(e) => update('password_confirmation', e.target.value)}
            aria-invalid={!!errors.password_confirmation}
          />
          {errors.password_confirmation && (
            <small className="field-error">{errors.password_confirmation}</small>
          )}
        </label>

        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Criando...' : 'Criar usuário'}
        </button>
      </form>

      <p className="auth-switch">
        Já tem conta? <Link to="/login">Entrar</Link>
      </p>
    </AuthLayout>
  )
}
