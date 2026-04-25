export function isCsHostName(host = '') {
  return host.startsWith('cs.')
}

export function getClientHostName() {
  if (typeof window === 'undefined') return ''
  return window.location.hostname || ''
}
