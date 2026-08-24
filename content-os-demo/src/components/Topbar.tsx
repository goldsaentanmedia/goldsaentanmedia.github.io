import { Link } from 'react-router-dom'
import { useToast } from '../toast'

export default function Topbar({ onMenu }: { onMenu: () => void }) {
  const toast = useToast()

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-cream/90 px-5 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          aria-label="เปิดเมนู"
          className="rounded-lg border border-line bg-surface p-2 lg:hidden"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-[14px] font-bold">
              <span className="text-gold">✦</span> Content OS · by Claude COWORK
            </span>
            <Link
              to="/"
              className="rounded-full border border-line bg-surface px-2.5 py-0.5 font-mono text-[10.5px] text-muted transition hover:border-brand hover:text-brand"
            >
              # แผนผังระบบ
            </Link>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11.5px] text-muted">
            <span className="pulse-dot inline-block h-1.5 w-1.5 rounded-full bg-up" />
            อัปเดตล่าสุดโดย Claude · วันนี้ 6:00 น.
          </div>
        </div>

        <button
          onClick={() => toast('Claude กำลังร่าง reel ใหม่ให้…')}
          className="ml-auto shrink-0 rounded-xl bg-brand px-4 py-2.5 text-[13px] font-bold text-white transition hover:opacity-90"
        >
          + สร้าง REEL
        </button>
      </div>
    </header>
  )
}
