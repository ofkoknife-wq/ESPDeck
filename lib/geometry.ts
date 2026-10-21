export type Vec3 = [number, number, number]

/** 1 个场景单位 = 10mm。开发板在左，面包板在右。 */
export const BOARD_X = -3.2
export const BB_X = 2.9
export const PITCH = 0.254

export const PCB_W = 5.4
export const PCB_D = 2.8
export const PCB_BOTTOM = 0.3
export const PCB_T = 0.12
export const PCB_TOP = PCB_BOTTOM + PCB_T
export const HEADER_Z = 1.18
export const PIN_TOP = PCB_TOP + 0.1 + 0.22
export const PIN_FIRST_X = 2.24

export const BB_W = 6.2
export const BB_D = 3.4
export const BB_TOP = 0.45
export const BB_COLS = 23

/** DevKitC 38 针：从天线端到 USB 端 */
export const LEFT_PINS = [
  '3V3', 'EN', 'VP', 'VN', '34', '35', '32', '33', '25', '26',
  '27', '14', '12', 'GND', '13', 'D2', 'D3', 'CMD', '5V',
] as const
export const RIGHT_PINS = [
  'GND', '23', '22', 'TX', 'RX', '21', 'GND', '19', '18', '5',
  '17', '16', '4', '0', '2', '15', 'D1', 'D0', 'CLK',
] as const

export type Side = 'L' | 'R'

export function pinLocalX(index: number) {
  return PIN_FIRST_X - index * PITCH
}

export function pinPos(side: Side, label: string, nth = 0): Vec3 {
  const list: readonly string[] = side === 'L' ? LEFT_PINS : RIGHT_PINS
  let seen = 0
  let index = -1
  for (let i = 0; i < list.length; i++) {
    if (list[i] === label) {
      if (seen === nth) {
        index = i
        break
      }
      seen++
    }
  }
  // GPIO labels are sometimes referenced by logical side in lesson data;
  // resolve a misplaced GPIO alias against the opposite header as a safe fallback.
  if (index < 0) {
    const opposite: readonly string[] = side === 'L' ? RIGHT_PINS : LEFT_PINS
    const oppositeIndex = opposite.indexOf(label)
    if (oppositeIndex >= 0) {
      return [BOARD_X + pinLocalX(oppositeIndex), PIN_TOP, side === 'L' ? HEADER_Z : -HEADER_Z]
    }
    throw new Error(`Unknown pin ${side}:${label}`)
  }
  return [BOARD_X + pinLocalX(index), PIN_TOP, side === 'L' ? -HEADER_Z : HEADER_Z]
}

/**
 * 面包板孔位：c = 0..22 为列；r = 1..5 为前半区，-1..-5 为后半区，±6 为电源轨。
 * 前电源轨 (r = 6) 为 GND，后电源轨 (r = -6) 为 3V3。
 */
export function holeZ(r: number) {
  const s = Math.sign(r)
  const a = Math.abs(r)
  if (a >= 6) return s * 1.5
  return s * (0.25 + (a - 1) * PITCH)
}

export function holeX(c: number) {
  return BB_X - ((BB_COLS - 1) * PITCH) / 2 + c * PITCH
}

export function hole(c: number, r: number, y = BB_TOP): Vec3 {
  return [holeX(c), y, holeZ(r)]
}

export function mid(a: Vec3, b: Vec3, y?: number): Vec3 {
  return [(a[0] + b[0]) / 2, y ?? (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]
}

export function up(p: Vec3, dy: number): Vec3 {
  return [p[0], p[1] + dy, p[2]]
}
