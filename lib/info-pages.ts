import { SITE_TAGLINE, SITE_URL, SUPPORT_EMAIL } from './site'

export type InfoSection = { heading: string; paragraphs: string[] }

export type InfoPage = {
  slug: 'about' | 'guide' | 'terms' | 'privacy'
  title: string
  lead: string
  sections: InfoSection[]
  seoTitle: string
  seoDescription: string
}

export const INFO_PAGES: Record<InfoPage['slug'], InfoPage> = {
  about: {
    slug: 'about',
    title: '关于我们',
    lead: 'ESPDeck 是给新手练手的 ESP32 实验室：一课一件事，打开网页就能练。',
    seoTitle: '关于我们 · 开发故事 · ESPDeck',
    seoDescription: 'ESPDeck 开发故事：受推特上 Arduino 入门网页启发，个人开发者为新手搭的 ESP32 练手站。官网 espdeck.pixzens.com。',
    sections: [
      {
        heading: '开发故事',
        paragraphs: [
          '有一次在推特上，网友丢来一个 Arduino 入门网页。点进去才发现：开发板、点灯、按钮都能在浏览器里跟着做，复杂硬件被拆成一步一步的小实验，比对着密密麻麻的接线图硬啃顺很多。',
          '那时 ESP32 正热——双核、Wi-Fi、蓝牙、便宜，新手却容易卡在示例工程太重、视频桌面太乱、套件说明书默认你会。我是个人开发者，习惯把流程收成顺手的台阶，就想：既然 ESP32 这么火，不如也给它一间能练手的网页实验室。',
          '于是有了 ESPDeck。零基础用 3D 实验台一课一件事；进阶工位补上原理图、面包板、PCB、故障和测验。仿真只负责让你先看见现象，真板子仍要对着手册接。',
        ],
      },
      {
        heading: '这间实验室',
        paragraphs: [
          '进度存在你自己的浏览器里，不用注册，课与课之间也没有门锁。免费开放，欢迎挑刺、要新课、指出哪块板子不像真的。',
        ],
      },
    ],
  },
  guide: {
    slug: 'guide',
    title: '使用指南',
    lead: '五分钟走进实验室：先跑通一课，再决定要不要进工位。',
    seoTitle: '使用指南 · ESPDeck',
    seoDescription: 'ESPDeck 使用指南：零基础 3D 实验台、跳课学习、进阶原理图/PCB、故障注入、代码补全与测验。',
    sections: [
      {
        heading: '1. 从零基础实验台开始',
        paragraphs: [
          '打开 espdeck.pixzens.com，默认就是零基础实验台。左侧课程列表可以点任意一课，不必按顺序解锁。第一课建议先看「认识开发板」：转一转 3D 板子，对照标注认识 USB 口、ESP32 模组、天线、BOOT / EN 和板载 LED。',
          '右侧是这一课要讲的话、接线和示例代码。底部工具条可以旋转、放大、缩小、复位视角，也可以开关标注。',
        ],
      },
      {
        heading: '2. 点「运行」，看电路活起来',
        paragraphs: [
          '点「运行」后，串口监视器会模拟编译、烧录和复位，然后程序开始跑。板载灯、RGB、舵机、蜂鸣器、OLED 文案会按这一课的脚本动作。按钮、旋钮、触摸、温度等输入可在控件里调整。',
          '这不是完整的电路仿真或官方编译器，只负责让你先看见「这一步大概会怎样」。真机请以数据手册和 3.3 V 逻辑为准。',
        ],
      },
      {
        heading: '3. 进度存在这台设备上',
        paragraphs: [
          '跑通过的课记在浏览器本地存储里。换设备或清站点数据会丢掉——实验室不要求账号，也不上传你的练习。',
          '想跳课直接点即可。进阶路线同样开放；基础课走完后，课程列表末尾也可以进进阶工作台。',
        ],
      },
      {
        heading: '4. 进入进阶工作台',
        paragraphs: [
          '右上角或课程列表末尾的「进阶工作台」会打开四段路线。每一课可在原理图、面包板、PCB 之间切换，并完成观察、诊断、补代码、测验、真机。',
          '补代码和测验都提供「显示答案」：可以对照完整代码、分步提示，或直接查看测验正确答案。',
        ],
      },
      {
        heading: '5. 卡住了怎么办',
        paragraphs: [
          '先看概述和接线，再看串口日志。进阶课可切到原理图对照网表，或复位视角后再放大。',
          `仍不对、想要新课，写信到 ${SUPPORT_EMAIL}，附上课程名称和现象。`,
        ],
      },
    ],
  },
  terms: {
    slug: 'terms',
    title: '服务条款',
    lead: 'ESPDeck 是免费的个人学习网站。使用即表示你理解下面这些边界。',
    seoTitle: '服务条款 · ESPDeck',
    seoDescription: 'ESPDeck 服务条款：免费个人学习工具，网页仿真不能代替数据手册和真实硬件安全规范。',
    sections: [
      {
        heading: '服务是什么',
        paragraphs: [
          `ESPDeck（${SITE_URL.replace('https://', '')}）由个人开发者维护，提供免费的 ESP32 入门与进阶练习环境。`,
          '网站按「现状」提供，可能随时增减课程或调整交互，不构成培训合同或硬件销售。',
        ],
      },
      {
        heading: '学习辅助，不是工程替代',
        paragraphs: [
          '页面上的电路与串口输出是教学脚本，不是 Spice，也不是官方 SDK。用于真实产品或安全关键场景前，请以芯片手册和实测为准。',
          'ESP32 为 3.3 V 逻辑。错误接线可能损坏开发板。网站「运行」不会控制你桌上的真板；真机风险自负。',
        ],
      },
      {
        heading: '你可以怎样使用',
        paragraphs: [
          '可免费学习、截图笔记、课堂投影。请勿把站点包装成付费课程售卖，或批量抓取后冒充官方。',
          '第三方商标（如 Espressif、ESP32）属各自权利人，出现仅为说明硬件。',
        ],
      },
      {
        heading: '责任限制',
        paragraphs: [
          `在适用法律允许范围内，开发者不对因使用本站造成的数据丢失、板卡损坏等负责。有疑问请写信 ${SUPPORT_EMAIL}。`,
        ],
      },
    ],
  },
  privacy: {
    slug: 'privacy',
    title: '隐私政策',
    lead: '实验室不要求注册。练习默认留在这台设备的浏览器里。',
    seoTitle: '隐私政策 · ESPDeck',
    seoDescription: `ESPDeck 隐私政策：进度保存在本地浏览器。反馈邮箱 ${SUPPORT_EMAIL}。`,
    sections: [
      {
        heading: '我们收集什么',
        paragraphs: [
          '课程进度与进阶测验等用 localStorage 存在本机。没有账号系统，不会索要姓名或手机。',
          '代码框草稿与仿真日志只在本地处理，不会作为作业提交到服务器。',
        ],
      },
      {
        heading: '访问统计',
        paragraphs: ['生产环境可能加载托管方访问统计，用于了解流量，不识别个人，也不包含你的电路或源码。'],
      },
      {
        heading: '外链与赞赏',
        paragraphs: ['赞赏可能跳转微信收款码、Ko-fi 等。支付信息由相应平台处理，ESPDeck 收不到银行卡号。'],
      },
      {
        heading: '你的选择',
        paragraphs: [`清除本站数据即可删除本地进度。来信 ${SUPPORT_EMAIL} 只会用于回复，不会出售。`],
      },
    ],
  },
}

export const ABOUT_CONTACT = {
  heading: '联系我',
  intro: '用着不顺、缺哪一课、或板子哪里不像真的，都欢迎告诉我。',
  siteLabel: '官网：',
  mailLabel: '反馈邮箱：',
  supportLink: '愿意支持开发的话，也可以去「赞赏支持」请一杯咖啡。',
}

export const SUPPORT_COPY = {
  title: '赞赏支持',
  seoTitle: '赞赏支持 · ESPDeck',
  seoDescription: `如果 ESPDeck 帮你练起了 ESP32，欢迎用微信或 Ko-fi 支持。${SITE_TAGLINE}。`,
  back: '返回实验台',
  greetingTitle: '谢谢你愿意点开这里',
  greetingP1: '如果这间实验室对你有用，欢迎用赞赏表达支持。',
  greetingP2: '我是个人开发者，你的支持会变成继续拆课、修 3D、补工位的力气——也可以当成请我喝杯咖啡。',
  waysTitle: '支持方式',
  wechatTitle: '微信赞赏',
  wechatDesc: '扫描上方二维码，用微信打赏。',
  kofiTitle: 'Ko-fi',
  kofiDesc: '海外朋友也可以通过 Ko-fi 支持。',
  kofiButton: '前往 Ko-fi 支持',
  meaningTitle: '你的支持会用在',
  meaningDevTitle: '继续拆课',
  meaningDev: '把更多 ESP32 场景做成能点、能看、能跳着学的小实验。',
  meaningHostTitle: '让站点开着',
  meaningHost: '域名、托管，以及弱网下也能打开实验台。',
  meaningThanksTitle: '一份确认',
  meaningThanks: '知道有人在练，会更有劲把不像真的地方改像样。',
  closing: `无论金额多少，都谢谢你。有问题也可写信：${SUPPORT_EMAIL}。`,
}
