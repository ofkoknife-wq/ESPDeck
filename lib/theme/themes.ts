export const THEME_IDS = ['matcha', 'umi', 'sakura', 'sumi', 'yuzu'] as const

export type ThemeId = (typeof THEME_IDS)[number]

export const DEFAULT_THEME: ThemeId = 'matcha'

export const THEME_META: {
  id: ThemeId
  swatch: [string, string, string]
}[] = [
  { id: 'matcha', swatch: ['#F5F7F4', '#5B8A6E', '#E07A5F'] },
  { id: 'umi', swatch: ['#F3F6F9', '#4A7C9B', '#3D8B7A'] },
  { id: 'sakura', swatch: ['#F7F5F6', '#D4849A', '#5C7A6E'] },
  { id: 'sumi', swatch: ['#F5F5F7', '#3A6EA5', '#1D1D1F'] },
  { id: 'yuzu', swatch: ['#F7F8F2', '#7A9B4A', '#C45C26'] },
]

export function isThemeId(value: string): value is ThemeId {
  return (THEME_IDS as readonly string[]).includes(value)
}
