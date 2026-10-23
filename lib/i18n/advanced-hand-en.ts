import type { AdvancedLessonPackage, CircuitGraph, CodeChallenge, Fault, HardwareKit, Quiz, ProjectRubric } from '@/lib/advanced-types'

export type HandDeep = {
  title: string
  type: string
  goal: string
  summary: string
  description: string
  graph: CircuitGraph
  faults: Fault[]
  challenge: CodeChallenge
  quiz: Quiz
  kit: HardwareKit
  rubric?: ProjectRubric
}

const MCU = { id: 'mcu', kind: 'mcu' as const, label: 'ESP32', value: 'DevKitC', x: 90, y: 160 }

const KIT_USB: HardwareKit = {
  bom: [{ item: 'USB data cable', qty: 1, note: 'Charge-only cables cannot flash' }],
  safety: ['Confirm USB 5V supply and 3.3V logic', 'Never feed 5V into a GPIO'],
  analogToReal: ['Sim serial is ideal text; real boards hit drivers, baud mismatch, or weak USB power'],
}

const KIT_LOW: HardwareKit = {
  bom: [
    { item: 'ESP32-DevKitC', qty: 1, note: '3.3V logic' },
    { item: 'Breadboard + jumper wires', qty: 1, note: 'Power rails must share GND' },
  ],
  safety: ['Power off before rewiring', 'Keep single GPIO ≤ ~20 mA', 'Never connect mains to the lab circuit'],
  analogToReal: ['Loose breadboard holes cause “sim OK, real flaky”', 'Broken jumper cores are the most common open'],
}

const BOARD_GRAPH: CircuitGraph = {
  parts: [MCU, { id: 'usb', kind: 'usb', label: 'USB-UART', value: '115200', x: 420, y: 80 }],
  nets: [{ id: 'usb', label: 'TX/RX', from: 'mcu', to: 'usb', color: '#3870b8' }],
}

/** Full English deep packs for the seven hand-authored advanced lessons. */
export const HAND_ADVANCED_EN: Record<string, HandDeep> = {
  'gpio-isr': {
    title: 'GPIO interrupts & debounce',
    type: 'Concept',
    goal: 'Trigger once—and only once—per press',
    summary: 'Interrupts react instantly, but mechanical bounce can fire dozens of edges per click.',
    description:
      'Wire the button to GPIO4 with INPUT_PULLUP. Set a flag in the ISR; debounce with millis (≥20 ms) in loop before toggling the LED. On the scope, bounce is a burst of spikes; after debounce you get a clean edge.',
    graph: {
      parts: [
        MCU,
        { id: 'btn', kind: 'button', label: 'Tactile button', x: 430, y: 70 },
        { id: 'pull', kind: 'pullup', label: 'Pull-up', value: 'Internal ~45kΩ', x: 430, y: 170 },
        { id: 'led', kind: 'led', label: 'LED', x: 430, y: 270 },
        { id: 'r220', kind: 'resistor', label: 'Current limit', value: '220Ω', x: 280, y: 270 },
      ],
      nets: [
        { id: 'gpio4', label: 'GPIO4', from: 'mcu', to: 'btn', color: '#e8772e' },
        { id: 'pullup', label: 'Pull-up', from: 'btn', to: 'pull', color: '#8c7851' },
        { id: 'gpio2', label: 'GPIO2', from: 'mcu', to: 'r220', color: '#e6b422' },
        { id: 'lednet', label: 'LED', from: 'r220', to: 'led', color: '#d63a2c' },
      ],
    },
    faults: [
      { id: 'floating', title: 'Floating pin', kind: 'floating', netId: 'pullup', symptoms: ['ISR fires with no press', 'Scope wanders between 0/3.3V'], passBy: 'click-net' },
      { id: 'wrong-pin', title: 'Wrong interrupt pin', kind: 'wrong-pin', netId: 'gpio4', symptoms: ['Press does nothing to LED', 'No GPIO4 edge in serial'], passBy: 'click-net' },
      { id: 'no-debounce', title: 'No debounce', kind: 'wrong-value', symptoms: ['One press prints a dozen lines', 'Spike cluster on press'], passBy: 'code' },
    ],
    challenge: {
      skeleton: `const int BTN = 4;\nconst int LED = 2;\nvolatile bool pending = false;\n\nvoid IRAM_ATTR onBtn() {\n  pending = true;\n}\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  // TODO: internal pull-up + falling-edge interrupt\n}\n\nvoid loop() {\n  if (pending) {\n    // TODO: debounce with a timestamp, then toggle LED\n    pending = false;\n  }\n}`,
      holes: [
        { id: 'attach', hint: 'pinMode(BTN, INPUT_PULLUP); attachInterrupt(BTN, onBtn, FALLING);' },
        { id: 'toggle', hint: 'digitalWrite(LED, !digitalRead(LED));' },
      ],
      tests: [
        { name: 'Internal pull-up', includes: ['INPUT_PULLUP'] },
        { name: 'Register interrupt', includes: ['attachInterrupt'] },
        { name: 'Debounce or millis', regex: 'millis|debounce' },
      ],
      solution: `const int BTN = 4;\nconst int LED = 2;\nvolatile bool pending = false;\nunsigned long lastMs = 0;\n\nvoid IRAM_ATTR onBtn() {\n  pending = true;\n}\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  pinMode(BTN, INPUT_PULLUP);\n  attachInterrupt(BTN, onBtn, FALLING);\n}\n\nvoid loop() {\n  if (pending) {\n    unsigned long now = millis();\n    if (now - lastMs > 20) {\n      digitalWrite(LED, !digitalRead(LED));\n      lastMs = now;\n    }\n    pending = false;\n  }\n}`,
      guide: [
        { title: 'What goes in setup', body: 'pinMode(BTN, INPUT_PULLUP) stops floating; attachInterrupt(BTN, onBtn, FALLING) arms the edge.' },
        { title: 'What goes in loop', body: 'ISR only sets pending; debounce with millis (≥20 ms) then digitalWrite to toggle the LED.' },
      ],
    },
    quiz: {
      passScore: 3,
      questions: [
        { prompt: 'Worst thing to do inside an ISR?', choices: ['Set a volatile flag', 'Serial.println a long string', 'Note that an IRQ happened', 'Return from the ISR'], answer: 1, explain: 'Prints stall the ISR and can re-enter. Set a flag; handle in loop.' },
        { prompt: 'Mechanical bounce lasts about?', choices: ['1 μs', '5–20 ms', '1 second', 'Never bounces'], answer: 1, explain: 'Metal contacts bounce for a few to ~20 ms.' },
        { prompt: 'INPUT_PULLUP does what?', choices: ['Drive the pin to 5V', 'Hold a defined HIGH when released', 'Limit LED current', 'Enable ADC'], answer: 1, explain: 'Without a pull-up the pin floats and IRQs fire randomly.' },
        { prompt: 'FALLING means?', choices: ['High→low edge', 'Level stays low', 'Low→high', 'Both edges'], answer: 0, explain: 'Press pulls GPIO to GND—a falling edge.' },
      ],
    },
    kit: {
      ...KIT_LOW,
      bom: [
        ...KIT_LOW.bom,
        { item: '6×6 mm tactile button', qty: 1, note: 'Straddle the breadboard gap' },
        { item: '5mm LED + 220Ω', qty: 1, note: 'Shows whether the IRQ was handled' },
      ],
      analogToReal: ['Real bounce count varies by switch', 'Long jumpers add extra spikes—lengthen debounce'],
    },
  },
  'adc-filter': {
    title: 'ADC calibration & filtering',
    type: 'Lab',
    goal: 'Turn noisy ADC counts into usable volts',
    summary: 'ESP32 ADC is nonlinear and noisy. A moving average steadies the curve before you scale by 3.3V/4095.',
    description:
      'Potentiometer wiper to GPIO34 (ADC1). Unfiltered scope looks spiky; after averaging it follows the knob. Avoid ADC2 pins while Wi-Fi is on.',
    graph: {
      parts: [
        MCU,
        { id: 'pot', kind: 'pot', label: 'Potentiometer', value: '10k linear', x: 430, y: 120 },
        { id: 'led', kind: 'led', label: 'PWM LED', x: 430, y: 250 },
      ],
      nets: [
        { id: 'vcc', label: '3V3', from: 'mcu', to: 'pot', color: '#d63a2c' },
        { id: 'wiper', label: 'GPIO34', from: 'pot', to: 'mcu', color: '#2f9e5b' },
        { id: 'gnd', label: 'GND', from: 'pot', to: 'mcu', color: '#26292e' },
        { id: 'pwm', label: 'GPIO2', from: 'mcu', to: 'led', color: '#e6b422' },
      ],
    },
    faults: [
      { id: 'floating-adc', title: 'ADC floating', kind: 'floating', netId: 'wiper', symptoms: ['Readings thrash wildly', 'Knob does not move the average'], passBy: 'click-net' },
      { id: '5v-in', title: 'Tied to 5V', kind: 'wrong-value', netId: 'vcc', symptoms: ['Stuck at 4095', 'Power draw looks high'], passBy: 'click-net' },
      { id: 'no-filter', title: 'No filter', kind: 'wrong-value', symptoms: ['Spiky curve', 'Serial jumps tens of LSB each sample'], passBy: 'code' },
    ],
    challenge: {
      skeleton: `const int POT = 34;\nint avg = 0;\n\nvoid setup() {\n  Serial.begin(115200);\n  analogReadResolution(12);\n}\n\nvoid loop() {\n  int raw = analogRead(POT);\n  // TODO: moving average\n  Serial.printf("raw=%d avg=%d V=%.2f\\n", raw, avg, avg * 3.3 / 4095.0);\n  delay(50);\n}`,
      holes: [{ id: 'avg', hint: 'avg = (avg * 7 + raw) / 8;' }],
      tests: [
        { name: 'Read ADC', includes: ['analogRead'] },
        { name: 'Moving average', regex: 'avg|average|filter' },
      ],
      solution: `const int POT = 34;\nint avg = 0;\n\nvoid setup() {\n  Serial.begin(115200);\n  analogReadResolution(12);\n}\n\nvoid loop() {\n  int raw = analogRead(POT);\n  avg = (avg * 7 + raw) / 8;\n  Serial.printf("raw=%d avg=%d V=%.2f\\n", raw, avg, avg * 3.3 / 4095.0);\n  delay(50);\n}`,
      guide: [
        { title: 'Where', body: 'In loop, right after analogRead.' },
        { title: 'What', body: 'avg = (avg * 7 + raw) / 8; then scale avg to volts or PWM.' },
      ],
    },
    quiz: {
      passScore: 3,
      questions: [
        { prompt: 'Default ESP32 ADC resolution?', choices: ['8-bit 0–255', '10-bit 0–1023', '12-bit 0–4095', '16-bit'], answer: 2, explain: '12-bit quantization across ~3.3V.' },
        { prompt: 'With Wi-Fi on, avoid which ADC?', choices: ['ADC1', 'ADC2', 'Internal temp', 'Doesn’t matter'], answer: 1, explain: 'ADC2 conflicts with Wi-Fi. GPIO34 is ADC1.' },
        { prompt: 'Moving average mainly?', choices: ['Raises sample rate', 'Suppresses random noise', 'Boosts to 5V', 'Calibrates the crystal'], answer: 1, explain: 'History dampens noise; response gets slower.' },
        { prompt: 'Pot wiper should go to?', choices: ['5V', 'An input-only ADC pin', 'TX', 'EN'], answer: 1, explain: 'Wiper is an analog voltage—use GPIO34-class input-only pins.' },
      ],
    },
    kit: {
      ...KIT_LOW,
      bom: [...KIT_LOW.bom, { item: 'B10K potentiometer', qty: 1, note: 'Ends to 3V3/GND; wiper to GPIO34' }],
      analogToReal: ['Real ADC is nonlinear—3.3V often never hits 4095', 'USB supply ripple shows up on unfiltered curves'],
    },
  },
  'serial-log': {
    title: 'Serial debug & logging',
    type: 'Tools',
    goal: 'Read what the firmware is doing with leveled logs',
    summary: 'Serial is the cheapest scope. Timestamps, levels, and throttling keep signal from drowning in spam.',
    description:
      '115200 8N1 over USB-UART. Mismatched baud = garbage. Printing from an ISR or a tight loop with no delay can stall the system and raise UART power.',
    graph: BOARD_GRAPH,
    faults: [
      { id: 'baud', title: 'Baud mismatch', kind: 'wrong-value', netId: 'usb', symptoms: ['Monitor is gibberish', 'Scope sees data but unreadable'], passBy: 'click-net' },
      { id: 'flood', title: 'Log flood', kind: 'wrong-value', symptoms: ['UI stutters', 'Power higher', 'Real errors buried'], passBy: 'code' },
    ],
    challenge: {
      skeleton: `enum { LOG_INFO = 1, LOG_WARN = 2 };\n\nvoid logMsg(int level, const char* msg) {\n  // TODO: print millis timestamp and level\n}\n\nvoid setup() {\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  logMsg(LOG_INFO, "heartbeat");\n  delay(500);\n}`,
      holes: [{ id: 'log', hint: 'Serial.printf("[%lu][%d] %s\\n", millis(), level, msg);' }],
      tests: [
        { name: '115200 baud', includes: ['115200'] },
        { name: 'millis timestamp', includes: ['millis'] },
      ],
      solution: `enum { LOG_INFO = 1, LOG_WARN = 2 };\n\nvoid logMsg(int level, const char* msg) {\n  Serial.printf("[%lu][%d] %s\\n", millis(), level, msg);\n}\n\nvoid setup() {\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  logMsg(LOG_INFO, "heartbeat");\n  delay(500);\n}`,
      guide: [
        { title: 'Where', body: 'Wrap printing in logMsg; setup only does Serial.begin(115200).' },
        { title: 'What', body: 'Stamp with millis(), then level + message—avoid unbounded spam.' },
      ],
    },
    quiz: {
      passScore: 2,
      questions: [
        { prompt: 'Default lab baud rate?', choices: ['9600', '115200', '1 Mbps', 'Auto'], answer: 1, explain: 'Sketches use Serial.begin(115200).' },
        { prompt: 'Most common gibberish cause?', choices: ['LED reversed', 'Baud mismatch', 'No antenna', 'ADC over-range'], answer: 1, explain: 'UART has no clock wire—both ends must agree.' },
        { prompt: 'Why not print in an ISR?', choices: ['Fonts look bad', 'Prints are slow and may re-enter', 'Serial is Chinese-only', 'Burns Flash'], answer: 1, explain: 'ISRs must be short—log from the main loop.' },
      ],
    },
    kit: KIT_USB,
  },
  'open-wire': {
    title: 'Fault injection: open wire',
    type: 'Debug',
    goal: 'Tell open circuits from polarity or wrong resistors',
    summary: 'GPIO is toggling high but the LED stays dark—use scope, current, and net clicks to find the break.',
    description:
      'Healthy path is GPIO2 → 220Ω → LED → GND. Opens leave a 3.3V square on GPIO but no light and near-idle current. Too-large R makes a dim LED. Reversed LED stays dark with almost no current.',
    graph: {
      parts: [
        MCU,
        { id: 'r220', kind: 'resistor', label: 'Current limit', value: '220Ω', x: 300, y: 140 },
        { id: 'led', kind: 'led', label: 'LED', x: 470, y: 140 },
      ],
      nets: [
        { id: 'gpio2', label: 'GPIO2', from: 'mcu', to: 'r220', color: '#e6b422' },
        { id: 'lednet', label: 'LED+', from: 'r220', to: 'led', color: '#d63a2c' },
        { id: 'gnd', label: 'GND', from: 'led', to: 'mcu', color: '#26292e' },
      ],
    },
    faults: [
      { id: 'open-gpio', title: 'GPIO wire open', kind: 'open', netId: 'gpio2', symptoms: ['LED dark', 'No square wave at resistor', 'Current near idle'], passBy: 'click-net' },
      { id: 'open-gnd', title: 'Ground open', kind: 'open', netId: 'gnd', symptoms: ['LED dark', 'GPIO still squares', 'Loop current ≈ 0'], passBy: 'click-net' },
      { id: 'wrong-r', title: 'Resistor too large', kind: 'wrong-value', partId: 'r220', symptoms: ['Very dim LED', 'Only hundreds of µA'], passBy: 'click-part' },
    ],
    challenge: {
      skeleton: `const int LED = 2;\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  digitalWrite(LED, HIGH);\n  Serial.println("probe HIGH");\n  delay(500);\n  digitalWrite(LED, LOW);\n  delay(500);\n}`,
      holes: [{ id: 'pin', hint: 'Keep GPIO2 toggling; use instruments against the schematic' }],
      tests: [
        { name: 'Configure output', includes: ['pinMode'] },
        { name: 'Toggle GPIO', includes: ['digitalWrite'] },
      ],
      solution: `const int LED = 2;\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  digitalWrite(LED, HIGH);\n  Serial.println("probe HIGH");\n  delay(500);\n  digitalWrite(LED, LOW);\n  delay(500);\n}`,
      guide: [
        { title: 'Focus of this lesson', body: 'Code can keep squaring; practice clicking the open nets against the schematic.' },
        { title: 'How to hunt', body: 'GPIO waves but LED dark → check resistor→LED or GND opens; ~0 mA almost always means a broken return path.' },
      ],
    },
    quiz: {
      passScore: 2,
      questions: [
        { prompt: 'GPIO squares, LED dark, current ≈0—check first?', choices: ['Firmware didn’t compile', 'Open in the loop', 'Crystal stopped', 'Wi-Fi channel'], answer: 1, explain: 'The pin is moving; the path is broken.' },
        { prompt: 'Reversed LED usually?', choices: ['Same brightness', 'Almost dark', 'Resets ESP32', 'Instantly kills ADC'], answer: 1, explain: 'Reverse only leaks tiny current.' },
        { prompt: 'Swap 220Ω for 10kΩ?', choices: ['Brighter', 'Dimmer', 'Voltage becomes 5V', 'IRQs stop'], answer: 1, explain: 'I≈(3.3−Vf)/R—larger R, dimmer LED.' },
      ],
    },
    kit: {
      ...KIT_LOW,
      bom: [
        ...KIT_LOW.bom,
        { item: '5mm LED', qty: 1, note: 'Long leg = anode' },
        { item: '220Ω resistor', qty: 1, note: 'Don’t grab a 10k by mistake' },
      ],
    },
  },
  'crash-log': {
    title: 'Stacks & crash logs',
    type: 'Debug',
    goal: 'Find the crash site from a Guru Meditation',
    summary: 'Watchdogs, null pointers, and recursion leave reproducible backtraces. Read the reason, then fix code.',
    description:
      'A bad recursive routine prints Guru Meditation and a Backtrace. Add a base case and protect tasks—don’t recover inside an ISR.',
    graph: BOARD_GRAPH,
    faults: [
      { id: 'reentry', title: 'Infinite recursion', kind: 'wrong-value', symptoms: ['Guru Meditation', 'Stack overflow', 'Repeated resets'], passBy: 'code' },
    ],
    challenge: {
      skeleton: `int safeWork(int n) {\n  // TODO: write a base case and recurse with a smaller n\n  return n + safeWork(n);\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  Serial.printf("sum=%d\\n", safeWork(5));\n}\n\nvoid loop() {\n  delay(1000);\n}`,
      holes: [{ id: 'base', hint: 'Recursion needs a base case n<=0' }],
      tests: [
        { name: 'Has base case', regex: 'n\\s*<=\\s*0|n\\s*==\\s*0' },
        { name: 'Decrements', includes: ['n - 1'] },
      ],
      solution: `int safeWork(int n) {\n  if (n <= 0) return 0;\n  return n + safeWork(n - 1);\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  Serial.printf("sum=%d\\n", safeWork(5));\n}\n\nvoid loop() {\n  delay(1000);\n}`,
      guide: [
        { title: 'Where', body: 'Fix safeWork: base case first, then recurse with n-1.' },
        { title: 'What', body: 'if (n <= 0) return 0; return n + safeWork(n - 1); avoids blowing the stack.' },
      ],
    },
    quiz: {
      passScore: 2,
      questions: [
        { prompt: 'Guru Meditation usually means?', choices: ['Compile succeeded', 'Fatal exception / panic', 'Weak Wi-Fi', 'ADC cal done'], answer: 1, explain: 'ESP-IDF panic banner plus exception type and backtrace.' },
        { prompt: 'LoadProhibited most often from?', choices: ['Null/wild pointer deref', 'LED resistor too big', 'Baud 9600', 'No antenna'], answer: 0, explain: 'CPU touched an illegal address.' },
        { prompt: 'Task WDT reset means?', choices: ['Undervoltage', 'A task didn’t yield for too long', 'Flash full', 'I2C address clash'], answer: 1, explain: 'Spin loops or long IRQ-off windows starve the dog.' },
      ],
    },
    kit: KIT_USB,
  },
  'sensor-node': {
    title: 'Stage project: sensor node',
    type: 'Project',
    goal: 'Read, display, and report one environmental value reliably',
    summary: 'Combine filtering, serial logs, and I2C OLED into a deliverable node.',
    description:
      'DHT11 → average → OLED, overheat LED, timestamped serial. Score wiring, code tests, quiz, hardware ack, and a real run.',
    graph: {
      parts: [
        MCU,
        { id: 'dht', kind: 'dht', label: 'DHT11', x: 420, y: 70 },
        { id: 'oled', kind: 'oled', label: 'OLED 0x3C', x: 420, y: 180 },
        { id: 'led', kind: 'led', label: 'Alarm LED', x: 420, y: 280 },
      ],
      nets: [
        { id: 'data', label: 'GPIO4 DATA', from: 'mcu', to: 'dht', color: '#e6b422' },
        { id: 'sda', label: 'SDA 21', from: 'mcu', to: 'oled', color: '#2f9e5b' },
        { id: 'scl', label: 'SCL 22', from: 'mcu', to: 'oled', color: '#2d6fd6' },
        { id: 'lednet', label: 'GPIO2', from: 'mcu', to: 'led', color: '#d63a2c' },
      ],
    },
    faults: [
      { id: 'dht-open', title: 'DATA open', kind: 'open', netId: 'data', symptoms: ['Temperature NaN', 'Alarm flickers'], passBy: 'click-net' },
      { id: 'sda-open', title: 'SDA open', kind: 'open', netId: 'sda', symptoms: ['Blank OLED', 'I2C NACK'], passBy: 'click-net' },
    ],
    challenge: {
      skeleton: `#include <Wire.h>\n#include <DHT.h>\nDHT dht(4, DHT11);\nfloat avg = 25;\n\nvoid setup() {\n  Serial.begin(115200);\n  dht.begin();\n  // TODO: I2C pins\n  pinMode(2, OUTPUT);\n}\n\nvoid loop() {\n  // TODO: read temp, average, raise GPIO2 on overheat\n  delay(2000);\n}`,
      holes: [
        { id: 'wire', hint: 'Wire.begin(21, 22);' },
        { id: 'avg', hint: 'avg = avg * 0.8 + t * 0.2; digitalWrite(2, avg > 30);' },
      ],
      tests: [
        { name: 'Init I2C', includes: ['Wire.begin'] },
        { name: 'Read temperature', includes: ['readTemperature'] },
        { name: 'Overheat or GPIO2', regex: 'digitalWrite|avg' },
      ],
      solution: `#include <Wire.h>\n#include <DHT.h>\nDHT dht(4, DHT11);\nfloat avg = 25;\n\nvoid setup() {\n  Serial.begin(115200);\n  dht.begin();\n  Wire.begin(21, 22);\n  pinMode(2, OUTPUT);\n}\n\nvoid loop() {\n  float t = dht.readTemperature();\n  if (!isnan(t)) avg = avg * 0.8 + t * 0.2;\n  digitalWrite(2, avg > 30);\n  Serial.printf("t=%.1f avg=%.1f\\n", t, avg);\n  delay(2000);\n}`,
      guide: [
        { title: 'setup', body: 'After dht.begin(), Wire.begin(21, 22), then pinMode(2, OUTPUT).' },
        { title: 'loop', body: 'readTemperature → moving average → raise GPIO2 when avg>30; print for cross-check.' },
      ],
    },
    quiz: {
      passScore: 2,
      questions: [
        { prompt: 'Minimal node loop includes?', choices: ['Only blink', 'Sense → process → output (display/log/actuator)', 'Only Wi-Fi', 'Only a schematic'], answer: 1, explain: 'A deliverable node turns data into observable output.' },
        { prompt: 'DHT11 sample interval?', choices: ['1 ms', '≥ 1 s', 'Must be 1 hour', 'As fast as possible'], answer: 1, explain: 'Datasheet wants about ≥1 s between reads.' },
        { prompt: 'Why not score “watched” alone?', choices: ['Looks nicer', 'Doesn’t prove fault-finding or key code', 'localStorage too small', '3D models too big'], answer: 1, explain: 'Mastery comes from faults, tests, quiz, and hardware ack.' },
      ],
    },
    kit: {
      ...KIT_LOW,
      bom: [
        ...KIT_LOW.bom,
        { item: 'DHT11', qty: 1, note: 'DATA → GPIO4; VCC 3.3–5V' },
        { item: 'SSD1306 OLED', qty: 1, note: 'VCC to 3.3V; address 0x3C' },
      ],
      analogToReal: ['DHT11 is ±2°C—don’t treat sim temps as cal truth', 'OLED needs 3.3V; 5V can damage some modules'],
    },
    rubric: [
      { id: 'wiring', label: 'Wiring complete', detail: 'DHT, OLED, LED opens fixed' },
      { id: 'code', label: 'Key code', detail: 'I2C init, filter, and alarm tests pass' },
      { id: 'quiz', label: 'Concept quiz', detail: 'Pass score reached' },
      { id: 'run', label: 'Sim run', detail: 'Stable temperature logs on serial' },
      { id: 'kit', label: 'Hardware ack', detail: 'BOM and safety read' },
    ],
  },
  'i2c-scan': {
    title: 'I2C bus scan',
    type: 'Bus',
    goal: 'Find devices on the bus and explain empty scans',
    summary: 'SDA/SCL need pull-ups. A scan is beginTransmission across addresses 1–127.',
    description:
      'ESP32 GPIO21/22 to OLED. 4.7k pull-ups idle the bus at 3.3V. Open SDA → all NACK; missing pull-ups → bus never returns high; code using 0x3D misses 0x3C; two slaves on one address fight.',
    graph: {
      parts: [
        MCU,
        { id: 'sda-r', kind: 'pullup', label: 'SDA pull-up', value: '4.7kΩ', x: 280, y: 70 },
        { id: 'scl-r', kind: 'pullup', label: 'SCL pull-up', value: '4.7kΩ', x: 280, y: 160 },
        { id: 'oled', kind: 'oled', label: 'SSD1306', value: '0x3C', x: 460, y: 90 },
        { id: 'ghost', kind: 'device', label: 'Conflicting slave', value: '0x3C?', x: 460, y: 230 },
      ],
      nets: [
        { id: 'sda', label: 'SDA · GPIO21', from: 'mcu', to: 'oled', color: '#2f9e5b' },
        { id: 'scl', label: 'SCL · GPIO22', from: 'mcu', to: 'oled', color: '#2d6fd6' },
        { id: 'sda-pu', label: 'SDA pull-up', from: 'sda-r', to: 'oled', color: '#d63a2c' },
        { id: 'scl-pu', label: 'SCL pull-up', from: 'scl-r', to: 'oled', color: '#d63a2c' },
        { id: 'conflict', label: '2nd slave SDA', from: 'ghost', to: 'oled', color: '#f25042' },
      ],
    },
    faults: [
      { id: 'sda-open', title: 'SDA open', kind: 'open', netId: 'sda', symptoms: ['Scan finds nothing', 'SCL may still clock', 'Blank OLED'], passBy: 'click-net' },
      { id: 'no-pullup', title: 'Missing pull-up', kind: 'floating', netId: 'sda-pu', symptoms: ['Bus never returns high', 'Empty/random scan', 'Odd power'], passBy: 'click-net' },
      { id: 'wrong-addr', title: 'Address coded as 0x3D', kind: 'wrong-value', symptoms: ['Scan sees 0x3C but display lib fails', 'beginTransmission(0x3D) NACK'], passBy: 'code' },
      { id: 'conflict', title: 'Address conflict', kind: 'address-conflict', netId: 'conflict', partId: 'ghost', symptoms: ['0x3C flaky', 'Bus contention on the scope'], passBy: 'click-part' },
    ],
    challenge: {
      skeleton: `#include <Wire.h>\n\nvoid setup() {\n  Serial.begin(115200);\n  // TODO: init bus, SDA=21 SCL=22\n}\n\nvoid loop() {\n  Serial.println("I2C scan");\n  for (byte addr = 1; addr < 127; addr++) {\n    // TODO: address each slave and check ACK\n  }\n  delay(2000);\n}`,
      holes: [
        { id: 'begin', hint: 'Wire.begin(21, 22);' },
        { id: 'addr', hint: 'Device address 0x3C—not 0x3D' },
      ],
      tests: [
        { name: 'Init Wire', includes: ['Wire.begin'] },
        { name: 'Pins 21/22', regex: 'Wire\\.begin\\(\\s*21\\s*,\\s*22\\s*\\)' },
        { name: 'Scan transfer', includes: ['beginTransmission'] },
        { name: 'Uses 0x3C', includes: ['0x3C'] },
      ],
      solution: `#include <Wire.h>\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin(21, 22);\n}\n\nvoid loop() {\n  Serial.println("I2C scan");\n  for (byte addr = 1; addr < 127; addr++) {\n    Wire.beginTransmission(addr);\n    if (Wire.endTransmission() == 0) {\n      Serial.printf("found 0x%02X\\n", addr);\n    }\n  }\n  // Display libs should use 0x3C, not 0x3D\n  Wire.beginTransmission(0x3C);\n  Wire.endTransmission();\n  delay(2000);\n}`,
      guide: [
        { title: 'setup', body: 'Wire.begin(21, 22) — SDA=21, SCL=22.' },
        { title: 'loop scan', body: 'For each address: beginTransmission + endTransmission; 0 means ACK.' },
        { title: 'Address', body: 'SSD1306 is usually 0x3C; 0x3D breaks many display libs.' },
      ],
    },
    quiz: {
      passScore: 3,
      questions: [
        { prompt: 'Idle I2C SDA/SCL should be?', choices: ['GND', 'Pulled high to VCC', 'Undefined Hi-Z', 'Must be 5V'], answer: 1, explain: 'Open-drain bus returns high via pull-ups.' },
        { prompt: '7-bit address 0x3C means?', choices: ['Baud rate', 'Slave address', 'PWM frequency', 'ADC channel'], answer: 1, explain: 'SSD1306 is commonly 0x3C (sometimes 0x3D).' },
        { prompt: 'Two slaves, same address?', choices: ['Take turns automatically', 'Bus fight, unreliable ACK', 'Current halves', 'Becomes SPI'], answer: 1, explain: 'ACKs stack; host can’t tell them apart.' },
        { prompt: 'Why GPIO21/22 still OK with Wi-Fi?', choices: ['They aren’t ADC2 sample pins', 'I2C doesn’t use GPIO', 'Wi-Fi disables I2C', 'Must use ADC2'], answer: 0, explain: 'Conflict is ADC2, not default I2C pins.' },
      ],
    },
    kit: {
      ...KIT_LOW,
      bom: [
        ...KIT_LOW.bom,
        { item: 'SSD1306 128×64 OLED', qty: 1, note: 'VCC→3V3, SDA→21, SCL→22' },
        { item: '4.7kΩ resistors', qty: 2, note: 'Skip if the module already has pull-ups' },
      ],
      safety: [...KIT_LOW.safety, '3.3V-marked OLEDs must not see 5V', 'Power off before hot-plugging I2C devices'],
      analogToReal: [
        'Some OLED modules already have 4.7k pull-ups—extra ones still work, but too-strong pull-ups dull edges',
        'Use an I2C scanner sketch to match this lesson’s serial output',
        'Long wires: drop to ~50 kHz and strengthen pull-ups',
      ],
    },
  },
}

export function applyHandDeep(lesson: AdvancedLessonPackage, pack: HandDeep | undefined): AdvancedLessonPackage {
  if (!pack) return lesson
  return {
    ...lesson,
    title: pack.title,
    type: pack.type,
    goal: pack.goal,
    summary: pack.summary,
    description: pack.description,
    graph: pack.graph,
    faults: pack.faults,
    challenge: pack.challenge,
    quiz: pack.quiz,
    kit: pack.kit,
    rubric: pack.rubric ?? lesson.rubric,
  }
}

export function applyHandAdvancedEn(lesson: AdvancedLessonPackage): AdvancedLessonPackage {
  return applyHandDeep(lesson, HAND_ADVANCED_EN[lesson.id])
}
