// BERARTI Index: questions, scoring and archetypes. Shared by the browser and the API (pure JS, no imports).

export const DIMS = [
  { id: 'BA', name: 'Mengenal Diri', en: 'Being Aware', weight: 0.15 },
  { id: 'ED', name: 'Kejelasan Arah', en: 'Envisioning Direction', weight: 0.25 },
  { id: 'RA', name: 'Kesiapan Bertindak', en: 'Readiness to Act', weight: 0.15 },
  { id: 'AV', name: 'Keselarasan Nilai', en: 'Alignment of Values', weight: 0.15 },
  { id: 'RM', name: 'Makna Hidup', en: 'Relevance and Meaning', weight: 0.15 },
  { id: 'TI', name: 'Kontribusi', en: 'Transcendence and Impact', weight: 0.15 },
];
export const DIM_ORDER = ['BA', 'ED', 'RA', 'AV', 'RM', 'TI'];      // order in URLs and lists
export const TIE_ORDER = ['ED', 'RA', 'AV', 'RM', 'TI', 'BA'];      // tie-break for strongest and weakest (same as the workbook)

// r = reverse-scored (6 minus the answer)
export const QUESTIONS = [
  { id: 1, dim: 'BA', q: 'Saya mengetahui kemampuan yang paling menonjol dalam diri saya.' },
  { id: 2, dim: 'BA', q: 'Saya tahu aktivitas yang membuat saya bersemangat.' },
  { id: 3, dim: 'BA', q: 'Saya memahami situasi yang membuat saya tampil optimal.' },
  { id: 4, dim: 'BA', q: 'Saya memahami apa yang penting bagi diri saya.' },
  { id: 5, dim: 'BA', r: true, q: 'Saya sering bingung sebenarnya saya ingin menjadi pribadi seperti apa.' },
  { id: 6, dim: 'BA', r: true, q: 'Saya merasa identitas diri saya masih berubah-ubah mengikuti lingkungan.' },
  { id: 7, dim: 'ED', q: 'Saya memiliki gambaran hidup yang ingin saya bangun.' },
  { id: 8, dim: 'ED', q: 'Saya mengetahui prioritas terbesar dalam hidup saya saat ini.' },
  { id: 9, dim: 'ED', q: 'Saya memiliki tujuan jangka panjang yang cukup jelas.' },
  { id: 10, dim: 'ED', q: 'Saya mengetahui langkah besar yang perlu saya ambil berikutnya.' },
  { id: 11, dim: 'ED', r: true, q: 'Saya sering merasa kehilangan arah hidup.' },
  { id: 12, dim: 'ED', r: true, q: 'Saya bingung harus fokus pada hal apa dalam beberapa tahun ke depan.' },
  { id: 13, dim: 'RA', q: 'Saya yakin bisa menghadapi tantangan yang muncul dalam hidup saya.' },
  { id: 14, dim: 'RA', q: 'Saya mampu membuat keputusan penting ketika diperlukan.' },
  { id: 15, dim: 'RA', q: 'Saya percaya masa depan saya bisa menjadi lebih baik melalui usaha yang saya lakukan.' },
  { id: 16, dim: 'RA', q: 'Saya mampu bangkit kembali setelah mengalami kegagalan.' },
  { id: 17, dim: 'RA', r: true, q: 'Saya terlalu banyak berpikir sampai sulit mengambil tindakan.' },
  { id: 18, dim: 'RA', r: true, q: 'Saya takut mencoba karena khawatir dinilai orang lain.' },
  { id: 19, dim: 'AV', q: 'Saya mengetahui nilai hidup yang paling penting bagi saya.' },
  { id: 20, dim: 'AV', q: 'Saya berusaha mengambil keputusan sesuai dengan prinsip yang saya yakini.' },
  { id: 21, dim: 'AV', q: 'Saya memiliki alasan yang jelas atas pilihan hidup yang saya ambil.' },
  { id: 22, dim: 'AV', q: 'Saya merasa hidup saya cukup sesuai dengan hati nurani saya.' },
  { id: 23, dim: 'AV', r: true, q: 'Saya sering menjalani sesuatu hanya karena ekspektasi orang lain.' },
  { id: 24, dim: 'AV', r: true, q: 'Saya merasa hidup saya terlalu dipengaruhi penilaian orang lain.' },
  { id: 25, dim: 'RM', q: 'Saya merasa hidup saya memiliki arti yang penting.' },
  { id: 26, dim: 'RM', q: 'Saya merasa kehidupan yang saya jalani memiliki tujuan yang bernilai.' },
  { id: 27, dim: 'RM', q: 'Saya merasa apa yang saya lakukan saat ini memiliki makna bagi diri saya.' },
  { id: 28, dim: 'RM', q: 'Saya memiliki alasan yang membuat saya tetap bersemangat menjalani hidup.' },
  { id: 29, dim: 'RM', r: true, q: 'Saya merasa hanya menjalani rutinitas tanpa makna yang jelas.' },
  { id: 30, dim: 'RM', r: true, q: 'Saya sering mempertanyakan apakah hidup saya benar-benar berarti.' },
  // Kontribusi: behaviour, not wishes (wishes are answered 5 by almost everyone)
  { id: 31, dim: 'TI', q: 'Dalam sebulan terakhir, saya membantu orang lain menyelesaikan masalah atau mempelajari sesuatu.' },
  { id: 32, dim: 'TI', q: 'Saya pernah memakai kemampuan saya untuk sesuatu yang bermanfaat bagi orang lain, tanpa diminta.' },
  { id: 33, dim: 'TI', q: 'Saya bisa menyebut satu hal nyata yang menjadi lebih baik karena kontribusi saya.' },
  { id: 34, dim: 'TI', q: 'Saya rutin meluangkan waktu atau tenaga untuk orang lain atau komunitas.' },
  { id: 35, dim: 'TI', r: true, q: 'Saya jarang memikirkan manfaat yang bisa saya berikan untuk orang lain.' },
  { id: 36, dim: 'TI', r: true, q: 'Saya merasa kemampuan saya belum cukup berarti untuk membantu orang lain.' },
];
// asked after the test, never scored (faith-friendly: an optional reflection)
export const REFLECTION = 'Saya ingin hidup saya bernilai di hadapan manusia dan Tuhan.';

export const SCALE = ['Sangat tidak setuju', 'Tidak setuju', 'Netral', 'Setuju', 'Sangat setuju'];

// deterministic shuffle so every visitor sees the same order (dimensions mixed)
export function questionOrder() {
  let s = 20261124; const rnd = () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  const a = QUESTIONS.map(q => q.id);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// answers: { [questionId]: 1..5 } → { BA: 0..100, ... }
export function scoreAnswers(answers) {
  const sum = {}; DIM_ORDER.forEach(d => (sum[d] = 0));
  for (const q of QUESTIONS) { const a = answers[q.id]; if (!a) throw new Error('missing answer ' + q.id); sum[q.dim] += q.r ? 6 - a : a; }
  const out = {}; for (const d of DIM_ORDER) out[d] = Math.round(((sum[d] - 6) / 24) * 100);
  return out;
}
export const total = s => Math.round(DIMS.reduce((acc, d) => acc + s[d.id] * d.weight, 0));
export const strongest = s => { const m = Math.max(...DIM_ORDER.map(d => s[d])); return TIE_ORDER.find(d => s[d] === m); };
export const weakest = s => { const m = Math.min(...DIM_ORDER.map(d => s[d])); return TIE_ORDER.find(d => s[d] === m); };
// second weakest (for "sumber pede yang belum kamu pakai")
export const secondWeakest = s => { const w = weakest(s); const rest = TIE_ORDER.filter(d => d !== w); const m = Math.min(...rest.map(d => s[d])); return rest.find(d => s[d] === m); };
export const band = v => (v >= 70 ? 'tinggi' : v >= 45 ? 'sedang' : 'rendah');
export const allLow = s => Math.max(...DIM_ORDER.map(d => s[d])) < 45;

// scores ⇄ URL: "70-80-65-75-85-60" in DIM_ORDER
export const encodeScores = s => DIM_ORDER.map(d => s[d]).join('-');
export function decodeScores(str) {
  const p = String(str || '').split('-').map(Number);
  if (p.length !== 6 || p.some(n => !Number.isInteger(n) || n < 0 || n > 100)) return null;
  const s = {}; DIM_ORDER.forEach((d, i) => (s[d] = p[i])); return s;
}

export const ARCHETYPES = {
  ED: { name: 'Penentu Arah Berarti', strong: 'Kamu tahu mau ke mana dan bisa memilah prioritas.', grow: 'Tapi kamu bisa terlalu kaku pada rencana sampai lupa menikmati prosesnya.' },
  RA: { name: 'Penggerak Berarti', strong: 'Kamu berani mulai dan cepat bangkit.', grow: 'Tapi kamu kadang jalan sebelum arahnya benar-benar jelas.' },
  AV: { name: 'Penjaga Nilai Berarti', strong: 'Kamu konsisten dan pilihanmu tulus.', grow: 'Tapi kamu bisa sulit berkompromi saat keadaan berubah.' },
  RM: { name: 'Pencari Makna Berarti', strong: 'Kamu peka pada alasan di balik setiap hal.', grow: 'Tapi kamu bisa lama ragu sebelum memilih jalan.' },
  TI: { name: 'Pemberi Dampak Berarti', strong: 'Kamu ingin hidupmu bermanfaat bagi orang lain.', grow: 'Tapi kamu bisa lupa merawat dirimu sendiri.' },
  BA: { name: 'Penjelajah Berarti', strong: 'Kamu paham dirimu dan senang belajar hal baru.', grow: 'Tapi kamu bisa terlalu lama merenung sebelum bertindak.' },
};
export const SUMBER_PEDE = {
  BA: 'Kamu cukup kenal dirimu. Itu dasar pede yang gak gampang goyah.',
  ED: 'Kamu punya gambaran arah. Orang yang tahu tujuannya lebih tenang saat ragu datang.',
  RA: 'Kamu berani mulai. Pede tumbuh dari langkah, dan modal itu sudah kamu punya.',
  AV: 'Kamu pegang nilai yang jelas. Itu bikin kamu gak gampang terseret pendapat orang.',
  RM: 'Kamu tahu apa yang bikin hidup terasa berarti. Alasan yang kuat bikin kamu bertahan.',
  TI: 'Kamu sudah memberi manfaat nyata buat orang lain. Itu bahan bakar pede yang sehat.',
};
export const PEMICU_RAGU = {
  BA: 'Kamu belum yakin apa kekuatanmu, jadi gampang membandingkan diri dengan orang lain.',
  ED: 'Arahmu belum jelas, jadi setiap pilihan terasa berisiko.',
  RA: 'Kamu sering menunda mulai. Ragu biasanya mengecil setelah langkah pertama, bukan sebelumnya.',
  AV: 'Pilihanmu masih banyak dipengaruhi ekspektasi orang, jadi pede ikut naik turun mengikuti penilaian mereka.',
  RM: 'Kamu belum menemukan alasan yang bikin semua ini layak, jadi semangat cepat habis.',
  TI: 'Kamu belum melihat dampak dirimu untuk orang lain, padahal itu sering jadi sumber pede yang paling tahan lama.',
};
export const LANGKAH_MINGGU_INI = {
  BA: 'Tanya 3 orang terdekat: "Menurutmu, apa yang paling aku kuasai?" Tulis jawabannya.',
  ED: 'Tulis satu kalimat: "Satu tahun lagi, aku ingin..." Tempel di tempat yang kamu lihat tiap hari.',
  RA: 'Pilih satu hal yang sudah lama kamu tunda, kerjakan 15 menit saja hari ini.',
  AV: 'Tulis 3 nilai hidup terpentingmu, lalu cek satu keputusan minggu ini dengan ketiganya.',
  RM: 'Setiap malam selama 7 hari, tulis satu hal yang hari ini terasa berarti.',
  TI: 'Bantu satu orang minggu ini dengan kemampuan yang kamu punya, sekecil apa pun.',
};
export const LOW_SUPPORT = 'Semua dimensimu sedang rendah, dan itu boleh. Mulai dari satu langkah kecil, pelan-pelan.';
export const MEANING_SUPPORT = 'Skor Makna Hidupmu sedang sangat rendah. Kalau akhir-akhir ini hidup terasa berat atau kosong, kamu tidak harus menanggungnya sendiri. Ceritakan ke orang yang kamu percaya, atau hubungi tenaga profesional.';

export const PACKAGES = {
  signature: { name: 'BERARTI Signature', price: 49000, label: 'Rp49.000' },
  arah90: { name: 'BERARTI Signature + Arah90', price: 99000, label: 'Rp99.000' },
  upgrade: { name: 'Upgrade ke Arah90', price: 50000, label: 'Rp50.000' },
};
