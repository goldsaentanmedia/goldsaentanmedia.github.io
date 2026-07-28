/**
 * แบบฟอร์มใบเสนอราคา — เก็บเป็นโค้ด แทนการใช้ชีตต้นแบบใน Google Sheet
 *
 * เลย์เอาต์ถอดมาจากชีตต้นแบบเดิม (A4 แนวตั้ง ขอบ 10 มม.)
 * การแปลงเป็น PDF ใช้ window.print() ของเบราว์เซอร์ เพราะเบราว์เซอร์ทำ text shaping
 * ภาษาไทยได้ถูกต้อง (สระบน/วรรณยุกต์วางตำแหน่งตาม GPOS ของฟอนต์) ซึ่งไลบรารีวาด PDF
 * ฝั่งเซิร์ฟเวอร์อย่าง pdf-lib ทำไม่ได้
 */

export const COMPANY = {
  nameTh: 'บริษัท โกลด์ แสนตัน มีเดีย จำกัด (สำนักงานใหญ่)',
  addressTh: '75/32-33 หมู่ 6 ตำบลรัษฎา อำเภอเมือง จังหวัดภูเก็ต 83000',
  taxId: '0835568007571',
  phone: '0647946141',
  signerName: 'พสิษฐ์ ศิริทองแสนตัน',
  /** ใส่ URL โลโก้ หรือ data: URI ถ้าต้องการให้ขึ้นหัวเอกสาร ปล่อยว่าง = ใช้ชื่อบริษัทเป็นตัวอักษร */
  logoUrl: '',
}

export const DEFAULT_NOTES = [
  '(1) ใบเสนอราคานี้มีอายุ 30 วันนับจากวันที่ออกเอกสาร',
  '(2) ข้อตกลงและเงื่อนไขในการให้บริการเป็นไปตามหนังสือสัญญาข้อตกลงและเงื่อนไขการให้บริการ ตามที่ได้แนบท้ายใบเสนอราคาฉบับนี้',
  '(3) ใบเสนอราคานี้จัดทำขึ้นเพื่อเสนอราคาเบื้องต้นเท่านั้น ยังไม่ถือเป็นสัญญาผูกพัน จนกว่าจะมีการลงนามในสัญญาหรือออกใบสั่งซื้อ (PO) อย่างเป็นทางการ',
  '(4) เงื่อนไขการชำระเงิน: ต้องชำระเงินเต็มจำนวนก่อนเผยแพร่โฆษณา',
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
  credit_days: number
  issued_by: string
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
}

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

/** ข้อความหลายบรรทัดในช่องรายละเอียด -> <br> โดย escape ก่อนเสมอ */
const multiline = (v: string) => esc(v).replace(/\r?\n/g, '<br>')

function itemRows(items: QuoteItem[]): string {
  if (!items.length) return '<tr class="item"><td colspan="5">&nbsp;</td></tr>'
  return items
    .map(
      (it) => `
      <tr class="item">
        <td class="desc">${multiline(it.description || '')}</td>
        <td class="num">${esc(it.qty ?? '')}</td>
        <td class="unit">${esc(it.unit || '')}</td>
        <td class="money">${money(it.unit_price)}</td>
        <td class="money">${money(it.amount)}</td>
      </tr>`,
    )
    .join('')
}

export function renderQuotationHtml(d: QuoteData, opts: { autoPrint?: boolean } = {}): string {
  const notes = (d.notes && d.notes.length ? d.notes : DEFAULT_NOTES)
    .map((n) => `<div class="note">${esc(n)}</div>`)
    .join('')

  const logo = COMPANY.logoUrl
    ? `<img class="logo" src="${esc(COMPANY.logoUrl)}" alt="">`
    : `<div class="logo-text">GOLD SAENTAN MEDIA</div>`

  const autoPrint = opts.autoPrint
    ? '<script>window.addEventListener("load",function(){setTimeout(function(){window.print()},300)})</script>'
    : ''

  return `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<title>${esc(d.doc_no || 'ใบเสนอราคา')}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4 portrait; margin: 10mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body {
    font-family: 'Sarabun', 'Noto Sans Thai', 'TH Sarabun New', 'Leelawadee UI', sans-serif;
    font-size: 10.5pt; line-height: 1.35; color: #000; background: #f0f0f0;
  }
  .sheet {
    width: 210mm; min-height: 297mm; margin: 0 auto; padding: 10mm;
    background: #fff; display: flex; flex-direction: column;
  }
  @media print {
    body { background: #fff; }
    .sheet { width: auto; min-height: auto; margin: 0; padding: 0; }
    .no-print { display: none !important; }
  }

  /* หัวเอกสาร */
  .head { display: flex; justify-content: space-between; align-items: flex-start; }
  .logo { max-height: 26mm; max-width: 70mm; }
  .logo-text { font-weight: 700; font-size: 15pt; letter-spacing: .5px; }
  .doc-title { font-size: 20pt; font-weight: 700; text-align: right; }

  /* บริษัท + ข้อมูลเอกสาร */
  .meta { display: flex; justify-content: space-between; gap: 8mm; margin-top: 4mm; }
  .company { flex: 1; }
  .company div { line-height: 1.45; }
  .company .name { font-weight: 700; }
  .docinfo { width: 62mm; }
  .docinfo table { width: 100%; border-collapse: collapse; }
  .docinfo td { padding: .6mm 0; vertical-align: top; }
  .docinfo td.label { white-space: nowrap; padding-right: 3mm; }
  .docinfo td.value { text-align: right; border-bottom: .3mm solid #000; }

  /* ลูกค้า */
  .customer { margin-top: 5mm; }
  .customer .caption { font-weight: 600; margin-bottom: 1mm; }
  .customer .box { border: .3mm solid #000; padding: 2mm 3mm; min-height: 20mm; }
  .customer .name { font-weight: 600; }

  /* ตารางรายการ */
  table.items { width: 100%; border-collapse: collapse; margin-top: 5mm; }
  table.items th, table.items td { border: .3mm solid #000; padding: 1.6mm 2mm; vertical-align: top; }
  table.items th { background: #e8e8e8; text-align: center; font-weight: 600; }
  table.items thead { display: table-header-group; } /* ซ้ำหัวตารางทุกหน้า */
  table.items tr { break-inside: avoid; page-break-inside: avoid; }
  table.items col.c-desc  { width: 46%; }
  table.items col.c-qty   { width: 9%; }
  table.items col.c-unit  { width: 9%; }
  table.items col.c-price { width: 18%; }
  table.items col.c-amt   { width: 18%; }
  td.num, td.unit { text-align: center; }
  td.money { text-align: right; }
  tr.item td { height: 24mm; }
  tr.filler td { border: .3mm solid #000; height: 100%; }

  /* ยอดรวม */
  .totals { display: flex; justify-content: flex-end; margin-top: 4mm; break-inside: avoid; page-break-inside: avoid; }
  .totals table { border-collapse: collapse; width: 95mm; break-inside: avoid; page-break-inside: avoid; }
  .totals td { padding: 1.2mm 2mm; }
  .totals td.label { text-align: right; }
  .totals td.value { text-align: right; width: 34mm; border-bottom: .3mm solid #000; }
  .totals tr.grand td { font-weight: 700; }
  .totals tr.grand td.value { border: .3mm solid #000; background: #f2f2f2; }
  .totals tr.spacer td { height: 3mm; border: none; }

  /* หมายเหตุ */
  .notes { margin-top: 4mm; }
  .notes .caption { font-weight: 600; margin-bottom: 1mm; }
  .note { font-size: 9pt; line-height: 1.45; }

  /* ลายเซ็น — ต้องไม่ถูกตัดข้ามหน้า */
  .signs { margin-top: auto; padding-top: 4mm; break-inside: avoid; page-break-inside: avoid; }
  .signs .onbehalf { text-align: center; font-weight: 600; margin-bottom: 2mm; }
  .signs .cols { display: flex; gap: 10mm; }
  .signcol { flex: 1; border: .3mm solid #000; padding: 2.5mm 3mm; }
  .signcol .role { text-align: center; font-weight: 600; margin-bottom: 3mm; }
  .signrow { display: flex; align-items: flex-end; gap: 2mm; margin-bottom: 3mm; }
  .signrow .k { white-space: nowrap; }
  .signrow .v { flex: 1; border-bottom: .3mm dotted #000; min-height: 5mm; text-align: center; }

  .toolbar { text-align: center; padding: 8px; }
  .toolbar button { font: inherit; padding: 6px 18px; cursor: pointer; }
</style>
</head>
<body>
<div class="toolbar no-print"><button onclick="window.print()">พิมพ์ / บันทึกเป็น PDF</button></div>
<div class="sheet">

  <div class="head">
    ${logo}
    <div class="doc-title">ใบเสนอราคา</div>
  </div>

  <div class="meta">
    <div class="company">
      <div class="name">${esc(COMPANY.nameTh)}</div>
      <div>${esc(COMPANY.addressTh)}</div>
      <div>เลขประจำตัวผู้เสียภาษี ${esc(COMPANY.taxId)}</div>
      <div>โทรศัพท์ ${esc(COMPANY.phone)}</div>
    </div>
    <div class="docinfo">
      <table>
        <tr><td class="label">เลขที่</td><td class="value">${esc(d.doc_no)}</td></tr>
        <tr><td class="label">วันที่</td><td class="value">${esc(formatDMY(d.issue_date))}</td></tr>
        <tr><td class="label">เครดิต</td><td class="value">${esc(d.credit_days || 0)}</td></tr>
        <tr><td class="label">ผู้ออกเอกสาร</td><td class="value">${esc(d.issued_by)}</td></tr>
      </table>
    </div>
  </div>

  <div class="customer">
    <div class="caption">ลูกค้า</div>
    <div class="box">
      <div class="name">${esc(d.customer_name)}</div>
      <div>${multiline(d.customer_address || '')}</div>
      <div>${d.customer_tax_id ? 'เลขประจำตัวผู้เสียภาษี ' + esc(d.customer_tax_id) : ''}</div>
    </div>
  </div>

  <table class="items">
    <colgroup>
      <col class="c-desc"><col class="c-qty"><col class="c-unit"><col class="c-price"><col class="c-amt">
    </colgroup>
    <thead>
      <tr>
        <th>รายละเอียด</th><th>จำนวน</th><th>หน่วย</th><th>ราคาต่อหน่วย</th><th>ยอดรวม</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows(d.items || [])}
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr><td class="label">รวมเป็นเงิน</td><td class="value">${money(d.subtotal)}</td></tr>
      <tr><td class="label">ส่วนลด ${esc(d.discount_percent || 0)}%</td><td class="value">${money(d.discount_amount)}</td></tr>
      <tr><td class="label">จำนวนเงินหลังหักส่วนลด</td><td class="value">${money(Number(d.subtotal || 0) - Number(d.discount_amount || 0))}</td></tr>
      <tr><td class="label">ภาษีมูลค่าเพิ่ม ${esc(d.vat_percent || 0)}%</td><td class="value">${money(d.vat)}</td></tr>
      <tr class="grand"><td class="label">จำนวนเงินรวมทั้งสิ้น</td><td class="value">${money(d.total)}</td></tr>
      <tr class="spacer"><td colspan="2"></td></tr>
      <tr><td class="label">หักภาษี ณ ที่จ่าย ${esc(d.wht_percent || 0)}%</td><td class="value">${money(d.wht_amount)}</td></tr>
      <tr class="grand"><td class="label">ยอดชำระ</td><td class="value">${money(d.net_payable)}</td></tr>
    </table>
  </div>

  <div class="notes">
    <div class="caption">หมายเหตุ</div>
    ${notes}
  </div>

  <div class="signs">
    <div class="onbehalf">ในนาม ${esc(COMPANY.nameTh.replace(' (สำนักงานใหญ่)', ''))}</div>
    <div class="cols">
      <div class="signcol">
        <div class="role">ผู้ให้บริการ</div>
        <div class="signrow"><span class="k">ลายมือ</span><span class="v"></span></div>
        <div class="signrow"><span class="k">ชื่อ-สกุล</span><span class="v">${esc(COMPANY.signerName)}</span></div>
        <div class="signrow"><span class="k">วันที่</span><span class="v">${esc(formatDMY(d.issue_date))}</span></div>
      </div>
      <div class="signcol">
        <div class="role">ผู้ใช้บริการ</div>
        <div class="signrow"><span class="k">ลายมือ</span><span class="v"></span></div>
        <div class="signrow"><span class="k">ชื่อ-สกุล</span><span class="v"></span></div>
        <div class="signrow"><span class="k">วันที่</span><span class="v"></span></div>
      </div>
    </div>
  </div>

</div>
${autoPrint}
</body>
</html>`
}
