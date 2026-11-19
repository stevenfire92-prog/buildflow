import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { checkFounderUrl } from './lib/founder.js';
import NorthlineArcade from './components/NorthlineArcade.jsx';
import SeFireWatermark from './components/SeFireWatermark.jsx';

export default function App() {
  useEffect(() => {
    checkFounderUrl();
  }, []);

  return (
    <>
      <Toaster theme="dark" position="top-center" richColors closeButton />
      <NorthlineArcade />
      <SeFireWatermark />
    </>
  );
}
