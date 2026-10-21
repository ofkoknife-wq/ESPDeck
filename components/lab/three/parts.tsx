'use client'

import { Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { BB_TOP, PIN_TOP, type Vec3, mid } from '@/lib/geometry'
import { Rod, setPointer } from './primitives'

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
}: {
  anode: Vec3
  cathode: Vec3
  color?: string
  brightness?: number
}) {
  const c = mid(anode, cathode)
  const baseY = BB_TOP + LEG_H
  const on = brightness > 0.01
  return (
    <group>
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

export function Resistor({ a, b, bands = BANDS_220 }: { a: Vec3; b: Vec3; bands?: string[] }) {
  const c = mid(a, b)
  const dx = b[0] - a[0]
  const dz = b[2] - a[2]
  const len = Math.hypot(dx, dz)
  const angle = -Math.atan2(dz, dx)
  const h = 0.2
  return (
    <group position={[c[0], BB_TOP, c[2]]} rotation={[0, angle, 0]}>
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
}: {
  center: Vec3
  pressed: boolean
  onPress: (down: boolean) => void
}) {
  const bodyY = BB_TOP + 0.06
  return (
    <group position={[center[0], 0, center[2]]}>
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
      <mesh
        position={[0, bodyY + (pressed ? 0.27 : 0.33), 0]}
        onPointerDown={(e) => {
          e.stopPropagation()
          onPress(true)
        }}
        onPointerUp={() => onPress(false)}
        onPointerOut={() => {
          setPointer(false)
          onPress(false)
        }}
        onPointerOver={() => setPointer(true)}
      >
        <cylinderGeometry args={[0.17, 0.18, 0.16, 24]} />
        <meshStandardMaterial color="#d63a2c" roughness={0.45} />
      </mesh>
    </group>
  )
}

export function Potentiometer({ legs, value }: { legs: [Vec3, Vec3, Vec3]; value: number }) {
  const c = legs[1]
  const bodyY = BB_TOP + 0.12
  const rot = ((135 - (value / 4095) * 270) * Math.PI) / 180
  return (
    <group>
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

export function RgbLed({ legs, rgb }: { legs: [Vec3, Vec3, Vec3, Vec3]; rgb: [number, number, number] }) {
  const c = mid(legs[1], legs[2])
  const baseY = BB_TOP + LEG_H + 0.05
  const max = Math.max(...rgb)
  const color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
  const on = max > 4
  const level = max / 255
  return (
    <group>
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

export function Buzzer({ a, b, active }: { a: Vec3; b: Vec3; active: boolean }) {
  const c = mid(a, b)
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const s = active ? 1 + Math.sin(clock.elapsedTime * 90) * 0.012 : 1
    ref.current.scale.set(s, 1, s)
  })
  return (
    <group>
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

export function Dht11({ legs }: { legs: [Vec3, Vec3, Vec3] }) {
  const c = legs[1]
  const bodyY = BB_TOP + 0.2
  return (
    <group>
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

export function Servo({ position, angle }: { position: Vec3; angle: number }) {
  const hornRot = ((angle - 90) * Math.PI) / 180
  const smooth = useRef<THREE.Group>(null)
  useFrame(() => {
    if (smooth.current) smooth.current.rotation.y += (hornRot - smooth.current.rotation.y) * 0.35
  })
  return (
    <group position={position}>
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
}: {
  position: Vec3
  touched: boolean
  onTouch: (down: boolean) => void
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
          onTouch(true)
        }}
        onPointerUp={() => onTouch(false)}
        onPointerOut={() => {
          setPointer(false)
          onTouch(false)
        }}
        onPointerOver={() => setPointer(true)}
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

export function OledDisplay({ position, text }: { position: Vec3; text: string }) {
  return (
    <group position={position} rotation={[-Math.PI / 2, 0, 0]}>
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
        {text ? 'ESP32  ·  3.3V' : '准备就绪'}
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

export type CalloutSpec = {
  at: Vec3
  title: string
  body: string
  dx: number
  dy: number
  interactive?: boolean
}
