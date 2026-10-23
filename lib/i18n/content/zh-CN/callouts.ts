import type { LessonId } from '@/lib/lessons'

export type CalloutText = { title: string; body: string }

export const CALLOUTS_ZH: Partial<Record<LessonId, CalloutText[]>> = {
  'board': [
    { title: 'USB 口', body: '供电、烧录程序和串口通信' },
    { title: 'USB 转串口', body: '把 USB 数据转成 UART，电脑才能和 ESP32 对话' },
    { title: '3.3V 稳压', body: '把 USB 5V 稳到 3.3V，给芯片和外设供电' },
    { title: '晶振', body: '给 USB 转串口芯片提供精确时钟' },
    { title: 'EN 复位键', body: '按下重启芯片，程序从头执行' },
    { title: 'BOOT 键', body: '上传卡住 Connecting… 时按住它进入下载模式' },
    { title: '电源灯', body: '板子有电时亮起的红色指示灯' },
    { title: '板载 LED', body: '接在 GPIO2，示例程序常用来闪灯' },
    { title: 'ESP32 模组', body: '双核处理器 + 4MB Flash，金属罩防干扰' },
    { title: 'PCB 天线', body: 'Wi-Fi 和蓝牙信号从这里收发' },
    { title: '左侧排针', body: '3V3、EN、ADC、DAC、GND、5V 等' },
    { title: '右侧排针', body: 'UART、I²C、SPI、常用 GPIO' },
  ],
  'blink': [
    { title: 'GPIO2', body: '程序控制它输出 3.3V 或 0V' },
    { title: '220Ω 电阻', body: '限制电流，保护 LED' },
    { title: 'LED', body: '长脚(+)接电阻，短脚(-)接地' },
    { title: 'GND', body: '电流从这里流回开发板' },
  ],
  'button': [
    { title: 'LED', body: '长脚(+)接电阻，短脚(-)接地' },
    { title: 'GPIO4', body: '内部上拉，按下时读到 LOW' },
    { title: '按钮（可点击）', body: '按住它，LED 就会亮' },
  ],
  'pot': [
    { title: 'LED', body: '长脚(+)接电阻，短脚(-)接地' },
    { title: 'GPIO34 (ADC)', body: '把 0–3.3V 转成 0–4095' },
    { title: '电位器', body: '旋转改变滑片电压' },
  ],
  'rgb': [
    { title: 'GPIO25 / 26 / 27', body: '三路 PWM 分别控制红绿蓝' },
    { title: 'RGB LED', body: '最长脚是公共阴极，接 GND' },
    { title: '3 个电阻', body: '每种颜色各需一个 220Ω' },
  ],
  'touch': [
    { title: 'LED', body: '长脚(+)接电阻，短脚(-)接地' },
    { title: 'T0 = GPIO4', body: '内置电容触摸通道' },
    { title: '铜片（可点击）', body: '按住它模拟手指触摸' },
  ],
  'dht': [
    { title: 'DHT11', body: '一根数据线报告温度和湿度' },
    { title: 'DATA → GPIO4', body: '单总线通信' },
    { title: '报警 LED', body: '温度超过 30°C 时点亮' },
  ],
  'buzzer': [
    { title: '无源蜂鸣器', body: '跟随方波的频率发声' },
    { title: 'GPIO18', body: 'tone() 在这里输出方波' },
    { title: 'GND', body: '电流从这里流回开发板' },
  ],
  'servo': [
    { title: '舵机 SG90', body: '舵盘指向的就是当前角度' },
    { title: '橙线 → GPIO18', body: 'PWM 信号线' },
    { title: '红线 → 5V', body: '舵机需要 5V 供电' },
  ],
  'oled': [
    { title: 'I2C OLED', body: '128×64 像素屏，地址通常是 0x3C' },
    { title: 'SDA → GPIO21', body: 'I2C 数据线' },
    { title: 'SCL → GPIO22', body: 'I2C 时钟线' },
  ],
  'ldr': [
    { title: 'GPIO34 / ADC', body: '读取光敏分压电压' },
    { title: '光敏电阻', body: '拖动旋钮模拟光照' },
    { title: 'LED', body: '长脚(+)接电阻，短脚(-)接地' },
  ],
  'ultrasonic': [
    { title: 'HC-SR04', body: '发射超声波并接收回波' },
    { title: 'TRIG → GPIO5', body: '发送 10μs 触发脉冲' },
    { title: '距离读数', body: '拖动滑块模拟目标距离' },
  ],
  'relay': [
    { title: '继电器模块', body: 'GPIO16 控制线圈吸合' },
    { title: 'IN → GPIO16', body: '低压信号控制开关' },
    { title: '负载指示灯', body: '真实接线请只用低压负载' },
  ],
  'wifi': [
    { title: 'PCB 天线', body: '连接 2.4 GHz Wi-Fi' },
    { title: 'GPIO2', body: '程序控制它输出 3.3V 或 0V' },
    { title: 'LED', body: '长脚(+)接电阻，短脚(-)接地' },
  ],
  'motor': [
    { title: '直流电机', body: '驱动板保护 ESP32，PWM 控制速度' },
    { title: 'IN1 / IN2', body: '两个 GPIO 控制方向' },
    { title: 'ENA · PWM', body: '改变占空比调节速度' },
  ],
  'keypad': [
    { title: '矩阵按键', body: '点击按键模拟一次输入' },
    { title: '行线', body: '逐行拉低并读取列状态' },
    { title: 'LED', body: '长脚(+)接电阻，短脚(-)接地' },
  ],
  'sleep': [
    { title: '低功耗模式', body: '睡眠时关闭大部分外设' },
    { title: '唤醒引脚', body: 'GPIO 或定时器都能唤醒 ESP32' },
  ],
  'bluetooth': [
    { title: '蓝牙天线', body: '手机连接 ESP32-LAB' },
    { title: 'LED', body: '长脚(+)接电阻，短脚(-)接地' },
    { title: 'GPIO2', body: '蓝牙指令控制 LED' },
  ],
  'neopixel': [
    { title: 'NeoPixel', body: '每颗灯珠都能独立显示颜色' },
    { title: 'DIN → GPIO23', body: '一根数据线串起整条灯带' },
    { title: '5V 电源', body: '灯珠多时请使用独立电源' },
  ],
  'ir': [
    { title: '红外接收头', body: '点击模拟遥控器发来的编码' },
    { title: 'OUT → GPIO27', body: '读取 38 kHz 红外信号' },
    { title: 'LED', body: '长脚(+)接电阻，短脚(-)接地' },
  ],
  'fan': [
    { title: 'PWM 风扇', body: '转速随占空比平滑变化' },
    { title: 'PWM → GPIO25', body: '控制 MOSFET 的 Gate' },
    { title: '共地', body: '外部电源负极必须和 ESP32 共地' },
  ],
  'rtc': [
    { title: '实时时钟', body: 'NTP 校时后每秒更新显示' },
    { title: 'Wi-Fi / NTP', body: '从网络时间服务器同步时间' },
  ],
  'pir': [
    { title: 'PIR 传感器（可点击）', body: '点击模拟检测到移动' },
    { title: 'OUT → GPIO27', body: 'HIGH 表示检测到移动' },
    { title: 'LED', body: '长脚(+)接电阻，短脚(-)接地' },
  ],
  'joystick': [
    { title: '双轴摇杆', body: 'X/Y 轴和按键都能读取' },
  ],
  'soil': [
    { title: 'OLED', body: 'I²C 显示湿度百分比与状态。' },
    { title: '土壤湿度', body: '电容探针 → GPIO34 ADC。' },
    { title: '洒水壶', body: '按住浇水（模拟道具）。' },
    { title: '植物', body: '土干时叶子下垂。' },
    { title: 'GPIO34', body: 'ADC 输入，供 analogRead() / map()。' },
  ],
  'gas': [
    { title: 'MQ 气体传感器', body: '数值超过阈值时报警' },
  ],
  'imu': [
    { title: 'MPU6050', body: 'I2C 读取姿态变化' },
  ],
  'gps': [
    { title: 'GPS 坐标', body: '等待卫星定位并输出经纬度' },
  ],
  'camera': [
    { title: 'ESP32-CAM', body: '连接 Wi-Fi 后提供图像流' },
  ],
  'lightstrip': [
    { title: '可编程灯带', body: '颜色沿数据线流动' },
  ],
}
