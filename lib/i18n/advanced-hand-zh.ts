import type { AdvancedLessonPackage } from '@/lib/advanced-types'
import { applyHandDeep, type HandDeep } from './advanced-hand-en'

/** Chinese deep pack for hand-authored advanced lessons — peer of HAND_ADVANCED_EN. */
export const HAND_ADVANCED_ZH: Record<string, HandDeep> = {
  "gpio-isr": {
    "title": "GPIO 中断与消抖",
    "type": "概念课",
    "goal": "让按键触发一次、且只触发一次",
    "summary": "中断能立刻响应按键，但机械抖动会让一次按下变成十几次中断。",
    "description": "把按钮接到 GPIO4，用 INPUT_PULLUP 避免浮空。ISR 里只记标志位，在 loop 里用 millis 做 20 ms 消抖后再翻转 LED。示波器上抖动是一丛毛刺；消抖后是干净的边沿。",
    "graph": {
      "parts": [
        {
          "id": "mcu",
          "kind": "mcu",
          "label": "ESP32",
          "value": "DevKitC",
          "x": 90,
          "y": 160
        },
        {
          "id": "btn",
          "kind": "button",
          "label": "轻触按钮",
          "x": 430,
          "y": 70
        },
        {
          "id": "pull",
          "kind": "pullup",
          "label": "上拉",
          "value": "内部 45kΩ",
          "x": 430,
          "y": 170
        },
        {
          "id": "led",
          "kind": "led",
          "label": "LED",
          "x": 430,
          "y": 270
        },
        {
          "id": "r220",
          "kind": "resistor",
          "label": "限流",
          "value": "220Ω",
          "x": 280,
          "y": 270
        }
      ],
      "nets": [
        {
          "id": "gpio4",
          "label": "GPIO4",
          "from": "mcu",
          "to": "btn",
          "color": "#e8772e"
        },
        {
          "id": "pullup",
          "label": "上拉",
          "from": "btn",
          "to": "pull",
          "color": "#8c7851"
        },
        {
          "id": "gpio2",
          "label": "GPIO2",
          "from": "mcu",
          "to": "r220",
          "color": "#e6b422"
        },
        {
          "id": "lednet",
          "label": "LED",
          "from": "r220",
          "to": "led",
          "color": "#d63a2c"
        }
      ]
    },
    "faults": [
      {
        "id": "floating",
        "title": "引脚浮空",
        "kind": "floating",
        "netId": "pullup",
        "symptoms": [
          "未按键时 ISR 随机触发",
          "示波器在 0/3.3V 之间游走"
        ],
        "passBy": "click-net"
      },
      {
        "id": "wrong-pin",
        "title": "中断脚接错",
        "kind": "wrong-pin",
        "netId": "gpio4",
        "symptoms": [
          "按下按钮 LED 无变化",
          "串口看不到 GPIO4 边沿"
        ],
        "passBy": "click-net"
      },
      {
        "id": "no-debounce",
        "title": "未消抖",
        "kind": "wrong-value",
        "symptoms": [
          "按一次打印十几行",
          "示波器按下瞬间有毛刺簇"
        ],
        "passBy": "code"
      }
    ],
    "challenge": {
      "skeleton": "const int BTN = 4;\nconst int LED = 2;\nvolatile bool pending = false;\n\nvoid IRAM_ATTR onBtn() {\n  pending = true;\n}\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  // TODO: 内部上拉 + 下降沿中断\n}\n\nvoid loop() {\n  if (pending) {\n    // TODO: 用时间戳消抖后翻转 LED\n    pending = false;\n  }\n}",
      "holes": [
        {
          "id": "attach",
          "hint": "pinMode(BTN, INPUT_PULLUP); attachInterrupt(BTN, onBtn, FALLING);"
        },
        {
          "id": "toggle",
          "hint": "digitalWrite(LED, !digitalRead(LED));"
        }
      ],
      "tests": [
        {
          "name": "内部上拉",
          "includes": [
            "INPUT_PULLUP"
          ]
        },
        {
          "name": "注册中断",
          "includes": [
            "attachInterrupt"
          ]
        },
        {
          "name": "消抖或 millis",
          "regex": "millis|debounce"
        }
      ],
      "solution": "const int BTN = 4;\nconst int LED = 2;\nvolatile bool pending = false;\nunsigned long lastMs = 0;\n\nvoid IRAM_ATTR onBtn() {\n  pending = true;\n}\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  pinMode(BTN, INPUT_PULLUP);\n  attachInterrupt(BTN, onBtn, FALLING);\n}\n\nvoid loop() {\n  if (pending) {\n    unsigned long now = millis();\n    if (now - lastMs > 20) {\n      digitalWrite(LED, !digitalRead(LED));\n      lastMs = now;\n    }\n    pending = false;\n  }\n}",
      "guide": [
        {
          "title": "setup 里写什么",
          "body": "pinMode(BTN, INPUT_PULLUP) 避免浮空，再用 attachInterrupt(BTN, onBtn, FALLING) 注册下降沿。"
        },
        {
          "title": "loop 里写什么",
          "body": "ISR 只置 pending；在 loop 里用 millis 做 ≥20ms 消抖后再 digitalWrite 翻转 LED。"
        }
      ]
    },
    "quiz": {
      "passScore": 3,
      "questions": [
        {
          "prompt": "ISR 里最不该做的事是？",
          "choices": [
            "置位一个 volatile 标志",
            "Serial.println 长字符串",
            "记录发生过中断",
            "退出 ISR"
          ],
          "answer": 1,
          "explain": "打印会拖住中断，甚至重入。只置标志，在 loop 处理。"
        },
        {
          "prompt": "机械按键抖动大约多久？",
          "choices": [
            "1 μs",
            "5–20 ms",
            "1 秒",
            "不会抖动"
          ],
          "answer": 1,
          "explain": "金属触点回弹会在几毫秒到二十毫秒内产生多次边沿。"
        },
        {
          "prompt": "INPUT_PULLUP 的作用？",
          "choices": [
            "把引脚推到 5V",
            "松开时保持确定高电平",
            "给 LED 限流",
            "开启 ADC"
          ],
          "answer": 1,
          "explain": "没有上拉时引脚浮空，中断会乱触发。"
        },
        {
          "prompt": "FALLING 表示？",
          "choices": [
            "从高到低的边沿",
            "电平一直为低",
            "从低到高",
            "双边沿"
          ],
          "answer": 0,
          "explain": "按下把 GPIO 拉到 GND，是下降沿。"
        }
      ]
    },
    "kit": {
      "bom": [
        {
          "item": "ESP32-DevKitC",
          "qty": 1,
          "note": "3.3V 逻辑"
        },
        {
          "item": "面包板 + 杜邦线",
          "qty": 1,
          "note": "电源轨必须共地"
        },
        {
          "item": "6×6 mm 轻触按钮",
          "qty": 1,
          "note": "跨插在面包板凹槽上"
        },
        {
          "item": "5mm LED + 220Ω",
          "qty": 1,
          "note": "指示中断是否被处理"
        }
      ],
      "safety": [
        "先断电再改线",
        "GPIO 单脚建议 ≤ 20 mA",
        "禁止把市电接到实验电路"
      ],
      "analogToReal": [
        "真机抖动次数随按钮而变",
        "杜邦线太长会引入额外毛刺，需要更长消抖"
      ]
    }
  },
  "adc-filter": {
    "title": "ADC 校准与滤波",
    "type": "实验课",
    "goal": "把抖动的 ADC 读数变成可用的电压",
    "summary": "ESP32 ADC 非线性且有噪声。滑动平均能稳住曲线，再按 3.3V/4095 换算。",
    "description": "电位器分压接到 GPIO34（ADC1）。未滤波时示波器像毛刺山；滑动平均后跟随旋钮。Wi-Fi 开启时不要使用 ADC2 引脚。",
    "graph": {
      "parts": [
        {
          "id": "mcu",
          "kind": "mcu",
          "label": "ESP32",
          "value": "DevKitC",
          "x": 90,
          "y": 160
        },
        {
          "id": "pot",
          "kind": "pot",
          "label": "电位器",
          "value": "10k 线性",
          "x": 430,
          "y": 120
        },
        {
          "id": "led",
          "kind": "led",
          "label": "PWM LED",
          "x": 430,
          "y": 250
        }
      ],
      "nets": [
        {
          "id": "vcc",
          "label": "3V3",
          "from": "mcu",
          "to": "pot",
          "color": "#d63a2c"
        },
        {
          "id": "wiper",
          "label": "GPIO34",
          "from": "pot",
          "to": "mcu",
          "color": "#2f9e5b"
        },
        {
          "id": "gnd",
          "label": "GND",
          "from": "pot",
          "to": "mcu",
          "color": "#26292e"
        },
        {
          "id": "pwm",
          "label": "GPIO2",
          "from": "mcu",
          "to": "led",
          "color": "#e6b422"
        }
      ]
    },
    "faults": [
      {
        "id": "floating-adc",
        "title": "ADC 悬空",
        "kind": "floating",
        "netId": "wiper",
        "symptoms": [
          "读数满屏乱跳",
          "旋钮不影响平均值"
        ],
        "passBy": "click-net"
      },
      {
        "id": "5v-in",
        "title": "接到 5V",
        "kind": "wrong-value",
        "netId": "vcc",
        "symptoms": [
          "读数顶死在 4095",
          "功耗异常偏高"
        ],
        "passBy": "click-net"
      },
      {
        "id": "no-filter",
        "title": "没有滤波",
        "kind": "wrong-value",
        "symptoms": [
          "曲线毛刺大",
          "串口每次相差几十 LSB"
        ],
        "passBy": "code"
      }
    ],
    "challenge": {
      "skeleton": "const int POT = 34;\nint avg = 0;\n\nvoid setup() {\n  Serial.begin(115200);\n  analogReadResolution(12);\n}\n\nvoid loop() {\n  int raw = analogRead(POT);\n  // TODO: 滑动平均\n  Serial.printf(\"raw=%d avg=%d V=%.2f\\n\", raw, avg, avg * 3.3 / 4095.0);\n  delay(50);\n}",
      "holes": [
        {
          "id": "avg",
          "hint": "avg = (avg * 7 + raw) / 8;"
        }
      ],
      "tests": [
        {
          "name": "读取 ADC",
          "includes": [
            "analogRead"
          ]
        },
        {
          "name": "滑动平均",
          "regex": "avg|average|filter"
        }
      ],
      "solution": "const int POT = 34;\nint avg = 0;\n\nvoid setup() {\n  Serial.begin(115200);\n  analogReadResolution(12);\n}\n\nvoid loop() {\n  int raw = analogRead(POT);\n  avg = (avg * 7 + raw) / 8;\n  Serial.printf(\"raw=%d avg=%d V=%.2f\\n\", raw, avg, avg * 3.3 / 4095.0);\n  delay(50);\n}",
      "guide": [
        {
          "title": "放哪里",
          "body": "在 loop 里、analogRead 之后立刻写滤波公式。"
        },
        {
          "title": "写什么",
          "body": "avg = (avg * 7 + raw) / 8; 再用 avg 换算电压或驱动 PWM。"
        }
      ]
    },
    "quiz": {
      "passScore": 3,
      "questions": [
        {
          "prompt": "ESP32 ADC 默认分辨率？",
          "choices": [
            "8 位 0–255",
            "10 位 0–1023",
            "12 位 0–4095",
            "16 位"
          ],
          "answer": 2,
          "explain": "12 位量化，满量程约 3.3V。"
        },
        {
          "prompt": "Wi-Fi 工作时不要用哪组 ADC？",
          "choices": [
            "ADC1",
            "ADC2",
            "内部温度",
            "都没关系"
          ],
          "answer": 1,
          "explain": "ADC2 与 Wi-Fi 冲突。GPIO34 属于 ADC1。"
        },
        {
          "prompt": "滑动平均的主要作用？",
          "choices": [
            "提高采样率",
            "抑制随机噪声",
            "把电压升到 5V",
            "校准晶振"
          ],
          "answer": 1,
          "explain": "用历史样本压低噪声，代价是响应变慢。"
        },
        {
          "prompt": "电位器中间脚应接到？",
          "choices": [
            "5V",
            "仅输入 ADC 脚",
            "TX",
            "EN"
          ],
          "answer": 1,
          "explain": "滑片是模拟电压输出，接到 GPIO34 这类仅输入脚。"
        }
      ]
    },
    "kit": {
      "bom": [
        {
          "item": "ESP32-DevKitC",
          "qty": 1,
          "note": "3.3V 逻辑"
        },
        {
          "item": "面包板 + 杜邦线",
          "qty": 1,
          "note": "电源轨必须共地"
        },
        {
          "item": "B10K 电位器",
          "qty": 1,
          "note": "两端 3V3/GND，中脚 GPIO34"
        }
      ],
      "safety": [
        "先断电再改线",
        "GPIO 单脚建议 ≤ 20 mA",
        "禁止把市电接到实验电路"
      ],
      "analogToReal": [
        "真机 ADC 有非线性，3.3V 往往读不到 4095",
        "USB 供电纹波会直接出现在未滤波曲线上"
      ]
    }
  },
  "serial-log": {
    "title": "串口调试与日志系统",
    "type": "工具课",
    "goal": "用分级日志看懂程序在干什么",
    "summary": "串口是最便宜的示波器。时间戳、级别和节流能避免把问题淹没在刷屏里。",
    "description": "115200 8N1 连接 USB 转串口。波特率不一致会得到乱码。ISR 或 loop 里无延迟的打印会堵死系统，功耗也会被 UART 拉高。",
    "graph": {
      "parts": [
        {
          "id": "mcu",
          "kind": "mcu",
          "label": "ESP32",
          "value": "DevKitC",
          "x": 90,
          "y": 160
        },
        {
          "id": "usb",
          "kind": "usb",
          "label": "USB-UART",
          "value": "115200",
          "x": 420,
          "y": 80
        }
      ],
      "nets": [
        {
          "id": "usb",
          "label": "TX/RX",
          "from": "mcu",
          "to": "usb",
          "color": "#3870b8"
        }
      ]
    },
    "faults": [
      {
        "id": "baud",
        "title": "波特率不匹配",
        "kind": "wrong-value",
        "netId": "usb",
        "symptoms": [
          "监视器全是乱码",
          "示波器有数据但不可读"
        ],
        "passBy": "click-net"
      },
      {
        "id": "flood",
        "title": "日志洪水",
        "kind": "wrong-value",
        "symptoms": [
          "卡顿",
          "功耗偏高",
          "看不到关键错误"
        ],
        "passBy": "code"
      }
    ],
    "challenge": {
      "skeleton": "enum { LOG_INFO = 1, LOG_WARN = 2 };\n\nvoid logMsg(int level, const char* msg) {\n  // TODO: 打印毫秒时间戳和级别\n}\n\nvoid setup() {\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  logMsg(LOG_INFO, \"heartbeat\");\n  delay(500);\n}",
      "holes": [
        {
          "id": "log",
          "hint": "Serial.printf(\"[%lu][%d] %s\\n\", millis(), level, msg);"
        }
      ],
      "tests": [
        {
          "name": "115200 波特率",
          "includes": [
            "115200"
          ]
        },
        {
          "name": "millis 时间戳",
          "includes": [
            "millis"
          ]
        }
      ],
      "solution": "enum { LOG_INFO = 1, LOG_WARN = 2 };\n\nvoid logMsg(int level, const char* msg) {\n  Serial.printf(\"[%lu][%d] %s\\n\", millis(), level, msg);\n}\n\nvoid setup() {\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  logMsg(LOG_INFO, \"heartbeat\");\n  delay(500);\n}",
      "guide": [
        {
          "title": "放哪里",
          "body": "封装在 logMsg 函数里；setup 只负责 Serial.begin(115200)。"
        },
        {
          "title": "写什么",
          "body": "用 millis() 做时间戳，再打印级别和消息，避免无延迟刷屏。"
        }
      ]
    },
    "quiz": {
      "passScore": 2,
      "questions": [
        {
          "prompt": "本实验室默认波特率？",
          "choices": [
            "9600",
            "115200",
            "1 Mbps",
            "自动"
          ],
          "answer": 1,
          "explain": "示例代码统一 Serial.begin(115200)。"
        },
        {
          "prompt": "乱码最常见原因？",
          "choices": [
            "LED 接反",
            "双方波特率不一致",
            "没有天线",
            "ADC 超范围"
          ],
          "answer": 1,
          "explain": "UART 没有时钟线，靠约定波特率采样。"
        },
        {
          "prompt": "为什么不要在 ISR 里打印？",
          "choices": [
            "字体不够好看",
            "打印耗时长且可能重入",
            "串口只支持中文",
            "会烧掉 Flash"
          ],
          "answer": 1,
          "explain": "ISR 必须短。把日志放到主循环。"
        }
      ]
    },
    "kit": {
      "bom": [
        {
          "item": "USB 数据线（能传数据）",
          "qty": 1,
          "note": "充电线无法烧录"
        }
      ],
      "safety": [
        "先确认板子供电为 USB 5V，逻辑为 3.3V",
        "不要把 5V 信号直接接到 GPIO"
      ],
      "analogToReal": [
        "仿真串口是理想文本；真机可能出现驱动、波特率或 USB 供电不足"
      ]
    }
  },
  "open-wire": {
    "title": "故障注入：断线诊断",
    "type": "排错课",
    "goal": "根据现象判断是开路、接反还是阻值错误",
    "summary": "GPIO 已经输出高电平，LED 仍不亮——从示波器、功耗和点击网表定位断点。",
    "description": "健康电路是 GPIO2 → 220Ω → LED → GND。开路时 GPIO 仍有 3.3V 方波但灯不亮、电流接近静态。电阻过大则灯极暗。LED 接反则完全不亮且几乎无电流。",
    "graph": {
      "parts": [
        {
          "id": "mcu",
          "kind": "mcu",
          "label": "ESP32",
          "value": "DevKitC",
          "x": 90,
          "y": 160
        },
        {
          "id": "r220",
          "kind": "resistor",
          "label": "限流",
          "value": "220Ω",
          "x": 300,
          "y": 140
        },
        {
          "id": "led",
          "kind": "led",
          "label": "LED",
          "x": 470,
          "y": 140
        }
      ],
      "nets": [
        {
          "id": "gpio2",
          "label": "GPIO2",
          "from": "mcu",
          "to": "r220",
          "color": "#e6b422"
        },
        {
          "id": "lednet",
          "label": "LED+",
          "from": "r220",
          "to": "led",
          "color": "#d63a2c"
        },
        {
          "id": "gnd",
          "label": "GND",
          "from": "led",
          "to": "mcu",
          "color": "#26292e"
        }
      ]
    },
    "faults": [
      {
        "id": "open-gpio",
        "title": "GPIO 线脱落",
        "kind": "open",
        "netId": "gpio2",
        "symptoms": [
          "LED 不亮",
          "示波器在电阻端看不到方波",
          "电流接近空载"
        ],
        "passBy": "click-net"
      },
      {
        "id": "open-gnd",
        "title": "地线脱落",
        "kind": "open",
        "netId": "gnd",
        "symptoms": [
          "LED 不亮",
          "GPIO 仍有方波",
          "回路电流为 0"
        ],
        "passBy": "click-net"
      },
      {
        "id": "wrong-r",
        "title": "电阻过大",
        "kind": "wrong-value",
        "partId": "r220",
        "symptoms": [
          "灯极暗",
          "电流只有几百微安"
        ],
        "passBy": "click-part"
      }
    ],
    "challenge": {
      "skeleton": "const int LED = 2;\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  digitalWrite(LED, HIGH);\n  Serial.println(\"probe HIGH\");\n  delay(500);\n  digitalWrite(LED, LOW);\n  delay(500);\n}",
      "holes": [
        {
          "id": "pin",
          "hint": "保持 GPIO2 输出，用仪器对照原理图"
        }
      ],
      "tests": [
        {
          "name": "配置输出",
          "includes": [
            "pinMode"
          ]
        },
        {
          "name": "翻转 GPIO",
          "includes": [
            "digitalWrite"
          ]
        }
      ],
      "solution": "const int LED = 2;\n\nvoid setup() {\n  pinMode(LED, OUTPUT);\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  digitalWrite(LED, HIGH);\n  Serial.println(\"probe HIGH\");\n  delay(500);\n  digitalWrite(LED, LOW);\n  delay(500);\n}",
      "guide": [
        {
          "title": "本课重点",
          "body": "代码本身可以保持输出方波；真正要练的是对照原理图点选开路网表。"
        },
        {
          "title": "怎么查",
          "body": "GPIO 有波、灯不亮 → 查限流到 LED 或 GND 是否开路；电流≈0 几乎一定是回路断了。"
        }
      ]
    },
    "quiz": {
      "passScore": 2,
      "questions": [
        {
          "prompt": "GPIO 有方波、LED 不亮、电流≈0，优先查？",
          "choices": [
            "固件没编译",
            "回路开路",
            "晶振停振",
            "Wi-Fi 频道"
          ],
          "answer": 1,
          "explain": "驱动脚已经在动，问题在电路通路。"
        },
        {
          "prompt": "LED 接反时通常？",
          "choices": [
            "一样亮",
            "几乎不亮",
            "ESP32 复位",
            "ADC 损坏立刻发生"
          ],
          "answer": 1,
          "explain": "反向只能流极小漏电流。"
        },
        {
          "prompt": "限流电阻从 220Ω 换成 10kΩ？",
          "choices": [
            "更亮",
            "更暗",
            "电压升到 5V",
            "中断无法触发"
          ],
          "answer": 1,
          "explain": "电流 I≈(3.3-Vf)/R，R 变大灯变暗。"
        }
      ]
    },
    "kit": {
      "bom": [
        {
          "item": "ESP32-DevKitC",
          "qty": 1,
          "note": "3.3V 逻辑"
        },
        {
          "item": "面包板 + 杜邦线",
          "qty": 1,
          "note": "电源轨必须共地"
        },
        {
          "item": "5mm LED",
          "qty": 1,
          "note": "长脚阳极"
        },
        {
          "item": "220Ω 电阻",
          "qty": 1,
          "note": "不要随手拿 10kΩ 当限流"
        }
      ],
      "safety": [
        "先断电再改线",
        "GPIO 单脚建议 ≤ 20 mA",
        "禁止把市电接到实验电路"
      ],
      "analogToReal": [
        "面包板孔松动会造成「仿真正常、真机断续」",
        "杜邦线内部断裂是最常见的开路故障"
      ]
    }
  },
  "crash-log": {
    "title": "看懂堆栈与崩溃日志",
    "type": "排错课",
    "goal": "从 Guru Meditation 找到崩溃点",
    "summary": "看门狗、空指针和递归会留下可复现的栈回溯。先读原因，再改代码。",
    "description": "运行有缺陷的递归后，串口会出现 Guru Meditation 和 Backtrace。正确做法是去掉无限递归，并用看门狗或超时保护任务，而不是在 ISR 里救火。",
    "graph": {
      "parts": [
        {
          "id": "mcu",
          "kind": "mcu",
          "label": "ESP32",
          "value": "DevKitC",
          "x": 90,
          "y": 160
        },
        {
          "id": "usb",
          "kind": "usb",
          "label": "USB-UART",
          "value": "115200",
          "x": 420,
          "y": 80
        }
      ],
      "nets": [
        {
          "id": "usb",
          "label": "TX/RX",
          "from": "mcu",
          "to": "usb",
          "color": "#3870b8"
        }
      ]
    },
    "faults": [
      {
        "id": "reentry",
        "title": "无限递归",
        "kind": "wrong-value",
        "symptoms": [
          "Guru Meditation",
          "栈溢出",
          "设备反复复位"
        ],
        "passBy": "code"
      }
    ],
    "challenge": {
      "skeleton": "int safeWork(int n) {\n  // TODO: 写终止条件，并让递归参数递减\n  return n + safeWork(n);\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  Serial.printf(\"sum=%d\\n\", safeWork(5));\n}\n\nvoid loop() {\n  delay(1000);\n}",
      "holes": [
        {
          "id": "base",
          "hint": "递归必须有终止条件 n<=0"
        }
      ],
      "tests": [
        {
          "name": "有终止条件",
          "regex": "n\\s*<=\\s*0|n\\s*==\\s*0"
        },
        {
          "name": "递归递减",
          "includes": [
            "n - 1"
          ]
        }
      ],
      "solution": "int safeWork(int n) {\n  if (n <= 0) return 0;\n  return n + safeWork(n - 1);\n}\n\nvoid setup() {\n  Serial.begin(115200);\n  Serial.printf(\"sum=%d\\n\", safeWork(5));\n}\n\nvoid loop() {\n  delay(1000);\n}",
      "guide": [
        {
          "title": "放哪里",
          "body": "改 safeWork 函数体：先写 if 终止，再递归调用 n-1。"
        },
        {
          "title": "写什么",
          "body": "if (n <= 0) return 0; return n + safeWork(n - 1); 避免无限递归撑爆栈。"
        }
      ]
    },
    "quiz": {
      "passScore": 2,
      "questions": [
        {
          "prompt": "Guru Meditation 通常表示？",
          "choices": [
            "编译成功",
            "致命异常 / panic",
            "Wi-Fi 信号差",
            "ADC 校准完成"
          ],
          "answer": 1,
          "explain": "这是 ESP-IDF 的 panic 横幅，后面跟异常类型和 backtrace。"
        },
        {
          "prompt": "LoadProhibited 最常见原因？",
          "choices": [
            "空指针或野指针解引用",
            "LED 限流太大",
            "波特率 9600",
            "没接天线"
          ],
          "answer": 0,
          "explain": "CPU 访问了非法地址。"
        },
        {
          "prompt": "任务看门狗复位说明？",
          "choices": [
            "供电不足",
            "某个任务太久没让出 CPU",
            "Flash 写满",
            "I2C 地址冲突"
          ],
          "answer": 1,
          "explain": "死循环或长时间关中断会喂不了看门狗。"
        }
      ]
    },
    "kit": {
      "bom": [
        {
          "item": "USB 数据线（能传数据）",
          "qty": 1,
          "note": "充电线无法烧录"
        }
      ],
      "safety": [
        "先确认板子供电为 USB 5V，逻辑为 3.3V",
        "不要把 5V 信号直接接到 GPIO"
      ],
      "analogToReal": [
        "仿真串口是理想文本；真机可能出现驱动、波特率或 USB 供电不足"
      ]
    }
  },
  "sensor-node": {
    "title": "阶段项目：传感器节点",
    "type": "项目课",
    "goal": "稳定读取、显示并上报一个环境量",
    "summary": "把消抖/滤波、串口日志和 I2C 显示收成一个可交付的小节点。",
    "description": "DHT11 读温度，滑动平均后写到 OLED，过热点亮 LED，串口带时间戳。项目按清单评分：接线完整、代码测试、测验、真机确认、实际运行。",
    "graph": {
      "parts": [
        {
          "id": "mcu",
          "kind": "mcu",
          "label": "ESP32",
          "value": "DevKitC",
          "x": 90,
          "y": 160
        },
        {
          "id": "dht",
          "kind": "dht",
          "label": "DHT11",
          "x": 420,
          "y": 70
        },
        {
          "id": "oled",
          "kind": "oled",
          "label": "OLED 0x3C",
          "x": 420,
          "y": 180
        },
        {
          "id": "led",
          "kind": "led",
          "label": "报警 LED",
          "x": 420,
          "y": 280
        }
      ],
      "nets": [
        {
          "id": "data",
          "label": "GPIO4 DATA",
          "from": "mcu",
          "to": "dht",
          "color": "#e6b422"
        },
        {
          "id": "sda",
          "label": "SDA 21",
          "from": "mcu",
          "to": "oled",
          "color": "#2f9e5b"
        },
        {
          "id": "scl",
          "label": "SCL 22",
          "from": "mcu",
          "to": "oled",
          "color": "#2d6fd6"
        },
        {
          "id": "lednet",
          "label": "GPIO2",
          "from": "mcu",
          "to": "led",
          "color": "#d63a2c"
        }
      ]
    },
    "faults": [
      {
        "id": "dht-open",
        "title": "DATA 脱落",
        "kind": "open",
        "netId": "data",
        "symptoms": [
          "温度 nan",
          "报警乱闪"
        ],
        "passBy": "click-net"
      },
      {
        "id": "sda-open",
        "title": "SDA 脱落",
        "kind": "open",
        "netId": "sda",
        "symptoms": [
          "OLED 无字",
          "I2C NACK"
        ],
        "passBy": "click-net"
      }
    ],
    "challenge": {
      "skeleton": "#include <Wire.h>\n#include <DHT.h>\nDHT dht(4, DHT11);\nfloat avg = 25;\n\nvoid setup() {\n  Serial.begin(115200);\n  dht.begin();\n  // TODO: I2C 引脚\n  pinMode(2, OUTPUT);\n}\n\nvoid loop() {\n  // TODO: 读温度、平均滤波，过热拉高 GPIO2\n  delay(2000);\n}",
      "holes": [
        {
          "id": "wire",
          "hint": "Wire.begin(21, 22);"
        },
        {
          "id": "avg",
          "hint": "avg = avg * 0.8 + t * 0.2; digitalWrite(2, avg > 30);"
        }
      ],
      "tests": [
        {
          "name": "初始化 I2C",
          "includes": [
            "Wire.begin"
          ]
        },
        {
          "name": "读取温度",
          "includes": [
            "readTemperature"
          ]
        },
        {
          "name": "过热或 GPIO2",
          "regex": "digitalWrite|avg"
        }
      ],
      "solution": "#include <Wire.h>\n#include <DHT.h>\nDHT dht(4, DHT11);\nfloat avg = 25;\n\nvoid setup() {\n  Serial.begin(115200);\n  dht.begin();\n  Wire.begin(21, 22);\n  pinMode(2, OUTPUT);\n}\n\nvoid loop() {\n  float t = dht.readTemperature();\n  if (!isnan(t)) avg = avg * 0.8 + t * 0.2;\n  digitalWrite(2, avg > 30);\n  Serial.printf(\"t=%.1f avg=%.1f\\n\", t, avg);\n  delay(2000);\n}",
      "guide": [
        {
          "title": "setup",
          "body": "dht.begin() 后写 Wire.begin(21, 22)，再 pinMode(2, OUTPUT)。"
        },
        {
          "title": "loop",
          "body": "readTemperature → 滑动平均 → avg>30 时拉高 GPIO2，串口打印便于对照。"
        }
      ]
    },
    "quiz": {
      "passScore": 2,
      "questions": [
        {
          "prompt": "节点最小闭环包含？",
          "choices": [
            "只闪灯",
            "采集 → 处理 → 输出（显示/日志/执行器）",
            "只连 Wi-Fi",
            "只画原理图"
          ],
          "answer": 1,
          "explain": "能交付的节点必须把数据变成可观察的输出。"
        },
        {
          "prompt": "DHT11 采样间隔建议？",
          "choices": [
            "1 ms",
            "≥ 1 s",
            "必须 1 小时",
            "越快越好"
          ],
          "answer": 1,
          "explain": "传感器手册要求至少约 1 秒间隔。"
        },
        {
          "prompt": "项目评分不应只记录「看过」，是因为？",
          "choices": [
            "好看",
            "无法证明能独立排除故障和补全关键代码",
            "localStorage 不够",
            "3D 模型太大"
          ],
          "answer": 1,
          "explain": "掌握度来自故障、测试、测验和真机确认。"
        }
      ]
    },
    "kit": {
      "bom": [
        {
          "item": "ESP32-DevKitC",
          "qty": 1,
          "note": "3.3V 逻辑"
        },
        {
          "item": "面包板 + 杜邦线",
          "qty": 1,
          "note": "电源轨必须共地"
        },
        {
          "item": "DHT11",
          "qty": 1,
          "note": "DATA → GPIO4，VCC 仅 3.3–5V"
        },
        {
          "item": "SSD1306 OLED",
          "qty": 1,
          "note": "VCC 接 3.3V，地址 0x3C"
        }
      ],
      "safety": [
        "先断电再改线",
        "GPIO 单脚建议 ≤ 20 mA",
        "禁止把市电接到实验电路"
      ],
      "analogToReal": [
        "DHT11 精度 ±2°C，不要用仿真温度当校准标准",
        "OLED 必须 3.3V，接 5V 可能损坏"
      ]
    },
    "rubric": [
      {
        "id": "wiring",
        "label": "接线完整",
        "detail": "DHT、OLED、LED 的开路故障均已修复"
      },
      {
        "id": "code",
        "label": "关键代码",
        "detail": "I2C 初始化、滤波与报警测试通过"
      },
      {
        "id": "quiz",
        "label": "概念测验",
        "detail": "达到及格分"
      },
      {
        "id": "run",
        "label": "仿真运行",
        "detail": "串口出现稳定温度日志"
      },
      {
        "id": "kit",
        "label": "真机确认",
        "detail": "已阅读 BOM 与安全提示"
      }
    ]
  },
  "i2c-scan": {
    "title": "I2C 总线扫描",
    "type": "总线课",
    "goal": "在总线上找到设备，并解释找不到的原因",
    "summary": "SDA/SCL 需要上拉。扫描就是对 1–127 依次 beginTransmission。",
    "description": "ESP32 GPIO21/22 连接 OLED。4.7k 上拉让空闲总线停在 3.3V。SDA 断开时全部 NACK；缺少上拉则电平无法回到高、扫描为空；地址写成 0x3D 则认不出 0x3C；两个从机同一地址会冲突。",
    "graph": {
      "parts": [
        {
          "id": "mcu",
          "kind": "mcu",
          "label": "ESP32",
          "value": "DevKitC",
          "x": 90,
          "y": 160
        },
        {
          "id": "sda-r",
          "kind": "pullup",
          "label": "SDA 上拉",
          "value": "4.7kΩ",
          "x": 280,
          "y": 70
        },
        {
          "id": "scl-r",
          "kind": "pullup",
          "label": "SCL 上拉",
          "value": "4.7kΩ",
          "x": 280,
          "y": 160
        },
        {
          "id": "oled",
          "kind": "oled",
          "label": "SSD1306",
          "value": "0x3C",
          "x": 460,
          "y": 90
        },
        {
          "id": "ghost",
          "kind": "device",
          "label": "冲突从机",
          "value": "0x3C?",
          "x": 460,
          "y": 230
        }
      ],
      "nets": [
        {
          "id": "sda",
          "label": "SDA · GPIO21",
          "from": "mcu",
          "to": "oled",
          "color": "#2f9e5b"
        },
        {
          "id": "scl",
          "label": "SCL · GPIO22",
          "from": "mcu",
          "to": "oled",
          "color": "#2d6fd6"
        },
        {
          "id": "sda-pu",
          "label": "SDA 上拉",
          "from": "sda-r",
          "to": "oled",
          "color": "#d63a2c"
        },
        {
          "id": "scl-pu",
          "label": "SCL 上拉",
          "from": "scl-r",
          "to": "oled",
          "color": "#d63a2c"
        },
        {
          "id": "conflict",
          "label": "第二从机 SDA",
          "from": "ghost",
          "to": "oled",
          "color": "#f25042"
        }
      ]
    },
    "faults": [
      {
        "id": "sda-open",
        "title": "SDA 断开",
        "kind": "open",
        "netId": "sda",
        "symptoms": [
          "扫描不到任何地址",
          "SCL 仍可能有时钟",
          "OLED 空白"
        ],
        "passBy": "click-net"
      },
      {
        "id": "no-pullup",
        "title": "缺少上拉",
        "kind": "floating",
        "netId": "sda-pu",
        "symptoms": [
          "总线无法回到高电平",
          "扫描为空或随机地址",
          "功耗异常"
        ],
        "passBy": "click-net"
      },
      {
        "id": "wrong-addr",
        "title": "地址写成 0x3D",
        "kind": "wrong-value",
        "symptoms": [
          "scan 能看到 0x3C 但显示库失败",
          "beginTransmission(0x3D) NACK"
        ],
        "passBy": "code"
      },
      {
        "id": "conflict",
        "title": "地址冲突",
        "kind": "address-conflict",
        "netId": "conflict",
        "partId": "ghost",
        "symptoms": [
          "0x3C 时好时坏",
          "波形出现总线竞争"
        ],
        "passBy": "click-part"
      }
    ],
    "challenge": {
      "skeleton": "#include <Wire.h>\n\nvoid setup() {\n  Serial.begin(115200);\n  // TODO: 初始化总线，SDA=21 SCL=22\n}\n\nvoid loop() {\n  Serial.println(\"I2C scan\");\n  for (byte addr = 1; addr < 127; addr++) {\n    // TODO: 依次寻址并从机应答\n  }\n  delay(2000);\n}",
      "holes": [
        {
          "id": "begin",
          "hint": "Wire.begin(21, 22);"
        },
        {
          "id": "addr",
          "hint": "设备地址 0x3C，不要写 0x3D"
        }
      ],
      "tests": [
        {
          "name": "初始化 Wire",
          "includes": [
            "Wire.begin"
          ]
        },
        {
          "name": "指定 21/22",
          "regex": "Wire\\.begin\\(\\s*21\\s*,\\s*22\\s*\\)"
        },
        {
          "name": "扫描传输",
          "includes": [
            "beginTransmission"
          ]
        },
        {
          "name": "使用 0x3C",
          "includes": [
            "0x3C"
          ]
        }
      ],
      "solution": "#include <Wire.h>\n\nvoid setup() {\n  Serial.begin(115200);\n  Wire.begin(21, 22);\n}\n\nvoid loop() {\n  Serial.println(\"I2C scan\");\n  for (byte addr = 1; addr < 127; addr++) {\n    Wire.beginTransmission(addr);\n    if (Wire.endTransmission() == 0) {\n      Serial.printf(\"found 0x%02X\\n\", addr);\n    }\n  }\n  // 显示库请用 0x3C，不要写成 0x3D\n  Wire.beginTransmission(0x3C);\n  Wire.endTransmission();\n  delay(2000);\n}",
      "guide": [
        {
          "title": "setup",
          "body": "Wire.begin(21, 22) —— SDA=21、SCL=22。"
        },
        {
          "title": "loop 扫描",
          "body": "对每个地址 beginTransmission + endTransmission，返回 0 表示 ACK。"
        },
        {
          "title": "地址",
          "body": "SSD1306 常见是 0x3C；写成 0x3D 会导致显示库失败。"
        }
      ]
    },
    "quiz": {
      "passScore": 3,
      "questions": [
        {
          "prompt": "I2C 空闲时 SDA/SCL 应被拉到？",
          "choices": [
            "GND",
            "高电平（上拉到 VCC）",
            "高阻无定义",
            "5V 必须"
          ],
          "answer": 1,
          "explain": "开漏总线靠上拉回到高电平。"
        },
        {
          "prompt": "7 位地址 0x3C 的含义？",
          "choices": [
            "波特率",
            "从机地址",
            "PWM 频率",
            "ADC 通道"
          ],
          "answer": 1,
          "explain": "SSD1306 常见地址是 0x3C，少数模块是 0x3D。"
        },
        {
          "prompt": "两个从机同一地址会？",
          "choices": [
            "自动轮流",
            "总线冲突、通信不可靠",
            "电流减半",
            "变成 SPI"
          ],
          "answer": 1,
          "explain": "应答会叠在一起，主机无法区分。"
        },
        {
          "prompt": "Wi-Fi 开启时为何仍可用 GPIO21/22？",
          "choices": [
            "它们不是 ADC2 采样脚",
            "I2C 不走 GPIO",
            "Wi-Fi 会关闭 I2C",
            "必须用 ADC2"
          ],
          "answer": 0,
          "explain": "冲突的是 ADC2，不是默认 I2C 脚。"
        }
      ]
    },
    "kit": {
      "bom": [
        {
          "item": "ESP32-DevKitC",
          "qty": 1,
          "note": "3.3V 逻辑"
        },
        {
          "item": "面包板 + 杜邦线",
          "qty": 1,
          "note": "电源轨必须共地"
        },
        {
          "item": "SSD1306 128×64 OLED",
          "qty": 1,
          "note": "VCC→3V3，SDA→21，SCL→22"
        },
        {
          "item": "4.7kΩ 电阻",
          "qty": 2,
          "note": "模块板若已带上拉可不再外加"
        }
      ],
      "safety": [
        "先断电再改线",
        "GPIO 单脚建议 ≤ 20 mA",
        "禁止把市电接到实验电路",
        "OLED 标 3.3V 的不要接 5V",
        "先断电再拔插 I2C 设备，避免热插拔毛刺"
      ],
      "analogToReal": [
        "有的 OLED 模块已有 4.7k 上拉，再并一个仍然工作，但太小的上拉会让边沿变差",
        "真机可用 I2C scanner 草图对照本课串口输出",
        "线太长要降低速率到 50 kHz 并加强上拉"
      ]
    }
  }
} as Record<string, HandDeep>

export function applyHandAdvancedZh(lesson: AdvancedLessonPackage): AdvancedLessonPackage {
  return applyHandDeep(lesson, HAND_ADVANCED_ZH[lesson.id])
}
