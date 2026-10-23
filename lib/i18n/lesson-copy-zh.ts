import type { LessonId } from '@/lib/lessons'
import type { LessonCopy } from './lesson-copy-en'

export type { LessonCopy }

/** Chinese lesson text pack — peer of English, not derived from LESSONS. */
export const LESSON_ZH: Partial<Record<LessonId, LessonCopy>> = {
  "board": {
    "title": "认识开发板",
    "summary": "ESP32-DevKitC 是一块自带 Wi-Fi 和蓝牙的开发板。",
    "description": "ESP32 是乐鑫（Espressif）推出的双核 32 位微控制器，主频最高 240 MHz，还内置了 Wi-Fi 和蓝牙。DevKitC 开发板把芯片、USB 转串口、稳压电路都做好了，插上 USB 线就能开始写程序。",
    "points": [
      "双核 240 MHz，比 Arduino Uno 快十几倍",
      "内置 2.4 GHz Wi-Fi 与蓝牙，天然适合物联网",
      "3.3V 逻辑电平，不要把 5V 信号直接接到 GPIO"
    ],
    "wiring": [
      {
        "from": "USB 口",
        "to": "电脑",
        "note": "供电 + 烧录程序 + 串口通信"
      },
      {
        "from": "3V3",
        "to": "外设电源",
        "note": "最大约 500 mA"
      },
      {
        "from": "5V",
        "to": "USB 5V 直通",
        "note": "可给舵机等 5V 器件供电"
      },
      {
        "from": "GND",
        "to": "所有电路的公共地",
        "note": "两侧都有"
      },
      {
        "from": "GPIO0 / BOOT",
        "to": "下载模式按键",
        "note": "上传卡住时按住它"
      },
      {
        "from": "GPIO34–39",
        "to": "仅输入引脚",
        "note": "没有内部上拉，适合 ADC"
      }
    ],
    "steps": [
      "用 USB 数据线（注意不是只能充电的线）连接开发板和电脑。",
      "在 Arduino IDE 的「开发板管理器」中搜索并安装 esp32 by Espressif Systems。",
      "在「工具 → 开发板」中选择 ESP32 Dev Module，并选择对应的串口。",
      "点击「上传」。如果一直停在 Connecting…，按住板上的 BOOT 键直到开始写入。",
      "打开串口监视器，把波特率设为 115200，就能看到板子打招呼。"
    ],
    "specs": [
      {
        "label": "芯片",
        "value": "ESP32-D0WD-V3"
      },
      {
        "label": "处理器",
        "value": "Xtensa LX6 双核 · 240 MHz"
      },
      {
        "label": "SRAM",
        "value": "520 KB"
      },
      {
        "label": "Flash",
        "value": "4 MB（模组内置）"
      },
      {
        "label": "Wi-Fi",
        "value": "802.11 b/g/n · 2.4 GHz"
      },
      {
        "label": "蓝牙",
        "value": "v4.2 BR/EDR + BLE"
      },
      {
        "label": "ADC",
        "value": "18 通道 · 12 位（0–4095）"
      },
      {
        "label": "触摸",
        "value": "10 路电容触摸"
      },
      {
        "label": "工作电压",
        "value": "3.3V（USB 5V 供电）"
      }
    ],
    "hint": "点击「运行」，观察板载蓝色 LED"
  },
  "blink": {
    "title": "点亮 LED",
    "summary": "第一个电路：一颗 LED 和一个电阻，由 GPIO2 驱动。",
    "description": "电流从 GPIO2 出发，经过 220Ω 电阻和 LED，最后回到 GND。程序每隔一秒切换一次引脚的高低电平，LED 就会一闪一闪——这就是硬件界的 Hello World。",
    "points": [
      "数字输出",
      "电阻限制电流，保护 LED 和 GPIO 引脚",
      "LED 有方向：长脚(+)接电阻，短脚(-)接 GND"
    ],
    "wiring": [
      {
        "from": "ESP32 GPIO2",
        "to": "电阻一端",
        "note": "黄色线"
      },
      {
        "from": "电阻另一端",
        "to": "LED 长脚 (+)",
        "note": "同一列即导通"
      },
      {
        "from": "LED 短脚 (-)",
        "to": "面包板 GND 轨",
        "note": "蓝线一侧"
      },
      {
        "from": "GND 轨",
        "to": "ESP32 GND",
        "note": "黑色线"
      }
    ],
    "steps": [
      "把 LED 插在面包板上，长脚和短脚分别插在相邻的两列。",
      "把 220Ω 电阻的一端插在 LED 长脚所在的列。",
      "用黄色杜邦线把电阻另一端连到 ESP32 的 GPIO2。",
      "用短线把 LED 短脚所在列连到面包板的 GND 电源轨。",
      "用黑色线把 GND 轨连到 ESP32 的 GND，上传程序。"
    ],
    "specs": [
      {
        "label": "LED",
        "value": "5mm 红色 · 正向压降 ≈ 2.0V"
      },
      {
        "label": "电阻",
        "value": "220Ω（红 红 棕 金）"
      },
      {
        "label": "电流",
        "value": "(3.3 − 2.0) ÷ 220 ≈ 6 mA"
      },
      {
        "label": "GPIO 上限",
        "value": "单引脚建议 ≤ 20 mA"
      }
    ],
    "hint": "运行后，外接 LED 和板载 LED 会同步闪烁"
  },
  "button": {
    "title": "按钮输入",
    "summary": "输入让开发板能够「感知」外部世界。",
    "description": "按钮一端接 GPIO4，另一端接 GND。打开内部上拉电阻后，松开时引脚读到 HIGH，按下时被拉到 GND，读到 LOW。程序根据读数控制 LED。",
    "points": [
      "数字输入",
      "INPUT_PULLUP 省掉了外接上拉电阻",
      "点击 3D 场景里的红色按钮试试"
    ],
    "wiring": [
      {
        "from": "ESP32 GPIO4",
        "to": "按钮一脚",
        "note": "橙色线"
      },
      {
        "from": "按钮对角脚",
        "to": "GND 轨"
      },
      {
        "from": "GPIO2",
        "to": "电阻 → LED → GND",
        "note": "沿用上一课"
      },
      {
        "from": "GND 轨",
        "to": "ESP32 GND"
      }
    ],
    "steps": [
      "保留上一课的 LED 电路。",
      "把轻触按钮跨插在面包板中间的凹槽上。",
      "用橙色线把按钮的一只脚连到 GPIO4。",
      "把按钮对角的一只脚连到 GND 轨。",
      "上传程序，按下按钮时 LED 亮起。"
    ],
    "specs": [
      {
        "label": "按钮",
        "value": "6×6mm 轻触开关 · 4 脚"
      },
      {
        "label": "上拉电阻",
        "value": "内部约 45kΩ"
      },
      {
        "label": "逻辑",
        "value": "松开 = HIGH，按下 = LOW"
      },
      {
        "label": "消抖",
        "value": "机械抖动约 5–20 ms"
      }
    ],
    "hint": "按住按钮，LED 就会亮"
  },
  "pot": {
    "title": "旋钮调光",
    "summary": "电位器是一个带滑片的电阻，旋转时改变电压。",
    "description": "电位器两端接 3V3 和 GND，中间的滑片输出 0–3.3V 之间的电压。ESP32 的 12 位 ADC 把它转换成 0–4095 的数字，再用 PWM 控制 LED 亮度。",
    "points": [
      "模拟输入",
      "PWM 输出",
      "拖动下方滑块旋转电位器"
    ],
    "wiring": [
      {
        "from": "电位器左脚",
        "to": "ESP32 3V3",
        "note": "红色线"
      },
      {
        "from": "电位器中脚（滑片）",
        "to": "ESP32 GPIO34",
        "note": "绿色线"
      },
      {
        "from": "电位器右脚",
        "to": "ESP32 GND",
        "note": "黑色线"
      },
      {
        "from": "GPIO2",
        "to": "电阻 → LED → GND"
      }
    ],
    "steps": [
      "把电位器的三只脚插在面包板相邻的三列。",
      "左脚接 3V3，右脚接 GND（接反只是方向相反）。",
      "中间的滑片脚接到 GPIO34——这是一个只能输入的引脚。",
      "保留 GPIO2 的 LED 电路。",
      "上传程序，旋转旋钮，观察亮度和串口里的数值。"
    ],
    "specs": [
      {
        "label": "电位器",
        "value": "10kΩ 线性 (B10K)"
      },
      {
        "label": "ADC 分辨率",
        "value": "12 位 · 0–4095"
      },
      {
        "label": "注意",
        "value": "ADC2 引脚在 Wi-Fi 开启时不可用"
      },
      {
        "label": "PWM",
        "value": "5 kHz · 12 位占空比"
      }
    ],
    "hint": "运行后拖动滑块"
  },
  "rgb": {
    "title": "混合色彩",
    "summary": "RGB LED 是红、绿、蓝三颗 LED 封装在一起。",
    "description": "共阴极 RGB LED 的最长脚接 GND，另外三只脚分别通过电阻接到 GPIO25、26、27。用 PWM 分别调节三种颜色的亮度，就能混合出几乎任何颜色。",
    "points": [
      "三路 PWM 混色",
      "每种颜色都需要自己的限流电阻",
      "最长的那只脚是公共阴极"
    ],
    "wiring": [
      {
        "from": "GPIO25",
        "to": "电阻 → 红色脚",
        "note": "红色线"
      },
      {
        "from": "GPIO26",
        "to": "电阻 → 绿色脚",
        "note": "绿色线"
      },
      {
        "from": "GPIO27",
        "to": "电阻 → 蓝色脚",
        "note": "蓝色线"
      },
      {
        "from": "最长脚（公共阴极）",
        "to": "GND 轨"
      }
    ],
    "steps": [
      "把 RGB LED 插在面包板上，四只脚各占一列。",
      "红、绿、蓝三只脚各接一个 220Ω 电阻，跨过中间凹槽。",
      "电阻另一端分别连到 GPIO25、GPIO26、GPIO27。",
      "最长的公共阴极脚连到 GND 轨，GND 轨连到 ESP32。",
      "上传程序，欣赏彩虹渐变。"
    ],
    "specs": [
      {
        "label": "LED 类型",
        "value": "5mm 共阴极 RGB"
      },
      {
        "label": "引脚顺序",
        "value": "R · GND · G · B"
      },
      {
        "label": "PWM",
        "value": "3 路 · 8 位（0–255）"
      },
      {
        "label": "颜色数",
        "value": "256³ ≈ 1677 万"
      }
    ],
    "hint": "运行后观察颜色渐变"
  },
  "touch": {
    "title": "触摸感应",
    "summary": "ESP32 的独门绝技：任何金属片都能变成触摸按键。",
    "description": "ESP32 内置 10 路电容触摸传感器。手指靠近连接在 T0（GPIO4）上的铜片时，电容变大，touchRead() 的读数会明显变小。不需要任何额外元件。",
    "points": [
      "电容触摸",
      "读数变小 = 有手指触摸",
      "点击场景里的铜片来「触摸」"
    ],
    "wiring": [
      {
        "from": "ESP32 GPIO4 (T0)",
        "to": "铜片 / 铝箔",
        "note": "一根线即可"
      },
      {
        "from": "GPIO2",
        "to": "电阻 → LED → GND",
        "note": "触摸指示灯"
      },
      {
        "from": "GND 轨",
        "to": "ESP32 GND"
      }
    ],
    "steps": [
      "剪一小块铜箔、铝箔或者硬币作为触摸片。",
      "用一根杜邦线把触摸片连到 GPIO4（触摸通道 T0）。",
      "保留 GPIO2 的 LED 电路作为指示灯。",
      "上传程序，先看看不触摸时的读数，以此调整阈值。",
      "用手指触摸铜片，LED 亮起。"
    ],
    "specs": [
      {
        "label": "触摸通道",
        "value": "T0–T9（10 路）"
      },
      {
        "label": "T0",
        "value": "GPIO4"
      },
      {
        "label": "典型读数",
        "value": "未触摸 ≈ 60 · 触摸 ≈ 15"
      },
      {
        "label": "阈值",
        "value": "本例取 30"
      }
    ],
    "hint": "按住铜片或下方按钮"
  },
  "dht": {
    "title": "温湿度传感器",
    "summary": "DHT11 用一根数据线同时报告温度和湿度。",
    "description": "DHT11 内部有一个湿敏电容和一个热敏电阻，并用单总线协议把数据发给 ESP32。借助 DHT 库，两行代码就能读出温度和湿度，温度过高时点亮报警 LED。",
    "points": [
      "读取传感器",
      "单总线：只占用一个 GPIO",
      "拖动下方滑块模拟环境温度"
    ],
    "wiring": [
      {
        "from": "DHT11 VCC",
        "to": "ESP32 3V3",
        "note": "红色线"
      },
      {
        "from": "DHT11 DATA",
        "to": "ESP32 GPIO4",
        "note": "黄色线"
      },
      {
        "from": "DHT11 GND",
        "to": "ESP32 GND",
        "note": "黑色线"
      },
      {
        "from": "GPIO2",
        "to": "电阻 → LED → GND",
        "note": "报警灯"
      }
    ],
    "steps": [
      "在库管理器中安装 DHT sensor library（Adafruit）。",
      "把 DHT11 模块插在面包板上，网格面朝外。",
      "依次连接 VCC → 3V3、DATA → GPIO4、GND → GND。",
      "保留 GPIO2 的 LED 电路作为过热报警。",
      "上传程序，每 2 秒在串口看到一次读数。"
    ],
    "specs": [
      {
        "label": "温度范围",
        "value": "0–50 °C · ±2 °C"
      },
      {
        "label": "湿度范围",
        "value": "20–90 %RH · ±5 %"
      },
      {
        "label": "采样间隔",
        "value": "≥ 1 秒"
      },
      {
        "label": "供电",
        "value": "3.3–5V"
      }
    ],
    "hint": "把温度调到 30°C 以上试试"
  },
  "buzzer": {
    "title": "发出声音",
    "summary": "无源蜂鸣器跟着引脚翻转的频率发声。",
    "description": "引脚每秒翻转 262 次，蜂鸣器就发出 262 Hz 的「Do」。tone() 函数帮我们产生指定频率的方波，把一串频率排起来，就是一首《小星星》。",
    "points": [
      "产生方波",
      "频率越高，音调越高",
      "运行时浏览器会真的播放声音"
    ],
    "wiring": [
      {
        "from": "ESP32 GPIO18",
        "to": "蜂鸣器 + 脚",
        "note": "紫色线"
      },
      {
        "from": "蜂鸣器 - 脚",
        "to": "GND 轨"
      },
      {
        "from": "GND 轨",
        "to": "ESP32 GND"
      }
    ],
    "steps": [
      "确认你手上的是「无源」蜂鸣器（底部能看到电路板）。",
      "把蜂鸣器插在面包板上，注意 + 极的标记。",
      "+ 脚连到 GPIO18，- 脚连到 GND 轨。",
      "GND 轨连到 ESP32 GND。",
      "上传程序，听听《小星星》。"
    ],
    "specs": [
      {
        "label": "类型",
        "value": "无源电磁式蜂鸣器"
      },
      {
        "label": "工作频率",
        "value": "约 2–5 kHz 最响"
      },
      {
        "label": "Do / Re / Mi",
        "value": "262 / 294 / 330 Hz"
      },
      {
        "label": "Sol / La",
        "value": "392 / 440 Hz"
      }
    ],
    "hint": "打开声音，点击运行"
  },
  "servo": {
    "title": "舵机摆动",
    "summary": "舵机是一个「知道自己在哪」的电机。",
    "description": "舵机内部有电机、减速齿轮和位置传感器。ESP32 每 20 ms 发出一个脉冲，脉宽 0.5–2.5 ms 对应 0°–180°，舵机就会转到并保持在那个角度。",
    "points": [
      "指定角度",
      "舵机用 5V 供电，信号线 3.3V 也能驱动",
      "棕 = GND · 红 = 5V · 橙 = 信号"
    ],
    "wiring": [
      {
        "from": "舵机棕线",
        "to": "ESP32 GND"
      },
      {
        "from": "舵机红线",
        "to": "ESP32 5V",
        "note": "USB 直通 5V"
      },
      {
        "from": "舵机橙线",
        "to": "ESP32 GPIO18",
        "note": "PWM 信号"
      }
    ],
    "steps": [
      "在库管理器中安装 ESP32Servo 库。",
      "舵机棕线接 GND，红线接 5V 引脚。",
      "橙色信号线接 GPIO18。",
      "给舵机装上白色的单臂舵盘，方便观察角度。",
      "上传程序，舵机在 0° 和 180° 之间来回摆动。"
    ],
    "specs": [
      {
        "label": "型号",
        "value": "SG90 微型舵机"
      },
      {
        "label": "角度",
        "value": "0–180°"
      },
      {
        "label": "PWM",
        "value": "50 Hz · 0.5–2.5 ms"
      },
      {
        "label": "扭矩",
        "value": "1.8 kg·cm @ 4.8V"
      }
    ],
    "hint": "运行后观察舵盘的角度"
  },
  "oled": {
    "title": "OLED 显示屏",
    "summary": "用 I2C 只占两根线，把传感器数据显示在小屏幕上。",
    "description": "OLED 屏幕通过 I2C 总线和 ESP32 通信，只需要 SDA 与 SCL 两根信号线。配合 Adafruit SSD1306 库，就能把温度、状态和传感器读数画到 128×64 的像素屏上。",
    "points": [
      "I2C 总线",
      "把温度数据显示出来",
      "SDA / SCL 共享总线，可连接多个设备"
    ],
    "wiring": [
      {
        "from": "OLED VCC",
        "to": "ESP32 3V3",
        "note": "不要接 5V"
      },
      {
        "from": "OLED GND",
        "to": "ESP32 GND"
      },
      {
        "from": "OLED SDA",
        "to": "ESP32 GPIO21",
        "note": "I2C 数据线"
      },
      {
        "from": "OLED SCL",
        "to": "ESP32 GPIO22",
        "note": "I2C 时钟线"
      }
    ],
    "steps": [
      "在库管理器中安装 Adafruit SSD1306 和 Adafruit GFX Library。",
      "OLED 的 VCC 接 3V3，GND 接 GND。",
      "SDA 接 GPIO21，SCL 接 GPIO22。",
      "代码中用 Wire.begin(21, 22) 初始化 I2C。",
      "上传程序，屏幕会每秒刷新一次温度与运行时间。"
    ],
    "specs": [
      {
        "label": "分辨率",
        "value": "128 × 64 像素"
      },
      {
        "label": "接口",
        "value": "I2C · 地址 0x3C"
      },
      {
        "label": "逻辑电平",
        "value": "3.3V"
      },
      {
        "label": "刷新率",
        "value": "约 1 Hz"
      }
    ],
    "hint": "运行后观察 OLED 屏幕"
  },
  "wifi": {
    "title": "Wi-Fi 遥控",
    "summary": "把 ESP32 变成网页服务器，用手机开关灯。",
    "description": "这是 ESP32 最大的魅力：连上家里的 Wi-Fi，运行一个小小的网页服务器。手机浏览器访问 /on 或 /off，ESP32 收到请求后切换 GPIO2，LED 跟着亮灭。",
    "points": [
      "连接网络",
      "板载 PCB 天线，无需外接",
      "用交互面板里的「手机」来遥控"
    ],
    "wiring": [
      {
        "from": "ESP32 GPIO2",
        "to": "电阻 → LED",
        "note": "沿用第 2 课"
      },
      {
        "from": "LED 短脚",
        "to": "GND 轨"
      },
      {
        "from": "GND 轨",
        "to": "ESP32 GND"
      },
      {
        "from": "天线",
        "to": "你的 2.4 GHz 路由器",
        "note": "不支持 5 GHz"
      }
    ],
    "steps": [
      "保留第 2 课的 LED 电路。",
      "把代码里的 SSID 和 PASS 改成你家 Wi-Fi 的名称和密码。",
      "上传程序，在串口监视器中找到 ESP32 获得的 IP 地址。",
      "让手机连接同一个 Wi-Fi，浏览器打开 http://IP/on。",
      "再访问 /off，LED 熄灭。恭喜，你做出了第一个物联网设备！"
    ],
    "specs": [
      {
        "label": "协议",
        "value": "HTTP · 端口 80"
      },
      {
        "label": "频段",
        "value": "仅 2.4 GHz"
      },
      {
        "label": "模式",
        "value": "STA（连接路由器）"
      },
      {
        "label": "功耗",
        "value": "Wi-Fi 发射时约 160–260 mA"
      }
    ],
    "hint": "连接成功后用手机开关灯"
  },
  "ldr": {
    "title": "光线感应",
    "summary": "用光敏电阻感知环境亮度。",
    "description": "光敏电阻遇到强光时阻值变小。和一个固定电阻组成分压电路后，ESP32 就能用 ADC 读取光线变化。",
    "points": [
      "模拟输入",
      "光越强，ADC 数值越高",
      "根据亮度自动控制 LED"
    ],
    "wiring": [
      {
        "from": "分压中点",
        "to": "ESP32 GPIO34"
      },
      {
        "from": "光敏电阻",
        "to": "3V3"
      },
      {
        "from": "固定电阻",
        "to": "GND"
      },
      {
        "from": "GPIO2",
        "to": "LED 指示灯"
      }
    ],
    "steps": [
      "把光敏电阻和 10kΩ 电阻组成分压器。",
      "分压中点连接 GPIO34。",
      "两端分别接 3V3 和 GND。",
      "上传程序，拖动场景里的滑块模拟光照。",
      "光线变暗时，LED 自动亮起。"
    ],
    "specs": [
      {
        "label": "传感器",
        "value": "GL5528 光敏电阻"
      },
      {
        "label": "ADC",
        "value": "12 位 · 0–4095"
      },
      {
        "label": "范围",
        "value": "暗 → 亮"
      }
    ],
    "hint": "拖动滑块改变光照"
  },
  "ultrasonic": {
    "title": "超声波测距",
    "summary": "用回声测量物体距离。",
    "description": "HC-SR04 发出超声波并测量回波时间。ESP32 根据声速和时间计算距离，让电路拥有简单的空间感知能力。",
    "points": [
      "脉冲测量",
      "距离 = 时间 × 声速 ÷ 2",
      "拖动滑块模拟目标距离"
    ],
    "wiring": [
      {
        "from": "TRIG",
        "to": "GPIO5"
      },
      {
        "from": "ECHO",
        "to": "GPIO18（需分压）"
      },
      {
        "from": "VCC",
        "to": "5V"
      },
      {
        "from": "GND",
        "to": "GND"
      }
    ],
    "steps": [
      "把超声波模块 VCC 接 5V，GND 接地。",
      "TRIG 接 GPIO5，ECHO 经过分压后接 GPIO18。",
      "上传程序并打开串口监视器。",
      "移动目标，观察距离实时变化。"
    ],
    "specs": [
      {
        "label": "型号",
        "value": "HC-SR04"
      },
      {
        "label": "量程",
        "value": "2–400 cm"
      },
      {
        "label": "精度",
        "value": "约 3 mm"
      }
    ],
    "hint": "拖动滑块改变目标距离"
  },
  "relay": {
    "title": "继电器控制",
    "summary": "用 GPIO 安全地控制更大功率的负载。",
    "description": "继电器模块用低压信号控制一个电气开关。模拟电路里先控制指示灯，真实接线时请只使用低压直流负载。",
    "points": [
      "数字输出",
      "光耦隔离控制",
      "不要直接接市电"
    ],
    "wiring": [
      {
        "from": "IN",
        "to": "GPIO16"
      },
      {
        "from": "VCC",
        "to": "5V"
      },
      {
        "from": "GND",
        "to": "GND"
      },
      {
        "from": "COM / NO",
        "to": "低压负载"
      }
    ],
    "steps": [
      "确认继电器模块支持 3.3V 触发。",
      "VCC 接 5V，GND 接 ESP32 GND。",
      "IN 接 GPIO16。",
      "上传程序，观察继电器指示灯和开关状态。",
      "真实项目中只连接安全的低压负载。"
    ],
    "specs": [
      {
        "label": "模块",
        "value": "单路 5V 继电器"
      },
      {
        "label": "控制脚",
        "value": "GPIO16"
      },
      {
        "label": "安全",
        "value": "禁止直接接市电"
      }
    ],
    "hint": "运行后观察继电器指示灯"
  },
  "motor": {
    "title": "直流电机调速",
    "summary": "用 PWM 和驱动模块控制电机的速度与方向。",
    "description": "ESP32 不能直接驱动电机，必须使用 MOSFET 或电机驱动板。PWM 信号改变电机两端的平均电压，速度就能平滑变化。",
    "points": [
      "PWM 调速",
      "电机需要独立电源与续流保护",
      "ESP32 与驱动板必须共地"
    ],
    "wiring": [
      {
        "from": "GPIO18",
        "to": "驱动板 IN1"
      },
      {
        "from": "GPIO19",
        "to": "驱动板 IN2"
      },
      {
        "from": "GPIO25",
        "to": "驱动板 ENA（PWM）"
      },
      {
        "from": "电机电源",
        "to": "驱动板 VM 与 GND"
      }
    ],
    "steps": [
      "先断开电源，再连接电机驱动板。",
      "GPIO18、GPIO19 接方向输入，GPIO25 接 PWM 使能。",
      "电机使用独立电源，ESP32 与驱动板共地。",
      "上传程序，观察正反转与速度变化。",
      "不要把电机直接接到 GPIO。"
    ],
    "specs": [
      {
        "label": "驱动器",
        "value": "TB6612FNG / L298N"
      },
      {
        "label": "PWM",
        "value": "5 kHz · 8 位"
      },
      {
        "label": "电源",
        "value": "外部 5–12V"
      }
    ],
    "hint": "运行后观察电机速度和方向"
  },
  "keypad": {
    "title": "矩阵按键",
    "summary": "用行列扫描读取多个按键，做一个小键盘。",
    "description": "矩阵按键把多个开关排列成行和列。程序依次拉低每一行，再读取列，就能用很少的 GPIO 识别很多按键。",
    "points": [
      "行列扫描",
      "按下 3D 场景里的按键",
      "4×4 键盘只需 8 个 GPIO"
    ],
    "wiring": [
      {
        "from": "R1–R4",
        "to": "GPIO16–19"
      },
      {
        "from": "C1–C4",
        "to": "GPIO25–27、32"
      },
      {
        "from": "GPIO2",
        "to": "LED 指示灯"
      }
    ],
    "steps": [
      "把 4×4 矩阵按键的 8 根线分成 4 行和 4 列。",
      "行线接 GPIO16–19，列线接 GPIO25–27、32。",
      "程序逐行输出 LOW，再读取列状态。",
      "按下按键，串口会显示对应字符。",
      "实际项目可用它输入密码或菜单。"
    ],
    "specs": [
      {
        "label": "键数",
        "value": "4 × 4 = 16 键"
      },
      {
        "label": "引脚",
        "value": "8 个 GPIO"
      },
      {
        "label": "扫描",
        "value": "逐行轮询"
      }
    ],
    "hint": "点击场景里的按键"
  },
  "sleep": {
    "title": "深度睡眠",
    "summary": "让电池设备在大多数时间安静休息。",
    "description": "深度睡眠会关闭 CPU 和大部分外设，只保留唤醒所需的电路。定时唤醒、读取传感器、发送数据，再次睡眠，就是低功耗物联网的基本循环。",
    "points": [
      "降低功耗",
      "定时唤醒读取传感器",
      "唤醒后程序从 setup() 重新开始"
    ],
    "wiring": [
      {
        "from": "ESP32 GPIO33",
        "to": "唤醒按钮"
      },
      {
        "from": "DHT11 DATA",
        "to": "GPIO4"
      },
      {
        "from": "3V3",
        "to": "传感器 VCC"
      },
      {
        "from": "GND",
        "to": "公共地"
      }
    ],
    "steps": [
      "接好传感器和唤醒按钮。",
      "读取传感器并通过 Wi-Fi 发送一次数据。",
      "调用 esp_sleep_enable_timer_wakeup() 设置唤醒时间。",
      "调用 esp_deep_sleep_start() 进入深度睡眠。",
      "唤醒后观察串口中的启动信息。"
    ],
    "specs": [
      {
        "label": "睡眠电流",
        "value": "约 10–150 μA（取决于板卡）"
      },
      {
        "label": "唤醒源",
        "value": "定时器 / GPIO / 触摸"
      },
      {
        "label": "记忆",
        "value": "RTC 内存可保留"
      }
    ],
    "hint": "运行后观察唤醒与睡眠状态"
  },
  "bluetooth": {
    "title": "蓝牙串口",
    "summary": "让手机通过蓝牙和 ESP32 交换数据。",
    "description": "ESP32 自带蓝牙，可以把开发板变成一个无线串口。手机发送文字后，ESP32 读取 SerialBT 并回传确认信息，这是制作无线控制器的起点。",
    "points": [
      "经典蓝牙串口",
      "手机无需网关即可连接",
      "点击手机面板发送指令"
    ],
    "wiring": [
      {
        "from": "ESP32 蓝牙天线",
        "to": "手机蓝牙",
        "note": "无线连接"
      },
      {
        "from": "GPIO2",
        "to": "LED 指示灯"
      },
      {
        "from": "GND",
        "to": "公共地"
      }
    ],
    "steps": [
      "安装 ESP32 开发板支持包。",
      "创建 BluetoothSerial 对象并设置设备名称。",
      "用手机蓝牙搜索并连接 ESP32-LAB。",
      "发送 ON 或 OFF 指令。",
      "观察串口回传和 LED 状态。"
    ],
    "specs": [
      {
        "label": "协议",
        "value": "Bluetooth Classic SPP"
      },
      {
        "label": "设备名",
        "value": "ESP32-LAB"
      },
      {
        "label": "范围",
        "value": "约 10 米"
      }
    ],
    "hint": "运行后点击手机发送 ON / OFF"
  },
  "neopixel": {
    "title": "NeoPixel 灯带",
    "summary": "用一根数据线控制一整串可编程彩灯。",
    "description": "NeoPixel 每颗灯珠都有自己的控制芯片，ESP32 只要沿着数据线发送颜色序列，就能独立控制整条灯带。注意电源和数据地必须共地。",
    "points": [
      "逐颗控制 RGB",
      "大量灯珠需要独立 5V 电源",
      "拖动滑块改变彩灯颜色"
    ],
    "wiring": [
      {
        "from": "DIN",
        "to": "ESP32 GPIO23",
        "note": "串行数据"
      },
      {
        "from": "5V",
        "to": "灯带电源",
        "note": "大电流请外接电源"
      },
      {
        "from": "GND",
        "to": "ESP32 GND"
      }
    ],
    "steps": [
      "安装 Adafruit NeoPixel 库。",
      "DIN 接 GPIO23，电源接 5V，双方 GND 共地。",
      "代码中设置灯珠数量和数据引脚。",
      "上传程序，先点亮一颗灯测试。",
      "再让彩色光带循环流动。"
    ],
    "specs": [
      {
        "label": "灯珠",
        "value": "WS2812B · 8 颗"
      },
      {
        "label": "数据",
        "value": "800 kHz 单线协议"
      },
      {
        "label": "电流",
        "value": "全白约 60 mA / 颗"
      }
    ],
    "hint": "运行后观察蓝色光点逐颗移动"
  },
  "ir": {
    "title": "红外遥控",
    "summary": "读取遥控器按键，让电路听懂无线指令。",
    "description": "红外接收头把遥控器发来的脉冲转换成数字信号。解码后可以用不同按键控制 LED、继电器或电机，家电遥控就是这种思路。",
    "points": [
      "解码红外协议",
      "按键映射到硬件动作",
      "点击场景遥控器按钮"
    ],
    "wiring": [
      {
        "from": "红外 OUT",
        "to": "ESP32 GPIO27",
        "note": "数字信号"
      },
      {
        "from": "红外 VCC",
        "to": "ESP32 3V3"
      },
      {
        "from": "红外 GND",
        "to": "ESP32 GND"
      }
    ],
    "steps": [
      "安装 IRremoteESP8266 库。",
      "接收头 VCC、GND、OUT 分别连接 3V3、GND、GPIO27。",
      "打开串口监视器读取遥控器编码。",
      "把编码写入 switch 分支。",
      "按下按键，控制 LED 或其他模块。"
    ],
    "specs": [
      {
        "label": "载波",
        "value": "38 kHz"
      },
      {
        "label": "接收距离",
        "value": "约 8 米"
      },
      {
        "label": "信号",
        "value": "NEC / Sony / RC5 等"
      }
    ],
    "hint": "运行后点击遥控器按键"
  },
  "fan": {
    "title": "PWM 风扇",
    "summary": "用 PWM 让风扇安静地改变转速。",
    "description": "直流风扇不能直接接 GPIO，使用 MOSFET 驱动后，PWM 占空比就能控制风扇速度。这个方法也适用于水泵和灯带。",
    "points": [
      "PWM 调速",
      "MOSFET 负责承受负载电流",
      "负载电源与 ESP32 共地"
    ],
    "wiring": [
      {
        "from": "GPIO25",
        "to": "MOSFET Gate"
      },
      {
        "from": "风扇正极",
        "to": "外部 5V"
      },
      {
        "from": "风扇负极",
        "to": "MOSFET Drain"
      },
      {
        "from": "ESP32 GND",
        "to": "电源负极",
        "note": "必须共地"
      }
    ],
    "steps": [
      "准备一个逻辑电平 N 沟道 MOSFET 和续流二极管。",
      "风扇使用外部 5V 电源，正极接电源正端。",
      "GPIO25 通过 100Ω 电阻接 MOSFET Gate。",
      "电源负极、ESP32 GND 和 MOSFET Source 共地。",
      "逐渐提高 PWM 占空比，观察风扇转速变化。"
    ],
    "specs": [
      {
        "label": "控制方式",
        "value": "低端 MOSFET 开关"
      },
      {
        "label": "PWM",
        "value": "5 kHz · 8 位"
      },
      {
        "label": "保护",
        "value": "并联续流二极管"
      }
    ],
    "hint": "运行后观察风扇从慢到快"
  },
  "rtc": {
    "title": "实时时钟",
    "summary": "让 ESP32 记住时间，给数据打上时间戳。",
    "description": "联网后用 NTP 同步网络时间，断网时继续使用系统时钟。给传感器数据加上时间戳，是物联网记录和自动化的基础。",
    "points": [
      "NTP 网络校时",
      "传感器数据带时间戳",
      "断网后仍可读取系统时间"
    ],
    "wiring": [
      {
        "from": "ESP32 Wi-Fi",
        "to": "NTP 时间服务器"
      },
      {
        "from": "GPIO2",
        "to": "状态 LED"
      },
      {
        "from": "GND",
        "to": "公共地"
      }
    ],
    "steps": [
      "连接 Wi-Fi 并等待网络就绪。",
      "调用 configTime 设置时区和 NTP 服务器。",
      "用 getLocalTime 读取当前时间。",
      "把时间格式化后打印到串口。",
      "将时间戳添加到传感器数据记录中。"
    ],
    "specs": [
      {
        "label": "协议",
        "value": "NTP · UDP 123"
      },
      {
        "label": "精度",
        "value": "网络连接时约毫秒级"
      },
      {
        "label": "用途",
        "value": "日志、定时任务、数据记录"
      }
    ],
    "hint": "运行后观察时钟每秒更新"
  },
  "pir": {
    "title": "人体感应",
    "summary": "用 PIR 传感器检测有人经过。",
    "description": "PIR 传感器检测人体红外辐射变化，输出一个稳定的高低电平。它是自动灯、门铃和安防装置最常见的输入模块之一。",
    "points": [
      "数字传感器输入",
      "检测到移动时点亮 LED",
      "传感器通常需要几秒预热"
    ],
    "wiring": [
      {
        "from": "PIR VCC",
        "to": "ESP32 5V"
      },
      {
        "from": "PIR OUT",
        "to": "GPIO27"
      },
      {
        "from": "PIR GND",
        "to": "ESP32 GND"
      },
      {
        "from": "GPIO2",
        "to": "LED 指示灯"
      }
    ],
    "steps": [
      "VCC 接 5V，GND 接地。",
      "OUT 接 GPIO27，调整模块上的延时旋钮。",
      "上电后等待传感器完成预热。",
      "有人移动时读取 HIGH 并点亮 LED。",
      "没有移动时自动熄灭指示灯。"
    ],
    "specs": [
      {
        "label": "模块",
        "value": "HC-SR501 PIR"
      },
      {
        "label": "检测范围",
        "value": "约 3–7 米"
      },
      {
        "label": "输出",
        "value": "HIGH / LOW 数字信号"
      }
    ],
    "hint": "运行后点击场景里的传感器"
  },
  "joystick": {
    "title": "摇杆输入",
    "summary": "用两个 ADC 通道读取方向和按键。",
    "description": "摇杆的 X、Y 两个电位器输出 0–4095 的模拟值，按下按钮则是一个数字输入。",
    "points": [
      "analogRead() / digitalRead()",
      "GPIO34 / GPIO35 / GPIO4",
      "运行模拟，观察串口日志"
    ],
    "wiring": [
      {
        "from": "GPIO34 / GPIO35 / GPIO4",
        "to": "ESP32",
        "note": "按开发板标注连接"
      },
      {
        "from": "VCC",
        "to": "3V3 / 5V",
        "note": "确认模块电压"
      },
      {
        "from": "GND",
        "to": "公共地"
      }
    ],
    "steps": [
      "确认模块型号和工作电压。",
      "按接线表连接信号线、电源和 GND。",
      "安装对应 Arduino 库（如需要）。",
      "上传程序并打开串口监视器。",
      "运行模拟，观察数据变化后再接真实硬件。"
    ],
    "specs": [
      {
        "label": "核心接口",
        "value": "GPIO34 / GPIO35 / GPIO4"
      },
      {
        "label": "数据方式",
        "value": "analogRead() / digitalRead()"
      },
      {
        "label": "安全提醒",
        "value": "先断电接线，电源必须共地"
      }
    ],
    "hint": "点击「运行」观察模拟数据"
  },
  "soil": {
    "title": "土壤湿度",
    "summary": "让 ESP32 知道植物渴不渴。",
    "description": "电容式土壤湿度传感器输出模拟电压，低于阈值时可以启动水泵。",
    "points": [
      "analogRead()",
      "GPIO34 ADC",
      "运行模拟，观察串口日志"
    ],
    "wiring": [
      {
        "from": "GPIO34 ADC",
        "to": "ESP32",
        "note": "按开发板标注连接"
      },
      {
        "from": "VCC",
        "to": "3V3 / 5V",
        "note": "确认模块电压"
      },
      {
        "from": "GND",
        "to": "公共地"
      }
    ],
    "steps": [
      "确认模块型号和工作电压。",
      "按接线表连接信号线、电源和 GND。",
      "安装对应 Arduino 库（如需要）。",
      "上传程序并打开串口监视器。",
      "运行模拟，观察数据变化后再接真实硬件。"
    ],
    "specs": [
      {
        "label": "核心接口",
        "value": "GPIO34 ADC"
      },
      {
        "label": "数据方式",
        "value": "analogRead()"
      },
      {
        "label": "安全提醒",
        "value": "先断电接线，电源必须共地"
      }
    ],
    "hint": "点击「运行」观察模拟数据"
  },
  "gas": {
    "title": "空气质量",
    "summary": "读取气体传感器的浓度变化。",
    "description": "MQ 系列传感器需要预热，输出电压可用于制作简单的空气质量报警器。",
    "points": [
      "analogRead()",
      "GPIO34 ADC",
      "运行模拟，观察串口日志"
    ],
    "wiring": [
      {
        "from": "GPIO34 ADC",
        "to": "ESP32",
        "note": "按开发板标注连接"
      },
      {
        "from": "VCC",
        "to": "3V3 / 5V",
        "note": "确认模块电压"
      },
      {
        "from": "GND",
        "to": "公共地"
      }
    ],
    "steps": [
      "确认模块型号和工作电压。",
      "按接线表连接信号线、电源和 GND。",
      "安装对应 Arduino 库（如需要）。",
      "上传程序并打开串口监视器。",
      "运行模拟，观察数据变化后再接真实硬件。"
    ],
    "specs": [
      {
        "label": "核心接口",
        "value": "GPIO34 ADC"
      },
      {
        "label": "数据方式",
        "value": "analogRead()"
      },
      {
        "label": "安全提醒",
        "value": "先断电接线，电源必须共地"
      }
    ],
    "hint": "点击「运行」观察模拟数据"
  },
  "imu": {
    "title": "姿态感应",
    "summary": "用加速度计感知倾斜和晃动。",
    "description": "MPU6050 通过 I2C 返回加速度和角速度，适合做平衡车和手势控制器。",
    "points": [
      "Wire / I2C",
      "SDA 21 · SCL 22",
      "运行模拟，观察串口日志"
    ],
    "wiring": [
      {
        "from": "SDA 21 · SCL 22",
        "to": "ESP32",
        "note": "按开发板标注连接"
      },
      {
        "from": "VCC",
        "to": "3V3 / 5V",
        "note": "确认模块电压"
      },
      {
        "from": "GND",
        "to": "公共地"
      }
    ],
    "steps": [
      "确认模块型号和工作电压。",
      "按接线表连接信号线、电源和 GND。",
      "安装对应 Arduino 库（如需要）。",
      "上传程序并打开串口监视器。",
      "运行模拟，观察数据变化后再接真实硬件。"
    ],
    "specs": [
      {
        "label": "核心接口",
        "value": "SDA 21 · SCL 22"
      },
      {
        "label": "数据方式",
        "value": "Wire / I2C"
      },
      {
        "label": "安全提醒",
        "value": "先断电接线，电源必须共地"
      }
    ],
    "hint": "点击「运行」观察模拟数据"
  },
  "gps": {
    "title": "GPS 定位",
    "summary": "让设备知道自己在哪里。",
    "description": "GPS 模块通过串口输出 NMEA 文本，解析后可以得到经纬度和卫星数量。",
    "points": [
      "Serial2",
      "RX 16 · TX 17",
      "运行模拟，观察串口日志"
    ],
    "wiring": [
      {
        "from": "RX 16 · TX 17",
        "to": "ESP32",
        "note": "按开发板标注连接"
      },
      {
        "from": "VCC",
        "to": "3V3 / 5V",
        "note": "确认模块电压"
      },
      {
        "from": "GND",
        "to": "公共地"
      }
    ],
    "steps": [
      "确认模块型号和工作电压。",
      "按接线表连接信号线、电源和 GND。",
      "安装对应 Arduino 库（如需要）。",
      "上传程序并打开串口监视器。",
      "运行模拟，观察数据变化后再接真实硬件。"
    ],
    "specs": [
      {
        "label": "核心接口",
        "value": "RX 16 · TX 17"
      },
      {
        "label": "数据方式",
        "value": "Serial2"
      },
      {
        "label": "安全提醒",
        "value": "先断电接线，电源必须共地"
      }
    ],
    "hint": "点击「运行」观察模拟数据"
  },
  "camera": {
    "title": "摄像头预览",
    "summary": "把 ESP32 变成一台网络摄像头。",
    "description": "ESP32-CAM 使用摄像头采集 JPEG，再通过 Wi-Fi 提供网页预览。",
    "points": [
      "esp_camera",
      "OV2640 · Wi-Fi",
      "运行模拟，观察串口日志"
    ],
    "wiring": [
      {
        "from": "OV2640 · Wi-Fi",
        "to": "ESP32",
        "note": "按开发板标注连接"
      },
      {
        "from": "VCC",
        "to": "3V3 / 5V",
        "note": "确认模块电压"
      },
      {
        "from": "GND",
        "to": "公共地"
      }
    ],
    "steps": [
      "确认模块型号和工作电压。",
      "按接线表连接信号线、电源和 GND。",
      "安装对应 Arduino 库（如需要）。",
      "上传程序并打开串口监视器。",
      "运行模拟，观察数据变化后再接真实硬件。"
    ],
    "specs": [
      {
        "label": "核心接口",
        "value": "OV2640 · Wi-Fi"
      },
      {
        "label": "数据方式",
        "value": "esp_camera"
      },
      {
        "label": "安全提醒",
        "value": "先断电接线，电源必须共地"
      }
    ],
    "hint": "点击「运行」观察模拟数据"
  },
  "lightstrip": {
    "title": "灯带动画",
    "summary": "制作一条会流动的彩色灯带。",
    "description": "把颜色数据按顺序送入可编程灯珠，就能实现渐变、追逐和呼吸等动画。",
    "points": [
      "strip.setPixelColor()",
      "DIN → GPIO23",
      "运行模拟，观察串口日志"
    ],
    "wiring": [
      {
        "from": "DIN → GPIO23",
        "to": "ESP32",
        "note": "按开发板标注连接"
      },
      {
        "from": "VCC",
        "to": "3V3 / 5V",
        "note": "确认模块电压"
      },
      {
        "from": "GND",
        "to": "公共地"
      }
    ],
    "steps": [
      "确认模块型号和工作电压。",
      "按接线表连接信号线、电源和 GND。",
      "安装对应 Arduino 库（如需要）。",
      "上传程序并打开串口监视器。",
      "运行模拟，观察数据变化后再接真实硬件。"
    ],
    "specs": [
      {
        "label": "核心接口",
        "value": "DIN → GPIO23"
      },
      {
        "label": "数据方式",
        "value": "strip.setPixelColor()"
      },
      {
        "label": "安全提醒",
        "value": "先断电接线，电源必须共地"
      }
    ],
    "hint": "点击「运行」观察模拟数据"
  }
} as Partial<Record<LessonId, LessonCopy>>
