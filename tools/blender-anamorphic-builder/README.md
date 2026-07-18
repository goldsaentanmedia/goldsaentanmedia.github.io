# Anamorphic 3D Scene Builder (Blender Add-on)

Add-on สำหรับ Blender ที่สร้างฉาก Anamorphic 3D มาตรฐาน (จอ/ป้าย, มุมกล้อง, ความสูงป้าย, แสง) ให้เหมือนกันทุกโปรเจกต์ด้วยปุ่มเดียว พร้อมระบบเซฟ/โหลด preset ค่าที่ทีมใช้ประจำ

## ติดตั้ง

1. เปิด Blender → `Edit > Preferences > Add-ons > Install...`
2. เลือกไฟล์ `anamorphic_scene_builder.py`
3. ติ๊กเปิดใช้งาน add-on "Anamorphic 3D Scene Builder"
4. ไปที่ 3D Viewport → กด `N` เปิด Sidebar → แท็บ **Anamorphic**

## วิธีใช้

1. ตั้งค่าพารามิเตอร์ในพาเนล:
   - **Screen**: ขนาดกว้าง/สูงของจอ LED และความสูงป้ายจากพื้น (Sign Height)
   - **Camera**: ระยะห่างจากจอ (Viewing Distance), มุมกล้อง (Viewing Angle — มุม sweet-spot มาตรฐานของงาน anamorphic เช่น 30–45°), ความสูงกล้อง/สายตา, เลนส์, และความละเอียด render
2. กด **Build Anamorphic Scene** — ระบบจะสร้าง/อัปเดตอัตโนมัติ:
   - Plane จอ (`Anamorphic_Screen`) วางตามความสูงป้ายที่กำหนด
   - Empty เป้าเล็ง (`Anamorphic_Target`) ที่กึ่งกลางจอ
   - กล้อง (`Anamorphic_Camera`) วางตามระยะและมุมที่กำหนด พร้อม Track-To constraint เล็งจออัตโนมัติ และตั้งเป็นกล้อง render ของฉาก
   - Sun light พื้นฐาน
   - รันซ้ำได้เรื่อยๆ โดยไม่สร้างซ้ำซ้อน (จะลบของเดิมแล้วสร้างใหม่ตามค่าปัจจุบัน)

## Preset (ให้ค่าตรงกันทุกโปรเจกต์)

1. ตั้งชื่อในช่อง **Preset Name** เช่น `standard-35deg`
2. กด **Save Preset** เพื่อบันทึกค่าปัจจุบันเป็นไฟล์ `.json` ในโฟลเดอร์ `anamorphic_presets/` ข้างไฟล์ `.blend` (ต้องเซฟไฟล์ `.blend` ก่อน)
3. โปรเจกต์อื่นที่ต้องการใช้ค่าเดียวกัน: คัดลอกไฟล์ preset ไปไว้ในโฟลเดอร์ `anamorphic_presets/` ของโปรเจกต์นั้น แล้วกด **Load Preset** โดยใส่ชื่อ preset เดียวกัน

> แนะนำให้เก็บไฟล์ preset มาตรฐานของทีมไว้ในโฟลเดอร์นี้ (เช่น `standard-35deg.json`) แล้ว commit เข้า repo เพื่อให้ทุกคนในทีมดึงไปใช้ค่าเดียวกันได้

## หมายเหตุ

- มุมกล้อง (Viewing Angle) นับจากแนวตั้งฉากกับจอ (0° = มองตรง), ค่าบวก/ลบคือเยื้องซ้าย/ขวา
- Sign Height คือความสูงจาก "พื้น" ถึง "ขอบล่างของจอ" ใช้ค่าเดียวกันทุกโปรเจกต์เพื่อให้ภาพลวงตา anamorphic คำนวณสัมพัทธ์กับความสูงตาผู้ชมได้ถูกต้อง
- ปรับ/ต่อยอดสคริปต์ได้ตามต้องการ เช่น เพิ่ม corner-pin projection, เพิ่ม preset หลายจอ, หรือผูกกับขนาดพิกเซล LED จริง
