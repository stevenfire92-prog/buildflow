import '@/index.css';
import { useEffect } from 'react';
import DrBuildAIApp from '@/drbuildai/DrBuildAIApp';
import { checkFounderUrl } from '@/drbuildai/founder';

export default function App() {
  useEffect(() => { checkFounderUrl(); }, []);
  return <DrBuildAIApp />;
}
