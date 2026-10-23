import { BOARD_X, HEADER_Z, PCB_TOP, PIN_FIRST_X, PITCH, type Vec3 } from '@/lib/geometry'
import type { CalloutSpec } from './parts'

/** Local coords inside Esp32Board group (origin = board center). */
export type BoardHotspot = {
  id: string
  /** Local position of the hotspot group / callout anchor. */
  local: Vec3
  hit: [number, number, number]
  /** Callout leader offsets (board lesson labels). */
  dx: number
  dy: number
  /** Hover lift amount in scene units (ref ~1.6mm-scale → ~0.12 here). */
  lift?: number
  /** Buttons briefly depress when clicked. */
  pressable?: boolean
  title: string
  body: string
}

const STRIP_LEN = 19 * PITCH
const STRIP_X = (PIN_FIRST_X + (PIN_FIRST_X - 18 * PITCH)) / 2

/**
 * ESP32-DevKitC tour — same idea as the reference Uno: almost every block on the
 * board is a named, hoverable, clickable part.
 */
export const BOARD_HOTSPOTS: BoardHotspot[] = [
  {
    id: 'usb',
    local: [-2.55, PCB_TOP + 0.11, 0],
    hit: [0.7, 0.45, 0.8],
    dx: -60,
    dy: 110,
    title: 'USB 口',
    body: '供电、烧录程序和串口通信',
  },
  {
    id: 'uart',
    local: [-1.75, PCB_TOP + 0.08, 0.1],
    hit: [0.55, 0.35, 0.55],
    dx: -90,
    dy: -40,
    title: 'USB 转串口',
    body: '把 USB 数据转成 UART，电脑才能和 ESP32 对话',
  },
  {
    id: 'ldo',
    local: [-1.0, PCB_TOP + 0.1, -0.45],
    hit: [0.5, 0.35, 0.45],
    dx: -70,
    dy: 130,
    title: '3.3V 稳压',
    body: '把 USB 5V 稳到 3.3V，给芯片和外设供电',
  },
  {
    id: 'crystal',
    local: [-0.35, PCB_TOP + 0.08, -0.55],
    hit: [0.35, 0.3, 0.3],
    dx: 40,
    dy: 120,
    title: '晶振',
    body: '给 USB 转串口芯片提供精确时钟',
  },
  {
    id: 'en',
    local: [-2.2, PCB_TOP + 0.12, -0.72],
    hit: [0.5, 0.4, 0.45],
    dx: -50,
    dy: -130,
    lift: 0.1,
    pressable: true,
    title: 'EN 复位键',
    body: '按下重启芯片，程序从头执行',
  },
  {
    id: 'boot',
    local: [-2.2, PCB_TOP + 0.12, 0.72],
    hit: [0.5, 0.4, 0.45],
    dx: -40,
    dy: 140,
    lift: 0.1,
    pressable: true,
    title: 'BOOT 键',
    body: '上传卡住 Connecting… 时按住它进入下载模式',
  },
  {
    id: 'pwr',
    local: [-1.3, PCB_TOP + 0.06, -0.82],
    hit: [0.35, 0.28, 0.28],
    dx: 30,
    dy: -120,
    title: '电源灯',
    body: '板子有电时亮起的红色指示灯',
  },
  {
    id: 'led',
    local: [-1.3, PCB_TOP + 0.06, 0.82],
    hit: [0.35, 0.28, 0.28],
    dx: 20,
    dy: 140,
    title: '板载 LED',
    body: '接在 GPIO2，示例程序常用来闪灯',
  },
  {
    id: 'module',
    local: [1.175, PCB_TOP + 0.2, 0],
    hit: [1.9, 0.55, 1.75],
    dx: -30,
    dy: -150,
    lift: 0.14,
    title: 'ESP32 模组',
    body: '双核处理器 + 4MB Flash，金属罩防干扰',
  },
  {
    id: 'antenna',
    local: [2.4, PCB_TOP + 0.12, 0],
    hit: [0.7, 0.35, 1.5],
    dx: 80,
    dy: -90,
    title: 'PCB 天线',
    body: 'Wi-Fi 和蓝牙信号从这里收发',
  },
  {
    id: 'pins-l',
    local: [STRIP_X, PCB_TOP + 0.2, -HEADER_Z],
    hit: [STRIP_LEN + 0.15, 0.55, 0.45],
    dx: 120,
    dy: -80,
    // Keep pins planted — wires target fixed pinPos(); lifting would detach leads.
    lift: 0,
    title: '左侧排针',
    body: '3V3、EN、ADC、DAC、GND、5V 等',
  },
  {
    id: 'pins-r',
    local: [STRIP_X, PCB_TOP + 0.2, HEADER_Z],
    hit: [STRIP_LEN + 0.15, 0.55, 0.45],
    dx: 120,
    dy: 100,
    lift: 0,
    title: '右侧排针',
    body: 'UART、I²C、SPI、常用 GPIO',
  },
]

export function boardHotspotWorldAt(h: BoardHotspot, offsetX = 0): Vec3 {
  return [BOARD_X + h.local[0] + offsetX, h.local[1], h.local[2]]
}

export function boardHotspotsAsCallouts(): CalloutSpec[] {
  return BOARD_HOTSPOTS.map((h) => ({
    at: boardHotspotWorldAt(h),
    title: h.title,
    body: h.body,
    dx: h.dx,
    dy: h.dy,
    pickable: true,
    interactive: Boolean(h.pressable),
    hotspotId: h.id,
  }))
}
