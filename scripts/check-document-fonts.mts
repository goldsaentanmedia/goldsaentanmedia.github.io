/**
 * ตรวจเส้นทางฝังฟอนต์ลงเอกสาร
 *
 * ไฟล์ฟอนต์ไม่ได้อยู่ในรีโป (ตั้งใจ — รีโปนี้เป็น public) เทสต์นี้จึงต้องชี้ไปที่
 * โฟลเดอร์ที่มีไฟล์ .woff2 อยู่ ผ่านตัวแปรสภาพแวดล้อม CS_CHATTHAI_DIR
 * ถ้าไม่ได้ตั้งไว้จะข้ามส่วนที่ต้องใช้ไฟล์จริง แล้วตรวจเฉพาะทางถอยกลับ
 *
 * รัน: CS_CHATTHAI_DIR=/path/to/woff2 node --experimental-strip-types scripts/check-document-fonts.mts
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { clearFontCache, documentFontCss } from '../supabase/functions/quote-render-html/fonts.ts'
import type { StorageLike } from '../supabase/functions/quote-render-html/fonts.ts'
import { renderQuotationHtml } from '../supabase/functions/quote-render-html/template.ts'

let failed = 0
const check = (what: string, ok: boolean, detail = '') => {
  if (!ok) failed++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${ok || !detail ? '' : `\n     ${detail}`}`)
}

/**
 * Storage ปลอม อ่านจากดิสก์แทน
 * missing = รายชื่อไฟล์ที่ให้แกล้งหาไม่เจอ ใช้ทดสอบทางที่โหลดไม่สำเร็จ
 * calls   = นับจำนวนครั้งที่ถูกเรียก ใช้ยืนยันว่าแคชทำงาน
 */
function fakeStorage(dir: string, missing: string[] = []) {
  const calls: string[] = []
  const client: StorageLike = {
    storage: {
      from: () => ({
        download: async (path: string) => {
          calls.push(path)
          const file = path.split('/').pop()!
          if (missing.includes(file)) return { data: null, error: new Error('not found') }
          const full = join(dir, file)
          if (!existsSync(full)) return { data: null, error: new Error('not on disk') }
          return { data: new Blob([readFileSync(full)]), error: null }
        },
      }),
    },
  }
  return { client, calls }
}

const doc: any = {
  doc_no: 'QT2026070002', issue_date: '2026-07-23', seller: 'นายพสิษฐ์ ศิริทองแสนตัน',
  customer_name: 'บริษัท เซเว่น เบอร์รี่ จำกัด', customer_address: '28 ซอยรมณีย์ จังหวัดภูเก็ต 83000',
  customer_tax_id: '0835566039611',
  items: [{ description: 'ค่าบริการสื่อโฆษณา', qty: 12, unit: 'เดือน', unit_price: 22000, amount: 264000 }],
  subtotal: 264000, discount_percent: 30, discount_amount: 79200,
  vat_percent: 7, vat: 12936, total: 197736,
  wht_percent: 2, wht_amount: 3696, net_payable: 194040,
  notes: [], payment_terms: [],
}

const GOOGLE = 'fonts.googleapis.com'

/* ---------- ทางที่โหลดไม่ได้ ต้องยังออกเอกสารได้ ---------- */

console.log('-- Storage ใช้ไม่ได้ --')
clearFontCache()
const broken: StorageLike = {
  storage: { from: () => ({ download: async () => ({ data: null, error: new Error('ล่ม') }) }) },
}
const emptyCss = await documentFontCss(broken)
check('โหลดไม่ได้ คืนสตริงว่าง', emptyCss === '', `ได้ ${emptyCss.length} ตัวอักษร`)

const fallbackDoc = renderQuotationHtml(doc, { fontCss: emptyCss })
check('เอกสารยังเรนเดอร์ได้', fallbackDoc.includes('ใบเสนอราคา'))
check('ดึงฟอนต์สำรองจาก Google Fonts', fallbackDoc.includes(GOOGLE))
check('ไม่มี @font-face ค้าง', !fallbackDoc.includes('@font-face'))

/* ---------- ทางปกติ ต้องมีไฟล์ฟอนต์จริง ---------- */

const dir = process.env.CS_CHATTHAI_DIR
if (!dir || !existsSync(dir)) {
  console.log('\nข้าม: ไม่ได้ตั้ง CS_CHATTHAI_DIR ให้ชี้ไปโฟลเดอร์ไฟล์ .woff2')
  console.log(failed ? `\n${failed} รายการไม่ผ่าน` : '\nผ่านเท่าที่ตรวจได้')
  process.exit(failed ? 1 : 0)
}

console.log('\n-- โหลดฟอนต์ครบทั้งสามน้ำหนัก --')
clearFontCache()
const ok1 = fakeStorage(dir)
const css = await documentFontCss(ok1.client)
const faceCount = (css.match(/@font-face/g) || []).length
check('ได้ @font-face สามชุด', faceCount === 3, `ได้ ${faceCount}`)
check('ครบทั้งน้ำหนัก 300/400/700',
  ['300', '400', '700'].every((w) => css.includes(`font-weight: ${w}`)))
check('ฝังเป็น data URI ไม่ใช่ลิงก์', css.includes('data:font/woff2;base64,') && !css.includes('http'))
check('ขอไฟล์จากโฟลเดอร์ fonts/', ok1.calls.every((p) => p.startsWith('fonts/')), ok1.calls.join(', '))

console.log('\n-- แคช --')
const before = ok1.calls.length
await documentFontCss(ok1.client)
check('เรียกครั้งที่สองไม่โหลดซ้ำ', ok1.calls.length === before,
  `โหลดเพิ่ม ${ok1.calls.length - before} ไฟล์`)

console.log('\n-- ขาดบางน้ำหนัก --')
clearFontCache()
const partial = fakeStorage(dir, ['CSChatThaiUIBold.woff2'])
const partialCss = await documentFontCss(partial.client)
const partialCount = (partialCss.match(/@font-face/g) || []).length
check('ที่โหลดได้ยังถูกฝัง', partialCount === 2, `ได้ ${partialCount}`)
check('ไม่มีน้ำหนัก 700', !partialCss.includes('font-weight: 700'))

console.log('\n-- เอกสารที่ฝังฟอนต์แล้ว --')
const embedded = renderQuotationHtml(doc, { fontCss: css })
check('เอกสารมี @font-face', embedded.includes('@font-face'))
check('ไม่ดึง Google Fonts เปล่า ๆ', !embedded.includes(GOOGLE))
check('font-family ตั้ง CS ChatThai ไว้ก่อน',
  /font-family:\s*'CS ChatThai'/.test(embedded))

const outDir = process.env.FONT_CHECK_OUT
if (outDir) {
  const { writeFileSync } = await import('node:fs')
  writeFileSync(join(outDir, 'doc-embedded.html'), embedded)
  console.log(`\nเขียนเอกสารตัวอย่างไว้ที่ ${join(outDir, 'doc-embedded.html')}`)
}

console.log(failed ? `\n${failed} รายการไม่ผ่าน` : '\nผ่านทั้งหมด')
process.exit(failed ? 1 : 0)
