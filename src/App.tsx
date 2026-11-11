import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppNav } from './components/AppNav'
import { ConnBar } from './components/ConnBar'
import { StoreProvider } from './data/store'
import { useStore } from './data/storeContext'
import Alarm from './pages/Alarm'
import Beranda from './pages/Beranda'
import DetailAnalisis from './pages/DetailAnalisis'
import Pengaturan from './pages/Pengaturan'
import Pratinjau from './pages/Pratinjau'
import Riwayat from './pages/Riwayat'
import SisaPakan from './pages/SisaPakan'

export function Shell() {
  const { online, lastUpdate } = useStore()
  return (
    <div className="flex min-h-dvh flex-col md:flex-row print:block">
      <AppNav />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-5 print:hidden">
          <ConnBar online={online} lastUpdate={lastUpdate} />
        </div>
        <main className="mx-auto flex w-full max-w-[calc(var(--page-max)+2*var(--gutter))] flex-1 flex-col px-(--gutter) pt-4 pb-[calc(var(--nav-h)+24px+env(safe-area-inset-bottom))] md:pb-8 print:max-w-none print:p-0">
          <Routes>
            <Route path="/" element={<Beranda />} />
            <Route path="/pakan" element={<SisaPakan />} />
            <Route path="/pakan/pratinjau" element={<Pratinjau />} />
            <Route path="/pakan/:id" element={<DetailAnalisis />} />
            <Route path="/riwayat" element={<Riwayat />} />
            <Route path="/alarm" element={<Alarm />} />
            <Route path="/pengaturan" element={<Pengaturan />} />
            <Route path="*" element={<Beranda />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </BrowserRouter>
  )
}
