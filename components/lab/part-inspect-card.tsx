'use client'

import { Search, X } from 'lucide-react'
import type { RefObject } from 'react'
import { useI18n } from '@/lib/i18n/provider'
import type { SimInputs, SimOutputs } from '@/lib/use-simulation'
import { cn } from '@/lib/utils'
import type { ScenePart } from './scene-parts'
import type { PartControl } from './three/parts'
import type { ViewApi } from './three/scene'

/** Leader length — keep the card clear of the focused mesh (reference-style). */
const DX = 150
const DY = -110

type Props = {
  part: ScenePart | null
  viewRef: RefObject<ViewApi | null>
  elRef: RefObject<HTMLDivElement | null>
  onClose: () => void
  inputs?: SimInputs
  outputs?: SimOutputs
  setInput?: <K extends keyof SimInputs>(key: K, value: SimInputs[K] | ((prev: SimInputs[K]) => SimInputs[K])) => void
}

function formatSlider(control: Extract<PartControl, { kind: 'slider' }>, value: number): string {
  const unit = control.unit ?? ''
  switch (control.display) {
    case 'voltage':
      return `${Math.round(value)} · ${((value * 3.3) / 4095).toFixed(2)}V`
    case 'percent':
      return `${Math.round(value)}${unit || '%'}`
    case 'temp':
      return `${value.toFixed(1)} °C`
    default:
      return `${Math.round(value)}${unit}`
  }
}

function ControlRow({
  control,
  inputs,
  outputs,
  setInput,
}: {
  control: PartControl
  inputs: SimInputs
  outputs: SimOutputs
  setInput: NonNullable<Props['setInput']>
}) {
  const { t } = useI18n()

  if (control.kind === 'slider') {
    const value = inputs[control.inputKey] as number
    return (
      <label className="flex flex-col gap-1.5">
        <span className="flex items-center justify-between text-[11px]">
          <span className="font-medium text-muted-foreground">{t(control.labelKey)}</span>
          <span className="font-mono font-bold tabular-nums text-foreground">{formatSlider(control, value)}</span>
        </span>
        <input
          type="range"
          min={control.min}
          max={control.max}
          step={control.step ?? 1}
          value={value}
          onChange={(e) => setInput(control.inputKey, Number(e.target.value) as SimInputs[typeof control.inputKey])}
          className="w-full accent-accent"
        />
      </label>
    )
  }

  if (control.kind === 'hold') {
    const active = Boolean(inputs[control.inputKey])
    return (
      <button
        type="button"
        onPointerDown={() => setInput(control.inputKey, true)}
        onPointerUp={() => setInput(control.inputKey, false)}
        onPointerLeave={() => setInput(control.inputKey, false)}
        aria-pressed={active}
        className={cn(
          'h-9 w-full select-none rounded-xl border-2 border-foreground text-xs font-bold transition-all',
          active ? 'translate-y-0.5 bg-foreground text-background' : 'bg-card text-foreground shadow-[0_2px_0_var(--foreground)]',
        )}
      >
        {t(control.labelKey)}
      </button>
    )
  }

  if (control.kind === 'choice') {
    const current = inputs[control.inputKey]
    return (
      <fieldset className="flex flex-col gap-1.5">
        <legend className="text-[11px] font-medium text-muted-foreground">{t(control.labelKey)}</legend>
        <div className="grid grid-cols-3 gap-1">
          {control.options.map((opt) => {
            const on = current === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setInput(control.inputKey, opt.value)}
                className={cn(
                  'rounded-lg border px-1.5 py-1.5 text-[10px] font-bold leading-tight transition',
                  on ? 'border-foreground bg-foreground text-background' : 'border-border bg-card text-foreground hover:bg-muted',
                )}
                title={opt.noteKey ? t(opt.noteKey) : undefined}
              >
                {t(opt.labelKey)}
              </button>
            )
          })}
        </div>
        {control.options.find((o) => o.value === current)?.noteKey ? (
          <p className="text-[10px] leading-snug text-muted-foreground">
            {t(control.options.find((o) => o.value === current)!.noteKey!)}
          </p>
        ) : null}
      </fieldset>
    )
  }

  if (control.kind === 'readout') {
    let value = '—'
    if (control.readout === 'oled') value = outputs.oledText || t('stage.oledIdle')
    else if (control.readout === 'moisture') value = outputs.soilMoisture ? `${outputs.soilMoisture}%` : '—'
    else if (control.readout === 'soilRaw') value = outputs.soilRaw ? String(outputs.soilRaw) : '—'
    else if (control.readout === 'touch') value = String(outputs.touchValue)
    return (
      <p className="rounded-xl border border-border bg-muted/40 px-3 py-2 font-mono text-xs font-bold tabular-nums text-foreground">
        {value}
      </p>
    )
  }

  return null
}

function InspectControls({
  controls,
  inputs,
  outputs,
  setInput,
}: {
  controls: PartControl[]
  inputs: SimInputs
  outputs: SimOutputs
  setInput: NonNullable<Props['setInput']>
}) {
  return (
    <div className="mt-3 flex flex-col gap-3">
      {controls.map((control, i) => (
        <ControlRow key={i} control={control} inputs={inputs} outputs={outputs} setInput={setInput} />
      ))}
    </div>
  )
}

/** Screen-space card projected onto the focused component (position written each frame). */
export function PartInspectCard({ part, viewRef, elRef, onClose, inputs, outputs, setInput }: Props) {
  const { t } = useI18n()
  const controls = part?.controls?.length ? part.controls : part?.control ? [part.control] : []
  const showControl = controls.length > 0 && inputs && outputs && setInput

  return (
    <div
      ref={elRef}
      className="pointer-events-none absolute left-0 top-0 z-30 opacity-0 transition-opacity duration-200"
      aria-hidden={!part}
    >
      <span className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent shadow-[0_0_0_6px_rgb(26_163_161/28%)]" />
      <span className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-accent/50" />
      {part && (
        <>
          <svg className="absolute overflow-visible" width="1" height="1" aria-hidden>
            <line
              x1="0"
              y1="0"
              x2={DX}
              y2={DY}
              stroke="var(--foreground)"
              strokeOpacity="0.55"
              strokeWidth="1.25"
              strokeDasharray="4 4"
            />
          </svg>
          <div
            className="pointer-events-auto absolute w-[min(16.5rem,calc(100vw-6rem))] -translate-y-1/2 rounded-2xl border border-border bg-[color:var(--glass)] p-3 shadow-[var(--elevated-shadow)] backdrop-blur-xl"
            style={{ left: DX, top: DY }}
          >
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-extrabold leading-tight tracking-tight text-foreground">{part.title}</h3>
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{part.body}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
                aria-label={t('stage.closeInspect')}
              >
                <X className="size-3.5" />
              </button>
            </div>
            {showControl && <InspectControls controls={controls} inputs={inputs!} outputs={outputs!} setInput={setInput!} />}
            <button
              type="button"
              onClick={() => viewRef.current?.focusAt(part.at, { inspect: true })}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-foreground px-3 py-2 text-xs font-bold text-background transition hover:opacity-90"
            >
              <Search className="size-3.5" aria-hidden />
              {t('stage.inspect')}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
