import type { IconName } from '../components/Icon'

export type MenuItem = { to: string; label: string; icon: IconName; end?: boolean }

export const menu: MenuItem[] = [
  { to: '/pabx', label: 'Painel', icon: 'dashboard', end: true },
  { to: '/pabx/webphone', label: 'Webphone', icon: 'webphone' },
  { to: '/pabx/ramais', label: 'Ramais', icon: 'extensions' },
  { to: '/pabx/chamadas', label: 'Chamadas', icon: 'calls' },
  { to: '/pabx/filas', label: 'Filas', icon: 'queues' },
  { to: '/pabx/ura', label: 'URA', icon: 'ivr' },
  { to: '/pabx/gravacoes', label: 'Gravações', icon: 'recordings' },
  { to: '/pabx/speech-analytics', label: 'Speech Analytics', icon: 'speech' },
  { to: '/pabx/configuracoes', label: 'Configurações', icon: 'settings' },
]
