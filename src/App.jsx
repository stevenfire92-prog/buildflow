import '@/index.css';
import { useEffect } from 'react';
import { checkFounderUrl } from '@/lib/founder';
import GlobePayApp from '@/globepay/GlobePayApp';

export default function App() {
  useEffect(() => { checkFounderUrl(); }, []);
  return <GlobePayApp />;
}
