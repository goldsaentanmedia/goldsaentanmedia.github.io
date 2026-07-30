# เอาไฟล์ฟอนต์ขึ้น Supabase Storage

เอกสารที่ระบบออกให้ฝังฟอนต์ CS ChatThai ลงไปในตัวไฟล์ เพื่อให้พิมพ์ออกมา
เหมือนกันทุกเครื่อง รวมถึงตอนแปลงเป็น PDF บนเซิร์ฟเวอร์ที่ไม่มีฟอนต์ลงไว้

ไฟล์ฟอนต์ **ไม่เก็บไว้ในรีโป** เพราะรีโปนี้เป็น public การ commit ไฟล์ฟอนต์
ลงไปเท่ากับเผยแพร่ฟอนต์ของบุคคลที่สามต่อ จึงเก็บใน Storage แบบ private
ที่มีแต่ service role อ่านได้ คนนอกโหลดตรงไม่ได้ และ `.gitignore` กันไฟล์
นามสกุลฟอนต์ไว้แล้วเพื่อไม่ให้ commit ติดไปโดยไม่ตั้งใจ

## ไฟล์ที่ต้องมี

ตัวเรนเดอร์เอกสารอ่านสามไฟล์นี้จาก bucket `brand-assets` ใต้โฟลเดอร์ `fonts/`

| ไฟล์ | น้ำหนัก | ใช้ที่ |
|---|---|---|
| `CSChatThai-Light.woff2` | 300 | ข้อความรองในเอกสาร |
| `CSChatThai-Regular.woff2` | 400 | ตัวหลักทั้งเอกสาร |
| `CSChatThai-Bold.woff2` | 700 | หัวเรื่องและยอดรวม |

ใช้ตระกูล **CS ChatThai** ไม่ใช่ CS ChatThaiUI เพราะ UI ออกแบบมาสำหรับหน้าจอ
ส่วนตัวนี้ทำมาสำหรับงานพิมพ์ (ถ้าจะเก็บชุด UI ขึ้นไปด้วยก็ไม่เสียหาย
ตัวเรนเดอร์จะไม่ไปอ่าน)

ต้นฉบับที่ได้มาเป็น `.otf` แปลงเป็น `.woff2` ก่อน เล็กลงราวสามเท่าและเบราว์เซอร์
อ่านได้ตรง ๆ แปลงด้วย [fonttools](https://github.com/fonttools/fonttools):

```bash
pip install fonttools brotli
python - <<'PY'
from fontTools.ttLib import TTFont
for src, dst in [
    ('CSChatThai.otf',      'CSChatThai-Regular.woff2'),
    ('CSChatThaiLight.otf', 'CSChatThai-Light.woff2'),
    ('CSChatThaiBold.otf',  'CSChatThai-Bold.woff2'),
]:
    f = TTFont(src); f.flavor = 'woff2'; f.save(dst)
PY
```

การแปลงเก็บตาราง GSUB/GPOS ไว้ครบ (`ccmp`, `locl`, `mark`, `mkmk`)
วรรณยุกต์และสระบนพยัญชนะสูงจึงยังวางถูกตำแหน่ง ไม่ต้องใช้ glyph สำรอง
แบบฟอนต์ไทยรุ่นเก่า

## วิธีเอาขึ้น

### ทางหน้าเว็บ

1. เปิด Supabase Dashboard → **Storage**
2. **New bucket** ชื่อ `brand-assets` — **ห้ามติ๊ก Public bucket**
3. สร้างโฟลเดอร์ `fonts` แล้วลากไฟล์ `.woff2` ทั้งสามเข้าไป

### ทาง CLI

ต้องมี service role key (Dashboard → Settings → API → `service_role`)
**อย่าใส่ key นี้ลงในรีโปหรือในโค้ดฝั่งเบราว์เซอร์** — มันข้าม RLS ได้ทั้งหมด

```bash
export SUPABASE_URL='https://<project-ref>.supabase.co'
export SERVICE_ROLE_KEY='<service_role key>'

# สร้าง bucket แบบ private (ข้ามได้ถ้าสร้างจากหน้าเว็บแล้ว)
curl -sS -X POST "$SUPABASE_URL/storage/v1/bucket" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"name":"brand-assets","public":false}'

for f in CSChatThai-Light.woff2 CSChatThai-Regular.woff2 CSChatThai-Bold.woff2; do
  curl -sS -X POST "$SUPABASE_URL/storage/v1/object/brand-assets/fonts/$f" \
    -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
    -H 'Content-Type: font/woff2' \
    -H 'x-upsert: true' \
    --data-binary "@$f" && echo "  ขึ้นแล้ว $f"
done
```

## ตรวจว่าได้ผล

เปิด `.../functions/v1/quote-render-html?preview=1` แล้วดูซอร์สของหน้า

* **สำเร็จ** — มี `@font-face` สามชุดที่ `src` เป็น `data:font/woff2;base64,...`
  และ **ไม่มี** ลิงก์ไป `fonts.googleapis.com`
* **ยังไม่สำเร็จ** — ไม่มี `@font-face` แต่มีลิงก์ Google Fonts แทน
  เอกสารยังออกได้ปกติ แค่ใช้ Sarabun เป็นตัวสำรอง ดูสาเหตุที่แท้จริงได้ใน
  log ของ Edge Function จะบอกว่าไฟล์ไหนโหลดไม่ได้

ตัวเรนเดอร์จำฟอนต์ไว้ในหน่วยความจำ 6 ชั่วโมง ถ้าเปลี่ยนไฟล์ฟอนต์แล้วอยากให้
เห็นผลทันที ให้ deploy Edge Function ใหม่เพื่อเริ่มอินสแตนซ์ใหม่

## เทสต์

```bash
CS_CHATTHAI_DIR=/path/to/woff2 \
  node --experimental-strip-types scripts/check-document-fonts.mts
```

ตรวจว่าฝังครบสามน้ำหนัก แคชไม่โหลดซ้ำ ขาดน้ำหนักไหนไปก็ยังฝังที่เหลือ
และเมื่อ Storage ใช้ไม่ได้ เอกสารยังออกได้โดยถอยไปฟอนต์สำรอง
ถ้าไม่ตั้ง `CS_CHATTHAI_DIR` จะข้ามส่วนที่ต้องใช้ไฟล์จริง
