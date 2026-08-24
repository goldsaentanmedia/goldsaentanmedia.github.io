import type { ReactNode } from 'react'

/** กล่องสรุปของ Claude ท้ายหน้า */
export default function ClaudeNote({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 rounded-2xl border border-brand-line bg-brand-soft px-5 py-4">
      <div className="mb-1 text-[13px] font-bold text-brand">✦ Claude แนะนำ</div>
      <div className="text-[13.5px] leading-[1.7] text-ink/80">{children}</div>
    </div>
  )
}
