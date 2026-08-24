import { useState } from 'react'
import PageIntro from '../components/PageIntro'
import { scheduleDraft } from '../data/mock'
import { useToast } from '../toast'
import type { ReactNode } from 'react'

function StepCard({
  n, title, right, hint, children,
}: { n: number; title: string; right?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="card mb-4 p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white">
            {n}
          </span>
          <span className="text-[15px] font-bold">{title}</span>
        </div>
        {right && <span className="text-[11.5px] text-muted">{right}</span>}
      </div>
      {hint && <p className="mt-1 text-[12px] text-muted">{hint}</p>}
      <div className="mt-3.5">{children}</div>
    </div>
  )
}

export default function Schedule() {
  const toast = useToast()
  const [active, setActive] = useState<string[]>(['Instagram', 'TikTok', 'YT Shorts'])
  const [capTab, setCapTab] = useState('Instagram')

  const toggle = (p: string) =>
    setActive(a => (a.includes(p) ? a.filter(x => x !== p) : [...a, p]))

  const chip = (on: boolean) =>
    `rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
      on ? 'border-brand bg-brand-soft text-brand' : 'border-line bg-surface text-muted hover:border-brand/40'
    }`

  return (
    <>
      <PageIntro
        title="ตั้งเวลาโพสต์"
        intro="ตั้งเวลาให้ Claude โพสต์คอนเทนต์ให้อัตโนมัติ ครบทุกแพลตฟอร์ม"
      />

      <div className="card mb-4 flex items-center gap-4 p-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4" /></svg>
        </span>
        <div className="min-w-0">
          <div className="label">กำลังตั้งเวลาโพสต์</div>
          <div className="mt-0.5 truncate text-[15px] font-bold">{scheduleDraft.title}</div>
          <div className="mt-0.5 text-[12px] text-muted">
            {scheduleDraft.type} · {scheduleDraft.duration} · สร้างโดย Claude
          </div>
        </div>
      </div>

      <StepCard n={1} title="เลือกแพลตฟอร์ม" right="กดเพื่อเปิด/ปิด">
        <div className="flex flex-wrap gap-2.5">
          {scheduleDraft.platforms.map(p => (
            <button key={p} onClick={() => toggle(p)} className={chip(active.includes(p))}>
              {p}
            </button>
          ))}
        </div>
      </StepCard>

      <StepCard
        n={2}
        title="เวลาโพสต์ (แต่ละแพลตฟอร์ม)"
        hint="เลือกเวลาที่คนดูเยอะที่สุดให้แต่ละแพลตฟอร์ม"
      >
        <div className="space-y-2.5">
          {scheduleDraft.platformTimes
            .filter(pt => active.includes(pt.platform))
            .map(pt => (
              <div
                key={pt.platform}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-cream px-4 py-3"
              >
                <div className="text-[13px]">
                  <span className="font-bold">{pt.platform}</span>
                  <span className="ml-3 text-ink/70">{pt.when}</span>
                </div>
                <span className="text-[12px] font-semibold text-brand">✦ {pt.reason}</span>
              </div>
            ))}
          {active.length === 0 && (
            <div className="py-6 text-center text-[13px] text-faint">
              ยังไม่ได้เลือกแพลตฟอร์มในขั้นที่ 1
            </div>
          )}
        </div>
      </StepCard>

      <StepCard
        n={3}
        title="Caption (ปรับให้แต่ละแพลตฟอร์ม)"
        hint="ปรับ caption + แฮชแท็กให้เหมาะกับแต่ละแพลตฟอร์ม"
      >
        <div className="mb-3 flex flex-wrap gap-2">
          {active.filter(p => p !== 'LinkedIn').map(p => (
            <button
              key={p}
              onClick={() => setCapTab(p)}
              className={`rounded-lg border px-3.5 py-1.5 text-[12.5px] font-semibold transition ${
                capTab === p ? 'border-brand bg-brand-soft text-brand' : 'border-line text-muted'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-line bg-cream p-4">
          <div className="label mb-2">Caption · สร้างอัตโนมัติ</div>
          <div className="whitespace-pre-wrap text-[13.5px] leading-[1.75]">
            {scheduleDraft.caption}
          </div>
        </div>
      </StepCard>

      <button
        onClick={() => toast('ส่งเข้าคิวแล้ว — Claude จะโพสต์ให้ตามเวลาที่ตั้งไว้')}
        className="w-full rounded-xl bg-brand py-4 text-[15px] font-bold text-white transition hover:opacity-90"
      >
        ยืนยัน — ให้ Claude โพสต์ให้ตามเวลา
      </button>
    </>
  )
}
