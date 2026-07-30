/**
 * ฟอนต์เอกสาร — โหลดจาก Supabase Storage ตอนเรนเดอร์ แล้วฝังลงในเอกสารที่ส่งออก
 *
 * ทำไมไม่เก็บไฟล์ฟอนต์ไว้ในรีโป: รีโปนี้เป็น public การ commit ไฟล์ฟอนต์ลงไป
 * เท่ากับเผยแพร่ฟอนต์ของบุคคลที่สามต่อ ซึ่งอาจขัดสัญญาอนุญาต ไฟล์จึงอยู่ใน
 * bucket แบบ private ที่มีแต่ service role อ่านได้ คนนอกโหลดตรงไม่ได้
 *
 * ทำไมต้องฝังลงในเอกสาร ไม่ใช่ลิงก์ไป: เอกสารต้องพิมพ์ได้เหมือนกันทุกเครื่อง
 * รวมถึงตอนแปลงเป็น PDF บนเซิร์ฟเวอร์ที่ไม่มีฟอนต์ลงไว้ ถ้าอ้างอิงจากชื่อฟอนต์
 * เครื่องที่ไม่มีจะถอยไปใช้ฟอนต์อื่น ความกว้างตัวอักษรเปลี่ยน จุดตัดบรรทัดเลื่อน
 * เอกสารที่พิมพ์ออกมาจะไม่ตรงกับที่เห็นบนจอ
 *
 * วิธีเอาไฟล์ฟอนต์ขึ้น: ดู scripts/upload-fonts.md
 */

/**
 * แปลงไบต์เป็น base64 ด้วย btoa ซึ่งมีทั้งใน Deno และ Node จึงเทสต์ได้ทั้งสองที่
 * แบ่งเป็นก้อนเพราะ String.fromCharCode รับอาร์กิวเมนต์ทีละหลายหมื่นตัวไม่ได้
 * ฟอนต์ก้อนละ 20–36 KB ถ้าส่งทั้งก้อนจะ stack overflow
 */
function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  const CHUNK = 0x8000
  let s = ''
  for (let i = 0; i < bytes.length; i += CHUNK) {
    s += String.fromCharCode(...bytes.subarray(i, i + CHUNK))
  }
  return btoa(s)
}

/** bucket แบบ private ต้องไม่เปิด public access */
export const FONT_BUCKET = 'brand-assets'
export const FONT_DIR = 'fonts'

type Face = { weight: number; file: string }

/**
 * น้ำหนักที่เอกสารใช้ ใช้ตระกูล CS ChatThaiUI ตามที่เลือกไว้
 *
 * ชื่อไฟล์ต้องตรงกับที่อยู่ใน bucket ทุกตัวอักษร Storage แยกตัวพิมพ์เล็กใหญ่
 * และไม่มีขีดกลางคั่นน้ำหนัก ถ้าตั้งชื่อเพี้ยนจะโหลดไม่เจอแบบเงียบ ๆ
 * แล้วเอกสารจะถอยไปฟอนต์สำรองโดยไม่มีอะไรฟ้องหน้าจอ ดูสาเหตุได้ใน log
 */
const FACES: Face[] = [
  { weight: 300, file: 'CSChatThaiUILight.woff2' },
  { weight: 400, file: 'CSChatThaiUIRegular.woff2' },
  { weight: 700, file: 'CSChatThaiUIBold.woff2' },
]

type Cache = { css: string; at: number }
let cache: Cache | null = null

/**
 * ถ้าโหลดไม่สำเร็จจะจำผลไว้สั้น ๆ แล้วลองใหม่
 * ไม่จำถาวร เพราะ Storage ล่มชั่วคราวไม่ควรทำให้อินสแตนซ์นี้ใช้ฟอนต์ไม่ได้ไปตลอด
 * ส่วนที่โหลดสำเร็จจำได้นาน ฟอนต์ไม่ได้เปลี่ยนบ่อย
 */
const RETRY_MS = 60_000
const KEEP_MS = 6 * 60 * 60 * 1000

/** ตัวย่อของ client ที่ต้องใช้ รับเป็นอาร์กิวเมนต์เพื่อให้เทสต์ส่งตัวปลอมเข้ามาได้ */
export type StorageLike = {
  storage: {
    from: (bucket: string) => {
      download: (path: string) => Promise<{ data: Blob | null; error: unknown }>
    }
  }
}

/**
 * ประกอบ @font-face ที่ฝังฟอนต์เป็น data URI
 * คืนสตริงว่างถ้าโหลดไม่ได้เลย ตัวเอกสารจะถอยไปใช้ฟอนต์สำรองในลำดับ font-family
 */
export async function documentFontCss(supabase: StorageLike): Promise<string> {
  const now = Date.now()
  if (cache) {
    const age = now - cache.at
    if (cache.css && age < KEEP_MS) return cache.css
    if (!cache.css && age < RETRY_MS) return ''
  }

  const blocks: string[] = []
  await Promise.all(
    FACES.map(async (face) => {
      try {
        const { data, error } = await supabase.storage
          .from(FONT_BUCKET)
          .download(`${FONT_DIR}/${face.file}`)
        if (error || !data) throw error || new Error('ไม่ได้ข้อมูล')

        const b64 = toBase64(await data.arrayBuffer())
        blocks.push(
          `  @font-face {\n` +
            `    font-family: 'CS ChatThai'; font-style: normal; font-weight: ${face.weight};\n` +
            `    src: url('data:font/woff2;base64,${b64}') format('woff2');\n` +
            `  }`,
        )
      } catch (e) {
        // ขาดน้ำหนักไหนไปก็ยังพิมพ์ได้ น้ำหนักนั้นจะถอยไปใช้ฟอนต์สำรอง
        console.error(`โหลดฟอนต์ ${face.file} ไม่ได้:`, e)
      }
    }),
  )

  const css = blocks.length ? blocks.sort().join('\n') + '\n' : ''
  cache = { css, at: now }
  if (!css) console.error('โหลดฟอนต์เอกสารไม่ได้เลย จะใช้ฟอนต์สำรอง')
  return css
}

/** ใช้ในเทสต์ ให้เริ่มนับแคชใหม่ */
export function clearFontCache() {
  cache = null
}
