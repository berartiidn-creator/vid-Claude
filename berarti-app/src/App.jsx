import { useEffect, useState } from 'react';
import Landing from './pages/Landing.jsx';
import Test from './pages/Test.jsx';
import Result from './pages/Result.jsx';
import Arah90 from './pages/Arah90.jsx';
import Legal from './pages/Legal.jsx';
import { Top, Foot } from './components/Chrome.jsx';

// tiny router: path → page; query string stays in location.search
export default function App() {
  const [path, setPath] = useState(location.pathname);
  useEffect(() => { const f = () => setPath(location.pathname); addEventListener('popstate', f); return () => removeEventListener('popstate', f); }, []);
  const go = (to) => { history.pushState({}, '', to); setPath(new URL(to, location.origin).pathname); scrollTo(0, 0); };
  let page, cta = true;
  if (path === '/tes') { page = <Test go={go} />; cta = false; }
  else if (path === '/hasil' || path === '/laporan') page = <Result go={go} />;
  else if (path === '/arah90') { page = <Arah90 go={go} />; cta = false; }
  else if (['/privasi', '/syarat', '/refund'].includes(path)) page = <Legal kind={path.slice(1)} />;
  else page = <Landing go={go} />;
  return <>
    <Top go={go} cta={cta} />
    <main>{page}</main>
    {path !== '/tes' && <Foot go={go} />}
  </>;
}
