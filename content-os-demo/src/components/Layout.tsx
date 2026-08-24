import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import PromoBanner from './PromoBanner'

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* sidebar ถาวรบนจอกว้าง */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* sidebar แบบเลื่อนออกมาบนจอแคบ */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <main className="mx-auto w-full max-w-[1040px] flex-1 px-5 py-6">
          <Outlet />
        </main>
      </div>

      <PromoBanner />
    </div>
  )
}
