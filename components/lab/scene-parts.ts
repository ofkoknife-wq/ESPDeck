import { BOARD_X, BB_TOP, PCB_TOP } from '@/lib/geometry'
import { getCalloutTexts } from '@/lib/i18n/content/callouts'
import type { Locale } from '@/lib/i18n/config'
import type { LessonId } from '@/lib/lessons'
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

export function getSceneParts(lessonId: LessonId, locale: Locale, copy: Copy): ScenePart[] {
  const scene = LESSON_SCENES[lessonId]
  const texts = getCalloutTexts(lessonId, locale)
  const ox = scene.offsetX
  const rows: ScenePart[] = []

  if (lessonId !== 'board') {
    rows.push({
      key: 'board',
      title: copy.partBoard,
      body: copy.partBoardBody,
      at: [BOARD_X + ox, PCB_TOP + 0.2, 0],
      calloutIndex: null,
    })
  }
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
