import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import PageIntro from '../components/PageIntro'
import { overviewStats, quickLinks } from '../data/mock'

export default function Overview() {
  return (
    <>
      <PageIntro
        title="ภาพรวม"
        intro="ยอดวิว รายได้ คนทัก DM และสิ่งที่ควรทำต่อ — Claude สรุปให้ทุกเช้า 6 โมง"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {overviewStats.map(s => <StatCard key={s.label} stat={s} />)}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {quickLinks.map(q => (
          <Link
            key={q.title}
            to={q.to}
            className="group card flex items-center gap-3 p-4 transition hover:border-brand hover:bg-brand-soft"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cream text-[16px] text-brand">
              {q.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-bold">{q.title}</span>
              <span className="block truncate text-[12px] text-muted">{q.preview}</span>
            </span>
            <span className="text-[15px] text-faint transition group-hover:text-brand">→</span>
          </Link>
        ))}
      </div>
    </>
  )
}
