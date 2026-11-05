import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { checkFounderUrl } from './lib/founder.js';
import Landing from './pages/Landing.jsx';
import Disclaimer from './components/Disclaimer.jsx';
import SeFireWatermark from './components/SeFireWatermark.jsx';

export default function App() {
  useEffect(() => {
    checkFounderUrl();
  }, []);

  return (
    <BrowserRouter>
      <Toaster theme="dark" position="top-center" richColors closeButton />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/disclaimer" element={<Disclaimer accent="orange" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SeFireWatermark />
    </BrowserRouter>
  );
}
