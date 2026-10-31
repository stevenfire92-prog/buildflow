import '@/index.css';
import { useEffect } from 'react';
import { checkFounderUrl } from '@/lib/founder';
import DrBuildAIApp from '@/drbuildai/DrBuildAIApp';

export default function App() {
  useEffect(() => { checkFounderUrl(); }, []);
  return <DrBuildAIApp />;
}
