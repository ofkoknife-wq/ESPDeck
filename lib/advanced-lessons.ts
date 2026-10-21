import { Activity, Cable, Cpu, Gauge, Radio, Wifi, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type AdvancedStage = {
  id: string
  index: string
  title: string
  goal: string
  lessons: number
  project: string
  color: string
  icon: LucideIcon
  lessonsList: { title: string; type: string; status: string }[]
}

const stageLessons = {
  core: [
    ['GPIO 中断与消抖', '概念课'], ['ADC 校准与滤波', '实验课'], ['串口调试与日志系统', '工具课'], ['故障注入：断线诊断', '排错课'], ['看懂堆栈与崩溃日志', '排错课'], ['阶段项目：传感器节点', '项目课'],
  ],
  protocols: [
    ['Wi-Fi 配网与断线重连', '网络课'], ['HTTP REST API', '网络课'], ['MQTT 发布与订阅', '协议课'], ['WebSocket 实时控制', '协议课'], ['蓝牙 BLE 服务', '通信课'], ['网络数据包抓取', '工具课'], ['阶段项目：智能终端', '项目课'],
  ],
  realtime: [
    ['FreeRTOS 任务与队列', '系统课'], ['双核任务分工', '系统课'], ['硬件定时器', '实验课'], ['看门狗与异常恢复', '可靠性课'], ['OTA 固件升级', '部署课'], ['NVS 配置存储', '存储课'], ['阶段项目：远程设备', '项目课'],
  ],
  sensors: [
    ['I2C 总线扫描', '总线课'], ['SPI 高速采样', '总线课'], ['多传感器时间同步', '数据课'], ['滑动平均与中值滤波', '算法课'], ['卡尔曼滤波入门', '算法课'], ['异常值检测', '数据课'], ['实时曲线设计', '工具课'], ['阶段项目：环境监测站', '项目课'],
  ],
  product: [
    ['电池与电源管理', '硬件课'], ['深度睡眠功耗测试', '实验课'], ['外壳与接口规划', '设计课'], ['状态机设计', '架构课'], ['配置页面与用户体验', '产品课'], ['生产测试点', '交付课'], ['阶段项目：便携产品', '项目课'],
  ],
  projects: [
    ['需求拆解与系统架构', '项目课'], ['摄像头采集管线', '视觉课'], ['边缘端图像处理', '视觉课'], ['云端存储与告警', '云服务课'], ['安全与权限', '安全课'], ['发布监控与回滚', '部署课'], ['毕业项目：ESP32-CAM 安防相机', '毕业项目'],
  ],
} as const

export const ADVANCED_STAGES: AdvancedStage[] = [
  { id: 'core', index: '01', title: '基础巩固', goal: '让程序稳定、可调试', lessons: 6, project: '可靠的传感器节点', color: '#8c7851', icon: Cpu, lessonsList: stageLessons.core.map(([title, type], i) => ({ title, type, status: i < 3 ? '已解锁' : '待解锁' })) },
  { id: 'protocols', index: '02', title: '通信协议', goal: '连接手机、设备与云端', lessons: 7, project: '手机控制的智能终端', color: '#f25042', icon: Wifi, lessonsList: stageLessons.protocols.map(([title, type], i) => ({ title, type, status: i === 0 ? '进行中' : '待解锁' })) },
  { id: 'realtime', index: '03', title: '实时系统', goal: '从能运行到稳定运行', lessons: 7, project: '支持 OTA 的物联网设备', color: '#3870b8', icon: Activity, lessonsList: stageLessons.realtime.map(([title, type], i) => ({ title, type, status: i === 0 ? '进行中' : '待解锁' })) },
  { id: 'sensors', index: '04', title: '传感器融合', goal: '把数据变成有用信息', lessons: 8, project: '室内环境监测站', color: '#3e8b68', icon: Gauge, lessonsList: stageLessons.sensors.map(([title, type]) => ({ title, type, status: '待解锁' })) },
  { id: 'product', index: '05', title: '产品化设计', goal: '做出可以交付的产品', lessons: 7, project: '电池供电的便携产品', color: '#9b5a35', icon: Zap, lessonsList: stageLessons.product.map(([title, type]) => ({ title, type, status: '待解锁' })) },
  { id: 'projects', index: '06', title: '完整项目', goal: '从需求到发布的完整流程', lessons: 7, project: 'ESP32-CAM 安防相机', color: '#7352a4', icon: Radio, lessonsList: stageLessons.projects.map(([title, type]) => ({ title, type, status: '待解锁' })) },
]

export const ADVANCED_LESSONS = ADVANCED_STAGES[0].lessonsList
