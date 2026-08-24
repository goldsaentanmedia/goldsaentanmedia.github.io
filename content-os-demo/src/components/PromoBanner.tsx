import { useState } from 'react'

/** แบนเนอร์ขายคอร์สมุมขวาล่าง ปิดได้ ไม่ให้บังเนื้อหา */
export default function PromoBanner() {
  const [open, setOpen] = useState(true)
  if (!open) return null

  return (
    <div className="fixed bottom-5 right-5 z-40 flex max-w-[330px] items-start gap-2 rounded-2xl border border-brand-line bg-brand-soft px-4 py-3 shadow-lg">
      <a href="#/" className="text-[13px] font-bold leading-snug text-brand">
        ☀️ อยากได้ระบบแบบนี้? จองที่นั่ง Live 990 ฿ →
      </a>
      <button
        onClick={() => setOpen(false)}
        aria-label="ปิด"
        className="ml-1 shrink-0 text-[15px] leading-none text-brand/60 hover:text-brand"
      >
        ×
      </button>
    </div>
  )
}
