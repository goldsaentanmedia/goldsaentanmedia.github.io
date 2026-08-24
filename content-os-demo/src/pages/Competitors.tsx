import PageIntro from '../components/PageIntro'
import Badge from '../components/Badge'
import { competitorHighlight, competitorHooks, competitors, HOOK_TAG_COLOR } from '../data/mock'
import { useToast } from '../toast'

export default function Competitors() {
  const toast = useToast()

  return (
    <>
      <PageIntro
        title="ติดตามคู่แข่ง"
        intro="ดูว่าคู่แข่งกำลังใช้ hook อะไรปังๆ อยู่ตอนนี้ แล้วเก็บมาปรับใช้กับคุณ"
        badge={<Badge>อาทิตย์ 06:00 · AUTO</Badge>}
      />

      <div className="label mb-2">กำลังติดตาม · {competitors.length} CREATORS</div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {competitors.map(c => (
          <div
            key={c.handle}
            className={`card p-3.5 ${c.hot ? 'border-brand-line' : ''}`}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-[12px] font-bold text-white">
                {c.handle[1]?.toUpperCase()}
              </span>
              <span className="truncate text-[12.5px] font-bold">{c.handle}</span>
            </div>
            <div className="text-[15px] font-bold">{c.followers}</div>
            <div className={`text-[11.5px] font-bold ${c.up ? 'text-up' : 'text-down'}`}>
              {c.up ? '▲' : '▼'} {c.delta.replace(/^[+-]/, '')}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl bg-ink px-6 py-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-[18px] font-bold text-white">
          {competitorHighlight.initial}
        </span>
        <div className="min-w-[220px] flex-1">
          <div className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-gold">
            {competitorHighlight.label}
          </div>
          <div className="mt-1 text-[17px] font-bold text-white">{competitorHighlight.handle}</div>
          <div className="mt-1 text-[12.5px] leading-relaxed text-white/70">
            {competitorHighlight.detail}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[22px] font-extrabold text-up">{competitorHighlight.gain}</div>
          <div className="text-[11px] text-white/50">{competitorHighlight.gainLabel}</div>
          <button
            onClick={() => toast('Claude กำลังรวบรวมสถิติเชิงลึกของคู่แข่งรายนี้…')}
            className="mt-2 rounded-lg border border-white/25 px-3 py-1.5 text-[11.5px] font-semibold text-white transition hover:bg-white/10"
          >
            ดูสถิติเชิงลึก →
          </button>
        </div>
      </div>

      <div className="card mt-5 p-5">
        <h2 className="text-[16px] font-bold">Hook เด็ดของคู่แข่ง · สัปดาห์นี้</h2>
        <p className="mb-3 mt-1 text-[12px] text-muted">
          <span className="text-gold">✦</span> ดึง reel ที่ปังที่สุดของคู่แข่ง ถอดเสียง แล้วสรุปเป็น hook ให้
        </p>
        <div className="divide-y divide-line">
          {competitorHooks.map((h, i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
              <div className="min-w-0">
                <div className="text-[13.5px] font-semibold">{h.text}</div>
                <div className="mt-0.5 text-[12px] text-muted">{h.by} · {h.views} วิว</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className="rounded px-2 py-1 font-mono text-[10px] font-extrabold tracking-wide"
                  style={{ color: HOOK_TAG_COLOR[h.tag], background: HOOK_TAG_COLOR[h.tag] + '1a' }}
                >
                  {h.tag}
                </span>
                <button
                  onClick={() => toast('เก็บ hook เข้าคลังแล้ว — ไปดูได้ที่หน้าคลัง HOOK')}
                  className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold transition hover:border-brand hover:text-brand"
                >
                  เก็บเข้าคลัง
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
