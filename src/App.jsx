import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Home from './pages/Home';
import AppDetail from './pages/AppDetail';
import Disclaimer from './components/Disclaimer';
import { checkFounderUrl } from './lib/founder';

export default function App() {
  useEffect(() => { checkFounderUrl(); }, []);
  return (
    <Router>
      <Toaster position="top-center" theme="dark" richColors />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app/:id" element={<AppDetail />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
