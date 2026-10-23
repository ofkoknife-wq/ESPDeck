'use client'

import { Lightbulb, LightbulbOff, Volume2, VolumeX, Wifi } from 'lucide-react'
import { useI18n } from '@/lib/i18n/provider'
import type { Lesson } from '@/lib/lessons'
import type { Phase, SimInputs, SimOutputs, SunMode } from '@/lib/use-simulation'
import { cn } from '@/lib/utils'

type Props = {
  lesson: Lesson
  phase: Phase
  inputs: SimInputs
  outputs: SimOutputs
  setInput: <K extends keyof SimInputs>(key: K, value: SimInputs[K] | ((prev: SimInputs[K]) => SimInputs[K])) => void
}

function HoldButton({ label, active, onChange }: { label: string; active: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onPointerDown={() => onChange(true)}
      onPointerUp={() => onChange(false)}
      onPointerLeave={() => onChange(false)}
      onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onChange(true)}
      onKeyUp={() => onChange(false)}
      aria-pressed={active}
      className={cn(
        'h-10 w-full select-none rounded-md border-2 border-foreground text-sm font-bold transition-all',
        active ? 'translate-y-0.5 bg-foreground text-background' : 'bg-card text-foreground shadow-[0_2px_0_var(--foreground)]',
      )}
    >
      {label}
    </button>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  display,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  display: string
  onChange: (v: number) => void
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="font-mono font-bold tabular-nums text-foreground">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
    </label>
  )
}

export function SimControls({ lesson, phase, inputs, outputs, setInput }: Props) {
  const { t } = useI18n()
  const running = phase === 'running'
  let body: React.ReactNode = null

  switch (lesson.id) {
    case 'button':
      body = <HoldButton label={t('sim.holdButton')} active={inputs.button} onChange={(v) => setInput('button', v)} />
      break
    case 'touch':
      body = (
        <div className="flex flex-col gap-2">
          <HoldButton label={t('sim.touch')} active={inputs.touch} onChange={(v) => setInput('touch', v)} />
          <p className="font-mono text-xs text-muted-foreground">
            touchRead = <span className="font-bold text-foreground">{running ? outputs.touchValue : '--'}</span>
          </p>
        </div>
      )
      break
    case 'pot':
      body = (
        <Slider
          label={t('sim.pot')}
          value={inputs.pot}
          min={0}
          max={4095}
          display={`${Math.round(inputs.pot)} · ${((inputs.pot * 3.3) / 4095).toFixed(2)}V`}
          onChange={(v) => setInput('pot', v)}
        />
      )
      break
    case 'soil':
      body = (
        <div className="flex flex-col gap-2">
          <HoldButton label={t('sim.holdWater')} active={inputs.water} onChange={(v) => setInput('water', v)} />
          <div className="grid grid-cols-3 gap-1">
            {(['shade', 'window', 'sun'] as SunMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setInput('sun', mode)}
                className={cn(
                  'rounded-md border px-1 py-1.5 text-[10px] font-bold',
                  inputs.sun === mode ? 'border-foreground bg-foreground text-background' : 'border-border bg-card',
                )}
              >
                {t(`sim.soil.${mode === 'sun' ? 'fullSun' : mode}`)}
              </button>
            ))}
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {running ? (
              <>
                ADC {outputs.soilRaw} → <span className="font-bold text-foreground">{outputs.soilMoisture}%</span>
                {outputs.soilMessage ? ` · ${outputs.soilMessage}` : ''}
              </>
            ) : (
              t('sim.wifiRunFirst')
            )}
          </p>
        </div>
      )
      break
    case 'dht':
      body = (
        <Slider
          label={t('sim.temp')}
          value={inputs.temp}
          min={10}
          max={40}
          step={0.5}
          display={`${inputs.temp.toFixed(1)} °C`}
          onChange={(v) => setInput('temp', v)}
        />
      )
      break
    case 'buzzer':
      body = (
        <button
          onClick={() => setInput('sound', !inputs.sound)}
          aria-pressed={inputs.sound}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md border bg-background text-sm font-bold"
        >
          {inputs.sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          {inputs.sound ? t('sim.soundOn') : t('sim.soundOff')}
        </button>
      )
      break
    case 'wifi':
      body = (
        <div className="flex flex-col gap-2 rounded-lg border-2 border-foreground bg-background p-3">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-bold">192.168.1.42</span>
            <Wifi className={cn('size-3.5', outputs.wifi ? 'text-accent' : 'text-muted-foreground')} aria-hidden="true" />
          </div>
          <p className="text-xs text-muted-foreground">
            {outputs.wifi ? t('sim.wifiConnected') : running || phase === 'uploading' ? t('sim.wifiWaiting') : t('sim.wifiRunFirst')}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              disabled={!outputs.wifi}
              onClick={() => setInput('webLed', true)}
              className="flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary text-sm font-bold text-primary-foreground disabled:opacity-40"
            >
              <Lightbulb className="size-4" aria-hidden="true" />
              /on
            </button>
            <button
              disabled={!outputs.wifi}
              onClick={() => setInput('webLed', false)}
              className="flex h-9 items-center justify-center gap-1.5 rounded-md border bg-card text-sm font-bold text-foreground disabled:opacity-40"
            >
              <LightbulbOff className="size-4" aria-hidden="true" />
              /off
            </button>
          </div>
        </div>
      )
      break
  }

  return (
    <div className="pointer-events-auto flex w-56 flex-col gap-3 rounded-xl border bg-card/95 p-3 shadow-sm backdrop-blur-sm">
      <div className="flex items-start gap-2">
        <span
          className={cn(
            'mt-1.5 size-2 shrink-0 rounded-full',
            running ? 'animate-pulse bg-accent' : phase === 'uploading' ? 'bg-primary' : 'bg-muted-foreground/40',
          )}
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-bold leading-snug text-foreground">
            {running ? t('sim.running') : phase === 'uploading' ? t('sim.uploading') : t('sim.ready')}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">{lesson.hint}</p>
        </div>
      </div>
      {body}
    </div>
  )
}
