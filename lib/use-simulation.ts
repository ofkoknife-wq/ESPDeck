'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { LessonId } from './lessons'

export type Phase = 'idle' | 'uploading' | 'running'

export type SimInputs = {
  button: boolean
  pot: number
  touch: boolean
  temp: number
  webLed: boolean
  sound: boolean
}

export type SimOutputs = {
  led: number
  onboard: number
  rgb: [number, number, number]
  servo: number
  tone: number
  touchValue: number
  wifi: boolean
  oledText: string
}

export type LogLine = { id: number; text: string; tone?: 'info' | 'ok' | 'warn' }

const IDLE_OUTPUTS: SimOutputs = {
  led: 0,
  onboard: 0,
  rgb: [0, 0, 0],
  servo: 90,
  tone: 0,
  touchValue: 60,
  wifi: false,
  oledText: '',
}

const DEFAULT_INPUTS: SimInputs = {
  button: false,
  pot: 2048,
  touch: false,
  temp: 25,
  webLed: false,
  sound: true,
}

const MELODY = [262, 262, 392, 392, 440, 440, 392, 349, 349, 330, 330, 294, 294, 262]
const NOTE_NAMES: Record<number, string> = {
  262: 'Do',
  294: 'Re',
  330: 'Mi',
  349: 'Fa',
  392: 'Sol',
  440: 'La',
}
const MELODY_SCHEDULE = (() => {
  const events: { start: number; freq: number }[] = []
  let at = 0
  MELODY.forEach((freq, i) => {
    events.push({ start: at, freq })
    at += i % 7 === 6 ? 800 : 400
  })
  return { events, length: at + 1000 }
})()

function wheel(pos: number): [number, number, number] {
  if (pos < 85) return [255 - pos * 3, pos * 3, 0]
  if (pos < 170) {
    const p = pos - 85
    return [0, 255 - p * 3, p * 3]
  }
  const p = pos - 170
  return [p * 3, 0, 255 - p * 3]
}

const TICK_MS = 50

export function useSimulation(lessonId: LessonId, onRunning?: (id: LessonId) => void) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [outputs, setOutputs] = useState<SimOutputs>(IDLE_OUTPUTS)
  const [inputs, setInputs] = useState<SimInputs>(DEFAULT_INPUTS)
  const [logs, setLogs] = useState<LogLine[]>([])

  const inputsRef = useRef(inputs)
  inputsRef.current = inputs
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const startRef = useRef(0)
  const memoRef = useRef<Record<string, number | string | boolean>>({})
  const logIdRef = useRef(0)
  const onRunningRef = useRef(onRunning)
  onRunningRef.current = onRunning

  const pushLog = useCallback((text: string, tone?: LogLine['tone']) => {
    setLogs((prev) => {
      const next = [...prev, { id: logIdRef.current++, text, tone }]
      return next.length > 200 ? next.slice(-200) : next
    })
  }, [])

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  const stop = useCallback(() => {
    clearTimers()
    setPhase('idle')
    setOutputs(IDLE_OUTPUTS)
    setInputs((prev) => ({ ...prev, button: false, touch: false, webLed: false }))
  }, [])

  const reset = useCallback(() => {
    stop()
    setLogs([])
  }, [stop])

  const run = useCallback(() => {
    clearTimers()
    setOutputs(IDLE_OUTPUTS)
    setLogs([])
    setPhase('uploading')
    memoRef.current = {}
    const seq: [number, string, LogLine['tone']?][] = [
      [0, '正在编译项目…'],
      [450, '项目使用了 284,513 字节 (21%) 程序存储空间', 'info'],
      [800, 'esptool.py v4.8 · 串口 /dev/ttyUSB0'],
      [1100, 'Connecting.... 已连接 ESP32-D0WD-V3'],
      [1450, '正在写入 Flash… 100%', 'info'],
      [1750, 'Hard resetting via RTS pin… 上传完成', 'ok'],
    ]
    seq.forEach(([at, text, tone]) => {
      timersRef.current.push(setTimeout(() => pushLog(text, tone), at))
    })
    timersRef.current.push(
      setTimeout(() => {
        startRef.current = performance.now()
        setPhase('running')
        onRunningRef.current?.(lessonId)
      }, 2000),
    )
  }, [lessonId, pushLog])

  const setInput = useCallback(<K extends keyof SimInputs>(key: K, value: SimInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }, [])

  useEffect(() => {
    reset()
  }, [lessonId, reset])

  useEffect(() => {
    if (phase !== 'running') return
    const memo = memoRef.current
    const every = (key: string, t: number, ms: number) => {
      const last = (memo[key] as number | undefined) ?? -Infinity
      if (t - last >= ms) {
        memo[key] = t
        return true
      }
      return false
    }
    const changed = (key: string, value: number | string | boolean) => {
      if (memo[key] !== value) {
        memo[key] = value
        return true
      }
      return false
    }

    const tick = () => {
      const t = performance.now() - startRef.current
      const input = inputsRef.current
      const out: SimOutputs = { ...IDLE_OUTPUTS }

      switch (lessonId) {
        case 'board': {
          out.onboard = Math.floor(t / 500) % 2 === 0 ? 1 : 0
          if (changed('hello', true)) {
            pushLog('Hello, ESP32!', 'ok')
            pushLog('芯片型号: ESP32-D0WD-V3')
          }
          break
        }
        case 'blink': {
          const on = Math.floor(t / 1000) % 2 === 0
          out.led = on ? 1 : 0
          out.onboard = out.led
          if (changed('led', on)) pushLog(on ? 'LED 亮' : 'LED 灭')
          break
        }
        case 'button': {
          out.led = input.button ? 1 : 0
          out.onboard = out.led
          if (changed('btn', input.button))
            pushLog(input.button ? '按下 (GPIO4 = LOW)' : '松开 (GPIO4 = HIGH)', input.button ? 'ok' : undefined)
          break
        }
        case 'pot': {
          const raw = Math.round(input.pot)
          out.led = raw / 4095
          out.onboard = out.led
          if (every('log', t, 400)) pushLog(`ADC: ${raw}  电压: ${((raw * 3.3) / 4095).toFixed(2)} V`)
          break
        }
        case 'rgb': {
          const pos = Math.floor(t / 20) % 255
          out.rgb = wheel(pos)
          if (every('log', t, 1000)) pushLog(`R=${out.rgb[0]}  G=${out.rgb[1]}  B=${out.rgb[2]}`)
          break
        }
        case 'touch': {
          const noise = Math.round(Math.random() * 4)
          out.touchValue = input.touch ? 13 + noise : 58 + noise
          out.led = out.touchValue < 30 ? 1 : 0
          out.onboard = out.led
          if (every('log', t, 300))
            pushLog(`touchRead = ${out.touchValue}${input.touch ? '   <- 检测到触摸' : ''}`, input.touch ? 'ok' : undefined)
          break
        }
        case 'dht': {
          if (every('read', t, 2000)) {
            const temp = input.temp + (Math.random() - 0.5) * 0.4
            const hum = Math.round(62 - input.temp * 0.6 + Math.random() * 2)
            memo.temp = temp
            pushLog(
              `温度: ${temp.toFixed(1)} °C  湿度: ${hum} %${temp > 30 ? '   [报警] 温度过高' : ''}`,
              temp > 30 ? 'warn' : undefined,
            )
          }
          const alarm = ((memo.temp as number) ?? 0) > 30
          out.led = alarm ? 1 : 0
          out.onboard = out.led
          break
        }
        case 'buzzer': {
          const local = t % MELODY_SCHEDULE.length
          const idx = MELODY_SCHEDULE.events.findLastIndex((e) => e.start <= local)
          const ev = MELODY_SCHEDULE.events[idx]
          const playing = ev && local - ev.start < 350
          out.tone = playing ? ev.freq : 0
          if (playing && changed('note', `${Math.floor(t / MELODY_SCHEDULE.length)}-${idx}`))
            pushLog(`tone(${ev.freq})  ${NOTE_NAMES[ev.freq]}`)
          break
        }
        case 'servo': {
          const period = 3620
          const p = (t % period) / period
          const angle = Math.round(p < 0.5 ? p * 2 * 180 : (1 - p) * 2 * 180)
          out.servo = angle
          const bucket = Math.round(angle / 30) * 30
          if (changed('angle', bucket)) pushLog(`servo.write(${bucket})  -> ${bucket}°`)
          break
        }
        case 'wifi': {
          if (t < 2200) {
            if (every('dot', t, 500)) pushLog(t < 100 ? '正在连����������� Wi-Fi「MyHome-2.4G」' : '.')
          } else {
            out.wifi = true
            if (changed('connected', true)) {
              memo.web = input.webLed
              pushLog('已连接！IP 地址: 192.168.1.42', 'ok')
              pushLog('HTTP 服务器已启动，端口 80')
            }
            out.led = input.webLed ? 1 : 0
            out.onboard = out.led
            if (changed('web', input.webLed))
              pushLog(`收到请求: GET /${input.webLed ? 'on' : 'off'}  -> 200 ${input.webLed ? 'ON' : 'OFF'}`, 'info')
          }
          break
        }
        case 'oled': {
          out.oledText = `温度 ${((input.temp + Math.sin(t / 1200)) as number).toFixed(1)}°C`
          if (every('oled', t, 1200)) pushLog(`OLED 显示: ${out.oledText}`, 'ok')
          break
        }
        case 'ldr': {
          const light = Math.round(input.pot)
          out.led = 1 - light / 4095
          out.onboard = out.led
          if (every('ldr', t, 500)) pushLog(`光照 ADC: ${light}  ${light < 1500 ? '环境较暗，LED 开启' : '光线充足'}`)
          break
        }
        case 'ultrasonic': {
          const distance = Math.round((input.pot / 4095) * 398 + 2)
          out.oledText = `${distance} cm`
          if (every('distance', t, 700)) pushLog(`距离: ${distance.toFixed(1)} cm`, 'info')
          break
        }
        case 'relay': {
          const on = Math.floor(t / 2000) % 2 === 0
          out.led = on ? 1 : 0
          out.onboard = out.led
          if (changed('relay', on)) pushLog(on ? '继电器吸合 · NO 导通' : '继电器释放 · NO 断开', on ? 'ok' : undefined)
          break
        }
        case 'motor': {
          const angle = Math.round((Math.sin(t / 700) * 0.5 + 0.5) * 180)
          out.servo = angle
          if (changed('motor', Math.round(angle / 15))) pushLog(`电机 PWM: ${angle}% · 方向 ${angle > 90 ? '正转' : '反转'}`)
          break
        }
        case 'keypad': {
          out.led = input.button ? 1 : 0
          out.onboard = out.led
          if (changed('key', input.button)) pushLog(input.button ? '按键输入: 1 · GPIO4 = LOW' : '等待按键输入…', input.button ? 'ok' : undefined)
          break
        }
        case 'sleep': {
          const awake = Math.floor(t / 3500) % 2 === 0
          out.onboard = awake ? 1 : 0
          if (changed('sleep', awake)) pushLog(awake ? '唤醒 · 运行用户程序' : '进入深度睡眠 · 功耗降低', awake ? 'ok' : 'info')
          break
        }
        case 'bluetooth': {
          out.wifi = t > 1800
          out.led = input.webLed ? 1 : 0
          out.onboard = out.led
          if (changed('bt', out.wifi)) pushLog(out.wifi ? '蓝牙已连接: ESP32-LAB' : '正在等待手机连接…', out.wifi ? 'ok' : undefined)
          if (out.wifi && changed('btCommand', input.webLed)) pushLog(input.webLed ? '收到蓝牙指令: ON' : '收到蓝牙指令: OFF', 'info')
          break
        }
        case 'neopixel': {
          const pos = Math.floor(t / 25) % 255
          out.rgb = wheel(pos)
          out.led = 0.6
          if (every('pixel', t, 700)) pushLog(`NeoPixel ${Math.floor(t / 700) % 8 + 1}/8 · RGB(${out.rgb.join(', ')})`, 'ok')
          break
        }
        case 'ir': {
          const pressed = Math.floor(t / 2200) % 2 === 1
          out.led = pressed ? 1 : 0
          out.onboard = out.led
          if (changed('ir', pressed)) pushLog(pressed ? '收到红外编码 0xFFA25D · LED 开' : '等待红外遥控指令…', pressed ? 'ok' : undefined)
          break
        }
        case 'fan': {
          const speed = Math.round((Math.sin(t / 1200) * 0.5 + 0.5) * 255)
          out.servo = speed / 255 * 180
          out.onboard = speed > 30 ? 1 : 0
          if (changed('fan', Math.round(speed / 20))) pushLog(`风扇 PWM: ${speed}/255 · 转速 ${Math.round(speed / 255 * 100)}%`, 'info')
          break
        }
        case 'rtc': {
          out.wifi = t > 1600
          out.oledText = new Date(Date.now() + t).toLocaleTimeString('zh-CN', { hour12: false })
          if (changed('rtc', Math.floor(t / 1000))) pushLog(`当前时间: ${out.oledText}`, 'ok')
          break
        }
        case 'pir': {
          const motion = Math.floor(t / 2600) % 2 === 1
          out.led = motion ? 1 : 0
          out.onboard = out.led
          if (changed('pir', motion)) pushLog(motion ? '检测到移动 · LED 开启' : '环境安静 · LED 熄灭', motion ? 'ok' : undefined)
          break
        }
        case 'joystick': {
          const x = Math.round((Math.sin(t / 900) * 0.5 + 0.5) * 4095)
          const y = Math.round((Math.cos(t / 1100) * 0.5 + 0.5) * 4095)
          out.servo = x / 4095 * 180
          out.oledText = `X${x} Y${y}`
          if (every('joy', t, 600)) pushLog(`摇杆 X=${x}  Y=${y}  按键=${input.button ? '按下' : '松开'}`, 'info')
          break
        }
        case 'soil': {
          const moisture = Math.round(35 + (input.pot / 4095) * 55)
          out.led = moisture < 50 ? 1 : 0
          out.onboard = out.led
          if (every('soil', t, 700)) pushLog(`土壤湿度: ${moisture}%${moisture < 50 ? ' · 需要浇水' : ' · 状态良好'}`, moisture < 50 ? 'warn' : 'ok')
          break
        }
        case 'gas': {
          const ppm = Math.round(180 + (input.pot / 4095) * 620)
          out.led = ppm > 600 ? 1 : 0
          out.onboard = out.led
          if (every('gas', t, 700)) pushLog(`气体浓度: ${ppm} ppm${ppm > 600 ? ' · 超过阈值' : ''}`, ppm > 600 ? 'warn' : 'info')
          break
        }
        case 'imu': {
          const angle = Math.round(Math.sin(t / 700) * 45)
          out.servo = angle + 90
          if (every('imu', t, 500)) pushLog(`加速度 X=${angle}°  Y=${Math.round(Math.cos(t / 900) * 20)}°`, 'info')
          break
        }
        case 'gps': {
          out.wifi = true
          out.oledText = '31.2304,121.4737'
          if (every('gps', t, 1200)) pushLog('GPS 定位成功 · 卫星数: 8', 'ok')
          break
        }
        case 'camera': {
          out.wifi = t > 1500
          if (every('camera', t, 1000)) pushLog(out.wifi ? '摄像头在线 · 发送一帧 JPEG' : '正在初始化摄像头…', out.wifi ? 'ok' : undefined)
          break
        }
        case 'lightstrip': {
          const pos = Math.floor(t / 18) % 255
          out.rgb = wheel(pos)
          if (every('strip', t, 500)) pushLog(`灯带动画 · 当前颜色 RGB(${out.rgb.join(', ')})`, 'ok')
          break
        }
      }
      setOutputs(out)
    }

    tick()
    const id = setInterval(tick, TICK_MS)
    return () => clearInterval(id)
  }, [phase, lessonId, pushLog])

  useBuzzer(phase === 'running' && inputs.sound ? outputs.tone : 0)

  useEffect(() => clearTimers, [])

  return { phase, outputs, inputs, setInput, logs, run, stop, reset }
}

function useBuzzer(freq: number) {
  const ctxRef = useRef<AudioContext | null>(null)
  const oscRef = useRef<OscillatorNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)

  useEffect(() => {
    if (freq <= 0) {
      if (gainRef.current && ctxRef.current) gainRef.current.gain.setTargetAtTime(0, ctxRef.current.currentTime, 0.01)
      return
    }
    if (!ctxRef.current) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      const ctx = new AC()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      gain.gain.value = 0
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      ctxRef.current = ctx
      oscRef.current = osc
      gainRef.current = gain
    }
    const ctx = ctxRef.current
    if (ctx.state === 'suspended') void ctx.resume()
    oscRef.current!.frequency.setValueAtTime(freq, ctx.currentTime)
    gainRef.current!.gain.setTargetAtTime(0.035, ctx.currentTime, 0.005)
  }, [freq])

  useEffect(
    () => () => {
      void ctxRef.current?.close()
    },
    [],
  )
}
