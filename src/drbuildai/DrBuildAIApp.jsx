// Dr Build AI — AI app builder.
// Landing: describe it, watch AI build it, ship it.
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Landing from './pages/Landing';
import Builder from './pages/Builder';
import Templates from './pages/Templates';
import MyApps from './pages/MyApps';
import Settings from './pages/Settings';

export default function DrBuildAIApp() {
  return (
    <Router>
      <Toaster position="top-center" theme="dark" richColors />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/apps" element={<MyApps />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
