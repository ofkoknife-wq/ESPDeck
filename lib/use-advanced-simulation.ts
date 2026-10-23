'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from './i18n/provider'
import { translateLocale } from './i18n/messages'
import { testsPassed } from './code-tests'
import type { AdvancedLessonPackage, Fault } from './advanced-types'
import {
  DEFAULT_INPUTS as BASE_INPUTS,
  IDLE_OUTPUTS,
  type LogLine,
  type Phase,
  type SimInputs,
  type SimOutputs,
} from './use-simulation'

export type AdvancedOutputs = SimOutputs & {
  scope: number[]
  currentMa: number
  i2cFound: string[]
  busNote: string
  packets: { time: string; proto: string; dir: string; data: string; status: string }[]
}

const IDLE: SimOutputs = { ...IDLE_OUTPUTS }
const DEFAULT_INPUTS: SimInputs = { ...BASE_INPUTS, sound: false }

function activeFault(lesson: AdvancedLessonPackage, injected: string | null, solved: string[]): Fault | undefined {
  if (!injected || solved.includes(injected)) return undefined
  return lesson.faults.find((fault) => fault.id === injected)
}

export function useAdvancedSimulation(lesson: AdvancedLessonPackage, code: string, injected: string | null, solved: string[]) {
  const { locale } = useI18n()
  const localeRef = useRef(locale)
  localeRef.current = locale
  const tLog = (path: string, vars?: Record<string, string | number>) => translateLocale(localeRef.current, path, vars)
  const [phase, setPhase] = useState<Phase>('idle')
  const [inputs, setInputs] = useState<SimInputs>(DEFAULT_INPUTS)
  const [logs, setLogs] = useState<LogLine[]>([])
  const [outputs, setOutputs] = useState<AdvancedOutputs>({
    ...IDLE,
    scope: Array(80).fill(1.65),
    currentMa: 38,
    i2cFound: [],
    busNote: translateLocale(locale, 'advancedSim.busIdle'),
    packets: [],
  })

  const inputsRef = useRef(inputs)
  inputsRef.current = inputs
  const logId = useRef(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const t0 = useRef(0)
  const codeOk = useMemo(() => testsPassed(code, lesson.challenge.tests), [code, lesson])
  const fault = activeFault(lesson, injected, solved)

  const pushLog = useCallback((text: string, tone?: LogLine['tone']) => {
    setLogs((prev) => {
      const next = [...prev, { id: logId.current++, text, tone }]
      return next.length > 220 ? next.slice(-220) : next
    })
  }, [])

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  const stop = useCallback(() => {
    clearTimers()
    setPhase('idle')
    setOutputs({ ...IDLE, scope: Array(80).fill(1.65), currentMa: 38, i2cFound: [], busNote: tLog('advancedSim.stopped'), packets: [] })
  }, [])

  const reset = useCallback(() => {
    stop()
    setLogs([])
  }, [stop])

  const run = useCallback(() => {
    clearTimers()
    setLogs([])
    setPhase('uploading')
    pushLog(tLog('advancedSim.compiling'))
    timers.current.push(setTimeout(() => pushLog(tLog('advancedSim.writingFlash'), 'info'), 600))
    timers.current.push(
      setTimeout(() => {
        t0.current = performance.now()
        setPhase('running')
        pushLog(tLog('advancedSim.running'), 'ok')
      }, 1400),
    )
  }, [pushLog])

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
  }, [lesson.id, reset])

  useEffect(() => {
    if (phase !== 'running') return
    const id = window.setInterval(() => {
      const t = performance.now() - t0.current
      const input = inputsRef.current
      const out: AdvancedOutputs = {
        ...IDLE,
        scope: [],
        currentMa: 42,
        i2cFound: [],
        busNote: tLog('advancedSim.ok'),
        packets: [],
      }

      const wave = (fn: (i: number) => number) => Array.from({ length: 80 }, (_, i) => fn(i + t / 40))

      switch (lesson.id) {
        case 'gpio-isr': {
          const floating = fault?.id === 'floating'
          const wrongPin = fault?.id === 'wrong-pin'
          const bounce = !codeOk || fault?.id === 'no-debounce'
          const pressed = input.button && !wrongPin
          const glitch = floating && Math.sin(t / 90) > 0.82
          const fire = pressed || glitch
          out.led = fire ? 1 : 0
          out.onboard = out.led
          out.currentMa = 40 + (fire ? 8 : 0)
          out.scope = wave((i) => {
            if (bounce && fire && i % 9 < 2) return Math.random() > 0.4 ? 3.2 : 0.1
            return fire ? 0.12 : 3.25
          })
          if (Math.floor(t / 280) !== Math.floor((t - 50) / 280)) {
            if (floating && glitch) pushLog(tLog('advancedSim.isrFloat'), 'warn')
            else if (wrongPin && input.button) pushLog(tLog('advancedSim.wrongPin'), 'warn')
            else if (fire && bounce) pushLog(tLog('advancedSim.bounce'), 'warn')
            else if (fire) pushLog(tLog('advancedSim.debounced'), 'ok')
          }
          break
        }
        case 'adc-filter': {
          const open = fault?.id === 'floating-adc'
          const five = fault?.id === '5v-in'
          const rawBase = open ? 1800 + Math.sin(t / 80) * 900 : five ? 4095 : input.pot
          const noise = codeOk && fault?.id !== 'no-filter' ? 18 : 220
          const sample = Math.max(0, Math.min(4095, rawBase + (Math.random() - 0.5) * noise))
          out.led = sample / 4095
          out.onboard = out.led
          out.currentMa = five ? 95 : 48
          out.scope = wave((i) => {
            const n = (codeOk ? 0.04 : 0.35) * Math.sin(i / 2)
            return five ? 3.3 : open ? 1.5 + Math.sin(i / 3) * 1.2 : (input.pot / 4095) * 3.3 + n
          })
          if (Math.floor(t / 400) !== Math.floor((t - 50) / 400)) {
            const avg = codeOk ? sample : Math.round(sample + (Math.random() - 0.5) * 80)
            pushLog(`ADC raw=${Math.round(sample)} avg=${Math.round(avg)} V=${((avg * 3.3) / 4095).toFixed(2)}`, five ? 'warn' : 'info')
          }
          break
        }
        case 'serial-log': {
          const baud = fault?.id === 'baud'
          const flood = !codeOk || fault?.id === 'flood'
          out.onboard = Math.floor(t / 500) % 2 ? 1 : 0
          out.currentMa = flood ? 70 : 44
          out.scope = wave((i) => (Math.sin(i / (baud ? 1.1 : 2.2)) > 0 ? 3.3 : 0.1))
          if (flood || Math.floor(t / 500) !== Math.floor((t - 50) / 500)) {
            pushLog(baud ? 'çâû¥#??xx' : `[${Math.round(t)}ms][INFO] heartbeat`, baud ? 'warn' : 'ok')
          }
          break
        }
        case 'open-wire': {
          const openGpio = fault?.id === 'open-gpio'
          const openGnd = fault?.id === 'open-gnd'
          const bigR = fault?.id === 'wrong-r'
          const on = Math.floor(t / 500) % 2 === 0
          out.onboard = on ? 1 : 0
          out.led = openGpio || openGnd ? 0 : bigR ? (on ? 0.12 : 0) : on ? 1 : 0
          out.currentMa = openGpio || openGnd ? 39 : bigR ? 41 : on ? 52 : 39
          out.scope = wave(() => (on ? 3.25 : 0.08))
          if (Math.floor(t / 500) !== Math.floor((t - 50) / 500)) {
            if (openGpio) pushLog(tLog('advancedSim.openGpio'), 'warn')
            else if (openGnd) pushLog(tLog('advancedSim.openGnd'), 'warn')
            else if (bigR) pushLog(tLog('advancedSim.bigR'), 'warn')
            else pushLog(on ? tLog('advancedSim.ledOnMa') : tLog('advancedSim.ledOff'), on ? 'ok' : undefined)
          }
          break
        }
        case 'crash-log': {
          out.currentMa = codeOk ? 45 : 80
          out.scope = wave((i) => (codeOk ? 1.65 : 0.4 + Math.random()))
          if (!codeOk && Math.floor(t / 1600) !== Math.floor((t - 50) / 1600)) {
            pushLog('Guru Meditation Error: Core 1 panic\'ed (Unhandled debug exception)', 'warn')
            pushLog('Stack overflow? Recursive safeWork() never returns', 'warn')
            pushLog('Backtrace: 0x400d1234 0x400d1234 0x400d1234', 'info')
          } else if (codeOk && Math.floor(t / 1200) !== Math.floor((t - 50) / 1200)) {
            pushLog(tLog('advancedSim.recursionOk'), 'ok')
          }
          break
        }
        case 'sensor-node': {
          const dhtOpen = fault?.id === 'dht-open'
          const sdaOpen = fault?.id === 'sda-open'
          const temp = dhtOpen ? NaN : input.temp + Math.sin(t / 1800) * 0.3
          const alarm = !Number.isNaN(temp) && temp > 30
          out.led = alarm ? 1 : 0
          out.onboard = out.led
          out.oledText = sdaOpen ? '' : dhtOpen ? 'DHT nan' : `Temp ${temp.toFixed(1)}C`
          out.currentMa = 55 + (alarm ? 6 : 0)
          out.scope = wave((i) => (alarm ? 3.2 : 0.2 + Math.sin(i / 6) * 0.05))
          if (Math.floor(t / 2000) !== Math.floor((t - 50) / 2000)) {
            if (dhtOpen) pushLog(tLog('advancedSim.dhtOpen'), 'warn')
            else if (sdaOpen) pushLog(tLog('advancedSim.oledNack'), 'warn')
            else pushLog(`[${Math.round(t)}ms] temp=${temp.toFixed(1)} avg=${temp.toFixed(1)}`, alarm ? 'warn' : 'ok')
          }
          break
        }
        case 'i2c-scan': {
          const sdaOpen = fault?.id === 'sda-open'
          const noPu = fault?.id === 'no-pullup'
          const conflict = fault?.id === 'conflict'
          const wrongAddr = fault?.id === 'wrong-addr' || !code.includes('0x3C')
          const busOk = !sdaOpen && !noPu && codeOk
          out.i2cFound = busOk ? (conflict ? ['0x3C', '0x3C?'] : ['0x3C']) : []
          out.oledText = busOk && !wrongAddr && !conflict ? 'ESP32 LAB' : ''
          out.currentMa = noPu ? 61 : busOk ? 58 : 44
          out.busNote = sdaOpen ? tLog('advancedSim.sdaOpen') : noPu ? tLog('advancedSim.noPullup') : conflict ? tLog('advancedSim.addrConflict') : wrongAddr ? tLog('advancedSim.wrongAddr') : 'ACK 0x3C'
          out.scope = wave((i) => {
            if (sdaOpen) return 0.05
            if (noPu) return 0.4 + Math.random() * 0.4
            const clk = Math.sin(i / 1.6 + t / 80) > 0
            return clk ? 3.25 : 0.12
          })
          if (Math.floor(t / 1800) !== Math.floor((t - 50) / 1800)) {
            if (!code.includes('Wire.begin')) pushLog(tLog('advancedSim.wireMissing'), 'warn')
            else if (sdaOpen) pushLog(tLog('advancedSim.scanEmpty'), 'warn')
            else if (noPu) pushLog(tLog('advancedSim.scanStuck'), 'warn')
            else if (conflict) pushLog(tLog('advancedSim.busFight'), 'warn')
            else if (wrongAddr) pushLog(tLog('advancedSim.codeWrongAddr'), 'warn')
            else pushLog('Found 0x3C · SSD1306 ACK', 'ok')
          }
          break
        }
        default: {
          const scene = lesson.sceneLessonId
          const open = Boolean(fault && (fault.kind === 'open' || fault.kind === 'floating'))
          if (scene === 'wifi' || scene === 'bluetooth' || scene === 'camera') {
            out.wifi = t > 1400 && !open && codeOk
            out.led = out.wifi ? 1 : 0
            out.onboard = out.led
            out.currentMa = out.wifi ? 155 : 46
            out.scope = wave((i) => (out.wifi ? (Math.sin(i / 2 + t / 90) > 0 ? 3.2 : 0.2) : 0.4))
            out.oledText = scene === 'camera' ? (out.wifi ? 'CAM ONLINE' : 'CAM FAIL') : ''
            out.packets = out.wifi
              ? [
                  { time: 'now', proto: lesson.id.includes('mqtt') ? 'MQTT' : 'HTTP', dir: tLog('advancedSim.tx'), data: lesson.id, status: '200' },
                ]
              : []
            if (Math.floor(t / 1600) !== Math.floor((t - 50) / 1600)) {
              if (open) pushLog(tLog('advancedSim.rfOpen'), 'warn')
              else if (!codeOk) pushLog(tLog('advancedSim.missingApi'), 'warn')
              else pushLog(tLog('advancedSim.online', { title: lesson.title }), 'ok')
            }
          } else if (scene === 'sleep') {
            const asleep = codeOk && !open && Math.floor(t / 2600) % 2 === 1
            out.onboard = asleep ? 0 : 1
            out.currentMa = open ? 5 : asleep ? 0.14 : 48
            out.scope = wave(() => (asleep ? 0.05 : 3.1))
            out.busNote = asleep ? tLog('advancedSim.deepSleep') : tLog('advancedSim.runningState')
            if (Math.floor(t / 1300) !== Math.floor((t - 50) / 1300)) {
              pushLog(asleep ? tLog('advancedSim.sleepUa') : tLog('advancedSim.wakeSample'), asleep ? 'ok' : 'info')
            }
          } else if (scene === 'pot' || scene === 'gas' || scene === 'dht' || scene === 'imu') {
            const raw = open ? 200 + Math.random() * 3000 : input.pot
            const filtered = codeOk ? raw * 0.2 + 1800 * 0.8 : raw
            out.led = filtered / 4095
            out.currentMa = 50
            out.scope = wave((i) => {
              const n = codeOk ? 0.05 : 0.45
              return open ? Math.random() * 3.3 : (filtered / 4095) * 3.3 + Math.sin(i) * n
            })
            if (Math.floor(t / 700) !== Math.floor((t - 50) / 700)) {
              pushLog(open ? tLog('advancedSim.sensorOpen') : tLog(codeOk ? 'advancedSim.sampleFiltered' : 'advancedSim.sampleNoisy', { n: Math.round(filtered) }), open ? 'warn' : 'ok')
            }
          } else {
            out.onboard = Math.floor(t / 700) % 2 ? 1 : 0
            out.currentMa = open ? 38 : 44
            out.scope = wave((i) => (codeOk ? 1.65 + Math.sin(i / 5) * 0.25 : 0.7 + Math.random()))
            if (Math.floor(t / 1400) !== Math.floor((t - 50) / 1400)) {
              pushLog(codeOk ? tLog('advancedSim.taskRunning', { title: lesson.title }) : tLog('advancedSim.apiIncomplete'), codeOk ? 'ok' : 'warn')
            }
          }
        }
      }

      if (out.scope.length === 0) out.scope = wave((i) => 1.65 + Math.sin(i / 4) * 0.3)
      setOutputs(out)
    }, 80)
    return () => window.clearInterval(id)
  }, [phase, lesson, fault, codeOk, code, pushLog])

  return { phase, inputs, setInput, logs, outputs, run, stop, reset, codeOk }
}
