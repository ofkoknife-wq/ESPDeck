'use client'

import { useMemo } from 'react'
import * as THREE from 'three'
import type { Vec3 } from '@/lib/geometry'

const UP = new THREE.Vector3(0, 1, 0)

/** 两点之间的圆柱（引脚、导线段） */
export function Rod({
  from,
  to,
  radius = 0.018,
  color = '#c9ccd1',
  metalness = 0.8,
}: {
  from: Vec3
  to: Vec3
  radius?: number
  color?: string
  metalness?: number
}) {
  const key = `${from.join(',')}|${to.join(',')}`
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const dir = b.clone().sub(a)
    const len = dir.length()
    const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize())
    return { position: a.add(b).multiplyScalar(0.5), quaternion: q, length: len }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return (
    <mesh position={position} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, 8]} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={0.35} />
    </mesh>
  )
}

export function setPointer(active: boolean) {
  if (typeof document !== 'undefined') document.body.style.cursor = active ? 'pointer' : 'auto'
}

/** When true, CameraControls ignores left-drag so mesh picks work. */
export const truckGate: { suppress: boolean; apply?: () => void } = { suppress: false }

export function setInteractiveHover(active: boolean) {
  truckGate.suppress = active
  truckGate.apply?.()
  setPointer(active)
}

export function useCanvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    draw(ctx)
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 8
    return texture
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height])
}
