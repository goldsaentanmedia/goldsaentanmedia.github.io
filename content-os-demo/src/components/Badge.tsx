import type { ReactNode } from 'react'

export default function Badge({
  children, tone = 'muted',
}: { children: ReactNode; tone?: 'muted' | 'brand' | 'gold' }) {
  const cls = {
    muted: 'border-line bg-surface text-muted',
    brand: 'border-brand-line bg-brand-soft text-brand',
    gold: 'border-[#EAD9A8] bg-[#FBF3DF] text-gold',
  }[tone]
  return (
    <span className={`shrink-0 rounded-full border px-3 py-1 font-mono text-[10.5px] font-bold tracking-wide ${cls}`}>
      {children}
    </span>
  )
}
