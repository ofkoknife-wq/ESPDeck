'use client'

import { LEFT_PINS, RIGHT_PINS } from '@/lib/geometry'
import { useI18n } from '@/lib/i18n/provider'
const W = 720
const H = 420
const BOARD_X = 250
const BOARD_Y = 36
const BOARD_W = 220
const BOARD_H = 348
const PIN_H = 16
const PIN_GAP = 1.2

function pinY(index: number) {
  return BOARD_Y + 18 + index * (PIN_H + PIN_GAP)
}

export function PinoutView({
  activePins,
  viewBox = `0 0 ${W} ${H}`,
}: {
  activePins: string[]
  viewBox?: string
}) {
  const { t } = useI18n()
  const active = new Set(activePins.map((p) => p.toUpperCase()))
  const isActive = (label: string) => active.has(label.toUpperCase())

  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" className="h-full w-full" role="img" aria-label={t('stage.pinoutAria')}>
      <defs>
        <pattern id="pin-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#d8cbb8" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="var(--stage-floor)" />
      <rect width={W} height={H} fill="url(#pin-grid)" />

      <rect x={BOARD_X} y={BOARD_Y} width={BOARD_W} height={BOARD_H} rx="12" fill="var(--primary)" stroke="color-mix(in oklab, var(--primary) 70%, black)" strokeWidth="2" />
      <rect x={BOARD_X + 48} y={BOARD_Y + 70} width={124} height={72} rx="8" fill="var(--foreground)" />
      <text x={BOARD_X + BOARD_W / 2} y={BOARD_Y + 112} textAnchor="middle" fill="var(--secondary)" fontSize="14" fontWeight="700">
        ESP32
      </text>
      <rect x={BOARD_X + 70} y={BOARD_Y + BOARD_H - 36} width={80} height={18} rx="4" fill="var(--accent)" />
      <text x={BOARD_X + BOARD_W / 2} y={BOARD_Y + 28} textAnchor="middle" fill="var(--primary-foreground)" fontSize="12" fontWeight="700">
        DevKitC
      </text>

      {LEFT_PINS.map((label, i) => {
        const y = pinY(i)
        const on = isActive(label)
        return (
          <g key={`L-${label}-${i}`}>
            <rect
              x={BOARD_X - 56}
              y={y}
              width={56}
              height={PIN_H}
              rx="3"
              fill={on ? 'var(--accent)' : 'var(--foreground)'}
              stroke={on ? 'color-mix(in oklab, var(--accent) 70%, black)' : 'transparent'}
              strokeWidth={on ? 1.5 : 0}
            />
            <text
              x={BOARD_X - 28}
              y={y + 11.5}
              textAnchor="middle"
              fontSize="10"
              fontWeight={on ? 700 : 500}
              fill={on ? 'var(--accent-foreground)' : 'var(--secondary)'}
            >
              {label}
            </text>
            {on && (
              <text x={BOARD_X - 66} y={y + 11.5} textAnchor="end" fontSize="10" fill="var(--primary)" fontWeight="700">
                ●
              </text>
            )}
          </g>
        )
      })}

      {RIGHT_PINS.map((label, i) => {
        const y = pinY(i)
        const on = isActive(label)
        return (
          <g key={`R-${label}-${i}`}>
            <rect
              x={BOARD_X + BOARD_W}
              y={y}
              width={56}
              height={PIN_H}
              rx="3"
              fill={on ? 'var(--accent)' : 'var(--foreground)'}
              stroke={on ? 'color-mix(in oklab, var(--accent) 70%, black)' : 'transparent'}
              strokeWidth={on ? 1.5 : 0}
            />
            <text
              x={BOARD_X + BOARD_W + 28}
              y={y + 11.5}
              textAnchor="middle"
              fontSize="10"
              fontWeight={on ? 700 : 500}
              fill={on ? 'var(--accent-foreground)' : 'var(--secondary)'}
            >
              {label}
            </text>
            {on && (
              <text x={BOARD_X + BOARD_W + 66} y={y + 11.5} textAnchor="start" fontSize="10" fill="var(--primary)" fontWeight="700">
                ●
              </text>
            )}
          </g>
        )
      })}

      <g transform="translate(40 48)">
        <rect width="160" height="72" rx="12" fill="var(--card)" stroke="var(--border)" />
        <text x="14" y="24" fontSize="12" fontWeight="700" fill="var(--foreground)">
          {t('stage.pinoutLegend')}
        </text>
        <circle cx="22" cy="46" r="5" className="fill-accent" />
        <text x="36" y="50" fontSize="11" fill="var(--muted-foreground)">
          {t('stage.pinoutActive')}
        </text>
      </g>
    </svg>
  )
}
