import { Activity, Cpu, Gauge, Radio, Wifi, Zap } from 'lucide-react'
import { FILL_SPECS, buildFillLesson } from './advanced-fill'
import type { AdvancedLessonPackage, AdvancedStage } from './advanced-types'
import { HAND_ADVANCED_EN, applyHandDeep } from './i18n/advanced-hand-en'
import type { LessonId } from './lessons'

/**
 * Hand-authored lessons: English deep pack is the structural canonical content.
 * Locale overlays (zh-CN, …) live in i18n/advanced-hand-*.ts and are applied by getLocalizedAdvancedLesson.
 */
type HandShell = {
  id: keyof typeof HAND_ADVANCED_EN
  stageId: string
  sceneLessonId: LessonId
  tools: AdvancedLessonPackage['tools']
  complete?: boolean
}

function assembleHand(shell: HandShell): AdvancedLessonPackage {
  const deep = HAND_ADVANCED_EN[shell.id]
  if (!deep) throw new Error(`Missing HAND_ADVANCED_EN pack for ${shell.id}`)
  const base: AdvancedLessonPackage = {
    id: shell.id,
    stageId: shell.stageId,
    sceneLessonId: shell.sceneLessonId,
    tools: shell.tools,
    complete: shell.complete ?? true,
    title: deep.title,
    type: deep.type,
    goal: deep.goal,
    summary: deep.summary,
    description: deep.description,
    graph: deep.graph,
    faults: deep.faults,
    challenge: deep.challenge,
    quiz: deep.quiz,
    kit: deep.kit,
    rubric: deep.rubric,
  }
  return applyHandDeep(base, deep)
}

const HAND_SHELLS: HandShell[] = [
  { id: 'gpio-isr', stageId: 'core', sceneLessonId: 'button', tools: ['scope', 'serial', 'power'] },
  { id: 'adc-filter', stageId: 'core', sceneLessonId: 'pot', tools: ['scope', 'serial', 'power'] },
  { id: 'serial-log', stageId: 'core', sceneLessonId: 'board', tools: ['serial', 'scope', 'power'] },
  { id: 'open-wire', stageId: 'core', sceneLessonId: 'blink', tools: ['scope', 'serial', 'power'] },
  { id: 'crash-log', stageId: 'core', sceneLessonId: 'board', tools: ['serial', 'power'] },
  { id: 'sensor-node', stageId: 'core', sceneLessonId: 'dht', tools: ['scope', 'serial', 'power'] },
  { id: 'i2c-scan', stageId: 'sensors', sceneLessonId: 'oled', tools: ['scope', 'serial', 'power'] },
]

/** Fill lessons: English pack is canonical; zh/ja overlays via buildFillLesson(locale). */
const MORE: AdvancedLessonPackage[] = FILL_SPECS.map((spec) => buildFillLesson(spec, 'en'))

export const ADVANCED_PACKAGES: AdvancedLessonPackage[] = [...HAND_SHELLS.map(assembleHand), ...MORE]

const STAGE_LESSONS: Record<string, string[]> = {
  core: ['gpio-isr', 'adc-filter', 'serial-log', 'open-wire', 'crash-log', 'sensor-node'],
  protocols: ['wifi-reconnect', 'http-rest', 'mqtt-pubsub', 'websocket-ctrl', 'ble-service', 'packet-capture', 'smart-terminal'],
  realtime: ['freertos-tasks', 'dual-core', 'hw-timer', 'watchdog', 'ota', 'nvs', 'remote-device'],
  sensors: ['i2c-scan', 'spi-sample', 'sensor-sync', 'moving-avg', 'kalman', 'outlier', 'live-chart', 'env-station'],
  product: ['battery-pm', 'deep-sleep-power', 'enclosure', 'state-machine', 'config-ux', 'factory-test', 'portable-product'],
  projects: ['arch-split', 'cam-pipeline', 'edge-vision', 'cloud-alert', 'security-acl', 'release-rollback', 'capstone-cam'],
}

/** Stage chrome copy is localized via messages (stages.*); English here is fallback only. */
export const ADVANCED_STAGES: AdvancedStage[] = [
  { id: 'core', trackId: 'build', index: '01', title: 'Core skills', goal: 'Stable, debuggable firmware', project: 'Reliable sensor node', color: '#8c7851', icon: Cpu, lessonIds: STAGE_LESSONS.core },
  { id: 'protocols', trackId: 'engineering', index: '02', title: 'Protocols', goal: 'Connect phones, devices, and cloud', project: 'Phone-controlled smart terminal', color: '#f25042', icon: Wifi, lessonIds: STAGE_LESSONS.protocols },
  { id: 'realtime', trackId: 'engineering', index: '03', title: 'Realtime systems', goal: 'From running to staying up', project: 'OTA-ready IoT device', color: '#3870b8', icon: Activity, lessonIds: STAGE_LESSONS.realtime },
  { id: 'sensors', trackId: 'build', index: '04', title: 'Sensor fusion', goal: 'Turn data into useful information', project: 'Indoor environment station', color: '#3e8b68', icon: Gauge, lessonIds: STAGE_LESSONS.sensors },
  { id: 'product', trackId: 'product', index: '05', title: 'Product design', goal: 'Ship something deliverable', project: 'Battery-powered portable product', color: '#9b5a35', icon: Zap, lessonIds: STAGE_LESSONS.product },
  { id: 'projects', trackId: 'product', index: '06', title: 'Full projects', goal: 'Requirements through release', project: 'ESP32-CAM security camera', color: '#7352a4', icon: Radio, lessonIds: STAGE_LESSONS.projects },
]

export function getAdvancedLesson(id: string) {
  return ADVANCED_PACKAGES.find((lesson) => lesson.id === id)
}

export const ADVANCED_LESSONS = ADVANCED_STAGES[0].lessonIds.map((id) => getAdvancedLesson(id)!)
