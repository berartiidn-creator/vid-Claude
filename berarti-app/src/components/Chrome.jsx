import { CONFIG } from '../config.js';
export function Top({ go, cta = true }) {
  return <header className="top no-print"><div className="wrap">
    <a className="logo" href="/" onClick={e => { e.preventDefault(); go('/'); }}>BERARTI<span>.</span></a>
    {cta && <button className="btn btn-primary" onClick={() => go('/tes')}>Mulai Tes</button>}
  </div></header>;
}
export function Foot({ go }) {
  const link = (p, t) => <a href={p} onClick={e => { e.preventDefault(); go(p); }}>{t}</a>;
  return <footer className="foot no-print"><div className="wrap">
    <div className="logo" style={{ fontSize: 26 }}>BERARTI</div>
    <p style={{ opacity: .85, marginTop: 6 }}>Dari bingung menjadi berarti.</p>
    <p style={{ marginTop: 22 }}>
      <a href={CONFIG.INSTAGRAM} target="_blank" rel="noreferrer">Instagram</a>
      <a href={`https://wa.me/${CONFIG.NOMOR_WA}`} target="_blank" rel="noreferrer">WhatsApp</a>
      {link('/privasi', 'Kebijakan Privasi')}{link('/syarat', 'Syarat Penggunaan')}{link('/refund', 'Kebijakan Refund')}
    </p>
    <p className="small" style={{ color: '#B9C7BC', marginTop: 18 }}>BERARTI Index adalah tes refleksi diri, bukan tes psikologi klinis dan bukan diagnosis.</p>
  </div></footer>;
}
export function Toast({ text }) { return text ? <div className="toast" role="status">{text}</div> : null; }
