export interface Theme {
  pageBg: string
  cardBg: number
  cardBorder: number
  textDark: string
  textMuted: string
  primary: number
  primaryHex: string
  gridThin: number
  gridThick: number
  cellGiven: string
  cellUser: string
  memoText: string
  backLink: string
  timerText: string
  completedText: string
  numBtnBg: number
  numBtnBorder: number
  numBtnText: string
  numBtnFullBg: number
  numBtnFullBorder: number
  numBtnFullText: string
  closeBtnBg: number
  closeBtnBorder: number
  closeBtnText: string
  memoBtnBg: number
  memoBtnBorder: number
  memoBtnText: string
  memoBtnSelectedBg: number
  memoBtnSelectedBorder: number
}

const light: Theme = {
  pageBg: '#fafaf9',
  cardBg: 0xffffff,
  cardBorder: 0xe4e4e7,
  textDark: '#1e293b',
  textMuted: '#71717a',
  primary: 0x6366f1,
  primaryHex: '#6366f1',
  gridThin: 0x94a3b8,
  gridThick: 0x475569,
  cellGiven: '#1e293b',
  cellUser: '#6366f1',
  memoText: '#3f3f46',
  backLink: '#6366f1',
  timerText: '#71717a',
  completedText: '#10b981',
  numBtnBg: 0xf1f5f9,
  numBtnBorder: 0x94a3b8,
  numBtnText: '#1e293b',
  numBtnFullBg: 0xe5e7eb,
  numBtnFullBorder: 0xd1d5db,
  numBtnFullText: '#94a3b8',
  closeBtnBg: 0xfee2e2,
  closeBtnBorder: 0xfca5a5,
  closeBtnText: '#dc2626',
  memoBtnBg: 0xf0fdf4,
  memoBtnBorder: 0x86efac,
  memoBtnText: '#166534',
  memoBtnSelectedBg: 0x4ade80,
  memoBtnSelectedBorder: 0x22c55e,
}

const dark: Theme = {
  pageBg: '#18181b',
  cardBg: 0x27272a,
  cardBorder: 0x3f3f46,
  textDark: '#fafafa',
  textMuted: '#a1a1aa',
  primary: 0x818cf8,
  primaryHex: '#818cf8',
  gridThin: 0x52525b,
  gridThick: 0x71717a,
  cellGiven: '#fafafa',
  cellUser: '#818cf8',
  memoText: '#a1a1aa',
  backLink: '#818cf8',
  timerText: '#a1a1aa',
  completedText: '#4ade80',
  numBtnBg: 0x27272a,
  numBtnBorder: 0x52525b,
  numBtnText: '#fafafa',
  numBtnFullBg: 0x3f3f46,
  numBtnFullBorder: 0x52525b,
  numBtnFullText: '#71717a',
  closeBtnBg: 0x450a0a,
  closeBtnBorder: 0x991b1b,
  closeBtnText: '#fca5a5',
  memoBtnBg: 0x052e16,
  memoBtnBorder: 0x166534,
  memoBtnText: '#bbf7d0',
  memoBtnSelectedBg: 0x16a34a,
  memoBtnSelectedBorder: 0x22c55e,
}

export const THEMES: Record<string, Theme> = { light, dark }

export function getTheme(key: string): Theme {
  return THEMES[key] || light
}
