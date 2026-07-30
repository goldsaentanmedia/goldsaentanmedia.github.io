/**
 * ตั้งค่าเอกสาร — นิยามกลางว่าปรับอะไรได้บ้าง
 *
 * ทั้งหน้าตั้งค่า ตัวเรนเดอร์เอกสาร และตัวออกเลขที่เอกสาร อ่านรูปร่างเดียวกันนี้
 * ถ้ามีที่ไหนนิยามซ้ำ วันหนึ่งจะปรับตรงหนึ่งแล้วลืมอีกตรงหนึ่ง
 *
 * ค่าเริ่มต้นในไฟล์นี้ตั้งให้ตรงกับที่ตั้งไว้ใน FlowAccount ตอนนี้
 * เพื่อให้เอกสารที่ออกจากระบบใหม่หน้าตาเหมือนของเดิม
 */

/* ---------- ราคาและตำแหน่งการคำนวณ ---------- */

/** ราคาที่พิมพ์ในเอกสารรวมภาษีแล้วหรือยัง */
export type PriceMode = 'exclusive' | 'inclusive'

/**
 * ภาษี/ส่วนลด/หัก ณ ที่จ่าย คิดรวมทีเดียวท้ายเอกสาร หรือแยกทีละบรรทัด
 * แยกรายบรรทัดใช้เมื่อของในใบเดียวกันอัตราไม่เท่ากัน
 */
export type CalcPosition = 'document_end' | 'line_item'

export type CalcPositions = {
  vat: CalcPosition
  discount: CalcPosition
  wht: CalcPosition
}

/* ---------- เลขที่เอกสาร ---------- */

/**
 * รูปแบบเลขรัน กำหนดว่าเลขรีเซ็ตเมื่อไหร่
 *   plain — PREFIX000001        ไม่รีเซ็ต
 *   ymd   — PREFIX + 202607300001  รีเซ็ตทุกวัน
 *   ym    — PREFIX + 2026070001    รีเซ็ตทุกเดือน
 *   year  — PREFIX + 2026000001    รีเซ็ตทุกปี
 */
export type RunningFormat = 'plain' | 'ymd' | 'ym' | 'year'

/** ประเภทเอกสารที่มีเลขรันของตัวเอง เรียงตามลำดับที่แสดงในหน้าตั้งค่า */
export const DOC_TYPES = [
  { key: 'quotation', label: 'ใบเสนอราคา', prefix: 'QT' },
  { key: 'billing_note', label: 'ใบวางบิล/ใบแจ้งหนี้', prefix: 'BL' },
  { key: 'tax_invoice', label: 'ใบกำกับภาษี/ใบเสร็จ', prefix: 'INV' },
  { key: 'cash_invoice', label: 'เงินสด', prefix: 'CA' },
  { key: 'receipt', label: 'ใบเสร็จรับเงิน', prefix: 'RE' },
  { key: 'credit_note', label: 'ใบลดหนี้', prefix: 'CN' },
  { key: 'debit_note', label: 'ใบเพิ่มหนี้', prefix: 'DN' },
  { key: 'purchase_order', label: 'ใบสั่งซื้อ', prefix: 'PO' },
  { key: 'receiving', label: 'ใบรับสินค้า', prefix: 'RI' },
] as const

export type DocTypeKey = (typeof DOC_TYPES)[number]['key']

/**
 * ส่วนที่บอกช่วงเวลาในเลขที่เอกสาร
 * แยกออกมาเพราะทั้งฝั่งเบราว์เซอร์ (แสดงตัวอย่าง) และฝั่งฐานข้อมูล (ออกเลขจริง)
 * ต้องคิดตรงกัน ไม่งั้นตัวอย่างที่เห็นจะไม่ใช่เลขที่ได้
 */
export function runningPeriod(format: RunningFormat, on: Date): string {
  const y = on.getFullYear()
  const m = String(on.getMonth() + 1).padStart(2, '0')
  const d = String(on.getDate()).padStart(2, '0')
  if (format === 'ymd') return `${y}${m}${d}`
  if (format === 'ym') return `${y}${m}`
  if (format === 'year') return String(y)
  return ''
}

/** จำนวนหลักของเลขลำดับ รูปแบบที่รีเซ็ตถี่กว่าใช้หลักน้อยกว่า */
export function runningWidth(format: RunningFormat): number {
  return format === 'ymd' || format === 'ym' ? 4 : 6
}

/** ประกอบเลขที่เอกสารเพื่อแสดงเป็นตัวอย่างในหน้าตั้งค่า */
export function formatDocNo(
  prefix: string,
  format: RunningFormat,
  seq: number,
  on: Date = new Date(),
): string {
  return prefix + runningPeriod(format, on) + String(seq).padStart(runningWidth(format), '0')
}

/* ---------- หน้าตาเอกสาร ---------- */

export type FontSize = 'small' | 'medium' | 'large'

/** ขนาดตัวอักษรจริงที่ใช้พิมพ์ ค่ากลางคือขนาดที่ถอดมาจากใบเสนอราคาเดิม */
export const FONT_SIZE_PT: Record<FontSize, number> = {
  small: 9.5,
  medium: 10.5,
  large: 11.5,
}

export type DesignSettings = {
  paper: 'a4' | 'continuous'
  /** พิมพ์ขาว-ดำ ใช้เมื่อส่งให้ฝ่ายบัญชีที่พิมพ์ด้วยเครื่องขาวดำ */
  mono: boolean
  font_size: FontSize
  /** แสดงคำว่า ต้นฉบับ/สำเนา ใต้ชื่อเอกสาร */
  show_copy_mark: boolean
  /** พื้นหลังสีของแถวหัวตาราง ปิดเพื่อประหยัดหมึก */
  show_table_header_bg: boolean
  show_logo: boolean
  /** ตรายางและลายเซ็นผู้อนุมัติ */
  show_stamp: boolean
}

/* ---------- ชื่อเอกสาร ---------- */

/**
 * ชื่อที่พิมพ์บนหัวเอกสาร เก็บทั้งไทยและอังกฤษเพราะบางใบต้องออกสองภาษา
 * ใบเสนอราคาที่ใช้อยู่พิมพ์ไทยอย่างเดียว จึงปล่อย en ว่างไว้
 */
export type DocTitle = { th: string; en: string }

export const DEFAULT_TITLES: Record<string, DocTitle> = {
  quotation: { th: 'ใบเสนอราคา', en: 'Price Quotation' },
  billing_note: { th: 'ใบวางบิล/ใบแจ้งหนี้', en: 'Billing Note/Invoice' },
  tax_invoice: { th: 'ใบกำกับภาษี/ใบเสร็จรับเงิน', en: 'Tax Invoice/Receipt' },
  cash_invoice: { th: 'ใบกำกับภาษี/ใบเสร็จรับเงิน (เงินสด)', en: 'Tax Invoice/Receipt (Cash)' },
  receipt: { th: 'ใบเสร็จรับเงิน', en: 'Receipt' },
  credit_note: { th: 'ใบลดหนี้', en: 'Credit Note' },
  debit_note: { th: 'ใบเพิ่มหนี้', en: 'Debit Note' },
  purchase_order: { th: 'ใบสั่งซื้อ', en: 'Purchase Order' },
  receiving: { th: 'ใบรับสินค้า', en: 'Receiving' },
}

/* ---------- รวมทั้งหมด ---------- */

export type DocumentSettings = {
  price_mode: PriceMode
  sales: CalcPositions
  purchase: CalcPositions
  /** แสดงรายการปรับลดท้ายใบเสร็จรับเงิน เพื่อให้ได้ยอดที่เรียกเก็บจริง */
  show_receipt_adjustment: boolean
  show_warehouse: boolean
  running_format: RunningFormat
  running: Record<string, { prefix: string; next: number }>
  design: DesignSettings
  titles: Record<string, DocTitle>
  /** พิมพ์ชื่อเอกสารเป็นสองภาษา ไทยบรรทัดบน อังกฤษบรรทัดล่าง */
  bilingual_title: boolean
}

export const DEFAULT_SETTINGS: DocumentSettings = {
  price_mode: 'exclusive',
  sales: { vat: 'document_end', discount: 'document_end', wht: 'document_end' },
  purchase: { vat: 'document_end', discount: 'document_end', wht: 'document_end' },
  show_receipt_adjustment: true,
  show_warehouse: true,
  running_format: 'ym',
  running: Object.fromEntries(DOC_TYPES.map((t) => [t.key, { prefix: t.prefix, next: 1 }])),
  design: {
    paper: 'a4',
    mono: false,
    font_size: 'medium',
    show_copy_mark: true,
    show_table_header_bg: true,
    show_logo: true,
    show_stamp: true,
  },
  titles: DEFAULT_TITLES,
  bilingual_title: false,
}

/**
 * รวมค่าที่อ่านจากฐานข้อมูลกับค่าเริ่มต้น
 *
 * แถวตั้งค่าที่บันทึกไว้ตอนนี้จะขาดคีย์ที่เพิ่มเข้ามาภายหลัง ถ้าอ่านตรง ๆ
 * ค่าที่ขาดจะเป็น undefined แล้วเอกสารจะเรนเดอร์พลาด จึงต้องถมด้วยค่าเริ่มต้น
 * ทีละชั้น ไม่ใช่แค่ชั้นบนสุด
 */
export function mergeSettings(stored: unknown): DocumentSettings {
  const s = (stored || {}) as Partial<DocumentSettings>
  const d = DEFAULT_SETTINGS
  return {
    price_mode: s.price_mode ?? d.price_mode,
    sales: { ...d.sales, ...(s.sales || {}) },
    purchase: { ...d.purchase, ...(s.purchase || {}) },
    show_receipt_adjustment: s.show_receipt_adjustment ?? d.show_receipt_adjustment,
    show_warehouse: s.show_warehouse ?? d.show_warehouse,
    running_format: s.running_format ?? d.running_format,
    running: { ...d.running, ...(s.running || {}) },
    design: { ...d.design, ...(s.design || {}) },
    titles: { ...d.titles, ...(s.titles || {}) },
    bilingual_title: s.bilingual_title ?? d.bilingual_title,
  }
}
