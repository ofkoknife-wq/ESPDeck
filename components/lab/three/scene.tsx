'use client'

import { CameraControls, CameraControlsImpl } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { type RefObject, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { Vector3 } from 'three'
import type * as THREE from 'three'
import type { LessonId } from '@/lib/lessons'
import type { SimInputs, SimOutputs } from '@/lib/use-simulation'
import { LESSON_SCENES, LessonCircuit } from './circuits'
import { SelectionRing } from './parts'
import { truckGate } from './primitives'

export type FocusOpts = {
  /** Stronger pull-in + zoom for the “inspect” action. */
  inspect?: boolean
}

export type ViewApi = {
  reset: () => void
  zoom: (dir: 1 | -1) => void
  rotate: (dir: 1 | -1) => void
  /** Pan the orthographic view in screen space (positive x = right, positive y = up). */
  pan: (dx: number, dy: number) => void
  /** Animate camera to look at a world-space point (already includes scene offsetX). */
  focusAt: (at: [number, number, number], opts?: FocusOpts) => void
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
  setInput: <K extends keyof SimInputs>(key: K, value: SimInputs[K] | ((prev: SimInputs[K]) => SimInputs[K])) => void
  viewRef: RefObject<ViewApi | null>
  calloutsRef: RefObject<(HTMLDivElement | null)[]>
  focusTargetRef?: RefObject<[number, number, number] | null>
  focusElRef?: RefObject<HTMLDivElement | null>
  focusAt?: [number, number, number] | null
  onPickCallout?: (index: number) => void
  onPickBoardHotspot?: (id: string) => void
  selectedBoardHotspot?: string | null
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
    const c = controls.current
    if (!c) return
    // Drag = pan the board; right-drag / Q·E = rotate (like the reference lab).
    // Left truck is suppressed while hovering/clicking pickable parts.
    const A = CameraControlsImpl.ACTION
    const apply = () => {
      c.mouseButtons.left = truckGate.suppress ? A.NONE : A.TRUCK
      c.mouseButtons.right = A.ROTATE
      c.mouseButtons.middle = A.ZOOM
      c.mouseButtons.wheel = A.ZOOM
      c.touches.one = truckGate.suppress ? A.NONE : A.TOUCH_TRUCK
      c.touches.two = A.TOUCH_ZOOM_ROTATE
    }
    truckGate.apply = apply
    apply()
    return () => {
      if (truckGate.apply === apply) truckGate.apply = undefined
    }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const c = controls.current
      if (!c) return
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (event.target as HTMLElement | null)?.isContentEditable) return
      const step = event.shiftKey ? 1.2 : 0.55
      const key = event.key.toLowerCase()
      if (key === 'w' || key === 'arrowup') {
        event.preventDefault()
        void c.truck(0, step, true)
      } else if (key === 's' || key === 'arrowdown') {
        event.preventDefault()
        void c.truck(0, -step, true)
      } else if (key === 'a' || key === 'arrowleft') {
        event.preventDefault()
        void c.truck(-step, 0, true)
      } else if (key === 'd' || key === 'arrowright') {
        event.preventDefault()
        void c.truck(step, 0, true)
      } else if (key === 'q') {
        event.preventDefault()
        void c.rotate(Math.PI / 10, 0, true)
      } else if (key === 'e') {
        event.preventDefault()
        void c.rotate(-Math.PI / 10, 0, true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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
      pan: (dx, dy) => {
        void controls.current?.truck(dx, dy, true)
      },
      focusAt: (at, opts) => {
        const c = controls.current
        if (!c) return
        const inspect = Boolean(opts?.inspect)
        const pull = inspect ? 0.32 : 0.55
        const zoomMul = inspect ? 2.35 : 1.65
        const [tx, ty, tz] = at
        const ex = tx + CAM_OFFSET[0] * pull
        const ey = ty + CAM_OFFSET[1] * pull
        const ez = tz + CAM_OFFSET[2] * pull
        void c.setLookAt(ex, ey, ez, tx, ty + 0.12, tz, true)
        void c.zoomTo(Math.min(fit * zoomMul, inspect ? 320 : 240), true)
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

function FocusProjector({
  targetRef,
  elRef,
}: {
  targetRef: RefObject<[number, number, number] | null>
  elRef: RefObject<HTMLDivElement | null>
}) {
  useFrame(({ camera, size }) => {
    const el = elRef.current
    const at = targetRef.current
    if (!el) return
    if (!at) {
      el.style.opacity = '0'
      el.style.pointerEvents = 'none'
      return
    }
    projected.set(at[0], at[1], at[2]).project(camera)
    const sx = ((projected.x + 1) / 2) * size.width
    const sy = ((1 - projected.y) / 2) * size.height
    const behind = projected.z > 1
    el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`
    el.style.opacity = behind ? '0' : '1'
    el.style.pointerEvents = behind ? 'none' : 'auto'
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

export default function Scene({
  lessonId,
  outputs,
  inputs,
  setInput,
  viewRef,
  calloutsRef,
  focusTargetRef,
  focusElRef,
  focusAt = null,
  onPickCallout,
  onPickBoardHotspot,
  selectedBoardHotspot = null,
}: SceneProps) {
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
        <LessonCircuit
          lessonId={lessonId}
          outputs={outputs}
          inputs={inputs}
          setInput={setInput}
          onPickCallout={onPickCallout}
          onPickBoardHotspot={onPickBoardHotspot}
          selectedBoardHotspot={selectedBoardHotspot}
        />
      </ShadowCasters>
      <SelectionRing at={focusAt} />
      <CalloutProjector lessonId={lessonId} elementsRef={calloutsRef} />
      {focusTargetRef && focusElRef && <FocusProjector targetRef={focusTargetRef} elRef={focusElRef} />}
      <Controls extent={extent} viewRef={viewRef} />
    </Canvas>
  )
}
