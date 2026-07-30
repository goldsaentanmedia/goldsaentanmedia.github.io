-- ============================================================================
-- ตั้งค่าเอกสาร (ร่างสำหรับตรวจ — ยังไม่ได้ apply ลงโปรเจ็คจริง)
--
-- เก็บเป็น jsonb แถวเดียว ไม่แตกเป็นคอลัมน์ เพราะตั้งค่าพวกนี้จะงอกเพิ่มเรื่อย ๆ
-- ตามฟีเจอร์ที่ทำ ถ้าแตกเป็นคอลัมน์จะต้องมี migration ทุกครั้งที่เพิ่มสวิตช์
-- ตัวเดียว รูปร่างข้างในนิยามไว้ที่ supabase/functions/quote-render-html/settings.ts
-- และถมค่าที่ขาดด้วย mergeSettings() ฝั่งโค้ด จึงเพิ่มคีย์ใหม่ได้โดยไม่ต้องแก้
-- แถวที่บันทึกไว้แล้ว
--
-- ไฟล์นี้ทับตัวออกเลขที่เอกสารจาก 0001 ด้วย เพราะเลขที่เอกสารต้องอ่านรูปแบบ
-- (รีเซ็ตรายวัน/รายเดือน/รายปี) กับคำนำหน้า จากตั้งค่า ไม่ใช่รับมาเป็น
-- อาร์กิวเมนต์จากผู้เรียก ถ้ารับมาจากผู้เรียก แต่ละหน้าที่ออกเอกสารจะต้อง
-- จำเองว่าใบไหนใช้คำนำหน้าอะไร แล้ววันหนึ่งจะไม่ตรงกัน
-- ============================================================================

create table document_settings (
  -- ล็อกให้มีได้แถวเดียว ตั้งค่าชุดนี้เป็นของบริษัท ไม่ใช่ของผู้ใช้แต่ละคน
  id          int primary key default 1 check (id = 1),
  settings    jsonb not null default '{}'::jsonb,
  updated_by  uuid references auth.users(id),
  updated_at  timestamptz not null default now()
);
comment on table document_settings is 'ตั้งค่าเอกสารของบริษัท มีแถวเดียว';

-- Seed เฉพาะส่วนที่ฝั่งฐานข้อมูลต้องใช้เอง คือรูปแบบเลขรันกับคำนำหน้าแต่ละเอกสาร
-- ที่เหลือ (หน้าตาเอกสาร ชื่อเอกสาร) ฝั่งโค้ดมีค่าเริ่มต้นของตัวเองอยู่แล้ว
-- จึงไม่ต้องเขียนซ้ำไว้ที่นี่ให้มีสองแหล่งที่ต้องตามแก้
insert into document_settings (id, settings) values (1, jsonb_build_object(
  'running_format', 'ym',
  'running', jsonb_build_object(
    'quotation',      jsonb_build_object('prefix', 'QT',  'next', 1),
    'billing_note',   jsonb_build_object('prefix', 'BL',  'next', 1),
    'tax_invoice',    jsonb_build_object('prefix', 'INV', 'next', 1),
    'cash_invoice',   jsonb_build_object('prefix', 'CA',  'next', 1),
    'receipt',        jsonb_build_object('prefix', 'RE',  'next', 1),
    'credit_note',    jsonb_build_object('prefix', 'CN',  'next', 1),
    'debit_note',     jsonb_build_object('prefix', 'DN',  'next', 1),
    'purchase_order', jsonb_build_object('prefix', 'PO',  'next', 1),
    'receiving',      jsonb_build_object('prefix', 'RI',  'next', 1)
  )
))
on conflict (id) do nothing;

create trigger document_settings_touch
  before update on document_settings
  for each row execute function touch_updated_at();

-- ---------------------------------------------------------------- เลขที่เอกสาร

-- ของเดิมผูกกับ doc_kind และรับคำนำหน้ามาจากผู้เรียก ทิ้งไปทั้งคู่
drop function if exists next_doc_no(doc_kind, text, date);
drop table if exists doc_sequences;

create table doc_sequences (
  -- คีย์เป็นข้อความ ตรงกับคีย์ใน settings->'running' (quotation, billing_note, ...)
  -- ไม่ใช้ doc_kind เพราะชุดเลขรันกับประเภทเอกสารไม่ได้ตรงกันหนึ่งต่อหนึ่ง
  -- (ใบกำกับภาษีกับใบเสร็จใช้ชุดเดียวกัน ส่วนขายเงินสดแยกชุด)
  doc_type    text not null,
  period      text not null,   -- '' | 'YYYY' | 'YYYYMM' | 'YYYYMMDD' ตามรูปแบบที่ตั้ง
  last_no     int  not null,
  primary key (doc_type, period)
);
comment on table doc_sequences is 'ตัวรัดเลขที่เอกสาร กันเลขซ้ำเมื่อออกเอกสารพร้อมกัน';

/*
 * ส่วนบอกช่วงเวลาในเลขที่เอกสาร ต้องให้ผลตรงกับ runningPeriod() ใน settings.ts
 * เพราะตัวอย่างที่ผู้ใช้เห็นในหน้าตั้งค่าคำนวณจากฝั่งเบราว์เซอร์
 * แต่เลขจริงออกจากที่นี่ ถ้าคิดไม่ตรงกัน ตัวอย่างจะหลอกตา
 */
create or replace function running_period(p_format text, p_date date)
returns text
language sql
immutable
as $$
  select case p_format
    when 'ymd'  then to_char(p_date, 'YYYYMMDD')
    when 'ym'   then to_char(p_date, 'YYYYMM')
    when 'year' then to_char(p_date, 'YYYY')
    else ''
  end;
$$;

/** จำนวนหลักของเลขลำดับ รูปแบบที่รีเซ็ตถี่กว่าใช้หลักน้อยกว่า */
create or replace function running_width(p_format text)
returns int
language sql
immutable
as $$
  select case when p_format in ('ymd', 'ym') then 4 else 6 end;
$$;

/*
 * ออกเลขที่เอกสารถัดไป
 *
 * on conflict ... do update คือจุดที่กันเลขซ้ำ แถวถูกล็อกตอนอัปเดต
 * สองคนกดออกเอกสารพร้อมกันจะเข้าคิวกันเอง ไม่ต้องล็อกตารางทั้งใบ
 * ครั้งแรกของแต่ละช่วงเวลาเริ่มจากเลขที่ตั้งไว้ใน settings ครั้งต่อไปบวกหนึ่ง
 */
create or replace function next_doc_no(p_doc_type text, p_date date default current_date)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cfg    jsonb;
  v_format text;
  v_prefix text;
  v_start  int;
  v_period text;
  v_no     int;
begin
  select settings into v_cfg from document_settings where id = 1;
  v_cfg := coalesce(v_cfg, '{}'::jsonb);

  v_format := coalesce(v_cfg->>'running_format', 'ym');
  v_prefix := coalesce(v_cfg->'running'->p_doc_type->>'prefix', upper(left(p_doc_type, 2)));
  v_start  := coalesce((v_cfg->'running'->p_doc_type->>'next')::int, 1);
  v_period := running_period(v_format, p_date);

  insert into doc_sequences (doc_type, period, last_no)
  values (p_doc_type, v_period, v_start)
  on conflict (doc_type, period)
    do update set last_no = doc_sequences.last_no + 1
  returning last_no into v_no;

  return v_prefix || v_period || lpad(v_no::text, running_width(v_format), '0');
end;
$$;

-- ---------------------------------------------------------------- สิทธิ์
--
-- GRANT ต้องมาคู่กับ RLS เสมอ policy อย่างเดียวไม่พอ
-- (เป็นบั๊กที่เคยทำให้ finance_documents อ่านและเขียนไม่ได้ทั้งที่ policy ครบ)

alter table document_settings enable row level security;
alter table doc_sequences     enable row level security;

grant select, insert, update on document_settings to authenticated;
grant all on document_settings to service_role;
grant select, insert, update, delete on doc_sequences to authenticated;
grant all on doc_sequences to service_role;

-- ทุกคนที่ล็อกอินอ่านตั้งค่าได้ เพราะหน้าออกเอกสารต้องใช้
create policy document_settings_read on document_settings
  for select to authenticated using (true);

-- แก้ตั้งค่าได้เฉพาะแถวเดียวที่มี ไม่เปิดให้ insert แถวอื่น
create policy document_settings_write on document_settings
  for update to authenticated using (id = 1) with check (id = 1);

create policy doc_sequences_all on doc_sequences
  for all to authenticated using (true) with check (true);

grant execute on function next_doc_no(text, date)      to authenticated;
grant execute on function running_period(text, date)   to authenticated;
grant execute on function running_width(text)          to authenticated;
