import { useState, type FormEvent } from 'react'
import { Icon } from '../../components/Icon'
import { useSoftphone, type Presence } from '../../webphone/useSoftphone'

const keys: { digit: string; letters: string }[] = [
  { digit: '1', letters: '' },
  { digit: '2', letters: 'ABC' },
  { digit: '3', letters: 'DEF' },
  { digit: '4', letters: 'GHI' },
  { digit: '5', letters: 'JKL' },
  { digit: '6', letters: 'MNO' },
  { digit: '7', letters: 'PQRS' },
  { digit: '8', letters: 'TUV' },
  { digit: '9', letters: 'WXYZ' },
  { digit: '*', letters: '' },
  { digit: '0', letters: '+' },
  { digit: '#', letters: '' },
]

const presenceLabel: Record<Presence, string> = {
  disponivel: 'Disponível',
  ausente: 'Ausente',
  offline: 'Offline',
}

const statusLabel = {
  idle: 'Pronto para ligar',
  calling: 'Chamando...',
  active: 'Em chamada',
  ended: 'Chamada encerrada',
}

function formatDuration(totalSec: number) {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function WebphonePage() {
  const phone = useSoftphone()
  const [number, setNumber] = useState('')

  const inCall = phone.status === 'calling' || phone.status === 'active'
  const offline = phone.presence === 'offline'

  function press(digit: string) {
    if (phone.status === 'active') phone.sendDtmf(digit)
    else if (!inCall) setNumber((n) => (n + digit).slice(0, 20))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (inCall) phone.hangup()
    else phone.call(number.trim())
  }

  return (
    <>
      <div className="page-header">
        <h1>Webphone</h1>
        <p>Faça e receba chamadas pelo navegador usando seu ramal.</p>
        <span className="badge badge-muted">Modo simulação · sem servidor SIP conectado</span>
      </div>

      <div className="wp-grid">
        <section className="card wp-phone">
          <div className="wp-line">
            <div>
              <span className="wp-line-label">Ramal</span>
              <strong className="mono">{phone.extension}</strong>
            </div>
            <label className="wp-presence">
              <span className={`dot presence-${phone.presence}`} aria-hidden="true" />
              <select
                value={phone.presence}
                onChange={(e) => phone.setPresence(e.target.value as Presence)}
                disabled={inCall}
                aria-label="Status do ramal"
              >
                {(Object.keys(presenceLabel) as Presence[]).map((p) => (
                  <option key={p} value={p}>{presenceLabel[p]}</option>
                ))}
              </select>
            </label>
          </div>

          <div className={`wp-screen status-${phone.status}`} aria-live="polite">
            {inCall || phone.status === 'ended' ? (
              <>
                <span className="wp-status">{statusLabel[phone.status]}</span>
                <strong className="wp-remote mono">{phone.remoteNumber}</strong>
                <span className="wp-timer mono">
                  {phone.status === 'calling' ? '··· ' : formatDuration(phone.elapsed)}
                  {phone.onHold && phone.status === 'active' && ' · em espera'}
                </span>
                {phone.dtmf && <span className="wp-dtmf mono">DTMF: {phone.dtmf}</span>}
              </>
            ) : (
              <form className="wp-dial" onSubmit={handleSubmit}>
                <input
                  className="wp-number mono"
                  value={number}
                  onChange={(e) => setNumber(e.target.value.replace(/[^\d*#+]/g, '').slice(0, 20))}
                  placeholder="Número ou ramal"
                  inputMode="tel"
                  aria-label="Número para discar"
                  disabled={offline}
                  autoFocus
                />
                {number && (
                  <button
                    type="button"
                    className="wp-backspace"
                    onClick={() => setNumber((n) => n.slice(0, -1))}
                    aria-label="Apagar dígito"
                  >
                    <Icon name="backspace" />
                  </button>
                )}
                <span className="wp-status">
                  {offline ? 'Ramal offline' : statusLabel.idle}
                </span>
              </form>
            )}
          </div>

          <div className="wp-keypad" role="group" aria-label="Teclado">
            {keys.map((k) => (
              <button
                key={k.digit}
                type="button"
                className="wp-key"
                onClick={() => press(k.digit)}
                disabled={offline || phone.status === 'calling' || phone.status === 'ended'}
              >
                <span className="wp-key-digit">{k.digit}</span>
                <span className="wp-key-letters">{k.letters}</span>
              </button>
            ))}
          </div>

          <div className="wp-actions">
            <button
              type="button"
              className={`wp-ctrl ${phone.muted ? 'on' : ''}`}
              onClick={phone.toggleMute}
              disabled={phone.status !== 'active'}
              aria-pressed={phone.muted}
              title={phone.muted ? 'Ativar microfone' : 'Silenciar'}
            >
              <Icon name={phone.muted ? 'micOff' : 'mic'} />
              <span>Mudo</span>
            </button>

            {inCall ? (
              <button type="button" className="wp-call wp-hangup" onClick={phone.hangup} aria-label="Desligar">
                <Icon name="phoneOff" size={24} />
              </button>
            ) : (
              <button
                type="button"
                className="wp-call"
                onClick={() => phone.call(number.trim())}
                disabled={!number || offline || phone.status === 'ended'}
                aria-label="Ligar"
              >
                <Icon name="calls" size={24} />
              </button>
            )}

            <button
              type="button"
              className={`wp-ctrl ${phone.onHold ? 'on' : ''}`}
              onClick={phone.toggleHold}
              disabled={phone.status !== 'active'}
              aria-pressed={phone.onHold}
              title={phone.onHold ? 'Retomar chamada' : 'Colocar em espera'}
            >
              <Icon name={phone.onHold ? 'play' : 'pause'} />
              <span>{phone.onHold ? 'Retomar' : 'Espera'}</span>
            </button>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Chamadas recentes</h2>
          {phone.history.length === 0 ? (
            <p className="wp-empty">Nenhuma chamada nesta sessão.</p>
          ) : (
            <ul className="wp-history">
              {phone.history.map((c) => (
                <li key={c.id}>
                  <span className={`wp-history-icon ${c.answered ? '' : 'missed'}`}>
                    <Icon name={c.answered ? 'calls' : 'phoneOff'} size={16} />
                  </span>
                  <span className="wp-history-main">
                    <strong className="mono">{c.number}</strong>
                    <small>
                      {c.direction === 'saida' ? 'Realizada' : 'Recebida'} · {formatTime(c.startedAt)}
                      {c.answered ? ` · ${formatDuration(c.durationSec)}` : ' · não atendida'}
                    </small>
                  </span>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => {
                      setNumber(c.number)
                      phone.call(c.number)
                    }}
                    disabled={inCall || offline || phone.status === 'ended'}
                    aria-label={`Ligar para ${c.number}`}
                    title="Ligar novamente"
                  >
                    <Icon name="calls" size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
