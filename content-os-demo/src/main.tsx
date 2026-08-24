import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// HashRouter เพราะเว็บนี้ขึ้นบน GitHub Pages ซึ่งเป็นโฮสต์ไฟล์นิ่ง
// ไม่มีเซิร์ฟเวอร์คอยส่ง index.html กลับให้ทุก path — refresh กลางทางจะ 404
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
