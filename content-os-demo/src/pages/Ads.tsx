import StatCard from '../components/StatCard'
import PageIntro from '../components/PageIntro'
import Badge from '../components/Badge'
import ClaudeNote from '../components/ClaudeNote'
import { adAdvice, adCampaigns, adStats } from '../data/mock'

const baht = (n: number) => '฿' + n.toLocaleString('th-TH')

/** สี ROAS: 3 เท่าขึ้นไปคุ้ม 2–3 พอไหว ต่ำกว่านั้นควรทบทวน */
const roasColor = (r: number) =>
  r >= 3 ? 'text-up' : r >= 2 ? 'text-gold' : 'text-down'

export default function Ads() {
  const totalSpend = adCampaigns.reduce((s, a) => s + a.spend, 0)
  const totalLeads = adCampaigns.reduce((s, a) => s + a.leads, 0)
  const avgCpl = Math.round(totalSpend / totalLeads)
  const avgRoas = (adCampaigns.reduce((s, a) => s + a.roas * a.spend, 0) / totalSpend).toFixed(1)

  return (
    <>
      <PageIntro
        title="โฆษณา FB/IG"
        intro="ผลโฆษณา Facebook & Instagram รวมที่เดียว — Campaign ไหนคุ้ม Campaign ไหนควรหยุด Claude สรุปให้ทุกเช้า"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {adStats.map(s => <StatCard key={s.label} stat={s} />)}
      </div>

      <div className="card mt-5 p-5">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[16px] font-bold">ผลงานแต่ละ Campaign · 7 วันล่าสุด</h2>
          <Badge>FB + IG</Badge>
        </div>
        <p className="mb-3 text-[12px] text-muted">
          <span className="text-gold">✦</span> ดึงข้อมูลจาก Meta Ads ทุกเช้า สรุปว่า Campaign ไหนคุ้มที่สุด Campaign ไหนควรหยุด
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b-2 border-line">
                {['Campaign', 'งบที่ใช้', 'ลูกค้า', 'ต้นทุน/ราย', 'ROAS'].map((h, i) => (
                  <th
                    key={h}
                    className={`label px-3 py-2.5 ${i === 0 ? 'text-left' : 'text-right'}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {adCampaigns.map(c => (
                <tr key={c.name} className="border-b border-line">
                  <td className="px-3 py-3 font-semibold">{c.name}</td>
                  <td className="px-3 py-3 text-right text-ink/75">{baht(c.spend)}</td>
                  <td className="px-3 py-3 text-right text-ink/75">{c.leads}</td>
                  <td className={`px-3 py-3 text-right ${c.cpl > 120 ? 'text-down' : 'text-ink/75'}`}>
                    {baht(c.cpl)}
                  </td>
                  <td className={`px-3 py-3 text-right font-bold ${roasColor(c.roas)}`}>
                    {c.roas.toFixed(1)}x
                  </td>
                </tr>
              ))}
              <tr className="bg-cream font-bold">
                <td className="px-3 py-3">รวมทั้งหมด</td>
                <td className="px-3 py-3 text-right">{baht(totalSpend)}</td>
                <td className="px-3 py-3 text-right">{totalLeads}</td>
                <td className="px-3 py-3 text-right">{baht(avgCpl)}</td>
                <td className="px-3 py-3 text-right text-up">{avgRoas}x</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <ClaudeNote>
        Campaign <b className="text-ink">&ldquo;{adAdvice.good}&rdquo;</b> ทำ ROAS {adAdvice.goodRoas} สูงสุด —
        แนะนำเพิ่มงบอีก 20% ส่วน Campaign <b className="text-ink">&ldquo;{adAdvice.bad}&rdquo;</b> ต้นทุน/รายพุ่งถึง {adAdvice.badCpl} (ROAS แค่ {adAdvice.badRoas})
        ควรหยุดหรือปรับกลุ่มเป้าหมายใหม่
      </ClaudeNote>
    </>
  )
}
