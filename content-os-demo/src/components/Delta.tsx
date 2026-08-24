/** ตัวเลขเปลี่ยนแปลง เขียวคือขึ้น แดงคือลง */
export default function Delta({ value, up }: { value: string; up: boolean }) {
  return (
    <span className={`text-[13px] font-bold ${up ? 'text-up' : 'text-down'}`}>
      {up ? '▲' : '▼'} {value.replace(/^[+-]/, '')}
    </span>
  )
}
