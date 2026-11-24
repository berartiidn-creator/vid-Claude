import { useEffect } from 'react';
import Radar from '../components/Radar.jsx';
import { ARCHETYPES, DIM_ORDER, DIMS } from '../../shared/index-model.js';
import { CONFIG } from '../config.js';
import { track } from '../lib/api.js';

const SAMPLE = { BA: 62, ED: 55, RA: 84, AV: 70, RM: 58, TI: 66 };
const FREE = ['Archetype kamu', 'Skor BERARTI Index dan 6 dimensi', 'Radar 6 dimensi', 'Sumber percaya dirimu', 'Pemicu ragumu', '1 langkah untuk minggu ini', 'Kartu hasil untuk Instagram Story'];
const SIG = ['Pola khasmu', 'Titik butamu', 'Cara pikir yang perlu digeser', 'Sumber pede yang belum kamu pakai', 'Langkah 7 hari pertama'];
const A90 = ['Aplikasi Arah90: Gali, refleksi dengan pertanyaan lanjutan dari AI', 'Kanvas, Life Design Canvas yang terisi dari jawabanmu', 'Peta 90 Hari, rencana 12 minggu yang bisa dicentang', 'Cek-in mingguan, rencana menyesuaikan progresmu'];
const FAQ = [
  ['Berapa lama tesnya?', 'Sekitar 6 menit untuk 36 pertanyaan.'],
  ['Apakah gratis?', 'Tes dan hasil dasarnya gratis. Laporan berbayar opsional: BERARTI Signature Rp49.000, atau Signature + Arah90 Rp99.000. Kamu memutuskan setelah melihat hasilmu.'],
  ['Apa bedanya Signature dan Signature + Arah90?', 'Signature menjelaskan pola khas dan titik butamu. Signature + Arah90 menambahkan aplikasi Arah90 untuk mengubah hasil itu jadi langkah nyata selama 12 minggu.'],
  ['Sudah beli Signature, bisa upgrade?', 'Bisa. Dalam 7 hari setelah membeli, tambah Rp50.000 untuk membuka Arah90. Pakai email yang sama saat membayar.'],
  ['Apakah ini tes psikologi?', 'Bukan. Ini tes refleksi diri untuk mengenal pola arah hidupmu, bukan diagnosis.'],
  ['Data saya dipakai untuk apa?', 'Untuk mengirim hasilmu dan info dari BERARTI. Kamu bisa minta berhenti atau minta datamu dihapus kapan saja lewat WhatsApp atau dengan membalas email kami.'],
  ['Apakah hasil bisa berubah?', 'Bisa. Hasilnya menggambarkan kondisimu sekarang. Coba lagi setelah 90 hari.'],
  ['Bagaimana kalau saya sedang sangat terpuruk?', `Tes ini bukan pengganti bantuan profesional. Kalau kamu merasa tidak aman, hubungi orang yang kamu percaya atau layanan darurat: ${CONFIG.LAYANAN_DARURAT}.`],
];
function Feat({ yes, no = [] }) { return <ul className="feat">{yes.map(t => <li key={t} className="y">{t}</li>)}{no.map(t => <li key={t} className="n">{t}</li>)}</ul>; }

export default function Landing({ go }) {
  useEffect(() => track('view', 'landing'), []);
  const start = () => go('/tes');
  return <>
    <section className="hero"><div className="wrap">
      <div className="fade-in">
        <div className="label">Tes refleksi diri gratis</div>
        <h1 className="h1">Temukan arah yang <span className="key">berarti</span></h1>
        <p className="lead" style={{ maxWidth: 520, margin: '20px 0 26px' }}>36 pertanyaan, sekitar 6 menit. Lihat archetype, skor 6 dimensi, dan sumber percaya dirimu.</p>
        <button className="btn btn-primary" onClick={start}>Mulai Tes Gratis</button>
        <p className="small" style={{ marginTop: 14 }}>Gratis, tanpa kartu kredit. Hasil langsung tampil.</p>
      </div>
      <div className="hero-art"><div className="circle" /><div className="card sample">
        <span className="badge">CONTOH HASIL</span>
        <div className="h3" style={{ margin: '10px 0 4px' }}>{ARCHETYPES.RA.name}</div>
        <Radar scores={SAMPLE} size={240} />
      </div></div>
    </div></section>

    <section style={{ paddingTop: 10 }}><div className="wrap grid grid-3">
      {[['01', 'Kenali dirimu', 'Lihat pola yang selama ini menggerakkan pilihanmu.'], ['02', 'Lihat arahmu', 'Tahu dimensi mana yang menguatkan, mana yang menahan.'], ['03', 'Mulai langkahmu', 'Dapat satu langkah kecil yang bisa langsung dicoba.']].map(([n, t, d]) =>
        <div className="card" key={n}><div className="num">{n}</div><h3 className="h3" style={{ fontSize: 22, margin: '10px 0 6px' }}>{t}</h3><p style={{ margin: 0, lineHeight: 1.55 }}>{d}</p></div>)}
    </div></section>

    <section><div className="wrap">
      <div className="label">6 archetype</div>
      <h2 className="h2" style={{ marginBottom: 26 }}>Kamu yang <span className="key">mana?</span></h2>
      <div className="scroller">{DIM_ORDER.map(d => <div className="card arch" key={d}>
        <h4>{ARCHETYPES[d].name}</h4><p className="small" style={{ marginTop: -4 }}>Terkuat di {DIMS.find(x => x.id === d).name}</p>
        <p style={{ lineHeight: 1.55 }}>{ARCHETYPES[d].strong}</p><p style={{ lineHeight: 1.55, color: '#5A5E57' }}>{ARCHETYPES[d].grow}</p>
      </div>)}</div>
    </div></section>

    <section id="paket"><div className="wrap">
      <div className="label">Pilih yang kamu butuhkan</div>
      <h2 className="h2" style={{ marginBottom: 30 }}>Tes dulu, <span className="key">bayar nanti</span></h2>
      <div className="grid grid-3">
        <div className="card price"><div className="h3" style={{ fontSize: 20 }}>BERARTI Index</div><div className="amount">Rp0</div><p style={{ margin: 0 }}>Kenali pola arahmu.</p><Feat yes={FREE} no={['Laporan lengkap', 'Aplikasi Arah90']} /><button className="btn btn-ghost btn-block" onClick={start}>Mulai Tes Gratis</button></div>
        <div className="card price"><div className="h3" style={{ fontSize: 20 }}>BERARTI Signature</div><div className="amount">Rp49.000</div><p style={{ margin: 0 }}>Pahami pola khasmu.</p><Feat yes={['Semua isi Index', ...SIG, ...(CONFIG.ADA_EBOOK ? ['Ebook BERARTI'] : [])]} no={['Aplikasi Arah90']} /><button className="btn btn-ghost btn-block" onClick={start}>Mulai Tes Dulu</button></div>
        <div className="card price rec"><span className="ribbon">REKOMENDASI</span><div className="h3" style={{ fontSize: 20 }}>Signature + Arah90</div><div className="amount">Rp99.000</div><p style={{ margin: 0 }}>Ubah hasil jadi langkah 90 hari.</p><Feat yes={['Semua isi Signature', ...A90]} /><button className="btn btn-primary btn-block" onClick={start}>Mulai Tes Dulu</button></div>
      </div>
      <p className="small" style={{ marginTop: 18, textAlign: 'center' }}>Kerjakan tesnya dulu. Bayar hanya kalau kamu ingin membuka laporan setelah melihat hasilmu.</p>
    </div></section>

    <section><div className="wrap">
      <div className="label">Cara kerjanya</div>
      <h2 className="h2" style={{ marginBottom: 26 }}>Empat <span className="key">langkah</span></h2>
      <div className="grid grid-4">{[['01', 'Jawab 36 pertanyaan', 'Satu per layar, sekitar 6 menit.'], ['02', 'Isi nama dan email', 'Supaya salinan hasilmu terkirim.'], ['03', 'Lihat hasil gratismu', 'Archetype, skor, dan langkah pertama.'], ['04', 'Pilih paket kalau perlu', 'Untuk laporan lengkap atau rencana 90 hari.']].map(([n, t, d]) =>
        <div className="card" key={n}><div className="num">{n}</div><h3 className="h3" style={{ fontSize: 19, margin: '10px 0 6px' }}>{t}</h3><p className="small" style={{ margin: 0, fontSize: 14 }}>{d}</p></div>)}</div>
    </div></section>

    <section><div className="wrap grid grid-2" style={{ alignItems: 'center' }}>
      <div style={{ aspectRatio: '4/5', maxWidth: 380, background: '#E6DBCF', borderRadius: 26, display: 'grid', placeItems: 'center', color: '#8E857A', fontWeight: 600 }}>Foto Firas</div>
      <div><div className="label">Di balik tes ini</div><h2 className="h2" style={{ marginBottom: 18 }}>Disusun untuk yang <span className="key">masih bingung</span></h2>
        <p className="lead">Tes ini disusun oleh Firas Byzi untuk membantu kamu mengenal diri, menyaring arah, dan mulai melangkah.</p>
        <p className="lead">Ini tes refleksi diri, bukan tes psikologi klinis dan bukan diagnosis.</p></div>
    </div></section>

    {CONFIG.SHOW_TESTIMONIALS && CONFIG.TESTIMONIALS.length > 0 && <section><div className="wrap grid grid-3">{CONFIG.TESTIMONIALS.map((t, i) => <div className="card" key={i}><p>"{t.text}"</p><b>{t.name}</b></div>)}</div></section>}

    <section><div className="narrow">
      <div className="label">FAQ</div><h2 className="h2" style={{ marginBottom: 24 }}>Yang sering <span className="key">ditanya</span></h2>
      {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
      <div style={{ textAlign: 'center', marginTop: 34 }}><button className="btn btn-primary" onClick={start}>Mulai Tes Gratis</button></div>
    </div></section>
  </>;
}
