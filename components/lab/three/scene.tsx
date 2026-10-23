'use client'

import { CameraControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { type RefObject, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { Vector3 } from 'three'
import type * as THREE from 'three'
import type { LessonId } from '@/lib/lessons'
import type { SimInputs, SimOutputs } from '@/lib/use-simulation'
import { LESSON_SCENES, LessonCircuit } from './circuits'

export type ViewApi = {
  reset: () => void
  zoom: (dir: 1 | -1) => void
  rotate: (dir: 1 | -1) => void
  /** Animate camera to look at a world-space point (already includes scene offsetX). */
  focusAt: (at: [number, number, number]) => void
}

const CAMERA_POS: [number, number, number] = [6, 9, 11]
const TARGET: [number, number, number] = [0, 0.4, 0.2]
const CAM_OFFSET: [number, number, number] = [
  CAMERA_POS[0] - TARGET[0],
  CAMERA_POS[1] - TARGET[1],
  CAMERA_POS[2] - TARGET[2],
]

type SceneProps = {
  lessonId: LessonId
  outputs: SimOutputs
  inputs: SimInputs
  setInput: <K extends keyof SimInputs>(key: K, value: SimInputs[K]) => void
  viewRef: RefObject<ViewApi | null>
  calloutsRef: RefObject<(HTMLDivElement | null)[]>
}

function Controls({ extent, viewRef }: { extent: number; viewRef: RefObject<ViewApi | null> }) {
  const controls = useRef<CameraControls>(null)
  const size = useThree((s) => s.size)
  const fit = Math.max(20, Math.min(size.width / extent, size.height / (extent * 0.62)))

  const reset = useCallback(
    (animate: boolean) => {
      const c = controls.current
      if (!c) return
      void c.setLookAt(...CAMERA_POS, ...TARGET, animate)
      void c.zoomTo(fit, animate)
    },
    [fit],
  )

  useEffect(() => {
    reset(true)
  }, [reset])

  useEffect(() => {
    viewRef.current = {
      reset: () => reset(true),
      zoom: (dir) => {
        const c = controls.current
        if (c) void c.zoomTo(c.camera.zoom * (dir > 0 ? 1.2 : 1 / 1.2), true)
      },
      rotate: (dir) => {
        void controls.current?.rotate((dir * Math.PI) / 8, 0, true)
      },
      focusAt: (at) => {
        const c = controls.current
        if (!c) return
        const pull = 0.62
        const [tx, ty, tz] = at
        const ex = tx + CAM_OFFSET[0] * pull
        const ey = ty + CAM_OFFSET[1] * pull
        const ez = tz + CAM_OFFSET[2] * pull
        void c.setLookAt(ex, ey, ez, tx, ty + 0.15, tz, true)
        void c.zoomTo(Math.min(fit * 1.55, 220), true)
      },
    }
  }, [fit, reset, viewRef])

  return (
    <CameraControls
      ref={controls}
      makeDefault
      minZoom={15}
      maxZoom={400}
      minPolarAngle={0.15}
      maxPolarAngle={1.4}
      smoothTime={0.35}
    />
  )
}

const projected = new Vector3()

function CalloutProjector({
  lessonId,
  elementsRef,
}: {
  lessonId: LessonId
  elementsRef: RefObject<(HTMLDivElement | null)[]>
}) {
  const { callouts, offsetX } = LESSON_SCENES[lessonId]
  useFrame(({ camera, size }) => {
    const els = elementsRef.current
    for (let i = 0; i < callouts.length; i++) {
      const el = els[i]
      if (!el) continue
      const [x, y, z] = callouts[i].at
      projected.set(x + offsetX, y, z).project(camera)
      const sx = ((projected.x + 1) / 2) * size.width
      const sy = ((1 - projected.y) / 2) * size.height
      el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`
      el.style.opacity = '1'
    }
  })
  return null
}

function ShadowCasters({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null)
  useLayoutEffect(() => {
    ref.current?.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh) {
        mesh.castShadow = true
        mesh.receiveShadow = true
      }
    })
  })
  return <group ref={ref}>{children}</group>
}

export default function Scene({ lessonId, outputs, inputs, setInput, viewRef, calloutsRef }: SceneProps) {
  const { extent } = LESSON_SCENES[lessonId]
  return (
    <Canvas
      orthographic
      shadows
      dpr={[1, 2]}
      camera={{ position: CAMERA_POS, zoom: 60, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: true }}
      className="touch-none"
    >
      <hemisphereLight args={['#ffffff', '#c3cbc0', 1.5]} />
      <directionalLight
        position={[4, 12, 7]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0005}
      />
      <directionalLight position={[-6, 5, -4]} intensity={0.6} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <shadowMaterial opacity={0.14} />
      </mesh>
      <ShadowCasters>
        <LessonCircuit lessonId={lessonId} outputs={outputs} inputs={inputs} setInput={setInput} />
      </ShadowCasters>
      <CalloutProjector lessonId={lessonId} elementsRef={calloutsRef} />
      <Controls extent={extent} viewRef={viewRef} />
    </Canvas>
  )
}
