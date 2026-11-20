import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { checkFounderUrl } from './lib/founder.js';
import { MusicProvider } from './lib/music.jsx';
import SapphireCasino from './components/SapphireCasino.jsx';
import SeFireWatermark from './components/SeFireWatermark.jsx';

export default function App() {
  useEffect(() => {
    checkFounderUrl();
  }, []);

  return (
    <>
      <Toaster theme="dark" position="top-center" richColors closeButton />
      <MusicProvider>
        <SapphireCasino />
      </MusicProvider>
      <SeFireWatermark />
    </>
  );
}
