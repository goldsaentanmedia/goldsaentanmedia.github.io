/**
 * ข้อมูลตัวอย่างทั้งหมดของเดโม
 *
 * ทุกตัวเลขในไฟล์นี้เป็นของแต่ง ไม่ได้มาจากบัญชีจริงของ Gold Saentan Media
 * เดโมนี้ทำไว้เพื่อแสดงว่าหน้าตาและการทำงานของระบบเป็นอย่างไร
 *
 * แยกไว้ไฟล์เดียวเพื่อให้แก้ตัวเลข/ข้อความได้จบในที่เดียว ไม่ต้องไล่แก้ในหน้า
 */

export const BRAND = {
  handle: '@goldsaentanmedia',
  followers: '142.8K',
  followerWindow: '30D',
  user: 'GOLD SAENTAN MEDIA',
  userSub: 'DEMO · ตัวอย่างข้อมูล',
}

export type Trend = { up: boolean; pct: string }

export type Stat = {
  label: string
  value: string
  delta: string
  up: boolean
  series: number[]
}

/* ---------------------------------------------------------- ภาพรวม ---- */

export const overviewStats: Stat[] = [
  { label: 'ยอดวิว IG · 7D', value: '287.4K', delta: '+162%', up: true, series: [20, 24, 22, 30, 34, 40, 52] },
  { label: 'รายได้ · 30D', value: '฿486K', delta: '+39%', up: true, series: [30, 32, 36, 35, 41, 46, 52] },
  { label: 'คนทัก DM · 7D', value: '124', delta: '+88%', up: true, series: [18, 20, 26, 24, 32, 38, 46] },
]

export const quickLinks = [
  { to: '/hooks', icon: '◈', title: 'คลัง HOOK', preview: '482 hooks · ใหม่ 17 อันสัปดาห์นี้' },
  { to: '/competitors', icon: '◎', title: 'ติดตามคู่แข่ง', preview: '8 creators · ดึงข้อมูล 6 โมงเช้าอาทิตย์' },
  { to: '/calendar', icon: '▤', title: 'ปฏิทิน CONTENT', preview: 'จ. / พ. / ศ. · เติมอัตโนมัติด้วย /script' },
  { to: '/trends', icon: '≋', title: 'เทรนด์วันนี้', preview: '12 sources · 5 อันที่ทำ hook ได้' },
  { to: '/ads', icon: '∞', title: 'ผลโฆษณา FB/IG', preview: 'ROAS 4.8x · งบ ฿38.2K สัปดาห์นี้' },
]

/* -------------------------------------------------------- ANALYTICS ---- */

export const analyticsStats: Stat[] = [
  { label: 'VIEWS · 7D', value: '287.4K', delta: '+162%', up: true, series: [20, 24, 22, 30, 34, 40, 52] },
  { label: 'SAVES · 7D', value: '4,812', delta: '+71%', up: true, series: [30, 32, 33, 38, 42, 45, 52] },
  { label: 'เข้าชม PROFILE', value: '12.6K', delta: '+44%', up: true, series: [40, 42, 41, 45, 48, 50, 55] },
]

export const topContent = [
  { title: 'จอ LED ป่าตองตอนพระอาทิตย์ตก — ทำไมคนถึงหยุดดู', views: '187K', delta: '+312%' },
  { title: 'ค่าโฆษณาบนจอ 1 วัน ถูกกว่าที่คิด', views: '94K', delta: '+201%' },
  { title: 'เบื้องหลังการติดตั้งจอ 3D โอลด์ทาวน์ภูเก็ต', views: '52K', delta: '+148%' },
  { title: 'ร้านเล็กก็ลงจอ LED ได้ — เริ่มที่งบเท่าไร', views: '38K', delta: '+92%' },
  { title: 'DOOH คืออะไร ต่างจากป้ายบิลบอร์ดยังไง', views: '29K', delta: '+67%' },
]

export const analyticsAdvice = {
  text: 'คอนเทนต์สาย ',
  bold1: 'เบื้องหลังงานติดตั้ง',
  mid: ' ทำผลงานดีกว่าค่าเฉลี่ย 3 เท่าเดือนนี้ ส่วนคลิปที่พูดเรื่องราคาตรง ๆ ได้ ',
  bold2: 'คนทัก DM เยอะที่สุด',
  end: ' — สัปดาห์หน้าลองทำแนวเบื้องหลังเพิ่มอีก 2 ชิ้น แล้วปิดท้ายด้วยราคา',
}

/* --------------------------------------------------------- คู่แข่ง ---- */

export const competitors = [
  { handle: '@planbmedia', followers: '1.2M', delta: '+2.7%', up: true, hot: true },
  { handle: '@vgi_digital', followers: '478K', delta: '+1.4%', up: true },
  { handle: '@phuketleddesign', followers: '355K', delta: '+0.9%', up: true },
  { handle: '@eggdigital', followers: '210K', delta: '+6.1%', up: true, hot: true },
  { handle: '@arrowmedia', followers: '188K', delta: '+1.1%', up: true },
  { handle: '@qadsmedia', followers: '134K', delta: '+3.8%', up: true },
  { handle: '@kingartadv', followers: '92K', delta: '-0.4%', up: false },
  { handle: '@extrememediaplus', followers: '76K', delta: '+5.2%', up: true },
]

export const competitorHighlight = {
  handle: '@eggdigital',
  initial: 'E',
  label: 'คู่แข่งมาแรงสุดสัปดาห์นี้',
  detail: 'โพสต์ถี่ขึ้น 2 เท่าสัปดาห์นี้ · reel เรื่อง "จอ LED ในห้าง vs ริมถนน อันไหนคุ้มกว่า" ทะลุ 388K วิว',
  gain: '+12.8K',
  gainLabel: 'followers · 7 วัน',
}

export const competitorHooks = [
  { text: '"จอ LED ในห้าง vs ริมถนน อันไหนคุ้มกว่า"', by: '@eggdigital', views: '388K', tag: 'CLAIM' },
  { text: '"งบ 5,000 ลงโฆษณาที่ไหนได้บ้าง"', by: '@planbmedia', views: '842K', tag: 'LIST' },
  { text: '"เลิกซื้อป้ายไวนิลได้แล้ว นี่คือเหตุผล"', by: '@vgi_digital', views: '410K', tag: 'CONTRARIAN' },
  { text: '"สร้างแคมเปญ DOOH เสร็จใน 1 สัปดาห์"', by: '@arrowmedia', views: '256K', tag: 'BUILD' },
]

/* ---------------------------------------------------------- เทรนด์ ---- */

export const trends = [
  { title: 'ททท. คาดนักท่องเที่ยวภูเก็ตไฮซีซั่นนี้โต 18%', action: 'HOOK' as const },
  { title: 'เทศกาลกินเจภูเก็ตเริ่ม 21 ต.ค. — แบรนด์แห่จองสื่อ', action: 'HOOK' as const },
  { title: 'ธุรกิจไทยหันมาใช้ DOOH เพิ่มขึ้น 24% ปีนี้', action: 'HOOK' as const },
  { title: 'ราคาจอ LED นำเข้าปรับลดลงต่อเนื่อง', action: 'EXPLAIN' as const },
  { title: 'แพลตฟอร์มโฆษณาต่างประเทศเปิดตัวฟีเจอร์ซ้ำเดิม', action: 'SKIP' as const },
]

export const trendAdvice =
  'วันนี้ข่าว "เทศกาลกินเจภูเก็ต" มาแรงสุด — ลองทำ hook แบบ "จองสื่อช่วงกินเจต้องจองก่อนกี่วัน" น่าจะตรงกับร้านอาหารและโรงแรมที่กำลังวางแผนงบ'

/* ----------------------------------------------------------- HOOK ---- */

export const hooks = [
  { text: 'เลิกทำ [X] แล้วเริ่มทำ [Y]', used: 38, tag: 'SWAP' },
  { text: 'สร้าง [PRODUCT] เสร็จใน [TIMEFRAME]', used: 24, tag: 'BUILD' },
  { text: 'คุณต้องมี [TOOL] นี่คือเหตุผล', used: 19, tag: 'CLAIM' },
  { text: '[NUMBER] เรื่องที่อยากรู้ก่อน [X]', used: 15, tag: 'LIST' },
  { text: 'ยังไม่มีใครพูดถึง [TREND]', used: 12, tag: 'CONTRARIAN' },
  { text: 'playbook ของวงการ [INDUSTRY] ที่ไม่มีใครยอมบอก', used: 9, tag: 'BUILD' },
  { text: 'งบ [NUMBER] บาท ทำ [X] ได้แค่ไหน', used: 8, tag: 'LIST' },
  { text: '[X] ที่คนส่วนใหญ่เข้าใจผิดมาตลอด', used: 6, tag: 'CONTRARIAN' },
]

export const HOOK_TAG_COLOR: Record<string, string> = {
  SWAP: '#7c3aed', BUILD: '#0ea5e9', CLAIM: '#A42840',
  LIST: '#B8860B', CONTRARIAN: '#16a34a',
  HOOK: '#A42840', EXPLAIN: '#0ea5e9', SKIP: '#A0A0A0',
}

/* --------------------------------------------------- ตั้งเวลาโพสต์ ---- */

export const scheduleDraft = {
  title: 'จอ LED ป่าตองตอนพระอาทิตย์ตก — ทำไมคนถึงหยุดดู',
  type: 'REEL',
  duration: '0:42',
  platforms: ['Instagram', 'TikTok', 'YT Shorts', 'LinkedIn'],
  platformTimes: [
    { platform: 'Instagram', when: 'จ. 22 มิ.ย. · 7:30 น.', reason: 'เวลาที่คนดูเยอะสุด' },
    { platform: 'TikTok', when: 'จ. 22 มิ.ย. · 19:00 น.', reason: 'ช่วงไพรม์ไทม์' },
    { platform: 'YT Shorts', when: 'อ. 23 มิ.ย. · 12:00 น.', reason: 'ช่วงพักเที่ยง' },
    { platform: 'LinkedIn', when: 'อ. 23 มิ.ย. · 9:00 น.', reason: 'ช่วงคนเปิดคอมเช้า' },
  ],
  caption: `จอเดียวกลางป่าตอง แต่ทำไมคนเดินผ่านถึงหยุดดู 👇
เราวัดมาแล้วว่าช่วงพระอาทิตย์ตกคนหยุดดูนานกว่าเวลาอื่น 3 เท่า
ทักมาถามช่วงเวลาที่ว่างได้เลย
#DOOH #จอLED #ภูเก็ต #ป่าตอง`,
}

/* ------------------------------------------------------- ปฏิทิน ---- */

export const calendarMonth = { label: 'มิถุนายน 2026', year: 2026, month: 5, platforms: 3 }

export type CalEvent = { time: string; type: string; platform: string }

export const calendarEvents: Record<number, CalEvent[]> = {
  2: [{ time: '7:30a', type: 'REEL', platform: 'IG' }],
  4: [{ time: '7:30a', type: 'CAROUSEL', platform: 'IG' }],
  8: [{ time: '7:30a', type: 'REEL', platform: 'IG+TT' }],
  10: [{ time: '5:00p', type: 'REEL', platform: 'YT' }],
  12: [{ time: '7:30a', type: 'CAROUSEL', platform: 'IG' }],
  15: [{ time: '8:00a', type: 'REEL', platform: 'IG' }, { time: '6:00p', type: 'STORY', platform: 'IG' }],
  17: [{ time: '7:30a', type: 'REEL', platform: 'TT' }],
  22: [{ time: '7:30a', type: 'REEL', platform: 'IG' }],
}

export const PLATFORM_COLOR: Record<string, string> = {
  IG: '#FAE3E7', TT: '#E7F0FA', YT: '#FBF3DF', 'IG+TT': '#EDE7FA',
}

/* --------------------------------------------------------- โฆษณา ---- */

export const adStats: Stat[] = [
  { label: 'ยอดขายจากโฆษณา · 7D', value: '฿183K', delta: '+31%', up: true, series: [30, 33, 34, 40, 46, 52, 60] },
  { label: 'ROAS · คืนทุนกี่เท่า', value: '4.8x', delta: '+14%', up: true, series: [35, 36, 40, 42, 44, 48, 52] },
  { label: 'ลูกค้าใหม่ · 7D', value: '450', delta: '+24%', up: true, series: [38, 40, 42, 44, 47, 50, 55] },
]

export const adCampaigns = [
  { name: 'โปรไฮซีซั่น · จอป่าตอง', spend: 12400, leads: 168, cpl: 74, roas: 6.0 },
  { name: 'รีมาร์เก็ตติ้ง · คนเข้าเพจ', spend: 8600, leads: 124, cpl: 69, roas: 5.5 },
  { name: 'วิดีโอรีวิวลูกค้าโรงแรม', spend: 9200, leads: 96, cpl: 96, roas: 4.2 },
  { name: 'กลุ่มความสนใจใหม่ (Broad)', spend: 5400, leads: 38, cpl: 142, roas: 2.2 },
  { name: 'คอนเทนต์สายให้ความรู้ DOOH', spend: 2600, leads: 24, cpl: 108, roas: 4.0 },
]

export const adAdvice = {
  good: 'โปรไฮซีซั่น · จอป่าตอง',
  goodRoas: '6.0x',
  bad: 'กลุ่มความสนใจใหม่ (Broad)',
  badCpl: '฿142',
  badRoas: '2.2x',
}

/* ------------------------------------------------- แผนผังระบบ ---- */

export type CoreBox = { key: string; title: string; sub: string; body: string }

export const coreBoxes: CoreBox[] = [
  {
    key: 'claude',
    title: 'Claude',
    sub: 'ORCHESTRATION',
    body: 'สมองของระบบ ทุกอย่างในหน้านี้สั่งงานผ่าน Claude ตัวเดียว — วิเคราะห์ผล เขียนสคริปต์ ตั้งเวลาโพสต์ สรุปโฆษณา ไม่ต้องสลับ 5 แอปอีกต่อไป',
  },
  {
    key: 'memory',
    title: 'Context Memory',
    sub: 'BRAND FILES',
    body: 'ที่เก็บ context ของแบรนด์คุณ — tone การพูด offer ที่ขาย ลูกค้าคือใคร hook ที่เคยไวรัล Claude อ่านทุกครั้งก่อนเขียน คุณไม่ต้องบรีฟใหม่ทุกรอบ ยิ่งใช้ยิ่งเข้าใจแบรนด์',
  },
  {
    key: 'always',
    title: 'Always-On',
    sub: 'ทุกเช้า 6:00',
    body: 'ระบบตื่นเองทุกเช้า 6:00 ไปดึงยอด IG/FB โพสต์ใหม่ของคู่แข่ง เทรนด์ และผลโฆษณา มาสรุปไว้ให้เรียบร้อย คุณแค่เปิดมาอ่านตอนกินกาแฟ',
  },
  {
    key: 'connectors',
    title: 'Connectors',
    sub: 'API / WEBHOOK',
    body: 'เชื่อมข้อมูลจาก Instagram, Facebook, Meta Ads, Notion, Google Drive etc. เข้ามารวมที่เดียว ต่อครั้งเดียวจบ หลังจากนั้นข้อมูลไหลเข้าเองอัตโนมัติ',
  },
]

export const mapColumns = [
  {
    heading: 'Data วิเคราะห์ผล',
    icons: ['IG', 'FB', 'TT'],
    rows: [
      { to: '/analytics', title: 'ANALYTICS', sub: 'คอนเทนต์ไหนไวรัล ควรทำอะไรต่อ' },
      { to: '/competitors', title: 'ติดตามคู่แข่ง', sub: 'hook เด็ดของคู่แข่งสัปดาห์นี้' },
      { to: '/trends', title: 'เทรนด์วันนี้', sub: 'ข่าวที่เอามาทำคอนเทนต์ได้' },
    ],
  },
  {
    heading: 'ทำคอนเทนท์',
    icons: ['✎', '≣', '▣'],
    rows: [
      { to: '/hooks', title: 'คลัง HOOK', sub: '482 hooks พร้อมหยิบไปเขียน' },
      { to: '/calendar', title: 'ปฏิทิน CONTENT', sub: 'คอนเทนต์ทั้งเดือนในที่เดียว' },
      { to: '/schedule', title: 'ตั้งเวลาโพสต์', sub: 'ให้ Claude โพสต์ให้อัตโนมัติ' },
    ],
  },
  {
    heading: 'โฆษณา',
    icons: ['∞', '▥'],
    rows: [
      { to: '/ads', title: 'ADS · FB/IG', sub: 'ROAS 4.8x · งบ ฿38.2K สัปดาห์นี้' },
      { to: '/ads', title: 'CAMPAIGN ไหนคุ้ม', sub: 'ตัวไหนควรเพิ่มงบ ตัวไหนควรหยุด' },
    ],
  },
]
