import { useEffect, useRef, useState } from 'react';
import * as M from '../../shared/index-model.js';
import { api, track, ls } from '../lib/api.js';
import { Toast } from '../components/Chrome.jsx';

const GALI_Q = {
  BA: 'Kapan terakhir kali kamu merasa benar-benar jadi dirimu sendiri? Ceritakan situasinya.',
  ED: 'Kalau satu tahun lagi hidupmu berjalan baik, apa satu hal yang paling berbeda dari sekarang?',
  RA: 'Apa satu hal yang paling lama kamu tunda, dan apa yang membuatmu menundanya?',
  AV: 'Kapan terakhir kali kamu melakukan sesuatu yang terasa tidak sesuai dengan dirimu? Apa yang terjadi?',
  RM: 'Kegiatan apa yang membuatmu lupa waktu dan terasa berarti?',
  TI: 'Siapa orang terakhir yang terbantu olehmu, dan bagaimana rasanya?',
};
const KANVAS = [['siapaAku', 'Siapa aku'], ['nilaiku', 'Nilaiku'], ['arahku', 'Arahku'], ['alasanku', 'Alasanku'], ['kekuatanku', 'Kekuatanku'], ['langkahPertama', 'Langkah pertama']];
const TABS = [['mulai', 'Mulai'], ['gali', 'Gali'], ['kanvas', 'Kanvas'], ['peta', 'Peta 90'], ['cekin', 'Cek-in']];
const MAX_FOLLOW = 2;

export default function Arah90({ go }) {
  const q = new URLSearchParams(location.search);
  const [code, setCode] = useState(q.get('k') || ls.get('brt_code', '') || '');
  const [state, setState] = useState(null), [rep, setRep] = useState(null), [tab, setTab] = useState('mulai');
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false), [toast, setToast] = useState('');
  const saveT = useRef(null);
  const flash = t => { setToast(t); setTimeout(() => setToast(''), 2400); };

  async function open(c = code) {
    setBusy(true); setErr('');
    try {
      const r = await api('redeem', { code: c.trim() });
      if (r.tier !== 'arah90') throw new Error('Kode ini untuk BERARTI Signature. Upgrade ke Arah90 dulu dari halaman laporanmu.');
      const p = await api('progress', { code: r.code, action: 'load' });
      setRep(r); ls.set('brt_code', r.code); setCode(r.code);
      setState(p.data || { startedAt: new Date().toISOString(), gali: {}, kanvas: {}, peta: {}, cekin: [] });
      track('app_open');
    } catch (x) { setErr(x.message); }
    setBusy(false);
  }
  useEffect(() => { if (code) open(code); }, []);
  // save to the server (debounced) whenever progress changes
  const update = fn => setState(s => { const n = fn(structuredClone(s)); clearTimeout(saveT.current); saveT.current = setTimeout(() => api('progress', { code, action: 'save', data: n }).catch(() => flash('Gagal menyimpan, coba lagi')), 700); return n; });

  if (!state) return <div className="narrow screen fade-in">
    <div className="label">Arah90</div><h1 className="h2">Masuk ke <span className="key">Arah90</span></h1>
    <p className="lead">Masukkan kode akses dari email pembayaranmu. Progresmu tersimpan di server, jadi bisa dilanjutkan dari HP atau laptop mana pun.</p>
    <div className="field"><label htmlFor="c">Kode akses</label><input id="c" placeholder="BRT-XXXX-XXXX" value={code} onChange={e => setCode(e.target.value)} /></div>
    {err && <p className="err">{err}</p>}
    <button className="btn btn-primary btn-block" disabled={busy} onClick={() => open()}>{busy ? 'Membuka...' : 'Masuk'}</button>
  </div>;

  const scores = M.decodeScores(rep.scores), low = M.weakest(scores);
  const ctx = { archetype: rep.report.archetype, scoresText: M.DIMS.map(d => `${d.name} ${scores[d.id]}`).join(', ') };
  const week = Math.min(12, Math.max(1, Math.floor((Date.now() - new Date(state.startedAt)) / (7 * 864e5)) + 1));
  return <div className="narrow" style={{ paddingBottom: 80 }}>
    <div style={{ padding: '26px 0 6px' }}><div className="label">Arah90 · Minggu {week} dari 12</div><h1 className="h3">{rep.report.archetype}</h1></div>
    <nav className="tabs">{TABS.map(([k, t]) => <button key={k} className={`tab ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>{t}</button>)}</nav>
    {tab === 'mulai' && <Mulai state={state} low={low} setTab={setTab} week={week} />}
    {tab === 'gali' && <Gali state={state} update={update} code={code} ctx={ctx} low={low} flash={flash} />}
    {tab === 'kanvas' && <Kanvas state={state} update={update} code={code} ctx={ctx} flash={flash} />}
    {tab === 'peta' && <Peta state={state} update={update} peta={rep.report.peta90} week={week} />}
    {tab === 'cekin' && <Cekin state={state} update={update} code={code} ctx={ctx} peta={rep.report.peta90} week={week} flash={flash} />}
    <Toast text={toast} />
  </div>;
}

function Mulai({ state, low, setTab, week }) {
  const galiDone = Object.values(state.gali || {}).filter(g => g.summary).length, kanvasDone = KANVAS.some(([k]) => state.kanvas?.[k]);
  const steps = [['gali', 'Gali', `Jawab pertanyaan refleksi, mulai dari ${M.DIMS.find(d => d.id === low).name}.`, galiDone > 0, `${galiDone} dari 6 pilar`],
    ['kanvas', 'Kanvas', 'Isi Life Design Canvas dari jawabanmu.', kanvasDone, kanvasDone ? 'Sudah diisi' : 'Belum'],
    ['peta', 'Peta 90', 'Centang aksi mingguanmu.', Object.keys(state.peta || {}).length > 0, `Minggu ${week}`],
    ['cekin', 'Cek-in', 'Setiap akhir pekan, ceritakan progresmu. Rencana minggu depan menyesuaikan.', (state.cekin || []).some(c => c.week === week), `${(state.cekin || []).length} cek-in`]];
  return <div className="grid fade-in">{steps.map(([k, t, d, ok, info], i) => <button key={k} className="card" style={{ textAlign: 'left', border: 0, display: 'flex', gap: 16, alignItems: 'center' }} onClick={() => setTab(k)}>
    <div className="num" style={{ fontSize: 34 }}>{String(i + 1).padStart(2, '0')}</div>
    <div style={{ flex: 1 }}><b style={{ fontSize: 18 }}>{t}</b><div className="small" style={{ fontSize: 14 }}>{d}</div></div>
    <span className={`pill ${ok ? 'done' : ''}`}>{info}</span></button>)}</div>;
}

function Gali({ state, update, code, ctx, low, flash }) {
  const order = [low, ...M.TIE_ORDER.filter(d => d !== low)];
  const [pillar, setPillar] = useState(order.find(d => !state.gali?.[d]?.summary) || low);
  const [text, setText] = useState(''), [busy, setBusy] = useState(false);
  const g = state.gali?.[pillar] || { history: [{ role: 'ai', text: GALI_Q[pillar] }] };
  const follows = g.history.filter(m => m.role === 'ai').length - 1;
  async function sendAnswer() {
    if (!text.trim()) return; setBusy(true);
    const history = [...g.history, { role: 'me', text: text.trim() }];
    update(s => { s.gali[pillar] = { ...g, history }; return s; }); setText('');
    try {
      if (follows < MAX_FOLLOW) { const r = await api('ai', { code, task: 'gali', payload: { ...ctx, pillar, history } }); update(s => { s.gali[pillar].history.push({ role: 'ai', text: r.reply }); return s; }); }
      else { const r = await api('ai', { code, task: 'gali_summary', payload: { ...ctx, pillar, history } }); update(s => { s.gali[pillar].summary = r.summary; return s; }); }
    } catch (x) { flash(x.message); }
    setBusy(false);
  }
  return <div className="fade-in">
    <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 6 }}>{order.map(d => <button key={d} className={`pill ${state.gali?.[d]?.summary ? 'done' : ''}`} style={{ border: d === pillar ? '2px solid var(--orange)' : '2px solid transparent', cursor: 'pointer' }} onClick={() => setPillar(d)}>{M.DIMS.find(x => x.id === d).name}</button>)}</div>
    <div className="chat">{g.history.map((m, i) => <div key={i} className={`msg ${m.role === 'ai' ? 'ai' : 'me'}`}>{m.text}</div>)}</div>
    {g.summary ? <div className="card" style={{ borderTop: '8px solid var(--orange)' }}><div className="label">Insight</div><p style={{ margin: 0, lineHeight: 1.6 }}>{g.summary}</p>
      <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={() => update(s => { delete s.gali[pillar]; return s; })}>Ulangi pilar ini</button></div>
      : <><textarea placeholder="Tulis jawabanmu sejujurnya..." value={text} onChange={e => setText(e.target.value)} />
        <button className="btn btn-primary btn-block" style={{ marginTop: 10 }} disabled={busy || !text.trim()} onClick={sendAnswer}>{busy ? 'Sebentar...' : follows < MAX_FOLLOW ? 'Kirim' : 'Kirim dan rangkum'}</button></>}
  </div>;
}

function Kanvas({ state, update, code, ctx, flash }) {
  const [busy, setBusy] = useState(false);
  const insights = Object.fromEntries(Object.entries(state.gali || {}).filter(([, g]) => g.summary).map(([k, g]) => [k, g.summary]));
  async function fill() {
    setBusy(true);
    try { const r = await api('ai', { code, task: 'kanvas', payload: { ...ctx, insights } }); update(s => { s.kanvas = { ...r.kanvas }; return s; }); } catch (x) { flash(x.message); }
    setBusy(false);
  }
  async function download() {
    const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    x.fillStyle = '#FAF3ED'; x.fillRect(0, 0, W, H); x.fillStyle = '#0F3822'; x.font = '64px "Archivo Black"'; x.fillText('LIFE DESIGN CANVAS', 60, 110);
    x.fillStyle = '#FF5500'; x.font = '600 30px Poppins'; x.fillText(ctx.archetype.toUpperCase(), 60, 160);
    KANVAS.forEach(([k, t], i) => {
      const bx = 60 + (i % 2) * 495, by = 210 + Math.floor(i / 2) * 360; x.fillStyle = '#fff'; x.beginPath(); x.roundRect(bx, by, 465, 330, 26); x.fill();
      x.fillStyle = '#FF5500'; x.font = '30px "Archivo Black"'; x.fillText(t.toUpperCase(), bx + 28, by + 58);
      x.fillStyle = '#171A18'; x.font = '500 28px Poppins'; let line = '', y = by + 110;
      for (const w of String(state.kanvas?.[k] || '').split(' ')) { const tt = line ? line + ' ' + w : w; if (x.measureText(tt).width > 410 && line) { x.fillText(line, bx + 28, y); line = w; y += 40; } else line = tt; }
      x.fillText(line, bx + 28, y);
    });
    x.fillStyle = '#6B6F6A'; x.font = '600 26px Poppins'; x.fillText('BERARTI Arah90 · #jadiberarti', 60, H - 40);
    const a = document.createElement('a'); a.href = c.toDataURL('image/png'); a.download = 'life-design-canvas.png'; a.click();
  }
  return <div className="fade-in">
    <p className="lead" style={{ marginTop: 4 }}>Canvas satu halaman tentang dirimu. Isi otomatis dari insight Gali, lalu edit sesukamu.</p>
    <button className="btn btn-dark btn-block" disabled={busy || !Object.keys(insights).length} onClick={fill}>{busy ? 'Mengisi...' : Object.keys(insights).length ? 'Isi dari jawabanku' : 'Selesaikan minimal 1 pilar di Gali dulu'}</button>
    <div className="kanvas" style={{ marginTop: 16 }}>{KANVAS.map(([k, t]) => <div className="kbox" key={k}><b>{t}</b><textarea value={state.kanvas?.[k] || ''} onChange={e => update(s => { s.kanvas = { ...s.kanvas, [k]: e.target.value }; return s; })} /></div>)}</div>
    <button className="btn btn-ghost btn-block" style={{ marginTop: 14 }} onClick={download}>Unduh sebagai gambar</button>
  </div>;
}

function Peta({ state, update, peta, week }) {
  return <div className="fade-in">{Array.from({ length: 12 }, (_, i) => i + 1).map(w => {
    const ph = peta[Math.floor((w - 1) / 4)], extra = (state.cekin || []).find(c => c.week === w - 1)?.nextWeek || [];
    const items = [...ph.aksi, ...extra];
    return <div key={w} className="card" style={{ marginBottom: 12, opacity: w > week ? .55 : 1, border: w === week ? '3px solid var(--orange)' : 0 }}>
      <div><b>Minggu {w}</b><div className="small">{ph.fokus}</div></div>
      {items.map((t, j) => { const id = `w${w}-${j}`; return <label key={id} className={`todo ${state.peta?.[id] ? 'done' : ''}`}><input type="checkbox" checked={!!state.peta?.[id]} onChange={() => update(s => { s.peta = { ...s.peta, [id]: !s.peta?.[id] }; return s; })} /><span>{t}{j >= ph.aksi.length && <span className="pill" style={{ marginLeft: 8 }}>dari cek-in</span>}</span></label>; })}
    </div>; })}</div>;
}

function Cekin({ state, update, code, ctx, peta, week, flash }) {
  const [a, setA] = useState({ done: '', hambatan: '', energi: '3' }), [busy, setBusy] = useState(false);
  const ph = peta[Math.floor((week - 1) / 4)], thisWeek = (state.cekin || []).find(c => c.week === week);
  async function submit() {
    if (!a.done.trim()) return flash('Ceritakan dulu apa yang sudah kamu kerjakan.');
    setBusy(true);
    try { const r = await api('ai', { code, task: 'cekin', payload: { ...ctx, week, fokus: ph.fokus, aksi: ph.aksi, answers: a } });
      update(s => { s.cekin = [...(s.cekin || []).filter(c => c.week !== week), { week, answers: a, feedback: r.feedback, nextWeek: r.nextWeek, at: new Date().toISOString() }]; return s; }); }
    catch (x) { flash(x.message); }
    setBusy(false);
  }
  return <div className="fade-in">
    {thisWeek ? <div className="card" style={{ borderTop: '8px solid var(--orange)' }}><div className="label">Cek-in minggu {week}</div><p style={{ lineHeight: 1.6 }}>{thisWeek.feedback}</p><b>Untuk minggu depan:</b><ul>{thisWeek.nextWeek.map(t => <li key={t}>{t}</li>)}</ul><p className="small">Aksi ini otomatis masuk ke Peta 90 minggu {Math.min(12, week + 1)}.</p></div>
      : <div className="card">
        <div className="label">Cek-in minggu {week}</div><p className="small" style={{ marginTop: -4 }}>Fokus fase ini: {ph.fokus}</p>
        <div className="field"><label>Apa yang sudah kamu kerjakan minggu ini?</label><textarea value={a.done} onChange={e => setA({ ...a, done: e.target.value })} /></div>
        <div className="field"><label>Apa yang menghambat?</label><textarea value={a.hambatan} onChange={e => setA({ ...a, hambatan: e.target.value })} /></div>
        <div className="field"><label>Energimu minggu ini (1 sampai 5)</label><div className="answers" style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>{['1', '2', '3', '4', '5'].map(v => <button key={v} className={`answer ${a.energi === v ? 'on' : ''}`} style={{ justifyContent: 'center' }} onClick={() => setA({ ...a, energi: v })}><b style={{ width: 'auto' }}>{v}</b></button>)}</div></div>
        <button className="btn btn-primary btn-block" disabled={busy} onClick={submit}>{busy ? 'Membaca progresmu...' : 'Kirim cek-in'}</button>
      </div>}
    {(state.cekin || []).filter(c => c.week !== week).sort((x, y) => y.week - x.week).map(c => <details key={c.week}><summary>Minggu {c.week}</summary><p>{c.feedback}</p></details>)}
  </div>;
}
