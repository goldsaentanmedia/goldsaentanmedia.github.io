import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { DEFAULT_NOTES, QuoteData, QuoteItem, renderQuotationHtml } from './template.ts'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

const html = (body: string, status = 200) =>
  new Response(body, { status, headers: { ...CORS, 'Content-Type': 'text/html; charset=utf-8' } })

/** ตัวอย่างข้อมูลสำหรับ ?preview=1 ใช้ตรวจเลย์เอาต์โดยไม่ต้องมีใบเสนอราคาจริงในฐานข้อมูล */
const SAMPLE: QuoteData = {
  doc_no: 'QT2026050029',
  issue_date: '2026-07-28',
  credit_days: 0,
  issued_by: 'พสิษฐ์ ศิริทองแสนตัน',
  customer_name: 'บริษัท ตัวอย่าง จำกัด (สำนักงานใหญ่)',
  customer_address: '75/32-33 หมู่ 6 ตำบลรัษฎา อำเภอเมือง จังหวัดภูเก็ต 83000',
  customer_tax_id: '0835568007571',
  items: [
    {
      description:
        'Client: Odyssey\nMedia ID: GST-HKT101\nPackage: Business Package\nPlan: Monthly (1 Month)\nDuration: 2 Mins/Hours\nCampaign Period: (09/07/2026 – 08/08/2026)',
      qty: 1,
      unit: 'เดือน',
      unit_price: 55000,
      amount: 55000,
    },
  ],
  subtotal: 55000,
  discount_percent: 20,
  discount_amount: 11000,
  vat_percent: 7,
  vat: 3080,
  total: 47080,
  wht_percent: 2,
  wht_amount: 880,
  net_payable: 46200,
  notes: DEFAULT_NOTES,
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
    let id = url.searchParams.get('id') || ''
    if (!id && req.method === 'POST') {
      const body = await req.json().catch(() => ({}))
      id = String(body.id || '')
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

    const raw = (q.raw || {}) as Record<string, unknown>
    const subtotal = Number(q.subtotal) || 0
    const discountAmount = Number(raw.discount_amount) || 0

    const data: QuoteData = {
      doc_no: String(q.doc_no || ''),
      issue_date: String(q.issue_date || ''),
      credit_days: Number(raw.credit_days) || 0,
      issued_by: String(raw.issued_by || ''),
      customer_name: String(q.customer_name || ''),
      customer_address: String(raw.customer_address || ''),
      customer_tax_id: String(raw.customer_tax_id || ''),
      items: (raw.items as QuoteItem[]) || [],
      subtotal,
      discount_percent: Number(raw.discount_percent) || 0,
      discount_amount: discountAmount,
      vat_percent: Number(raw.vat_percent) || 0,
      vat: Number(q.vat) || 0,
      total: Number(q.total) || 0,
      wht_percent: Number(raw.wht_percent) || 0,
      wht_amount: Number(raw.wht_amount) || 0,
      net_payable: Number(raw.net_payable) || 0,
      notes: Array.isArray(raw.notes)
        ? (raw.notes as string[])
        : raw.notes
          ? String(raw.notes).split('\n')
          : DEFAULT_NOTES,
    }

    return html(renderQuotationHtml(data, { autoPrint }))
  } catch (e) {
    return html('<p>error: ' + String(e) + '</p>', 500)
  }
})
