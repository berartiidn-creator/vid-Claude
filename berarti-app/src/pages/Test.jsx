import { useEffect, useMemo, useState } from 'react';
import { QUESTIONS, SCALE, REFLECTION, questionOrder, scoreAnswers, strongest, ARCHETYPES, encodeScores } from '../../shared/index-model.js';
import { api, track, ls, utm } from '../lib/api.js';

const KEY = 'brt_test_v2';
export default function Test({ go }) {
  const order = useMemo(questionOrder, []);
  const saved = ls.get(KEY, {});
  const [answers, setAnswers] = useState(saved.answers || {});
  const [i, setI] = useState(saved.i || 0);
  const [stage, setStage] = useState(saved.stage || 'intro');      // intro | q | reflect | form
  const [reflection, setReflection] = useState(saved.reflection || '');
  const [form, setForm] = useState({ name: '', email: '', wa: '', consent: false });
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  useEffect(() => ls.set(KEY, { answers, i, stage, reflection }), [answers, i, stage, reflection]);

  const q = QUESTIONS.find(x => x.id === order[i]);
  const pick = (v) => {
    const next = { ...answers, [q.id]: v }; setAnswers(next);
    if (i === 11) track('q12'); if (i === 23) track('q24');
    setTimeout(() => { if (i < order.length - 1) setI(i + 1); else { track('finish'); setStage('reflect'); } }, 170);
  };
  const scores = stage === 'form' ? scoreAnswers(answers) : null;

  async function submit(e) {
    e.preventDefault(); setErr('');
    if (!form.name.trim()) return setErr('Isi nama dulu, ya.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) return setErr('Format email belum benar.');
    if (form.wa && !/^62\d{8,13}$/.test(form.wa.replace(/\D/g, ''))) return setErr('Nomor WhatsApp diawali 62, contoh 6281234567890. Boleh dikosongkan.');
    if (!form.consent) return setErr('Centang persetujuan dulu supaya hasilmu bisa dikirim.');
    setBusy(true); track('form');
    const s = encodeScores(scores);
    let note = '';
    try { await api('lead', { s, name: form.name.trim(), email: form.email.trim(), wa: form.wa.replace(/\D/g, ''), consent: true, reflection, utm }); }
    catch (x) { note = x.message; }
    ls.set('brt_last', { s, r: reflection, name: form.name.trim(), note }); ls.del(KEY);
    go(`/hasil?s=${s}${reflection === 'ya' ? '&r=ya' : ''}`);
  }

  if (stage === 'intro') return <div className="narrow screen fade-in">
    <div className="label">BERARTI Index</div>
    <h1 className="h2">Siap kenali <span className="key">arahmu?</span></h1>
    <div className="card" style={{ margin: '24px 0', display: 'grid', gap: 12 }}>
      <div><b>36 pertanyaan</b>, sekitar <b>6 menit</b>.</div>
      <div>Hasil: archetype, skor 6 dimensi, dan langkah pertama.</div>
      <div>Di akhir tes kamu mengisi nama dan email supaya salinan hasilnya bisa dikirim. WhatsApp boleh dikosongkan.</div>
      <div className="small">Skala jawaban: 1 Sangat tidak setuju sampai 5 Sangat setuju. Tidak ada jawaban benar atau salah, jawab sesuai kondisimu sekarang.</div>
    </div>
    <button className="btn btn-primary btn-block" onClick={() => { track('start'); setStage('q'); }}>{Object.keys(answers).length ? 'Lanjutkan' : 'Mulai'}</button>
  </div>;

  if (stage === 'q') return <div className="narrow screen" key={i}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
      <span>Pertanyaan {i + 1} dari {order.length}</span><span>{Math.round((i / order.length) * 100)}%</span>
    </div>
    <div className="bar"><div style={{ width: `${(i / order.length) * 100}%` }} /></div>
    <p className="qtext fade-in">{q.q}</p>
    <div className="answers">{SCALE.map((t, k) => <button key={k} className={`answer ${answers[q.id] === k + 1 ? 'on' : ''}`} onClick={() => pick(k + 1)}><b>{k + 1}</b>{t}</button>)}</div>
    <button className="btn" style={{ marginTop: 18, background: 'transparent', color: 'var(--muted)' }} disabled={i === 0} onClick={() => setI(i - 1)}>← Kembali</button>
  </div>;

  if (stage === 'reflect') return <div className="narrow screen fade-in">
    <div className="label">Satu refleksi, tidak dinilai</div>
    <p className="qtext" style={{ minHeight: 0 }}>{REFLECTION}</p>
    <p className="small" style={{ marginTop: -10, marginBottom: 20 }}>Pertanyaan ini tidak memengaruhi skormu. Kalau kamu jawab ya, laporan berbayar akan menyertakan pengingat niat.</p>
    <div className="answers">
      {[['ya', 'Ya'], ['tidak', 'Tidak']].map(([v, t]) => <button key={v} className={`answer ${reflection === v ? 'on' : ''}`} onClick={() => { setReflection(v); setStage('form'); }}>{t}</button>)}
      <button className="answer" onClick={() => { setReflection(''); setStage('form'); }}>Lewati</button>
    </div>
  </div>;

  const top = strongest(scores);
  return <div className="narrow screen fade-in">
    <div className="label">Hasilmu sudah siap</div>
    <div className="card" style={{ textAlign: 'center', borderTop: '8px solid var(--orange)', marginBottom: 22 }}>
      <div className="small">Archetype kamu</div>
      <div className="h2" style={{ margin: '8px 0' }}>{ARCHETYPES[top].name}</div>
      <p style={{ margin: 0 }}>{ARCHETYPES[top].strong}</p>
    </div>
    <p style={{ fontWeight: 600 }}>Isi nama dan email untuk membuka skor 6 dimensi, radar, sumber percaya diri, dan langkah pertamamu. Salinan hasilnya juga dikirim ke emailmu.</p>
    <form onSubmit={submit} noValidate>
      <div className="field"><label htmlFor="n">Nama</label><input id="n" autoComplete="given-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
      <div className="field"><label htmlFor="e">Email</label><input id="e" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
      <div className="field"><label htmlFor="w">WhatsApp (opsional)</label><input id="w" inputMode="numeric" placeholder="6281234567890" value={form.wa} onChange={e => setForm({ ...form, wa: e.target.value })} /></div>
      <label className="check"><input type="checkbox" checked={form.consent} onChange={e => setForm({ ...form, consent: e.target.checked })} />
        <span>Saya setuju data saya disimpan untuk mengirim hasil dan info dari BERARTI. Saya bisa berhenti atau minta data dihapus kapan saja. <a href="/privasi" target="_blank">Kebijakan privasi</a>.</span></label>
      {err && <p className="err">{err}</p>}
      <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} disabled={busy}>{busy ? 'Menyiapkan hasil...' : 'Lihat Hasilku'}</button>
      <p className="small" style={{ textAlign: 'center' }}>Email hanya dipakai untuk mengirim hasilmu dan info BERARTI. Tidak dijual ke siapa pun.</p>
    </form>
  </div>;
}
