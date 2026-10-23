'use client'

import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import {
  BOARD_X,
  HEADER_Z,
  LEFT_PINS,
  PCB_BOTTOM,
  PCB_D,
  PCB_T,
  PCB_TOP,
  PCB_W,
  PITCH,
  RIGHT_PINS,
  pinLocalX,
  type Vec3,
} from '@/lib/geometry'
import { BOARD_HOTSPOTS, type BoardHotspot } from './board-hotspots'
import { setInteractiveHover, useCanvasTexture } from './primitives'

const PX = 200
const STRIP_LEN = 19 * PITCH
const STRIP_X = (pinLocalX(0) + pinLocalX(18)) / 2

function toCanvasX(x: number) {
  return (x + PCB_W / 2) * PX
}
function toCanvasY(z: number) {
  return (z + PCB_D / 2) * PX
}

function HitBox({ args }: { args: [number, number, number] }) {
  return (
    <mesh>
      <boxGeometry args={args} />
      {/* depthTest off so the planted collider always wins over silkscreen / neighbors */}
      <meshBasicMaterial transparent opacity={0} depthWrite={false} depthTest={false} />
    </mesh>
  )
}

/** Display meshes never receive pointers — only the planted HitBox does. */
function VisualOnly({ children }: { children: ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) obj.raycast = () => undefined
    })
  })
  return <group ref={ref}>{children}</group>
}

/** One active board hover id — stops module↔antenna pointer thrash. */
let boardHoverId: string | null = null

/**
 * Click / hover select. No lift, no scale — transforms caused flicker when
 * hit volumes overlapped. Buttons may still depress slightly.
 */
function BoardPart({
  spot,
  selected,
  onPick,
  children,
}: {
  spot: BoardHotspot
  selected?: boolean
  onPick?: (id: string) => void
  children: ReactNode
}) {
  const visual = useRef<THREE.Group>(null)
  const press = useRef(0)
  const pressTarget = useRef(0)

  useFrame((_, dt) => {
    if (!spot.pressable) return
    press.current += (pressTarget.current - press.current) * Math.min(1, dt * 22)
    const g = visual.current
    if (g) g.position.y = -press.current * 0.04
  })

  return (
    <group
      position={spot.local}
      onPointerOver={(e) => {
        e.stopPropagation()
        boardHoverId = spot.id
        setInteractiveHover(true)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        if (boardHoverId === spot.id) {
          boardHoverId = null
          setInteractiveHover(false)
        }
        pressTarget.current = 0
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        boardHoverId = spot.id
        setInteractiveHover(true)
        if (spot.pressable) pressTarget.current = 1
        onPick?.(spot.id)
      }}
      onPointerUp={() => {
        pressTarget.current = 0
      }}
    >
      <HitBox args={spot.hit} />
      <group ref={visual}>
        <VisualOnly>{children}</VisualOnly>
      </group>
      {selected && (
        <mesh position={[0, -spot.hit[1] * 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]} raycast={() => undefined}>
          <ringGeometry
            args={[Math.max(spot.hit[0], spot.hit[2]) * 0.36, Math.max(spot.hit[0], spot.hit[2]) * 0.46, 48]}
          />
          <meshBasicMaterial color="#1aa3a1" transparent opacity={0.85} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}

function Silkscreen() {
  const texture = useCanvasTexture(PCB_W * PX, PCB_D * PX, (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.fillStyle = '#eef1ee'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.font = 'bold 17px ui-monospace, monospace'
    LEFT_PINS.forEach((label, i) => {
      ctx.fillText(label, toCanvasX(pinLocalX(i)), toCanvasY(-HEADER_Z) + 40)
    })
    RIGHT_PINS.forEach((label, i) => {
      ctx.fillText(label, toCanvasX(pinLocalX(i)), toCanvasY(HEADER_Z) - 40)
    })

    ctx.strokeStyle = '#eef1ee'
    ctx.lineWidth = 3
    ctx.strokeRect(toCanvasX(0.22), toCanvasY(-0.95), 2.62 * PX, 1.9 * PX)

    ctx.font = 'bold 26px ui-sans-serif, sans-serif'
    ctx.save()
    ctx.translate(toCanvasX(-0.55), toCanvasY(0))
    ctx.fillText('ESP32-DevKitC', 0, -16)
    ctx.font = '18px ui-sans-serif, sans-serif'
    ctx.fillText('V4  ·  ESPRESSIF', 0, 16)
    ctx.restore()

    ctx.font = 'bold 18px ui-monospace, monospace'
    ctx.fillText('EN', toCanvasX(-2.2), toCanvasY(-0.42))
    ctx.fillText('BOOT', toCanvasX(-2.2), toCanvasY(0.42))
    ctx.fillText('IO2', toCanvasX(-1.3), toCanvasY(0.62))
    ctx.fillText('PWR', toCanvasX(-1.3), toCanvasY(-0.62))
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, PCB_TOP + 0.002, 0]} raycast={() => undefined}>
      <planeGeometry args={[PCB_W, PCB_D]} />
      <meshStandardMaterial map={texture} transparent roughness={0.8} />
    </mesh>
  )
}

function ShieldTop() {
  const texture = useCanvasTexture(350, 320, (ctx) => {
    ctx.fillStyle = '#c9cdd2'
    ctx.fillRect(0, 0, 350, 320)
    ctx.fillStyle = '#6d737a'
    ctx.textAlign = 'center'
    ctx.font = 'bold 40px ui-sans-serif, sans-serif'
    ctx.fillText('ESPRESSIF', 175, 110)
    ctx.font = 'bold 26px ui-monospace, monospace'
    ctx.fillText('ESP32-WROOM-32E', 175, 170)
    ctx.font = '20px ui-monospace, monospace'
    ctx.fillText('FCC ID: 2AC7Z-ESP32', 175, 215)
    ctx.fillText('CMIIT ID: 2019DP', 175, 245)
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.125, 0]}>
      <planeGeometry args={[1.6, 1.75]} />
      <meshStandardMaterial map={texture} metalness={0.55} roughness={0.38} />
    </mesh>
  )
}

function HeaderStrip() {
  return (
    <group>
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[STRIP_LEN, 0.1, 0.24]} />
        <meshStandardMaterial color="#1b1d20" roughness={0.7} />
      </mesh>
      <mesh position={[0, -(PCB_TOP + 0.2) + PCB_BOTTOM / 2, 0]}>
        <boxGeometry args={[STRIP_LEN, PCB_BOTTOM, 0.24]} />
        <meshStandardMaterial color="#1b1d20" roughness={0.7} />
      </mesh>
      {Array.from({ length: 19 }, (_, i) => (
        <mesh key={i} position={[pinLocalX(i) - STRIP_X, -0.05, 0]}>
          <boxGeometry args={[0.055, 0.34, 0.055]} />
          <meshStandardMaterial color="#d8b25a" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
    </group>
  )
}

function TactSwitch() {
  return (
    <group>
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[0.34, 0.12, 0.28]} />
        <meshStandardMaterial color="#c4c8cc" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
        <meshStandardMaterial color="#222428" roughness={0.6} />
      </mesh>
    </group>
  )
}

function MountHole({ x, z }: { x: number; z: number }) {
  return (
    <mesh position={[x, PCB_TOP + 0.001, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.06, 0.1, 20]} />
      <meshStandardMaterial color="#0e1014" roughness={0.7} metalness={0.4} />
    </mesh>
  )
}

function LedDome({
  color,
  emissive,
  intensity,
}: {
  color: string
  emissive: string
  intensity: number
}) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.12, 0.04, 0.08]} />
        <meshStandardMaterial color="#1a1c20" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.045, 12, 10]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={intensity}
          roughness={0.25}
          toneMapped={intensity <= 0.05}
        />
      </mesh>
    </group>
  )
}

function spot(id: string) {
  const found = BOARD_HOTSPOTS.find((x) => x.id === id)
  if (!found) throw new Error(`Unknown board hotspot ${id}`)
  return found
}

export function Esp32Board({
  onboard = 0,
  selectedId = null,
  onPickHotspot,
}: {
  onboard?: number
  selectedId?: string | null
  onPickHotspot?: (id: string) => void
}) {
  const pick = onPickHotspot
  const isSel = (id: string) => selectedId === id

  return (
    <group position={[BOARD_X, 0, 0]}>
      <mesh position={[0, PCB_BOTTOM + PCB_T / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[PCB_W, PCB_T, PCB_D]} />
        <meshStandardMaterial color="#1f2226" roughness={0.55} />
      </mesh>
      {/* Edge bevel strip */}
      <mesh position={[0, PCB_TOP - 0.01, PCB_D / 2 - 0.02]}>
        <boxGeometry args={[PCB_W - 0.08, 0.02, 0.04]} />
        <meshStandardMaterial color="#2a2e34" roughness={0.5} />
      </mesh>
      <mesh position={[0, PCB_TOP - 0.01, -PCB_D / 2 + 0.02]}>
        <boxGeometry args={[PCB_W - 0.08, 0.02, 0.04]} />
        <meshStandardMaterial color="#2a2e34" roughness={0.5} />
      </mesh>
      <Silkscreen />
      <MountHole x={-PCB_W / 2 + 0.28} z={-PCB_D / 2 + 0.28} />
      <MountHole x={PCB_W / 2 - 0.28} z={-PCB_D / 2 + 0.28} />
      <MountHole x={-PCB_W / 2 + 0.28} z={PCB_D / 2 - 0.28} />
      <MountHole x={PCB_W / 2 - 0.28} z={PCB_D / 2 - 0.28} />

      <BoardPart spot={spot('pins-l')} selected={isSel('pins-l')} onPick={pick}>
        <HeaderStrip />
      </BoardPart>
      <BoardPart spot={spot('pins-r')} selected={isSel('pins-r')} onPick={pick}>
        <HeaderStrip />
      </BoardPart>

      <BoardPart spot={spot('module')} selected={isSel('module')} onPick={pick}>
        <mesh position={[0.425, -0.16, 0]}>
          <boxGeometry args={[2.55, 0.08, 1.8]} />
          <meshStandardMaterial color="#2a2d33" roughness={0.6} />
        </mesh>
        <mesh position={[0.075, 0, 0]} castShadow>
          <boxGeometry args={[1.75, 0.25, 1.6]} />
          <meshStandardMaterial color="#c2c6cb" metalness={0.75} roughness={0.32} />
        </mesh>
        {[-0.45, -0.15, 0.15, 0.45].map((z) => (
          <mesh key={z} position={[0.625, 0.14, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.03, 0.03, 0.35, 8]} />
            <meshStandardMaterial color="#8a9098" metalness={0.7} roughness={0.35} />
          </mesh>
        ))}
        <group position={[0.075, 0, 0]}>
          <ShieldTop />
        </group>
      </BoardPart>

      <BoardPart spot={spot('antenna')} selected={isSel('antenna')} onPick={pick}>
        {[2.2, 2.34, 2.48, 2.62].map((x) => (
          <mesh key={x} position={[x - 2.5, -0.02, 0]}>
            <boxGeometry args={[0.035, 0.008, 1.3]} />
            <meshStandardMaterial color="#c8a24a" metalness={0.9} roughness={0.3} />
          </mesh>
        ))}
        {[2.2, 2.34, 2.48].map((x, i) => (
          <mesh key={`c${x}`} position={[x + 0.07 - 2.5, -0.02, i % 2 === 0 ? 0.65 : -0.65]}>
            <boxGeometry args={[0.175, 0.008, 0.035]} />
            <meshStandardMaterial color="#c8a24a" metalness={0.9} roughness={0.3} />
          </mesh>
        ))}
      </BoardPart>

      <BoardPart spot={spot('usb')} selected={isSel('usb')} onPick={pick}>
        <mesh>
          <boxGeometry args={[0.55, 0.22, 0.62]} />
          <meshStandardMaterial color="#cfd3d7" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[-0.02, 0, 0]}>
          <boxGeometry args={[0.42, 0.14, 0.5]} />
          <meshStandardMaterial color="#9aa0a6" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[-0.276, 0, 0]}>
          <boxGeometry args={[0.01, 0.12, 0.46]} />
          <meshStandardMaterial color="#111215" />
        </mesh>
      </BoardPart>

      <BoardPart spot={spot('uart')} selected={isSel('uart')} onPick={pick}>
        <mesh>
          <boxGeometry args={[0.42, 0.08, 0.42]} />
          <meshStandardMaterial color="#17181b" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.045, 0]}>
          <boxGeometry args={[0.28, 0.01, 0.28]} />
          <meshStandardMaterial color="#2a2e36" roughness={0.4} />
        </mesh>
      </BoardPart>

      <BoardPart spot={spot('ldo')} selected={isSel('ldo')} onPick={pick}>
        <mesh>
          <boxGeometry args={[0.38, 0.13, 0.26]} />
          <meshStandardMaterial color="#17181b" roughness={0.55} />
        </mesh>
        <mesh position={[0, 0.07, 0]}>
          <boxGeometry args={[0.22, 0.01, 0.14]} />
          <meshStandardMaterial color="#3a4048" roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.07, -0.25]}>
          <boxGeometry args={[0.3, 0.05, 0.16]} />
          <meshStandardMaterial color="#c4c8cc" metalness={0.8} roughness={0.3} />
        </mesh>
      </BoardPart>

      <BoardPart spot={spot('crystal')} selected={isSel('crystal')} onPick={pick}>
        <mesh>
          <cylinderGeometry args={[0.055, 0.055, 0.1, 16]} />
          <meshStandardMaterial color="#c9a65a" metalness={0.55} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshStandardMaterial color="#e8d5a0" metalness={0.4} roughness={0.4} />
        </mesh>
      </BoardPart>

      {/* Passives */}
      {[
        [-0.7, 0.45],
        [-0.5, 0.45],
        [-0.85, 0.2],
        [-0.55, 0.2],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, PCB_TOP + 0.03, z]}>
          <boxGeometry args={[0.12, 0.055, 0.06]} />
          <meshStandardMaterial color="#7b6a4d" roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[-1.45, PCB_TOP + 0.03, -0.15]}>
        <boxGeometry args={[0.06, 0.06, 0.12]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.55} />
      </mesh>

      <BoardPart spot={spot('en')} selected={isSel('en')} onPick={pick}>
        <TactSwitch />
      </BoardPart>
      <BoardPart spot={spot('boot')} selected={isSel('boot')} onPick={pick}>
        <TactSwitch />
      </BoardPart>

      <BoardPart spot={spot('pwr')} selected={isSel('pwr')} onPick={pick}>
        <LedDome color="#ff4b3a" emissive="#ff3b2a" intensity={1.8} />
      </BoardPart>

      <BoardPart spot={spot('led')} selected={isSel('led')} onPick={pick}>
        <LedDome
          color={onboard > 0 ? '#9cc8ff' : '#7f8fa6'}
          emissive="#3d8bff"
          intensity={onboard * 4}
        />
        {onboard > 0 && (
          <>
            <mesh position={[0, 0.06, 0]}>
              <sphereGeometry args={[0.16, 14, 10]} />
              <meshBasicMaterial color="#5aa0ff" transparent opacity={onboard * 0.32} depthWrite={false} />
            </mesh>
            <pointLight position={[0, 0.22, 0]} color="#4d94ff" intensity={onboard * 1.15} distance={1.5} />
          </>
        )}
      </BoardPart>
    </group>
  )
}
