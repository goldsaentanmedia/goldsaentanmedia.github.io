/**
 * ผูกวิธีประกอบเลขที่เอกสารทั้งสามฝั่งไว้กับสตริงชุดเดียวกัน
 *
 * ตรรกะนี้จำเป็นต้องอยู่สามที่ เพราะแต่ละที่ทำงานคนละเวลา
 *   1. settings.ts            — ตัวเรนเดอร์เอกสาร
 *   2. document-settings.html — แสดงตัวอย่างสด ๆ ระหว่างพิมพ์คำนำหน้า
 *   3. migration 0002 (SQL)   — เลขจริงที่ออกให้เอกสาร
 * ถ้าคิดไม่ตรงกัน ตัวอย่างที่ผู้ใช้เห็นจะไม่ใช่เลขที่ได้ ซึ่งเป็นบั๊กที่จับได้ยาก
 * เพราะดูเผิน ๆ ทั้งสองก็ "ดูถูก"
 *
 * รัน: node --experimental-strip-types scripts/check-doc-numbering.mts
 * ฝั่ง SQL ตรวจด้วย scripts/check-doc-numbering.sql
 */

import { formatDocNo } from '../supabase/functions/quote-render-html/settings.ts'
import type { RunningFormat } from '../supabase/functions/quote-render-html/settings.ts'
import { readFileSync } from 'node:fs'

/** วันอ้างอิงเดียวกับที่ใช้ในเทสต์ฝั่ง SQL: 30 ก.ค. 2026 */
const ON = new Date(2026, 6, 30)

/** ค่าที่คาด ถอดมาจากตัวอย่างที่ FlowAccount แสดงในหน้าเลขรันเอกสาร */
const EXPECTED: [RunningFormat, string][] = [
  ['plain', 'INV000001'],
  ['ymd', 'INV202607300001'],
  ['ym', 'INV2026070001'],
  ['year', 'INV2026000001'],
]

let failed = 0
const check = (what: string, got: unknown, want: unknown) => {
  const ok = got === want
  if (!ok) failed++
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${what}${ok ? '' : `\n     ได้ ${got}\n     ต้องเป็น ${want}`}`)
}

console.log('-- settings.ts --')
for (const [fmt, want] of EXPECTED) check(`${fmt} -> ${want}`, formatDocNo('INV', fmt, 1, ON), want)

/*
 * ฝั่งหน้าตั้งค่าเป็น JavaScript ในไฟล์ HTML จึง import ตรง ๆ ไม่ได้
 * ดึงตัวฟังก์ชันออกมาแล้วประเมินด้วย new Function เทียบผลกับชุดเดียวกัน
 * วิธีนี้ตรวจตรรกะจริงที่หน้านั้นใช้ ไม่ใช่สำเนาที่เขียนซ้ำในเทสต์
 */
console.log('-- document-settings.html --')
const page = readFileSync(new URL('../finance/document-settings.html', import.meta.url), 'utf8')
const block = page.slice(page.indexOf('const pad2'), page.indexOf('const FORMATS'))
if (!block.includes('formatDocNo')) {
  failed++
  console.log('FAIL หาโค้ดประกอบเลขที่ในหน้าตั้งค่าไม่เจอ (ย้ายหรือเปลี่ยนชื่อไปแล้ว?)')
} else {
  const pageFormat = new Function(block + '; return formatDocNo')() as typeof formatDocNo
  for (const [fmt, want] of EXPECTED) check(`${fmt} -> ${want}`, pageFormat('INV', fmt, 1, ON), want)
}

console.log(failed ? `\n${failed} รายการไม่ผ่าน` : '\nผ่านทั้งหมด')
process.exit(failed ? 1 : 0)
