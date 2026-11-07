import { useEffect, useState } from 'react'
import './App.css'

type Health = {
  status: string
  database: string
  timestamp: string
}

function App() {
  const [health, setHealth] = useState<Health | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<Health>
      })
      .then(setHealth)
      .catch((err: Error) => setError(err.message))
  }, [])

  return (
    <section id="center">
      <h1>PABX</h1>
      <p>React + Vite conectado ao Laravel</p>

      {error && <p>Erro ao conectar na API: {error}</p>}
      {!health && !error && <p>Conectando na API...</p>}
      {health && (
        <p>
          API: <strong>{health.status}</strong> · Banco de dados:{' '}
          <strong>{health.database}</strong>
        </p>
      )}

      <p>
        <a href="http://localhost:8000/api/documentation" target="_blank">
          Abrir documentação Swagger
        </a>
      </p>
    </section>
  )
}

export default App
