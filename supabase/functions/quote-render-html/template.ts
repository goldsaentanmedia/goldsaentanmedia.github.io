/**
 * แบบฟอร์มใบเสนอราคา — เก็บเป็นโค้ด แทนการใช้ชีตต้นแบบใน Google Sheet
 *
 * เลย์เอาต์ สี และสัดส่วน ถอดมาจากใบเสนอราคา QT2026070002 ที่ใช้อยู่จริง
 * (สีแบรนด์ #C6355C, ตัวอักษรหลัก 11.25pt, หัวเรื่อง 21pt)
 *
 * การแปลงเป็น PDF ใช้ window.print() ของเบราว์เซอร์ เพราะเบราว์เซอร์ทำ text shaping
 * ภาษาไทยได้ถูกต้อง (สระบน/วรรณยุกต์วางตำแหน่งตาม GPOS ของฟอนต์)
 */

import { LOGO_BOTTOM, LOGO_TOP, SIGNATURE } from './assets.ts'

export const BRAND = '#C6355C'

export const COMPANY = {
  nameTh: 'บริษัท โกลด์ แสนตัน มีเดีย จำกัด (สำนักงานใหญ่)',
  nameShort: 'บริษัท โกลด์ แสนตัน มีเดีย จำกัด',
  addressTh: '75/32-33 หมู่ 6 ตำบลรัษฎา อำเภอเมือง จังหวัดภูเก็ต 83000',
  taxId: '0835568007571',
  phone: '0647946141',
  /** ตั้งเป็น false ถ้าไม่ต้องการให้ลายเซ็นผู้อนุมัติติดไปกับเอกสารทุกใบ */
  autoSign: true,
}

export const DEFAULT_NOTES = [
  '(1) ใบเสนอราคานี้มีอายุ 30 วันนับจากวันที่ออกเอกสาร',
  '(2) ข้อตกลงและเงื่อนไขในการให้บริการเป็นไปตามหนังสือสัญญาข้อตกลงและเงื่อนไขการให้บริการ ตามที่ได้แนบท้ายใบเสนอราคาฉบับนี้',
  '(3) ใบเสนอราคานี้จัดทำขึ้นเพื่อเสนอราคาเบื้องต้นเท่านั้น ยังไม่ถือเป็นสัญญาผูกพัน จนกว่าจะมีการลงนามในสัญญาหรือออกใบสั่งซื้อ (PO) อย่างเป็นทางการ',
]

export const DEFAULT_PAYMENT_TERMS = [
  '(1) การเผยแพร่โฆษณาจะเริ่มดำเนินการ หลังจากบริษัทฯ ได้รับการชำระค่าบริการเต็มจำนวนเป็นที่เรียบร้อยแล้ว',
]

export type QuoteItem = {
  description?: string
  qty?: number
  unit?: string
  unit_price?: number
  amount?: number
}

export type QuoteData = {
  doc_no: string
  issue_date: string // ISO yyyy-mm-dd
  seller: string
  customer_name: string
  customer_address: string
  customer_tax_id: string
  items: QuoteItem[]
  subtotal: number
  discount_percent: number
  discount_amount: number
  vat_percent: number
  vat: number
  total: number
  wht_percent: number
  wht_amount: number
  net_payable: number
  notes: string[]
  payment_terms: string[]
}

/* ---------- ตัวช่วย ---------- */

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const money = (n: unknown) =>
  Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const formatDMY = (iso: string) => {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

const multiline = (v: string) => esc(v).replace(/\r?\n/g, '<br>')

/* ---------- จำนวนเงินเป็นตัวอักษร ---------- */

const TH_DIGIT = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า']
const TH_PLACE = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน']

function readInt(s: string): string {
  s = s.replace(/^0+/, '')
  if (!s) return ''
  // เกินหลักแสนให้ตัดเป็นกลุ่มละ 6 หลักแล้วคั่นด้วย "ล้าน"
  if (s.length > 6) return readInt(s.slice(0, s.length - 6)) + 'ล้าน' + readInt(s.slice(-6))

  let out = ''
  for (let i = 0; i < s.length; i++) {
    const d = Number(s[i])
    const place = s.length - i - 1
    if (d === 0) continue
    if (place === 1 && d === 1) out += 'สิบ'
    else if (place === 1 && d === 2) out += 'ยี่สิบ'
    else if (place === 0 && d === 1 && s.length > 1) out += 'เอ็ด'
    else out += TH_DIGIT[d] + TH_PLACE[place]
  }
  return out
}

/** 197736 -> "หนึ่งแสนเก้าหมื่นเจ็ดพันเจ็ดร้อยสามสิบหกบาทถ้วน" */
export function bahtText(amount: number): string {
  const neg = Number(amount) < 0
  const abs = Math.abs(Math.round(Number(amount || 0) * 100) / 100)
  const baht = Math.floor(abs)
  const satang = Math.round((abs - baht) * 100)

  if (baht === 0 && satang === 0) return 'ศูนย์บาทถ้วน'

  let s = ''
  if (baht > 0) s += readInt(String(baht)) + 'บาท'
  s += satang === 0 ? 'ถ้วน' : readInt(String(satang)) + 'สตางค์'
  return (neg ? 'ลบ' : '') + s
}

/* ---------- ชิ้นส่วนเอกสาร ---------- */

function itemRows(items: QuoteItem[]): string {
  if (!items.length) return '<tr><td colspan="5">&nbsp;</td></tr>'
  return items
    .map(
      (it, i) => `
      <tr>
        <td class="c-no">${i + 1}</td>
        <td class="c-desc">${multiline(it.description || '')}</td>
        <td class="c-qty">${esc(it.qty ?? '')}${it.unit ? ' <span class="unit">' + esc(it.unit) + '</span>' : ''}</td>
        <td class="c-price">${money(it.unit_price)}</td>
        <td class="c-amt">${money(it.amount)}</td>
      </tr>`,
    )
    .join('')
}

const listBlock = (title: string, lines: string[]) =>
  lines.length
    ? `<div class="block">
         <div class="block-title">${esc(title)}</div>
         ${lines.map((l) => `<div class="block-line">${esc(l)}</div>`).join('')}
       </div>`
    : ''

/* ---------- เอกสาร ---------- */

export function renderQuotationHtml(d: QuoteData, opts: { autoPrint?: boolean } = {}): string {
  const afterDiscount = Number(d.subtotal || 0) - Number(d.discount_amount || 0)

  const autoPrint = opts.autoPrint
    ? '<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},400)})</script>'
    : ''

  return `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<title>${esc(d.doc_no || 'ใบเสนอราคา')}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600&display=swap" rel="stylesheet">
<style>
  /* ฟอนต์ต้นฉบับคือ CS ChatThai (ไม่มีหัว) ถ้าเครื่องมีจะถูกใช้ก่อน
     ถ้าไม่มีจะถอยไป Sarabun ซึ่งเป็นไทยไม่มีหัวเหมือนกัน */
  :root { --brand: ${BRAND}; }

  @page { size: A4 portrait; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: 'CS ChatThai', 'CSChatThai', 'Sarabun', 'Noto Sans Thai', Tahoma, sans-serif;
    font-size: 10.5pt; line-height: 1.4; color: #000; background: #eceff1;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  .sheet {
    /* 296mm ไม่ใช่ 297mm เพื่อกันการปัดเศษที่ทำให้ Chrome แถมหน้าเปล่า */
    position: relative; width: 210mm; min-height: 296mm; margin: 0 auto;
    padding: 12.5mm; background: #fff; overflow: hidden;
    display: flex; flex-direction: column;
  }
  @media print {
    body { background: #fff; }
    .sheet { margin: 0; box-shadow: none; }
    .no-print { display: none !important; }
  }
  @media screen { .sheet { box-shadow: 0 2px 14px rgba(0,0,0,.18); margin: 12px auto; } }

  /* สามเหลี่ยมมุมขวาบน */
  .corner {
    position: absolute; top: 0; right: 0; width: 25mm; height: 21mm;
    background: var(--brand); clip-path: polygon(100% 0, 0 0, 100% 100%);
  }

  /* หัวเอกสาร */
  .head { display: flex; justify-content: space-between; align-items: flex-start; }
  .head img { width: 49mm; }
  .title-wrap { padding-top: 3mm; width: 78mm; }
  .title { color: var(--brand); font-size: 21pt; text-align: right; line-height: 1.1; }
  .title-rule { border-bottom: .35mm solid var(--brand); margin-top: 2.5mm; }

  /* บริษัท + ข้อมูลเอกสาร */
  .meta { display: flex; justify-content: space-between; gap: 6mm; margin-top: 3.5mm; }
  .company { flex: 1; }
  .docinfo { width: 78mm; }
  .docinfo .row { display: flex; justify-content: space-between; gap: 4mm; }
  .docinfo .k { color: var(--brand); white-space: nowrap; }
  .docinfo .v { text-align: right; }

  /* ลูกค้า */
  .customer { margin-top: 6mm; }
  .customer .caption { color: var(--brand); }

  /* ตารางรายการ */
  table.items { width: 100%; border-collapse: collapse; margin-top: 6mm; }
  table.items thead { display: table-header-group; }
  table.items th {
    background: var(--brand); color: #fff; font-weight: normal;
    padding: 1.6mm 2.5mm; text-align: center; white-space: nowrap;
  }
  table.items th.a-desc { text-align: center; }
  table.items th.a-right { text-align: right; }
  table.items td { padding: 2mm 2.5mm; vertical-align: top; }
  table.items tbody tr { border-bottom: .25mm solid #d9d9d9; break-inside: avoid; page-break-inside: avoid; }
  td.c-no { text-align: center; width: 5%; }
  td.c-desc { width: 53%; }
  td.c-qty { width: 11%; text-align: right; white-space: nowrap; }
  td.c-qty .unit { display: inline-block; min-width: 10mm; text-align: left; }
  td.c-price { width: 14.5%; text-align: right; }
  td.c-amt { width: 14.5%; text-align: right; }

  /* ยอดรวม */
  .sums { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 3mm; gap: 6mm; }
  .baht-text { padding-top: 23mm; }
  .totals { width: 95mm; break-inside: avoid; page-break-inside: avoid; }
  .totals .row { display: flex; justify-content: flex-end; align-items: baseline; gap: 3mm; padding: .7mm 0; }
  .totals .k { color: var(--brand); text-align: right; }
  .totals .v { width: 30mm; text-align: right; }
  .totals .u { width: 9mm; }
  .totals .gap { height: 5mm; }

  /* หมายเหตุ / เงื่อนไข */
  .block { margin-top: 4mm; }
  .block-title { color: var(--brand); }
  .block-line { line-height: 1.5; }

  /* ท้ายเอกสาร */
  .foot { margin-top: auto; padding-top: 4mm; break-inside: avoid; page-break-inside: avoid; }
  .foot-names { display: flex; justify-content: space-between; }
  .foot-mid { position: relative; height: 22mm; }
  .foot-mid img.mark { position: absolute; left: 50%; transform: translateX(-50%); bottom: 1mm; width: 37mm; }
  .foot-mid img.sign { position: absolute; right: 44mm; bottom: 1.5mm; width: 21mm; }
  .foot-mid .signdate { position: absolute; right: 0; bottom: 2mm; width: 32mm; text-align: center; }
  .foot-lines { display: flex; justify-content: space-between; }
  .foot-lines .cell { text-align: center; }
  .foot-lines .line { border-top: .3mm solid #000; }
  .foot-lines .lbl { padding-top: 1.2mm; }
  .w-wide { width: 42mm; }
  .w-narrow { width: 32mm; }

  .toolbar { text-align: center; padding: 10px; }
  .toolbar button { font: inherit; padding: 7px 20px; cursor: pointer; }
</style>
</head>
<body>
<div class="toolbar no-print"><button onclick="window.print()">พิมพ์ / บันทึกเป็น PDF</button></div>

<div class="sheet">
  <div class="corner"></div>

  <div class="head">
    <img src="${LOGO_TOP}" alt="">
    <div class="title-wrap">
      <div class="title">ใบเสนอราคา</div>
      <div class="title-rule"></div>
    </div>
  </div>

  <div class="meta">
    <div class="company">
      <div>${esc(COMPANY.nameTh)}</div>
      <div>${esc(COMPANY.addressTh)}</div>
      <div>เลขประจำตัวผู้เสียภาษี ${esc(COMPANY.taxId)}</div>
      <div>เบอร์มือถือ ${esc(COMPANY.phone)}</div>
    </div>
    <div class="docinfo">
      <div class="row"><span class="k">เลขที่</span><span class="v">${esc(d.doc_no)}</span></div>
      <div class="row"><span class="k">วันที่</span><span class="v">${esc(formatDMY(d.issue_date))}</span></div>
      <div class="row"><span class="k">ผู้ขาย</span><span class="v">${esc(d.seller)}</span></div>
    </div>
  </div>

  <div class="customer">
    <div class="caption">ลูกค้า</div>
    <div>${esc(d.customer_name)}</div>
    <div>${multiline(d.customer_address || '')}</div>
    ${d.customer_tax_id ? '<div>เลขประจำตัวผู้เสียภาษี ' + esc(d.customer_tax_id) + '</div>' : ''}
  </div>

  <table class="items">
    <thead>
      <tr>
        <th>#</th>
        <th class="a-desc">รายละเอียด</th>
        <th>จำนวน</th>
        <th class="a-right">ราคาต่อหน่วย</th>
        <th class="a-right">ยอดรวม</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows(d.items || [])}
    </tbody>
  </table>

  <div class="sums">
    <div class="baht-text">(${esc(bahtText(d.total))})</div>
    <div class="totals">
      <div class="row"><span class="k">รวมเป็นเงิน</span><span class="v">${money(d.subtotal)}</span><span class="u">บาท</span></div>
      <div class="row"><span class="k">ส่วนลด ${esc(d.discount_percent || 0)}%</span><span class="v">${money(d.discount_amount)}</span><span class="u">บาท</span></div>
      <div class="row"><span class="k">จำนวนเงินหลังหักส่วนลด</span><span class="v">${money(afterDiscount)}</span><span class="u">บาท</span></div>
      <div class="row"><span class="k">ภาษีมูลค่าเพิ่ม ${esc(d.vat_percent || 0)}%</span><span class="v">${money(d.vat)}</span><span class="u">บาท</span></div>
      <div class="row"><span class="k">จำนวนเงินรวมทั้งสิ้น</span><span class="v">${money(d.total)}</span><span class="u">บาท</span></div>
      <div class="gap"></div>
      <div class="row"><span class="k">หักภาษี ณ ที่จ่าย ${esc(d.wht_percent || 0)}%</span><span class="v">${money(d.wht_amount)}</span><span class="u">บาท</span></div>
      <div class="row"><span class="k">ยอดชำระ</span><span class="v">${money(d.net_payable)}</span><span class="u">บาท</span></div>
    </div>
  </div>

  ${listBlock('หมายเหตุ', d.notes && d.notes.length ? d.notes : DEFAULT_NOTES)}
  ${listBlock('เงื่อนไขการชำระค่าบริการ:', d.payment_terms && d.payment_terms.length ? d.payment_terms : DEFAULT_PAYMENT_TERMS)}

  <div class="foot">
    <div class="foot-names">
      <div>ในนาม ${esc(d.customer_name)}</div>
      <div>ในนาม ${esc(COMPANY.nameShort)}</div>
    </div>
    <div class="foot-mid">
      <img class="mark" src="${LOGO_BOTTOM}" alt="">
      ${COMPANY.autoSign ? `<img class="sign" src="${SIGNATURE}" alt="">` : ''}
      ${COMPANY.autoSign ? `<div class="signdate">${esc(formatDMY(d.issue_date))}</div>` : ''}
    </div>
    <div class="foot-lines">
      <div class="cell w-wide"><div class="line"></div><div class="lbl">ผู้สั่งซื้อสินค้า</div></div>
      <div class="cell w-narrow"><div class="line"></div><div class="lbl">วันที่</div></div>
      <div class="cell w-wide"><div class="line"></div><div class="lbl">ผู้อนุมัติ</div></div>
      <div class="cell w-narrow"><div class="line"></div><div class="lbl">วันที่</div></div>
    </div>
  </div>

</div>
${autoPrint}
</body>
</html>`
}
