import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Toast กลางของแอป
 *
 * ปุ่มในเดโมไม่ได้ต่อหลังบ้านจริง แต่ต้องให้ความรู้สึกว่ามีอะไรเกิดขึ้น
 * จึงตอบด้วยข้อความสั้น ๆ แทน — และข้อความจะบอกเสมอว่านี่คือตัวอย่าง
 */
const Ctx = createContext<(msg: string) => void>(() => {})

export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback((text: string) => {
    if (timer.current) clearTimeout(timer.current)
    setMsg(text)
    timer.current = setTimeout(() => setMsg(null), 3000)
  }, [])

  return (
    <Ctx.Provider value={show}>
      {children}
      {msg && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full border border-line bg-ink px-5 py-3 text-[13px] font-medium text-white shadow-xl">
          <span className="mr-2 text-gold">✦</span>{msg}
        </div>
      )}
    </Ctx.Provider>
  )
}
