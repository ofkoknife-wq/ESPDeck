import { BOARD_X, BB_TOP, PCB_TOP } from '@/lib/geometry'
import { getCalloutTexts } from '@/lib/i18n/content/callouts'
import type { Locale } from '@/lib/i18n/config'
import type { LessonId } from '@/lib/lessons'
import { BOARD_HOTSPOTS, boardHotspotWorldAt } from './three/board-hotspots'
import { LESSON_SCENES } from './three/circuits'
import type { CalloutIcon, PartControl } from './three/parts'

export type ScenePart = {
  key: string
  title: string
  body: string
  at: [number, number, number]
  /** Index into LESSON_SCENES[id].callouts, or null for synthetic board/breadboard rows. */
  calloutIndex: number | null
  interactive?: boolean
  pickable?: boolean
  icon?: CalloutIcon
  control?: PartControl
  controls?: PartControl[]
}

type Copy = {
  partBoard: string
  partBoardBody: string
  partBreadboard: string
  partBreadboardBody: string
}

/** Resolve a board-tour hotspot for 3D pick / callout click — never listed in the parts panel. */
export function getBoardHotspotPart(id: string, locale: Locale, offsetX = 0): ScenePart | null {
  const index = BOARD_HOTSPOTS.findIndex((h) => h.id === id)
  if (index < 0) return null
  const h = BOARD_HOTSPOTS[index]
  const text = getCalloutTexts('board', locale)[index] ?? { title: '—', body: '' }
  return {
    key: `board-${h.id}`,
    title: text.title,
    body: text.body,
    at: boardHotspotWorldAt(h, offsetX),
    calloutIndex: lessonIdBoardCalloutIndex(id),
    pickable: true,
    interactive: Boolean(h.pressable),
  }
}

function lessonIdBoardCalloutIndex(id: string): number | null {
  const index = BOARD_HOTSPOTS.findIndex((h) => h.id === id)
  return index >= 0 ? index : null
}

/**
 * Rows for the parts panel.
 * DevKit sub-parts (USB / module / antenna / …) are never listed — only the whole board,
 * breadboard, and this lesson’s circuit parts.
 */
export function getSceneParts(lessonId: LessonId, locale: Locale, copy: Copy): ScenePart[] {
  const scene = LESSON_SCENES[lessonId]
  const texts = getCalloutTexts(lessonId, locale)
  const ox = scene.offsetX
  const rows: ScenePart[] = []

  rows.push({
    key: 'board',
    title: copy.partBoard,
    body: copy.partBoardBody,
    at: [BOARD_X + ox, PCB_TOP + 0.2, 0],
    calloutIndex: null,
  })

  if (scene.breadboard) {
    rows.push({
      key: 'breadboard',
      title: copy.partBreadboard,
      body: copy.partBreadboardBody,
      at: [ox, BB_TOP + 0.15, 0],
      calloutIndex: null,
    })
  }

  // Board lesson: tour labels live in CalloutLayer / 3D pick, not this list.
  if (lessonId === 'board') return rows

  scene.callouts.forEach((callout, index) => {
    const text = texts[index] ?? { title: '—', body: '' }
    rows.push({
      key: `callout-${index}`,
      title: text.title,
      body: text.body,
      at: [callout.at[0] + ox, callout.at[1], callout.at[2]],
      calloutIndex: index,
      interactive: Boolean(callout.interactive),
      pickable: Boolean(callout.pickable ?? callout.interactive),
      icon: callout.icon,
      control: callout.control,
      controls: callout.controls,
    })
  })

  return rows
}
