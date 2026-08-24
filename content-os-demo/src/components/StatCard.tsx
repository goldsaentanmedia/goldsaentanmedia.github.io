import Sparkline from './Sparkline'
import Delta from './Delta'
import type { Stat } from '../data/mock'

export default function StatCard({ stat }: { stat: Stat }) {
  return (
    <div className="card p-5">
      <div className="label mb-2">{stat.label}</div>
      <div className="mb-3 text-[30px] font-extrabold leading-none">{stat.value}</div>
      <div className="flex items-end justify-between gap-3">
        <Sparkline data={stat.series} up={stat.up} />
        <Delta value={stat.delta} up={stat.up} />
      </div>
    </div>
  )
}
