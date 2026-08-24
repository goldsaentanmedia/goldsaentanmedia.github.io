import PageIntro from '../components/PageIntro'
import Badge from '../components/Badge'
import { calendarEvents, calendarMonth, PLATFORM_COLOR } from '../data/mock'
import { useToast } from '../toast'

const DOW = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

export default function Calendar() {
  const toast = useToast()
  const { year, month, label } = calendarMonth

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDow = new Date(year, month, 1).getDay()
  const cells: (number | null)[] = [
    ...Array<null>(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const total = Object.values(calendarEvents).reduce((s, e) => s + e.length, 0)

  return (
    <>
      <PageIntro
        title="ปฏิทิน CONTENT"
        intro="เห็นทุกคอนเทนต์ที่ตั้งเวลาไว้ในที่เดียว กดที่ช่องเพื่อดู script เต็ม"
      />

      <div className="card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[16px] font-bold">{label} · ตั้งเวลาครบแล้ว</h2>
          <Badge tone="brand">{total} รายการ · {calendarMonth.platforms} PLATFORMS</Badge>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[680px]">
            <div className="mb-2 grid grid-cols-7 gap-2">
              {DOW.map(d => (
                <div key={d} className="label text-center">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {cells.map((d, i) => (
                <div
                  key={i}
                  className={`min-h-[92px] rounded-xl p-2 ${
                    d ? 'border border-line bg-surface' : ''
                  }`}
                >
                  {d && (
                    <>
                      <div className="mb-1.5 font-mono text-[11px] font-bold text-muted">{d}</div>
                      <div className="space-y-1">
                        {(calendarEvents[d] ?? []).map((e, k) => (
                          <button
                            key={k}
                            onClick={() => toast(`${e.type} · ${e.time} — Claude กำลังเปิด script ให้…`)}
                            className="block w-full truncate rounded-md px-1.5 py-1 text-left text-[9.5px] font-semibold leading-tight"
                            style={{ background: PLATFORM_COLOR[e.platform] ?? '#F1EDE8' }}
                          >
                            {e.time} {e.type}{e.platform && ` · ${e.platform}`}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {Object.entries(PLATFORM_COLOR).map(([k, c]) => (
            <span key={k} className="flex items-center gap-1.5 text-[11.5px] text-muted">
              <span className="inline-block h-3 w-3 rounded" style={{ background: c }} />
              {k}
            </span>
          ))}
        </div>
      </div>
    </>
  )
}
