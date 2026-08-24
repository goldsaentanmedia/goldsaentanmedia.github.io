import type { ReactNode } from 'react'

export default function PageIntro({
  title, intro, badge,
}: { title: string; intro: string; badge?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-[24px] font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-[13px] text-muted">{intro}</p>
      </div>
      {badge}
    </div>
  )
}
