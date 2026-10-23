import { BB_TOP } from '@/lib/geometry'
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

function boardHotspotParts(locale: Locale, offsetX: number, texts: { title: string; body: string }[]): ScenePart[] {
  return BOARD_HOTSPOTS.map((h, index) => {
    const text = texts[index] ?? { title: h.title, body: h.body }
    return {
      key: `board-${h.id}`,
      title: text.title,
      body: text.body,
      at: boardHotspotWorldAt(h, offsetX),
      calloutIndex: null,
      pickable: true,
      interactive: Boolean(h.pressable),
    }
  })
}

export function getSceneParts(lessonId: LessonId, locale: Locale, copy: Copy): ScenePart[] {
  const scene = LESSON_SCENES[lessonId]
  const texts = getCalloutTexts(lessonId, locale)
  const ox = scene.offsetX
  const rows: ScenePart[] = []

  if (lessonId === 'board') {
    // Callouts === board hotspots (same order); keys stay board-${id}.
    scene.callouts.forEach((callout, index) => {
      const text = texts[index] ?? { title: callout.title, body: callout.body }
      const id = callout.hotspotId ?? BOARD_HOTSPOTS[index]?.id
      rows.push({
        key: id ? `board-${id}` : `callout-${index}`,
        title: text.title,
        body: text.body,
        at: [callout.at[0] + ox, callout.at[1], callout.at[2]],
        calloutIndex: index,
        interactive: Boolean(callout.interactive),
        pickable: true,
        icon: callout.icon,
        control: callout.control,
        controls: callout.controls,
      })
    })
    return rows
  }

  // Other lessons: fine-grained board tour parts (3D pick + panel) + breadboard + lesson callouts.
  const boardTexts = getCalloutTexts('board', locale)
  rows.push(...boardHotspotParts(locale, ox, boardTexts))

  if (scene.breadboard) {
    rows.push({
      key: 'breadboard',
      title: copy.partBreadboard,
      body: copy.partBreadboardBody,
      at: [ox, BB_TOP + 0.15, 0],
      calloutIndex: null,
    })
  }

  scene.callouts.forEach((callout, index) => {
    const text = texts[index] ?? { title: callout.title, body: callout.body }
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
