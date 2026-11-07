import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Estado e ações do webphone.
 *
 * IMPLEMENTAÇÃO SIMULADA: não há servidor SIP ainda. Para integrar com o PABX real
 * (Asterisk/FreeSWITCH via WebRTC), substitua o corpo deste hook por uma
 * biblioteca SIP (ex.: SIP.js ou JsSIP) mantendo a mesma interface — a tela
 * (WebphonePage) não precisa mudar.
 */

export type CallStatus = 'idle' | 'calling' | 'active' | 'ended'
export type Presence = 'disponivel' | 'ausente' | 'offline'

export type CallRecord = {
  id: number
  number: string
  direction: 'saida' | 'entrada'
  startedAt: Date
  durationSec: number
  answered: boolean
}

const RING_MS = 2500
const ENDED_MS = 1500

export function useSoftphone() {
  const [presence, setPresence] = useState<Presence>('disponivel')
  const [status, setStatus] = useState<CallStatus>('idle')
  const [remoteNumber, setRemoteNumber] = useState('')
  const [muted, setMuted] = useState(false)
  const [onHold, setOnHold] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [dtmf, setDtmf] = useState('')
  const [history, setHistory] = useState<CallRecord[]>([])

  const callStart = useRef<Date | null>(null)
  const answered = useRef(false)
  const timers = useRef<number[]>([])

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  useEffect(() => clearTimers, [])

  // Cronômetro da chamada
  useEffect(() => {
    if (status !== 'active') return
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [status])

  const call = useCallback(
    (number: string) => {
      if (!number || status !== 'idle' || presence === 'offline') return
      clearTimers()
      setRemoteNumber(number)
      setStatus('calling')
      setElapsed(0)
      setDtmf('')
      setMuted(false)
      setOnHold(false)
      callStart.current = new Date()
      answered.current = false

      // Simula o destino atendendo
      timers.current.push(
        window.setTimeout(() => {
          answered.current = true
          setStatus('active')
        }, RING_MS),
      )
    },
    [status, presence],
  )

  const hangup = useCallback(() => {
    if (status !== 'calling' && status !== 'active') return
    clearTimers()
    const record: CallRecord = {
      id: Date.now(),
      number: remoteNumber,
      direction: 'saida',
      startedAt: callStart.current ?? new Date(),
      durationSec: answered.current ? elapsed : 0,
      answered: answered.current,
    }
    setHistory((h) => [record, ...h].slice(0, 20))
    setStatus('ended')
    timers.current.push(window.setTimeout(() => setStatus('idle'), ENDED_MS))
  }, [status, remoteNumber, elapsed])

  const sendDtmf = useCallback(
    (digit: string) => {
      if (status === 'active') setDtmf((d) => (d + digit).slice(-16))
    },
    [status],
  )

  return {
    extension: '1001',
    presence,
    setPresence,
    status,
    remoteNumber,
    muted,
    toggleMute: () => setMuted((m) => !m),
    onHold,
    toggleHold: () => setOnHold((h) => !h),
    elapsed,
    dtmf,
    history,
    call,
    hangup,
    sendDtmf,
  }
}
