import StatCard from '../components/StatCard'
import PageIntro from '../components/PageIntro'
import Badge from '../components/Badge'
import ClaudeNote from '../components/ClaudeNote'
import { analyticsStats, analyticsAdvice, topContent } from '../data/mock'
import { useToast } from '../toast'

export default function Analytics() {
  const toast = useToast()

  return (
    <>
      <PageIntro
        title="ANALYTICS"
        intro="ดูว่าคอนเทนต์ไหนไวรัล ไม่ไวรัล แล้วรู้ว่าควรทำอะไรต่อ"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {analyticsStats.map(s => <StatCard key={s.label} stat={s} />)}
      </div>

      <div className="card mt-5 p-5">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[16px] font-bold">Top 5 คอนเทนต์มาแรง · 7 วันล่าสุด</h2>
          <Badge tone="gold">ชนะค่าเฉลี่ย 2 เท่าขึ้นไป</Badge>
        </div>
        <p className="mb-3 text-[12px] text-muted">
          <span className="text-gold">✦</span> หา reel ที่ทะลุค่ามัธยฐาน 30 วันเกิน 2 เท่า แล้วบอกว่าอะไรทำให้มันปัง
        </p>

        <div className="divide-y divide-line">
          {topContent.map((c, i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
              <div className="min-w-0">
                <div className="text-[13.5px] font-semibold">&ldquo;{c.title}&rdquo;</div>
                <div className="mt-0.5 text-[12px] text-muted">
                  {c.views} วิว · <span className="font-bold text-up">{c.delta}</span>
                </div>
              </div>
              <button
                onClick={() => toast('Claude กำลังร่างคอนเทนต์แนวเดียวกันให้…')}
                className="shrink-0 rounded-lg border border-line px-3.5 py-1.5 text-[12px] font-semibold transition hover:border-brand hover:text-brand"
              >
                ทำแนวนี้อีก
              </button>
            </div>
          ))}
        </div>
      </div>

      <ClaudeNote>
        {analyticsAdvice.text}
        <b className="text-ink">{analyticsAdvice.bold1}</b>
        {analyticsAdvice.mid}
        <b className="text-ink">{analyticsAdvice.bold2}</b>
        {analyticsAdvice.end}
      </ClaudeNote>
    </>
  )
}
