import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, CheckCircle2, Play, ChevronDown, ShieldCheck, 
  Target, Compass, Zap, Scale, Heart, Globe, ArrowDown,
  BookOpen, Edit3, Map, Layout, FileText, Check, Star,
  Menu, X, Quote, ArrowRightCircle, ChevronLeft, CreditCard, Mail, User, Phone,
  Users, Copy, Download, MessageCircle, LifeBuoy, RotateCcw
} from 'lucide-react';

// ===== KONSTANTA (ganti sebelum online) =====
const LINK_PEMBAYARAN = "{{LINK_PEMBAYARAN_ARAH90}}";
const NOMOR_WA = "{{NOMOR_WA_FORMAT_62}}"; // contoh format: 6281234567890
const NOMOR_LAYANAN_DARURAT = "{{NOMOR_LAYANAN_DARURAT}}";
const LINK_INSTAGRAM = "https://instagram.com/firasbyzi";
const SHOW_TESTIMONIALS = false; // nyalakan hanya kalau testimoni sudah asli dan disetujui
const STORAGE_KEY = "berarti_index_hasil_v1";

// Penjelasan per dimensi untuk halaman hasil (pintu masuk: percaya diri)
const SUMBER_PEDE = {
  BA: "Kamu cukup kenal dirimu. Itu dasar pede yang gak gampang goyah.",
  ED: "Kamu punya gambaran arah. Orang yang tahu tujuannya lebih tenang saat ragu datang.",
  RA: "Kamu berani mulai. Pede tumbuh dari langkah, dan modal itu sudah kamu punya.",
  AV: "Kamu pegang nilai yang jelas. Itu bikin kamu gak gampang terseret pendapat orang.",
  RM: "Kamu tahu apa yang bikin hidup terasa berarti. Alasan yang kuat bikin kamu bertahan.",
  TI: "Kamu ingin hidupmu bermanfaat. Niat itu bisa jadi bahan bakar pede yang sehat."
};
const PEMICU_RAGU = {
  BA: "Kamu belum yakin apa kekuatanmu, jadi gampang membandingkan diri dengan orang lain.",
  ED: "Arahmu belum jelas, jadi setiap pilihan terasa berisiko.",
  RA: "Kamu sering menunda mulai. Ragu biasanya mengecil setelah langkah pertama, bukan sebelumnya.",
  AV: "Pilihanmu masih banyak dipengaruhi ekspektasi orang, jadi pede ikut naik turun mengikuti penilaian mereka.",
  RM: "Kamu belum menemukan alasan yang bikin semua ini layak, jadi semangat cepat habis.",
  TI: "Kamu belum melihat dampak dirimu untuk orang lain, padahal itu sering jadi sumber pede yang paling tahan lama."
};

const bukaPembayaran = () => {
  if (typeof window !== 'undefined') window.open(LINK_PEMBAYARAN, '_blank', 'noopener');
};
const simpanHasil = (data) => {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* abaikan */ }
};
const ambilHasil = () => {
  try { const raw = window.localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
};
const pilarTertinggi = (norm) => Object.keys(norm).reduce((a, b) => (norm[b] > norm[a] ? b : a));
// Pilar terendah tidak boleh sama dengan pilar tertinggi (kasus skor seri)
const pilarTerendah = (norm) => {
  const kuat = pilarTertinggi(norm);
  return Object.keys(norm).filter(k => k !== kuat).reduce((a, b) => (norm[b] < norm[a] ? b : a));
};
const kodeHasil = (norm) => ['BA', 'ED', 'RA', 'AV', 'RM', 'TI'].map(k => `${k}${norm[k]}`).join('-');
const perluDukungan = (r) => r && (r.archetype.id === 'Lost Wanderer' || (r.norm.RM < 35 && r.norm.ED < 35));
const muatHtml2Canvas = () => new Promise((resolve, reject) => {
  if (window.html2canvas) return resolve(window.html2canvas);
  const el = document.createElement('script');
  el.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
  el.onload = () => resolve(window.html2canvas);
  el.onerror = reject;
  document.head.appendChild(el);
});

const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  
  body {
    font-family: 'Inter', sans-serif;
    color: #1F2937;
    background-color: #FFFFFF;
    -webkit-font-smoothing: antialiased;
    scroll-behavior: smooth;
  }

  .fade-in-up {
    animation: fadeInUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
    transform: translateY(30px);
  }

  @keyframes fadeInUp {
    to { opacity: 1; transform: translateY(0); }
  }

  .blob-animate {
    animation: blob 10s infinite alternate;
  }

  @keyframes blob {
    0% { transform: scale(1) translate(0, 0); }
    100% { transform: scale(1.1) translate(20px, -20px); }
  }
    
  .glass-effect {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.5);
  }
`;

const FAQS = [
  { q: "Apakah ini cocok untuk mahasiswa?", a: "Sangat cocok. Fase mahasiswa (18-22 tahun) adalah waktu terbaik untuk memetakan arah hidup agar Kamu tidak salah langkah saat lulus nanti dan menghindari quarter-life crisis yang parah." },
  { q: "Apakah ini cocok untuk fresh graduate?", a: "Tentu. Jika Kamu bingung memilih jalur karir, merasa kalah saing, atau overthinking tentang masa depan, framework ini akan membantu Kamu menemukan 'Unique Value' Kamu." },
  { q: "Apakah saya harus sudah tahu passion saya?", a: "Tidak. Justru BERARTI Arah90 dirancang untuk membantu Kamu menemukan apa yang sebenarnya Kamu pedulikan dan kuasai, membongkar ilusi 'passion' menjadi tindakan konkret." },
  { q: "Apakah ini sekadar ebook motivasi?", a: "Sama sekali bukan. Ini adalah framework praktis berbasis psikologi dan desain kehidupan (life design). Kami tidak menjual kalimat penyemangat, kami memberikan sistem, matriks, dan kanvas aksi." },
  { q: "Bagaimana cara akses produknya?", a: "Setelah pembayaran berhasil, kamu dapat email berisi ebook dan link salinan workbook Google Sheets milikmu sendiri. Pembeli versi awal dapat upgrade gratis ke aplikasi Arah90 saat rilis." },
  { q: "Apakah BERARTI cocok dengan nilai agama aku?", a: "BERARTI terbuka untuk semua orang. Di dalamnya ada ruang untuk merefleksikan nilai dan iman yang kamu pegang, tanpa memaksakan satu sudut pandang." },
  { q: "Apakah ini diagnosis psikologis?", a: "Bukan. BERARTI Index adalah alat refleksi diri. Kalau kamu sedang merasa sangat berat, bicara dengan psikolog atau psikiater." },
  { q: "Berapa lama waktu yang dibutuhkan untuk menyelesaikannya?", a: "Kamu bisa membaca materi intinya dalam 1-2 jam, namun proses pengerjaan Life Design Canvas dan Roadmap dirancang untuk direnungkan secara mendalam selama 3-7 hari." },
  { q: "Apakah ada grup komunitas atau bimbingan?", a: "Arah90 ini adalah produk self-paced (belajar mandiri). Akses komunitas, workshop, dan mentoring 1-on-1 tersedia di level layanan kami berikutnya (Premium)." },
  { q: "Bagaimana jika saya tidak puas dengan isinya?", a: "Kami memberikan 100% Garansi Kepuasan Uang Kembali dalam 7 hari. Jika Kamu merasa framework ini tidak memberikan kejelasan arah sedikitpun, chat admin kami dan uang Kamu kembali." }
];

// Isi hanya dengan testimoni asli yang sudah disetujui pemiliknya.
const TESTIMONIALS = [];

const DIMENSIONS = [
  { id: 'BA', name: 'Being Aware', title: 'Mengenal Diri', weight: 0.15 },
  { id: 'ED', name: 'Envisioning Direction', title: 'Kejelasan Arah', weight: 0.25 },
  { id: 'RA', name: 'Readiness to Act', title: 'Kesiapan Bertindak', weight: 0.15 },
  { id: 'AV', name: 'Alignment of Values', title: 'Keselarasan Nilai', weight: 0.15 },
  { id: 'RM', name: 'Relevance and Meaning', title: 'Makna Hidup', weight: 0.15 },
  { id: 'TI', name: 'Transcendence and Impact', title: 'Kontribusi', weight: 0.15 }
];

const QUESTIONS = [
  // BA
  { id: 1, dim: 'BA', r: false, q: "Saya mengetahui kemampuan yang paling menonjol dalam diri saya." },
  { id: 2, dim: 'BA', r: false, q: "Saya tahu aktivitas yang membuat saya bersemangat." },
  { id: 3, dim: 'BA', r: false, q: "Saya memahami situasi yang membuat saya tampil optimal." },
  { id: 4, dim: 'BA', r: false, q: "Saya mengetahui bidang yang paling ingin saya pelajari lebih dalam." },
  { id: 5, dim: 'BA', r: false, q: "Saya mengetahui kelebihan yang sering dilihat orang lain pada diri saya." },
  { id: 6, dim: 'BA', r: false, q: "Saya dapat menjelaskan siapa diri saya dengan cukup jelas." },
  { id: 7, dim: 'BA', r: false, q: "Saya memahami apa yang penting bagi diri saya." },
  { id: 8, dim: 'BA', r: true, q: "Saya sering bingung sebenarnya saya ingin menjadi pribadi seperti apa." },
  { id: 9, dim: 'BA', r: true, q: "Saya merasa identitas diri saya masih berubah-ubah mengikuti lingkungan." },
  { id: 10, dim: 'BA', r: false, q: "Saya merasa mengenal diri saya dengan baik." },
  // ED
  { id: 11, dim: 'ED', r: false, q: "Saya memiliki gambaran hidup yang ingin saya bangun." },
  { id: 12, dim: 'ED', r: false, q: "Saya mengetahui prioritas terbesar dalam hidup saya saat ini." },
  { id: 13, dim: 'ED', r: false, q: "Saya memiliki tujuan jangka panjang yang cukup jelas." },
  { id: 14, dim: 'ED', r: false, q: "Saya memahami alasan mengapa saya mengejar tujuan tersebut." },
  { id: 15, dim: 'ED', r: false, q: "Saya merasa hidup saya bergerak menuju arah yang saya inginkan." },
  { id: 16, dim: 'ED', r: true, q: "Saya sering merasa kehilangan arah hidup." },
  { id: 17, dim: 'ED', r: true, q: "Saya bingung harus fokus pada hal apa dalam beberapa tahun ke depan." },
  { id: 18, dim: 'ED', r: true, q: "Saya merasa masa depan saya masih sangat kabur." },
  { id: 19, dim: 'ED', r: true, q: "Saya sering berubah tujuan karena melihat pencapaian orang lain." },
  { id: 20, dim: 'ED', r: false, q: "Saya mengetahui langkah besar yang perlu saya ambil berikutnya." },
  // RA
  { id: 21, dim: 'RA', r: false, q: "Saya percaya mampu mempelajari hal baru yang dibutuhkan untuk berkembang." },
  { id: 22, dim: 'RA', r: false, q: "Saya yakin bisa menghadapi tantangan yang muncul dalam hidup saya." },
  { id: 23, dim: 'RA', r: false, q: "Saya mampu membuat keputusan penting ketika diperlukan." },
  { id: 24, dim: 'RA', r: false, q: "Saya percaya masa depan saya bisa menjadi lebih baik melalui usaha yang saya lakukan." },
  { id: 25, dim: 'RA', r: false, q: "Saya mampu bangkit kembali setelah mengalami kegagalan." },
  { id: 26, dim: 'RA', r: true, q: "Saya sering menunda karena takut hasilnya tidak sempurna." },
  { id: 27, dim: 'RA', r: true, q: "Saya terlalu banyak berpikir sampai sulit mengambil tindakan." },
  { id: 28, dim: 'RA', r: true, q: "Saya sering meragukan kemampuan diri sendiri." },
  { id: 29, dim: 'RA', r: true, q: "Saya takut mencoba karena khawatir dinilai orang lain." },
  { id: 30, dim: 'RA', r: true, q: "Saya lebih sering menunggu keadaan berubah daripada mengambil langkah terlebih dahulu." },
  // AV
  { id: 31, dim: 'AV', r: false, q: "Saya mengetahui nilai hidup yang paling penting bagi saya." },
  { id: 32, dim: 'AV', r: false, q: "Saya berusaha mengambil keputusan sesuai dengan prinsip yang saya yakini." },
  { id: 33, dim: 'AV', r: false, q: "Saya memiliki alasan yang jelas atas pilihan hidup yang saya ambil." },
  { id: 34, dim: 'AV', r: false, q: "Saya merasa hidup saya cukup sesuai dengan hati nurani saya." },
  { id: 35, dim: 'AV', r: false, q: "Saya mengetahui apa yang benar-benar penting bagi hidup saya." },
  { id: 36, dim: 'AV', r: true, q: "Saya sering menjalani sesuatu hanya karena ekspektasi orang lain." },
  { id: 37, dim: 'AV', r: true, q: "Saya merasa hidup saya terlalu dipengaruhi penilaian orang lain." },
  { id: 38, dim: 'AV', r: true, q: "Saya sering mengikuti jalan hidup orang lain tanpa mempertimbangkan diri saya sendiri." },
  { id: 39, dim: 'AV', r: true, q: "Saya sulit mengatakan tidak pada sesuatu yang bertentangan dengan nilai saya." },
  { id: 40, dim: 'AV', r: true, q: "Saya merasa keputusan besar dalam hidup saya lebih banyak ditentukan orang lain." },
  // RM
  { id: 41, dim: 'RM', r: false, q: "Saya merasa hidup saya memiliki arti yang penting." },
  { id: 42, dim: 'RM', r: false, q: "Saya memahami alasan mengapa saya ingin terus berkembang." },
  { id: 43, dim: 'RM', r: false, q: "Saya merasa kehidupan yang saya jalani memiliki tujuan yang bernilai." },
  { id: 44, dim: 'RM', r: false, q: "Saya merasa apa yang saya lakukan saat ini memiliki makna bagi diri saya." },
  { id: 45, dim: 'RM', r: false, q: "Saya memiliki alasan yang membuat saya tetap bersemangat menjalani hidup." },
  { id: 46, dim: 'RM', r: true, q: "Saya sering merasa hidup saya kosong." },
  { id: 47, dim: 'RM', r: true, q: "Saya merasa hanya menjalani rutinitas tanpa makna yang jelas." },
  { id: 48, dim: 'RM', r: true, q: "Saya sering mempertanyakan apakah hidup saya benar-benar berarti." },
  { id: 49, dim: 'RM', r: true, q: "Saya merasa kehilangan alasan untuk berjuang." },
  { id: 50, dim: 'RM', r: true, q: "Saya merasa apa yang saya lakukan tidak memiliki tujuan yang jelas." },
  // TI
  { id: 51, dim: 'TI', r: false, q: "Saya ingin hidup saya memberi manfaat bagi orang lain." },
  { id: 52, dim: 'TI', r: false, q: "Saya merasa bahagia ketika dapat membantu orang lain berkembang." },
  { id: 53, dim: 'TI', r: false, q: "Saya ingin kemampuan yang saya miliki dapat digunakan untuk hal yang bermanfaat." },
  { id: 54, dim: 'TI', r: false, q: "Saya percaya setiap orang memiliki peran yang bernilai dalam kehidupan." },
  { id: 55, dim: 'TI', r: false, q: "Saya ingin meninggalkan dampak positif melalui hidup saya." },
  { id: 56, dim: 'TI', r: false, q: "Saya percaya hidup bukan hanya tentang kepentingan diri sendiri." },
  { id: 57, dim: 'TI', r: false, q: "Saya merasa ada tujuan yang lebih besar daripada sekadar mencari kenyamanan pribadi." },
  { id: 58, dim: 'TI', r: false, q: "Saya ingin kehidupan saya bernilai di hadapan manusia dan Tuhan." },
  { id: 59, dim: 'TI', r: false, q: "Saya percaya keberhasilan yang paling baik adalah keberhasilan yang membawa manfaat bagi banyak orang." },
  { id: 60, dim: 'TI', r: false, q: "Saya merasa hidup yang baik adalah hidup yang terus bertumbuh dan memberi manfaat." }
];

const ARCHETYPES = [
  { id: "Future Leader", title: "The Future Leader", formula: (s) => s.BA > 80 && s.ED > 80 && s.RA > 80 && s.TI > 75, desc: "Memiliki kesadaran diri paripurna, arah tajam, dan orientasi kebermanfaatan eksponensial." },
  { id: "Aligned Builder", title: "The Aligned Builder", formula: (s) => s.BA > 75 && s.ED > 75 && s.RA > 75 && s.AV > 75 && s.RM > 75 && s.TI > 75, desc: "Mengenal diri dengan baik, punya arah konkret, dan hidup selaras dengan nilai." },
  { id: "Contributor", title: "The Contributor", formula: (s) => s.RM > 75 && s.TI > 75 && s.ED > 65, desc: "Menemukan makna hidup dan telah mulai memberikan dampak nyata bagi lingkungan." },
  { id: "Emerging Builder", title: "The Emerging Builder", formula: (s) => s.ED > 70 && s.RA > 65 && s.BA > 65, desc: "Arah jelas, berani bertindak, sedang dalam fase serius membangun pondasi karir/hidup." },
  { id: "Meaning Seeker", title: "The Meaning Seeker", formula: (s) => s.RM > 75 && s.TI > 70 && s.ED < 65, desc: "Haus akan hidup bermakna, namun belum menemukan jalur implementasi karir yang pas." },
  { id: "Drifting Achiever", title: "The Drifting Achiever", formula: (s) => s.ED > 70 && s.RM < 50 && s.TI < 60, desc: "Terlihat ambisius dan sibuk, namun merasakan kekosongan karena ketidakselarasan makna." },
  { id: "People Pleaser", title: "The People Pleaser", formula: (s) => s.AV < 45 && s.BA > 50, desc: "Arah dan tindakan masih disetir oleh ekspektasi lingkungan, rentan kehilangan jati diri." },
  { id: "Overthinker", title: "The Overthinker", formula: (s) => s.BA > 65 && s.RA < 45 && s.ED >= 45 && s.ED <= 70, desc: "Kesadaran diri baik, tapi terhambat ketakutan dan analisis berlebih (paralysis)." },
  { id: "Explorer", title: "The Explorer", formula: (s) => s.BA > 60 && s.ED >= 50 && s.ED <= 70 && s.RA > 50, desc: "Sedang dalam proses aktif mencari dan meraba arah. Mulai berani mencoba hal baru." },
  { id: "Lost Wanderer", title: "The Lost Wanderer", formula: (s) => s.ED < 45 && s.RM < 45 && s.BA < 60, desc: "Mengalami krisis arah mendalam. Kebingungan identitas dan kehilangan alasan berjuang." },
  { id: "Transitioner", title: "The Transitioner", formula: () => true, desc: "Berada di fase transisi menyeimbangkan berbagai aspek kehidupan. Potensi merata." } 
];

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [showStickyCTA, setShowStickyCTA] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [currentView, setCurrentView] = useState('landing');
  const [assessmentPage, setAssessmentPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [scoreResult, setScoreResult] = useState(null);
  const [hasilTerakhir, setHasilTerakhir] = useState(null);
  const [pesanSalin, setPesanSalin] = useState('');
  const [sedangUnduh, setSedangUnduh] = useState(false);

  useEffect(() => { setHasilTerakhir(ambilHasil()); }, []);

  useEffect(() => {
    // Inject Styles
    const style = document.createElement('style');
    style.innerHTML = customStyles;
    document.head.appendChild(style);

    // Scroll Listener for Sticky CTA
    const handleScroll = () => {
      setShowStickyCTA(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView, assessmentPage]);

  const handleNextAssessment = () => {
    const currentQs = QUESTIONS.slice(assessmentPage * 10, (assessmentPage + 1) * 10);
    const allAnswered = currentQs.every(q => answers[q.id]);
    if (!allAnswered) {
        alert("Mohon jawab semua pertanyaan di halaman ini terlebih dahulu.");
        return;
    }

    if (assessmentPage < 5) {
        setAssessmentPage(p => p + 1);
    } else {
        let raw = { BA:0, ED:0, RA:0, AV:0, RM:0, TI:0 };
        QUESTIONS.forEach(q => {
            let val = answers[q.id];
            if(q.r) val = 6 - val;
            raw[q.dim] += val;
        });
        let norm = {};
        DIMENSIONS.forEach(d => { norm[d.id] = Math.max(0, Math.min(100, Math.round(((raw[d.id] - 10) / 40) * 100))); });
        let total = Math.round( DIMENSIONS.reduce((acc, d) => acc + (norm[d.id] * d.weight), 0) );
        let arch = ARCHETYPES.find(a => a.formula(norm)) || ARCHETYPES[ARCHETYPES.length - 1];

        const hasil = { norm, total, archetype: arch, tanggal: new Date().toISOString() };
        setScoreResult(hasil);
        simpanHasil(hasil);
        setHasilTerakhir(hasil);
        setCurrentView('result');
    }
  };

  return (
    <div className="font-sans text-[#1F2937] bg-white overflow-x-hidden selection:bg-blue-200 selection:text-blue-900">
      

      {}
      {currentView === 'assessment' && (
        <div className="min-h-screen bg-gray-50 pt-10 pb-20 px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <button onClick={() => setCurrentView('landing')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-semibold bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 transition-all">
                <X size={18}/> Batal
              </button>
              <div className="font-black text-xl text-gray-900">BERARTI™ <span className="text-blue-600 text-sm">Index</span></div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 sticky top-4 z-40">
              <div className="flex justify-between text-sm font-bold text-gray-500 mb-4">
                <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider text-xs">Dimensi {assessmentPage + 1} / 6</span>
                <span>{Object.keys(answers).length} / 60 Terjawab</span>
              </div>
              <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-300" style={{width: `${(Object.keys(answers).length / 60) * 100}%`}}></div>
              </div>
            </div>

            <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">{DIMENSIONS[assessmentPage].title}</h2>

            <div className="space-y-6 mb-10">
              {QUESTIONS.slice(assessmentPage * 10, (assessmentPage + 1) * 10).map((q, i) => (
                <div key={q.id} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm fade-in-up" style={{animationDelay: `${i * 50}ms`}}>
                  <p className="font-bold text-gray-800 text-lg mb-6"><span className="text-blue-600 mr-2">{q.id}.</span> {q.q}</p>
                  <div className="flex gap-2 justify-between">
                    {[1, 2, 3, 4, 5].map(v => (
                      <label key={v} className="flex-1 relative cursor-pointer group">
                        <input type="radio" name={`q_${q.id}`} value={v} checked={answers[q.id] === v} onChange={() => setAnswers({...answers, [q.id]: v})} className="peer hidden" />
                        <div className="w-full py-3 md:py-4 flex items-center justify-center rounded-xl border-2 border-gray-100 bg-gray-50 text-gray-400 font-black text-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-white group-hover:border-blue-200 transition-all shadow-sm">
                          {v}
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] md:text-xs font-bold text-gray-400 mt-3 px-1 uppercase tracking-wider">
                    <span>Sangat Tidak Setuju</span>
                    <span>Sangat Setuju</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-200 shadow-sm sticky bottom-4 z-40">
              <button onClick={() => setAssessmentPage(p => p - 1)} disabled={assessmentPage === 0} className="px-6 py-4 font-bold text-gray-500 hover:text-gray-900 disabled:opacity-30 transition flex items-center gap-2">
                <ChevronLeft size={20}/> <span className="hidden md:inline">Kembali</span>
              </button>
              <button onClick={handleNextAssessment} className="bg-[#2563EB] text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-blue-700 transition shadow-lg shadow-blue-600/30">
                {assessmentPage === 5 ? 'Lihat Analisis' : 'Selanjutnya'} <ArrowRight size={20}/>
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {currentView === 'result' && scoreResult && (() => {
        const kuat = pilarTertinggi(scoreResult.norm);
        const lemah = pilarTerendah(scoreResult.norm);
        const namaDim = (id) => DIMENSIONS.find(d => d.id === id).title;
        const namaInggris = (id) => DIMENSIONS.find(d => d.id === id).name;
        const modalRendah = scoreResult.norm[kuat] < 40;
        const kode = kodeHasil(scoreResult.norm);
        const butuhDukungan = perluDukungan(scoreResult);
        const pesanWa = `Halo Firas, hasil BERARTI Index aku: ${scoreResult.archetype.title}, skor ${scoreResult.total}. Kode: ${kode}. Aku mau tahu langkah berikutnya.`;
        const salinKode = async () => {
          try { await navigator.clipboard.writeText(kode); setPesanSalin('Kode tersalin.'); }
          catch (e) { setPesanSalin('Gagal menyalin. Tekan lama kodenya lalu salin manual.'); }
          setTimeout(() => setPesanSalin(''), 2500);
        };
        const unduhKartu = async () => {
          setSedangUnduh(true);
          try {
            const h2c = await muatHtml2Canvas();
            const el = document.getElementById('kartu-hasil');
            const canvas = await h2c(el, { scale: 1, backgroundColor: '#111827', width: 1080, height: 1920 });
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/png');
            a.download = `BERARTI-Index-${scoreResult.archetype.id.replace(/\s+/g, '-')}.png`;
            a.click();
          } catch (e) { alert('Kartu gagal dibuat. Coba lagi, atau screenshot halaman ini.'); }
          setSedangUnduh(false);
        };
        return (
        <div className="min-h-screen bg-gray-50 pt-10 pb-20 px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <button onClick={() => setCurrentView('landing')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-semibold mb-8 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 w-fit transition-all">
              <ChevronLeft size={18}/> Kembali ke Beranda
            </button>

            <div className="bg-white p-6 md:p-12 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 text-center">
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Hasil BERARTI Index kamu</h2>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">{scoreResult.archetype.title}</h1>
              <div className="w-32 h-32 md:w-40 md:h-40 mx-auto bg-[#111827] rounded-full flex flex-col items-center justify-center text-white shadow-2xl shadow-gray-900/40 mb-8 border-4 border-gray-800">
                <span className="text-5xl md:text-6xl font-black leading-none tracking-tighter">{scoreResult.total}</span>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Skor</span>
              </div>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto">{scoreResult.archetype.desc}</p>

              {butuhDukungan && (
                <div className="text-left bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-10">
                  <div className="flex items-center gap-2 font-black text-amber-900 mb-2"><LifeBuoy size={20}/> Kamu gak sendirian</div>
                  <p className="text-amber-900/90 leading-relaxed">Hasil ini menunjukkan kamu sedang ada di fase yang berat. Itu wajar, dan bukan berarti kamu gagal. Coba ceritakan ke orang yang kamu percaya. Kalau rasanya terlalu berat untuk dijalani, bicara dengan psikolog atau psikiater. Layanan bantuan: <strong>{NOMOR_LAYANAN_DARURAT}</strong>.</p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 text-left mb-10">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-1">{modalRendah ? 'Yang paling siap kamu bangun' : 'Sumber pede kamu'}</div>
                  <div className="font-black text-gray-900 text-lg">{namaDim(kuat)}</div>
                  <div className="text-xs text-gray-500 mb-2">{namaInggris(kuat)}</div>
                  <p className="text-gray-700 leading-relaxed">{modalRendah ? 'Semua dimensi kamu sedang rendah, dan itu boleh. Mulai dari yang ini dulu, pelan-pelan.' : SUMBER_PEDE[kuat]}</p>
                </div>
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6">
                  <div className="text-xs font-bold uppercase tracking-widest text-rose-700 mb-1">Yang bikin kamu ragu</div>
                  <div className="font-black text-gray-900 text-lg">{namaDim(lemah)}</div>
                  <div className="text-xs text-gray-500 mb-2">{namaInggris(lemah)}</div>
                  <p className="text-gray-700 leading-relaxed">{PEMICU_RAGU[lemah]}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200 mb-10 text-left">
                <h3 className="font-black text-gray-900 text-xl mb-6">Profil 6 dimensi</h3>
                <div className="space-y-5">
                  {DIMENSIONS.map(dim => (
                    <div key={dim.id}>
                      <div className="flex justify-between text-sm font-bold text-gray-700 mb-2">
                        <span className="flex items-center gap-2"><Target size={16} className="text-blue-500"/> {dim.title}</span>
                        <span>{scoreResult.norm[dim.id]}/100</span>
                      </div>
                      <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{width: `${scoreResult.norm[dim.id]}%`}}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 mb-10">
                <button onClick={unduhKartu} disabled={sedangUnduh} className="w-full bg-[#111827] text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-800 transition disabled:opacity-60">
                  <Download size={20}/> {sedangUnduh ? 'Membuat kartu...' : 'Unduh kartu hasil untuk story'}
                </button>
                <a href={`https://wa.me/${NOMOR_WA}?text=${encodeURIComponent(pesanWa)}`} target="_blank" rel="noopener noreferrer" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-emerald-700 transition">
                  <MessageCircle size={20}/> Kirim hasilku ke WhatsApp Firas
                </a>
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-4 text-left">
                  <div className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Kode hasil kamu (dipakai di Arah90)</div>
                  <div className="flex items-center justify-between gap-3">
                    <code className="font-mono font-bold text-gray-900 text-sm md:text-base break-all">{kode}</code>
                    <button onClick={salinKode} className="shrink-0 flex items-center gap-1 text-blue-600 font-bold text-sm"><Copy size={16}/> Salin</button>
                  </div>
                  {pesanSalin && <div className="text-xs text-gray-500 mt-2">{pesanSalin}</div>}
                </div>
              </div>

              <div className="bg-[#111827] text-white p-8 md:p-12 rounded-2xl text-center">
                <h3 className="text-2xl md:text-3xl font-black mb-3">Hasil ini peta. Arah90 yang bantu kamu jalan.</h3>
                <p className="text-gray-400 mb-8 max-w-xl mx-auto leading-relaxed">12 minggu untuk menguatkan {namaDim(lemah)}{modalRendah ? '' : ` dan memakai ${namaDim(kuat)} sebagai modal`}. Isinya ebook BERARTI Framework dan workbook yang otomatis mengikuti skor kamu, plus upgrade gratis ke aplikasi Arah90 saat rilis.</p>
                <div className="text-3xl font-black mb-6">Rp99.000</div>
                <button onClick={bukaPembayaran} className={`w-full sm:w-auto px-10 py-4 rounded-xl font-black text-lg flex justify-center items-center gap-3 mx-auto transition ${butuhDukungan ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-[#2563EB] text-white hover:bg-blue-500 shadow-2xl shadow-blue-600/50'}`}>
                  Ambil BERARTI Arah90 <ArrowRight size={22}/>
                </button>
              </div>

              <button onClick={() => { setAnswers({}); setAssessmentPage(0); setCurrentView('assessment'); }} className="mt-8 text-gray-500 font-semibold flex items-center gap-2 mx-auto hover:text-gray-900">
                <RotateCcw size={16}/> Ulangi tes
              </button>
              <p className="text-xs text-gray-400 mt-8">BERARTI Index adalah alat refleksi diri, bukan diagnosis atau terapi psikologis.</p>
            </div>

            {/* Kartu 1080x1920 untuk diunduh, disembunyikan dari layar */}
            <div style={{ position: 'fixed', left: '-10000px', top: 0 }} aria-hidden="true">
              <div id="kartu-hasil" style={{ width: 1080, height: 1920, background: '#111827', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', padding: '160px 110px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 6, color: '#60A5FA' }}>BERARTI INDEX</div>
                <div style={{ fontSize: 92, fontWeight: 900, lineHeight: 1.05, marginTop: 40 }}>{scoreResult.archetype.title}</div>
                <div style={{ fontSize: 200, fontWeight: 900, marginTop: 50, marginBottom: 30, lineHeight: 1 }}>{scoreResult.total}<span style={{ fontSize: 48, color: '#9CA3AF', fontWeight: 700 }}> /100</span></div>
                <div style={{ marginTop: 70 }}>
                  {DIMENSIONS.map(dim => (
                    <div key={dim.id} style={{ marginBottom: 34 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 34, fontWeight: 700, marginBottom: 12 }}><span>{dim.title}</span><span>{scoreResult.norm[dim.id]}</span></div>
                      <div style={{ height: 22, background: '#374151', borderRadius: 11 }}><div style={{ width: `${scoreResult.norm[dim.id]}%`, height: 22, background: '#2563EB', borderRadius: 11 }}></div></div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 40, fontSize: 36, lineHeight: 1.4 }}><span style={{ color: '#34D399', fontWeight: 800 }}>{modalRendah ? 'Mulai dari: ' : 'Sumber pede: '}</span>{namaDim(kuat)}</div>
                <div style={{ marginTop: 14, fontSize: 36, lineHeight: 1.4 }}><span style={{ color: '#FB7185', fontWeight: 800 }}>Yang bikin ragu: </span>{namaDim(lemah)}</div>
                <div style={{ marginTop: 'auto', fontSize: 32, color: '#9CA3AF' }}>Cek punyamu: BERARTI Index by Firas Byzi</div>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {}
      <div style={{ display: currentView === 'landing' ? 'block' : 'none' }}>
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full glass-effect z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-black text-2xl tracking-tighter text-[#111827]">
            BERARTI<span className="text-[#2563EB]">™</span>
          </div>
          
          {/* Desktop Menu - Added Tentang Kami dan Layanan Kami */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <button onClick={() => setCurrentView('assessment')} className="text-sm font-semibold text-gray-500 hover:text-[#111827] transition">Tes Gratis</button>
            <a href="#tentang-kami" className="text-sm font-semibold text-gray-500 hover:text-[#111827] transition">Tentang Kami</a>
            <a href="#framework" className="text-sm font-semibold text-gray-500 hover:text-[#111827] transition">Framework</a>
            <a href="#layanan-kami" className="text-sm font-semibold text-gray-500 hover:text-[#111827] transition">Layanan Kami</a>
            <a href="#starter-kit" className="text-sm font-semibold text-gray-500 hover:text-[#111827] transition">Arah90</a>
          </div>
          
          <div className="hidden md:block">
            <button onClick={() => bukaPembayaran()} className="bg-[#111827] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 transform hover:-translate-y-0.5">
              Dapatkan Akses
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-gray-900" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown - Added Links */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-xl flex flex-col px-6 py-4 space-y-4">
            <button onClick={() => {setMobileMenuOpen(false); setCurrentView('assessment');}} className="font-semibold text-gray-700 py-2 text-left">Tes Gratis</button>
            <a href="#tentang-kami" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-gray-700 py-2">Tentang Kami</a>
            <a href="#framework" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-gray-700 py-2">Framework</a>
            <a href="#layanan-kami" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-gray-700 py-2">Layanan Kami</a>
            <a href="#starter-kit" onClick={() => setMobileMenuOpen(false)} className="font-semibold text-gray-700 py-2">Arah90</a>
          </div>
        )}
      </nav>

      {/* STICKY MOBILE CTA */}
      <div className={`md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 z-50 transition-transform duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex gap-3 ${showStickyCTA ? 'translate-y-0' : 'translate-y-full'}`}>
        <button onClick={() => setCurrentView('assessment')} className="flex-1 bg-white text-[#111827] border-2 border-gray-200 py-3 rounded-xl text-center font-bold text-sm">Tes Gratis</button>
        <button onClick={() => bukaPembayaran()} className="flex-1 bg-[#2563EB] text-white py-3 rounded-xl text-center font-bold text-sm shadow-lg shadow-blue-600/30">Ambil Arah90 Rp99rb</button>
      </div>

      <main className="pt-20">
        
        {}
        <section className="relative overflow-hidden bg-white pt-24 pb-32">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-5xl pointer-events-none opacity-30">
             <div className="absolute top-10 left-0 w-[400px] h-[400px] bg-blue-100 rounded-full mix-blend-multiply filter blur-[80px] blob-animate"></div>
             <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-amber-50 rounded-full mix-blend-multiply filter blur-[80px] blob-animate" style={{animationDelay: '2s'}}></div>
          </div>

          <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-600 px-5 py-2 rounded-full text-sm font-bold tracking-wide mb-10 shadow-sm fade-in-up">
              <Compass size={16} className="text-blue-600"/> Dari Bingung Menjadi Berarti
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-[5rem] font-black tracking-tighter leading-[1.05] mb-8 text-[#111827] fade-in-up" style={{animationDelay: '100ms'}}>
              Kamu Gak Kurang Pede.<br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#111827] via-[#2563EB] to-[#2563EB]">
                Kamu Belum Kenal Dirimu dan Arahmu.
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-500 max-w-3xl mx-auto mb-12 leading-relaxed fade-in-up font-light" style={{animationDelay: '200ms'}}>
              Pede bukan bawaan lahir. Pede datang dari tahu kamu siapa, apa yang kamu pegang, dan mau ke mana. Mulai dari tes 60 pertanyaan, gratis.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 fade-in-up" style={{animationDelay: '300ms'}}>
              <button onClick={() => setCurrentView('assessment')} className="w-full sm:w-auto bg-[#111827] text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-800 transition-all shadow-2xl shadow-gray-900/20 flex items-center justify-center gap-3 group transform hover:-translate-y-1">
                Mulai Tes BERARTI™ Gratis
                <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform"/>
              </button>
              {hasilTerakhir ? (
                <button onClick={() => { setScoreResult(hasilTerakhir); setCurrentView('result'); }} className="w-full sm:w-auto bg-white text-[#111827] border-2 border-gray-200 px-10 py-5 rounded-2xl font-bold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
                  Lihat hasil terakhirku
                </button>
              ) : (
                <a href="#starter-kit" className="w-full sm:w-auto bg-white text-[#111827] border-2 border-gray-200 px-10 py-5 rounded-2xl font-bold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
                  Lihat BERARTI Arah90
                </a>
              )}
            </div>

            <div className="mt-24 max-w-4xl mx-auto fade-in-up relative" style={{animationDelay: '400ms'}}>
               <div className="aspect-[21/9] bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                  <div className="relative w-full h-full flex flex-col items-center justify-center p-8">
                      <div className="w-full flex justify-between items-end h-1/2 border-b-2 border-dashed border-gray-300 relative px-10">
                        <div className="absolute bottom-0 left-1/2 w-1 h-32 bg-gradient-to-t from-blue-500 to-transparent -translate-x-1/2 translate-y-full"></div>
                        <div className="text-gray-400 font-bold opacity-50 flex items-center gap-2"><ArrowDown size={20}/> Kebingungan</div>
                        <div className="text-gray-400 font-bold opacity-50 flex items-center gap-2">Overthinking <ArrowDown size={20}/></div>
                      </div>
                      <div className="h-1/2 flex items-center justify-center">
                         <div className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 transform translate-y-1/2">
                            <Target size={20}/> Kejelasan Arah
                         </div>
                      </div>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {}
        <section className="py-32 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-4xl md:text-6xl font-black text-center mb-16 text-[#111827] tracking-tight">Pernah Merasakan Ini?</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-16">
              {[
                "Umur bertambah tetapi arah hidup masih kabur",
                "Sering membandingkan diri dengan teman",
                "Merasa tertinggal dari orang lain",
                "Tidak tahu potensi dan kekuatan diri",
                "Sulit menentukan pilihan karier",
                "Kurang percaya diri saat mengambil keputusan",
                "Overthinking berlebihan setiap malam",
                "Merasa hidup berjalan bagai robot tanpa tujuan"
              ].map((pain, i) => (
                <div key={i} className="flex items-center gap-5 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="bg-red-50 text-red-500 rounded-full p-2 shrink-0">
                    <X size={24} />
                  </div>
                  <p className="text-gray-700 font-medium text-lg">{pain}</p>
                </div>
              ))}
            </div>

            <div className="max-w-3xl mx-auto text-center bg-white p-10 md:p-14 rounded-3xl border border-gray-200 shadow-xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-2 h-full bg-[#2563EB]"></div>
               <p className="text-xl md:text-2xl text-gray-600 leading-relaxed font-light">
                 "Kita diajarkan cara belajar untuk ujian, cara menyusun CV, dan cara lulus wawancara kerja. <strong className="text-gray-900 font-bold">Tetapi kita jarang diajarkan cara mengenali diri sendiri dan merancang hidup yang benar-benar bermakna.</strong> Itulah mengapa banyak dari kita merasa kosong, meski di luar terlihat baik-baik saja."
               </p>
            </div>
          </div>
        </section>

        {}
        <section id="assessment" className="py-32 bg-[#0A0F1C] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-900/20 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <div className="inline-block border border-blue-500/30 bg-blue-500/10 text-blue-300 font-bold tracking-widest text-xs uppercase px-4 py-2 rounded-full mb-6">
                Langkah Pertama
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-8 leading-tight tracking-tight">Cari Tahu Posisi Hidupmu Saat Ini</h2>
              <p className="text-gray-400 text-xl mb-10 leading-relaxed font-light">
                BERARTI™ Index adalah assessment berbasis psikologi yang membantu mengukur tingkat kejelasan arah hidup, kesiapan bertindak, keselarasan nilai hidup, makna hidup, kontribusi, dan pertumbuhan pribadi.
              </p>
              
              <div className="space-y-5 mb-12">
                <p className="font-bold text-white mb-4 text-lg">Yang akan Kamu dapatkan secara gratis:</p>
                {[
                  'BERARTI Score (Skala 0-100)', 
                  'Visual Radar Chart 6 Dimensi', 
                  'Archetype Personal Kamu', 
                  'Insight Psikologis Mendalam', 
                  'Rekomendasi Pengembangan Diri'
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-gray-300 text-lg">
                    <CheckCircle2 className="text-[#3B82F6] shrink-0" size={24}/> 
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => setCurrentView('assessment')} className="inline-flex bg-[#3B82F6] text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-blue-600 transition-all shadow-2xl shadow-blue-900/50 gap-3 items-center group transform hover:-translate-y-1">
                Mulai Tes Gratis (5 Menit) <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform"/>
              </button>
            </div>

            <div className="relative">
               <div className="aspect-square w-full max-w-md mx-auto relative">
                 <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-transparent rounded-full border border-gray-800 animate-[spin_60s_linear_infinite]"></div>
                 <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 text-blue-500/50 fill-current drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                    <polygon points="50,10 90,30 85,80 50,95 20,70 15,35" />
                 </svg>
                 <div className="absolute inset-0 flex items-center justify-center flex-col text-center">
                    <span className="text-7xl font-black text-white">78</span>
                    <span className="text-blue-400 font-bold tracking-widest text-sm mt-2 uppercase">Growing Zone</span>
                 </div>
               </div>
            </div>
          </div>
        </section>

        {}
        {/* NEW SECTION: TENTANG KAMI (Replacing and Expanding the Founder Story) */}
        <section id="tentang-kami" className="py-32 bg-white relative overflow-hidden">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
              <span className="text-blue-600 font-bold tracking-widest text-sm uppercase mb-4 block">Tentang Kami</span>
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-[#111827]">Lebih Dari Sekadar Motivasi.</h2>
              <p className="text-xl text-gray-500 max-w-3xl mx-auto">
                BERARTI™ lahir dari kegelisahan melihat jutaan anak muda tersesat dalam kesibukan tanpa arah, kehilangan makna, dan terus-menerus terjebak dalam overthinking.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-16 items-center">
              <div className="lg:col-span-5 relative">
                <div className="aspect-[3/4] bg-gray-100 rounded-3xl overflow-hidden relative shadow-2xl border border-gray-200">
                   <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent z-10"></div>
                   {/* Placeholder for Founder Photo */}
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-200 text-gray-400">
                     <User size={64} className="mb-4 text-gray-300"/>
                     <span className="font-bold text-lg">Foto Founder</span>
                   </div>
                   <div className="absolute bottom-6 left-6 z-20">
                     <p className="font-black text-2xl text-white">Firas Byzi</p>
                     <p className="text-blue-300 font-semibold text-sm">Founder dan Growth Mentor</p>
                   </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <h3 className="text-3xl md:text-4xl font-black mb-8 text-[#111827] tracking-tight leading-tight">
                  "Saya Pernah Merasa Kehilangan Arah, Meski Terlihat Sibuk."
                </h3>
                <div className="space-y-6 text-gray-600 text-lg leading-relaxed font-light">
                  <p>Dulu, hidup saya terlihat sangat baik dari luar. Aktivitas padat, pencapaian demi pencapaian diraih, dan saya tampak seperti anak muda yang tahu betul apa yang dilakukannya.</p>
                  <p className="text-gray-900 font-medium p-4 bg-gray-50 border-l-4 border-blue-600 rounded-r-lg">
                    Tetapi di dalam, terasa kosong. Saya sering terbangun di malam hari diliputi overthinking: "Untuk apa sebenarnya saya melakukan semua ini?"
                  </p>
                  <p>Turning point itu datang ketika saya menyadari bahwa <strong>yang hilang dari hidup saya bukanlah motivasi, melainkan makna (meaning) dan sistem.</strong></p>
                  <p>Dari pencarian panjang meriset psikologi dan *life design*, lahirlah <strong>BERARTI™ Framework</strong>. Sebuah movement dan sistem yang dirancang untuk membantu Kamu menghemat waktu bertahun-tahun dalam kebingungan, dan mulai mendesain hidup yang berfokus pada kontribusi.</p>
                </div>
                
                <div className="mt-10 grid sm:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                    <h4 className="font-bold text-blue-900 mb-2">Visi Kami</h4>
                    <p className="text-sm text-blue-800/80">Menciptakan generasi yang tidak hanya sukses secara materi, tapi utuh, terarah, dan bermanfaat bagi sekitarnya.</p>
                  </div>
                  <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                    <h4 className="font-bold text-emerald-900 mb-2">Misi Kami</h4>
                    <p className="text-sm text-emerald-800/80">Menyediakan alat, framework, dan lingkungan pendukung berbasis psikologi untuk mendesain kehidupan yang bermakna.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {}
        <section className="py-32 bg-gray-50 border-y border-gray-200">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-black mb-6 text-[#111827]">Tonton Video 4 Menit Ini</h2>
            <p className="text-xl text-gray-500 mb-12">Pahami mengapa sistem lebih penting daripada motivasi sesaat.</p>
            
            <div className="aspect-video bg-gray-900 rounded-3xl shadow-2xl overflow-hidden relative group cursor-pointer border border-gray-800">
               <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80 z-10"></div>
               <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                     <Play className="text-white ml-2 w-10 h-10" fill="currentColor"/>
                  </div>
               </div>
               <div className="absolute bottom-8 left-8 text-left z-20">
                 <ul className="text-gray-300 space-y-2 text-sm md:text-base font-medium">
                   <li className="flex items-center gap-2"><Check size={16} className="text-blue-400"/> Kenapa orang kehilangan arah</li>
                   <li className="flex items-center gap-2"><Check size={16} className="text-blue-400"/> Kesalahan terbesar mencari tujuan</li>
                   <li className="flex items-center gap-2"><Check size={16} className="text-blue-400"/> Cara framework bekerja</li>
                 </ul>
               </div>
            </div>
          </div>
        </section>

        {}
        <section className="py-32 bg-white">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-16 text-[#111827]">Kenapa Orang Tetap Bingung?</h2>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-16">
               {['Bingung', 'Cari Motivasi', 'Semangat Sesaat', 'Kembali Bingung'].map((step, i) => (
                 <React.Fragment key={i}>
                   <div className="bg-gray-50 border border-gray-200 px-6 py-4 rounded-2xl font-bold text-gray-700 w-full md:w-auto shadow-sm">
                     {step}
                   </div>
                   {i < 3 && <ArrowRight className="hidden md:block text-gray-300" size={24}/>}
                   {i < 3 && <ArrowDown className="md:hidden text-gray-300" size={24}/>}
                 </React.Fragment>
               ))}
            </div>

            <div className="bg-blue-50 border border-blue-100 p-8 md:p-12 rounded-3xl max-w-3xl mx-auto">
               <h3 className="text-2xl font-bold text-blue-900 mb-4">Motivasi Bukan Solusi. Sistem Adalah Solusi.</h3>
               <p className="text-lg text-blue-800/80 leading-relaxed">
                 Motivasi hanya bertahan beberapa hari. Untuk benar-benar keluar dari siklus kebingungan, Kamu membutuhkan <strong>Sistem</strong> dan <strong>Framework</strong> yang jelas untuk membedah masalah Kamu secara objektif.
               </p>
            </div>
          </div>
        </section>

        <section id="framework" className="py-32 bg-[#111827] text-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-black mb-6">BERARTI™ Framework</h2>
              <p className="text-gray-400 text-xl max-w-2xl mx-auto">7 Pilar Sistematis Berbasis Psikologi untuk Keluar dari Krisis Arah dan Mendesain Ulang Kehidupan Kamu.</p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center">
              {[
                { l: "B", title: "Being Aware", desc: "Mengenal potensi, kelemahan, dan identitas autentik diri yang selama ini tertutup bising.", icon: <Target/>, color: "text-blue-400" },
                { l: "E", title: "Envisioning Direction", desc: "Merancang visi hidup dan karir yang sangat tajam, terukur, dan jelas.", icon: <Compass/>, color: "text-amber-400" },
                { l: "R", title: "Readiness To Act", desc: "Membangun keberanian bertindak dan memutus rantai penundaan (overthinking).", icon: <Zap/>, color: "text-emerald-400" },
                { l: "A", title: "Alignment Of Values", desc: "Menyelaraskan setiap tindakan agar tidak mengkhianati prinsip hati nurani terdalam.", icon: <Scale/>, color: "text-purple-400" },
                { l: "R", title: "Relevance and Meaning", desc: "Menemukan alasan (Why) terkuat mengapa Kamu melakukan apa yang Kamu lakukan.", icon: <Heart/>, color: "text-rose-400" },
                { l: "T", title: "Transcendence and Impact", desc: "Membangkitkan fokus pada penciptaan manfaat nyata untuk orang lain, bukan sekadar ego.", icon: <Globe/>, color: "text-cyan-400" },
                { l: "I", title: "Intentional Growth", desc: "Bertumbuh secara sadar dan disengaja, bukan sekadar mengikuti arus kehidupan.", icon: <ArrowRightCircle/>, color: "text-white" },
              ].map((item, i) => (
                <div key={i} className="bg-gray-800/50 border border-gray-700/50 p-8 rounded-3xl hover:bg-gray-800 transition-colors group">
                  <div className="flex flex-col mb-6">
                    <span className={`text-6xl font-black opacity-20 group-hover:opacity-100 transition-opacity ${item.color}`}>{item.l}</span>
                    <div className="mt-4">{React.cloneElement(item.icon, { size: 32, className: item.color })}</div>
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-white">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {}
        {/* NEW SECTION: LAYANAN KAMI */}
        <section id="layanan-kami" className="py-32 bg-gray-50 border-y border-gray-200">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-20">
              <span className="text-blue-600 font-bold tracking-widest text-sm uppercase mb-4 block">Layanan Kami</span>
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-[#111827]">Ekosistem BERARTI™</h2>
              <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                Pilih jalur yang paling sesuai dengan kebutuhan dan fase perjalanan hidup Kamu saat ini.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Service 1: Free */}
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl transition-shadow flex flex-col h-full">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 border border-gray-100">
                  <Target className="text-gray-600" size={32}/>
                </div>
                <div className="mb-4">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-2">Fase Awal</span>
                  <h3 className="text-2xl font-black text-gray-900">BERARTI Index</h3>
                </div>
                <p className="text-gray-600 mb-8 flex-grow">Tes refleksi diri gratis untuk memetakan level kebingungan Kamu dan menemukan archetype personal Kamu dalam sekitar 10 menit.</p>
                <div className="text-2xl font-black text-gray-900 mb-6">Gratis</div>
                <button onClick={() => setCurrentView('assessment')} className="w-full bg-white border-2 border-gray-200 text-gray-800 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                  Mulai Tes Sekarang
                </button>
              </div>

              {/* Service 2: Starter Kit (Popular) */}
              <div className="bg-[#111827] rounded-3xl p-8 border border-gray-800 shadow-2xl relative flex flex-col h-full transform md:-translate-y-4">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-b-lg uppercase tracking-wider">Paling Populer</div>
                <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
                  <BookOpen className="text-blue-400" size={32}/>
                </div>
                <div className="mb-4">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest block mb-2">Belajar Mandiri</span>
                  <h3 className="text-2xl font-black text-white">Arah90</h3>
                </div>
                <p className="text-gray-400 mb-8 flex-grow">Framework digital komprehensif (Ebook, Canvas, Roadmap) untuk mendesain ulang arah hidup Kamu secara mandiri.</p>
                <div className="mb-6">
                   <span className="text-2xl font-black text-white">Rp99.000</span>
                </div>
                <button onClick={() => bukaPembayaran()} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/50">
                  Dapatkan Akses
                </button>
              </div>

              {/* Service 3: Premium */}
              <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-xl transition-shadow flex flex-col h-full">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 border border-amber-100">
                  <Users className="text-amber-500" size={32}/>
                </div>
                <div className="mb-4">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block mb-2">Intensif</span>
                  <h3 className="text-2xl font-black text-gray-900">Mentoring 1-on-1</h3>
                </div>
                <p className="text-gray-600 mb-8 flex-grow">Bimbingan eksklusif bersama tim fasilitator kami untuk membedah masalah spesifik karir dan kehidupan Kamu secara mendalam.</p>
                <div className="text-2xl font-black text-gray-900 mb-6">Mulai <span className="text-lg">Rp750k</span></div>
                <button className="w-full bg-white border-2 border-gray-200 text-gray-800 py-4 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                  Hubungi Admin
                </button>
              </div>
            </div>
          </div>
        </section>

        {}
        <section className="py-32 bg-white">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-[#111827]">Temukan Persimpangan Hidupmu</h2>
            <p className="text-xl text-gray-500 mb-16 max-w-2xl mx-auto">Satu lembar Life Design Canvas™ akan menggantikan ratusan jam overthinking Kamu dengan satu garis lurus yang jelas.</p>

            <div className="max-w-3xl mx-auto bg-gray-50 p-8 md:p-12 rounded-3xl border border-gray-200 shadow-xl">
               <div className="space-y-4">
                 {[
                   "Apa yang Aku Sukai?",
                   "Apa yang Aku Kuasai?",
                   "Apa yang Aku Pedulikan (Isu)?",
                   "Siapa yang Ingin Aku Bantu?",
                   "Apa yang Mereka Butuhkan?",
                   "Nilai Apa yang Bisa Kuberikan?"
                 ].map((q, i) => (
                   <React.Fragment key={i}>
                     <div className="bg-white border border-gray-200 py-4 px-6 rounded-xl text-gray-700 font-medium shadow-sm">
                       {q}
                     </div>
                     {i < 5 && <ArrowDown className="mx-auto text-blue-300" size={24}/>}
                   </React.Fragment>
                 ))}
                 
                 <ArrowDown className="mx-auto text-blue-500 mt-8 mb-4" size={32}/>
                 
                 <div className="bg-blue-600 text-white p-6 md:p-8 rounded-2xl shadow-lg shadow-blue-500/30">
                    <h3 className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-2">Hasil Akhir</h3>
                    <p className="text-xl md:text-2xl font-black">Personal Impact Statement</p>
                    <p className="mt-4 text-blue-100 italic">"Saya membantu [Target] menyelesaikan [Masalah] menggunakan [Skill] sehingga mereka [Dampak]."</p>
                 </div>
               </div>
            </div>
          </div>
        </section>

        <section id="starter-kit" className="py-32 bg-gray-50 border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-black text-center mb-16 text-[#111827]">Di Dalam Arah90 Ini</h2>
            
            <div className="grid lg:grid-cols-2 gap-16 items-center">
               <div className="relative aspect-square md:aspect-[4/3] bg-white rounded-3xl border border-gray-200 shadow-sm flex items-center justify-center p-8">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-transparent rounded-3xl"></div>
                  <div className="relative z-10 w-full max-w-sm space-y-4">
                    <div className="w-full aspect-[3/4] bg-[#111827] rounded-xl shadow-[20px_20px_60px_rgba(0,0,0,0.2)] transform -rotate-6 flex flex-col justify-between p-8 border-l-8 border-blue-600">
                      <div className="text-blue-500 font-bold tracking-widest text-xs">BERARTI™</div>
                      <div>
                        <h4 className="text-white text-3xl font-black leading-tight mb-2">BERARTI<br/>Arah90.</h4>
                        <div className="w-12 h-1 bg-blue-600"></div>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="space-y-6">
                 {[
                   { icon: <BookOpen className="text-blue-600"/>, title: "1. Ebook Panduan BERARTI™", desc: "Materi inti yang mengupas tuntas krisis arah hidup dan mindset fondasi." },
                   { icon: <Edit3 className="text-amber-500"/>, title: "2. Reflection Journal", desc: "Pertanyaan-pertanyaan provokatif untuk menggali isi kepala Kamu." },
                   { icon: <Layout className="text-emerald-500"/>, title: "3. Life Design Canvas™", desc: "Satu lembar blueprint untuk menemukan persimpangan karir Kamu." },
                   { icon: <Map className="text-purple-500"/>, title: "4. Roadmap 90 Hari", desc: "Template kalender aksi untuk memecah kebingungan menjadi langkah harian." },
                   { icon: <FileText className="text-rose-500"/>, title: "5. Impact Statement Template", desc: "Formula sakti untuk membuat bio LinkedIn/IG yang menonjolkan value Kamu." }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-5 items-start p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
                     <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 shrink-0">{item.icon}</div>
                     <div>
                       <h4 className="font-bold text-lg text-[#111827] mb-1">{item.title}</h4>
                       <p className="text-gray-500 text-sm">{item.desc}</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </section>

        {}
        <section className="py-32 bg-[#111827] text-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-black text-center mb-16">Setelah Menyelesaikan Arah90 Ini</h2>
            <div className="grid sm:grid-cols-2 gap-6 text-lg">
              {[
                "Kejelasan arah hidup yang tajam",
                "Percaya diri yang jauh lebih kuat",
                "Memiliki Life Direction Map",
                "Personal Meaning Statement",
                "Personal Impact Statement",
                "Roadmap Aksi 90 Hari",
                "Selesainya Life Design Canvas",
                "Langkah nyata untuk bertumbuh besok pagi"
              ].map((res, i) => (
                <div key={i} className="flex items-center gap-4 bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                  <CheckCircle2 className="text-emerald-400 shrink-0" size={24}/>
                  <span className="font-medium">{res}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {SHOW_TESTIMONIALS && TESTIMONIALS.length > 0 && (
        <section className="py-32 bg-white overflow-hidden">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-black text-center mb-16 text-[#111827]">Mereka Yang Telah Menemukan Arahnya</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-gray-50 p-8 rounded-3xl border border-gray-200 shadow-sm relative">
                  <Quote className="absolute top-6 right-6 text-gray-200 w-12 h-12"/>
                  <div className="flex gap-1 mb-6">
                    {[...Array(t.rating)].map((_, j) => <Star key={j} className="text-amber-400 fill-current" size={20}/>)}
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div>
                      <span className="text-xs font-bold text-red-500 uppercase tracking-widest block mb-1">Sebelum</span>
                      <p className="text-gray-600 text-sm">"{t.before}"</p>
                    </div>
                    <div className="border-t border-gray-200"></div>
                    <div>
                      <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest block mb-1">Sesudah</span>
                      <p className="text-gray-900 font-medium">"{t.after}"</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                    <div>
                      <h4 className="font-bold text-[#111827]">{t.name}</h4>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        )}

        {}
        <section className="py-32 bg-gray-50 border-y border-gray-200">
          <div className="max-w-3xl mx-auto px-6">
             <h2 className="text-4xl font-black text-center mb-16 text-[#111827]">Pertanyaan Umum</h2>
             <div className="space-y-4">
                {FAQS.map((item, i) => (
                  <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                    <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full p-6 text-left flex justify-between items-center font-bold text-[#111827] hover:bg-gray-50 transition-colors">
                      {item.q}
                      <ChevronDown size={20} className={`transform transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    {activeFaq === i && <div className="p-6 bg-gray-50 text-gray-600 border-t border-gray-100 leading-relaxed">{item.a}</div>}
                  </div>
                ))}
             </div>
          </div>
        </section>

        <section id="pricing" className="py-32 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-6xl font-black mb-6 text-[#111827] tracking-tight">Investasi Untuk Hidup Yang Lebih Terarah</h2>
              <p className="text-xl text-gray-500">Berapa harga sebuah kejelasan arah di masa depan Kamu?</p>
            </div>
            
            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-200 overflow-hidden max-w-2xl mx-auto transform transition-transform hover:scale-[1.02] duration-500">
              <div className="bg-[#111827] text-white p-10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full filter blur-3xl mix-blend-screen translate-x-1/2 -translate-y-1/2"></div>
                <h3 className="text-3xl font-black mb-2 relative z-10">BERARTI Arah90</h3>
                <p className="text-gray-400 relative z-10">Akses Digital Instan 24/7</p>
              </div>
              
              <div className="p-8 md:p-12">
                <div className="space-y-4 mb-8 text-lg text-gray-700">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3"><span>1. Ebook BERARTI™</span><span className="font-medium">Rp149.000</span></div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3"><span>2. Reflection Journal</span><span className="font-medium">Rp99.000</span></div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3"><span>3. Life Design Canvas™</span><span className="font-medium">Rp149.000</span></div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3"><span>4. Roadmap 90 Hari</span><span className="font-medium">Rp99.000</span></div>
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3"><span>5. Impact Statement Kit</span><span className="font-medium">Rp49.000</span></div>
                  
                  <div className="flex justify-between items-center pt-4 text-gray-400">
                    <span>Total Nilai</span><span className="line-through text-xl">Rp545.000</span>
                  </div>
                </div>

                <div className="text-center mb-10 bg-blue-50 py-8 rounded-3xl border border-blue-100">
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Harga Spesial Hari Ini</p>
                  <div className="flex justify-center items-start gap-1">
                    <span className="text-3xl font-bold text-[#111827] mt-1">Rp</span>
                    <span className="text-7xl font-black text-[#111827] tracking-tighter leading-none">99.000</span>
                  </div>
                </div>
                
                <button onClick={() => bukaPembayaran()} className="w-full bg-[#2563EB] text-white py-6 rounded-2xl font-black text-2xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/40 flex justify-center items-center gap-3 transform hover:-translate-y-1">
                  Saya Siap Menjadi Lebih BERARTI <ArrowRight size={28}/>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gray-50 border-t border-gray-200">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div className="w-24 h-24 mx-auto bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-8 border-4 border-emerald-100">
               <ShieldCheck size={48}/>
            </div>
            <h2 className="text-3xl font-black mb-6 text-[#111827]">Garansi Kepuasan 7 Hari</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Risiko sepenuhnya ada pada kami. Jika setelah Kamu mempelajari Arah90 ini dan mengisi Life Design Canvas, Kamu merasa <strong>tidak mendapatkan manfaat atau kejelasan arah sedikitpun</strong>, kirim pesan ke tim kami dalam waktu 7 hari dan kami akan mengembalikan 100% uang Kamu tanpa pertanyaan yang rumit.
            </p>
          </div>
        </section>

        <section className="py-32 bg-[#111827] text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/40 via-[#111827] to-[#111827] pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <h2 className="text-5xl md:text-6xl font-black mb-8 tracking-tight">Kamu Tidak Harus Mengetahui Semua Jawaban Hari Ini.</h2>
            <p className="text-2xl text-blue-200 mb-16 font-light">Tetapi kamu bisa mulai menemukan arah yang tepat hari ini.</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button onClick={() => setCurrentView('assessment')} className="w-full sm:w-auto bg-[#3B82F6] text-white px-12 py-6 rounded-2xl font-black text-xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-600/50">
                Mulai Tes BERARTI™ Gratis
              </button>
              <button onClick={() => bukaPembayaran()} className="w-full sm:w-auto bg-transparent border-2 border-gray-600 text-white px-12 py-6 rounded-2xl font-bold text-xl hover:bg-gray-800 hover:border-gray-500 transition-all">
                Dapatkan Arah90
              </button>
            </div>
          </div>
        </section>

        <footer className="bg-[#0A0F1C] border-t border-gray-800 pt-16 pb-32 md:pb-16 text-gray-400 text-sm">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8 items-center">
            <div>
               <div className="font-black text-xl text-white mb-4">BERARTI™</div>
               <p>© {new Date().getFullYear()} BERARTI™ by Firas Byzi. All rights reserved.</p>
            </div>
            <div className="flex gap-6 md:justify-end">
               <a href="#" className="hover:text-white transition">Privacy Policy</a>
               <a href="#" className="hover:text-white transition">Terms of Service</a>
               <a href={`https://wa.me/${NOMOR_WA}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Kontak</a>
               <a href={LINK_INSTAGRAM} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Instagram</a>
               <a href={`https://wa.me/${NOMOR_WA}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition">WhatsApp</a>
            </div>
          </div>
        </footer>

      </main>
      </div>
    </div>
  );
}