import { useMemo, useState } from 'react'

type Sentiment = 'positivo' | 'neutro' | 'negativo'

type AnalyzedCall = {
  id: number
  date: string
  agent: string
  caller: string
  duration: string
  sentiment: Sentiment
  score: number
  keywords: string[]
  summary: string
}

// Dados de exemplo — substituir pela API quando o módulo de análise existir.
const calls: AnalyzedCall[] = [
  { id: 1, date: '07/11 14:32', agent: 'Ana Souza', caller: '(11) 98765-4321', duration: '04:12', sentiment: 'positivo', score: 92, keywords: ['obrigado', 'resolvido'], summary: 'Cliente pediu segunda via do boleto; atendimento rápido e resolvido.' },
  { id: 2, date: '07/11 14:05', agent: 'Bruno Lima', caller: '(21) 99876-5432', duration: '11:47', sentiment: 'negativo', score: 38, keywords: ['cancelar', 'reclamação', 'Procon'], summary: 'Cliente insatisfeito com cobrança duplicada e ameaçou cancelar.' },
  { id: 3, date: '07/11 13:41', agent: 'Carla Mendes', caller: '(31) 3456-7890', duration: '06:20', sentiment: 'neutro', score: 71, keywords: ['prazo', 'entrega'], summary: 'Consulta sobre prazo de entrega; informação fornecida.' },
  { id: 4, date: '07/11 12:58', agent: 'Ana Souza', caller: '(11) 3333-2222', duration: '02:54', sentiment: 'positivo', score: 88, keywords: ['upgrade', 'plano'], summary: 'Cliente contratou upgrade de plano.' },
  { id: 5, date: '07/11 12:20', agent: 'Diego Rocha', caller: '(41) 99111-2233', duration: '09:03', sentiment: 'negativo', score: 45, keywords: ['demora', 'cancelar'], summary: 'Reclamação sobre tempo de espera na fila.' },
  { id: 6, date: '07/11 11:47', agent: 'Bruno Lima', caller: '(51) 98222-3344', duration: '05:31', sentiment: 'neutro', score: 66, keywords: ['endereço', 'cadastro'], summary: 'Atualização de endereço de cadastro.' },
  { id: 7, date: '07/11 11:12', agent: 'Carla Mendes', caller: '(11) 97444-5566', duration: '03:18', sentiment: 'positivo', score: 95, keywords: ['excelente', 'obrigado'], summary: 'Elogio ao suporte técnico após resolução de problema.' },
]

const keywordAlerts = [
  { word: 'cancelar', count: 18 },
  { word: 'reclamação', count: 11 },
  { word: 'demora', count: 9 },
  { word: 'Procon', count: 3 },
]

const sentimentLabel: Record<Sentiment, string> = {
  positivo: 'Positivo',
  neutro: 'Neutro',
  negativo: 'Negativo',
}

type Filter = Sentiment | 'todos'

export function SpeechAnalyticsPage() {
  const [filter, setFilter] = useState<Filter>('todos')
  const [selected, setSelected] = useState<AnalyzedCall | null>(null)

  const stats = useMemo(() => {
    const count = (s: Sentiment) => calls.filter((c) => c.sentiment === s).length
    const total = calls.length
    const avg = Math.round(calls.reduce((sum, c) => sum + c.score, 0) / total)
    return {
      total,
      avg,
      positivo: count('positivo'),
      neutro: count('neutro'),
      negativo: count('negativo'),
    }
  }, [])

  const visible = filter === 'todos' ? calls : calls.filter((c) => c.sentiment === filter)
  const pct = (n: number) => Math.round((n / stats.total) * 100)

  return (
    <>
      <div className="page-header">
        <h1>Speech Analytics</h1>
        <p>Transcrição e análise de sentimento das chamadas atendidas.</p>
        <span className="badge badge-muted">Dados de exemplo</span>
      </div>

      <div className="kpi-grid">
        <div className="card kpi">
          <span className="kpi-label">Chamadas analisadas</span>
          <strong className="kpi-value">{stats.total}</strong>
          <span className="kpi-sub">hoje</span>
        </div>
        <div className="card kpi">
          <span className="kpi-label">Nota média de satisfação</span>
          <strong className="kpi-value">{stats.avg}</strong>
          <span className="kpi-sub">de 100</span>
        </div>
        <div className="card kpi">
          <span className="kpi-label">Sentimento positivo</span>
          <strong className="kpi-value">{pct(stats.positivo)}%</strong>
          <span className="kpi-sub">{stats.positivo} chamadas</span>
        </div>
        <div className="card kpi">
          <span className="kpi-label">Risco de cancelamento</span>
          <strong className="kpi-value kpi-danger">{stats.negativo}</strong>
          <span className="kpi-sub">chamadas com sentimento negativo</span>
        </div>
      </div>

      <div className="sa-grid">
        <section className="card">
          <h2 className="card-title">Distribuição de sentimento</h2>
          <div className="sentiment-bar" role="img" aria-label={`Positivo ${pct(stats.positivo)}%, neutro ${pct(stats.neutro)}%, negativo ${pct(stats.negativo)}%`}>
            <span className="seg seg-positivo" style={{ flexGrow: stats.positivo }} />
            <span className="seg seg-neutro" style={{ flexGrow: stats.neutro }} />
            <span className="seg seg-negativo" style={{ flexGrow: stats.negativo }} />
          </div>
          <ul className="legend">
            {(['positivo', 'neutro', 'negativo'] as const).map((s) => (
              <li key={s}>
                <span className={`dot dot-${s}`} /> {sentimentLabel[s]}
                <strong>{pct(stats[s])}%</strong>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2 className="card-title">Palavras-chave de alerta</h2>
          <ul className="keyword-list">
            {keywordAlerts.map((k) => (
              <li key={k.word}>
                <span>{k.word}</span>
                <span className="keyword-bar">
                  <span style={{ width: `${(k.count / keywordAlerts[0]!.count) * 100}%` }} />
                </span>
                <strong>{k.count}</strong>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card">
        <div className="card-header">
          <h2 className="card-title">Chamadas recentes</h2>
          <div className="segmented" role="group" aria-label="Filtrar por sentimento">
            {(['todos', 'positivo', 'neutro', 'negativo'] as const).map((f) => (
              <button
                key={f}
                className={filter === f ? 'active' : ''}
                onClick={() => setFilter(f)}
              >
                {f === 'todos' ? 'Todos' : sentimentLabel[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Agente</th>
                <th>Origem</th>
                <th>Duração</th>
                <th>Sentimento</th>
                <th className="num">Nota</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr
                  key={c.id}
                  className={selected?.id === c.id ? 'selected' : ''}
                  onClick={() => setSelected(c)}
                >
                  <td>{c.date}</td>
                  <td>{c.agent}</td>
                  <td className="mono">{c.caller}</td>
                  <td className="mono">{c.duration}</td>
                  <td>
                    <span className={`badge badge-${c.sentiment}`}>{sentimentLabel[c.sentiment]}</span>
                  </td>
                  <td className="num mono">{c.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selected && (
          <div className="call-detail">
            <h3>Resumo da chamada · {selected.agent}</h3>
            <p>{selected.summary}</p>
            <div className="chips">
              {selected.keywords.map((k) => (
                <span key={k} className="chip">{k}</span>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  )
}
