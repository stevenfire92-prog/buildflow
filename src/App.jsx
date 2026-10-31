import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import Landing from './pages/Landing'
import Disclaimer from './components/Disclaimer'
import { checkFounderUrl } from './lib/founder'

export default function App() {
  useEffect(() => {
    checkFounderUrl()
  }, [])

  return (
    <BrowserRouter>
      <Toaster position="top-center" theme="dark" richColors closeButton />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
