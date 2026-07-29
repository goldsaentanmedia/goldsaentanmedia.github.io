import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import {
  DEFAULT_NOTES,
  DEFAULT_PAYMENT_TERMS,
  QuoteData,
  QuoteItem,
  renderQuotationHtml,
} from './template.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

const html = (body: string, status = 200) =>
  new Response(body, { status, headers: { ...CORS, 'Content-Type': 'text/html; charset=utf-8' } })

/** ตัวอย่างข้อมูลสำหรับ ?preview=1 ใช้ตรวจเลย์เอาต์โดยไม่ต้องมีใบเสนอราคาจริงในฐานข้อมูล */
const SAMPLE: QuoteData = {
  doc_no: 'QT2026070002',
  issue_date: '2026-07-23',
  seller: 'นายพสิษฐ์ ศิริทองแสนตัน',
  customer_name: 'บริษัท เซเว่น เบอร์รี่ จำกัด',
  customer_address: '28 ซอยรมณีย์ ตำบลตลาดใหญ่ อำเภอเมืองภูเก็ต จังหวัดภูเก็ต 83000',
  customer_tax_id: '0835566039611',
  items: [
    {
      description:
        'Advertising Media (DOOH)/Semi Package - Annual/15Sec\nMedia ID: GST-HKT101\nPackage: Semi Package\nPlan: Quarterly (12 Month)\nDuration: 15 Sec/Spot\nCampaign Period: (01/08/2026 – 31/07/2027)',
      qty: 12,
      unit: 'เดือน',
      unit_price: 22000,
      amount: 264000,
    },
  ],
  subtotal: 264000,
  discount_percent: 30,
  discount_amount: 79200,
  vat_percent: 7,
  vat: 12936,
  total: 197736,
  wht_percent: 2,
  wht_amount: 3696,
  net_payable: 194040,
  notes: DEFAULT_NOTES,
  payment_terms: DEFAULT_PAYMENT_TERMS,
}

const asLines = (v: unknown, fallback: string[]): string[] => {
  if (Array.isArray(v)) return v as string[]
  if (typeof v === 'string' && v.trim()) return v.split('\n')
  return fallback
}

/**
 * ปรับก้อนข้อมูลดิบให้เป็น QuoteData
 * ใช้ได้ทั้งแถวจาก finance_documents (ที่ค่าส่วนหนึ่งอยู่ในคอลัมน์ อีกส่วนอยู่ใน raw)
 * และก้อน JSON ที่ส่งตรงมาจากหน้าฟอร์ม
 */
function toQuoteData(src: Record<string, unknown>): QuoteData {
  const raw = (src.raw || src) as Record<string, unknown>
  const pick = (k: string) => (src[k] !== undefined ? src[k] : raw[k])

  return {
    doc_no: String(pick('doc_no') || ''),
    issue_date: String(pick('issue_date') || ''),
    seller: String(raw.seller || raw.issued_by || ''),
    customer_name: String(pick('customer_name') || ''),
    customer_address: String(raw.customer_address || ''),
    customer_tax_id: String(raw.customer_tax_id || ''),
    items: (raw.items as QuoteItem[]) || [],
    subtotal: Number(pick('subtotal')) || 0,
    discount_percent: Number(raw.discount_percent) || 0,
    discount_amount: Number(raw.discount_amount) || 0,
    vat_percent: Number(raw.vat_percent) || 0,
    vat: Number(pick('vat')) || 0,
    total: Number(pick('total')) || 0,
    wht_percent: Number(raw.wht_percent) || 0,
    wht_amount: Number(raw.wht_amount) || 0,
    net_payable: Number(raw.net_payable) || 0,
    notes: asLines(raw.notes, DEFAULT_NOTES),
    payment_terms: asLines(raw.payment_terms, DEFAULT_PAYMENT_TERMS),
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const url = new URL(req.url)
    const autoPrint = url.searchParams.get('print') === '1'

    if (url.searchParams.get('preview') === '1') {
      return html(renderQuotationHtml(SAMPLE, { autoPrint }))
    }

    // รับ id ได้ทั้งจาก query string (เปิดในแท็บใหม่) และ JSON body (fetch)
    // ถ้าส่ง data มาเต็มก้อน จะเรนเดอร์จากก้อนนั้นเลย ใช้ตอนกดดูตัวอย่างจากหน้าฟอร์ม
    // ที่ยังไม่ได้บันทึกลงฐานข้อมูล
    let id = url.searchParams.get('id') || ''
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}))
      if (body.data) return html(renderQuotationHtml(toQuoteData(body.data), { autoPrint }))
      if (!id) id = String(body.id || '')
    }
    if (!id) return html('<p>missing id</p>', 400)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { data: q, error } = await supabase
      .from('finance_documents')
      .select('*')
      .eq('id', id)
      .single()
    if (error || !q) return html('<p>quote not found</p>', 404)

    return html(renderQuotationHtml(toQuoteData(q), { autoPrint }))
  } catch (e) {
    return html('<p>error: ' + String(e) + '</p>', 500)
  }
})
