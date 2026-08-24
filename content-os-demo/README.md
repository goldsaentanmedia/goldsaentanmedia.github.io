# Content OS · by Claude COWORK — เดโม

เว็บเดโมแสดงว่าระบบ marketing/content operations ที่ Claude ดูแลหลังบ้านให้
หน้าตาและการทำงานเป็นอย่างไร

> **ตัวเลขทุกตัวในเดโมนี้เป็นของแต่ง** ไม่ได้มาจากบัญชีจริงของ Gold Saentan Media
> และไม่ได้ต่อกับ Instagram / Facebook / Meta Ads จริง ข้อมูลทั้งหมดอยู่ใน
> `src/data/mock.ts` ไฟล์เดียว แก้ที่นั่นได้เลย
>
> เดโมนี้แยกจากระบบที่พนักงานใช้จริง (`gst-web-app`) คนละโปรเจกต์กัน
> เพื่อไม่ให้ตัวเลขสมมติหลุดไปปนกับข้อมูลจริงที่ทีมใช้ตัดสินใจ

## รัน

```bash
npm install
npm run dev      # เปิด http://localhost:5173
```

## Build

```bash
npm run build    # ได้ไฟล์นิ่งใน dist/
npm run preview  # ลองดู build ก่อนเอาขึ้นจริง
```

`base` ตั้งเป็น `'./'` และใช้ HashRouter จึงวางไว้โฟลเดอร์ไหนก็ได้บนโฮสต์ไฟล์นิ่ง
อย่าง GitHub Pages โดยไม่ต้องตั้งค่าเซิร์ฟเวอร์เพิ่ม — และ refresh กลางทางไม่ 404

## โครง

```
src/
  data/mock.ts        ตัวเลขและข้อความทั้งหมด — แก้แบรนด์/เนื้อหาที่นี่
  components/         sidebar, topbar, การ์ดสถิติ, modal, toast, แบนเนอร์
  pages/
    SystemMap.tsx     หน้าแรก แผนผังระบบ (อยู่นอก layout ของ dashboard)
    Overview.tsx      ภาพรวม
    Analytics.tsx     Competitors.tsx  Trends.tsx
    Hooks.tsx         Schedule.tsx     Calendar.tsx     Ads.tsx
```

ปุ่ม action ทั้งหมด (`ทำแนวนี้อีก`, `ใช้อันนี้`, `→ ทำเป็น hook`, `+ สร้าง REEL`)
ไม่ได้ต่อหลังบ้าน กดแล้วขึ้น toast แทน
