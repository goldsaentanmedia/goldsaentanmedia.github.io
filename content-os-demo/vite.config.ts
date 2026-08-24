import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base เป็น path ย่อย เพราะรีโปนี้เผยแพร่ผ่าน GitHub Pages ที่ราก
// ถ้าปล่อยเป็น '/' ไฟล์ js/css จะถูกอ้างผิดที่ตอนขึ้นจริง
export default defineConfig({
  plugins: [react()],
  base: './',
})
