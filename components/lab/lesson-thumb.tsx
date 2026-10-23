'use client'

import type { ReactNode } from 'react'
import type { LessonId } from '@/lib/lessons'
import { cn } from '@/lib/utils'

/** Isometric-style component thumbnails for the lesson rail (not Lucide). */
export function LessonThumb({ id, className }: { id: LessonId; className?: string }) {
  const Icon = THUMBS[id] ?? ThumbBoard
  return (
    <span className={cn('relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#efe6d8]', className)}>
      <Icon />
    </span>
  )
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 40 40" className="size-9" aria-hidden>
      {children}
    </svg>
  )
}

function ThumbBoard() {
  return (
    <Frame>
      <rect x="6" y="10" width="28" height="20" rx="1.5" fill="#0e7c7b" stroke="#083d3c" strokeWidth="0.8" />
      <rect x="10" y="14" width="12" height="8" rx="0.8" fill="#1a1a1a" />
      <rect x="24" y="13" width="7" height="4" rx="0.4" fill="#c9a227" />
      <circle cx="27.5" cy="24" r="2.2" fill="#2d6fd6" opacity="0.9" />
      {[14, 17, 20, 23, 26].map((y) => (
        <g key={y}>
          <rect x="7.2" y={y} width="1.4" height="1.1" fill="#d4af37" />
          <rect x="31.4" y={y} width="1.4" height="1.1" fill="#d4af37" />
        </g>
      ))}
    </Frame>
  )
}

function ThumbLed() {
  return (
    <Frame>
      <ellipse cx="20" cy="28" rx="5" ry="2" fill="#8c7851" opacity="0.35" />
      <rect x="17.5" y="18" width="2" height="10" fill="#c0c4c8" />
      <rect x="20.5" y="20" width="2" height="8" fill="#c0c4c8" />
      <path d="M12 18c0-6 3.5-10 8-10s8 4 8 10c0 3-2 5-8 5s-8-2-8-5z" fill="#e11d48" stroke="#9f1239" strokeWidth="0.7" />
      <ellipse cx="17" cy="14" rx="2.2" ry="3" fill="#fff" opacity="0.35" />
    </Frame>
  )
}

function ThumbButton() {
  return (
    <Frame>
      <rect x="9" y="14" width="22" height="14" rx="2" fill="#1f2937" stroke="#111827" strokeWidth="0.8" />
      <rect x="11" y="16" width="18" height="10" rx="1.2" fill="#374151" />
      <circle cx="20" cy="21" r="4.2" fill="#ef4444" stroke="#b91c1c" strokeWidth="0.8" />
      <circle cx="20" cy="21" r="2.2" fill="#fca5a5" />
    </Frame>
  )
}

function ThumbPot() {
  return (
    <Frame>
      <rect x="11" y="22" width="18" height="8" rx="1.2" fill="#1f2937" />
      <rect x="13" y="16" width="14" height="8" rx="1" fill="#111827" />
      <circle cx="20" cy="18" r="5.5" fill="#4b5563" stroke="#1f2937" strokeWidth="0.8" />
      <circle cx="20" cy="18" r="3.2" fill="#9ca3af" />
      <rect x="19.2" y="13.5" width="1.6" height="5" rx="0.4" fill="#e5e7eb" />
      <rect x="14" y="28" width="1.5" height="4" fill="#c0c4c8" />
      <rect x="19.25" y="28" width="1.5" height="4" fill="#c0c4c8" />
      <rect x="24.5" y="28" width="1.5" height="4" fill="#c0c4c8" />
    </Frame>
  )
}

function ThumbRgb() {
  return (
    <Frame>
      <rect x="17.2" y="20" width="1.6" height="10" fill="#c0c4c8" />
      <rect x="19.6" y="18" width="1.6" height="12" fill="#c0c4c8" />
      <rect x="22" y="20" width="1.6" height="10" fill="#c0c4c8" />
      <path d="M12 18c0-5.5 3.2-9 8-9s8 3.5 8 9c0 2.8-2 4.5-8 4.5s-8-1.7-8-4.5z" fill="#e9d5ff" stroke="#7c3aed" strokeWidth="0.7" />
      <circle cx="16.5" cy="15" r="2" fill="#ef4444" opacity="0.85" />
      <circle cx="20" cy="13.5" r="2" fill="#22c55e" opacity="0.85" />
      <circle cx="23.5" cy="15" r="2" fill="#3b82f6" opacity="0.85" />
    </Frame>
  )
}

function ThumbTouch() {
  return (
    <Frame>
      <rect x="10" y="12" width="20" height="16" rx="1.5" fill="#b45309" stroke="#78350f" strokeWidth="0.8" />
      <rect x="12" y="14" width="16" height="12" rx="0.8" fill="#d97706" />
      <path d="M16 18h8M16 22h8" stroke="#fde68a" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="28" cy="10" r="3" fill="#38bdf8" opacity="0.7" />
    </Frame>
  )
}

function ThumbDht() {
  return (
    <Frame>
      <rect x="12" y="10" width="16" height="20" rx="2" fill="#1e3a5f" stroke="#0f172a" strokeWidth="0.8" />
      <rect x="14" y="12" width="12" height="8" rx="1" fill="#94a3b8" />
      <circle cx="20" cy="16" r="2.5" fill="#0ea5e9" opacity="0.5" />
      <rect x="15" y="22" width="2" height="6" fill="#c0c4c8" />
      <rect x="19" y="22" width="2" height="6" fill="#c0c4c8" />
      <rect x="23" y="22" width="2" height="6" fill="#c0c4c8" />
    </Frame>
  )
}

function ThumbBuzzer() {
  return (
    <Frame>
      <rect x="10" y="16" width="20" height="12" rx="1.5" fill="#111827" />
      <circle cx="20" cy="22" r="6" fill="#1f2937" stroke="#6b7280" strokeWidth="1" />
      <circle cx="20" cy="22" r="3.2" fill="#374151" />
      <path d="M28 14c2 2 2 6 0 8M31 12c3 3 3 9 0 12" stroke="#0e7c7b" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </Frame>
  )
}

function ThumbServo() {
  return (
    <Frame>
      <rect x="11" y="14" width="18" height="14" rx="1.5" fill="#2563eb" stroke="#1e3a8a" strokeWidth="0.8" />
      <rect x="14" y="17" width="8" height="8" rx="1" fill="#93c5fd" />
      <circle cx="26" cy="21" r="3.5" fill="#1e293b" />
      <rect x="25.2" y="12" width="1.6" height="9" rx="0.4" fill="#e2e8f0" transform="rotate(25 26 21)" />
    </Frame>
  )
}

function ThumbWifi() {
  return (
    <Frame>
      <rect x="8" y="18" width="16" height="12" rx="1.2" fill="#0e7c7b" />
      <path d="M26 28c0-8 4-12 8-14" stroke="#2d6fd6" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M28 28c0-5 2.5-8 5-9.5" stroke="#2d6fd6" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <circle cx="32.5" cy="28" r="1.6" fill="#2d6fd6" />
    </Frame>
  )
}

function ThumbOled() {
  return (
    <Frame>
      <rect x="8" y="12" width="24" height="16" rx="1.5" fill="#111827" stroke="#020617" strokeWidth="0.8" />
      <rect x="10" y="14" width="20" height="12" rx="0.8" fill="#0f172a" />
      <text x="20" y="22" textAnchor="middle" fill="#4ade80" fontSize="5" fontFamily="monospace">
        ESP
      </text>
    </Frame>
  )
}

function ThumbLdr() {
  return (
    <Frame>
      <circle cx="20" cy="18" r="7" fill="#1f2937" stroke="#111827" strokeWidth="0.8" />
      <path d="M15 15c2 6 8 6 10 0" stroke="#fbbf24" strokeWidth="1.4" fill="none" />
      <path d="M16 18c1.5 4 6 4 8 0" stroke="#f59e0b" strokeWidth="1.2" fill="none" />
      <rect x="17.5" y="25" width="2" height="7" fill="#c0c4c8" />
      <rect x="20.5" y="25" width="2" height="7" fill="#c0c4c8" />
      <path d="M20 6v3M12 9l2 2M28 9l-2 2" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
    </Frame>
  )
}

function ThumbUltrasonic() {
  return (
    <Frame>
      <rect x="8" y="14" width="24" height="14" rx="1.5" fill="#1e3a5f" />
      <circle cx="15" cy="21" r="4.2" fill="#94a3b8" stroke="#64748b" strokeWidth="0.8" />
      <circle cx="25" cy="21" r="4.2" fill="#94a3b8" stroke="#64748b" strokeWidth="0.8" />
      <circle cx="15" cy="21" r="1.8" fill="#0f172a" />
      <circle cx="25" cy="21" r="1.8" fill="#0f172a" />
    </Frame>
  )
}

function ThumbRelay() {
  return (
    <Frame>
      <rect x="9" y="12" width="22" height="16" rx="1.5" fill="#14532d" />
      <rect x="12" y="15" width="10" height="8" rx="1" fill="#86efac" opacity="0.4" />
      <circle cx="27" cy="19" r="3" fill="#fbbf24" />
      <path d="M14 28h4M20 28h4M26 28h3" stroke="#c0c4c8" strokeWidth="1.5" strokeLinecap="round" />
    </Frame>
  )
}

function ThumbMotor() {
  return (
    <Frame>
      <rect x="12" y="14" width="16" height="14" rx="2" fill="#374151" />
      <circle cx="20" cy="21" r="5" fill="#6b7280" stroke="#1f2937" strokeWidth="0.8" />
      <circle cx="20" cy="21" r="2" fill="#e5e7eb" />
      <rect x="27" y="18" width="6" height="6" rx="1" fill="#9ca3af" />
    </Frame>
  )
}

function ThumbKeypad() {
  return (
    <Frame>
      <rect x="10" y="8" width="20" height="24" rx="1.5" fill="#1f2937" />
      {[0, 1, 2, 3].flatMap((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={13 + col * 5}
            y={11 + row * 5}
            width="3.5"
            height="3.5"
            rx="0.5"
            fill={row === 3 && col === 1 ? '#0e7c7b' : '#9ca3af'}
          />
        )),
      )}
    </Frame>
  )
}

function ThumbSleep() {
  return (
    <Frame>
      <rect x="8" y="14" width="18" height="12" rx="1.2" fill="#0e7c7b" />
      <path d="M28 12c3 1 5 4 5 8s-2 7-5 8" stroke="#6366f1" strokeWidth="1.6" fill="none" />
      <text x="26" y="11" fill="#6366f1" fontSize="7" fontWeight="700">
        z
      </text>
    </Frame>
  )
}

function ThumbBluetooth() {
  return (
    <Frame>
      <rect x="8" y="16" width="16" height="12" rx="1.2" fill="#1d4ed8" />
      <path d="M26 12l8 8-8 8V12l8 8" stroke="#93c5fd" strokeWidth="1.8" fill="none" strokeLinejoin="round" />
      <path d="M26 20h8" stroke="#93c5fd" strokeWidth="1.8" />
    </Frame>
  )
}

function ThumbNeo() {
  return (
    <Frame>
      <rect x="6" y="18" width="28" height="6" rx="1" fill="#111827" />
      {[10, 16, 22, 28].map((x, i) => (
        <circle key={x} cx={x} cy="21" r="2.2" fill={['#ef4444', '#22c55e', '#3b82f6', '#eab308'][i]} />
      ))}
    </Frame>
  )
}

function ThumbIr() {
  return (
    <Frame>
      <rect x="14" y="10" width="12" height="20" rx="2" fill="#111827" />
      <circle cx="20" cy="16" r="3.5" fill="#ef4444" opacity="0.85" />
      <rect x="17" y="24" width="6" height="3" rx="0.5" fill="#374151" />
      <path d="M28 14c2 2 2 6 0 8" stroke="#f87171" strokeWidth="1.3" fill="none" />
    </Frame>
  )
}

function ThumbFan() {
  return (
    <Frame>
      <circle cx="20" cy="20" r="9" fill="#e2e8f0" stroke="#64748b" strokeWidth="0.8" />
      <path d="M20 20l0-8a4 4 0 0 1 4 4zM20 20l8 0a4 4 0 0 1-4 4zM20 20l0 8a4 4 0 0 1-4-4zM20 20l-8 0a4 4 0 0 1 4-4z" fill="#0e7c7b" />
      <circle cx="20" cy="20" r="2" fill="#1f2937" />
    </Frame>
  )
}

function ThumbRtc() {
  return (
    <Frame>
      <rect x="10" y="12" width="20" height="16" rx="1.5" fill="#334155" />
      <circle cx="20" cy="20" r="5.5" fill="#f8fafc" stroke="#0f172a" strokeWidth="0.8" />
      <path d="M20 20v-4M20 20l3 2" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round" />
    </Frame>
  )
}

function ThumbPir() {
  return (
    <Frame>
      <rect x="10" y="16" width="20" height="12" rx="1.5" fill="#1e293b" />
      <circle cx="20" cy="18" r="6" fill="#fde68a" stroke="#b45309" strokeWidth="0.8" />
      <circle cx="20" cy="18" r="3.5" fill="#fbbf24" opacity="0.5" />
      <rect x="18" y="26" width="4" height="4" fill="#64748b" />
    </Frame>
  )
}

function ThumbJoystick() {
  return (
    <Frame>
      <rect x="10" y="18" width="20" height="12" rx="2" fill="#1f2937" />
      <circle cx="20" cy="18" r="5" fill="#4b5563" stroke="#111827" strokeWidth="0.8" />
      <circle cx="20" cy="16" r="2.5" fill="#ef4444" />
      <circle cx="28" cy="26" r="1.8" fill="#22c55e" />
    </Frame>
  )
}

function ThumbSoil() {
  return (
    <Frame>
      <rect x="16" y="8" width="8" height="10" rx="1" fill="#166534" />
      <path d="M14 18h12l2 14H12z" fill="#854d0e" />
      <path d="M18 22v6M22 22v6" stroke="#fde68a" strokeWidth="1.2" />
    </Frame>
  )
}

function ThumbGas() {
  return (
    <Frame>
      <rect x="11" y="12" width="18" height="16" rx="1.5" fill="#334155" />
      <circle cx="20" cy="19" r="5" fill="#78716c" stroke="#44403c" strokeWidth="0.8" />
      <circle cx="20" cy="19" r="2.5" fill="#a8a29e" />
      <rect x="14" y="26" width="2" height="5" fill="#c0c4c8" />
      <rect x="19" y="26" width="2" height="5" fill="#c0c4c8" />
      <rect x="24" y="26" width="2" height="5" fill="#c0c4c8" />
    </Frame>
  )
}

function ThumbImu() {
  return (
    <Frame>
      <rect x="11" y="13" width="18" height="14" rx="1.5" fill="#1e3a8a" />
      <rect x="14" y="16" width="8" height="8" rx="1" fill="#93c5fd" />
      <path d="M26 16l4 4-4 4M26 20h5" stroke="#fbbf24" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </Frame>
  )
}

function ThumbGps() {
  return (
    <Frame>
      <rect x="10" y="14" width="16" height="14" rx="1.2" fill="#0f766e" />
      <path d="M28 12c4 2 6 6 6 10" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
      <circle cx="34" cy="12" r="2" fill="#38bdf8" />
      <circle cx="18" cy="21" r="3" fill="#99f6e4" opacity="0.5" />
    </Frame>
  )
}

function ThumbCamera() {
  return (
    <Frame>
      <rect x="9" y="14" width="22" height="14" rx="2" fill="#1f2937" />
      <circle cx="20" cy="21" r="5" fill="#0ea5e9" stroke="#0369a1" strokeWidth="0.8" />
      <circle cx="20" cy="21" r="2.2" fill="#0f172a" />
      <rect x="12" y="16" width="3" height="2" rx="0.4" fill="#f87171" />
    </Frame>
  )
}

function ThumbStrip() {
  return (
    <Frame>
      <rect x="6" y="16" width="28" height="8" rx="1.2" fill="#111827" />
      {[9, 14, 19, 24, 29].map((x, i) => (
        <rect key={x} x={x} y="18" width="3" height="4" rx="0.4" fill={['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'][i]} />
      ))}
    </Frame>
  )
}

const THUMBS: Record<LessonId, () => ReactNode> = {
  board: ThumbBoard,
  blink: ThumbLed,
  button: ThumbButton,
  pot: ThumbPot,
  rgb: ThumbRgb,
  touch: ThumbTouch,
  dht: ThumbDht,
  buzzer: ThumbBuzzer,
  servo: ThumbServo,
  wifi: ThumbWifi,
  oled: ThumbOled,
  ldr: ThumbLdr,
  ultrasonic: ThumbUltrasonic,
  relay: ThumbRelay,
  motor: ThumbMotor,
  keypad: ThumbKeypad,
  sleep: ThumbSleep,
  bluetooth: ThumbBluetooth,
  neopixel: ThumbNeo,
  ir: ThumbIr,
  fan: ThumbFan,
  rtc: ThumbRtc,
  pir: ThumbPir,
  joystick: ThumbJoystick,
  soil: ThumbSoil,
  gas: ThumbGas,
  imu: ThumbImu,
  gps: ThumbGps,
  camera: ThumbCamera,
  lightstrip: ThumbStrip,
}
