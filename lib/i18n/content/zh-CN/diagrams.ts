import type { LessonId } from '@/lib/lessons'

/** Chinese overrides for schematic part/net labels (keyed by part/net id). */
export type DiagramLabelPack = {
  parts?: Record<string, { label?: string; value?: string }>
  nets?: Record<string, string>
}

export const DIAGRAMS_ZH: Partial<Record<LessonId, DiagramLabelPack>> = {
  board: { parts: { led: { label: '板载 LED' } } },
  blink: {
    parts: { r: { value: '限流' }, led: { value: '阳极' } },
    nets: { led: '阳极' },
  },
  button: { parts: { btn: { label: '按钮' } } },
  pot: { parts: { pot: { label: '电位器' } } },
  rgb: { parts: { rgb: { value: '共阴' } } },
  touch: { parts: { pad: { label: '触摸垫' } } },
  dht: { parts: { led: { label: '报警 LED' } } },
  buzzer: { parts: { buz: { label: '无源蜂鸣器' } } },
  servo: { parts: { servo: { label: '舵机' } } },
  wifi: { parts: { ant: { label: 'Wi-Fi 天线' }, led: { label: '状态 LED' } } },
  ldr: { parts: { ldr: { label: '光敏电阻', value: '分压' } } },
  relay: { parts: { relay: { label: '继电器模块' }, load: { label: '负载' } } },
  motor: { parts: { drv: { label: '电机驱动' }, mot: { label: '直流电机' } } },
  keypad: { parts: { pad: { label: '4×4 键盘' } } },
  sleep: { parts: { btn: { label: '唤醒键' }, bat: { label: '电池' } } },
  bluetooth: { parts: { ant: { label: 'BLE 天线' }, led: { label: '状态' } } },
  ir: { parts: { rx: { label: 'IR 接收' }, led: { label: '指示' } } },
  fan: { parts: { fan: { label: 'PWM 风扇' } } },
  pir: { parts: { led: { label: '报警 LED' } } },
  joystick: { parts: { joy: { label: '摇杆' } } },
  soil: { parts: { soil: { label: '土壤湿度' } } },
  gas: { parts: { mq: { label: 'MQ 气体' }, buz: { label: '蜂鸣器' } } },
  lightstrip: { parts: { strip: { label: '灯带' } } },
}
