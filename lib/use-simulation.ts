'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useI18n } from './i18n/provider'
import { translateLocale } from './i18n/messages'
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

/** Soil lesson maps pot ADC → moisture % (dry ~35, wet ~90). */
export function soilMoisturePct(pot: number) {
  return Math.round(35 + (pot / 4095) * 55)
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
  const { locale } = useI18n()
  const localeRef = useRef(locale)
  localeRef.current = locale
  const tLog = (path: string, vars?: Record<string, string | number>) => translateLocale(localeRef.current, path, vars)
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
      [0, tLog('sim.log.compiling')],
      [450, tLog('sim.log.sketchSize'), 'info'],
      [800, tLog('sim.log.esptool')],
      [1100, tLog('sim.log.connecting')],
      [1450, tLog('sim.log.writingFlash'), 'info'],
      [1750, tLog('sim.log.uploadDone'), 'ok'],
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

  const setInput = useCallback(
    <K extends keyof SimInputs>(key: K, value: SimInputs[K] | ((prev: SimInputs[K]) => SimInputs[K])) => {
      setInputs((prev) => ({
        ...prev,
        [key]: typeof value === 'function' ? (value as (p: SimInputs[K]) => SimInputs[K])(prev[key]) : value,
      }))
    },
    [],
  )

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
            pushLog(tLog('sim.log.chip'))
          }
          break
        }
        case 'blink': {
          const on = Math.floor(t / 1000) % 2 === 0
          out.led = on ? 1 : 0
          out.onboard = out.led
          if (changed('led', on)) pushLog(on ? tLog('sim.log.ledOn') : tLog('sim.log.ledOff'))
          break
        }
        case 'button': {
          out.led = input.button ? 1 : 0
          out.onboard = out.led
          if (changed('btn', input.button))
            pushLog(input.button ? tLog('sim.log.btnDown') : tLog('sim.log.btnUp'), input.button ? 'ok' : undefined)
          break
        }
        case 'pot': {
          const raw = Math.round(input.pot)
          out.led = raw / 4095
          out.onboard = out.led
          if (every('log', t, 400)) pushLog(tLog('sim.log.adc', { raw, volts: ((raw * 3.3) / 4095).toFixed(2) }))
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
            pushLog(`touchRead = ${out.touchValue}${input.touch ? tLog('sim.log.touchHint') : ''}`, input.touch ? 'ok' : undefined)
          break
        }
        case 'dht': {
          if (every('read', t, 2000)) {
            const temp = input.temp + (Math.random() - 0.5) * 0.4
            const hum = Math.round(62 - input.temp * 0.6 + Math.random() * 2)
            memo.temp = temp
            pushLog(
              tLog('sim.log.dht', {
                temp: temp.toFixed(1),
                hum,
                alarm: temp > 30 ? tLog('sim.log.dhtAlarm') : '',
              }),
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
            if (every('dot', t, 500)) pushLog(t < 100 ? tLog('sim.log.wifiConnecting') : '.')
          } else {
            out.wifi = true
            if (changed('connected', true)) {
              memo.web = input.webLed
              pushLog(tLog('sim.log.wifiConnectedIp'), 'ok')
              pushLog(tLog('sim.log.httpStarted'))
            }
            out.led = input.webLed ? 1 : 0
            out.onboard = out.led
            if (changed('web', input.webLed))
              pushLog(tLog('sim.log.httpReq', { path: input.webLed ? 'on' : 'off', state: input.webLed ? 'ON' : 'OFF' }), 'info')
          }
          break
        }
        case 'oled': {
          out.oledText = tLog('sim.log.oledTemp', { temp: ((input.temp + Math.sin(t / 1200)) as number).toFixed(1) })
          if (every('oled', t, 1200)) pushLog(tLog('sim.log.oledShow', { text: out.oledText }), 'ok')
          break
        }
        case 'ldr': {
          const light = Math.round(input.pot)
          out.led = 1 - light / 4095
          out.onboard = out.led
          if (every('ldr', t, 500)) pushLog(tLog(light < 1500 ? 'sim.log.lightDim' : 'sim.log.lightBright', { light }))
          break
        }
        case 'ultrasonic': {
          const distance = Math.round((input.pot / 4095) * 398 + 2)
          out.oledText = `${distance} cm`
          if (every('distance', t, 700)) pushLog(tLog('sim.log.distance', { cm: distance.toFixed(1) }), 'info')
          break
        }
        case 'relay': {
          const on = Math.floor(t / 2000) % 2 === 0
          out.led = on ? 1 : 0
          out.onboard = out.led
          if (changed('relay', on)) pushLog(on ? tLog('sim.log.relayOn') : tLog('sim.log.relayOff'), on ? 'ok' : undefined)
          break
        }
        case 'motor': {
          const angle = Math.round((Math.sin(t / 700) * 0.5 + 0.5) * 180)
          out.servo = angle
          if (changed('motor', Math.round(angle / 15))) pushLog(tLog('sim.log.motor', { pct: angle, dir: tLog(angle > 90 ? 'sim.log.motorFwd' : 'sim.log.motorRev') }))
          break
        }
        case 'keypad': {
          out.led = input.button ? 1 : 0
          out.onboard = out.led
          if (changed('key', input.button)) pushLog(input.button ? tLog('sim.log.keyDown') : tLog('sim.log.keyWait'), input.button ? 'ok' : undefined)
          break
        }
        case 'sleep': {
          const awake = Math.floor(t / 3500) % 2 === 0
          out.onboard = awake ? 1 : 0
          if (changed('sleep', awake)) pushLog(awake ? tLog('sim.log.sleepWake') : tLog('sim.log.sleepEnter'), awake ? 'ok' : 'info')
          break
        }
        case 'bluetooth': {
          out.wifi = t > 1800
          out.led = input.webLed ? 1 : 0
          out.onboard = out.led
          if (changed('bt', out.wifi)) pushLog(out.wifi ? tLog('sim.log.btConnected') : tLog('sim.log.btWait'), out.wifi ? 'ok' : undefined)
          if (out.wifi && changed('btCommand', input.webLed)) pushLog(input.webLed ? tLog('sim.log.btOn') : tLog('sim.log.btOff'), 'info')
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
          if (changed('ir', pressed)) pushLog(pressed ? tLog('sim.log.irCode') : tLog('sim.log.irWait'), pressed ? 'ok' : undefined)
          break
        }
        case 'fan': {
          const speed = Math.round((Math.sin(t / 1200) * 0.5 + 0.5) * 255)
          out.servo = speed / 255 * 180
          out.onboard = speed > 30 ? 1 : 0
          if (changed('fan', Math.round(speed / 20))) pushLog(tLog('sim.log.fan', { speed, pct: Math.round((speed / 255) * 100) }), 'info')
          break
        }
        case 'rtc': {
          out.wifi = t > 1600
          out.oledText = new Date(Date.now() + t).toLocaleTimeString(localeRef.current === 'zh-CN' ? 'zh-CN' : 'en-GB', { hour12: false })
          if (changed('rtc', Math.floor(t / 1000))) pushLog(tLog('sim.log.timeNow', { text: out.oledText }), 'ok')
          break
        }
        case 'pir': {
          const motion = Math.floor(t / 2600) % 2 === 1
          out.led = motion ? 1 : 0
          out.onboard = out.led
          if (changed('pir', motion)) pushLog(motion ? tLog('sim.log.pirOn') : tLog('sim.log.pirOff'), motion ? 'ok' : undefined)
          break
        }
        case 'joystick': {
          const x = Math.round((Math.sin(t / 900) * 0.5 + 0.5) * 4095)
          const y = Math.round((Math.cos(t / 1100) * 0.5 + 0.5) * 4095)
          out.servo = x / 4095 * 180
          out.oledText = `X${x} Y${y}`
          if (every('joy', t, 600)) pushLog(tLog('sim.log.joy', { x, y, btn: tLog(input.button ? 'sim.log.joyDown' : 'sim.log.joyUp') }), 'info')
          break
        }
        case 'soil': {
          const moisture = soilMoisturePct(input.pot)
          out.led = moisture < 50 ? 1 : 0
          out.onboard = out.led
          out.oledText = moisture < 50 ? `DRY ${moisture}%` : `OK  ${moisture}%`
          if (every('soil', t, 700)) pushLog(tLog(moisture < 50 ? 'sim.log.soilDry' : 'sim.log.soilOk', { pct: moisture }), moisture < 50 ? 'warn' : 'ok')
          break
        }
        case 'gas': {
          const ppm = Math.round(180 + (input.pot / 4095) * 620)
          out.led = ppm > 600 ? 1 : 0
          out.onboard = out.led
          if (every('gas', t, 700)) pushLog(tLog(ppm > 600 ? 'sim.log.gasOver' : 'sim.log.gasOk', { ppm }), ppm > 600 ? 'warn' : 'info')
          break
        }
        case 'imu': {
          const angle = Math.round(Math.sin(t / 700) * 45)
          out.servo = angle + 90
          if (every('imu', t, 500)) pushLog(tLog('sim.log.imu', { x: angle, y: Math.round(Math.cos(t / 900) * 20) }), 'info')
          break
        }
        case 'gps': {
          out.wifi = true
          out.oledText = '31.2304,121.4737'
          if (every('gps', t, 1200)) pushLog(tLog('sim.log.gpsFix'), 'ok')
          break
        }
        case 'camera': {
          out.wifi = t > 1500
          if (every('camera', t, 1000)) pushLog(out.wifi ? tLog('sim.log.camOnline') : tLog('sim.log.camInit'), out.wifi ? 'ok' : undefined)
          break
        }
        case 'lightstrip': {
          const pos = Math.floor(t / 18) % 255
          out.rgb = wheel(pos)
          if (every('strip', t, 500)) pushLog(tLog('sim.log.strip', { rgb: out.rgb.join(', ') }), 'ok')
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
