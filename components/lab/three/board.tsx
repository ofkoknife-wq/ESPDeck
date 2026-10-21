'use client'

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
} from '@/lib/geometry'
import { useCanvasTexture } from './primitives'

const PX = 200
const STRIP_LEN = 19 * PITCH
const STRIP_X = (pinLocalX(0) + pinLocalX(18)) / 2

function toCanvasX(x: number) {
  return (x + PCB_W / 2) * PX
}
function toCanvasY(z: number) {
  return (z + PCB_D / 2) * PX
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
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, PCB_TOP + 0.002, 0]}>
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
    <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[0, 0.126, 0]}>
      <planeGeometry args={[1.6, 1.75]} />
      <meshStandardMaterial map={texture} metalness={0.55} roughness={0.38} />
    </mesh>
  )
}

function Antenna() {
  const segments = [2.2, 2.34, 2.48, 2.62]
  return (
    <group position={[0, PCB_TOP + 0.085, 0]}>
      {segments.map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.035, 0.008, 1.3]} />
          <meshStandardMaterial color="#c8a24a" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
      {segments.slice(0, -1).map((x, i) => (
        <mesh key={`c${x}`} position={[x + 0.07, 0, i % 2 === 0 ? 0.65 : -0.65]}>
          <boxGeometry args={[0.175, 0.008, 0.035]} />
          <meshStandardMaterial color="#c8a24a" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

function Header({ z }: { z: number }) {
  return (
    <group>
      <mesh position={[STRIP_X, PCB_TOP + 0.05, z]}>
        <boxGeometry args={[STRIP_LEN, 0.1, 0.24]} />
        <meshStandardMaterial color="#1b1d20" roughness={0.7} />
      </mesh>
      <mesh position={[STRIP_X, PCB_BOTTOM / 2, z]}>
        <boxGeometry args={[STRIP_LEN, PCB_BOTTOM, 0.24]} />
        <meshStandardMaterial color="#1b1d20" roughness={0.7} />
      </mesh>
      {Array.from({ length: 19 }, (_, i) => (
        <mesh key={i} position={[pinLocalX(i), PCB_TOP + 0.15, z]}>
          <boxGeometry args={[0.055, 0.34, 0.055]} />
          <meshStandardMaterial color="#d8b25a" metalness={0.9} roughness={0.25} />
        </mesh>
      ))}
    </group>
  )
}

function Chip({
  position,
  size,
  color = '#17181b',
}: {
  position: [number, number, number]
  size: [number, number, number]
  color?: string
}) {
  return (
    <mesh position={[position[0], PCB_TOP + size[1] / 2 + position[1], position[2]]}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.6} />
    </mesh>
  )
}

function TactSwitch({ position }: { position: [number, number] }) {
  return (
    <group position={[position[0], PCB_TOP, position[1]]}>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.34, 0.12, 0.28]} />
        <meshStandardMaterial color="#c4c8cc" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
        <meshStandardMaterial color="#222428" roughness={0.6} />
      </mesh>
    </group>
  )
}

export function Esp32Board({ onboard = 0 }: { onboard?: number }) {
  return (
    <group position={[BOARD_X, 0, 0]}>
      <mesh position={[0, PCB_BOTTOM + PCB_T / 2, 0]}>
        <boxGeometry args={[PCB_W, PCB_T, PCB_D]} />
        <meshStandardMaterial color="#1f2226" roughness={0.55} />
      </mesh>
      <Silkscreen />
      <Header z={-HEADER_Z} />
      <Header z={HEADER_Z} />

      {/* 模组 */}
      <mesh position={[1.525, PCB_TOP + 0.04, 0]}>
        <boxGeometry args={[2.55, 0.08, 1.8]} />
        <meshStandardMaterial color="#2a2d33" roughness={0.6} />
      </mesh>
      <group position={[1.175, PCB_TOP + 0.08 + 0.125, 0]}>
        <mesh>
          <boxGeometry args={[1.75, 0.25, 1.6]} />
          <meshStandardMaterial color="#c2c6cb" metalness={0.75} roughness={0.32} />
        </mesh>
        <ShieldTop />
      </group>
      <Antenna />

      {/* USB 口 */}
      <group position={[-2.55, PCB_TOP + 0.11, 0]}>
        <mesh>
          <boxGeometry args={[0.55, 0.22, 0.62]} />
          <meshStandardMaterial color="#cfd3d7" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[-0.276, 0, 0]}>
          <boxGeometry args={[0.01, 0.12, 0.46]} />
          <meshStandardMaterial color="#111215" />
        </mesh>
      </group>

      <Chip position={[-1.75, 0, 0.1]} size={[0.42, 0.08, 0.42]} />
      <Chip position={[-1.0, 0, -0.45]} size={[0.38, 0.13, 0.26]} />
      <mesh position={[-1.0, PCB_TOP + 0.03, -0.7]}>
        <boxGeometry args={[0.3, 0.05, 0.16]} />
        <meshStandardMaterial color="#c4c8cc" metalness={0.8} roughness={0.3} />
      </mesh>
      <Chip position={[-0.7, 0, 0.45]} size={[0.12, 0.06, 0.06]} color="#7b6a4d" />
      <Chip position={[-0.5, 0, 0.45]} size={[0.12, 0.06, 0.06]} color="#7b6a4d" />
      <Chip position={[-1.45, 0, -0.15]} size={[0.06, 0.06, 0.12]} color="#2a2a2a" />
      <Chip position={[-0.35, 0, -0.55]} size={[0.14, 0.08, 0.08]} color="#c9a65a" />

      <TactSwitch position={[-2.2, -0.72]} />
      <TactSwitch position={[-2.2, 0.72]} />

      {/* 电源指示灯 */}
      <mesh position={[-1.3, PCB_TOP + 0.03, -0.82]}>
        <boxGeometry args={[0.1, 0.06, 0.06]} />
        <meshStandardMaterial color="#ff4b3a" emissive="#ff3b2a" emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      {/* 板载 LED (GPIO2) */}
      <mesh position={[-1.3, PCB_TOP + 0.03, 0.82]}>
        <boxGeometry args={[0.1, 0.06, 0.06]} />
        <meshStandardMaterial
          color={onboard > 0 ? '#9cc8ff' : '#7f8fa6'}
          emissive="#3d8bff"
          emissiveIntensity={onboard * 4}
          toneMapped={onboard <= 0}
        />
      </mesh>
      {onboard > 0 && (
        <>
          <mesh position={[-1.3, PCB_TOP + 0.05, 0.82]}>
            <sphereGeometry args={[0.18, 16, 12]} />
            <meshBasicMaterial color="#5aa0ff" transparent opacity={onboard * 0.35} depthWrite={false} />
          </mesh>
          <pointLight position={[-1.3, PCB_TOP + 0.25, 0.82]} color="#4d94ff" intensity={onboard * 1.2} distance={1.6} />
        </>
      )}
    </group>
  )
}
