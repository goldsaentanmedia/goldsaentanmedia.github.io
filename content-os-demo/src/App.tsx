import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import { ToastProvider } from './toast'
import SystemMap from './pages/SystemMap'
import Overview from './pages/Overview'
import Analytics from './pages/Analytics'
import Competitors from './pages/Competitors'
import Trends from './pages/Trends'
import Hooks from './pages/Hooks'
import Schedule from './pages/Schedule'
import Calendar from './pages/Calendar'
import Ads from './pages/Ads'

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* แผนผังระบบอยู่นอก Layout เพราะเป็นหน้าอธิบาย ไม่ใช่ dashboard */}
        <Route path="/" element={<SystemMap />} />

        <Route element={<Layout />}>
          <Route path="/overview" element={<Overview />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/competitors" element={<Competitors />} />
          <Route path="/trends" element={<Trends />} />
          <Route path="/hooks" element={<Hooks />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/ads" element={<Ads />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  )
}
