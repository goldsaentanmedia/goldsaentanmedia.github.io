-- ============================================================================
-- โครงฐานข้อมูลบัญชีหลังบ้าน (ร่างสำหรับตรวจ — ยังไม่ได้ apply ลงโปรเจ็คจริง)
--
-- ทำไมต้องมีชุดนี้: ตาราง finance_documents ที่ใช้อยู่เป็นตารางแบนสำหรับ
-- "นำเข้า" ข้อมูลจาก FlowAccount (ยัดทุกอย่างไว้ใน raw jsonb) ซึ่งพอทำถึง
-- ใบแจ้งหนี้ → ใบเสร็จ → ภ.พ.30 → 50 ทวิ จะไปต่อไม่ได้ เพราะ
--   * ไม่มีรายการบรรทัด (line item) ให้รวมยอดภาษีตามอัตรา
--   * ไม่มีคู่ค้าเป็นตารางของตัวเอง ชื่อลูกค้าซ้ำ ๆ กันแก้ทีเดียวไม่ได้
--   * ไม่มีตัวรัดเลขที่เอกสาร เลขซ้ำได้ถ้ากดพร้อมกันสองเครื่อง
--   * โยงเอกสารต่อกันไม่ได้ (ใบเสนอราคาใบไหนกลายเป็นใบแจ้งหนี้ใบไหน)
--   * ลงบัญชีคู่ไม่ได้ จึงออกงบไม่ได้
--
-- finance_documents ไม่ถูกแตะในไฟล์นี้ ให้ทำหน้าที่เก็บของนำเข้าเดิมต่อไป
-- แล้วค่อยย้ายข้อมูลเข้าโครงใหม่แยกเป็นอีก migration
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- ชนิดข้อมูล

create type doc_kind as enum (
  'quotation',        -- ใบเสนอราคา
  'invoice',          -- ใบแจ้งหนี้
  'tax_invoice',      -- ใบกำกับภาษี
  'receipt',          -- ใบเสร็จรับเงิน
  'credit_note',      -- ใบลดหนี้
  'debit_note',       -- ใบเพิ่มหนี้
  'purchase_order',   -- ใบสั่งซื้อ
  'bill',             -- ใบรับสินค้า/ตั้งหนี้
  'expense'           -- ค่าใช้จ่าย
);

create type doc_status as enum (
  'draft',            -- ร่าง
  'awaiting',         -- รออนุมัติ/รอชำระ
  'partial',          -- แบ่งจ่าย
  'closed',           -- ปิดแล้ว
  'void'              -- ยกเลิก
);

-- ราคาที่กรอกเข้ามารวมภาษีแล้วหรือยัง มีผลกับวิธีถอดฐานภาษี
create type price_mode as enum ('exclusive', 'inclusive');

-- ประเภทภาษีรายบรรทัด ต้องแยก 0% กับ ยกเว้น ออกจากกัน
-- เพราะ ภ.พ.30 รายงานยอดขายสองก้อนนี้ไม่เหมือนกัน
create type vat_kind as enum ('standard', 'zero_rated', 'exempt');

create type account_kind as enum ('asset', 'liability', 'equity', 'revenue', 'expense');

-- ---------------------------------------------------------------- ผังบัญชี

create table accounts (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,          -- 1xxx สินทรัพย์ 2xxx หนี้สิน 3xxx ทุน 4xxx รายได้ 5xxx ค่าใช้จ่าย
  name_th     text not null,
  name_en     text,
  kind        account_kind not null,
  parent_id   uuid references accounts(id),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);
comment on table accounts is 'ผังบัญชี';

-- ---------------------------------------------------------------- คู่ค้า

create table contacts (
  id            uuid primary key default gen_random_uuid(),
  code          text unique,
  name          text not null,
  tax_id        text,
  branch        text default 'สำนักงานใหญ่',
  address       text,
  postcode      text,
  country       text not null default 'ไทย',
  phone         text,
  email         text,
  is_customer   boolean not null default true,
  is_supplier   boolean not null default false,
  credit_days   int not null default 0,
  -- อัตราหัก ณ ที่จ่ายที่ใช้กับคู่ค้ารายนี้เป็นปกติ ช่วยไม่ให้กรอกผิดซ้ำ ๆ
  default_wht_percent numeric(5,2),
  note          text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table contacts is 'ลูกค้าและผู้ขาย';
create index on contacts (name);
create index on contacts (tax_id) where tax_id is not null;

-- ---------------------------------------------------------------- สินค้า/บริการ

create table products (
  id            uuid primary key default gen_random_uuid(),
  code          text unique,
  name          text not null,
  description   text,
  unit          text,
  unit_price    numeric(15,2) not null default 0,
  vat           vat_kind not null default 'standard',
  revenue_account_id uuid references accounts(id),
  expense_account_id uuid references accounts(id),
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table products is 'สินค้าและบริการ';

-- ---------------------------------------------------------------- เลขที่เอกสาร

create table doc_sequences (
  doc_kind    doc_kind not null,
  prefix      text not null,                 -- เช่น 'QT'
  period      text not null,                 -- 'YYYYMM' หรือ 'YYYY' ตามรูปแบบที่ใช้
  last_no     int  not null default 0,
  primary key (doc_kind, period)
);
comment on table doc_sequences is 'ตัวรัดเลขที่เอกสาร กันเลขซ้ำเมื่อออกเอกสารพร้อมกัน';

-- ออกเลขถัดไปแบบล็อกแถว สองคนกดพร้อมกันจะได้เลขต่างกันแน่นอน
create or replace function next_doc_no(p_kind doc_kind, p_prefix text, p_date date default current_date)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_period text := to_char(p_date, 'YYYYMM');
  v_no     int;
begin
  insert into doc_sequences (doc_kind, prefix, period, last_no)
  values (p_kind, p_prefix, v_period, 1)
  on conflict (doc_kind, period)
    do update set last_no = doc_sequences.last_no + 1
  returning last_no into v_no;

  return p_prefix || v_period || lpad(v_no::text, 4, '0');
end;
$$;

-- ---------------------------------------------------------------- เอกสาร

create table documents (
  id            uuid primary key default gen_random_uuid(),
  kind          doc_kind not null,
  doc_no        text not null,
  status        doc_status not null default 'draft',

  contact_id    uuid references contacts(id),
  -- เก็บชื่อ/ที่อยู่/เลขภาษี ณ วันออกเอกสารซ้ำไว้ที่นี่ด้วย
  -- เอกสารที่ออกไปแล้วต้องไม่เปลี่ยนตามข้อมูลคู่ค้าที่ถูกแก้ภายหลัง
  contact_name  text not null,
  contact_tax_id text,
  contact_branch text,
  contact_address text,

  issue_date    date not null default current_date,
  due_date      date,
  credit_days   int not null default 0,
  valid_until   date,                        -- ใบเสนอราคามีอายุกี่วัน

  currency      char(3) not null default 'THB',
  fx_rate       numeric(15,6) not null default 1,
  price_mode    price_mode not null default 'exclusive',

  seller        text,
  reference_no  text,
  project       text,
  warehouse     text,
  note          text,

  -- ยอดสรุป เก็บผลลัพธ์ไว้เพื่อค้นและออกรายงานเร็ว
  -- ค่าจริงคำนวณจาก document_lines เสมอ (ดู recalc_document_totals)
  subtotal      numeric(15,2) not null default 0,
  discount_percent numeric(5,2) not null default 0,
  discount_amount  numeric(15,2) not null default 0,
  vat_amount    numeric(15,2) not null default 0,
  total         numeric(15,2) not null default 0,
  wht_percent   numeric(5,2) not null default 0,
  wht_amount    numeric(15,2) not null default 0,
  net_payable   numeric(15,2) not null default 0,
  paid_amount   numeric(15,2) not null default 0,

  notes         text[],                      -- หมายเหตุท้ายเอกสาร
  payment_terms text[],                      -- เงื่อนไขการชำระ

  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint documents_doc_no_unique unique (kind, doc_no)
);
comment on table documents is 'ส่วนหัวเอกสารทุกประเภท';
create index on documents (kind, issue_date desc);
create index on documents (contact_id);
create index on documents (status) where status <> 'closed';

create table document_lines (
  id            uuid primary key default gen_random_uuid(),
  document_id   uuid not null references documents(id) on delete cascade,
  line_no       int not null,
  product_id    uuid references products(id),
  description   text not null default '',     -- หลายบรรทัดได้ ขึ้นบรรทัดใหม่ด้วย \n
  qty           numeric(15,4) not null default 1,
  unit          text,
  unit_price    numeric(15,2) not null default 0,
  discount_percent numeric(5,2) not null default 0,
  vat           vat_kind not null default 'standard',
  vat_percent   numeric(5,2) not null default 7,
  amount        numeric(15,2) not null default 0,   -- qty * unit_price หลังหักส่วนลดบรรทัด
  account_id    uuid references accounts(id),
  unique (document_id, line_no)
);
comment on table document_lines is 'รายการในเอกสาร';
create index on document_lines (document_id);

-- โยงสายเอกสาร: ใบเสนอราคา -> ใบแจ้งหนี้ -> ใบเสร็จ
-- แยกเป็นตารางเพราะหนึ่งใบแจ้งหนี้อาจมาจากหลายใบเสนอราคา และกลับกัน
create table document_links (
  from_id   uuid not null references documents(id) on delete cascade,
  to_id     uuid not null references documents(id) on delete cascade,
  primary key (from_id, to_id),
  constraint document_links_no_self check (from_id <> to_id)
);
comment on table document_links is 'ความสัมพันธ์ระหว่างเอกสาร';

-- ---------------------------------------------------------------- การรับ/จ่ายเงิน

create table payments (
  id            uuid primary key default gen_random_uuid(),
  direction     text not null check (direction in ('in', 'out')),
  contact_id    uuid references contacts(id),
  paid_on       date not null default current_date,
  method        text,                        -- โอน / เงินสด / เช็ค
  amount        numeric(15,2) not null,
  wht_amount    numeric(15,2) not null default 0,
  fee_amount    numeric(15,2) not null default 0,
  account_id    uuid references accounts(id),  -- บัญชีเงินฝากที่เงินเข้า/ออก
  note          text,
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now()
);
comment on table payments is 'รายการรับและจ่ายเงิน';

-- ตัดชำระได้ทีละหลายใบ และหนึ่งใบถูกตัดหลายครั้ง จึงต้องเป็นตารางกลาง
create table payment_allocations (
  payment_id    uuid not null references payments(id) on delete cascade,
  document_id   uuid not null references documents(id) on delete cascade,
  amount        numeric(15,2) not null check (amount > 0),
  primary key (payment_id, document_id)
);
comment on table payment_allocations is 'จับคู่เงินที่รับ/จ่าย กับเอกสาร';

-- ---------------------------------------------------------------- บัญชีคู่

create table journal_entries (
  id            uuid primary key default gen_random_uuid(),
  entry_date    date not null default current_date,
  memo          text,
  document_id   uuid references documents(id) on delete set null,
  payment_id    uuid references payments(id) on delete set null,
  posted_at     timestamptz,                 -- ว่าง = ยังเป็นร่าง แก้ได้
  created_by    uuid references auth.users(id),
  created_at    timestamptz not null default now()
);
comment on table journal_entries is 'สมุดรายวัน';
create index on journal_entries (entry_date);

create table journal_lines (
  id            uuid primary key default gen_random_uuid(),
  entry_id      uuid not null references journal_entries(id) on delete cascade,
  account_id    uuid not null references accounts(id),
  debit         numeric(15,2) not null default 0,
  credit        numeric(15,2) not null default 0,
  memo          text,
  -- กันบรรทัดที่ลงทั้งเดบิตและเครดิต หรือไม่ลงอะไรเลย
  constraint journal_lines_one_side check (
    (debit > 0 and credit = 0) or (credit > 0 and debit = 0)
  )
);
create index on journal_lines (entry_id);
create index on journal_lines (account_id);

-- เดบิตต้องเท่าเครดิตก่อนโพสต์ ตรวจตอนโพสต์ ไม่ใช่ตอนแทรกแต่ละบรรทัด
create or replace function assert_entry_balanced(p_entry_id uuid)
returns void
language plpgsql
as $$
declare
  v_diff numeric(15,2);
begin
  select coalesce(sum(debit), 0) - coalesce(sum(credit), 0)
    into v_diff
  from journal_lines where entry_id = p_entry_id;

  if v_diff <> 0 then
    raise exception 'สมุดรายวัน % ไม่ดุล เดบิตต่างจากเครดิต %', p_entry_id, v_diff;
  end if;
end;
$$;

-- ---------------------------------------------------------------- รวมยอด

-- คำนวณยอดสรุปของเอกสารจากรายการบรรทัด ให้เป็นแหล่งความจริงเดียว
-- ราคารวมภาษี: ยอดบรรทัดมี VAT อยู่แล้ว ต้องถอดฐานภาษีออกมา
--              เพราะเอกสารพิมพ์ "รวมเป็นเงิน" เป็นยอดก่อนภาษีเสมอ
-- หัก ณ ที่จ่าย: คิดบนฐานหลังหักส่วนลด ไม่รวม VAT
create or replace function recalc_document_totals(p_document_id uuid)
returns void
language plpgsql
as $$
declare
  d              documents;
  v_gross        numeric(15,2);
  v_vat_percent  numeric(5,2);
  v_subtotal     numeric(15,2);
  v_after        numeric(15,2);
  v_discount     numeric(15,2);
  v_vat          numeric(15,2);
  v_total        numeric(15,2);
  v_gross_after  numeric(15,2);
begin
  select * into d from documents where id = p_document_id;
  if not found then return; end if;

  select coalesce(sum(amount), 0),
         coalesce(max(case when vat = 'standard' then vat_percent else 0 end), 0)
    into v_gross, v_vat_percent
  from document_lines where document_id = p_document_id;

  if d.price_mode = 'inclusive' then
    v_subtotal    := round(v_gross / (1 + v_vat_percent / 100), 2);
    v_gross_after := round(v_gross - v_gross * d.discount_percent / 100, 2);
    v_after       := round(v_gross_after / (1 + v_vat_percent / 100), 2);
    v_discount    := v_subtotal - v_after;
    v_vat         := v_gross_after - v_after;
    v_total       := v_gross_after;
  else
    v_subtotal := v_gross;
    v_discount := round(v_subtotal * d.discount_percent / 100, 2);
    v_after    := v_subtotal - v_discount;
    v_vat      := round(v_after * v_vat_percent / 100, 2);
    v_total    := v_after + v_vat;
  end if;

  update documents set
    subtotal        = v_subtotal,
    discount_amount = v_discount,
    vat_amount      = v_vat,
    total           = v_total,
    wht_amount      = round(v_after * wht_percent / 100, 2),
    net_payable     = v_total - round(v_after * wht_percent / 100, 2),
    updated_at      = now()
  where id = p_document_id;
end;
$$;

create or replace function document_lines_recalc()
returns trigger language plpgsql as $$
begin
  perform recalc_document_totals(coalesce(new.document_id, old.document_id));
  return null;
end;
$$;

create trigger document_lines_recalc_after
  after insert or update or delete on document_lines
  for each row execute function document_lines_recalc();

-- ---------------------------------------------------------------- updated_at

create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end;
$$;

create trigger contacts_touch  before update on contacts  for each row execute function touch_updated_at();
create trigger products_touch  before update on products  for each row execute function touch_updated_at();
create trigger documents_touch before update on documents for each row execute function touch_updated_at();

-- ---------------------------------------------------------------- สิทธิ์
--
-- RLS คุมว่าเข้าถึง "แถวไหน" ได้ แต่ต้องมี GRANT ระดับตารางก่อนถึงจะแตะ
-- ตารางได้เลย มี policy อย่างเดียวไม่พอ — เป็นบั๊กที่เคยทำให้ finance_documents
-- อ่านและเขียนไม่ได้ทั้งที่ policy ครบ

do $$
declare t text;
begin
  foreach t in array array[
    'accounts','contacts','products','doc_sequences','documents','document_lines',
    'document_links','payments','payment_allocations','journal_entries','journal_lines'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    execute format('grant select, insert, update, delete on %I to authenticated', t);
    execute format('grant all on %I to service_role', t);
    -- ทุกคนที่ล็อกอินคือพนักงานบริษัทเดียว จึงเห็นได้ทั้งหมด
    -- ถ้าวันหน้าต้องแยกสิทธิ์ตามบทบาท ให้มาเปลี่ยน policy ชุดนี้
    execute format(
      'create policy %I on %I for all to authenticated using (true) with check (true)',
      t || '_authenticated_all', t
    );
  end loop;
end;
$$;

grant execute on function next_doc_no(doc_kind, text, date) to authenticated;
grant execute on function recalc_document_totals(uuid) to authenticated;

-- ---------------------------------------------------------------- ผังบัญชีเริ่มต้น

insert into accounts (code, name_th, kind) values
  ('1010', 'เงินสด',                        'asset'),
  ('1020', 'เงินฝากธนาคาร',                  'asset'),
  ('1130', 'ลูกหนี้การค้า',                   'asset'),
  ('1180', 'ภาษีซื้อ',                       'asset'),
  ('1190', 'ภาษีถูกหัก ณ ที่จ่าย',            'asset'),
  ('2010', 'เจ้าหนี้การค้า',                  'liability'),
  ('2130', 'ภาษีขาย',                        'liability'),
  ('2140', 'ภาษีหัก ณ ที่จ่ายค้างจ่าย',        'liability'),
  ('3010', 'ทุนจดทะเบียน',                    'equity'),
  ('3200', 'กำไรสะสม',                       'equity'),
  ('4010', 'รายได้ค่าโฆษณา',                  'revenue'),
  ('4090', 'รายได้อื่น',                      'revenue'),
  ('5010', 'ต้นทุนการให้บริการ',               'expense'),
  ('5200', 'ค่าใช้จ่ายในการขายและบริหาร',       'expense'),
  ('5900', 'ค่าธรรมเนียมธนาคาร',              'expense')
on conflict (code) do nothing;
