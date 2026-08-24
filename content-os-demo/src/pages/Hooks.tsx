import { useMemo, useState } from 'react'
import PageIntro from '../components/PageIntro'
import Badge from '../components/Badge'
import { HOOK_TAG_COLOR, hooks } from '../data/mock'
import { useToast } from '../toast'

export default function Hooks() {
  const toast = useToast()
  const [q, setQ] = useState('')

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return hooks
    return hooks.filter(h =>
      h.text.toLowerCase().includes(needle) || h.tag.toLowerCase().includes(needle))
  }, [q])

  return (
    <>
      <PageIntro
        title="คลัง HOOK"
        intro="คลัง hook ทั้งหมดของคุณ — รวมที่เก็บจากคู่แข่งด้วย พร้อมหยิบไปเขียนสคริปต์ได้ทันที"
      />

      <div className="card p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[16px] font-bold">482 hooks · ค้นหาได้</h2>
          <Badge tone="brand">+17 สัปดาห์นี้</Badge>
        </div>

        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="ค้นหา hooks…"
          className="mb-2 w-full rounded-xl border border-line bg-cream px-4 py-2.5 text-[13.5px] outline-none transition focus:border-brand"
        />

        <div className="divide-y divide-line">
          {shown.map((h, i) => (
            <div key={i} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
              <div className="min-w-0 text-[13.5px] font-semibold">&ldquo;{h.text}&rdquo;</div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-mono text-[11.5px] font-bold text-muted">{h.used}×</span>
                <span
                  className="rounded px-2 py-1 font-mono text-[10px] font-extrabold tracking-wide"
                  style={{ color: HOOK_TAG_COLOR[h.tag], background: HOOK_TAG_COLOR[h.tag] + '1a' }}
                >
                  {h.tag}
                </span>
                <button
                  onClick={() => toast('คัดลอก hook แล้ว — Claude กำลังร่างสคริปต์จาก hook นี้…')}
                  className="rounded-lg border border-line px-3 py-1.5 text-[12px] font-semibold transition hover:border-brand hover:text-brand"
                >
                  ใช้อันนี้
                </button>
              </div>
            </div>
          ))}
          {shown.length === 0 && (
            <div className="py-10 text-center text-[13px] text-faint">ไม่พบ hook ที่ค้นหา</div>
          )}
        </div>
      </div>
    </>
  )
}
