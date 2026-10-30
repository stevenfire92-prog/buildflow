import '@/index.css';
import { useEffect } from 'react';
import GlobePayApp from '@/globepay/GlobePayApp';
import { checkFounderUrl } from '@/globepay/founder';

export default function App() {
  useEffect(() => { checkFounderUrl(); }, []);
  return <GlobePayApp />;
}
