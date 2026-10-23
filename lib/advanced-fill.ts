import type { AdvancedLessonPackage, CircuitGraph, Fault, QuizQuestion } from './advanced-types'
import type { LessonId } from './lessons'
import type { Locale } from './i18n/config'

const MCU = { id: 'mcu', kind: 'mcu' as const, label: 'ESP32', value: 'DevKitC', x: 80, y: 150 }

export type FillKind = 'wifi' | 'ble' | 'sleep' | 'bus' | 'filter' | 'rtos' | 'cam' | 'product'

export type FillSpec = {
  id: string
  stageId: string
  sceneLessonId: LessonId
  kind: FillKind
  zh: { title: string; type: string; goal: string; extra: string }
  en: { title: string; type: string; goal: string; extra: string }
}

type Lang = 'zh' | 'en'

function langOf(locale: Locale): Lang {
  return locale === 'zh-CN' ? 'zh' : 'en'
}

function kit(lang: Lang) {
  if (lang === 'en') {
    return {
      bom: [
        { item: 'ESP32-DevKitC', qty: 1, note: '3.3V logic' },
        { item: 'USB data cable', qty: 1, note: 'Must transfer data' },
      ],
      safety: ['Power off before rewiring', 'Never connect mains to the lab circuit', 'Do not feed 5V into a GPIO'],
      analogToReal: [
        'Simulation is ideal; real boards have contact issues, antenna, and supply ripple',
        'Pass the sim first, then buy from the BOM',
      ],
    }
  }
  return {
    bom: [
      { item: 'ESP32-DevKitC', qty: 1, note: '3.3V 逻辑' },
      { item: 'USB 数据线', qty: 1, note: '必须能传数据' },
    ],
    safety: ['先断电再改线', '禁止把市电接到实验电路', 'GPIO 不要直接灌 5V'],
    analogToReal: ['仿真是理想波形；真机要考虑接触不良、天线和供电纹波', '先在本课跑通，再对照 BOM 采购'],
  }
}

function graphFor(kind: FillKind, extra: string, lang: Lang): CircuitGraph {
  const L =
    lang === 'en'
      ? {
          bleAnt: 'BLE antenna',
          wifiAnt: 'Wi-Fi antenna',
          statusLed: 'Status LED',
          battery: 'Battery',
          indicator: 'Indicator',
          peripheral: 'Peripheral',
        }
      : {
          bleAnt: 'BLE 天线',
          wifiAnt: 'Wi-Fi 天线',
          statusLed: '状态 LED',
          battery: '电池',
          indicator: '指示',
          peripheral: '外设',
        }

  if (kind === 'wifi' || kind === 'ble') {
    return {
      parts: [
        MCU,
        { id: 'ant', kind: 'device', label: kind === 'ble' ? L.bleAnt : L.wifiAnt, value: '2.4GHz', x: 420, y: 80 },
        { id: 'led', kind: 'led', label: L.statusLed, x: 420, y: 220 },
      ],
      nets: [
        { id: 'rf', label: 'RF', from: 'mcu', to: 'ant', color: '#3870b8' },
        { id: 'led', label: 'GPIO2', from: 'mcu', to: 'led', color: '#e6b422' },
      ],
    }
  }
  if (kind === 'sleep') {
    return {
      parts: [
        MCU,
        { id: 'bat', kind: 'device', label: L.battery, value: '3.7V Li', x: 420, y: 70 },
        { id: 'dht', kind: 'dht', label: extra, x: 420, y: 210 },
      ],
      nets: [
        { id: 'vbat', label: 'VBAT', from: 'mcu', to: 'bat', color: '#d63a2c' },
        { id: 'data', label: 'GPIO4', from: 'mcu', to: 'dht', color: '#e6b422' },
      ],
    }
  }
  if (kind === 'filter' || kind === 'bus') {
    return {
      parts: [
        MCU,
        { id: 'sensor', kind: kind === 'bus' ? 'device' : 'pot', label: extra, x: 430, y: 90 },
        { id: 'oled', kind: 'oled', label: 'OLED', value: '0x3C', x: 430, y: 230 },
      ],
      nets: [
        { id: 'sig', label: kind === 'bus' ? 'SPI/I2C' : 'GPIO34', from: 'mcu', to: 'sensor', color: '#2f9e5b' },
        { id: 'sda', label: 'SDA 21', from: 'mcu', to: 'oled', color: '#2d6fd6' },
      ],
    }
  }
  if (kind === 'cam') {
    return {
      parts: [
        MCU,
        { id: 'cam', kind: 'device', label: 'OV2640', x: 430, y: 80 },
        { id: 'ant', kind: 'device', label: 'Wi-Fi', x: 430, y: 220 },
      ],
      nets: [
        { id: 'dvp', label: 'DVP/CSI', from: 'mcu', to: 'cam', color: '#7352a4' },
        { id: 'rf', label: 'RF', from: 'mcu', to: 'ant', color: '#3870b8' },
      ],
    }
  }
  return {
    parts: [
      MCU,
      { id: 'usb', kind: 'usb', label: extra || L.peripheral, x: 430, y: 90 },
      { id: 'led', kind: 'led', label: L.indicator, x: 430, y: 230 },
    ],
    nets: [
      { id: 'io', label: 'GPIO', from: 'mcu', to: 'usb', color: '#3870b8' },
      { id: 'led', label: 'GPIO2', from: 'mcu', to: 'led', color: '#e6b422' },
    ],
  }
}

function faultsFor(kind: FillKind, lang: Lang): Fault[] {
  if (lang === 'en') {
    if (kind === 'wifi' || kind === 'ble') {
      return [
        { id: 'rf-open', title: 'Antenna not connected', kind: 'open', netId: 'rf', symptoms: ['Cannot join network', 'Very poor RSSI'], passBy: 'click-net' },
        { id: 'no-retry', title: 'No reconnect logic', kind: 'wrong-value', symptoms: ['Hangs after disconnect'], passBy: 'code' },
      ]
    }
    if (kind === 'sleep') {
      return [
        { id: 'vbat-open', title: 'Battery path open', kind: 'open', netId: 'vbat', symptoms: ['Drops on power-up', 'Current jumps'], passBy: 'click-net' },
        { id: 'no-sleep', title: 'Never enters sleep', kind: 'wrong-value', symptoms: ['Power stuck at 40mA+'], passBy: 'code' },
      ]
    }
    if (kind === 'filter' || kind === 'bus') {
      return [
        { id: 'sig-open', title: 'Signal wire loose', kind: 'open', netId: 'sig', symptoms: ['Readings NaN or pure noise'], passBy: 'click-net' },
        { id: 'no-filter', title: 'No processing', kind: 'wrong-value', symptoms: ['Spiky curve, false alarms'], passBy: 'code' },
      ]
    }
    if (kind === 'cam') {
      return [
        { id: 'dvp-open', title: 'Camera flex loose', kind: 'open', netId: 'dvp', symptoms: ['Init fails'], passBy: 'click-net' },
        { id: 'no-stream', title: 'No streaming code', kind: 'wrong-value', symptoms: ['Blank web page'], passBy: 'code' },
      ]
    }
    return [
      { id: 'io-open', title: 'Key wire open', kind: 'open', netId: 'io', symptoms: ['Peripheral unresponsive'], passBy: 'click-net' },
      { id: 'missing-api', title: 'Missing key API', kind: 'wrong-value', symptoms: ['Serial missing expected logs'], passBy: 'code' },
    ]
  }
  if (kind === 'wifi' || kind === 'ble') {
    return [
      { id: 'rf-open', title: '天线未接好', kind: 'open', netId: 'rf', symptoms: ['连不上网', 'RSSI 极差'], passBy: 'click-net' },
      { id: 'no-retry', title: '没有重连逻辑', kind: 'wrong-value', symptoms: ['掉线后死等'], passBy: 'code' },
    ]
  }
  if (kind === 'sleep') {
    return [
      { id: 'vbat-open', title: '电池回路开路', kind: 'open', netId: 'vbat', symptoms: ['上电即掉', '电流乱跳'], passBy: 'click-net' },
      { id: 'no-sleep', title: '没有进入睡眠', kind: 'wrong-value', symptoms: ['功耗停在 40mA+'], passBy: 'code' },
    ]
  }
  if (kind === 'filter' || kind === 'bus') {
    return [
      { id: 'sig-open', title: '信号线脱落', kind: 'open', netId: 'sig', symptoms: ['读数 nan 或全是噪声'], passBy: 'click-net' },
      { id: 'no-filter', title: '未做处理', kind: 'wrong-value', symptoms: ['曲线毛刺、误报警'], passBy: 'code' },
    ]
  }
  if (kind === 'cam') {
    return [
      { id: 'dvp-open', title: '摄像头排线松', kind: 'open', netId: 'dvp', symptoms: ['初始化失败'], passBy: 'click-net' },
      { id: 'no-stream', title: '没有出流代码', kind: 'wrong-value', symptoms: ['网页空白'], passBy: 'code' },
    ]
  }
  return [
    { id: 'io-open', title: '关键线开路', kind: 'open', netId: 'io', symptoms: ['外设无响应'], passBy: 'click-net' },
    { id: 'missing-api', title: '关键 API 缺失', kind: 'wrong-value', symptoms: ['串口没有预期日志'], passBy: 'code' },
  ]
}

type ApiPack = {
  skeleton: string
  tests: { name: string; includes?: string[]; regex?: string }[]
  holes: { id: string; hint: string }[]
  solution: string
  guide: { title: string; body: string }[]
}

function apiFor(kind: FillKind, lang: Lang): ApiPack {
  const packs: Record<FillKind, { zh: ApiPack; en: ApiPack }> = {
    wifi: {
      zh: {
        skeleton: `void setup() {\n  Serial.begin(115200);\n  // TODO: WiFi.begin 并在断开时重连\n}\nvoid loop() {\n  delay(500);\n}`,
        tests: [
          { name: '连接 Wi-Fi', includes: ['WiFi.begin'] },
          { name: '处理断线', regex: 'WL_CONNECTED|reconnect' },
        ],
        holes: [{ id: 'wifi', hint: 'WiFi.begin(ssid, pass); 判断 WL_CONNECTED' }],
        solution: `#include <WiFi.h>\nconst char* ssid = "demo";\nconst char* pass = "password";\n\nvoid ensureWifi() {\n  if (WiFi.status() == WL_CONNECTED) return;\n  WiFi.begin(ssid, pass);\n  for (int i = 0; i < 20 && WiFi.status() != WL_CONNECTED; i++) delay(250);\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  ensureWifi();\n}\nvoid loop() {\n  ensureWifi();\n  delay(500);\n}`,
        guide: [
          { title: '放哪里', body: '在 setup 里首次连接；在 loop 里定期检查 WiFi.status()。' },
          { title: '写什么', body: '调用 WiFi.begin(ssid, pass)，用 WL_CONNECTED 判断是否成功，失败则限频重连。' },
        ],
      },
      en: {
        skeleton: `void setup() {\n  Serial.begin(115200);\n  // TODO: WiFi.begin and reconnect on drop\n}\nvoid loop() {\n  delay(500);\n}`,
        tests: [
          { name: 'Join Wi-Fi', includes: ['WiFi.begin'] },
          { name: 'Handle disconnect', regex: 'WL_CONNECTED|reconnect' },
        ],
        holes: [{ id: 'wifi', hint: 'WiFi.begin(ssid, pass); check WL_CONNECTED' }],
        solution: `#include <WiFi.h>\nconst char* ssid = "demo";\nconst char* pass = "password";\n\nvoid ensureWifi() {\n  if (WiFi.status() == WL_CONNECTED) return;\n  WiFi.begin(ssid, pass);\n  for (int i = 0; i < 20 && WiFi.status() != WL_CONNECTED; i++) delay(250);\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  ensureWifi();\n}\nvoid loop() {\n  ensureWifi();\n  delay(500);\n}`,
        guide: [
          { title: 'Where', body: 'Connect once in setup; poll WiFi.status() in loop.' },
          { title: 'What', body: 'Call WiFi.begin(ssid, pass), treat WL_CONNECTED as success, reconnect with backoff.' },
        ],
      },
    },
    ble: {
      zh: {
        skeleton: `void setup() {\n  Serial.begin(115200);\n  // TODO: 启动 BLE 并设置设备名\n}\nvoid loop() { delay(200); }`,
        tests: [
          { name: '启动 BLE', regex: 'BLE|Bluetooth' },
          { name: '设备名', regex: 'begin\\(|setName|ESP32' },
        ],
        holes: [{ id: 'ble', hint: 'SerialBT.begin("ESP32-LAB") 或 BLEDevice::init' }],
        solution: `#include "BluetoothSerial.h"\nBluetoothSerial SerialBT;\n\nvoid setup() {\n  Serial.begin(115200);\n  SerialBT.begin("ESP32-LAB");\n}\nvoid loop() { delay(200); }`,
        guide: [
          { title: '放哪里', body: '在 setup 里启动一次即可，loop 保持空闲或处理收发。' },
          { title: '写什么', body: 'SerialBT.begin("设备名")，手机端就能搜到 ESP32-LAB。' },
        ],
      },
      en: {
        skeleton: `void setup() {\n  Serial.begin(115200);\n  // TODO: start BLE and set the device name\n}\nvoid loop() { delay(200); }`,
        tests: [
          { name: 'Start BLE', regex: 'BLE|Bluetooth' },
          { name: 'Device name', regex: 'begin\\(|setName|ESP32' },
        ],
        holes: [{ id: 'ble', hint: 'SerialBT.begin("ESP32-LAB") or BLEDevice::init' }],
        solution: `#include "BluetoothSerial.h"\nBluetoothSerial SerialBT;\n\nvoid setup() {\n  Serial.begin(115200);\n  SerialBT.begin("ESP32-LAB");\n}\nvoid loop() { delay(200); }`,
        guide: [
          { title: 'Where', body: 'Start once in setup; loop idles or handles RX/TX.' },
          { title: 'What', body: 'SerialBT.begin("name") so phones can find ESP32-LAB.' },
        ],
      },
    },
    sleep: {
      zh: {
        skeleton: `void setup() {\n  Serial.begin(115200);\n  // TODO: 定时唤醒并 deep sleep\n}\nvoid loop() {}`,
        tests: [
          { name: '配置唤醒', regex: 'esp_sleep_enable_timer_wakeup|enableWakeup' },
          { name: '进入睡眠', regex: 'esp_deep_sleep_start|deepSleep' },
        ],
        holes: [{ id: 'sleep', hint: 'esp_sleep_enable_timer_wakeup(...); esp_deep_sleep_start();' }],
        solution: `void setup() {\n  Serial.begin(115200);\n  delay(100);\n  esp_sleep_enable_timer_wakeup(10ULL * 1000000ULL);\n  Serial.println("sleep");\n  esp_deep_sleep_start();\n}\nvoid loop() {}`,
        guide: [
          { title: '放哪里', body: '全部写在 setup：配好唤醒源后立刻 deep sleep，loop 通常到不了。' },
          { title: '写什么', body: 'esp_sleep_enable_timer_wakeup(微秒) 后调用 esp_deep_sleep_start()。' },
        ],
      },
      en: {
        skeleton: `void setup() {\n  Serial.begin(115200);\n  // TODO: timer wake + deep sleep\n}\nvoid loop() {}`,
        tests: [
          { name: 'Configure wake', regex: 'esp_sleep_enable_timer_wakeup|enableWakeup' },
          { name: 'Enter sleep', regex: 'esp_deep_sleep_start|deepSleep' },
        ],
        holes: [{ id: 'sleep', hint: 'esp_sleep_enable_timer_wakeup(...); esp_deep_sleep_start();' }],
        solution: `void setup() {\n  Serial.begin(115200);\n  delay(100);\n  esp_sleep_enable_timer_wakeup(10ULL * 1000000ULL);\n  Serial.println("sleep");\n  esp_deep_sleep_start();\n}\nvoid loop() {}`,
        guide: [
          { title: 'Where', body: 'All in setup: configure wake, then deep sleep—loop rarely runs.' },
          { title: 'What', body: 'esp_sleep_enable_timer_wakeup(us) then esp_deep_sleep_start().' },
        ],
      },
    },
    bus: {
      zh: {
        skeleton: `void setup() {\n  Serial.begin(115200);\n  // TODO: 初始化总线\n}\nvoid loop() {\n  // TODO: 读取传感器\n  delay(200);\n}`,
        tests: [
          { name: '初始化总线', regex: 'SPI\\.begin|Wire\\.begin|SPI.begin' },
          { name: '读取数据', regex: 'transfer|read|analogRead' },
        ],
        holes: [{ id: 'bus', hint: 'SPI.begin() 或 Wire.begin(21,22) 后读取' }],
        solution: `#include <Wire.h>\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin(21, 22);\n}\nvoid loop() {\n  Wire.requestFrom(0x3C, 1);\n  if (Wire.available()) Serial.println(Wire.read());\n  delay(200);\n}`,
        guide: [
          { title: '放哪里', body: '总线 begin 写在 setup；周期性 read / transfer 写在 loop。' },
          { title: '写什么', body: 'Wire.begin(SDA, SCL) 或 SPI.begin()，再按器件手册读寄存器。' },
        ],
      },
      en: {
        skeleton: `void setup() {\n  Serial.begin(115200);\n  // TODO: init the bus\n}\nvoid loop() {\n  // TODO: read the sensor\n  delay(200);\n}`,
        tests: [
          { name: 'Init bus', regex: 'SPI\\.begin|Wire\\.begin|SPI.begin' },
          { name: 'Read data', regex: 'transfer|read|analogRead' },
        ],
        holes: [{ id: 'bus', hint: 'SPI.begin() or Wire.begin(21,22) then read' }],
        solution: `#include <Wire.h>\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin(21, 22);\n}\nvoid loop() {\n  Wire.requestFrom(0x3C, 1);\n  if (Wire.available()) Serial.println(Wire.read());\n  delay(200);\n}`,
        guide: [
          { title: 'Where', body: 'Bus begin in setup; periodic read/transfer in loop.' },
          { title: 'What', body: 'Wire.begin(SDA, SCL) or SPI.begin(), then read registers per the datasheet.' },
        ],
      },
    },
    filter: {
      zh: {
        skeleton: `int avg = 0;\nvoid setup() { Serial.begin(115200); }\nvoid loop() {\n  int raw = analogRead(34);\n  // TODO: 平均或中值滤波\n  delay(50);\n}`,
        tests: [
          { name: '采样', includes: ['analogRead'] },
          { name: '滤波', regex: 'avg|median|filter|kalman' },
        ],
        holes: [{ id: 'avg', hint: 'avg = (avg * 7 + raw) / 8;' }],
        solution: `int avg = 0;\nvoid setup() { Serial.begin(115200); }\nvoid loop() {\n  int raw = analogRead(34);\n  avg = (avg * 7 + raw) / 8;\n  Serial.println(avg);\n  delay(50);\n}`,
        guide: [
          { title: '放哪里', body: '在 loop 里、analogRead 之后立刻做滤波。' },
          { title: '写什么', body: '用滑动平均 avg = (avg * 7 + raw) / 8，或中值滤波去掉尖峰。' },
        ],
      },
      en: {
        skeleton: `int avg = 0;\nvoid setup() { Serial.begin(115200); }\nvoid loop() {\n  int raw = analogRead(34);\n  // TODO: average or median filter\n  delay(50);\n}`,
        tests: [
          { name: 'Sample', includes: ['analogRead'] },
          { name: 'Filter', regex: 'avg|median|filter|kalman' },
        ],
        holes: [{ id: 'avg', hint: 'avg = (avg * 7 + raw) / 8;' }],
        solution: `int avg = 0;\nvoid setup() { Serial.begin(115200); }\nvoid loop() {\n  int raw = analogRead(34);\n  avg = (avg * 7 + raw) / 8;\n  Serial.println(avg);\n  delay(50);\n}`,
        guide: [
          { title: 'Where', body: 'In loop, right after analogRead.' },
          { title: 'What', body: 'Moving average avg = (avg * 7 + raw) / 8, or a median to kill spikes.' },
        ],
      },
    },
    rtos: {
      zh: {
        skeleton: `void taskA(void*) {\n  for (;;) { vTaskDelay(10); }\n}\nvoid setup() {\n  Serial.begin(115200);\n  // TODO: 创建任务\n}\nvoid loop() {}`,
        tests: [
          { name: '创建任务', includes: ['xTaskCreate'] },
          { name: '让出 CPU', regex: 'vTaskDelay|delay' },
        ],
        holes: [{ id: 'task', hint: 'xTaskCreate(taskA, "a", 2048, NULL, 1, NULL);' }],
        solution: `void taskA(void*) {\n  for (;;) { vTaskDelay(10); }\n}\nvoid setup() {\n  Serial.begin(115200);\n  xTaskCreate(taskA, "a", 2048, NULL, 1, NULL);\n}\nvoid loop() {}`,
        guide: [
          { title: '放哪里', body: '任务函数写在文件上方；xTaskCreate 放在 setup。' },
          { title: '写什么', body: 'xTaskCreate(函数, 名字, 栈大小, 参数, 优先级, handle)；循环里用 vTaskDelay 让出 CPU。' },
        ],
      },
      en: {
        skeleton: `void taskA(void*) {\n  for (;;) { vTaskDelay(10); }\n}\nvoid setup() {\n  Serial.begin(115200);\n  // TODO: create the task\n}\nvoid loop() {}`,
        tests: [
          { name: 'Create task', includes: ['xTaskCreate'] },
          { name: 'Yield CPU', regex: 'vTaskDelay|delay' },
        ],
        holes: [{ id: 'task', hint: 'xTaskCreate(taskA, "a", 2048, NULL, 1, NULL);' }],
        solution: `void taskA(void*) {\n  for (;;) { vTaskDelay(10); }\n}\nvoid setup() {\n  Serial.begin(115200);\n  xTaskCreate(taskA, "a", 2048, NULL, 1, NULL);\n}\nvoid loop() {}`,
        guide: [
          { title: 'Where', body: 'Task function above; xTaskCreate in setup.' },
          { title: 'What', body: 'xTaskCreate(fn, name, stack, arg, prio, handle); yield with vTaskDelay in the loop.' },
        ],
      },
    },
    cam: {
      zh: {
        skeleton: `void setup() {\n  Serial.begin(115200);\n  // TODO: 初始化摄像头并出流\n}\nvoid loop() { delay(100); }`,
        tests: [
          { name: '初始化相机', regex: 'esp_camera_init|camera_config' },
          { name: '取帧或出流', regex: 'esp_camera_fb_get|jpg|stream' },
        ],
        holes: [{ id: 'cam', hint: 'esp_camera_init(&config); 然后 fb_get' }],
        solution: `#include "esp_camera.h"\n\nvoid setup() {\n  Serial.begin(115200);\n  camera_config_t config = {};\n  // 按板型填引脚后：\n  esp_camera_init(&config);\n}\nvoid loop() {\n  camera_fb_t* fb = esp_camera_fb_get();\n  if (fb) esp_camera_fb_return(fb);\n  delay(100);\n}`,
        guide: [
          { title: '放哪里', body: 'esp_camera_init 在 setup；取帧在 loop 或独立任务。' },
          { title: '写什么', body: '配好 camera_config_t 后 init，用 esp_camera_fb_get 取 JPEG，用完 fb_return。' },
        ],
      },
      en: {
        skeleton: `void setup() {\n  Serial.begin(115200);\n  // TODO: init camera and stream\n}\nvoid loop() { delay(100); }`,
        tests: [
          { name: 'Init camera', regex: 'esp_camera_init|camera_config' },
          { name: 'Grab or stream', regex: 'esp_camera_fb_get|jpg|stream' },
        ],
        holes: [{ id: 'cam', hint: 'esp_camera_init(&config); then fb_get' }],
        solution: `#include "esp_camera.h"\n\nvoid setup() {\n  Serial.begin(115200);\n  camera_config_t config = {};\n  // fill pins for your board, then:\n  esp_camera_init(&config);\n}\nvoid loop() {\n  camera_fb_t* fb = esp_camera_fb_get();\n  if (fb) esp_camera_fb_return(fb);\n  delay(100);\n}`,
        guide: [
          { title: 'Where', body: 'esp_camera_init in setup; grab frames in loop or a task.' },
          { title: 'What', body: 'Fill camera_config_t, init, esp_camera_fb_get for JPEG, then fb_return.' },
        ],
      },
    },
    product: {
      zh: {
        skeleton: `enum State { IDLE, RUN, FAULT };\nState st = IDLE;\nvoid setup() { Serial.begin(115200); }\nvoid loop() {\n  // TODO: 用状态机推进\n  delay(100);\n}`,
        tests: [
          { name: '状态枚举', includes: ['State'] },
          { name: '状态切换', regex: 'st\\s*=' },
        ],
        holes: [{ id: 'fsm', hint: '根据事件切换 IDLE / RUN / FAULT' }],
        solution: `enum State { IDLE, RUN, FAULT };\nState st = IDLE;\nvoid setup() { Serial.begin(115200); }\nvoid loop() {\n  switch (st) {\n    case IDLE: st = RUN; break;\n    case RUN: if (/* fault */) st = FAULT; break;\n    case FAULT: st = IDLE; break;\n  }\n  delay(100);\n}`,
        guide: [
          { title: '放哪里', body: '状态枚举和变量放文件顶部；switch 写在 loop。' },
          { title: '写什么', body: '按事件把 st 在 IDLE / RUN / FAULT 之间切换，每个状态只做该做的事。' },
        ],
      },
      en: {
        skeleton: `enum State { IDLE, RUN, FAULT };\nState st = IDLE;\nvoid setup() { Serial.begin(115200); }\nvoid loop() {\n  // TODO: advance the state machine\n  delay(100);\n}`,
        tests: [
          { name: 'State enum', includes: ['State'] },
          { name: 'State change', regex: 'st\\s*=' },
        ],
        holes: [{ id: 'fsm', hint: 'Switch IDLE / RUN / FAULT on events' }],
        solution: `enum State { IDLE, RUN, FAULT };\nState st = IDLE;\nvoid setup() { Serial.begin(115200); }\nvoid loop() {\n  switch (st) {\n    case IDLE: st = RUN; break;\n    case RUN: if (/* fault */) st = FAULT; break;\n    case FAULT: st = IDLE; break;\n  }\n  delay(100);\n}`,
        guide: [
          { title: 'Where', body: 'Enum and variable at file top; switch in loop.' },
          { title: 'What', body: 'Move st among IDLE / RUN / FAULT on events; each state does one job.' },
        ],
      },
    },
  }
  return packs[kind][lang]
}

/** Per-lesson quiz banks (zh + en). */
const QUIZ: Record<string, { zh: QuizQuestion[]; en: QuizQuestion[] }> = {
  'wifi-reconnect': {
    zh: [
      { prompt: 'Wi-Fi 掉线后正确做法？', choices: ['死循环 delay', '检测状态并重新 begin', '重启整个芯片立刻', '关掉串口'], answer: 1, explain: '判断 WL_CONNECTED，失败则限频重连。' },
      { prompt: 'ESP32 家用 Wi-Fi 频段？', choices: ['仅 5 GHz', '2.4 GHz', '6 GHz', '红外'], answer: 1, explain: '常见模组只支持 2.4 GHz。' },
      { prompt: '重连为什么要退避？', choices: ['好看', '避免打爆 AP 和自己的看门狗', 'ADC 需要休息', 'LED 会烧掉'], answer: 1, explain: '无间隔重连会占满 CPU 并被路由拉黑。' },
    ],
    en: [
      { prompt: 'After Wi-Fi drops, you should?', choices: ['Busy-loop delay', 'Check status and call begin again', 'Hard-reset immediately', 'Disable serial'], answer: 1, explain: 'Test WL_CONNECTED; reconnect with backoff.' },
      { prompt: 'Home Wi-Fi band for typical ESP32?', choices: ['5 GHz only', '2.4 GHz', '6 GHz', 'Infrared'], answer: 1, explain: 'Most modules are 2.4 GHz only.' },
      { prompt: 'Why back off on reconnect?', choices: ['Looks nicer', 'Avoid hammering the AP and the watchdog', 'ADC needs rest', 'LED will burn'], answer: 1, explain: 'Tight loops burn CPU and get you blacklisted.' },
    ],
  },
  'http-rest': {
    zh: [
      { prompt: 'REST 里 GET 通常用于？', choices: ['删除资源', '读取状态', '升级固件', '配置引脚复用'], answer: 1, explain: 'GET 读，POST/PUT 写。' },
      { prompt: '设备当 HTTP 服务器时 loop 必须？', choices: ['handleClient', '只 delay', '关闭 Wi-Fi', '关闭 ADC'], answer: 0, explain: '要轮询接入的客户端。' },
      { prompt: '不要把密码放在？', choices: ['NVS', '明文 URL 查询串并提交到公网', '配网页', '本地串口'], answer: 1, explain: '查询串会被日志和代理记录。' },
    ],
    en: [
      { prompt: 'In REST, GET usually?', choices: ['Deletes a resource', 'Reads state', 'Flashes firmware', 'Remaps pins'], answer: 1, explain: 'GET reads; POST/PUT write.' },
      { prompt: 'As an HTTP server, loop must?', choices: ['handleClient', 'Only delay', 'Disable Wi-Fi', 'Disable ADC'], answer: 0, explain: 'Poll connected clients.' },
      { prompt: 'Never put passwords in?', choices: ['NVS', 'Cleartext URL query strings on the public net', 'A config page', 'Local serial'], answer: 1, explain: 'Query strings end up in logs and proxies.' },
    ],
  },
  'mqtt-pubsub': {
    zh: [
      { prompt: 'MQTT 发布是？', choices: ['向主题写一条消息', '扫描 I2C', 'PWM', 'OTA'], answer: 0, explain: 'publish(topic, payload)。' },
      { prompt: 'QoS 0 表示？', choices: ['至少一次', '最多一次、不保证', '精确一次', 'TCP 关闭'], answer: 1, explain: 'fire-and-forget。' },
      { prompt: '断线后要？', choices: ['重新 connect 并恢复订阅', '扔掉 Client', '改 I2C 地址', '降低波特率'], answer: 0, explain: '会话和订阅都要恢复。' },
    ],
    en: [
      { prompt: 'MQTT publish means?', choices: ['Write a message to a topic', 'Scan I2C', 'PWM', 'OTA'], answer: 0, explain: 'publish(topic, payload).' },
      { prompt: 'QoS 0 means?', choices: ['At least once', 'At most once, no guarantee', 'Exactly once', 'TCP closed'], answer: 1, explain: 'Fire-and-forget.' },
      { prompt: 'After disconnect you should?', choices: ['Reconnect and restore subscriptions', 'Drop the client', 'Change I2C address', 'Lower baud'], answer: 0, explain: 'Session and subscriptions must recover.' },
    ],
  },
  'websocket-ctrl': {
    zh: [
      { prompt: 'WebSocket 适合？', choices: ['一次性固件下载', '低延迟双向控制', '校准 ADC', '烧录熔丝'], answer: 1, explain: '连接保持，双方可随时推送。' },
      { prompt: '和 HTTP 轮询比？', choices: ['更费握手、更慢', '减少重复握手', '必须 5GHz', '不需要 Wi-Fi'], answer: 1, explain: '一次握手后复用连接。' },
      { prompt: '控制指令应？', choices: ['不校验直接 digitalWrite', '校验并限频', '放在 ISR 里解析 JSON', '用 220V 继电器演示'], answer: 1, explain: '防止抖动和注入。' },
    ],
    en: [
      { prompt: 'WebSocket fits?', choices: ['One-shot firmware download', 'Low-latency bidirectional control', 'ADC calibration', 'Blowing fuses'], answer: 1, explain: 'Keep the socket; either side can push.' },
      { prompt: 'Versus HTTP polling?', choices: ['More handshakes, slower', 'Fewer repeated handshakes', 'Needs 5 GHz', 'Needs no Wi-Fi'], answer: 1, explain: 'One handshake, then reuse.' },
      { prompt: 'Control commands should?', choices: ['digitalWrite with no checks', 'Validate and rate-limit', 'Parse JSON in an ISR', 'Demo on 220V relays'], answer: 1, explain: 'Stop bounce and injection.' },
    ],
  },
  'ble-service': {
    zh: [
      { prompt: 'BLE 相对经典蓝牙？', choices: ['功耗更低、适合传感器', '必须路由器', '只能音频', '电压是 5V'], answer: 0, explain: '广播+连接，电流更友好。' },
      { prompt: '服务 UUID 的作用？', choices: ['Wi-Fi 密码', '让手机发现能力', 'ADC 通道', 'PWM 频率'], answer: 1, explain: 'GATT 用 UUID 描述服务。' },
      { prompt: '无路由器场景优先？', choices: ['BLE / SoftAP', '必须有光纤', 'I2C', '深度睡眠关闭射频'], answer: 0, explain: '手机可直接连。' },
    ],
    en: [
      { prompt: 'BLE vs classic Bluetooth?', choices: ['Lower power, good for sensors', 'Needs a router', 'Audio only', 'Runs at 5V'], answer: 0, explain: 'Advertise + connect, friendlier current.' },
      { prompt: 'Service UUIDs do what?', choices: ['Hold the Wi-Fi password', 'Let phones discover capabilities', 'Pick ADC channels', 'Set PWM frequency'], answer: 1, explain: 'GATT describes services by UUID.' },
      { prompt: 'No router—prefer?', choices: ['BLE / SoftAP', 'Fiber only', 'I2C', 'Deep sleep with radio off'], answer: 0, explain: 'Phones can connect directly.' },
    ],
  },
  'packet-capture': {
    zh: [
      { prompt: '看 HTTP 包首先看？', choices: ['方法、路径、状态码', 'LED 颜色', '舵机角度', '晶振'], answer: 0, explain: 'GET /api 200 比 payload 更先定位。' },
      { prompt: 'MQTT 报文关键字段？', choices: ['topic 与 payload', 'GPIO 编号', '电阻色环', '舵机脉宽'], answer: 0, explain: '主题决定路由。' },
      { prompt: '抓包不能替代？', choices: ['示波器看 GPIO', '日志', '两者都要，定位层不同', 'BOM'], answer: 2, explain: '网络层和引脚层是两件事。' },
    ],
    en: [
      { prompt: 'On an HTTP packet, look first at?', choices: ['Method, path, status', 'LED color', 'Servo angle', 'Crystal'], answer: 0, explain: 'GET /api 200 localizes faster than the payload.' },
      { prompt: 'Key MQTT fields?', choices: ['topic and payload', 'GPIO numbers', 'Resistor bands', 'Servo pulse width'], answer: 0, explain: 'Topic routes the message.' },
      { prompt: 'Packet capture cannot replace?', choices: ['Scope on GPIO', 'Logs', 'Both—different layers', 'BOM'], answer: 2, explain: 'Network ≠ pin layer.' },
    ],
  },
  'smart-terminal': {
    zh: [
      { prompt: '智能终端最小闭环？', choices: ['只闪灯', '配网 → 控制 → 状态回传', '只画外壳', '只写 README'], answer: 1, explain: '手机要能改状态并读回来。' },
      { prompt: '项目评分应包含？', choices: ['只看过视频', '重连、接口、安全提示', '点赞数', '3D 渲染帧率'], answer: 1, explain: '按清单而不是观看记录。' },
      { prompt: '控制失败先查？', choices: ['主题/路径是否一致', '把 5V 改 12V', '拆天线', '关闭 GND'], answer: 0, explain: '协议对不上比硬件更常见。' },
    ],
    en: [
      { prompt: 'Minimal smart-terminal loop?', choices: ['Just blink', 'Provision → control → status back', 'Only the enclosure', 'Only a README'], answer: 1, explain: 'Phone must change and read state.' },
      { prompt: 'Project scoring should include?', choices: ['Watched a video', 'Reconnect, API, safety notes', 'Like count', '3D FPS'], answer: 1, explain: 'Checklist, not watch time.' },
      { prompt: 'Control failed—check first?', choices: ['Matching topic/path', 'Bump 5V to 12V', 'Remove antenna', 'Open GND'], answer: 0, explain: 'Protocol mismatch beats hardware.' },
    ],
  },
  'freertos-tasks': {
    zh: [
      { prompt: '为什么拆任务？', choices: ['采样和网络互不堵', 'ESP32 只能单线程', '减少 Flash', '取消看门狗'], answer: 0, explain: '耗时网络不应卡住采样。' },
      { prompt: '任务之间传数据常用？', choices: ['队列/通知', '直接在 ISR println', '用 delay(0)', '改主频'], answer: 0, explain: 'queue 是标准同步。' },
      { prompt: 'stack 太小会？', choices: ['栈溢出复位', '更省电', 'Wi-Fi 更快', 'ADC 更准'], answer: 0, explain: 'canary 被踩就会 panic。' },
    ],
    en: [
      { prompt: 'Why split tasks?', choices: ['Sampling and networking don’t block each other', 'ESP32 is single-thread only', 'Saves Flash', 'Disables the watchdog'], answer: 0, explain: 'Slow network must not stall sampling.' },
      { prompt: 'Pass data between tasks with?', choices: ['Queues / notifications', 'println in an ISR', 'delay(0)', 'Change CPU MHz'], answer: 0, explain: 'Queues are the standard sync.' },
      { prompt: 'Stack too small causes?', choices: ['Stack overflow / reset', 'Lower power', 'Faster Wi-Fi', 'Better ADC'], answer: 0, explain: 'Canary trip → panic.' },
    ],
  },
  'dual-core': {
    zh: [
      { prompt: 'APP CPU / PRO CPU 常见分工？', choices: ['一核协议栈、一核控制', '两核都只闪灯', '关掉一核才能 Wi-Fi', '双核必须同优先级'], answer: 0, explain: '协议栈偏一核，控制放另一核更稳。' },
      { prompt: '共享变量要？', choices: ['volatile + 互斥/原子', '随便写', '只用 delay', '放在 GPIO'], answer: 0, explain: '双核可见性需要同步。' },
      { prompt: 'xTaskCreatePinnedToCore 的 core id？', choices: ['0 或 1', '21 或 22', '34', '115200'], answer: 0, explain: '双核编号 0/1。' },
    ],
    en: [
      { prompt: 'Typical APP/PRO core split?', choices: ['One core stack, one core control', 'Both only blink', 'Disable a core for Wi-Fi', 'Must share priority'], answer: 0, explain: 'Stack on one core, control on the other.' },
      { prompt: 'Shared variables need?', choices: ['volatile + mutex/atomics', 'Write freely', 'Only delay', 'Store in GPIO'], answer: 0, explain: 'Dual-core visibility needs sync.' },
      { prompt: 'xTaskCreatePinnedToCore core id?', choices: ['0 or 1', '21 or 22', '34', '115200'], answer: 0, explain: 'Cores are 0/1.' },
    ],
  },
  'hw-timer': {
    zh: [
      { prompt: '硬件定时器适合？', choices: ['稳定节拍、采样时钟', '打印长日志', 'HTTP JSON', '配网页'], answer: 0, explain: '比 delay 循环准。' },
      { prompt: 'ISR 里不要？', choices: ['置标志', '分配内存和打印', '清中断标志', '给队列发短消息'], answer: 1, explain: 'ISR 必须短。' },
      { prompt: '软件 delay 做周期的问题？', choices: ['被其它工作拉长', '太省电', '精度过高', '不能编译'], answer: 0, explain: 'loop 里其它代码会拖周期。' },
    ],
    en: [
      { prompt: 'Hardware timers fit?', choices: ['Stable ticks / sample clocks', 'Long log prints', 'HTTP JSON', 'Config pages'], answer: 0, explain: 'Beats delay loops.' },
      { prompt: 'Never do in an ISR?', choices: ['Set a flag', 'Alloc memory and print', 'Clear IRQ flags', 'Short queue notify'], answer: 1, explain: 'ISRs must stay short.' },
      { prompt: 'Problem with delay periods?', choices: ['Other work stretches them', 'Too efficient', 'Too accurate', 'Won’t compile'], answer: 0, explain: 'Other loop work skews the period.' },
    ],
  },
  'watchdog': {
    zh: [
      { prompt: '任务看门狗复位说明？', choices: ['有任务太久没让出', 'USB 接触不良一定', 'OLED 地址错', '电阻太大'], answer: 0, explain: '死循环或关调度过久。' },
      { prompt: '喂狗应在？', choices: ['正常路径定期', 'ISR 里拼命打印时', '只在 setup 一次', '只在睡眠中'], answer: 0, explain: '证明主路径还活着。' },
      { prompt: '发生 panic 后？', choices: ['读 backtrace 再改代码', '加大电阻', '换 5GHz', '拔 GND'], answer: 0, explain: '先看栈。' },
    ],
    en: [
      { prompt: 'Task WDT reset means?', choices: ['A task didn’t yield for too long', 'USB must be loose', 'Wrong OLED address', 'Resistor too big'], answer: 0, explain: 'Spin loop or scheduler off too long.' },
      { prompt: 'Feed the dog on?', choices: ['The healthy path, regularly', 'While printing hard in an ISR', 'Only once in setup', 'Only while sleeping'], answer: 0, explain: 'Proves the main path is alive.' },
      { prompt: 'After a panic?', choices: ['Read the backtrace, then fix', 'Raise the resistor', 'Switch to 5 GHz', 'Open GND'], answer: 0, explain: 'Read the stack first.' },
    ],
  },
  'ota': {
    zh: [
      { prompt: 'OTA 分区至少需要？', choices: ['能轮流写入的 app 分区', '更大的面包板', '5V LED', 'I2C 上拉'], answer: 0, explain: '双 OTA 槽才能回滚。' },
      { prompt: '升级失败应？', choices: ['保留旧槽可启动', '擦掉全部 NVS', '强制 deep sleep', '关闭看门狗永久'], answer: 0, explain: '回滚是底线。' },
      { prompt: '固件来源要？', choices: ['校验签名/哈希', '任意 HTTP 明文随便跑', '放在查询串', '用串口打日志代替'], answer: 0, explain: '防篡改。' },
    ],
    en: [
      { prompt: 'OTA needs at least?', choices: ['Alternating app partitions', 'A bigger breadboard', 'A 5V LED', 'I2C pull-ups'], answer: 0, explain: 'Dual slots enable rollback.' },
      { prompt: 'On upgrade failure?', choices: ['Keep the old slot bootable', 'Wipe all NVS', 'Force deep sleep', 'Disable WDT forever'], answer: 0, explain: 'Rollback is the floor.' },
      { prompt: 'Firmware source must?', choices: ['Verify signature/hash', 'Run any cleartext HTTP blob', 'Live in the query string', 'Be replaced by serial logs'], answer: 0, explain: 'Stop tampering.' },
    ],
  },
  'nvs': {
    zh: [
      { prompt: 'NVS 适合存？', choices: ['SSID、阈值等配置', '一整段 JPEG', '操作系统', '3D 模型'], answer: 0, explain: '键值小数据。' },
      { prompt: '掉电后？', choices: ['仍在 Flash', '一定丢失', '跑到 SRAM', '送到 MQTT'], answer: 0, explain: 'NVS 在 Flash。' },
      { prompt: '写入不要？', choices: ['每个 loop 狂写', '变更时写', '配网成功后写', '工厂校准写一次'], answer: 0, explain: 'Flash 有寿命。' },
    ],
    en: [
      { prompt: 'NVS is good for?', choices: ['SSID, thresholds, config', 'Whole JPEGs', 'An OS', '3D models'], answer: 0, explain: 'Small key/value blobs.' },
      { prompt: 'After power loss?', choices: ['Still in Flash', 'Always gone', 'Moved to SRAM', 'Sent over MQTT'], answer: 0, explain: 'NVS lives in Flash.' },
      { prompt: 'Don’t write?', choices: ['Every loop', 'On change', 'After provision succeeds', 'Once at factory cal'], answer: 0, explain: 'Flash has wear limits.' },
    ],
  },
  'remote-device': {
    zh: [
      { prompt: '远程设备要同时具备？', choices: ['重连、OTA、看门狗', '只闪灯', '只画外壳', '只接 5V 风扇'], answer: 0, explain: '现场没法天天拔 USB。' },
      { prompt: '发布前至少测？', choices: ['掉线恢复和升级失败回滚', '只测一次 LED', '只测 3D', '只测配色'], answer: 0, explain: '现场故障是网络和升级。' },
      { prompt: '密钥放？', choices: ['NVS/安全区，不进仓库', 'GitHub 公开', '原理图丝印', 'SSID 本身'], answer: 0, explain: '泄露等于设备被接管。' },
    ],
    en: [
      { prompt: 'A remote device needs?', choices: ['Reconnect, OTA, watchdog', 'Only blink', 'Only enclosure art', 'Only a 5V fan'], answer: 0, explain: 'You can’t unplug USB on site daily.' },
      { prompt: 'Before release, test at least?', choices: ['Drop recovery and failed-upgrade rollback', 'One LED blink', 'Only 3D', 'Only color'], answer: 0, explain: 'Field failures are network and upgrade.' },
      { prompt: 'Secrets live in?', choices: ['NVS/secure area—not the repo', 'Public GitHub', 'Silkscreen', 'The SSID itself'], answer: 0, explain: 'Leak = device takeover.' },
    ],
  },
  'spi-sample': {
    zh: [
      { prompt: 'SPI 相对 I2C？', choices: ['通常更快、要更多线', '永远只要两根线', '不能接传感器', '电压必须 12V'], answer: 0, explain: 'CLK/MOSI/MISO/CS。' },
      { prompt: '片选 CS 的作用？', choices: ['选中从机', '提供 3.3V', '消抖', '看门狗'], answer: 0, explain: '同一总线多设备靠 CS。' },
      { prompt: '高速采样时滤波应？', choices: ['在读取后做，别挡总线', '用 delay(1000) 替代', '关掉 SPI', '改成 PWM'], answer: 0, explain: '先收齐再算。' },
    ],
    en: [
      { prompt: 'SPI vs I2C?', choices: ['Usually faster, more wires', 'Always two wires', 'Cannot drive sensors', 'Must be 12V'], answer: 0, explain: 'CLK/MOSI/MISO/CS.' },
      { prompt: 'CS does what?', choices: ['Selects the slave', 'Supplies 3.3V', 'Debounces', 'Feeds the watchdog'], answer: 0, explain: 'Multi-drop SPI uses CS.' },
      { prompt: 'When sampling fast, filter should?', choices: ['Run after reads, don’t block the bus', 'Replace with delay(1000)', 'Disable SPI', 'Become PWM'], answer: 0, explain: 'Collect first, then compute.' },
    ],
  },
  'sensor-sync': {
    zh: [
      { prompt: '多传感器同步关键是？', choices: ['同一时间戳/同一节拍', '不同 GND', '不同电源', '关掉串口'], answer: 0, explain: '对齐时间才能融合。' },
      { prompt: 'millis() 在睡眠后？', choices: ['可能从 0 再计，要用 RTC', '永远连续', '变成 ADC', '变成 MAC 地址'], answer: 0, explain: '深度睡眠会丢掉部分计时。' },
      { prompt: '两路传感器延迟不同要？', choices: ['记录各自采样时刻', '丢掉一路', '加大电阻', '改 5GHz'], answer: 0, explain: '融合时对齐时刻。' },
    ],
    en: [
      { prompt: 'Multi-sensor sync key?', choices: ['Shared timestamp / beat', 'Different GNDs', 'Different supplies', 'Disable serial'], answer: 0, explain: 'Align time before fusion.' },
      { prompt: 'millis() after deep sleep?', choices: ['May restart—use RTC', 'Always continuous', 'Becomes ADC', 'Becomes MAC'], answer: 0, explain: 'Deep sleep drops some timing.' },
      { prompt: 'Unequal sensor delay—do?', choices: ['Stamp each sample time', 'Drop one stream', 'Raise resistors', 'Switch to 5 GHz'], answer: 0, explain: 'Align moments when fusing.' },
    ],
  },
  'moving-avg': {
    zh: [
      { prompt: '滑动平均擅长？', choices: ['高斯白噪声', '脉冲尖峰（更好用中值）', 'Wi-Fi 配网', 'OTA'], answer: 0, explain: '平均抹平随机噪声；尖峰用中值。' },
      { prompt: '窗口越大？', choices: ['更稳更慢', '更快更吵', '电压变 5V', 'I2C 地址变了'], answer: 0, explain: '滞后增加。' },
      { prompt: '中值滤波更适合？', choices: ['偶发坏点', '缓慢温漂', '晶振校准', 'HTTP 缓存'], answer: 0, explain: '排序去极值。' },
    ],
    en: [
      { prompt: 'Moving average is best at?', choices: ['Gaussian white noise', 'Impulse spikes (prefer median)', 'Wi-Fi provisioning', 'OTA'], answer: 0, explain: 'Averages calm random noise; spikes need medians.' },
      { prompt: 'Larger window means?', choices: ['Smoother but slower', 'Faster and noisier', 'Voltage becomes 5V', 'I2C address changes'], answer: 0, explain: 'More lag.' },
      { prompt: 'Median filter fits?', choices: ['Occasional bad samples', 'Slow temperature drift', 'Crystal cal', 'HTTP cache'], answer: 0, explain: 'Sort and drop extremes.' },
    ],
  },
  'kalman': {
    zh: [
      { prompt: '卡尔曼本质是？', choices: ['预测与观测加权融合', '只做平均', 'I2C 扫描', '看门狗'], answer: 0, explain: '用模型预测再用测量修正。' },
      { prompt: '过程噪声 Q 很大意味着？', choices: ['更信测量', '更信模型', '关掉传感器', '必须 SPI'], answer: 0, explain: '模型不可信则靠观测。' },
      { prompt: '入门不要一上来？', choices: ['上 15 维非线性滤波器', '先一维温度', '先调 Q/R', '先看曲线'], answer: 0, explain: '先一维建立直觉。' },
    ],
    en: [
      { prompt: 'Kalman is essentially?', choices: ['Weighted fuse of predict + measure', 'Only averaging', 'I2C scan', 'Watchdog'], answer: 0, explain: 'Predict with a model, correct with observation.' },
      { prompt: 'Large process noise Q means?', choices: ['Trust measurements more', 'Trust the model more', 'Disable sensors', 'Must use SPI'], answer: 0, explain: 'Untrusted model → lean on observation.' },
      { prompt: 'Don’t start with?', choices: ['A 15-D nonlinear filter', '1-D temperature', 'Tuning Q/R', 'Looking at curves'], answer: 0, explain: 'Build intuition in 1-D first.' },
    ],
  },
  'outlier': {
    zh: [
      { prompt: '异常值检测先定？', choices: ['阈值/四分位/变化率', 'LED 颜色', '外壳颜色', 'Git 分支'], answer: 0, explain: '没有定义就无法丢点。' },
      { prompt: '丢掉坏点后要？', choices: ['保持上一有效值或插值', '立刻 deep sleep', '改 I2C 地址', '升高到 5V'], answer: 0, explain: '避免空洞造成控制跳变。' },
      { prompt: '传感器饱和（顶死 4095）是？', choices: ['要当异常处理', '正常平均值', 'Wi-Fi 信号', '看门狗正常'], answer: 0, explain: '超量程不是真世界值。' },
    ],
    en: [
      { prompt: 'Outlier detection starts with?', choices: ['Threshold / quartile / slew', 'LED color', 'Enclosure color', 'Git branch'], answer: 0, explain: 'No definition → cannot drop points.' },
      { prompt: 'After dropping a bad sample?', choices: ['Hold last-good or interpolate', 'Deep sleep immediately', 'Change I2C address', 'Raise to 5V'], answer: 0, explain: 'Avoid holes that jerk control.' },
      { prompt: 'Sensor pegged at 4095 is?', choices: ['An anomaly to handle', 'A normal average', 'Wi-Fi signal', 'Healthy WDT'], answer: 0, explain: 'Over-range is not a real-world value.' },
    ],
  },
  'live-chart': {
    zh: [
      { prompt: '实时曲线卡顿常见原因？', choices: ['点太多、刷新太勤', '电阻 220Ω', '3.3V', 'BOOT 键'], answer: 0, explain: '降采样、固定窗口。' },
      { prompt: '纵轴应？', choices: ['按物理量带单位', '随机缩放', '只用 0-255', '隐藏'], answer: 0, explain: '可读性第一。' },
      { prompt: '和示波器分工？', choices: ['示波器看电，曲线看数据', '完全一样', '曲线能看 5V 毛刺更好', '都不要'], answer: 0, explain: '层不同。' },
    ],
    en: [
      { prompt: 'Live charts stutter because?', choices: ['Too many points / too often', '220Ω resistors', '3.3V', 'BOOT button'], answer: 0, explain: 'Downsample; fixed windows.' },
      { prompt: 'Y-axis should?', choices: ['Show physical units', 'Scale randomly', 'Only 0–255', 'Stay hidden'], answer: 0, explain: 'Readability first.' },
      { prompt: 'Vs an oscilloscope?', choices: ['Scope sees volts; chart sees data', 'Identical', 'Chart sees 5V spikes better', 'Need neither'], answer: 0, explain: 'Different layers.' },
    ],
  },
  'env-station': {
    zh: [
      { prompt: '环境监测站最小集合？', choices: ['采集、滤波、显示/上报、阈值', '只 OLED 开机画面', '只 3D', '只配色'], answer: 0, explain: '要能交付读数。' },
      { prompt: '多传感器共地？', choices: ['必须', '禁止', '可接 220V', '只接天线'], answer: 0, explain: '参考电位要同。' },
      { prompt: '项目评分看？', choices: ['故障、代码、测验、真机', '是否看过标题', '点赞', '字体'], answer: 0, explain: '掌握度清单。' },
    ],
    en: [
      { prompt: 'Env station minimum set?', choices: ['Capture, filter, display/report, thresholds', 'OLED splash only', 'Only 3D', 'Only theme color'], answer: 0, explain: 'Must deliver readings.' },
      { prompt: 'Multi-sensor common ground?', choices: ['Required', 'Forbidden', 'OK on 220V', 'Antenna only'], answer: 0, explain: 'Shared reference potential.' },
      { prompt: 'Project scoring looks at?', choices: ['Faults, code, quiz, hardware', 'Whether title was viewed', 'Likes', 'Font'], answer: 0, explain: 'Mastery checklist.' },
    ],
  },
  'battery-pm': {
    zh: [
      { prompt: '续航估算要？', choices: ['睡眠电流 × 时间 + 唤醒电量', '只看峰值 260mA', '只看 LED', '只看外壳'], answer: 0, explain: '占空比决定电池寿命。' },
      { prompt: '锂电池保护？', choices: ['欠压截止、限流', '直接接到 USB 5V 无管理', '反接当特性', '用市电充电口'], answer: 0, explain: '要保护板。' },
      { prompt: 'Wi-Fi 对续航？', choices: ['发射电流大，能睡就睡', '几乎不耗电', '只跟电阻有关', '只跟 OLED 有关'], answer: 0, explain: '射频是大头。' },
    ],
    en: [
      { prompt: 'Runtime estimate needs?', choices: ['Sleep current × time + wake energy', 'Only the 260mA peak', 'Only the LED', 'Only the enclosure'], answer: 0, explain: 'Duty cycle dominates battery life.' },
      { prompt: 'Li-ion protection?', choices: ['UVLO and current limit', 'Raw USB 5V unmanaged', 'Reverse as a feature', 'Mains charging jack'], answer: 0, explain: 'Use a protection circuit.' },
      { prompt: 'Wi-Fi vs battery life?', choices: ['TX current is high—sleep when you can', 'Almost free', 'Only resistor limited', 'Only OLED limited'], answer: 0, explain: 'RF is the big draw.' },
    ],
  },
  'deep-sleep-power': {
    zh: [
      { prompt: '深度睡眠电流量级？', choices: ['数十到数百 μA（视板卡）', '永远 260mA', '0A 理想开路', '2A'], answer: 0, explain: '开发板 LDO 会抬高。' },
      { prompt: '测睡眠电流应？', choices: ['去掉费电外设，用电流计串入', '只看 USB 灯', '用示波器 10x 探头当电流表', '看 RSSI'], answer: 0, explain: 'μA 档要正确量程。' },
      { prompt: '唤醒后程序从？', choices: ['setup 再来（除非 RTC 记忆）', 'loop 中间继续', 'bootloader 菜单', 'Wi-Fi 校准页'], answer: 0, explain: 'CPU 重启。' },
    ],
    en: [
      { prompt: 'Deep-sleep current order?', choices: ['Tens–hundreds of μA (board-dependent)', 'Always 260mA', 'Ideal 0A open', '2A'], answer: 0, explain: 'Devkit LDOs raise the floor.' },
      { prompt: 'To measure sleep current?', choices: ['Remove hungry peripherals; series ammeter', 'Watch the USB LED', 'Use a 10× scope probe as an ammeter', 'Watch RSSI'], answer: 0, explain: 'μA ranges need the right scale.' },
      { prompt: 'After wake, code starts at?', choices: ['setup() again (unless RTC retained)', 'Middle of loop', 'Bootloader menu', 'Wi-Fi cal page'], answer: 0, explain: 'CPU reboots.' },
    ],
  },
  'enclosure': {
    zh: [
      { prompt: '外壳先保证？', choices: ['USB、天线、传感器开孔', '越小越好不管接口', '全金属密封 Wi-Fi', '按 220V 面板做'], answer: 0, explain: '接口被挡住等于废品。' },
      { prompt: '天线旁避免？', choices: ['大面积接地金属盖住', '塑料窗', '开槽', '远离电池'], answer: 0, explain: '金属会失谐。' },
      { prompt: '按键要？', choices: ['对应外壳行程', '随便打孔', '取消 GND', '改 5GHz'], answer: 0, explain: '结构对齐。' },
    ],
    en: [
      { prompt: 'Enclosure must first guarantee?', choices: ['USB, antenna, sensor openings', 'Smallest possible, ignore I/O', 'All-metal sealed Wi-Fi', 'A 220V panel layout'], answer: 0, explain: 'Blocked connectors = scrap.' },
      { prompt: 'Near the antenna avoid?', choices: ['Large grounded metal covers', 'Plastic windows', 'Slots', 'Distance from battery'], answer: 0, explain: 'Metal detunes the antenna.' },
      { prompt: 'Buttons need?', choices: ['Matching enclosure travel', 'Random holes', 'Open GND', '5 GHz'], answer: 0, explain: 'Mechanical alignment.' },
    ],
  },
  'state-machine': {
    zh: [
      { prompt: '状态机替代？', choices: ['到处 if-else 的意大利面', 'I2C 上拉', '220Ω', 'OTA 分区'], answer: 0, explain: '显式状态可测。' },
      { prompt: '每个状态应定义？', choices: ['入口、事件、出口', '随机 delay', '只闪灯', '只打印'], answer: 0, explain: '可预测转换。' },
      { prompt: '故障状态要？', choices: ['可恢复或安全停机', '直接 while(1) 空转无日志', '关掉 GND', '升压到 12V'], answer: 0, explain: '现场要能懂。' },
    ],
    en: [
      { prompt: 'State machines replace?', choices: ['Spaghetti if-else', 'I2C pull-ups', '220Ω', 'OTA partitions'], answer: 0, explain: 'Explicit states are testable.' },
      { prompt: 'Each state should define?', choices: ['Enter / event / exit', 'Random delay', 'Only blink', 'Only print'], answer: 0, explain: 'Predictable transitions.' },
      { prompt: 'Fault states should?', choices: ['Recover or safe-stop', 'while(1) with no logs', 'Open GND', 'Boost to 12V'], answer: 0, explain: 'Field techs must understand it.' },
    ],
  },
  'config-ux': {
    zh: [
      { prompt: '给非极客配网优先？', choices: ['热点+网页或 BLE 配网', '改源代码重编', 'JTAG', '熔丝'], answer: 0, explain: '降低门槛。' },
      { prompt: '错误提示应？', choices: ['人话：密码错/找不到 Wi-Fi', '只打印 hex dump', '复位无说明', '灭灯'], answer: 0, explain: 'UX 就是可理解。' },
      { prompt: '配网成功后？', choices: ['写入 NVS 并给出确认', '每次都要重新输入', '删除固件', '关闭 3.3V'], answer: 0, explain: '记得住。' },
    ],
    en: [
      { prompt: 'Non-geek provisioning prefers?', choices: ['SoftAP+web or BLE provision', 'Edit source and rebuild', 'JTAG', 'Fuses'], answer: 0, explain: 'Lower the barrier.' },
      { prompt: 'Error copy should be?', choices: ['Human: wrong password / Wi-Fi missing', 'Hex dumps only', 'Silent reset', 'LED off'], answer: 0, explain: 'UX is understandability.' },
      { prompt: 'After provision succeeds?', choices: ['Write NVS and confirm', 'Re-type every boot', 'Delete firmware', 'Kill 3.3V'], answer: 0, explain: 'It must remember.' },
    ],
  },
  'factory-test': {
    zh: [
      { prompt: '生产测试点目的？', choices: ['30 秒内验证关键网和射频', '给用户拆着玩', '替代外壳', '提高 5V'], answer: 0, explain: '夹具探针。' },
      { prompt: '测试程序应？', choices: ['独立、可显示 PASS/FAIL', '和发布固件混在一起无标识', '必须联网才能测 LED', '没有串口'], answer: 0, explain: '产线要立刻判定。' },
      { prompt: '不要在测试夹具上？', choices: ['接市电负载', '测 3.3V', '扫 I2C', '看电流'], answer: 0, explain: '安全。' },
    ],
    en: [
      { prompt: 'Factory test points exist to?', choices: ['Verify key nets/RF in ~30s', 'Let users pry boards', 'Replace the enclosure', 'Raise 5V'], answer: 0, explain: 'Fixture probes.' },
      { prompt: 'Test firmware should?', choices: ['Be separate with PASS/FAIL', 'Blend unmarked into release FW', 'Need cloud to test an LED', 'Have no serial'], answer: 0, explain: 'Lines need instant verdicts.' },
      { prompt: 'Never on the fixture?', choices: ['Mains loads', 'Measure 3.3V', 'Scan I2C', 'Watch current'], answer: 0, explain: 'Safety.' },
    ],
  },
  'portable-product': {
    zh: [
      { prompt: '便携产品关键指标？', choices: ['续航、接口、状态机、可测试', '只看 3D 是否好看', '只看课程标题', '只看点赞'], answer: 0, explain: '能带出门用。' },
      { prompt: '电量显示来自？', choices: ['电池电压/库仑计，不是猜', '随机数', 'RSSI', '舵机角度'], answer: 0, explain: 'ADC 测电池要分压。' },
      { prompt: '出门前关闭？', choices: ['不必要的 Wi-Fi/外设', 'GND', '看门狗', '上拉'], answer: 0, explain: '省电。' },
    ],
    en: [
      { prompt: 'Portable product KPIs?', choices: ['Runtime, I/O, FSM, testability', 'Only pretty 3D', 'Only lesson titles', 'Only likes'], answer: 0, explain: 'It has to leave the desk.' },
      { prompt: 'Battery UI comes from?', choices: ['Voltage / fuel gauge—not guesses', 'Random numbers', 'RSSI', 'Servo angle'], answer: 0, explain: 'ADC the pack through a divider.' },
      { prompt: 'Before going out, disable?', choices: ['Unnecessary Wi-Fi/peripherals', 'GND', 'Watchdog', 'Pull-ups'], answer: 0, explain: 'Save power.' },
    ],
  },
  'arch-split': {
    zh: [
      { prompt: '需求拆解先写？', choices: ['可验证的模块边界', '先画贴纸', '先买外壳', '先上 5GHz'], answer: 0, explain: '采集/推理/传输/电源分开测。' },
      { prompt: '接口文档应包含？', choices: ['数据格式和失败码', 'LED 品牌', '字体', '背景音乐'], answer: 0, explain: '联调靠契约。' },
      { prompt: '架构评审看？', choices: ['掉线、断电、升级路径', '配色', '点赞', '是否用过 delay(1)'], answer: 0, explain: '现场路径。' },
    ],
    en: [
      { prompt: 'Requirements split starts with?', choices: ['Verifiable module boundaries', 'Stickers first', 'Buy enclosure first', '5 GHz first'], answer: 0, explain: 'Capture / infer / transport / power tested apart.' },
      { prompt: 'Interface docs include?', choices: ['Data formats and failure codes', 'LED brand', 'Fonts', 'BGM'], answer: 0, explain: 'Integration needs contracts.' },
      { prompt: 'Architecture review checks?', choices: ['Drop, brownout, upgrade paths', 'Theme color', 'Likes', 'Whether delay(1) was used'], answer: 0, explain: 'Field paths.' },
    ],
  },
  'cam-pipeline': {
    zh: [
      { prompt: '摄像头管线顺序？', choices: ['init → 取帧 → 编码 → 发送', '先 MQTT 再 init', '先 deep sleep 再取帧', '先 5V 到数据脚'], answer: 0, explain: '没有 init 就没有 JPEG。' },
      { prompt: 'PSRAM 的意义？', choices: ['大帧缓冲', '替代天线', '替代 GND', '提高 5V'], answer: 0, explain: 'CAM 常用 PSRAM。' },
      { prompt: '取帧后必须？', choices: ['归还 framebuffer', '一直占着', '改 I2C 地址', '关掉 3.3V'], answer: 0, explain: 'fb_return。' },
    ],
    en: [
      { prompt: 'Camera pipeline order?', choices: ['init → grab → encode → send', 'MQTT before init', 'Deep sleep before grab', '5V on data pins first'], answer: 0, explain: 'No init → no JPEG.' },
      { prompt: 'PSRAM matters because?', choices: ['Large framebuffers', 'Replaces the antenna', 'Replaces GND', 'Raises 5V'], answer: 0, explain: 'CAM boards often need PSRAM.' },
      { prompt: 'After grabbing a frame you must?', choices: ['Return the framebuffer', 'Keep it forever', 'Change I2C address', 'Kill 3.3V'], answer: 0, explain: 'fb_return.' },
    ],
  },
  'edge-vision': {
    zh: [
      { prompt: '板端视觉要？', choices: ['降分辨率、轻量模型', '上云 4K', '必须 GPU', '用 delay 代替推理'], answer: 0, explain: '算力有限。' },
      { prompt: '误报处理？', choices: ['阈值+冷却时间', '每次都推送', '关掉相机', '升压'], answer: 0, explain: '告警要节流。' },
      { prompt: '隐私？', choices: ['能本地判断就不要上传原图', '无脑传云', '串口打印 JPEG', '放 GitHub'], answer: 0, explain: '最小必要。' },
    ],
    en: [
      { prompt: 'On-device vision needs?', choices: ['Lower res, light models', 'Cloud 4K', 'A GPU', 'delay instead of inference'], answer: 0, explain: 'MCU compute is limited.' },
      { prompt: 'False alarms—handle with?', choices: ['Thresholds + cooldown', 'Push every time', 'Disable the camera', 'Boost voltage'], answer: 0, explain: 'Throttle alerts.' },
      { prompt: 'Privacy?', choices: ['Decide locally; don’t upload raw frames', 'Upload everything', 'Print JPEG on serial', 'Put it on GitHub'], answer: 0, explain: 'Minimum necessary data.' },
    ],
  },
  'cloud-alert': {
    zh: [
      { prompt: '告警通道要？', choices: ['可到达手机且可重试', '只点亮板上 LED', '只写 RAM', '只改 3D 颜色'], answer: 0, explain: '人要收到。' },
      { prompt: '云端存储先想？', choices: ['保留多久、谁能看', '无限上传', '明文密码当路径', '关掉 TLS'], answer: 0, explain: '合规和费用。' },
      { prompt: '失败时设备侧？', choices: ['本地队列，恢复后补发', '丢弃所有事件', '复位到 bootloader', '拔电池'], answer: 0, explain: '弱网是常态。' },
    ],
    en: [
      { prompt: 'Alert channel must?', choices: ['Reach a phone with retries', 'Only light a board LED', 'Only write RAM', 'Only recolor 3D'], answer: 0, explain: 'A human must get it.' },
      { prompt: 'Cloud storage first decide?', choices: ['Retention and who can view', 'Unlimited upload', 'Password as path', 'Disable TLS'], answer: 0, explain: 'Compliance and cost.' },
      { prompt: 'On failure, device side?', choices: ['Local queue, flush when back', 'Drop every event', 'Reset to bootloader', 'Pull the battery'], answer: 0, explain: 'Weak networks are normal.' },
    ],
  },
  'security-acl': {
    zh: [
      { prompt: '设备接口默认？', choices: ['要认证，不裸奔', '局域网就可以 root', '默认密码 admin', '关闭加密加快'], answer: 0, explain: '最小权限。' },
      { prompt: '固件更新要？', choices: ['签名校验', '任意 URL', '用户提交的二进制直接跑', '蓝牙广播明文'], answer: 0, explain: '供应链安全。' },
      { prompt: '调试口量产时？', choices: ['关闭或加密', '永远开着 UART shell', '打印所有密钥', '把 JTAG 拉到外壳'], answer: 0, explain: '减少攻击面。' },
    ],
    en: [
      { prompt: 'Device APIs by default?', choices: ['Authenticated—not open', 'LAN means root', 'Default password admin', 'Disable crypto for speed'], answer: 0, explain: 'Least privilege.' },
      { prompt: 'Firmware updates need?', choices: ['Signature checks', 'Any URL', 'Run user binaries raw', 'Cleartext BLE ads'], answer: 0, explain: 'Supply-chain safety.' },
      { prompt: 'Debug ports in production?', choices: ['Disable or encrypt', 'Leave UART shell forever', 'Print every secret', 'Expose JTAG on the shell'], answer: 0, explain: 'Shrink the attack surface.' },
    ],
  },
  'release-rollback': {
    zh: [
      { prompt: '坏版本发布后？', choices: ['切回上一 app 槽', '让用户自己拆机', '删除 NVS 所有密钥', '改 I2C 地址'], answer: 0, explain: 'OTA 双槽。' },
      { prompt: '监控至少看？', choices: ['在线率、崩溃、升级成功率', '3D FPS', '点赞', '字体'], answer: 0, explain: '健康度。' },
      { prompt: '灰度发布？', choices: ['先小比例设备', '一次全量', '只升级开发者电脑', '不升级'], answer: 0, explain: '控制爆炸半径。' },
    ],
    en: [
      { prompt: 'After a bad release?', choices: ['Switch back to the prior app slot', 'Tell users to desolder', 'Wipe all NVS keys', 'Change I2C address'], answer: 0, explain: 'OTA dual slots.' },
      { prompt: 'Monitor at least?', choices: ['Online rate, crashes, upgrade success', '3D FPS', 'Likes', 'Fonts'], answer: 0, explain: 'Health signals.' },
      { prompt: 'Canary release means?', choices: ['Small % of devices first', 'All at once', 'Only developer PCs', 'Never upgrade'], answer: 0, explain: 'Limit blast radius.' },
    ],
  },
  'capstone-cam': {
    zh: [
      { prompt: '毕业项目要覆盖？', choices: ['架构、采集、告警、安全、发布', '只拍一张图', '只写标题', '只做外壳渲染'], answer: 0, explain: '完整闭环。' },
      { prompt: '安防相机隐私底线？', choices: ['本地检测+授权查看', '公网匿名直播', '默认无密码', '日志打出画面'], answer: 0, explain: '安全产品先安全。' },
      { prompt: '评分不是「看过」而是？', choices: ['清单项都能演示', '停留时长', '是否点开 3D', '是否收藏'], answer: 0, explain: '掌握度。' },
    ],
    en: [
      { prompt: 'Capstone must cover?', choices: ['Architecture, capture, alerts, security, release', 'One still photo', 'Title only', 'Enclosure render only'], answer: 0, explain: 'Full closed loop.' },
      { prompt: 'Security-cam privacy floor?', choices: ['Local detect + authorized view', 'Anonymous public stream', 'No default password', 'Log raw frames'], answer: 0, explain: 'Security products start secure.' },
      { prompt: 'Scoring is not “watched” but?', choices: ['Demo every checklist item', 'Dwell time', 'Opened 3D', 'Bookmarked'], answer: 0, explain: 'Mastery.' },
    ],
  },
}

function defaultQuiz(goal: string, lang: Lang): QuizQuestion[] {
  if (lang === 'en') {
    return [
      { prompt: 'Lesson goal?', choices: [goal, 'Wire mains', 'Open GND', '5 GHz only'], answer: 0, explain: 'Remember the goal first.' },
      { prompt: 'Safety floor?', choices: ['3.3V logic, power off first', 'Direct 220V', 'Hot-plug anything', 'Reverse the battery as a feature'], answer: 0, explain: 'Low-voltage lab.' },
      { prompt: 'Mastery means?', choices: ['Faults + code + quiz + hardware', 'Saw the title', 'Liked it', 'Screenshot'], answer: 0, explain: 'Checklist scoring.' },
    ]
  }
  return [
    { prompt: '本课目标？', choices: [goal, '接市电', '取消 GND', '只用 5GHz'], answer: 0, explain: '先记住目标。' },
    { prompt: '安全底线？', choices: ['3.3V 逻辑、先断电', '直接 220V', '热插拔任意模块', '反接电池当特性'], answer: 0, explain: '低压实验。' },
    { prompt: '掌握标准？', choices: ['故障+代码+测验+真机', '看过标题', '点赞', '截图'], answer: 0, explain: '清单评分。' },
  ]
}

function isProjectType(type: string, lang: Lang) {
  if (lang === 'en') return /project|capstone/i.test(type)
  return type.includes('项目') || type.includes('毕业')
}

function rubric(lang: Lang) {
  if (lang === 'en') {
    return [
      { id: 'wiring', label: 'Wiring', detail: 'Open faults fixed' },
      { id: 'code', label: 'Key code', detail: 'Tests passed' },
      { id: 'quiz', label: 'Quiz', detail: 'Pass score reached' },
      { id: 'run', label: 'Run', detail: 'Simulation ran' },
      { id: 'kit', label: 'Hardware', detail: 'BOM and safety acknowledged' },
    ]
  }
  return [
    { id: 'wiring', label: '接线', detail: '开路故障已修复' },
    { id: 'code', label: '关键代码', detail: '测试通过' },
    { id: 'quiz', label: '测验', detail: '达到及格分' },
    { id: 'run', label: '运行', detail: '仿真已跑通' },
    { id: 'kit', label: '真机', detail: '已确认 BOM 与安全' },
  ]
}

export const FILL_SPECS: FillSpec[] = [
  { id: 'wifi-reconnect', stageId: 'protocols', sceneLessonId: 'wifi', kind: 'wifi', zh: { title: 'Wi-Fi 配网与断线重连', type: '网络课', goal: '断线后自动回到在线状态', extra: '2.4G 路由器' }, en: { title: 'Wi-Fi provision & reconnect', type: 'Network', goal: 'Return online after a drop', extra: '2.4 GHz router' } },
  { id: 'http-rest', stageId: 'protocols', sceneLessonId: 'wifi', kind: 'wifi', zh: { title: 'HTTP REST API', type: '网络课', goal: '用 HTTP 读写设备状态', extra: 'WebServer' }, en: { title: 'HTTP REST API', type: 'Network', goal: 'Read/write device state over HTTP', extra: 'WebServer' } },
  { id: 'mqtt-pubsub', stageId: 'protocols', sceneLessonId: 'wifi', kind: 'wifi', zh: { title: 'MQTT 发布与订阅', type: '协议课', goal: '把传感器数据发到主题', extra: 'MQTT broker' }, en: { title: 'MQTT publish & subscribe', type: 'Protocol', goal: 'Publish sensor data to topics', extra: 'MQTT broker' } },
  { id: 'websocket-ctrl', stageId: 'protocols', sceneLessonId: 'wifi', kind: 'wifi', zh: { title: 'WebSocket 实时控制', type: '协议课', goal: '低延迟双向控制', extra: 'WebSocket 客户端' }, en: { title: 'WebSocket live control', type: 'Protocol', goal: 'Low-latency bidirectional control', extra: 'WebSocket client' } },
  { id: 'ble-service', stageId: 'protocols', sceneLessonId: 'bluetooth', kind: 'ble', zh: { title: '蓝牙 BLE 服务', type: '通信课', goal: '无路由器时被手机发现', extra: '手机 BLE' }, en: { title: 'Bluetooth BLE service', type: 'Comms', goal: 'Be discoverable without a router', extra: 'Phone BLE' } },
  { id: 'packet-capture', stageId: 'protocols', sceneLessonId: 'wifi', kind: 'wifi', zh: { title: '网络数据包抓取', type: '工具课', goal: '看懂请求与响应', extra: '抓包列表' }, en: { title: 'Network packet glance', type: 'Tools', goal: 'Read requests and responses', extra: 'Packet list' } },
  { id: 'smart-terminal', stageId: 'protocols', sceneLessonId: 'wifi', kind: 'wifi', zh: { title: '阶段项目：智能终端', type: '项目课', goal: '手机控制的智能终端', extra: '控制页' }, en: { title: 'Stage project: smart terminal', type: 'Project', goal: 'Phone-controlled smart terminal', extra: 'Control page' } },
  { id: 'freertos-tasks', stageId: 'realtime', sceneLessonId: 'board', kind: 'rtos', zh: { title: 'FreeRTOS 任务与队列', type: '系统课', goal: '用任务拆分采样与通信', extra: '双任务' }, en: { title: 'FreeRTOS tasks & queues', type: 'System', goal: 'Split sampling from networking', extra: 'Two tasks' } },
  { id: 'dual-core', stageId: 'realtime', sceneLessonId: 'board', kind: 'rtos', zh: { title: '双核任务分工', type: '系统课', goal: '双核分别跑控制与网络', extra: '双核' }, en: { title: 'Dual-core task split', type: 'System', goal: 'Run control and network on separate cores', extra: 'Dual core' } },
  { id: 'hw-timer', stageId: 'realtime', sceneLessonId: 'board', kind: 'rtos', zh: { title: '硬件定时器', type: '实验课', goal: '用定时器打出稳定节拍', extra: 'HW timer' }, en: { title: 'Hardware timer', type: 'Lab', goal: 'Stable ticks without delay loops', extra: 'HW timer' } },
  { id: 'watchdog', stageId: 'realtime', sceneLessonId: 'board', kind: 'rtos', zh: { title: '看门狗与异常恢复', type: '可靠性课', goal: '死机后自动恢复', extra: 'TWDT' }, en: { title: 'Watchdog & recovery', type: 'Reliability', goal: 'Recover when a task stalls', extra: 'TWDT' } },
  { id: 'ota', stageId: 'realtime', sceneLessonId: 'wifi', kind: 'wifi', zh: { title: 'OTA 固件升级', type: '部署课', goal: '远程安全升级', extra: 'OTA 分区' }, en: { title: 'OTA firmware update', type: 'Deploy', goal: 'Update firmware safely over the air', extra: 'OTA partitions' } },
  { id: 'nvs', stageId: 'realtime', sceneLessonId: 'board', kind: 'product', zh: { title: 'NVS 配置存储', type: '存储课', goal: '配网参数掉电不丢', extra: 'NVS' }, en: { title: 'NVS config storage', type: 'Storage', goal: 'Keep Wi-Fi settings across power loss', extra: 'NVS' } },
  { id: 'remote-device', stageId: 'realtime', sceneLessonId: 'wifi', kind: 'wifi', zh: { title: '阶段项目：远程设备', type: '项目课', goal: '支持 OTA 的物联网设备', extra: '远程设备' }, en: { title: 'Stage project: remote device', type: 'Project', goal: 'IoT device with OTA', extra: 'Remote device' } },
  { id: 'spi-sample', stageId: 'sensors', sceneLessonId: 'imu', kind: 'bus', zh: { title: 'SPI 高速采样', type: '总线课', goal: '用 SPI 拉高采样率', extra: 'SPI 传感器' }, en: { title: 'SPI high-speed sampling', type: 'Bus', goal: 'Raise sample rate with SPI', extra: 'SPI sensor' } },
  { id: 'sensor-sync', stageId: 'sensors', sceneLessonId: 'dht', kind: 'filter', zh: { title: '多传感器时间同步', type: '数据课', goal: '给多路数据打同一时间戳', extra: 'DHT+IMU' }, en: { title: 'Multi-sensor time sync', type: 'Data', goal: 'Stamp multiple streams together', extra: 'DHT+IMU' } },
  { id: 'moving-avg', stageId: 'sensors', sceneLessonId: 'pot', kind: 'filter', zh: { title: '滑动平均与中值滤波', type: '算法课', goal: '选对滤波对付不同噪声', extra: 'ADC 噪声' }, en: { title: 'Moving average & median', type: 'Algo', goal: 'Pick filters for the noise you have', extra: 'ADC noise' } },
  { id: 'kalman', stageId: 'sensors', sceneLessonId: 'imu', kind: 'filter', zh: { title: '卡尔曼滤波入门', type: '算法课', goal: '融合预测与观测', extra: '一维卡尔曼' }, en: { title: 'Kalman filter intro', type: 'Algo', goal: 'Fuse prediction with measurement', extra: '1-D Kalman' } },
  { id: 'outlier', stageId: 'sensors', sceneLessonId: 'gas', kind: 'filter', zh: { title: '异常值检测', type: '数据课', goal: '丢掉明显坏点', extra: 'MQ 尖峰' }, en: { title: 'Outlier detection', type: 'Data', goal: 'Drop obvious bad samples', extra: 'MQ spikes' } },
  { id: 'live-chart', stageId: 'sensors', sceneLessonId: 'pot', kind: 'filter', zh: { title: '实时曲线设计', type: '工具课', goal: '让曲线可读而不卡', extra: '示波器窗口' }, en: { title: 'Live chart design', type: 'Tools', goal: 'Readable plots without jank', extra: 'Scope window' } },
  { id: 'env-station', stageId: 'sensors', sceneLessonId: 'dht', kind: 'filter', zh: { title: '阶段项目：环境监测站', type: '项目课', goal: '室内环境监测站', extra: '温湿度站' }, en: { title: 'Stage project: env station', type: 'Project', goal: 'Indoor environment station', extra: 'Temp/humidity station' } },
  { id: 'battery-pm', stageId: 'product', sceneLessonId: 'sleep', kind: 'sleep', zh: { title: '电池与电源管理', type: '硬件课', goal: '估算续航并保护电池', extra: '锂电池' }, en: { title: 'Battery & power management', type: 'Hardware', goal: 'Estimate runtime and protect the cell', extra: 'Li-ion cell' } },
  { id: 'deep-sleep-power', stageId: 'product', sceneLessonId: 'sleep', kind: 'sleep', zh: { title: '深度睡眠功耗测试', type: '实验课', goal: '用功耗计量出睡眠电流', extra: 'μA 表' }, en: { title: 'Deep-sleep power test', type: 'Lab', goal: 'Measure sleep current in µA', extra: 'µA meter' } },
  { id: 'enclosure', stageId: 'product', sceneLessonId: 'board', kind: 'product', zh: { title: '外壳与接口规划', type: '设计课', goal: '接口不会被壳卡住', extra: '外壳开孔' }, en: { title: 'Enclosure & I/O plan', type: 'Design', goal: 'Keep USB, antenna, and sensors usable', extra: 'Enclosure cutouts' } },
  { id: 'state-machine', stageId: 'product', sceneLessonId: 'board', kind: 'product', zh: { title: '状态机设计', type: '架构课', goal: '用状态机代替意大利面', extra: '状态图' }, en: { title: 'State machine design', type: 'Architecture', goal: 'Replace spaghetti conditionals', extra: 'State diagram' } },
  { id: 'config-ux', stageId: 'product', sceneLessonId: 'wifi', kind: 'wifi', zh: { title: '配置页面与用户体验', type: '产品课', goal: '让非极客也能配网', extra: '配网页' }, en: { title: 'Config page & UX', type: 'Product', goal: 'Let non-experts provision Wi-Fi', extra: 'Config page' } },
  { id: 'factory-test', stageId: 'product', sceneLessonId: 'board', kind: 'product', zh: { title: '生产测试点', type: '交付课', goal: '产线 30 秒测完一块板', extra: '测试夹具' }, en: { title: 'Production test points', type: 'Delivery', goal: 'Test a board in ~30 seconds', extra: 'Test fixture' } },
  { id: 'portable-product', stageId: 'product', sceneLessonId: 'sleep', kind: 'sleep', zh: { title: '阶段项目：便携产品', type: '项目课', goal: '电池供电的便携产品', extra: '便携样机' }, en: { title: 'Stage project: portable product', type: 'Project', goal: 'Battery-powered portable device', extra: 'Portable prototype' } },
  { id: 'arch-split', stageId: 'projects', sceneLessonId: 'camera', kind: 'cam', zh: { title: '需求拆解与系统架构', type: '项目课', goal: '把需求拆成可验证模块', extra: '架构图' }, en: { title: 'Requirements & architecture', type: 'Project', goal: 'Split work into verifiable modules', extra: 'Architecture diagram' } },
  { id: 'cam-pipeline', stageId: 'projects', sceneLessonId: 'camera', kind: 'cam', zh: { title: '摄像头采集管线', type: '视觉课', goal: '稳定打出 JPEG 帧', extra: 'OV2640' }, en: { title: 'Camera capture pipeline', type: 'Vision', goal: 'Produce stable JPEG frames', extra: 'OV2640' } },
  { id: 'edge-vision', stageId: 'projects', sceneLessonId: 'camera', kind: 'cam', zh: { title: '边缘端图像处理', type: '视觉课', goal: '在板端做轻量检测', extra: '检测阈值' }, en: { title: 'On-device vision', type: 'Vision', goal: 'Light detection on the MCU', extra: 'Detect threshold' } },
  { id: 'cloud-alert', stageId: 'projects', sceneLessonId: 'wifi', kind: 'wifi', zh: { title: '云端存储与告警', type: '云服务课', goal: '事件能推到手机', extra: '告警通道' }, en: { title: 'Cloud storage & alerts', type: 'Cloud', goal: 'Reach a phone with retries', extra: 'Alert channel' } },
  { id: 'security-acl', stageId: 'projects', sceneLessonId: 'wifi', kind: 'wifi', zh: { title: '安全与权限', type: '安全课', goal: '固件与接口不裸奔', extra: 'ACL' }, en: { title: 'Security & access control', type: 'Security', goal: 'Do not ship open interfaces', extra: 'ACL' } },
  { id: 'release-rollback', stageId: 'projects', sceneLessonId: 'wifi', kind: 'wifi', zh: { title: '发布监控与回滚', type: '部署课', goal: '坏版本能一键回退', extra: 'OTA 槽' }, en: { title: 'Release monitoring & rollback', type: 'Deploy', goal: 'Undo a bad OTA in one step', extra: 'OTA slot' } },
  { id: 'capstone-cam', stageId: 'projects', sceneLessonId: 'camera', kind: 'cam', zh: { title: '毕业项目：ESP32-CAM 安防相机', type: '毕业项目', goal: '从需求到发布的安防相机', extra: 'ESP32-CAM' }, en: { title: 'Capstone: ESP32-CAM security camera', type: 'Capstone', goal: 'From requirements to a releasable camera', extra: 'ESP32-CAM' } },
]

export function buildFillLesson(spec: FillSpec, locale: Locale = 'zh-CN'): AdvancedLessonPackage {
  const lang = langOf(locale)
  const copy = spec[lang]
  const api = apiFor(spec.kind, lang)
  const quizBank = QUIZ[spec.id]?.[lang] ?? defaultQuiz(copy.goal, lang)
  const baseKit = kit(lang)
  const bomNote = lang === 'en' ? 'Wire per schematic; confirm voltage first' : '按原理图连接，先确认电压'
  const summary =
    lang === 'en'
      ? `${copy.goal}. Cross-check the netlist in three views, then verify with instruments and code holes.`
      : `${copy.goal}。用三视图对照网表，再用仪器和代码补全验证。`
  const description =
    lang === 'en'
      ? `${copy.title}: ${copy.goal}. Observe the healthy circuit, inject open/logic faults, complete the key API, pass the quiz, then follow the hardware checklist.`
      : `${copy.title}：${copy.goal}。观察健康电路，注入开路或逻辑故障，补全关键 API，完成测验后再对照真机清单。`

  return {
    id: spec.id,
    stageId: spec.stageId,
    title: copy.title,
    type: copy.type,
    goal: copy.goal,
    summary,
    description,
    complete: true,
    sceneLessonId: spec.sceneLessonId,
    graph: graphFor(spec.kind, copy.extra, lang),
    faults: faultsFor(spec.kind, lang),
    challenge: {
      skeleton: `// ${copy.title}\n${api.skeleton}`,
      holes: api.holes,
      tests: api.tests,
      solution: api.solution,
      guide: api.guide,
    },
    quiz: { questions: quizBank, passScore: 2 },
    kit: {
      ...baseKit,
      bom: [...baseKit.bom, { item: copy.extra, qty: 1, note: bomNote }],
    },
    tools:
      spec.kind === 'wifi' || spec.kind === 'ble' || spec.kind === 'cam'
        ? ['scope', 'serial', 'power', 'network']
        : ['scope', 'serial', 'power'],
    rubric: isProjectType(copy.type, lang) ? rubric(lang) : undefined,
  }
}

/** @deprecated Prefer buildFillLesson(FILL_SPECS…); kept for call-site migration. */
export function fillLesson(
  id: string,
  stageId: string,
  title: string,
  type: string,
  goal: string,
  sceneLessonId: LessonId,
  kind: FillKind,
  extra: string,
): AdvancedLessonPackage {
  const spec: FillSpec = {
    id,
    stageId,
    sceneLessonId,
    kind,
    zh: { title, type, goal, extra },
    en: { title, type, goal, extra },
  }
  return buildFillLesson(spec, 'zh-CN')
}
