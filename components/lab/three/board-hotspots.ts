import { BOARD_X, HEADER_Z, PCB_TOP, PIN_FIRST_X, PITCH, type Vec3 } from '@/lib/geometry'
import type { CalloutSpec } from './parts'

/** Local coords inside Esp32Board group (origin = board center). Copy lives in i18n callouts. */
export type BoardHotspot = {
  id: string
  /** Local position of the hotspot group / callout anchor. */
  local: Vec3
  hit: [number, number, number]
  /** Callout leader offsets (board lesson labels). */
  dx: number
  dy: number
  /** Hover lift amount in scene units. */
  lift?: number
  /** Buttons briefly depress when clicked. */
  pressable?: boolean
}

const STRIP_LEN = 19 * PITCH
const STRIP_X = (PIN_FIRST_X + (PIN_FIRST_X - 18 * PITCH)) / 2

/**
 * ESP32-DevKitC tour structure — order must match
 * `lib/i18n/content/{locale}/callouts.ts` → `board` array.
 */
export const BOARD_HOTSPOTS: BoardHotspot[] = [
  { id: 'usb', local: [-2.55, PCB_TOP + 0.11, 0], hit: [0.7, 0.45, 0.8], dx: -60, dy: 110 },
  { id: 'uart', local: [-1.75, PCB_TOP + 0.08, 0.1], hit: [0.55, 0.35, 0.55], dx: -90, dy: -40 },
  { id: 'ldo', local: [-1.0, PCB_TOP + 0.1, -0.45], hit: [0.5, 0.35, 0.45], dx: -70, dy: 130 },
  { id: 'crystal', local: [-0.35, PCB_TOP + 0.08, -0.55], hit: [0.35, 0.3, 0.3], dx: 40, dy: 120 },
  {
    id: 'en',
    local: [-2.2, PCB_TOP + 0.12, -0.72],
    hit: [0.5, 0.4, 0.45],
    dx: -50,
    dy: -130,
    lift: 0.1,
    pressable: true,
  },
  {
    id: 'boot',
    local: [-2.2, PCB_TOP + 0.12, 0.72],
    hit: [0.5, 0.4, 0.45],
    dx: -40,
    dy: 140,
    lift: 0.1,
    pressable: true,
  },
  { id: 'pwr', local: [-1.3, PCB_TOP + 0.06, -0.82], hit: [0.35, 0.28, 0.28], dx: 30, dy: -120 },
  { id: 'led', local: [-1.3, PCB_TOP + 0.06, 0.82], hit: [0.35, 0.28, 0.28], dx: 20, dy: 140 },
  {
    id: 'module',
    local: [1.175, PCB_TOP + 0.2, 0],
    // Tight to the metal can — avoid overlapping the antenna hit volume.
    hit: [1.85, 0.5, 1.7],
    dx: -30,
    dy: -150,
    lift: 0.1,
  },
  {
    id: 'antenna',
    local: [2.45, PCB_TOP + 0.12, 0],
    hit: [0.55, 0.35, 1.4],
    dx: 80,
    dy: -90,
    lift: 0.08,
  },
  {
    id: 'pins-l',
    local: [STRIP_X, PCB_TOP + 0.2, -HEADER_Z],
    hit: [STRIP_LEN + 0.15, 0.55, 0.45],
    dx: 120,
    dy: -80,
    // Keep pins planted — wires target fixed pinPos(); lifting would detach leads.
    lift: 0,
  },
  {
    id: 'pins-r',
    local: [STRIP_X, PCB_TOP + 0.2, HEADER_Z],
    hit: [STRIP_LEN + 0.15, 0.55, 0.45],
    dx: 120,
    dy: 100,
    lift: 0,
  },
]

export function boardHotspotWorldAt(h: BoardHotspot, offsetX = 0): Vec3 {
  return [BOARD_X + h.local[0] + offsetX, h.local[1], h.local[2]]
}

export function boardHotspotsAsCallouts(): CalloutSpec[] {
  return BOARD_HOTSPOTS.map((h) => ({
    at: boardHotspotWorldAt(h),
    dx: h.dx,
    dy: h.dy,
    pickable: true,
    interactive: Boolean(h.pressable),
    hotspotId: h.id,
  }))
}
