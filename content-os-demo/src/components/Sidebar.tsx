import { NavLink } from 'react-router-dom'
import { BRAND } from '../data/mock'

const GROUPS = [
  {
    heading: null,
    items: [{ to: '/overview', label: 'ภาพรวม' }],
  },
  {
    heading: 'วิเคราะห์ผล',
    items: [
      { to: '/analytics', label: 'ANALYTICS' },
      { to: '/competitors', label: 'ติดตามคู่แข่ง' },
      { to: '/trends', label: 'เทรนด์วันนี้' },
    ],
  },
  {
    heading: 'ทำคอนเทนท์',
    items: [
      { to: '/hooks', label: 'คลัง HOOK' },
      { to: '/schedule', label: 'ตั้งเวลาโพสต์' },
      { to: '/calendar', label: 'ปฏิทิน CONTENT' },
    ],
  },
  {
    heading: 'โฆษณา',
    items: [{ to: '/ads', label: 'ADS · FB/IG' }],
  },
]

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const link = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3 py-2 text-[13.5px] transition ${
      isActive ? 'bg-brand-soft font-bold text-brand' : 'text-muted hover:bg-cream hover:text-ink'
    }`

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col border-r border-line bg-surface">
      <div className="p-4">
        <div className="card flex items-center gap-3 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-[14px] font-bold text-white">
            G
          </div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold">{BRAND.handle}</div>
            <div className="font-mono text-[10.5px] text-muted">
              {BRAND.followers} · {BRAND.followerWindow}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-4">
        <NavLink to="/" onClick={onNavigate} className={link} end>
          <span className="font-mono">#</span> แผนผังระบบ
        </NavLink>

        {GROUPS.map((g, i) => (
          <div key={i} className="mt-4">
            {g.heading && <div className="label mb-1 px-3">{g.heading}</div>}
            {g.items.map(it => (
              <NavLink key={it.to} to={it.to} onClick={onNavigate} className={link}>
                {it.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-line p-4">
        <div className="text-[12.5px] font-bold tracking-wide">{BRAND.user}</div>
        <div className="label mt-0.5">{BRAND.userSub}</div>
      </div>
    </aside>
  )
}
