import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Modal from '../components/Modal'
import PromoBanner from '../components/PromoBanner'
import { coreBoxes, mapColumns } from '../data/mock'
import type { CoreBox } from '../data/mock'

/**
 * หน้าแรก — แผนผังระบบ ไม่ใช่ dashboard
 *
 * ตั้งใจให้เห็นภาพรวมก่อนว่าอะไรต่อกับอะไร แล้วค่อยกดเข้าไปดูของจริง
 * คนที่เพิ่งเห็นระบบครั้งแรกมักไม่รู้ว่าจะเริ่มดูตรงไหน หน้านี้ตอบข้อนั้น
 */

/** เส้นประเชื่อมระหว่างชั้น ใช้ซ้ำหลายที่ */
function Connector({ height = 28 }: { height?: number }) {
  return (
    <div className="flex justify-center" aria-hidden>
      <div className="border-l border-dashed border-line" style={{ height }} />
    </div>
  )
}

function Arrow() {
  return (
    <div className="flex justify-center text-faint" aria-hidden>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  )
}

export default function SystemMap() {
  const nav = useNavigate()
  const [info, setInfo] = useState<CoreBox | null>(null)

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-full max-w-[1000px] px-5 py-10">
        <header className="text-center">
          <div className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-gold">
            ✦ Content OS · by Claude COWORK
          </div>
          <h1 className="mt-3 text-[38px] font-extrabold leading-tight tracking-tight">
            Marketing System
          </h1>
          <p className="mx-auto mt-3 max-w-[520px] text-[14px] leading-relaxed text-muted">
            กดกล่องไหนก็ได้เพื่อเข้าไปดูข้างใน — เป็นตัวอย่างระบบ ใช้ข้อมูลตัวอย่าง
          </p>
        </header>

        {/* ---------------- CORE ---------------- */}
        <div className="mt-10">
          <div className="label mb-3 text-center">Core · สมองของระบบ</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {coreBoxes.map(b => (
              <div key={b.key} className="card-dashed relative p-4">
                <button
                  onClick={() => setInfo(b)}
                  aria-label={`อธิบาย ${b.title}`}
                  className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border border-line font-mono text-[11px] text-muted transition hover:border-brand hover:text-brand"
                >
                  ?
                </button>
                <div className="text-[15px] font-bold">{b.title}</div>
                <div className="label mt-1">{b.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <Connector />
        <Arrow />

        {/* ---------------- 3 คอลัมน์ ---------------- */}
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {mapColumns.map(col => (
            <div key={col.heading} className="card-dashed p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="text-[14px] font-bold">{col.heading}</div>
                <div className="flex gap-1">
                  {col.icons.map(ic => (
                    <span
                      key={ic}
                      className="flex h-5 min-w-5 items-center justify-center rounded border border-line px-1 font-mono text-[9px] text-muted"
                    >
                      {ic}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {col.rows.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => nav(r.to)}
                    className="group block w-full rounded-xl border border-line bg-cream/60 px-3 py-2.5 text-left transition hover:border-brand hover:bg-brand-soft"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-bold">{r.title}</span>
                      <span className="text-[13px] text-faint transition group-hover:text-brand">→</span>
                    </div>
                    <div className="mt-0.5 text-[11.5px] leading-snug text-muted">{r.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Connector />
        <Arrow />

        {/* ---------------- OUTPUT ---------------- */}
        <div className="mt-4">
          <div className="label mb-3 text-center">Output</div>
          <button
            onClick={() => nav('/overview')}
            className="group card-dashed block w-full p-5 text-left transition hover:border-brand hover:bg-brand-soft"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[16px] font-bold">ภาพรวม + รายงานสรุปทุกเช้า</div>
                <div className="mt-1 text-[12.5px] text-muted">
                  ยอดวิว · รายได้ · คนทัก DM · สิ่งที่ควรทำต่อ — รวมไว้หน้าเดียว
                </div>
              </div>
              <span className="text-[18px] text-faint transition group-hover:text-brand">→</span>
            </div>
          </button>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/overview"
            className="font-mono text-[11.5px] text-muted underline underline-offset-4 hover:text-brand"
          >
            ข้ามไปดู dashboard เลย
          </Link>
        </div>
      </div>

      {/* ปุ่มลอยบอกว่าระบบกำลังรันอยู่ */}
      <div className="pointer-events-none sticky bottom-6 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 shadow-lg">
          <span className="pulse-dot inline-block h-2 w-2 rounded-full bg-up" />
          <span className="text-[13px] font-bold">Stop Claude</span>
        </div>
      </div>

      <Modal
        open={info !== null}
        onClose={() => setInfo(null)}
        title={info?.title ?? ''}
        sub={info?.sub}
      >
        {info?.body}
      </Modal>

      <PromoBanner />
    </div>
  )
}
