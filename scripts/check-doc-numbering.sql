-- ตรวจว่าเลขที่เอกสารฝั่งฐานข้อมูลออกมาตรงกับที่หน้าตั้งค่าแสดงเป็นตัวอย่าง
-- ค่าที่คาดเป็นชุดเดียวกับใน scripts/check-doc-numbering.mts
--
-- รันหลัง apply migration 0001 และ 0002 แล้ว:
--   psql "$DATABASE_URL" -f scripts/check-doc-numbering.sql
--
-- หมายเหตุ: สคริปต์นี้ล้าง doc_sequences และแก้ document_settings
-- ใช้กับฐานข้อมูลทดสอบเท่านั้น ไม่ใช่ของจริง

\set ON_ERROR_STOP on
begin;

do $$
declare
  v_expected text[][] := array[
    array['plain', 'INV000001'],
    array['ymd',   'INV202607300001'],
    array['ym',    'INV2026070001'],
    array['year',  'INV2026000001']
  ];
  v_row  text[];
  v_got  text;
  v_fail int := 0;
begin
  -- ตั้งคำนำหน้าและเลขเริ่มต้นที่เทสต์นี้ใช้ให้ชัด ไม่พึ่งค่าที่ค้างอยู่ในฐานข้อมูล
  -- ไม่งั้นเทสต์จะผ่านหรือไม่ผ่านขึ้นกับว่าใครไปแก้ตั้งค่าไว้ก่อน
  update document_settings set settings = jsonb_set(settings, '{running}', jsonb_build_object(
    'tax_invoice', jsonb_build_object('prefix', 'INV', 'next', 1),
    'quotation',   jsonb_build_object('prefix', 'QT',  'next', 1)
  )) where id = 1;

  foreach v_row slice 1 in array v_expected loop
    update document_settings set settings = jsonb_set(settings, '{running_format}', to_jsonb(v_row[1])) where id = 1;
    delete from doc_sequences;
    select next_doc_no('tax_invoice', date '2026-07-30') into v_got;

    if v_got = v_row[2] then
      raise notice 'ok   % -> %', rpad(v_row[1], 6), v_got;
    else
      v_fail := v_fail + 1;
      raise notice 'FAIL % -> % (ต้องเป็น %)', rpad(v_row[1], 6), v_got, v_row[2];
    end if;
  end loop;

  -- เลขต้องเดินต่อในช่วงเดียวกัน และเริ่มใหม่เมื่อขึ้นช่วงใหม่
  update document_settings set settings = jsonb_set(settings, '{running_format}', '"ym"') where id = 1;
  delete from doc_sequences;
  if next_doc_no('quotation', date '2026-07-01') = 'QT2026070001'
     and next_doc_no('quotation', date '2026-07-31') = 'QT2026070002'
     and next_doc_no('quotation', date '2026-08-01') = 'QT2026080001' then
    raise notice 'ok   เดินต่อในเดือนเดียวกัน และเริ่มใหม่เมื่อขึ้นเดือน';
  else
    v_fail := v_fail + 1;
    raise notice 'FAIL การรีเซ็ตตามเดือนไม่ถูกต้อง';
  end if;

  if v_fail > 0 then
    raise exception '% รายการไม่ผ่าน', v_fail;
  end if;
  raise notice 'ผ่านทั้งหมด';
end $$;

-- ไม่ commit เพื่อไม่ให้ค่าที่ใช้ทดสอบค้างอยู่ในฐานข้อมูล
rollback;
