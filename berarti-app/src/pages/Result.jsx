import { useEffect, useState } from 'react';
import * as M from '../../shared/index-model.js';
import Radar from '../components/Radar.jsx';
import { Toast } from '../components/Chrome.jsx';
import { storyBlob } from '../components/StoryCard.js';
import { CONFIG } from '../config.js';
import { api, track, ls } from '../lib/api.js';

const LOCKED_TITLES = ['Pola khasmu', 'Titik butamu', 'Cara pikir yang perlu digeser', 'Sumber pede yang belum kamu pakai', 'Langkah 7 hari pertama', 'Aplikasi Arah90'];

export default function Result({ go }) {
  const q = new URLSearchParams(location.search), last = ls.get('brt_last', {});
  const sParam = q.get('s') || last.s, r = q.get('r') || (last.s === sParam ? last.r : '');
  const scores = M.decodeScores(sParam);
  const [toast, setToast] = useState(''), [story, setStory] = useState(null);
  const [code, setCode] = useState(q.get('k') || ls.get('brt_code', '') || ''), [paid, setPaid] = useState(null), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const flash = t => { setToast(t); setTimeout(() => setToast(''), 2600); };

  async function redeem(c = code, silent = false) {
    if (!c.trim()) return; setBusy(true); setErr('');
    try { const j = await api('redeem', { code: c.trim(), s: sParam, r }); setPaid(j); ls.set('brt_code', j.code); track('redeem', j.tier); }
    catch (x) { if (!silent) setErr(x.message); }
    setBusy(false);
  }
  useEffect(() => { track('result'); if (code) redeem(code, true); }, []);
  if (!scores) return <div className="narrow screen"><h1 className="h2">Hasil belum <span className="key">ditemukan</span></h1><p className="lead">Buka link hasil dari emailmu, atau kerjakan tesnya dulu.</p><button className="btn btn-primary" onClick={() => go('/tes')}>Mulai Tes Gratis</button></div>;

  const top = M.strongest(scores), low = M.weakest(scores), A = M.ARCHETYPES[top], tot = M.total(scores);
  const scoreText = `${A.name}. BERARTI Index ${tot}. ` + M.DIMS.map(d => `${d.name} ${scores[d.id]}`).join(', ');
  async function makeStory() { track('story'); const b = await storyBlob(scores); const url = URL.createObjectURL(b); setStory({ url, blob: b }); }
  async function shareStory() {
    const f = new File([story.blob], 'berarti-index.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [f] })) { try { await navigator.share({ files: [f], title: 'BERARTI Index' }); } catch {} }
    else { const a = document.createElement('a'); a.href = story.url; a.download = 'berarti-index.png'; a.click(); }
  }
  const pay = (link, tier) => { track('pay_click', tier); window.open(link, '_blank', 'noopener'); };

  return <div>
    <div className="result-hero"><div className="circle" /><div className="inner narrow">
      <div className="label" style={{ justifyContent: 'center', position: 'relative' }}>Archetype kamu</div>
      <div className="arch-name">{A.name}</div>
    </div></div>
    <div className="narrow" style={{ display: 'grid', gap: 18, paddingBottom: 60 }}>
      {last.note && last.s === sParam && <div className="card small" style={{ background: '#FFF4EC' }}>Catatan: {last.note} Simpan link halaman ini supaya hasilmu tidak hilang.</div>}
      <div className="card"><p className="lead" style={{ marginTop: 0 }}><b>{A.strong}</b></p><p className="lead" style={{ marginBottom: 0 }}>{A.grow}</p></div>
      {M.allLow(scores) && <div className="card support">{M.LOW_SUPPORT}</div>}
      {scores.RM < 25 && <div className="card support">{M.MEANING_SUPPORT} <span className="small">Layanan darurat: {CONFIG.LAYANAN_DARURAT}.</span></div>}

      <div className="card" style={{ textAlign: 'center' }}>
        <div className="small">Skor BERARTI Index</div><div className="score-big">{tot}</div><span className="tag">{M.band(tot)}</span>
        <div style={{ margin: '18px auto 0' }}><Radar scores={scores} size={320} /></div>
        <div style={{ textAlign: 'left', marginTop: 10 }}>{M.DIMS.map(d => <div className="dimrow" key={d.id}><span>{d.name}</span><span><span className="tag">{M.band(scores[d.id])}</span> <b>{scores[d.id]}</b></span><div className="bar"><div style={{ width: scores[d.id] + '%', background: d.id === top ? 'var(--orange)' : 'var(--green2)' }} /></div></div>)}</div>
        <p className="small" style={{ textAlign: 'left' }}>Angka ini perkiraan dari 6 pernyataan per dimensi. Lihat sebagai rentang (rendah, sedang, tinggi), bukan nilai pasti.</p>
      </div>

      <div className="card"><div className="label">Sumber percaya dirimu</div><p className="lead" style={{ margin: 0 }}>{M.SUMBER_PEDE[top]}</p></div>
      <div className="card"><div className="label">Pemicu ragumu</div><p className="lead" style={{ margin: 0 }}>{M.PEMICU_RAGU[low]}</p></div>
      <div className="card" style={{ borderTop: '8px solid var(--orange)' }}><div className="label">1 langkah minggu ini</div><p className="lead" style={{ margin: 0 }}>{M.LANGKAH_MINGGU_INI[low]}</p></div>

      <div className="grid grid-2 no-print">
        <button className="btn btn-dark" onClick={makeStory}>Buat kartu Story</button>
        <button className="btn btn-ghost" onClick={() => { navigator.clipboard?.writeText(scoreText).then(() => flash('Skor tersalin')).catch(() => flash('Gagal menyalin')); }}>Salin skorku</button>
      </div>
      {story && <div className="card no-print" style={{ textAlign: 'center' }}>
        <img src={story.url} alt="Kartu Story BERARTI Index" style={{ width: '70%', borderRadius: 16, boxShadow: 'var(--shadow)' }} />
        <p className="small">Kalau tombol di bawah tidak menyimpan otomatis, tekan lama gambar di atas lalu pilih Simpan.</p>
        <button className="btn btn-primary" onClick={shareStory}>Bagikan atau simpan</button>
      </div>}

      {paid ? <Report paid={paid} scores={scores} go={go} />
        : <div className="card no-print" style={{ border: '3px solid var(--floor)' }}>
          <div className="label">Laporan lengkapmu</div>
          <h2 className="h3" style={{ marginBottom: 14 }}>Buka <span className="key">laporan lengkapmu</span></h2>
          <p style={{ marginTop: 0 }}>Pola khas, titik buta, dan rencana yang disusun dari jawabanmu sendiri.</p>
          <div className="locked" style={{ margin: '14px 0 20px' }}><div className="blur">{LOCKED_TITLES.map(t => <p key={t}><b>{t}</b><br />Bagian ini disusun dari kombinasi skormu dan archetype {A.name.toLowerCase()}...</p>)}</div><div className="lock">🔒</div></div>
          <div className="grid" style={{ gap: 14 }}>
            <div className="card price rec" style={{ boxShadow: 'none' }}><span className="ribbon">REKOMENDASI</span><b>BERARTI Signature + Arah90</b><div className="amount" style={{ fontSize: 28 }}>Rp99.000</div><span className="small">Laporan lengkap dan aplikasi Arah90 selama 12 minggu.</span><button className="btn btn-primary btn-block" onClick={() => pay(CONFIG.LINK_ARAH90, 'arah90')}>Ambil Signature + Arah90 Rp99rb</button></div>
            <div className="card price" style={{ boxShadow: 'none', border: '2px solid var(--line)' }}><b>BERARTI Signature</b><div className="amount" style={{ fontSize: 28 }}>Rp49.000</div><span className="small">Laporan lengkap tanpa aplikasi Arah90.</span><button className="btn btn-ghost btn-block" onClick={() => pay(CONFIG.LINK_SIGNATURE, 'signature')}>Ambil Signature Rp49rb</button></div>
          </div>
          <p className="small">Pakai email yang sama dengan yang kamu isi tadi saat membayar, supaya laporanmu langsung tersambung dengan skormu.</p>
          <div className="field" style={{ marginTop: 18 }}><label htmlFor="code">Sudah bayar? Masukkan kode akses dari email</label><input id="code" placeholder="BRT-XXXX-XXXX" value={code} onChange={e => setCode(e.target.value)} /></div>
          {err && <p className="err">{err}</p>}
          <button className="btn btn-dark btn-block" disabled={busy} onClick={() => redeem()}>{busy ? 'Mengecek...' : 'Buka'}</button>
        </div>}

      <div className="grid grid-2 no-print">
        <a className="btn btn-ghost" href={`https://wa.me/${CONFIG.NOMOR_WA}?text=${encodeURIComponent('Halo BERARTI, ini hasilku: ' + scoreText)}`} target="_blank" rel="noreferrer">Kirim hasilku ke WhatsApp</a>
        <button className="btn btn-ghost" onClick={() => go('/tes')}>Ulangi tes</button>
      </div>
    </div>
    <Toast text={toast} />
  </div>;
}

function Report({ paid, scores, go }) {
  const R = paid.report, key = 'brt_7d_' + paid.code;
  const [done, setDone] = useState(ls.get(key, []));
  const toggle = i => { const n = done.includes(i) ? done.filter(x => x !== i) : [...done, i]; setDone(n); ls.set(key, n); };
  const daysLeft = paid.upgradeUntil ? Math.ceil((new Date(paid.upgradeUntil) - Date.now()) / 864e5) : 0;
  return <div className="card report">
    <div className="label">{paid.tier === 'arah90' ? 'BERARTI Signature + Arah90' : 'BERARTI Signature'}</div>
    <h2 className="h3" style={{ marginBottom: 18, fontSize: 28 }}>Laporan {R.archetype}</h2>
    <h3>Pola khasmu</h3>{R.pola.map((t, i) => <p key={i}>{t}</p>)}
    <h3>Titik butamu</h3>{R.titikButa.map((t, i) => <p key={i}>{t}</p>)}
    <h3>Cara pikir yang perlu digeser</h3>{R.caraPikir.map(([a, b], i) => <div className="shift" key={i}><span>Dari: {a}</span><span><b>Ke:</b> {b}</span></div>)}
    <h3 style={{ marginTop: 20 }}>Sumber pede yang belum kamu pakai</h3><p>{R.pedeBelumDipakai}</p>
    {R.faith && <p style={{ background: '#EEF3EE', padding: 14, borderRadius: 14 }}>{R.faith}</p>}
    <h3>Langkah 7 hari pertama</h3>
    {R.tujuhHari.map((t, i) => <label key={i} className={`todo ${done.includes(i) ? 'done' : ''}`}><input type="checkbox" checked={done.includes(i)} onChange={() => toggle(i)} /><span><b>Hari {i + 1}.</b> {t}</span></label>)}
    {paid.tier === 'arah90' ? <div style={{ marginTop: 24 }}>
      <h3>Peta 90 Hari</h3>
      {R.peta90.map((f, i) => <div key={i} style={{ marginBottom: 14 }}><b>Hari {i * 30 + 1} sampai {i * 30 + 30}: {f.fokus}</b><ul>{f.aksi.map(a => <li key={a}>{a}</li>)}</ul></div>)}
      <button className="btn btn-primary btn-block no-print" onClick={() => go(`/arah90?k=${paid.code}`)}>Buka aplikasi Arah90</button>
    </div> : <div className="card no-print" style={{ marginTop: 24, background: '#FFF4EC', boxShadow: 'none' }}>
      <div className="label">Tinggal satu langkah lagi</div>
      <p style={{ marginTop: 0 }}>Laporanmu sudah terbuka. Tambah Rp50.000 untuk membuka aplikasi Arah90: Gali, Kanvas, Peta 90 Hari, dan cek-in mingguan.</p>
      {daysLeft > 0 ? <><button className="btn btn-primary btn-block" onClick={() => { track('pay_click', 'upgrade'); window.open(CONFIG.LINK_UPGRADE, '_blank', 'noopener'); }}>Upgrade ke Arah90 Rp50rb</button><p className="small">Sisa {daysLeft} hari. Pakai email yang sama saat membayar, lalu buka lagi halaman ini.</p></>
        : <button className="btn btn-primary btn-block" onClick={() => window.open(CONFIG.LINK_ARAH90, '_blank', 'noopener')}>Ambil Arah90</button>}
    </div>}
    <button className="btn btn-ghost btn-block no-print" style={{ marginTop: 16 }} onClick={() => print()}>Cetak atau simpan PDF</button>
  </div>;
}
