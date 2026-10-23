import type { AdvancedLessonPackage, CircuitGraph, Fault, QuizQuestion } from './advanced-types'
import type { LessonId } from './lessons'

const MCU = { id: 'mcu', kind: 'mcu' as const, label: 'ESP32', value: 'DevKitC', x: 80, y: 150 }

const KIT = {
  bom: [
    { item: 'ESP32-DevKitC', qty: 1, note: '3.3V 逻辑' },
    { item: 'USB 数据线', qty: 1, note: '必须能传数据' },
  ],
  safety: ['先断电再改线', '禁止把市电接到实验电路', 'GPIO 不要直接灌 5V'],
  analogToReal: ['仿真是理想波形；真机要考虑接触不良、天线和供电纹波', '先在本课跑通，再对照 BOM 采购'],
}

type Kind = 'wifi' | 'ble' | 'sleep' | 'bus' | 'filter' | 'rtos' | 'cam' | 'product'

function graphFor(kind: Kind, extra: string): CircuitGraph {
  if (kind === 'wifi' || kind === 'ble') {
    return {
      parts: [MCU, { id: 'ant', kind: 'device', label: kind === 'ble' ? 'BLE 天线' : 'Wi-Fi 天线', value: '2.4GHz', x: 420, y: 80 }, { id: 'led', kind: 'led', label: '状态 LED', x: 420, y: 220 }],
      nets: [
        { id: 'rf', label: 'RF', from: 'mcu', to: 'ant', color: '#3870b8' },
        { id: 'led', label: 'GPIO2', from: 'mcu', to: 'led', color: '#e6b422' },
      ],
    }
  }
  if (kind === 'sleep') {
    return {
      parts: [MCU, { id: 'bat', kind: 'device', label: '电池', value: '3.7V Li', x: 420, y: 70 }, { id: 'dht', kind: 'dht', label: extra, x: 420, y: 210 }],
      nets: [
        { id: 'vbat', label: 'VBAT', from: 'mcu', to: 'bat', color: '#d63a2c' },
        { id: 'data', label: 'GPIO4', from: 'mcu', to: 'dht', color: '#e6b422' },
      ],
    }
  }
  if (kind === 'filter' || kind === 'bus') {
    return {
      parts: [MCU, { id: 'sensor', kind: kind === 'bus' ? 'device' : 'pot', label: extra, x: 430, y: 90 }, { id: 'oled', kind: 'oled', label: 'OLED', value: '0x3C', x: 430, y: 230 }],
      nets: [
        { id: 'sig', label: kind === 'bus' ? 'SPI/I2C' : 'GPIO34', from: 'mcu', to: 'sensor', color: '#2f9e5b' },
        { id: 'sda', label: 'SDA 21', from: 'mcu', to: 'oled', color: '#2d6fd6' },
      ],
    }
  }
  if (kind === 'cam') {
    return {
      parts: [MCU, { id: 'cam', kind: 'device', label: 'OV2640', x: 430, y: 80 }, { id: 'ant', kind: 'device', label: 'Wi-Fi', x: 430, y: 220 }],
      nets: [
        { id: 'dvp', label: 'DVP/CSI', from: 'mcu', to: 'cam', color: '#7352a4' },
        { id: 'rf', label: 'RF', from: 'mcu', to: 'ant', color: '#3870b8' },
      ],
    }
  }
  return {
    parts: [MCU, { id: 'usb', kind: 'usb', label: extra || '外设', x: 430, y: 90 }, { id: 'led', kind: 'led', label: '指示', x: 430, y: 230 }],
    nets: [
      { id: 'io', label: 'GPIO', from: 'mcu', to: 'usb', color: '#3870b8' },
      { id: 'led', label: 'GPIO2', from: 'mcu', to: 'led', color: '#e6b422' },
    ],
  }
}

function faultsFor(kind: Kind): Fault[] {
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

const API: Record<Kind, ApiPack> = {
  wifi: {
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
  ble: {
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
  sleep: {
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
  bus: {
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
  filter: {
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
  rtos: {
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
  cam: {
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
  product: {
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
}

const QUIZ: Record<string, QuizQuestion[]> = {
  'wifi-reconnect': [
    { prompt: 'Wi-Fi 掉线后正确做法？', choices: ['死循环 delay', '检测状态并重新 begin', '重启整个芯片立刻', '关掉串口'], answer: 1, explain: '判断 WL_CONNECTED，失败则限频重连。' },
    { prompt: 'ESP32 家用 Wi-Fi 频段？', choices: ['仅 5 GHz', '2.4 GHz', '6 GHz', '红外'], answer: 1, explain: '常见模组只支持 2.4 GHz。' },
    { prompt: '重连为什么要退避？', choices: ['好看', '避免打爆 AP 和自己的看门狗', 'ADC 需要休息', 'LED 会烧掉'], answer: 1, explain: '无间隔重连会占满 CPU 并被路由拉黑。' },
  ],
  'http-rest': [
    { prompt: 'REST 里 GET 通常用于？', choices: ['删除资源', '读取状态', '升级固件', '配置引脚复用'], answer: 1, explain: 'GET 读，POST/PUT 写。' },
    { prompt: '设备当 HTTP 服务器时 loop 必须？', choices: ['handleClient', '只 delay', '关闭 Wi-Fi', '关闭 ADC'], answer: 0, explain: '要轮询接入的客户端。' },
    { prompt: '不要把密码放在？', choices: ['NVS', '明文 URL 查询串并提交到公网', '配网页', '本地串口'], answer: 1, explain: '查询串会被日志和代理记录。' },
  ],
  'mqtt-pubsub': [
    { prompt: 'MQTT 发布是？', choices: ['向主题写一条消息', '扫描 I2C', 'PWM', 'OTA'], answer: 0, explain: 'publish(topic, payload)。' },
    { prompt: 'QoS 0 表示？', choices: ['至少一次', '最多一次、不保证', '精确一次', 'TCP 关闭'], answer: 1, explain: 'fire-and-forget。' },
    { prompt: '断线后要？', choices: ['重新 connect 并恢复订阅', '扔掉 Client', '改 I2C 地址', '降低波特率'], answer: 0, explain: '会话和订阅都要恢复。' },
  ],
  'websocket-ctrl': [
    { prompt: 'WebSocket 适合？', choices: ['一次性固件下载', '低延迟双向控制', '校准 ADC', '烧录熔丝'], answer: 1, explain: '连接保持，双方可随时推送。' },
    { prompt: '和 HTTP 轮询比？', choices: ['更费握手、更慢', '减少重复握手', '必须 5GHz', '不需要 Wi-Fi'], answer: 1, explain: '一次握手后复用连接。' },
    { prompt: '控制指令应？', choices: ['不校验直接 digitalWrite', '校验并限频', '放在 ISR 里解析 JSON', '用 220V 继电器演示'], answer: 1, explain: '防止抖动和注入。' },
  ],
  'ble-service': [
    { prompt: 'BLE 相对经典蓝牙？', choices: ['功耗更低、适合传感器', '必须路由器', '只能音频', '电压是 5V'], answer: 0, explain: '广播+连接，电流更友好。' },
    { prompt: '服务 UUID 的作用？', choices: ['Wi-Fi 密码', '让手机发现能力', 'ADC 通道', 'PWM 频率'], answer: 1, explain: 'GATT 用 UUID 描述服务。' },
    { prompt: '无路由器场景优先？', choices: ['BLE / SoftAP', '必须有光纤', 'I2C', '深度睡眠关闭射频'], answer: 0, explain: '手机可直接连。' },
  ],
  'packet-capture': [
    { prompt: '看 HTTP 包首先看？', choices: ['方法、路径、状态码', 'LED 颜色', '舵机角度', '晶振'], answer: 0, explain: 'GET /api 200 比 payload 更先定位。' },
    { prompt: 'MQTT 报文关键字段？', choices: ['topic 与 payload', 'GPIO 编号', '电阻色环', '舵机脉宽'], answer: 0, explain: '主题决定路由。' },
    { prompt: '抓包不能替代？', choices: ['示波器看 GPIO', '日志', '两者都要，定位层不同', 'BOM'], answer: 2, explain: '网络层和引脚层是两件事。' },
  ],
  'smart-terminal': [
    { prompt: '智能终端最小闭环？', choices: ['只闪灯', '配网 → 控制 → 状态回传', '只画外壳', '只写 README'], answer: 1, explain: '手机要能改状态并读回来。' },
    { prompt: '项目评分应包含？', choices: ['只看过视频', '重连、接口、安全提示', '点赞数', '3D 渲染帧率'], answer: 1, explain: '按清单而不是观看记录。' },
    { prompt: '控制失败先查？', choices: ['主题/路径是否一致', '把 5V 改 12V', '拆天线', '关闭 GND'], answer: 0, explain: '协议对不上比硬件更常见。' },
  ],
  'freertos-tasks': [
    { prompt: '为什么拆任务？', choices: ['采样和网络互不堵', 'ESP32 只能单线程', '减少 Flash', '取消看门狗'], answer: 0, explain: '耗时网络不应卡住采样。' },
    { prompt: '任务之间传数据常用？', choices: ['队列/通知', '直接在 ISR println', '用 delay(0)', '改主频'], answer: 0, explain: 'queue 是标准同步。' },
    { prompt: 'stack 太小会？', choices: ['栈溢出复位', '更省电', 'Wi-Fi 更快', 'ADC 更准'], answer: 0, explain: 'canary 被踩就会 panic。' },
  ],
  'dual-core': [
    { prompt: 'APP CPU / PRO CPU 常见分工？', choices: ['一核协议栈、一核控制', '两核都只闪灯', '关掉一核才能 Wi-Fi', '双核必须同优先级'], answer: 0, explain: '协议栈偏一核，控制放另一核更稳。' },
    { prompt: '共享变量要？', choices: ['volatile + 互斥/原子', '随便写', '只用 delay', '放在 GPIO'], answer: 0, explain: '双核可见性需要同步。' },
    { prompt: 'xTaskCreatePinnedToCore 的 core id？', choices: ['0 或 1', '21 或 22', '34', '115200'], answer: 0, explain: '双核编号 0/1。' },
  ],
  'hw-timer': [
    { prompt: '硬件定时器适合？', choices: ['稳定节拍、采样时钟', '打印长日志', 'HTTP JSON', '配网页'], answer: 0, explain: '比 delay 循环准。' },
    { prompt: 'ISR 里不要？', choices: ['置标志', '分配内存和打印', '清中断标志', '给队列发短消息'], answer: 1, explain: 'ISR 必须短。' },
    { prompt: '软件 delay 做周期的问题？', choices: ['被其它工作拉长', '太省电', '精度过高', '不能编译'], answer: 0, explain: 'loop 里其它代码会拖周期。' },
  ],
  'watchdog': [
    { prompt: '任务看门狗复位说明？', choices: ['有任务太久没让出', 'USB 接触不良一定', 'OLED 地址错', '电阻太大'], answer: 0, explain: '死循环或关调度过久。' },
    { prompt: '喂狗应在？', choices: ['正常路径定期', 'ISR 里拼命打印时', '只在 setup 一次', '只在睡眠中'], answer: 0, explain: '证明主路径还活着。' },
    { prompt: '发生 panic 后？', choices: ['读 backtrace 再改代码', '加大电阻', '换 5GHz', '拔 GND'], answer: 0, explain: '先看栈。' },
  ],
  'ota': [
    { prompt: 'OTA 分区至少需要？', choices: ['能轮流写入的 app 分区', '更大的面包板', '5V LED', 'I2C 上拉'], answer: 0, explain: '双 OTA 槽才能回滚。' },
    { prompt: '升级失败应？', choices: ['保留旧槽可启动', '擦掉全部 NVS', '强制 deep sleep', '关闭看门狗永久'], answer: 0, explain: '回滚是底线。' },
    { prompt: '固件来源要？', choices: ['校验签名/哈希', '任意 HTTP 明文随便跑', '放在查询串', '用串口打日志代替'], answer: 0, explain: '防篡改。' },
  ],
  'nvs': [
    { prompt: 'NVS 适合存？', choices: ['SSID、阈值等配置', '一整段 JPEG', '操作系统', '3D 模型'], answer: 0, explain: '键值小数据。' },
    { prompt: '掉电后？', choices: ['仍在 Flash', '一定丢失', '跑到 SRAM', '送到 MQTT'], answer: 0, explain: 'NVS 在 Flash。' },
    { prompt: '写入不要？', choices: ['每个 loop 狂写', '变更时写', '配网成功后写', '工厂校准写一次'], answer: 0, explain: 'Flash 有寿命。' },
  ],
  'remote-device': [
    { prompt: '远程设备要同时具备？', choices: ['重连、OTA、看门狗', '只闪灯', '只画外壳', '只接 5V 风扇'], answer: 0, explain: '现场没法天天拔 USB。' },
    { prompt: '发布前至少测？', choices: ['掉线恢复和升级失败回滚', '只测一次 LED', '只测 3D', '只测配色'], answer: 0, explain: '现场故障是网络和升级。' },
    { prompt: '密钥放？', choices: ['NVS/安全区，不进仓库', 'GitHub 公开', '原理图丝印', 'SSID 本身'], answer: 0, explain: '泄露等于设备被接管。' },
  ],
  'spi-sample': [
    { prompt: 'SPI 相对 I2C？', choices: ['通常更快、要更多线', '永远只要两根线', '不能接传感器', '电压必须 12V'], answer: 0, explain: 'CLK/MOSI/MISO/CS。' },
    { prompt: '片选 CS 的作用？', choices: ['选中从机', '提供 3.3V', '消抖', '看门狗'], answer: 0, explain: '同一总线多设备靠 CS。' },
    { prompt: '高速采样时滤波应？', choices: ['在读取后做，别挡总线', '用 delay(1000) 替代', '关掉 SPI', '改成 PWM'], answer: 0, explain: '先收齐再算。' },
  ],
  'sensor-sync': [
    { prompt: '多传感器同步关键是？', choices: ['同一时间戳/同一节拍', '不同 GND', '不同电源', '关掉串口'], answer: 0, explain: '对齐时间才能融合。' },
    { prompt: 'millis() 在睡眠后？', choices: ['可能从 0 再计，要用 RTC', '永远连续', '变成 ADC', '变成 MAC 地址'], answer: 0, explain: '深度睡眠会丢掉部分计时。' },
    { prompt: '两路传感器延迟不同要？', choices: ['记录各自采样时刻', '丢掉一路', '加大电阻', '改 5GHz'], answer: 0, explain: '融合时对齐时刻。' },
  ],
  'moving-avg': [
    { prompt: '滑动平均擅长？', choices: ['高斯白噪声', '脉冲尖峰（更好用中值）', 'Wi-Fi 配网', 'OTA'], answer: 0, explain: '平均抹平随机噪声；尖峰用中值。' },
    { prompt: '窗口越大？', choices: ['更稳更慢', '更快更吵', '电压变 5V', 'I2C 地址变了'], answer: 0, explain: '滞后增加。' },
    { prompt: '中值滤波更适合？', choices: ['偶发坏点', '缓慢温漂', '晶振校准', 'HTTP 缓存'], answer: 0, explain: '排序去极值。' },
  ],
  'kalman': [
    { prompt: '卡尔曼本质是？', choices: ['预测与观测加权融合', '只做平均', 'I2C 扫描', '看门狗'], answer: 0, explain: '用模型预测再用测量修正。' },
    { prompt: '过程噪声 Q 很大意味着？', choices: ['更信测量', '更信模型', '关掉传感器', '必须 SPI'], answer: 0, explain: '模型不可信则靠观测。' },
    { prompt: '入门不要一上来？', choices: ['上 15 维非线性滤波器', '先一维温度', '先调 Q/R', '先看曲线'], answer: 0, explain: '先一维建立直觉。' },
  ],
  'outlier': [
    { prompt: '异常值检测先定？', choices: ['阈值/四分位/变化率', 'LED 颜色', '外壳颜色', 'Git 分支'], answer: 0, explain: '没有定义就无法丢点。' },
    { prompt: '丢掉坏点后要？', choices: ['保持上一有效值或插值', '立刻 deep sleep', '改 I2C 地址', '升高到 5V'], answer: 0, explain: '避免空洞造成控制跳变。' },
    { prompt: '传感器饱和（顶死 4095）是？', choices: ['要当异常处理', '正常平均值', 'Wi-Fi 信号', '看门狗正常'], answer: 0, explain: '超量程不是真世界值。' },
  ],
  'live-chart': [
    { prompt: '实时曲线卡顿常见原因？', choices: ['点太多、刷新太勤', '电阻 220Ω', '3.3V', 'BOOT 键'], answer: 0, explain: '降采样、固定窗口。' },
    { prompt: '纵轴应？', choices: ['按物理量带单位', '随机缩放', '只用 0-255', '隐藏'], answer: 0, explain: '可读性第一。' },
    { prompt: '和示波器分工？', choices: ['示波器看电，曲线看数据', '完全一样', '曲线能看 5V 毛刺更好', '都不要'], answer: 0, explain: '层不同。' },
  ],
  'env-station': [
    { prompt: '环境监测站最小集合？', choices: ['采集、滤波、显示/上报、阈值', '只 OLED 开机画面', '只 3D', '只配色'], answer: 0, explain: '要能交付读数。' },
    { prompt: '多传感器共地？', choices: ['必须', '禁止', '可接 220V', '只接天线'], answer: 0, explain: '参考电位要同。' },
    { prompt: '项目评分看？', choices: ['故障、代码、测验、真机', '是否看过标题', '点赞', '字体'], answer: 0, explain: '掌握度清单。' },
  ],
  'battery-pm': [
    { prompt: '续航估算要？', choices: ['睡眠电流 × 时间 + 唤醒电量', '只看峰值 260mA', '只看 LED', '只看外壳'], answer: 0, explain: '占空比决定电池寿命。' },
    { prompt: '锂电池保护？', choices: ['欠压截止、限流', '直接接到 USB 5V 无管理', '反接当特性', '用市电充电口'], answer: 0, explain: '要保护板。' },
    { prompt: 'Wi-Fi 对续航？', choices: ['发射电流大，能睡就睡', '几乎不耗电', '只跟电阻有关', '只跟 OLED 有关'], answer: 0, explain: '射频是大头。' },
  ],
  'deep-sleep-power': [
    { prompt: '深度睡眠电流量级？', choices: ['数十到数百 μA（视板卡）', '永远 260mA', '0A 理想开路', '2A'], answer: 0, explain: '开发板 LDO 会抬高。' },
    { prompt: '测睡眠电流应？', choices: ['去掉费电外设，用电流计串入', '只看 USB 灯', '用示波器 10x 探头当电流表', '看 RSSI'], answer: 0, explain: 'μA 档要正确量程。' },
    { prompt: '唤醒后程序从？', choices: ['setup 再来（除非 RTC 记忆）', 'loop 中间继续', 'bootloader 菜单', 'Wi-Fi 校准页'], answer: 0, explain: 'CPU 重启。' },
  ],
  'enclosure': [
    { prompt: '外壳先保证？', choices: ['USB、天线、传感器开孔', '越小越好不管接口', '全金属密封 Wi-Fi', '按 220V 面板做'], answer: 0, explain: '接口被挡住等于废品。' },
    { prompt: '天线旁避免？', choices: ['大面积接地金属盖住', '塑料窗', '开槽', '远离电池'], answer: 0, explain: '金属会失谐。' },
    { prompt: '按键要？', choices: ['对应外壳行程', '随便打孔', '取消 GND', '改 5GHz'], answer: 0, explain: '结构对齐。' },
  ],
  'state-machine': [
    { prompt: '状态机替代？', choices: ['到处 if-else 的意大利面', 'I2C 上拉', '220Ω', 'OTA 分区'], answer: 0, explain: '显式状态可测。' },
    { prompt: '每个状态应定义？', choices: ['入口、事件、出口', '随机 delay', '只闪灯', '只打印'], answer: 0, explain: '可预测转换。' },
    { prompt: '故障状态要？', choices: ['可恢复或安全停机', '直接 while(1) 空转无日志', '关掉 GND', '升压到 12V'], answer: 0, explain: '现场要能懂。' },
  ],
  'config-ux': [
    { prompt: '给非极客配网优先？', choices: ['热点+网页或 BLE 配网', '改源代码重编', 'JTAG', '熔丝'], answer: 0, explain: '降低门槛。' },
    { prompt: '错误提示应？', choices: ['人话：密码错/找不到 Wi-Fi', '只打印 hex dump', '复位无说明', '灭灯'], answer: 0, explain: 'UX 就是可理解。' },
    { prompt: '配网成功后？', choices: ['写入 NVS 并给出确认', '每次都要重新输入', '删除固件', '关闭 3.3V'], answer: 0, explain: '记得住。' },
  ],
  'factory-test': [
    { prompt: '生产测试点目的？', choices: ['30 秒内验证关键网和射频', '给用户拆着玩', '替代外壳', '提高 5V'], answer: 0, explain: '夹具探针。' },
    { prompt: '测试程序应？', choices: ['独立、可显示 PASS/FAIL', '和发布固件混在一起无标识', '必须联网才能测 LED', '没有串口'], answer: 0, explain: '产线要立刻判定。' },
    { prompt: '不要在测试夹具上？', choices: ['接市电负载', '测 3.3V', '扫 I2C', '看电流'], answer: 0, explain: '安全。' },
  ],
  'portable-product': [
    { prompt: '便携产品关键指标？', choices: ['续航、接口、状态机、可测试', '只看 3D 是否好看', '只看课程标题', '只看点赞'], answer: 0, explain: '能带出门用。' },
    { prompt: '电量显示来自？', choices: ['电池电压/库仑计，不是猜', '随机数', 'RSSI', '舵机角度'], answer: 0, explain: 'ADC 测电池要分压。' },
    { prompt: '出门前关闭？', choices: ['不必要的 Wi-Fi/外设', 'GND', '看门狗', '上拉'], answer: 0, explain: '省电。' },
  ],
  'arch-split': [
    { prompt: '需求拆解先写？', choices: ['可验证的模块边界', '先画贴纸', '先买外壳', '先上 5GHz'], answer: 0, explain: '采集/推理/传输/电源分开测。' },
    { prompt: '接口文档应包含？', choices: ['数据格式和失败码', 'LED 品牌', '字体', '背景音乐'], answer: 0, explain: '联调靠契约。' },
    { prompt: '架构评审看？', choices: ['掉线、断电、升级路径', '配色', '点赞', '是否用过 delay(1)'], answer: 0, explain: '现场路径。' },
  ],
  'cam-pipeline': [
    { prompt: '摄像头管线顺序？', choices: ['init → 取帧 → 编码 → 发送', '先 MQTT 再 init', '先 deep sleep 再取帧', '先 5V 到数据脚'], answer: 0, explain: '没有 init 就没有 JPEG。' },
    { prompt: 'PSRAM 的意义？', choices: ['大帧缓冲', '替代天线', '替代 GND', '提高 5V'], answer: 0, explain: 'CAM 常用 PSRAM。' },
    { prompt: '取帧后必须？', choices: ['归还 framebuffer', '一直占着', '改 I2C 地址', '关掉 3.3V'], answer: 0, explain: 'fb_return。' },
  ],
  'edge-vision': [
    { prompt: '板端视觉要？', choices: ['降分辨率、轻量模型', '上云 4K', '必须 GPU', '用 delay 代替推理'], answer: 0, explain: '算力有限。' },
    { prompt: '误报处理？', choices: ['阈值+冷却时间', '每次都推送', '关掉相机', '升压'], answer: 0, explain: '告警要节流。' },
    { prompt: '隐私？', choices: ['能本地判断就不要上传原图', '无脑传云', '串口打印 JPEG', '放 GitHub'], answer: 0, explain: '最小必要。' },
  ],
  'cloud-alert': [
    { prompt: '告警通道要？', choices: ['可到达手机且可重试', '只点亮板上 LED', '只写 RAM', '只改 3D 颜色'], answer: 0, explain: '人要收到。' },
    { prompt: '云端存储先想？', choices: ['保留多久、谁能看', '无限上传', '明文密码当路径', '关掉 TLS'], answer: 0, explain: '合规和费用。' },
    { prompt: '失败时设备侧？', choices: ['本地队列，恢复后补发', '丢弃所有事件', '复位到 bootloader', '拔电池'], answer: 0, explain: '弱网是常态。' },
  ],
  'security-acl': [
    { prompt: '设备接口默认？', choices: ['要认证，不裸奔', '局域网就可以 root', '默认密码 admin', '关闭加密加快'], answer: 0, explain: '最小权限。' },
    { prompt: '固件更新要？', choices: ['签名校验', '任意 URL', '用户提交的二进制直接跑', '蓝牙广播明文'], answer: 0, explain: '供应链安全。' },
    { prompt: '调试口量产时？', choices: ['关闭或加密', '永远开着 UART shell', '打印所有密钥', '把 JTAG 拉到外壳'], answer: 0, explain: '减少攻击面。' },
  ],
  'release-rollback': [
    { prompt: '坏版本发布后？', choices: ['切回上一 app 槽', '让用户自己拆机', '删除 NVS 所有密钥', '改 I2C 地址'], answer: 0, explain: 'OTA 双槽。' },
    { prompt: '监控至少看？', choices: ['在线率、崩溃、升级成功率', '3D FPS', '点赞', '字体'], answer: 0, explain: '健康度。' },
    { prompt: '灰度发布？', choices: ['先小比例设备', '一次全量', '只升级开发者电脑', '不升级'], answer: 0, explain: '控制爆炸半径。' },
  ],
  'capstone-cam': [
    { prompt: '毕业项目要覆盖？', choices: ['架构、采集、告警、安全、发布', '只拍一张图', '只写标题', '只做外壳渲染'], answer: 0, explain: '完整闭环。' },
    { prompt: '安防相机隐私底线？', choices: ['本地检测+授权查看', '公网匿名直播', '默认无密码', '日志打出画面'], answer: 0, explain: '安全产品先安全。' },
    { prompt: '评分不是「看过」而是？', choices: ['清单项都能演示', '停留时长', '是否点开 3D', '是否收藏'], answer: 0, explain: '掌握度。' },
  ],
}

export function fillLesson(
  id: string,
  stageId: string,
  title: string,
  type: string,
  goal: string,
  sceneLessonId: LessonId,
  kind: Kind,
  extra: string,
): AdvancedLessonPackage {
  const api = API[kind]
  const quiz = QUIZ[id] ?? [
    { prompt: '本课目标？', choices: [goal, '接市电', '取消 GND', '只用 5GHz'], answer: 0, explain: '先记住目标。' },
    { prompt: '安全底线？', choices: ['3.3V 逻辑、先断电', '直接 220V', '热插拔任意模块', '反接电池当特性'], answer: 0, explain: '低压实验。' },
    { prompt: '掌握标准？', choices: ['故障+代码+测验+真机', '看过标题', '点赞', '截图'], answer: 0, explain: '清单评分。' },
  ]
  return {
    id,
    stageId,
    title,
    type,
    goal,
    summary: `${goal}。用三视图对照网表，再用仪器和代码补全验证。`,
    description: `${title}：${goal}。观察健康电路，注入开路或逻辑故障，补全关键 API，完成测验后再对照真机清单。`,
    complete: true,
    sceneLessonId,
    graph: graphFor(kind, extra),
    faults: faultsFor(kind),
    challenge: {
      skeleton: `// ${title}\n${api.skeleton}`,
      holes: api.holes,
      tests: api.tests,
      solution: api.solution,
      guide: api.guide,
    },
    quiz: { questions: quiz, passScore: 2 },
    kit: {
      ...KIT,
      bom: [...KIT.bom, { item: extra, qty: 1, note: '按原理图连接，先确认电压' }],
    },
    tools: kind === 'wifi' || kind === 'ble' || kind === 'cam' ? ['scope', 'serial', 'power', 'network'] : ['scope', 'serial', 'power'],
    rubric: type.includes('项目') || type.includes('毕业')
      ? [
          { id: 'wiring', label: '接线', detail: '开路故障已修复' },
          { id: 'code', label: '关键代码', detail: '测试通过' },
          { id: 'quiz', label: '测验', detail: '达到及格分' },
          { id: 'run', label: '运行', detail: '仿真已跑通' },
          { id: 'kit', label: '真机', detail: '已确认 BOM 与安全' },
        ]
      : undefined,
  }
}
