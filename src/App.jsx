import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Landing from './pages/Landing';
import Disclaimer from './components/Disclaimer';

export default function App() {
  return (
    <Router>
      <Toaster position="top-center" theme="dark" richColors />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
