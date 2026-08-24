import type { ReactNode } from 'react'

export default function Modal({
  open, onClose, title, sub, children, closeLabel = 'เข้าใจแล้ว',
}: {
  open: boolean
  onClose: () => void
  title: string
  sub?: string
  children: ReactNode
  closeLabel?: string
}) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-line bg-surface p-7 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {sub && <div className="label mb-1">{sub}</div>}
        <h3 className="mb-3 text-xl font-bold">{title}</h3>
        <div className="text-[14px] leading-[1.75] text-muted">{children}</div>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-brand py-3 text-[14px] font-bold text-white transition hover:opacity-90"
        >
          {closeLabel}
        </button>
      </div>
    </div>
  )
}
