export default function Sparkline({
  data, up = true, width = 120, height = 30,
}: { data: number[]; up?: boolean; width?: number; height?: number }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const step = width / (data.length - 1)
  const pts = data.map((v, i) =>
    `${(i * step).toFixed(1)},${(height - 2 - ((v - min) / range) * (height - 4)).toFixed(1)}`)

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none" className="block">
      <polyline points={pts.join(' ')} fill="none" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round"
        stroke={up ? '#15803d' : '#b91c1c'} />
    </svg>
  )
}
