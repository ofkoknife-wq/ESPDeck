import type { CircuitGraph, CircuitNet, CircuitPart, PartKind } from './advanced-types'
import type { LessonId } from './lessons'

export type LessonDiagram = {
  schematic: CircuitGraph
  /** Pin labels matching LEFT_PINS / RIGHT_PINS (e.g. "2", "GND", "3V3"). */
  pins: string[]
}

type PartSpec = { id: string; kind: PartKind; label: string; value?: string }
type NetSpec = { id: string; label: string; from: string; to: string; color?: string }

const COLORS = {
  signal: '#2f9e5b',
  power: '#d63a2c',
  gnd: '#3f444a',
  analog: '#2d6fd6',
  data: '#7352a4',
  pwm: '#e6b422',
}

function layout(parts: PartSpec[], nets: NetSpec[]): CircuitGraph {
  const placed: CircuitPart[] = parts.map((part, index) => {
    if (part.id === 'mcu') return { ...part, x: 72, y: 160 }
    const row = index - (parts[0]?.id === 'mcu' ? 1 : 0)
    return {
      ...part,
      x: 400 + (row % 2) * 24,
      y: 56 + row * 88,
    }
  })
  const placedNets: CircuitNet[] = nets.map((net) => ({
    id: net.id,
    label: net.label,
    from: net.from,
    to: net.to,
    color: net.color ?? COLORS.signal,
  }))
  return { parts: placed, nets: placedNets }
}

function diagram(parts: PartSpec[], nets: NetSpec[], pins: string[]): LessonDiagram {
  return { schematic: layout(parts, nets), pins }
}

const MCU: PartSpec = { id: 'mcu', kind: 'mcu', label: 'ESP32', value: 'DevKitC' }

/** Per-lesson schematic + pinout highlights for the basic lab stage. */
export const LESSON_DIAGRAMS: Record<LessonId, LessonDiagram> = {
  board: diagram(
    [MCU, { id: 'usb', kind: 'usb', label: 'USB', value: 'UART' }, { id: 'led', kind: 'led', label: '板载 LED', value: 'GPIO2' }],
    [
      { id: 'usb', label: 'USB', from: 'mcu', to: 'usb', color: COLORS.data },
      { id: 'led', label: 'GPIO2', from: 'mcu', to: 'led', color: COLORS.pwm },
    ],
    ['3V3', '5V', 'GND', 'EN', '0', '2', 'TX', 'RX'],
  ),
  blink: diagram(
    [
      MCU,
      { id: 'r', kind: 'resistor', label: '220Ω', value: '限流' },
      { id: 'led', kind: 'led', label: 'LED', value: '阳极' },
    ],
    [
      { id: 'gpio', label: 'GPIO2', from: 'mcu', to: 'r', color: COLORS.pwm },
      { id: 'led', label: '阳极', from: 'r', to: 'led', color: COLORS.signal },
      { id: 'gnd', label: 'GND', from: 'led', to: 'mcu', color: COLORS.gnd },
    ],
    ['2', 'GND'],
  ),
  button: diagram(
    [
      MCU,
      { id: 'btn', kind: 'button', label: '按钮', value: 'INPUT_PULLUP' },
      { id: 'led', kind: 'led', label: 'LED', value: 'GPIO2' },
    ],
    [
      { id: 'btn', label: 'GPIO4', from: 'mcu', to: 'btn', color: COLORS.signal },
      { id: 'btn-gnd', label: 'GND', from: 'btn', to: 'mcu', color: COLORS.gnd },
      { id: 'led', label: 'GPIO2', from: 'mcu', to: 'led', color: COLORS.pwm },
    ],
    ['4', '2', 'GND'],
  ),
  pot: diagram(
    [
      MCU,
      { id: 'pot', kind: 'pot', label: '电位器', value: '10kΩ' },
      { id: 'led', kind: 'led', label: 'LED', value: 'PWM' },
    ],
    [
      { id: 'vcc', label: '3V3', from: 'mcu', to: 'pot', color: COLORS.power },
      { id: 'wiper', label: 'GPIO34', from: 'pot', to: 'mcu', color: COLORS.analog },
      { id: 'gnd', label: 'GND', from: 'pot', to: 'mcu', color: COLORS.gnd },
      { id: 'led', label: 'GPIO2', from: 'mcu', to: 'led', color: COLORS.pwm },
    ],
    ['34', '3V3', 'GND', '2'],
  ),
  rgb: diagram(
    [
      MCU,
      { id: 'rr', kind: 'resistor', label: '220Ω×3' },
      { id: 'rgb', kind: 'led', label: 'RGB LED', value: '共阴' },
    ],
    [
      { id: 'r', label: 'GPIO25', from: 'mcu', to: 'rr', color: '#d63a2c' },
      { id: 'g', label: 'GPIO26', from: 'mcu', to: 'rgb', color: '#2f9e5b' },
      { id: 'b', label: 'GPIO27', from: 'mcu', to: 'rgb', color: '#2d6fd6' },
      { id: 'gnd', label: 'GND', from: 'rgb', to: 'mcu', color: COLORS.gnd },
    ],
    ['25', '26', '27', 'GND'],
  ),
  touch: diagram(
    [MCU, { id: 'pad', kind: 'device', label: '触摸垫', value: 'T0' }, { id: 'led', kind: 'led', label: 'LED' }],
    [
      { id: 't0', label: 'GPIO4/T0', from: 'mcu', to: 'pad', color: COLORS.analog },
      { id: 'led', label: 'GPIO2', from: 'mcu', to: 'led', color: COLORS.pwm },
    ],
    ['4', '2', 'GND'],
  ),
  dht: diagram(
    [MCU, { id: 'dht', kind: 'dht', label: 'DHT11' }, { id: 'led', kind: 'led', label: '报警 LED' }],
    [
      { id: 'data', label: 'GPIO4', from: 'mcu', to: 'dht', color: COLORS.data },
      { id: 'vcc', label: '3V3', from: 'mcu', to: 'dht', color: COLORS.power },
      { id: 'gnd', label: 'GND', from: 'dht', to: 'mcu', color: COLORS.gnd },
      { id: 'led', label: 'GPIO2', from: 'mcu', to: 'led', color: COLORS.pwm },
    ],
    ['4', '3V3', 'GND', '2'],
  ),
  buzzer: diagram(
    [MCU, { id: 'buz', kind: 'device', label: '无源蜂鸣器' }],
    [
      { id: 'tone', label: 'GPIO18', from: 'mcu', to: 'buz', color: COLORS.pwm },
      { id: 'gnd', label: 'GND', from: 'buz', to: 'mcu', color: COLORS.gnd },
    ],
    ['18', 'GND'],
  ),
  servo: diagram(
    [MCU, { id: 'servo', kind: 'device', label: '舵机', value: 'PWM' }],
    [
      { id: 'sig', label: 'GPIO18', from: 'mcu', to: 'servo', color: COLORS.pwm },
      { id: 'vcc', label: '5V', from: 'mcu', to: 'servo', color: COLORS.power },
      { id: 'gnd', label: 'GND', from: 'servo', to: 'mcu', color: COLORS.gnd },
    ],
    ['18', '5V', 'GND'],
  ),
  wifi: diagram(
    [MCU, { id: 'ant', kind: 'device', label: 'Wi-Fi 天线', value: '2.4GHz' }, { id: 'led', kind: 'led', label: '状态 LED' }],
    [
      { id: 'rf', label: 'RF', from: 'mcu', to: 'ant', color: COLORS.analog },
      { id: 'led', label: 'GPIO2', from: 'mcu', to: 'led', color: COLORS.pwm },
    ],
    ['2', 'GND'],
  ),
  oled: diagram(
    [MCU, { id: 'oled', kind: 'oled', label: 'OLED', value: '0x3C' }],
    [
      { id: 'sda', label: 'SDA 21', from: 'mcu', to: 'oled', color: COLORS.data },
      { id: 'scl', label: 'SCL 22', from: 'mcu', to: 'oled', color: COLORS.signal },
      { id: 'vcc', label: '3V3', from: 'mcu', to: 'oled', color: COLORS.power },
      { id: 'gnd', label: 'GND', from: 'oled', to: 'mcu', color: COLORS.gnd },
    ],
    ['21', '22', '3V3', 'GND'],
  ),
  ldr: diagram(
    [MCU, { id: 'ldr', kind: 'pot', label: '光敏电阻', value: '分压' }, { id: 'led', kind: 'led', label: 'LED' }],
    [
      { id: 'adc', label: 'GPIO34', from: 'ldr', to: 'mcu', color: COLORS.analog },
      { id: 'vcc', label: '3V3', from: 'mcu', to: 'ldr', color: COLORS.power },
      { id: 'led', label: 'GPIO2', from: 'mcu', to: 'led', color: COLORS.pwm },
    ],
    ['34', '3V3', 'GND', '2'],
  ),
  ultrasonic: diagram(
    [MCU, { id: 'hc', kind: 'device', label: 'HC-SR04' }],
    [
      { id: 'trig', label: 'TRIG 5', from: 'mcu', to: 'hc', color: COLORS.signal },
      { id: 'echo', label: 'ECHO 18', from: 'hc', to: 'mcu', color: COLORS.analog },
      { id: 'vcc', label: '5V', from: 'mcu', to: 'hc', color: COLORS.power },
      { id: 'gnd', label: 'GND', from: 'hc', to: 'mcu', color: COLORS.gnd },
    ],
    ['5', '18', '5V', 'GND'],
  ),
  relay: diagram(
    [MCU, { id: 'relay', kind: 'device', label: '继电器模块' }, { id: 'load', kind: 'led', label: '负载' }],
    [
      { id: 'in', label: 'GPIO26', from: 'mcu', to: 'relay', color: COLORS.signal },
      { id: 'vcc', label: '5V', from: 'mcu', to: 'relay', color: COLORS.power },
      { id: 'load', label: 'COM/NO', from: 'relay', to: 'load', color: COLORS.pwm },
    ],
    ['26', '5V', 'GND'],
  ),
  motor: diagram(
    [MCU, { id: 'drv', kind: 'device', label: '电机驱动' }, { id: 'mot', kind: 'device', label: '直流电机' }],
    [
      { id: 'pwm', label: 'PWM', from: 'mcu', to: 'drv', color: COLORS.pwm },
      { id: 'dir', label: 'DIR', from: 'mcu', to: 'drv', color: COLORS.signal },
      { id: 'out', label: 'OUT', from: 'drv', to: 'mot', color: COLORS.power },
    ],
    ['25', '26', 'GND', '5V'],
  ),
  keypad: diagram(
    [MCU, { id: 'pad', kind: 'button', label: '4×4 键盘' }],
    [
      { id: 'row', label: 'ROW', from: 'mcu', to: 'pad', color: COLORS.signal },
      { id: 'col', label: 'COL', from: 'pad', to: 'mcu', color: COLORS.data },
    ],
    ['13', '12', '14', '27', '26', '25', '33', '32'],
  ),
  sleep: diagram(
    [MCU, { id: 'btn', kind: 'button', label: '唤醒键' }, { id: 'bat', kind: 'device', label: '电池', value: '3.7V' }],
    [
      { id: 'wake', label: 'GPIO33', from: 'btn', to: 'mcu', color: COLORS.signal },
      { id: 'vbat', label: 'VBAT', from: 'bat', to: 'mcu', color: COLORS.power },
    ],
    ['33', 'GND', 'EN'],
  ),
  bluetooth: diagram(
    [MCU, { id: 'ant', kind: 'device', label: 'BLE 天线' }, { id: 'led', kind: 'led', label: '状态' }],
    [
      { id: 'rf', label: 'RF', from: 'mcu', to: 'ant', color: COLORS.analog },
      { id: 'led', label: 'GPIO2', from: 'mcu', to: 'led', color: COLORS.pwm },
    ],
    ['2', 'GND'],
  ),
  neopixel: diagram(
    [MCU, { id: 'strip', kind: 'led', label: 'NeoPixel', value: 'DIN' }],
    [
      { id: 'din', label: 'GPIO23', from: 'mcu', to: 'strip', color: COLORS.data },
      { id: 'vcc', label: '5V', from: 'mcu', to: 'strip', color: COLORS.power },
      { id: 'gnd', label: 'GND', from: 'strip', to: 'mcu', color: COLORS.gnd },
    ],
    ['23', '5V', 'GND'],
  ),
  ir: diagram(
    [MCU, { id: 'rx', kind: 'device', label: 'IR 接收' }, { id: 'led', kind: 'led', label: '指示' }],
    [
      { id: 'out', label: 'GPIO15', from: 'rx', to: 'mcu', color: COLORS.signal },
      { id: 'vcc', label: '3V3', from: 'mcu', to: 'rx', color: COLORS.power },
      { id: 'led', label: 'GPIO2', from: 'mcu', to: 'led', color: COLORS.pwm },
    ],
    ['15', '3V3', 'GND', '2'],
  ),
  fan: diagram(
    [MCU, { id: 'fan', kind: 'device', label: 'PWM 风扇' }],
    [
      { id: 'pwm', label: 'GPIO25', from: 'mcu', to: 'fan', color: COLORS.pwm },
      { id: 'vcc', label: '5V', from: 'mcu', to: 'fan', color: COLORS.power },
      { id: 'gnd', label: 'GND', from: 'fan', to: 'mcu', color: COLORS.gnd },
    ],
    ['25', '5V', 'GND'],
  ),
  rtc: diagram(
    [MCU, { id: 'rtc', kind: 'device', label: 'RTC', value: 'I²C' }, { id: 'oled', kind: 'oled', label: 'OLED' }],
    [
      { id: 'sda', label: 'SDA 21', from: 'mcu', to: 'rtc', color: COLORS.data },
      { id: 'scl', label: 'SCL 22', from: 'mcu', to: 'oled', color: COLORS.signal },
    ],
    ['21', '22', '3V3', 'GND'],
  ),
  pir: diagram(
    [MCU, { id: 'pir', kind: 'device', label: 'PIR' }, { id: 'led', kind: 'led', label: '报警 LED' }],
    [
      { id: 'out', label: 'GPIO27', from: 'pir', to: 'mcu', color: COLORS.signal },
      { id: 'vcc', label: '5V', from: 'mcu', to: 'pir', color: COLORS.power },
      { id: 'led', label: 'GPIO2', from: 'mcu', to: 'led', color: COLORS.pwm },
    ],
    ['27', '5V', 'GND', '2'],
  ),
  joystick: diagram(
    [MCU, { id: 'joy', kind: 'pot', label: '摇杆', value: 'X/Y' }, { id: 'oled', kind: 'oled', label: 'OLED' }],
    [
      { id: 'x', label: 'GPIO34', from: 'joy', to: 'mcu', color: COLORS.analog },
      { id: 'y', label: 'GPIO35', from: 'joy', to: 'mcu', color: COLORS.analog },
      { id: 'sw', label: 'GPIO32', from: 'joy', to: 'mcu', color: COLORS.signal },
    ],
    ['34', '35', '32', '3V3', 'GND'],
  ),
  soil: diagram(
    [MCU, { id: 'soil', kind: 'device', label: '土壤湿度' }, { id: 'oled', kind: 'oled', label: 'OLED' }],
    [
      { id: 'adc', label: 'GPIO34', from: 'soil', to: 'mcu', color: COLORS.analog },
      { id: 'sda', label: 'SDA 21', from: 'mcu', to: 'oled', color: COLORS.data },
    ],
    ['34', '21', '22', '3V3', 'GND'],
  ),
  gas: diagram(
    [MCU, { id: 'mq', kind: 'device', label: 'MQ 气体' }, { id: 'buz', kind: 'device', label: '蜂鸣器' }],
    [
      { id: 'ao', label: 'GPIO34', from: 'mq', to: 'mcu', color: COLORS.analog },
      { id: 'tone', label: 'GPIO18', from: 'mcu', to: 'buz', color: COLORS.pwm },
    ],
    ['34', '18', '5V', 'GND'],
  ),
  imu: diagram(
    [MCU, { id: 'imu', kind: 'device', label: 'IMU', value: 'I²C' }, { id: 'oled', kind: 'oled', label: 'OLED' }],
    [
      { id: 'sda', label: 'SDA 21', from: 'mcu', to: 'imu', color: COLORS.data },
      { id: 'scl', label: 'SCL 22', from: 'mcu', to: 'oled', color: COLORS.signal },
    ],
    ['21', '22', '3V3', 'GND'],
  ),
  gps: diagram(
    [MCU, { id: 'gps', kind: 'device', label: 'GPS', value: 'UART' }, { id: 'oled', kind: 'oled', label: 'OLED' }],
    [
      { id: 'tx', label: 'RX 16', from: 'gps', to: 'mcu', color: COLORS.data },
      { id: 'rx', label: 'TX 17', from: 'mcu', to: 'gps', color: COLORS.signal },
    ],
    ['16', '17', '3V3', 'GND'],
  ),
  camera: diagram(
    [MCU, { id: 'cam', kind: 'device', label: 'OV2640' }, { id: 'ant', kind: 'device', label: 'Wi-Fi' }],
    [
      { id: 'dvp', label: 'DVP', from: 'mcu', to: 'cam', color: COLORS.data },
      { id: 'rf', label: 'RF', from: 'mcu', to: 'ant', color: COLORS.analog },
    ],
    ['GND', '5V', '3V3'],
  ),
  lightstrip: diagram(
    [MCU, { id: 'strip', kind: 'led', label: '灯带', value: 'DIN' }],
    [
      { id: 'din', label: 'GPIO23', from: 'mcu', to: 'strip', color: COLORS.data },
      { id: 'vcc', label: '5V', from: 'mcu', to: 'strip', color: COLORS.power },
      { id: 'gnd', label: 'GND', from: 'strip', to: 'mcu', color: COLORS.gnd },
    ],
    ['23', '5V', 'GND'],
  ),
}

export function getLessonDiagram(lessonId: LessonId): LessonDiagram {
  return LESSON_DIAGRAMS[lessonId]
}
