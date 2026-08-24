import PageIntro from '../components/PageIntro'
import Badge from '../components/Badge'
import ClaudeNote from '../components/ClaudeNote'
import { HOOK_TAG_COLOR, trendAdvice, trends } from '../data/mock'
import { useToast } from '../toast'

export default function Trends() {
  const toast = useToast()
  const hookable = trends.filter(t => t.action === 'HOOK').length

  return (
    <>
      <PageIntro
        title="เทรนด์วันนี้"
        intro="ข่าว/เทรนด์ล่าสุดทุกเช้า คัดเฉพาะอันที่เอามาทำคอนเทนต์ได้"
      />

      <div className="card p-5">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[16px] font-bold">เทรนด์วันนี้ · 12 sources</h2>
          <Badge tone="brand">{hookable} อันทำ HOOK ได้</Badge>
        </div>
        <p className="mb-3 text-[12px] text-muted">
          <span className="text-gold">✦</span> ดึงข่าวจากหลายแหล่งทุกเช้า ติด tag ให้ แล้วส่งสรุปตอน 7 โมง
        </p>

        <div className="divide-y divide-line">
          {trends.map((t, i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
              <div className={`text-[13.5px] ${t.action === 'SKIP' ? 'text-muted' : 'font-semibold'}`}>
                {t.title}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className="rounded px-2 py-1 font-mono text-[10px] font-extrabold tracking-wide"
                  style={{ color: HOOK_TAG_COLOR[t.action], background: HOOK_TAG_COLOR[t.action] + '1a' }}
                >
                  {t.action}
                </span>
                {t.action === 'HOOK' && (
                  <button
                    onClick={() => toast('Claude กำลังแปลงข่าวนี้เป็น hook…')}
                    className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold transition hover:border-brand hover:text-brand"
                  >
                    → ทำเป็น hook
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ClaudeNote>{trendAdvice}</ClaudeNote>
    </>
  )
}
