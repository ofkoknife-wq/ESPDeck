'use client'

import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { BB_TOP, PIN_TOP, type Vec3, mid } from '@/lib/geometry'
import { useI18n } from '@/lib/i18n/provider'
import { Rod, setInteractiveHover } from './primitives'

/** Transparent hit volume (must stay raycastable — visible:false skips picking in three.js). */
function HitBox({
  args = [1.2, 1.4, 1.2],
  position = [0, 0.55, 0],
}: {
  args?: [number, number, number]
  position?: Vec3
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

function usePickHandlers(onPick?: () => void, onHold?: (down: boolean) => void) {
  return {
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      setInteractiveHover(true)
    },
    onPointerOut: () => {
      setInteractiveHover(false)
      onHold?.(false)
    },
    onPointerDown: (e: { stopPropagation: () => void }) => {
      e.stopPropagation()
      setInteractiveHover(true)
      onPick?.()
      if (onHold) onHold(true)
    },
    onPointerUp: () => {
      if (onHold) onHold(false)
    },
  }
}

type EndKind = 'pin' | 'hole' | 'free'

export function Wire({
  from,
  to,
  color,
  fromKind = 'pin',
  toKind = 'hole',
  lift,
}: {
  from: Vec3
  to: Vec3
  color: string
  fromKind?: EndKind
  toKind?: EndKind
  lift?: number
}) {
  const key = `${from.join()}|${to.join()}|${fromKind}|${toKind}|${lift}`
  const geometry = useMemo(() => {
    const endY = (p: Vec3, kind: EndKind) =>
      kind === 'pin' ? PIN_TOP + 0.13 : kind === 'hole' ? BB_TOP + 0.24 : p[1]
    const a = new THREE.Vector3(from[0], endY(from, fromKind), from[2])
    const b = new THREE.Vector3(to[0], endY(to, toKind), to[2])
    const dist = a.distanceTo(b)
    const h = lift ?? 0.5 + dist * 0.1
    const rise = Math.min(0.35, h * 0.6)
    const m = a.clone().add(b).multiplyScalar(0.5)
    m.y = Math.max(a.y, b.y) + h
    const curve = new THREE.CatmullRomCurve3(
      [a, a.clone().add(new THREE.Vector3(0, rise, 0)), m, b.clone().add(new THREE.Vector3(0, rise, 0)), b],
      false,
      'centripetal',
    )
    return new THREE.TubeGeometry(curve, 72, 0.042, 8, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return (
    <group>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={color} roughness={0.45} />
      </mesh>
      <WireEnd at={from} kind={fromKind} />
      <WireEnd at={to} kind={toKind} />
    </group>
  )
}

function WireEnd({ at, kind }: { at: Vec3; kind: EndKind }) {
  if (kind === 'pin') {
    return (
      <mesh position={[at[0], PIN_TOP - 0.04, at[2]]}>
        <boxGeometry args={[0.2, 0.34, 0.2]} />
        <meshStandardMaterial color="#1b1d20" roughness={0.6} />
      </mesh>
    )
  }
  if (kind === 'hole') {
    return (
      <group position={[at[0], BB_TOP, at[2]]}>
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 0.22, 10]} />
          <meshStandardMaterial color="#1b1d20" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.06, 6]} />
          <meshStandardMaterial color="#d8dbe0" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
    )
  }
  return (
    <mesh position={at}>
      <boxGeometry args={[0.16, 0.08, 0.24]} />
      <meshStandardMaterial color="#c9ccd1" metalness={0.85} roughness={0.3} />
    </mesh>
  )
}

function Glow({ color, intensity, radius = 0.36 }: { color: string; intensity: number; radius?: number }) {
  if (intensity <= 0.01) return null
  return (
    <>
      <mesh>
        <sphereGeometry args={[radius, 20, 14]} />
        <meshBasicMaterial color={color} transparent opacity={0.3 * intensity} depthWrite={false} />
      </mesh>
      <pointLight color={color} intensity={2.4 * intensity} distance={2.6} decay={1.6} />
    </>
  )
}

const LEG_H = 0.5

export function Led({
  anode,
  cathode,
  color = '#ff3b2f',
  brightness = 0,
  onPick,
}: {
  anode: Vec3
  cathode: Vec3
  color?: string
  brightness?: number
  onPick?: () => void
}) {
  const c = mid(anode, cathode)
  const baseY = BB_TOP + LEG_H
  const on = brightness > 0.01
  const pick = usePickHandlers(onPick)
  return (
    <group {...pick}>
      <HitBox args={[0.55, 0.9, 0.55]} position={[c[0], baseY + 0.25, c[2]]} />
      <Rod from={anode} to={[c[0] - 0.05, baseY, c[2]]} />
      <Rod from={cathode} to={[c[0] + 0.05, baseY, c[2]]} />
      <group position={[c[0], baseY, c[2]]}>
        <mesh position={[0, 0.025, 0]}>
          <cylinderGeometry args={[0.165, 0.165, 0.05, 24]} />
          <LensMaterial color={color} brightness={brightness} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.3, 24]} />
          <LensMaterial color={color} brightness={brightness} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.14, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <LensMaterial color={color} brightness={brightness} />
        </mesh>
        <group position={[0, 0.25, 0]}>{on && <Glow color={color} intensity={brightness} />}</group>
      </group>
    </group>
  )
}

function LensMaterial({ color, brightness }: { color: string; brightness: number }) {
  const on = brightness > 0.01
  return (
    <meshPhysicalMaterial
      color={color}
      transparent
      opacity={0.88}
      roughness={0.25}
      clearcoat={1}
      emissive={color}
      emissiveIntensity={on ? 0.4 + brightness * 2.4 : 0.05}
      toneMapped={!on}
    />
  )
}

const BANDS_220 = ['#c8312a', '#c8312a', '#6b3f1f', '#c9a227']

export function Resistor({
  a,
  b,
  bands = BANDS_220,
  onPick,
}: {
  a: Vec3
  b: Vec3
  bands?: string[]
  onPick?: () => void
}) {
  const c = mid(a, b)
  const dx = b[0] - a[0]
  const dz = b[2] - a[2]
  const len = Math.hypot(dx, dz)
  const angle = -Math.atan2(dz, dx)
  const h = 0.2
  const pick = usePickHandlers(onPick)
  return (
    <group position={[c[0], BB_TOP, c[2]]} rotation={[0, angle, 0]} {...pick}>
      <HitBox args={[Math.max(0.8, len + 0.2), 0.6, 0.4]} position={[0, h, 0]} />
      <Rod from={[-len / 2, 0, 0]} to={[-len / 2, h, 0]} />
      <Rod from={[len / 2, 0, 0]} to={[len / 2, h, 0]} />
      <Rod from={[-len / 2, h, 0]} to={[len / 2, h, 0]} />
      <group position={[0, h, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <capsuleGeometry args={[0.075, 0.3, 6, 16]} />
          <meshStandardMaterial color="#d9c49a" roughness={0.6} />
        </mesh>
        {bands.map((color, i) => (
          <mesh key={i} position={[0, i < 3 ? -0.12 + i * 0.065 : 0.13, 0]}>
            <cylinderGeometry args={[0.079, 0.079, 0.035, 16]} />
            <meshStandardMaterial color={color} roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function PushButton({
  center,
  pressed,
  onPress,
  onPick,
}: {
  center: Vec3
  pressed: boolean
  onPress: (down: boolean) => void
  onPick?: () => void
}) {
  const bodyY = BB_TOP + 0.06
  const pick = usePickHandlers(onPick, onPress)
  return (
    <group position={[center[0], 0, center[2]]} {...pick}>
      <HitBox args={[0.9, 0.9, 0.9]} position={[0, bodyY + 0.35, 0]} />
      {[
        [-0.254, -0.25],
        [0.254, -0.25],
        [-0.254, 0.25],
        [0.254, 0.25],
      ].map(([x, z]) => (
        <Rod key={`${x}${z}`} from={[x, BB_TOP, z]} to={[x, bodyY, z]} radius={0.025} />
      ))}
      <mesh position={[0, bodyY + 0.11, 0]}>
        <boxGeometry args={[0.62, 0.22, 0.62]} />
        <meshStandardMaterial color="#202226" roughness={0.6} />
      </mesh>
      <mesh position={[0, bodyY + 0.23, 0]}>
        <boxGeometry args={[0.64, 0.02, 0.64]} />
        <meshStandardMaterial color="#c4c8cc" metalness={0.85} roughness={0.3} />
      </mesh>
      <mesh position={[0, bodyY + (pressed ? 0.27 : 0.33), 0]}>
        <cylinderGeometry args={[0.17, 0.18, 0.16, 24]} />
        <meshStandardMaterial color="#d63a2c" roughness={0.45} />
      </mesh>
    </group>
  )
}

export function Potentiometer({
  legs,
  value,
  onPick,
  onChange,
}: {
  legs: [Vec3, Vec3, Vec3]
  value: number
  onPick?: () => void
  onChange?: (v: number) => void
}) {
  const c = legs[1]
  const bodyY = BB_TOP + 0.12
  const rot = ((135 - (value / 4095) * 270) * Math.PI) / 180
  const drag = useRef<{ x: number; start: number } | null>(null)
  return (
    <group
      onPointerOver={() => setInteractiveHover(true)}
      onPointerOut={() => setInteractiveHover(false)}
      onPointerDown={(e) => {
        e.stopPropagation()
        setInteractiveHover(true)
        onPick?.()
        if (!onChange) return
        drag.current = { x: e.clientX, start: value }
        ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
      }}
      onPointerMove={(e) => {
        if (!drag.current || !onChange) return
        const delta = (e.clientX - drag.current.x) * 12
        onChange(Math.max(0, Math.min(4095, drag.current.start + delta)))
      }}
      onPointerUp={(e) => {
        drag.current = null
        setInteractiveHover(false)
        try {
          ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
        } catch {
          /* ignore */
        }
      }}
    >
      <HitBox args={[1.2, 1.2, 1.1]} position={[c[0], bodyY + 0.45, c[2] - 0.12]} />
      {legs.map((p, i) => (
        <Rod key={i} from={p} to={[p[0], bodyY, p[2]]} radius={0.03} />
      ))}
      <group position={[c[0], bodyY, c[2] - 0.12]}>
        <mesh position={[0, 0.17, 0]}>
          <boxGeometry args={[0.95, 0.34, 0.85]} />
          <meshStandardMaterial color="#2d5fc4" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.12, 16]} />
          <meshStandardMaterial color="#c4c8cc" metalness={0.85} roughness={0.3} />
        </mesh>
        <group position={[0, 0.6, 0]} rotation={[0, rot, 0]}>
          <mesh>
            <cylinderGeometry args={[0.32, 0.34, 0.3, 28]} />
            <meshStandardMaterial color="#25282c" roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.152, -0.15]}>
            <boxGeometry args={[0.05, 0.01, 0.24]} />
            <meshStandardMaterial color="#f6f7f3" />
          </mesh>
        </group>
      </group>
    </group>
  )
}

export function RgbLed({
  legs,
  rgb,
  onPick,
}: {
  legs: [Vec3, Vec3, Vec3, Vec3]
  rgb: [number, number, number]
  onPick?: () => void
}) {
  const c = mid(legs[1], legs[2])
  const baseY = BB_TOP + LEG_H + 0.05
  const max = Math.max(...rgb)
  const color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
  const on = max > 4
  const level = max / 255
  const pick = usePickHandlers(onPick)
  return (
    <group {...pick}>
      <HitBox args={[0.7, 1.0, 0.7]} position={[c[0], baseY + 0.25, c[2]]} />
      {legs.map((p, i) => {
        const tx = c[0] + (i - 1.5) * 0.06
        return (
          <group key={i}>
            <Rod from={p} to={[p[0], BB_TOP + 0.22, p[2]]} />
            <Rod from={[p[0], BB_TOP + 0.22, p[2]]} to={[tx, baseY, c[2]]} />
          </group>
        )
      })}
      <group position={[c[0], baseY, c[2]]}>
        <mesh position={[0, 0.025, 0]}>
          <cylinderGeometry args={[0.175, 0.175, 0.05, 24]} />
          <meshPhysicalMaterial color="#eef0ee" transparent opacity={0.9} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.34, 24]} />
          <meshPhysicalMaterial
            color={on ? color : '#eef0ee'}
            transparent
            opacity={0.92}
            roughness={0.5}
            emissive={on ? color : '#000000'}
            emissiveIntensity={on ? 0.5 + level * 1.8 : 0}
            toneMapped={!on}
          />
        </mesh>
        <mesh position={[0, 0.39, 0]}>
          <sphereGeometry args={[0.15, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color={on ? color : '#eef0ee'}
            transparent
            opacity={0.92}
            roughness={0.5}
            emissive={on ? color : '#000000'}
            emissiveIntensity={on ? 0.5 + level * 1.8 : 0}
            toneMapped={!on}
          />
        </mesh>
        <group position={[0, 0.28, 0]}>{on && <Glow color={color} intensity={level} radius={0.4} />}</group>
      </group>
    </group>
  )
}

export function Buzzer({
  a,
  b,
  active,
  onPick,
}: {
  a: Vec3
  b: Vec3
  active: boolean
  onPick?: () => void
}) {
  const c = mid(a, b)
  const ref = useRef<THREE.Group>(null)
  const pick = usePickHandlers(onPick)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const s = active ? 1 + Math.sin(clock.elapsedTime * 90) * 0.012 : 1
    ref.current.scale.set(s, 1, s)
  })
  return (
    <group {...pick}>
      <HitBox args={[1.1, 0.9, 1.1]} position={[c[0], BB_TOP + 0.35, c[2]]} />
      <Rod from={a} to={[a[0], BB_TOP + 0.1, a[2]]} radius={0.025} />
      <Rod from={b} to={[b[0], BB_TOP + 0.1, b[2]]} radius={0.025} />
      <group ref={ref} position={[c[0], BB_TOP + 0.1, c[2]]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.45, 0.45, 0.4, 36]} />
          <meshStandardMaterial color="#1e2023" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.401, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.01, 16]} />
          <meshStandardMaterial color="#060607" />
        </mesh>
      </group>
      <Waves position={[c[0], BB_TOP + 0.55, c[2]]} active={active} color="#0e7c7b" />
    </group>
  )
}

export function Dht11({ legs, onPick }: { legs: [Vec3, Vec3, Vec3]; onPick?: () => void }) {
  const c = legs[1]
  const bodyY = BB_TOP + 0.2
  const pick = usePickHandlers(onPick)
  return (
    <group {...pick}>
      <HitBox args={[1.0, 1.3, 0.6]} position={[c[0], bodyY + 0.45, c[2]]} />
      {legs.map((p, i) => (
        <Rod key={i} from={p} to={[p[0], bodyY, p[2]]} radius={0.025} />
      ))}
      <group position={[c[0], bodyY + 0.45, c[2]]}>
        <mesh>
          <boxGeometry args={[0.8, 0.9, 0.32]} />
          <meshStandardMaterial color="#5aa6e0" roughness={0.55} />
        </mesh>
        {Array.from({ length: 4 }).map((_, col) =>
          Array.from({ length: 5 }).map((__, row) => (
            <mesh key={`${col}-${row}`} position={[-0.24 + col * 0.16, 0.28 - row * 0.13, 0.162]}>
              <boxGeometry args={[0.1, 0.08, 0.01]} />
              <meshStandardMaterial color="#1f3c58" />
            </mesh>
          )),
        )}
      </group>
    </group>
  )
}

export function Servo({
  position,
  angle,
  onPick,
}: {
  position: Vec3
  angle: number
  onPick?: () => void
}) {
  const hornRot = ((angle - 90) * Math.PI) / 180
  const smooth = useRef<THREE.Group>(null)
  const pick = usePickHandlers(onPick)
  useFrame(() => {
    if (smooth.current) smooth.current.rotation.y += (hornRot - smooth.current.rotation.y) * 0.35
  })
  return (
    <group position={position} {...pick}>
      <HitBox args={[3.4, 3.2, 1.6]} position={[0, 1.4, 0]} />
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[2.3, 2.2, 1.22]} />
        <meshPhysicalMaterial color="#2d5fc4" roughness={0.35} transparent opacity={0.94} clearcoat={0.6} />
      </mesh>
      <mesh position={[0, 1.65, 0]}>
        <boxGeometry args={[3.2, 0.12, 1.22]} />
        <meshPhysicalMaterial color="#2d5fc4" roughness={0.35} transparent opacity={0.94} />
      </mesh>
      {[-1.4, 1.4].map((x) => (
        <mesh key={x} position={[x, 1.66, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.13, 12]} />
          <meshStandardMaterial color="#14161a" />
        </mesh>
      ))}
      <mesh position={[0.35, 2.35, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.3, 28]} />
        <meshPhysicalMaterial color="#2d5fc4" roughness={0.35} />
      </mesh>
      <group position={[0.6, 2.55, 0]} ref={smooth}>
        <mesh>
          <cylinderGeometry args={[0.22, 0.22, 0.16, 20]} />
          <meshStandardMaterial color="#f3f3ef" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.03, -0.7]}>
          <boxGeometry args={[0.22, 0.1, 1.4]} />
          <meshStandardMaterial color="#f3f3ef" roughness={0.5} />
        </mesh>
        {[0.35, 0.6, 0.85, 1.1].map((z) => (
          <mesh key={z} position={[0, 0.085, -z]}>
            <cylinderGeometry args={[0.035, 0.035, 0.01, 10]} />
            <meshStandardMaterial color="#9aa0a6" />
          </mesh>
        ))}
      </group>
      <mesh position={[-1.2, 0.45, 0]}>
        <boxGeometry args={[0.15, 0.16, 0.36]} />
        <meshStandardMaterial color="#1b1d20" />
      </mesh>
    </group>
  )
}

export function TouchPad({
  position,
  touched,
  onTouch,
  onPick,
}: {
  position: Vec3
  touched: boolean
  onTouch: (down: boolean) => void
  onPick?: () => void
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[1.4, 0.04, 1.4]} />
        <meshStandardMaterial color="#f3f2ec" roughness={0.9} />
      </mesh>
      <mesh
        position={[0, 0.06, 0]}
        onPointerDown={(e) => {
          e.stopPropagation()
          setInteractiveHover(true)
          onPick?.()
          onTouch(true)
        }}
        onPointerUp={() => onTouch(false)}
        onPointerOut={() => {
          setInteractiveHover(false)
          onTouch(false)
        }}
        onPointerOver={() => setInteractiveHover(true)}
      >
        <boxGeometry args={[1.1, 0.04, 1.1]} />
        <meshStandardMaterial
          color="#c47a3a"
          metalness={0.8}
          roughness={0.32}
          emissive="#0e7c7b"
          emissiveIntensity={touched ? 0.6 : 0}
        />
      </mesh>
      <Waves position={[0, 0.1, 0]} active={touched} color="#0e7c7b" />
    </group>
  )
}

export function OledDisplay({
  position,
  text,
  onPick,
}: {
  position: Vec3
  text: string
  onPick?: () => void
}) {
  const { t } = useI18n()
  const pick = usePickHandlers(onPick)
  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]} {...pick}>
      <HitBox args={[2.8, 1.8, 0.5]} position={[0, 0, 0]} />
      <mesh>
        <boxGeometry args={[2.5, 1.55, 0.18]} />
        <meshStandardMaterial color="#17202a" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.11]}>
        <boxGeometry args={[2.1, 1.15, 0.025]} />
        <meshStandardMaterial color="#063b45" emissive="#0aa5a6" emissiveIntensity={text ? 0.45 : 0.12} />
      </mesh>
      <Text position={[-0.8, 0.27, 0.14]} rotation={[0, 0, 0]} fontSize={0.18} color="#9ff7df" anchorX="left" anchorY="middle">
        {text || 'I2C OLED'}
      </Text>
      <Text position={[-0.8, -0.08, 0.14]} rotation={[0, 0, 0]} fontSize={0.13} color="#72d9d1" anchorX="left" anchorY="middle">
        {text ? 'ESP32  ·  3.3V' : t('stage.oledIdle')}
      </Text>
    </group>
  )
}

export function Waves({ position, active, color }: { position: Vec3; active: boolean; color: string }) {
  const refs = useRef<(THREE.Mesh | null)[]>([])
  useFrame(({ clock }) => {
    refs.current.forEach((m, i) => {
      if (!m) return
      const p = (clock.elapsedTime * 0.8 + i / 3) % 1
      m.scale.setScalar(0.4 + p * 1.6)
      ;(m.material as THREE.MeshBasicMaterial).opacity = active ? (1 - p) * 0.55 : 0
    })
  })
  return (
    <group position={position} visible={active}>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m
          }}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <ringGeometry args={[0.42, 0.47, 48]} />
          <meshBasicMaterial color={color} transparent depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

/** Live control(s) on the inspect card — keyed like the reference plant lesson params. */
export type PartControl =
  | {
      kind: 'slider'
      inputKey: 'pot' | 'temp' | 'soilDry' | 'soilWet' | 'thirsty' | 'soggy'
      min: number
      max: number
      step?: number
      labelKey: string
      unit?: string
      display?: 'raw' | 'voltage' | 'moisture' | 'temp' | 'percent'
    }
  | { kind: 'hold'; inputKey: 'button' | 'touch' | 'water'; labelKey: string }
  | {
      kind: 'choice'
      inputKey: 'sun'
      labelKey: string
      options: { value: 'shade' | 'window' | 'sun'; labelKey: string; noteKey?: string }[]
    }
  | { kind: 'readout'; readout: 'oled' | 'moisture' | 'soilRaw' | 'touch' }

export type CalloutIcon = 'drop' | 'screen' | 'can' | 'wave' | 'plant'

/** Scene geometry only — titles/bodies live in `lib/i18n/content/{locale}/callouts.ts`. */
export type CalloutSpec = {
  at: Vec3
  dx: number
  dy: number
  interactive?: boolean
  pickable?: boolean
  icon?: CalloutIcon
  /** When set, scene-part key becomes `board-${hotspotId}` for Esp32Board picks. */
  hotspotId?: string
  /** Prefer `controls` (multiple rows). `control` kept for single-control lessons. */
  control?: PartControl
  controls?: PartControl[]
}

/** Accent ring — reference uses #1aa3a1 double ring under the selection. */
export function SelectionRing({ at }: { at: [number, number, number] | null }) {
  const matA = useRef<THREE.MeshBasicMaterial>(null)
  const matB = useRef<THREE.MeshBasicMaterial>(null)
  useFrame(({ clock }) => {
    if (!at) return
    const pulse = 0.55 + Math.sin(clock.elapsedTime * 3.2) * 0.2
    if (matA.current) matA.current.opacity = 0.3 + pulse * 0.25
    if (matB.current) matB.current.opacity = 0.55 + pulse * 0.35
  })
  if (!at) return null
  return (
    <group position={[at[0], 0.03, at[2]]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.62, 64]} />
        <meshBasicMaterial
          ref={matA}
          color="#1aa3a1"
          transparent
          opacity={0.45}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.68, 0.78, 64]} />
        <meshBasicMaterial
          ref={matB}
          color="#1aa3a1"
          transparent
          opacity={0.85}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

/**
 * Peace lily (reference Zl) — terracotta pot, soil + pebbles, elongated leaves
 * that droop with wilt, white spathe + yellow spadix. No Y-spin on select.
 */
export function PlantPot({
  position,
  wetness,
  wilt = 0,
  onPick,
}: {
  position: Vec3
  wetness: number
  wilt?: number
  onPick?: () => void
}) {
  const soilColor = useMemo(
    () => new THREE.Color('#c29a68').lerp(new THREE.Color('#5a3d27'), Math.min(1, wetness * 1.25)),
    [wetness],
  )
  const leafColor = useMemo(
    () => new THREE.Color('#3fa064').lerp(new THREE.Color('#a9a85a'), wilt * wilt * 0.85),
    [wilt],
  )
  const pick = usePickHandlers(onPick)
  const baseLean = 0.22
  const leaves: [number, number, number, number][] = [
    // yaw°, stemLen, bladeLen, baseLean(rad)
    [0.1, 0.72, 0.85, 0.18],
    [1.1, 0.68, 0.8, 0.28],
    [2.2, 0.78, 0.9, 0.15],
    [3.3, 0.62, 0.72, 0.32],
    [4.2, 0.7, 0.78, 0.22],
    [5.0, 0.55, 0.62, 0.38],
    [5.8, 0.58, 0.65, 0.3],
  ]

  return (
    <group position={position} {...pick}>
      <HitBox args={[1.7, 2.6, 1.7]} position={[0, 1.1, 0]} />

      {/* Terracotta pot */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <cylinderGeometry args={[0.68, 0.52, 0.84, 32]} />
        <meshStandardMaterial color="#d4774e" roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.86, 0]}>
        <cylinderGeometry args={[0.72, 0.7, 0.1, 32]} />
        <meshStandardMaterial color="#b9603d" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.5, 0.52, 0.08, 32]} />
        <meshStandardMaterial color="#a85232" roughness={0.8} />
      </mesh>

      {/* Soil surface */}
      <mesh position={[0, 0.88, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.62, 32]} />
        <meshStandardMaterial color={soilColor} roughness={0.95} />
      </mesh>
      {[
        [0.22, -0.18, 0.07],
        [-0.28, -0.1, 0.055],
        [0.32, 0.16, 0.05],
        [-0.08, 0.28, 0.06],
        [0.1, 0.08, 0.04],
        [-0.35, 0.18, 0.05],
      ].map(([x, z, r], i) => (
        <mesh key={i} position={[x, 0.9, z]} scale={[1, 0.45, 1]}>
          <sphereGeometry args={[r, 10, 8]} />
          <meshStandardMaterial color={soilColor} roughness={0.95} />
        </mesh>
      ))}

      {/* Leaves — stem + flattened blade; droop with wilt */}
      {leaves.map(([yaw, stemLen, bladeLen, lean], i) => {
        const tilt = lean + wilt * (1.05 - lean * 0.35)
        const bladePitch = baseLean + wilt * 0.85
        return (
          <group key={i} position={[-0.06, 0.9, -0.1]} rotation={[0, yaw, 0]}>
            <group rotation={[tilt, 0, 0]}>
              <mesh position={[0, stemLen / 2, 0]}>
                <cylinderGeometry args={[0.025, 0.035, stemLen, 8]} />
                <meshStandardMaterial color="#4f9a5a" roughness={0.65} />
              </mesh>
              <group position={[0, stemLen, 0]} rotation={[bladePitch, 0, 0]}>
                <mesh scale={[0.2, bladeLen * 0.55, 0.035]} castShadow>
                  <sphereGeometry args={[1, 14, 10]} />
                  <meshStandardMaterial color={leafColor} roughness={0.55} />
                </mesh>
              </group>
            </group>
          </group>
        )
      })}

      {/* Spathe flower */}
      <group position={[-0.06, 0.9, -0.1]} rotation={[0, 2.2, 0]}>
        <group rotation={[0.12 + wilt * 0.75, 0, 0]}>
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[0.022, 0.03, 1.05, 8]} />
            <meshStandardMaterial color="#4f9a5a" roughness={0.65} />
          </mesh>
          <group position={[0, 1.1, 0]} rotation={[wilt * 1.2, 0, 0]}>
            <mesh position={[0, 0.22, -0.04]} rotation={[-0.25, 0, 0]} scale={[0.28, 0.42, 0.05]}>
              <sphereGeometry args={[1, 12, 10]} />
              <meshStandardMaterial color="#f6f1e4" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.38, 0.02]}>
              <sphereGeometry args={[0.07, 10, 8]} />
              <meshStandardMaterial color="#f2c23a" roughness={0.55} />
            </mesh>
            <mesh position={[0, 0.52, 0.02]}>
              <cylinderGeometry args={[0.035, 0.05, 0.22, 10]} />
              <meshStandardMaterial color="#f2c23a" roughness={0.55} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}

/** Capacitive soil moisture v1.2 — PCB header above soil, probe into the pot. */
export function SoilProbe({ position, onPick }: { position: Vec3; onPick?: () => void }) {
  const pick = usePickHandlers(onPick)
  return (
    <group position={position} {...pick}>
      <HitBox args={[0.75, 1.6, 0.55]} position={[0.38, 0.95, 0.05]} />
      {/* Probe blade into soil */}
      <mesh position={[0.38, 0.55, 0.05]} rotation={[0.08, 0, 0.08]}>
        <boxGeometry args={[0.12, 1.05, 0.028]} />
        <meshStandardMaterial color="#efe9dc" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0.38, 0.55, 0.05]} rotation={[0.08, 0, 0.08]}>
        <boxGeometry args={[0.04, 0.85, 0.032]} />
        <meshStandardMaterial color="#c8c2b4" metalness={0.55} roughness={0.35} />
      </mesh>
      {/* Module PCB */}
      <mesh position={[0.38, 1.22, 0.05]} castShadow>
        <boxGeometry args={[0.48, 0.32, 0.1]} />
        <meshStandardMaterial color="#1a1c22" roughness={0.55} />
      </mesh>
      <mesh position={[0.38, 1.22, 0.11]}>
        <boxGeometry args={[0.32, 0.16, 0.02]} />
        <meshStandardMaterial color="#2a2e38" roughness={0.4} />
      </mesh>
      {/* Header pins */}
      {[-0.12, 0, 0.12].map((x, i) => (
        <mesh key={i} position={[0.38 + x, 1.42, 0.05]}>
          <boxGeometry args={[0.055, 0.1, 0.055]} />
          <meshStandardMaterial color="#d9d4ca" metalness={0.65} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

/** Blue watering can — sits on the floor next to the pot; hold to water. */
export function WateringCan({
  position,
  pouring,
  onHold,
  onPick,
}: {
  position: Vec3
  pouring: boolean
  onHold: (down: boolean) => void
  onPick?: () => void
}) {
  const lift = pouring ? 0.55 : 0
  const tip = pouring ? 0.55 : 0.08
  const pick = usePickHandlers(onPick, onHold)
  return (
    <group position={[position[0], position[1] + lift, position[2]]} rotation={[0, -0.35, tip]} {...pick}>
      <HitBox args={[1.4, 1.6, 1.2]} position={[0.15, 0.55, 0]} />
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.36, 0.4, 0.72, 24]} />
        <meshStandardMaterial color="#4b86c9" roughness={0.42} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.86, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.08, 24]} />
        <meshStandardMaterial color="#d9e4ef" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.96, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 0.14, 16]} />
        <meshStandardMaterial color="#4b86c9" roughness={0.42} />
      </mesh>
      <mesh position={[-0.02, 0.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.04, 8, 20, Math.PI]} />
        <meshStandardMaterial color="#4b86c9" roughness={0.42} />
      </mesh>
      <mesh position={[0.48, 0.62, 0]} rotation={[0, 0, -1.05]}>
        <cylinderGeometry args={[0.05, 0.09, 0.55, 12]} />
        <meshStandardMaterial color="#4b86c9" roughness={0.42} />
      </mesh>
      <mesh position={[0.72, 0.42, 0]} rotation={[0, 0, -1.05]}>
        <cylinderGeometry args={[0.1, 0.06, 0.16, 12]} />
        <meshStandardMaterial color="#d9e4ef" roughness={0.35} />
      </mesh>
      {pouring && (
        <mesh position={[0.9, 0.05, 0]}>
          <cylinderGeometry args={[0.035, 0.07, 0.55, 8]} />
          <meshStandardMaterial color="#6ec8ef" transparent opacity={0.7} />
        </mesh>
      )}
    </group>
  )
}

/** OLED for plant lesson — big %, bar, mood line (reference We()). */
export function SoilOledDisplay({
  position,
  pct,
  message,
  onPick,
}: {
  position: Vec3
  pct: number
  message: string
  onPick?: () => void
}) {
  const bar = Math.min(1, Math.max(0, pct / 100))
  const pick = usePickHandlers(onPick)
  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]} {...pick}>
      <HitBox args={[2.8, 1.8, 0.6]} position={[0, 0, 0]} />
      <mesh>
        <boxGeometry args={[2.5, 1.55, 0.18]} />
        <meshStandardMaterial color="#17202a" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.11]}>
        <boxGeometry args={[2.15, 1.2, 0.025]} />
        <meshStandardMaterial color="#041e24" emissive="#0aa5a6" emissiveIntensity={0.2} />
      </mesh>
      <Text position={[-0.9, 0.32, 0.14]} fontSize={0.36} color="#9ff7df" anchorX="left" anchorY="middle">
        {`${Math.round(pct)}%`}
      </Text>
      <mesh position={[0, -0.05, 0.14]}>
        <planeGeometry args={[1.9, 0.12]} />
        <meshBasicMaterial color="#1a4a4a" />
      </mesh>
      <mesh position={[-0.95 + bar * 0.95, -0.05, 0.145]} scale={[bar || 0.001, 1, 1]}>
        <planeGeometry args={[1.9, 0.1]} />
        <meshBasicMaterial color="#9ff7df" />
      </mesh>
      <Text position={[-0.9, -0.38, 0.14]} fontSize={0.18} color="#72d9d1" anchorX="left" anchorY="middle">
        {message || '—'}
      </Text>
    </group>
  )
}
