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
    <div className="app">
      <AppNav />
      <div className="app__main">
        <div className="top">
          <ConnBar online={online} lastUpdate={lastUpdate} />
        </div>
        <main className="content">
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
