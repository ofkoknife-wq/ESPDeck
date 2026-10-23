'use client'

import { BB_TOP, BOARD_X, PCB_TOP, type Vec3, hole, mid, pinPos, up } from '@/lib/geometry'
import type { LessonId } from '@/lib/lessons'
import type { SimInputs, SimOutputs } from '@/lib/use-simulation'
import { Esp32Board } from './board'
import { boardHotspotsAsCallouts } from './board-hotspots'
import { Breadboard } from './breadboard'
import {
  Buzzer,
  type CalloutSpec,
  Dht11,
  Led,
  PlantPot,
  Potentiometer,
  PushButton,
  Resistor,
  RgbLed,
  Servo,
  SoilOledDisplay,
  SoilProbe,
  TouchPad,
  Waves,
  WateringCan,
  OledDisplay,
  Wire
} from './parts'

const WIRE = {
  red: '#d63a2c',
  black: '#26292e',
  yellow: '#e6b422',
  orange: '#e8772e',
  green: '#2f9e5b',
  blue: '#2d6fd6',
  purple: '#8a5cc7',
  brown: '#7a4a2a'
}

type CircuitProps = {
  outputs: SimOutputs
  inputs: SimInputs
  setInput: <K extends keyof SimInputs>(key: K, value: SimInputs[K] | ((prev: SimInputs[K]) => SimInputs[K])) => void
  onPickCallout?: (index: number) => void
  onPickBoardHotspot?: (id: string) => void
  selectedBoardHotspot?: string | null
}

const LED_ANODE = hole(7, 1)
const LED_CATHODE = hole(8, 1)
const RES_A = hole(3, 3)
const RES_B = hole(7, 3)

function GroundRail() {
  return <Wire from={pinPos('R', 'GND', 1)} to={hole(0, 6)} color={WIRE.black} />
}

function LedCircuit({
  brightness,
  onPickLed,
  onPickRes
}: {
  brightness: number
  onPickLed?: () => void
  onPickRes?: () => void
}) {
  return (
    <group>
      <Wire from={pinPos('R', '2')} to={hole(3, 5)} color={WIRE.yellow} />
      <Resistor a={RES_A} b={RES_B} onPick={onPickRes} />
      <Led anode={LED_ANODE} cathode={LED_CATHODE} brightness={brightness} onPick={onPickLed} />
      <Wire from={hole(8, 4)} to={hole(8, 6)} color={WIRE.black} fromKind="hole" lift={0.25} />
      <GroundRail />
    </group>
  )
}

const LED_CALLOUTS: CalloutSpec[] = [
  { at: up(pinPos('R', '2'), 0.15), dx: 20, dy: 150, pickable: true },
  { at: up(mid(RES_A, RES_B), 0.25), dx: 30, dy: 130, pickable: true },
  { at: up(mid(LED_ANODE, LED_CATHODE), 0.95), dx: 40, dy: -120, pickable: true }
]

const GND_CALLOUT: CalloutSpec = {
  at: up(pinPos('R', 'GND', 1), 0.15),
  dx: 70,
  dy: 75,
  pickable: true,
}

const BOARD_CALLOUTS: CalloutSpec[] = boardHotspotsAsCallouts()

function BoardLesson({ outputs, onPickBoardHotspot, selectedBoardHotspot }: CircuitProps) {
  return (
    <Esp32Board
      onboard={outputs.onboard}
      selectedId={selectedBoardHotspot}
      onPickHotspot={onPickBoardHotspot}
    />
  )
}

function BlinkLesson({ outputs, onPickCallout }: CircuitProps) {
  // callouts: GPIO2, resistor, LED, GND
  return <LedCircuit brightness={outputs.led} onPickRes={() => onPickCallout?.(1)} onPickLed={() => onPickCallout?.(2)} />
}

const BUTTON_CENTER = hole(12, 1)
function ButtonLesson({ outputs, inputs, setInput, onPickCallout }: CircuitProps) {
  return (
    <group>
      <LedCircuit brightness={outputs.led} onPickLed={() => onPickCallout?.(0)} />
      <PushButton
        center={[BUTTON_CENTER[0], BB_TOP, 0]}
        pressed={inputs.button}
        onPress={(down) => setInput('button', down)}
        onPick={() => onPickCallout?.(2)}
      />
      <Wire from={pinPos('R', '4')} to={hole(11, 3)} color={WIRE.orange} />
      <Wire from={hole(13, 3)} to={hole(13, 6)} color={WIRE.black} fromKind="hole" lift={0.3} />
    </group>
  )
}

const POT_LEGS: [Vec3, Vec3, Vec3] = [hole(14, -2), hole(15, -2), hole(16, -2)]
function PotLesson({ outputs, inputs, setInput, onPickCallout }: CircuitProps) {
  return (
    <group>
      <LedCircuit brightness={outputs.led} onPickLed={() => onPickCallout?.(0)} />
      <Potentiometer
        legs={POT_LEGS}
        value={inputs.pot}
        onPick={() => onPickCallout?.(2)}
        onChange={(v) => setInput('pot', v)}
      />
      <Wire from={pinPos('L', '3V3')} to={hole(14, -4)} color={WIRE.red} />
      <Wire from={pinPos('L', '34')} to={hole(15, -4)} color={WIRE.green} />
      <Wire from={pinPos('L', 'GND')} to={hole(16, -4)} color={WIRE.black} />
    </group>
  )
}

const RGB_LEGS: [Vec3, Vec3, Vec3, Vec3] = [hole(12, 4), hole(13, 4), hole(14, 4), hole(15, 4)]
function RgbLesson({ outputs, onPickCallout }: CircuitProps) {
  return (
    <group>
      <Wire from={pinPos('L', '25')} to={hole(12, -4)} color={WIRE.red} />
      <Wire from={pinPos('L', '26')} to={hole(14, -4)} color={WIRE.green} />
      <Wire from={pinPos('L', '27')} to={hole(15, -4)} color={WIRE.blue} />
      <Resistor a={hole(12, -2)} b={hole(12, 2)} onPick={() => onPickCallout?.(2)} />
      <Resistor a={hole(14, -2)} b={hole(14, 2)} onPick={() => onPickCallout?.(2)} />
      <Resistor a={hole(15, -2)} b={hole(15, 2)} onPick={() => onPickCallout?.(2)} />
      <RgbLed legs={RGB_LEGS} rgb={outputs.rgb} onPick={() => onPickCallout?.(1)} />
      <Wire from={hole(13, 5)} to={hole(13, 6)} color={WIRE.black} fromKind="hole" lift={0.2} />
      <GroundRail />
    </group>
  )
}

const PAD_POS: Vec3 = [-2.0, 0, 3.0]
function TouchLesson({ outputs, inputs, setInput, onPickCallout }: CircuitProps) {
  return (
    <group>
      <LedCircuit brightness={outputs.led} onPickLed={() => onPickCallout?.(0)} />
      <TouchPad
        position={PAD_POS}
        touched={inputs.touch}
        onTouch={(d) => setInput('touch', d)}
        onPick={() => onPickCallout?.(2)}
      />
      <Wire
        from={pinPos('R', '4')}
        to={[PAD_POS[0] - 0.35, 0.12, PAD_POS[2] - 0.45]}
        color={WIRE.orange}
        toKind="free"
        lift={0.6}
      />
    </group>
  )
}

const DHT_LEGS: [Vec3, Vec3, Vec3] = [hole(15, 2), hole(16, 2), hole(17, 2)]
function DhtLesson({ outputs, onPickCallout }: CircuitProps) {
  return (
    <group>
      <LedCircuit brightness={outputs.led} onPickLed={() => onPickCallout?.(2)} />
      <Dht11 legs={DHT_LEGS} onPick={() => onPickCallout?.(0)} />
      <Wire from={pinPos('L', '3V3')} to={hole(15, 4)} color={WIRE.red} />
      <Wire from={pinPos('R', '4')} to={hole(16, 4)} color={WIRE.yellow} />
      <Wire from={pinPos('R', 'GND')} to={hole(17, 4)} color={WIRE.black} />
    </group>
  )
}

function BuzzerLesson({ outputs, onPickCallout }: CircuitProps) {
  return (
    <group>
      <Buzzer a={hole(13, 2)} b={hole(16, 2)} active={outputs.tone > 0} onPick={() => onPickCallout?.(0)} />
      <Wire from={pinPos('R', '18')} to={hole(13, 4)} color={WIRE.purple} />
      <Wire from={hole(16, 4)} to={hole(16, 6)} color={WIRE.black} fromKind="hole" lift={0.3} />
      <GroundRail />
    </group>
  )
}

const SERVO_POS: Vec3 = [2.8, 0, 0]
function ServoLesson({ outputs, onPickCallout }: CircuitProps) {
  const cable = (dz: number): Vec3 => [SERVO_POS[0] - 1.28, 0.45, SERVO_POS[2] + dz]
  return (
    <group>
      <Servo position={SERVO_POS} angle={outputs.servo} onPick={() => onPickCallout?.(0)} />
      <Wire from={pinPos('R', 'GND', 1)} to={cable(0.1)} color={WIRE.brown} toKind="free" />
      <Wire from={pinPos('L', '5V')} to={cable(0)} color={WIRE.red} toKind="free" />
      <Wire from={pinPos('R', '18')} to={cable(-0.1)} color={WIRE.orange} toKind="free" />
    </group>
  )
}

const ANTENNA_POS: Vec3 = [BOARD_X + 2.45, PCB_TOP + 0.15, 0]
function OledLesson({ outputs, onPickCallout }: CircuitProps) {
  const displayPos: Vec3 = [0, 0.85, -1.1]
  return (
    <group>
      <OledDisplay position={displayPos} text={outputs.oledText} onPick={() => onPickCallout?.(0)} />
      <Wire from={pinPos('L', '3V3')} to={[-1.0, 0, -2.0]} color={WIRE.red} toKind="free" />
      <Wire from={pinPos('R', 'GND')} to={[-0.35, 0, -2.0]} color={WIRE.black} toKind="free" />
      <Wire from={pinPos('R', '21')} to={[0.35, 0, -2.0]} color={WIRE.green} toKind="free" />
      <Wire from={pinPos('R', '22')} to={[1.0, 0, -2.0]} color={WIRE.blue} toKind="free" />
    </group>
  )
}

function LdrLesson({ outputs, inputs, setInput, onPickCallout }: CircuitProps) {
  return (
    <group>
      <LedCircuit brightness={outputs.led} onPickLed={() => onPickCallout?.(2)} />
      <Potentiometer
        legs={[hole(14, -2), hole(15, -2), hole(16, -2)]}
        value={inputs.pot}
        onPick={() => onPickCallout?.(1)}
        onChange={(v) => setInput('pot', v)}
      />
      <Wire from={pinPos('L', '3V3')} to={hole(14, -4)} color={WIRE.red} />
      <Wire from={pinPos('L', '34')} to={hole(15, -4)} color={WIRE.green} />
      <Wire from={pinPos('L', 'GND')} to={hole(16, -4)} color={WIRE.black} />
    </group>
  )
}

function UltrasonicLesson({ outputs, inputs, setInput, onPickCallout }: CircuitProps) {
  const distance = 2 + (inputs.pot / 4095) * 398
  return (
    <group>
      <Dht11 legs={[hole(14, 2), hole(15, 2), hole(16, 2)]} onPick={() => onPickCallout?.(0)} />
      <Wire from={pinPos('L', '5V')} to={hole(14, 4)} color={WIRE.red} />
      <Wire from={pinPos('R', '5')} to={hole(15, 4)} color={WIRE.yellow} />
      <Wire from={pinPos('R', '18')} to={hole(16, 4)} color={WIRE.blue} />
      <OledDisplay
        position={[0, 0.85, -1.1]}
        text={`${distance.toFixed(0)} cm`}
        onPick={() => onPickCallout?.(1)}
      />
      {outputs.oledText && <Waves position={[0, 1.0, -1.1]} active color="#2d6fd6" />}
    </group>
  )
}

function RelayLesson({ outputs, onPickCallout }: CircuitProps) {
  return (
    <group>
      <PushButton
        center={[0, BB_TOP, 0]}
        pressed={outputs.led > 0.5}
        onPress={() => undefined}
        onPick={() => onPickCallout?.(0)}
      />
      <Wire from={pinPos('R', '16')} to={hole(4, 1)} color={WIRE.orange} />
      <Wire from={pinPos('L', '5V')} to={hole(4, 3)} color={WIRE.red} />
      <Wire from={hole(4, 4)} to={hole(4, 6)} color={WIRE.black} fromKind="hole" lift={0.25} />
      <Led anode={hole(7, 1)} cathode={hole(8, 1)} brightness={outputs.led} onPick={() => onPickCallout?.(2)} />
    </group>
  )
}

function WifiLesson({ outputs, onPickCallout }: CircuitProps) {
  return (
    <group>
      <LedCircuit
        brightness={outputs.led}
        onPickRes={() => onPickCallout?.(1)}
        onPickLed={() => onPickCallout?.(2)}
      />
      <Waves position={ANTENNA_POS} active={outputs.wifi} color="#0e7c7b" />
    </group>
  )
}

function MotorLesson(props: CircuitProps) {
  return <ServoLesson {...props} />
}

function KeypadLesson({ outputs, inputs, setInput, onPickCallout }: CircuitProps) {
  // Reuses button mesh; remap ButtonLesson indices (0=LED, 2=btn) → keypad (2=LED, 0=keys).
  return (
    <ButtonLesson
      outputs={outputs}
      inputs={inputs}
      setInput={setInput}
      onPickCallout={(i) => {
        if (i === 0) onPickCallout?.(2)
        else if (i === 2) onPickCallout?.(0)
        else onPickCallout?.(i)
      }}
    />
  )
}

function SleepLesson(props: CircuitProps) {
  return <BoardLesson {...props} />
}

function BluetoothLesson({ outputs, onPickCallout }: CircuitProps) {
  return (
    <group>
      <LedCircuit
        brightness={outputs.led}
        onPickLed={() => onPickCallout?.(1)}
        onPickRes={() => onPickCallout?.(1)}
      />
      <Waves position={ANTENNA_POS} active={outputs.wifi} color="#2d6fd6" />
    </group>
  )
}

function NeopixelLesson({ outputs, onPickCallout }: CircuitProps) {
  return (
    <group>
      <RgbLed
        legs={[hole(11, 2), hole(12, 2), hole(13, 2), hole(14, 2)]}
        rgb={outputs.rgb}
        onPick={() => onPickCallout?.(0)}
      />
      <Wire from={pinPos('R', '23')} to={hole(11, 4)} color={WIRE.green} />
      <Wire from={pinPos('L', '5V')} to={hole(13, 4)} color={WIRE.red} />
      <Wire from={pinPos('R', 'GND')} to={hole(14, 4)} color={WIRE.black} />
    </group>
  )
}

function IrLesson({ outputs, onPickCallout }: CircuitProps) {
  return (
    <group>
      <LedCircuit brightness={outputs.led} onPickLed={() => onPickCallout?.(2)} />
      <TouchPad
        position={[-2, 0, -2.2]}
        touched={outputs.led > 0.5}
        onTouch={() => undefined}
        onPick={() => onPickCallout?.(0)}
      />
      <Wire from={pinPos('R', '27')} to={[-2, 0.1, -2.2]} color={WIRE.purple} toKind="free" lift={0.5} />
    </group>
  )
}

function FanLesson({ outputs, onPickCallout }: CircuitProps) {
  return (
    <group>
      <Servo position={[2.8, 0, 0]} angle={outputs.servo} onPick={() => onPickCallout?.(0)} />
      <Wire from={pinPos('L', '25')} to={[1.5, 0.45, 0]} color={WIRE.blue} toKind="free" />
      <Wire from={pinPos('R', 'GND', 1)} to={[1.2, 0.45, 0.4]} color={WIRE.black} toKind="free" />
      <LedCircuit brightness={outputs.onboard} onPickLed={() => onPickCallout?.(0)} />
    </group>
  )
}

function RtcLesson({ outputs, onPickCallout }: CircuitProps) {
  return (
    <group>
      <OledDisplay position={[0, 0.85, -1.1]} text={outputs.oledText} onPick={() => onPickCallout?.(0)} />
      <Waves position={ANTENNA_POS} active={outputs.wifi} color="#0e7c7b" />
      <Wire from={pinPos('R', 'GND', 1)} to={[-0.8, 0, -2]} color={WIRE.black} toKind="free" />
    </group>
  )
}

function PirLesson({ outputs, inputs, setInput, onPickCallout }: CircuitProps) {
  return (
    <group>
      <LedCircuit brightness={outputs.led} onPickLed={() => onPickCallout?.(2)} />
      <PushButton
        center={[2.5, BB_TOP, 0]}
        pressed={outputs.led > 0.5 || inputs.button}
        onPress={(down) => setInput('button', down)}
        onPick={() => onPickCallout?.(0)}
      />
      <Wire from={pinPos('R', '27')} to={[2.5, 0.35, 0]} color={WIRE.purple} toKind="free" />
    </group>
  )
}

function JoystickLesson({ outputs, inputs, setInput, onPickCallout }: CircuitProps) {
  return (
    <group>
      <OledDisplay position={[0, 0.85, -1.1]} text={outputs.oledText} onPick={() => onPickCallout?.(0)} />
      <PushButton
        center={[2.5, BB_TOP, 0]}
        pressed={inputs.button}
        onPress={(down) => setInput('button', down)}
        onPick={() => onPickCallout?.(0)}
      />
      <Wire from={pinPos('L', '34')} to={[-1.35, 0.2, -2.25]} color={WIRE.green} toKind="free" />
      <Wire from={pinPos('L', '35')} to={[-0.55, 0.2, -2.25]} color={WIRE.blue} toKind="free" />
    </group>
  )
}
/**
 * Soil lesson BOM (matches lesson-diagrams): ESP32 + capacitive soil + OLED.
 * Plant pot / watering can are interaction props on the floor — not breadboard clutter.
 */
const SOIL_OLED: Vec3 = [0.2, 0.95, -1.25]
const SOIL_POT: Vec3 = [2.15, 0, 2.35]
const SOIL_CAN: Vec3 = [3.95, 0, 2.55]

function SoilLesson({ outputs, inputs, setInput, onPickCallout }: CircuitProps) {
  const wetness = outputs.soilWetness || 0.42
  const wilt = outputs.soilWilt || 0
  const pct = outputs.soilMoisture
  const message = outputs.soilMessage

  return (
    <group>
      <SoilOledDisplay
        position={SOIL_OLED}
        pct={pct}
        message={message}
        onPick={() => onPickCallout?.(0)}
      />
      <PlantPot
        position={SOIL_POT}
        wetness={wetness}
        wilt={wilt}
        onPick={() => onPickCallout?.(3)}
      />
      <SoilProbe position={SOIL_POT} onPick={() => onPickCallout?.(1)} />
      <WateringCan
        position={SOIL_CAN}
        pouring={inputs.water}
        onHold={(down) => setInput('water', down)}
        onPick={() => onPickCallout?.(2)}
      />
      {/* Capacitive soil: VCC / GND / AOUT → probe header pins */}
      <Wire from={pinPos('L', '3V3')} to={[SOIL_POT[0] + 0.26, 1.42, SOIL_POT[2] + 0.05]} color={WIRE.red} toKind="free" lift={1.15} />
      <Wire from={pinPos('L', 'GND')} to={[SOIL_POT[0] + 0.38, 1.42, SOIL_POT[2] + 0.05]} color={WIRE.black} toKind="free" lift={1.05} />
      <Wire from={pinPos('L', '34')} to={[SOIL_POT[0] + 0.5, 1.42, SOIL_POT[2] + 0.05]} color={WIRE.yellow} toKind="free" lift={1.2} />
      {/* OLED I²C — free-standing beside the board */}
      <Wire from={pinPos('L', '3V3')} to={[SOIL_OLED[0] - 1.0, 0.15, SOIL_OLED[2] - 0.35]} color={WIRE.red} toKind="free" />
      <Wire from={pinPos('R', 'GND')} to={[SOIL_OLED[0] - 0.35, 0.15, SOIL_OLED[2] - 0.35]} color={WIRE.black} toKind="free" />
      <Wire from={pinPos('R', '21')} to={[SOIL_OLED[0] + 0.35, 0.15, SOIL_OLED[2] - 0.35]} color={WIRE.green} toKind="free" />
      <Wire from={pinPos('R', '22')} to={[SOIL_OLED[0] + 1.0, 0.15, SOIL_OLED[2] - 0.35]} color={WIRE.blue} toKind="free" />
    </group>
  )
}
function GasLesson({ outputs, onPickCallout }: CircuitProps) {
  return (
    <group>
      <LedCircuit brightness={outputs.led} onPickLed={() => onPickCallout?.(0)} />
      <Dht11 legs={[hole(14, 2), hole(15, 2), hole(16, 2)]} onPick={() => onPickCallout?.(0)} />
      <Wire from={pinPos('L', '34')} to={hole(15, 4)} color={WIRE.orange} />
      <Wire from={pinPos('L', '5V')} to={hole(14, 4)} color={WIRE.red} />
    </group>
  )
}
function ImuLesson({ outputs, onPickCallout }: CircuitProps) {
  return (
    <group>
      <OledDisplay
        position={[0, 0.85, -1.1]}
        text={`Tilt ${Math.round(outputs.servo - 90)}°`}
        onPick={() => onPickCallout?.(0)}
      />
      <Wire from={pinPos('R', '21')} to={[-1.25, 0, -2.25]} color={WIRE.green} toKind="free" />
      <Wire from={pinPos('R', '22')} to={[1.25, 0, -2.25]} color={WIRE.blue} toKind="free" />
    </group>
  )
}
function GpsLesson({ outputs, onPickCallout }: CircuitProps) {
  return (
    <group>
      <OledDisplay position={[0, 0.85, -1.1]} text={outputs.oledText} onPick={() => onPickCallout?.(0)} />
      <Waves position={ANTENNA_POS} active={outputs.wifi} color="#2d6fd6" />
    </group>
  )
}
function CameraLesson({ outputs, onPickCallout }: CircuitProps) {
  return (
    <group>
      <OledDisplay
        position={[0, 0.85, -1.1]}
        text={outputs.wifi ? 'CAM ONLINE' : 'CAM INIT'}
        onPick={() => onPickCallout?.(0)}
      />
      <Waves position={ANTENNA_POS} active={outputs.wifi} color="#0e7c7b" />
    </group>
  )
}
function LightstripLesson({ outputs, onPickCallout }: CircuitProps) {
  return (
    <group>
      <RgbLed
        legs={[hole(11, 2), hole(12, 2), hole(13, 2), hole(14, 2)]}
        rgb={outputs.rgb}
        onPick={() => onPickCallout?.(0)}
      />
      <Wire from={pinPos('R', '23')} to={hole(11, 4)} color={WIRE.green} />
    </group>
  )
}

type LessonScene = {
  Component: (p: CircuitProps) => React.ReactNode
  breadboard: boolean
  offsetX: number
  extent: number
  callouts: CalloutSpec[]
}

export const LESSON_SCENES: Record<LessonId, LessonScene> = {
  board: { Component: BoardLesson, breadboard: false, offsetX: -BOARD_X, extent: 10, callouts: BOARD_CALLOUTS },
  blink: { Component: BlinkLesson, breadboard: true, offsetX: 0, extent: 13, callouts: [...LED_CALLOUTS, GND_CALLOUT] },
  button: {
    Component: ButtonLesson,
    breadboard: true,
    offsetX: 0,
    extent: 13,
    callouts: [
      LED_CALLOUTS[2],
      { at: up(pinPos('R', '4'), 0.15), dx: -40, dy: 120, pickable: true },
      {
        at: [BUTTON_CENTER[0], BB_TOP + 0.6, 0],
        dx: 60,
        dy: -120,
        interactive: true,
        pickable: true,
        control: { kind: 'hold', inputKey: 'button', labelKey: 'sim.holdButton' }
      }
    ]
  },
  pot: {
    Component: PotLesson,
    breadboard: true,
    offsetX: 0,
    extent: 13,
    callouts: [
      LED_CALLOUTS[2],
      { at: up(pinPos('L', '34'), 0.15), dx: -60, dy: -110, pickable: true },
      {
        at: [POT_LEGS[1][0], BB_TOP + 0.9, POT_LEGS[1][2] - 0.12],
        dx: 60,
        dy: -110,
        interactive: true,
        pickable: true,
        control: { kind: 'slider', inputKey: 'pot', min: 0, max: 4095, labelKey: 'sim.pot', display: 'voltage' }
      }
    ]
  },
  rgb: {
    Component: RgbLesson,
    breadboard: true,
    offsetX: 0,
    extent: 13,
    callouts: [
      { at: up(pinPos('L', '26'), 0.15), dx: -60, dy: -110, pickable: true },
      { at: up(mid(RGB_LEGS[1], RGB_LEGS[2]), 1.0), dx: 60, dy: -110, pickable: true },
      { at: up(hole(14, 0), 0.25), dx: 70, dy: 120, pickable: true }
    ]
  },
  touch: {
    Component: TouchLesson,
    breadboard: true,
    offsetX: 0,
    extent: 13,
    callouts: [
      LED_CALLOUTS[2],
      { at: up(pinPos('R', '4'), 0.15), dx: -60, dy: -120, pickable: true },
      {
        at: [PAD_POS[0], 0.12, PAD_POS[2]],
        dx: 90,
        dy: 30,
        interactive: true,
        pickable: true,
        control: { kind: 'hold', inputKey: 'touch', labelKey: 'sim.touch' }
      }
    ]
  },
  dht: {
    Component: DhtLesson,
    breadboard: true,
    offsetX: 0,
    extent: 13,
    callouts: [
      {
        at: up(DHT_LEGS[1], 1.2),
        dx: 60,
        dy: -110,
        pickable: true,
        control: { kind: 'slider', inputKey: 'temp', min: 10, max: 40, step: 0.5, labelKey: 'sim.temp', display: 'temp' }
      },
      { at: up(pinPos('R', '4'), 0.15), dx: -40, dy: 120, pickable: true },
      { at: up(mid(LED_ANODE, LED_CATHODE), 0.95), dx: -40, dy: -120, pickable: true }
    ]
  },
  buzzer: {
    Component: BuzzerLesson,
    breadboard: true,
    offsetX: 0,
    extent: 13,
    callouts: [
      { at: up(mid(hole(13, 2), hole(16, 2)), 0.55), dx: 60, dy: -120, pickable: true },
      { at: up(pinPos('R', '18'), 0.15), dx: -40, dy: 120, pickable: true },
      GND_CALLOUT
    ]
  },
  servo: {
    Component: ServoLesson,
    breadboard: false,
    offsetX: 0,
    extent: 13,
    callouts: [
      { at: [SERVO_POS[0] + 0.6, 2.7, 0], dx: 60, dy: -110, pickable: true },
      { at: up(pinPos('R', '18'), 0.15), dx: -40, dy: 120, pickable: true },
      { at: up(pinPos('L', '5V'), 0.15), dx: 40, dy: -80, pickable: true }
    ]
  },
  oled: {
    Component: OledLesson,
    breadboard: false,
    offsetX: 0,
    extent: 13,
    callouts: [
      {
        at: [0, 1.15, -1.1],
        dx: 80,
        dy: -100,
        pickable: true,
        control: { kind: 'readout', readout: 'oled' }
      },
      { at: up(pinPos('R', '21'), 0.15), dx: -60, dy: 110 },
      { at: up(pinPos('R', '22'), 0.15), dx: 80, dy: 120 }
    ]
  },
  ldr: {
    Component: LdrLesson,
    breadboard: true,
    offsetX: 0,
    extent: 13,
    callouts: [
      { at: up(pinPos('L', '34'), 0.15), dx: -60, dy: -110, pickable: true },
      {
        at: up(hole(15, -2), 0.9),
        dx: 70,
        dy: -100,
        interactive: true,
        pickable: true,
        control: { kind: 'slider', inputKey: 'pot', min: 0, max: 4095, labelKey: 'sim.pot', display: 'voltage' }
      },
      LED_CALLOUTS[2]
    ]
  },
  ultrasonic: {
    Component: UltrasonicLesson,
    breadboard: true,
    offsetX: 0,
    extent: 13,
    callouts: [
      { at: up(hole(15, 2), 1.1), dx: 70, dy: -120, pickable: true },
      {
        at: [0, 1.15, -1.1],
        dx: 90,
        dy: 70,
        interactive: true,
        pickable: true,
        control: { kind: 'slider', inputKey: 'pot', min: 0, max: 4095, labelKey: 'sim.pot', display: 'raw' }
      },
      { at: up(pinPos('R', '5'), 0.15), dx: -60, dy: 110, pickable: true }
    ]
  },
  relay: {
    Component: RelayLesson,
    breadboard: true,
    offsetX: 0,
    extent: 13,
    callouts: [
      { at: up(hole(4, 3), 0.8), dx: 80, dy: -110, pickable: true },
      { at: up(pinPos('R', '16'), 0.15), dx: -60, dy: 120, pickable: true },
      { at: up(hole(7, 1), 0.8), dx: 80, dy: 100, pickable: true }
    ]
  },
  wifi: {
    Component: WifiLesson,
    breadboard: true,
    offsetX: 0,
    extent: 13,
    callouts: [
      { at: ANTENNA_POS, dx: -20, dy: -140, pickable: true },
      LED_CALLOUTS[0],
      LED_CALLOUTS[2]
    ]
  },
  motor: {
    Component: MotorLesson,
    breadboard: false,
    offsetX: 0,
    extent: 13,
    callouts: [
      { at: [SERVO_POS[0] + 0.6, 2.7, 0], dx: 70, dy: -110, pickable: true },
      { at: up(pinPos('R', '18'), 0.15), dx: -50, dy: 120, pickable: true },
      { at: up(pinPos('L', '25'), 0.15), dx: 70, dy: 100, pickable: true }
    ]
  },
  keypad: {
    Component: KeypadLesson,
    breadboard: true,
    offsetX: 0,
    extent: 13,
    callouts: [
      {
        at: [BUTTON_CENTER[0], BB_TOP + 0.6, 0],
        dx: 70,
        dy: -120,
        interactive: true,
        pickable: true,
        control: { kind: 'hold', inputKey: 'button', labelKey: 'sim.holdButton' }
      },
      { at: up(pinPos('R', '16'), 0.15), dx: -50, dy: 120, pickable: true },
      LED_CALLOUTS[2]
    ]
  },
  sleep: {
    Component: SleepLesson,
    breadboard: false,
    offsetX: -BOARD_X,
    extent: 10,
    callouts: [
      { at: [BOARD_X - 1.3, PCB_TOP + 0.1, 0.82], dx: 50, dy: 140, pickable: true },
      { at: up(pinPos('R', '33'), 0.15), dx: 80, dy: -110, pickable: true }
    ]
  },
  bluetooth: {
    Component: BluetoothLesson,
    breadboard: true,
    offsetX: 0,
    extent: 13,
    callouts: [
      { at: ANTENNA_POS, dx: 60, dy: -120, pickable: true },
      LED_CALLOUTS[2],
      { at: up(pinPos('R', '2'), 0.15), dx: -50, dy: 120, pickable: true }
    ]
  },
  neopixel: {
    Component: NeopixelLesson,
    breadboard: true,
    offsetX: 0,
    extent: 13,
    callouts: [
      { at: up(hole(12, 2), 0.9), dx: 70, dy: -120, pickable: true },
      { at: up(pinPos('R', '23'), 0.15), dx: -60, dy: 110, pickable: true },
      { at: up(pinPos('L', '5V'), 0.15), dx: 70, dy: 100, pickable: true }
    ]
  },
  ir: {
    Component: IrLesson,
    breadboard: true,
    offsetX: 0,
    extent: 13,
    callouts: [
      {
        at: [-2, 0.4, -2.2],
        dx: 90,
        dy: -80,
        interactive: true,
        pickable: true
      },
      { at: up(pinPos('R', '27'), 0.15), dx: -60, dy: 110, pickable: true },
      LED_CALLOUTS[2]
    ]
  },
  fan: {
    Component: FanLesson,
    breadboard: false,
    offsetX: 0,
    extent: 13,
    callouts: [
      { at: [2.8, 1.3, 0], dx: 80, dy: -120, pickable: true },
      { at: up(pinPos('L', '25'), 0.15), dx: -60, dy: 110, pickable: true },
      { at: up(pinPos('R', 'GND', 1), 0.15), dx: 70, dy: 100, pickable: true }
    ]
  },
  rtc: {
    Component: RtcLesson,
    breadboard: false,
    offsetX: 0,
    extent: 13,
    callouts: [
      { at: [0, 1.15, -1.1], dx: 80, dy: -100, pickable: true },
      { at: ANTENNA_POS, dx: 60, dy: 110, pickable: true }
    ]
  },
  pir: {
    Component: PirLesson,
    breadboard: true,
    offsetX: 0,
    extent: 13,
    callouts: [
      {
        at: [2.5, BB_TOP + 0.6, 0],
        dx: 80,
        dy: -120,
        interactive: true,
        pickable: true,
        control: { kind: 'hold', inputKey: 'button', labelKey: 'sim.holdButton' }
      },
      { at: up(pinPos('R', '27'), 0.15), dx: -60, dy: 110, pickable: true },
      LED_CALLOUTS[2]
    ]
  },
  joystick: {
    Component: JoystickLesson,
    breadboard: true,
    offsetX: 0,
    extent: 13,
    callouts: [{ at: [0, 1.15, -1.1], dx: 80, dy: -100, pickable: true }]
  },
  soil: {
    Component: SoilLesson,
    breadboard: false,
    offsetX: 0,
    extent: 15,
    callouts: [
      {
        at: [SOIL_OLED[0], 1.25, SOIL_OLED[2]],
        dx: 80,
        dy: -100,
        icon: 'screen',
        pickable: true,
        controls: [
          {
            kind: 'slider',
            inputKey: 'thirsty',
            min: 10,
            max: 50,
            step: 5,
            labelKey: 'sim.soil.thirsty',
            unit: '%',
            display: 'percent'
          },
          {
            kind: 'slider',
            inputKey: 'soggy',
            min: 60,
            max: 95,
            step: 5,
            labelKey: 'sim.soil.soggy',
            unit: '%',
            display: 'percent'
          },
          { kind: 'readout', readout: 'moisture' }
        ]
      },
      {
        at: [SOIL_POT[0] + 0.32, 1.25, SOIL_POT[2]],
        dx: 90,
        dy: -100,
        icon: 'drop',
        interactive: true,
        pickable: true,
        controls: [
          {
            kind: 'slider',
            inputKey: 'soilDry',
            min: 400,
            max: 700,
            step: 10,
            labelKey: 'sim.soil.dryReading',
            display: 'raw'
          },
          {
            kind: 'slider',
            inputKey: 'soilWet',
            min: 150,
            max: 400,
            step: 10,
            labelKey: 'sim.soil.wetReading',
            display: 'raw'
          },
          { kind: 'readout', readout: 'soilRaw' }
        ]
      },
      {
        at: [SOIL_CAN[0], 0.9, SOIL_CAN[2]],
        dx: 80,
        dy: -90,
        icon: 'can',
        interactive: true,
        pickable: true,
        control: { kind: 'hold', inputKey: 'water', labelKey: 'sim.holdWater' }
      },
      {
        at: [SOIL_POT[0], 1.55, SOIL_POT[2]],
        dx: -100,
        dy: -80,
        icon: 'plant',
        pickable: true,
        controls: [
          {
            kind: 'choice',
            inputKey: 'sun',
            labelKey: 'sim.soil.sun',
            options: [
              { value: 'shade', labelKey: 'sim.soil.shade', noteKey: 'sim.soil.shadeNote' },
              { value: 'window', labelKey: 'sim.soil.window', noteKey: 'sim.soil.windowNote' },
              { value: 'sun', labelKey: 'sim.soil.fullSun', noteKey: 'sim.soil.fullSunNote' }
            ]
          }
        ]
      },
      {
        at: up(pinPos('L', '34'), 0.15),
        dx: -60,
        dy: 110,
        icon: 'wave',
        pickable: true
      }
    ]
  },
  gas: {
    Component: GasLesson,
    breadboard: true,
    offsetX: 0,
    extent: 13,
    callouts: [{ at: up(hole(15, 2), 1.1), dx: 70, dy: -110, pickable: true }]
  },
  imu: {
    Component: ImuLesson,
    breadboard: false,
    offsetX: 0,
    extent: 13,
    callouts: [{ at: [0, 1.15, -1.1], dx: 80, dy: -100, pickable: true }]
  },
  gps: {
    Component: GpsLesson,
    breadboard: false,
    offsetX: 0,
    extent: 13,
    callouts: [{ at: [0, 1.15, -1.1], dx: 80, dy: -100, pickable: true }]
  },
  camera: {
    Component: CameraLesson,
    breadboard: false,
    offsetX: 0,
    extent: 13,
    callouts: [{ at: ANTENNA_POS, dx: 70, dy: -110, pickable: true }]
  },
  lightstrip: {
    Component: LightstripLesson,
    breadboard: true,
    offsetX: 0,
    extent: 13,
    callouts: [{ at: up(hole(12, 2), 0.9), dx: 70, dy: -110, pickable: true }]
  }
}

export function LessonCircuit({ lessonId, ...props }: CircuitProps & { lessonId: LessonId }) {
  const scene = LESSON_SCENES[lessonId]
  const { Component } = scene
  return (
    <group position={[scene.offsetX, 0, 0]}>
      {lessonId !== 'board' && (
        <Esp32Board
          onboard={props.outputs.onboard}
          selectedId={props.selectedBoardHotspot}
          onPickHotspot={props.onPickBoardHotspot}
        />
      )}
      {scene.breadboard && <Breadboard />}
      <Component {...props} />
    </group>
  )
}
