export const THANKS_EVENT = 'espdeck:thanks'
const STORAGE_KEY = 'esp32-lab:thanks'

type ThanksState = {
  reasons: string[]
  last: number
}

function readState(): ThanksState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as ThanksState
  } catch {
    /* ignore */
  }
  return { reasons: [], last: 0 }
}

export function celebrateThanks(reason: string) {
  if (typeof window === 'undefined') return
  const seen = readState()
  if (seen.reasons.includes(reason)) return
  seen.reasons.push(reason)
  seen.last = Date.now()
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seen))
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(THANKS_EVENT, { detail: { reason } }))
}
