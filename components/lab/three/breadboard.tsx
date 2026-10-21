'use client'

import { BB_COLS, BB_D, BB_TOP, BB_W, BB_X, holeX, holeZ } from '@/lib/geometry'
import { useCanvasTexture } from './primitives'

const PX = 200

export function Breadboard() {
  const texture = useCanvasTexture(BB_W * PX, BB_D * PX, (ctx) => {
    const W = ctx.canvas.width
    const H = ctx.canvas.height
    const cx = (x: number) => (x - BB_X + BB_W / 2) * PX
    const cy = (z: number) => (z + BB_D / 2) * PX

    ctx.fillStyle = '#f3f2ec'
    ctx.fillRect(0, 0, W, H)

    ctx.fillStyle = '#d9d7ce'
    ctx.fillRect(0, cy(0) - 16, W, 32)
    ctx.fillStyle = '#c4c1b7'
    ctx.fillRect(0, cy(0) - 3, W, 6)

    ctx.fillStyle = '#d63a2c'
    ctx.fillRect(40, cy(-1.64) - 2, W - 80, 4)
    ctx.fillStyle = '#2d5fc4'
    ctx.fillRect(40, cy(1.64) - 2, W - 80, 4)

    ctx.font = 'bold 22px ui-monospace, monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#d63a2c'
    ctx.fillText('+', 20, cy(-1.5))
    ctx.fillStyle = '#2d5fc4'
    ctx.fillText('−', 20, cy(1.5))

    const rows = [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]
    ctx.fillStyle = '#3f444a'
    for (let c = 0; c < BB_COLS; c++) {
      for (const r of rows) {
        if (Math.abs(r) === 6 && c % 6 === 5) continue
        const x = cx(holeX(c))
        const y = cy(holeZ(r))
        ctx.fillRect(x - 6, y - 6, 12, 12)
      }
    }

    ctx.fillStyle = '#9a9891'
    ctx.font = '15px ui-monospace, monospace'
    for (let c = 0; c < BB_COLS; c += 5) {
      ctx.fillText(String(c + 1), cx(holeX(c)), cy(1.36))
      ctx.fillText(String(c + 1), cx(holeX(c)), cy(-1.36))
    }
    const letters = ['a', 'b', 'c', 'd', 'e']
    letters.forEach((l, i) => {
      ctx.fillText(l, cx(holeX(0)) - 26, cy(holeZ(-(i + 1))))
      ctx.fillText('fghij'[i], cx(holeX(0)) - 26, cy(holeZ(i + 1)))
    })
  })

  return (
    <group>
      <mesh position={[BB_X, BB_TOP / 2, 0]}>
        <boxGeometry args={[BB_W, BB_TOP, BB_D]} />
        <meshStandardMaterial color="#eceae2" roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[BB_X, BB_TOP + 0.002, 0]}>
        <planeGeometry args={[BB_W, BB_D]} />
        <meshStandardMaterial map={texture} roughness={0.85} />
      </mesh>
    </group>
  )
}
