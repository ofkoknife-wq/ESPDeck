'use client'

import { Activity, Check, ChevronRight, CircleDot, Code2, Radio, Server, Waves } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { ADVANCED_STAGES } from '@/lib/advanced-lessons'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'overview', label: '阶段概览', icon: Activity },
  { id: 'scope', label: '示波器', icon: Waves },
  { id: 'serial', label: '串口日志', icon: Radio },
  { id: 'network', label: '网络数据包', icon: Server },
  { id: 'code', label: '代码挑战', icon: Code2 },
] as const

function Waveform() {
  const [tick, setTick] = useState(0)
  const [running, setRunning] = useState(true)
  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setTick((value) => value + 1), 120)
    return () => window.clearInterval(timer)
  }, [running])
  const points = useMemo(() => Array.from({ length: 92 }, (_, i) => `${i * 12},${58 - Math.sin(i / 2.8 + tick / 8) * 18 - Math.sin(i / 7 + tick / 13) * 8}`), [tick])
  return <div>
    <div className="mb-3 flex items-center justify-between text-xs font-bold"><span className="font-mono text-muted-foreground">CH1 · 1.65 V · 2.4 kHz</span><button onClick={() => setRunning((value) => !value)} className="rounded-lg bg-background px-3 py-1.5 shadow-sm">{running ? '暂停采样' : '继续采样'}</button></div>
    <svg viewBox="0 0 1100 100" className="h-44 w-full" role="img" aria-label="实时示波器波形"><path d="M0 50H1100M0 25H1100M0 75H1100" stroke="currentColor" opacity=".12" strokeDasharray="4 8" /><polyline points={points.join(' ')} fill="none" stroke="var(--primary)" strokeWidth="3" strokeLinecap="round" /></svg>
  </div>
}

export function AdvancedWorkbench({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('overview')
  const [stage, setStage] = useState(0)
  const activeStage = ADVANCED_STAGES[stage]
  return (
    <div className="advanced-shell flex min-h-0 flex-1 flex-col overflow-auto px-4 pb-6 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="advanced-hero flex flex-wrap items-end justify-between gap-5 rounded-[1.75rem] px-6 py-7 sm:px-9">
          <div><p className="eyebrow">进阶开发工作台 / 01–72</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">从实验演示，到开发工具</h2><p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">保留 3D 电路，把示波器、串口、网络和实时数据放进同一个可观察的工程现场。</p></div>
          <button onClick={onBack} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-bold hover:bg-secondary">返回基础课程</button>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="min-w-0 rounded-[1.5rem] border border-border bg-card p-4 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="eyebrow">能力路线</p><h3 className="text-xl font-black">六个阶段，完成一个产品</h3></div><span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold">已完成基础课 30 / 30</span></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{ADVANCED_STAGES.map((item, i) => { const Icon = item.icon; return <button key={item.id} onClick={() => setStage(i)} className={cn('group rounded-2xl border p-4 text-left transition hover:-translate-y-1 hover:shadow-md', i === stage && 'border-foreground ring-2 ring-primary/20')}><div className="flex items-start justify-between"><span className="flex size-10 items-center justify-center rounded-xl text-white" style={{ background: item.color }}><Icon className="size-5" /></span><span className="font-mono text-xs text-muted-foreground">阶段 {item.index}</span></div><h4 className="mt-4 font-black">{item.title}</h4><p className="mt-1 text-xs text-muted-foreground">{item.goal}</p><div className="mt-4 flex items-center justify-between border-t pt-3 text-xs"><span>{item.lessons} 节课程</span><span className="font-bold" style={{ color: item.color }}>查看路线 <ChevronRight className="inline size-3" /></span></div></button> })}</div>
          </section>
          <aside className="rounded-[1.5rem] border border-border bg-card p-5 shadow-sm"><p className="eyebrow">当前阶段</p><h3 className="mt-2 text-2xl font-black">{activeStage.title}</h3><p className="mt-2 text-sm text-muted-foreground">{activeStage.goal}</p><div className="mt-5 rounded-2xl bg-secondary p-4"><span className="text-xs font-bold">阶段项目</span><p className="mt-1 font-black">{activeStage.project}</p></div><div className="mt-5 space-y-3">{activeStage.lessonsList.map((lesson, i) => <div key={lesson.title} className="flex gap-3 text-sm"><span className={cn('mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border', i < 2 ? 'border-primary bg-primary text-primary-foreground' : 'border-border')}>{i < 2 ? <Check className="size-3" /> : <span className="text-[10px]">{i + 1}</span>}</span><div><p className="font-bold">{lesson.title}</p><p className="text-xs text-muted-foreground">{lesson.type} · {lesson.status}</p></div></div>)}</div></aside>
        </div>
        <section className="mt-4 overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm"><div className="flex gap-1 overflow-x-auto border-b border-border p-2">{TABS.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={cn('flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold', tab === id ? 'bg-foreground text-background' : 'hover:bg-secondary')}><Icon className="size-4" />{label}</button>)}</div><div className="min-h-[250px] p-5 sm:p-7">{tab === 'overview' && <div className="grid gap-4 md:grid-cols-3"><Metric label="实时信号" value="3.30 V" detail="GPIO 34 · ADC" /><Metric label="系统负载" value="21 %" detail="双核任务正常" /><Metric label="网络状态" value="在线" detail="Wi-Fi · 192.168.1.42" /></div>}{tab === 'scope' && <div><div className="mb-3 flex items-center justify-between"><div><p className="font-black">GPIO 34 / ADC 输入</p><p className="text-xs text-muted-foreground">10 kHz 采样 · 2.0 V/div</p></div><span className="rounded-full bg-secondary px-3 py-1 font-mono text-xs">实时</span></div><div className="bench-grid rounded-2xl p-3 text-primary"><Waveform /></div></div>}{tab === 'serial' && <LogView />}{tab === 'network' && <PacketView />}{tab === 'code' && <CodeChallenge />}</div></section>
      </div>
    </div>
  )
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) { return <div className="rounded-2xl bg-secondary p-5"><p className="text-xs font-bold text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-black">{value}</p><p className="mt-1 font-mono text-xs text-muted-foreground">{detail}</p></div> }
function LogView() {
  const [paused, setPaused] = useState(false)
  const [filter, setFilter] = useState('全部')
  const rows = [
    ['14:32:08.104', '信息', '系统启动 · ESP32-D0WD-V3'],
    ['14:32:08.220', '网络', 'Wi-Fi connected · RSSI -52 dBm'],
    ['14:32:09.006', '数据', 'ADC GPIO34 = 2048 · 1.65 V'],
    ['14:32:09.421', '信息', '任务 sensor_task 已创建 · core 1'],
    ['14:32:10.018', '成功', 'heap free = 287 KB · 无异常'],
  ]
  return <div className="overflow-hidden rounded-2xl bg-[#020826] text-[#fffffe]">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-3 font-mono text-xs"><span>串口监视器 · 115200 baud</span><div className="flex gap-2"><select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-lg bg-white/10 px-2 py-1"><option>全部</option><option>网络</option><option>数据</option><option>成功</option></select><button onClick={() => setPaused((value) => !value)} className="rounded-lg bg-white/10 px-2 py-1">{paused ? '继续' : '暂停'}</button></div></div>
    <div className="p-5 font-mono text-sm leading-7">{rows.filter((row) => filter === '全部' || row[1] === filter).map(([time, type, message]) => <p key={time} className={type === '网络' ? 'text-[#eaddcf]' : type === '成功' ? 'text-[#8c7851]' : type === '数据' ? 'text-[#f25042]' : ''}><span className="mr-3 text-white/40">[{time}]</span>{message}</p>)}{paused && <p className="mt-2 text-[#f25042]">● 已暂停实时输出</p>}</div>
  </div>
}
function PacketView() {
  const [selected, setSelected] = useState(0)
  const rows = [['14:32:08','MQTT','发布','sensor/room/temp 25.4','200 OK'],['14:32:09','HTTP','接收','GET /api/status','200 OK'],['14:32:10','WebSocket','发送','{"led":true}','已发送']]
  return <div className="grid gap-4 lg:grid-cols-[1fr_260px]"><div className="overflow-x-auto rounded-2xl border border-border"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-secondary text-xs"><tr><th className="p-3">时间</th><th className="p-3">协议</th><th className="p-3">方向</th><th className="p-3">数据</th><th className="p-3">状态</th></tr></thead><tbody>{rows.map((row, index) => <tr key={row[0] + row[1]} onClick={() => setSelected(index)} className={cn('cursor-pointer border-t border-border transition', selected === index && 'bg-secondary')}><td className="p-3 font-mono text-xs">{row[0]}</td>{row.slice(1).map((cell) => <td key={cell} className="p-3">{cell}</td>)}</tr>)}</tbody></table></div><div className="rounded-2xl bg-secondary p-4 text-sm"><p className="eyebrow">数据包详情</p><p className="mt-2 font-black">{rows[selected][1]} · {rows[selected][2]}</p><p className="mt-3 text-muted-foreground">Payload</p><code className="mt-1 block break-all rounded-lg bg-background p-3 text-xs">{rows[selected][3]}</code><p className="mt-3 text-xs text-muted-foreground">响应：{rows[selected][4]}</p></div></div>
}
function CodeChallenge() {
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const correct = answer.trim().toLowerCase().includes('average') || answer.includes('平均')
  return <div className="grid gap-4 lg:grid-cols-[1fr_280px]"><pre className="overflow-auto rounded-2xl bg-[#020826] p-5 font-mono text-sm leading-6 text-[#fffffe]"><code>void loop() {'{'}\n  int raw = analogRead(34);\n  // TODO: 用滑动平均滤波 raw\n  Serial.println(raw);\n{'}'}</code></pre><div className="rounded-2xl bg-secondary p-5"><CircleDot className="size-5 text-primary" /><p className="mt-3 font-black">代码挑战</p><p className="mt-2 text-sm text-muted-foreground">写出关键词，让 ADC 曲线变得平滑。</p><input value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(false) }} placeholder="输入你的答案" className="mt-4 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30" /><button onClick={() => setChecked(true)} className="mt-3 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">检查答案</button>{checked && <p className={cn('mt-3 text-sm font-bold', correct ? 'text-emerald-600' : 'text-destructive')}>{correct ? '回答正确：使用 average / 平均值思路。' : '再试试：提示是“滑动平均”。'}</p>}</div></div>
}
