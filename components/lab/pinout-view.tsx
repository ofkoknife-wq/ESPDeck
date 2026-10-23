'use client'

import { LEFT_PINS, RIGHT_PINS } from '@/lib/geometry'
import { useI18n } from '@/lib/i18n/provider'
import { cn } from '@/lib/utils'

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
      <rect width={W} height={H} fill="#f4eee6" />
      <rect width={W} height={H} fill="url(#pin-grid)" />

      <rect x={BOARD_X} y={BOARD_Y} width={BOARD_W} height={BOARD_H} rx="10" fill="#0e7c7b" stroke="#083d3c" strokeWidth="2" />
      <rect x={BOARD_X + 48} y={BOARD_Y + 70} width={124} height={72} rx="6" fill="#111827" />
      <text x={BOARD_X + BOARD_W / 2} y={BOARD_Y + 112} textAnchor="middle" fill="#eaddcf" fontSize="14" fontWeight="700">
        ESP32
      </text>
      <rect x={BOARD_X + 70} y={BOARD_Y + BOARD_H - 36} width={80} height={18} rx="3" fill="#c9a227" />
      <text x={BOARD_X + BOARD_W / 2} y={BOARD_Y + 28} textAnchor="middle" fill="#fffffe" fontSize="12" fontWeight="700">
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
              className={cn(on ? 'fill-accent' : 'fill-[#1f2937]')}
              stroke={on ? '#083d3c' : '#111827'}
              strokeWidth={on ? 1.5 : 0.5}
            />
            <text
              x={BOARD_X - 28}
              y={y + 11.5}
              textAnchor="middle"
              fontSize="10"
              fontWeight={on ? 700 : 500}
              fill={on ? '#fffffe' : '#eaddcf'}
            >
              {label}
            </text>
            {on && (
              <text x={BOARD_X - 66} y={y + 11.5} textAnchor="end" fontSize="10" fill="#0e7c7b" fontWeight="700">
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
              className={cn(on ? 'fill-accent' : 'fill-[#1f2937]')}
              stroke={on ? '#083d3c' : '#111827'}
              strokeWidth={on ? 1.5 : 0.5}
            />
            <text
              x={BOARD_X + BOARD_W + 28}
              y={y + 11.5}
              textAnchor="middle"
              fontSize="10"
              fontWeight={on ? 700 : 500}
              fill={on ? '#fffffe' : '#eaddcf'}
            >
              {label}
            </text>
            {on && (
              <text x={BOARD_X + BOARD_W + 66} y={y + 11.5} textAnchor="start" fontSize="10" fill="#0e7c7b" fontWeight="700">
                ●
              </text>
            )}
          </g>
        )
      })}

      <g transform="translate(40 48)">
        <rect width="160" height="72" rx="10" fill="#fffffe" stroke="#e1e5eb" />
        <text x="14" y="24" fontSize="12" fontWeight="700" fill="#020826">
          {t('stage.pinoutLegend')}
        </text>
        <circle cx="22" cy="46" r="5" className="fill-accent" />
        <text x="36" y="50" fontSize="11" fill="#716040">
          {t('stage.pinoutActive')}
        </text>
      </g>
    </svg>
  )
}
