import { CONFIG } from '../config.js';
// DRAF: periksa bersama orang yang paham hukum sebelum tayang (UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi, aturan perlindungan konsumen).
const UPDATED = '24 November 2026';
const PAGES = {
  privasi: ['Kebijakan Privasi', <>
    <p>BERARTI dikelola oleh Firas Byzi. Halaman ini menjelaskan data apa yang kami kumpulkan, untuk apa, dan hakmu atas data itu.</p>
    <h3>Data yang kami kumpulkan</h3>
    <ul><li>Nama, email, dan nomor WhatsApp (opsional) yang kamu isi setelah tes.</li><li>Skor 6 dimensi, archetype, dan jawaban refleksi opsional.</li><li>Data pembelian dari Lynk.id: nama, email, nomor telepon, nomor transaksi, dan paket.</li><li>Jawaban dan progres di aplikasi Arah90 (Gali, Kanvas, Peta 90, Cek-in).</li><li>Catatan kunjungan tanpa identitas (misalnya jumlah orang yang mulai dan menyelesaikan tes) untuk memperbaiki layanan.</li></ul>
    <h3>Untuk apa data dipakai</h3>
    <ul><li>Mengirim hasil tes, kode akses, dan laporan.</li><li>Menyimpan progres Arah90 supaya bisa dilanjutkan di perangkat lain.</li><li>Mengirim info dan penawaran dari BERARTI. Kamu bisa berhenti kapan saja.</li></ul>
    <h3>Pihak lain yang terlibat</h3>
    <p>Data disimpan di Google Sheets milik pengelola dan dikirim lewat Gmail. Situs berjalan di Vercel. Pembayaran diproses Lynk.id. Jawaban di Gali, Kanvas, dan Cek-in dikirim ke Google Gemini untuk menghasilkan pertanyaan lanjutan dan saran; jangan menulis data sensitif seperti nomor identitas atau rekening. Kami tidak menjual datamu.</p>
    <h3>Lama penyimpanan</h3>
    <p>Data disimpan selama kamu masih menerima layanan BERARTI, paling lama 2 tahun sejak interaksi terakhir, lalu dihapus.</p>
    <h3>Hakmu</h3>
    <p>Kamu bisa meminta salinan, perbaikan, atau penghapusan datamu, dan berhenti menerima email, dengan membalas email kami atau menghubungi WhatsApp {CONFIG.NOMOR_WA}. Permintaan diproses paling lambat 14 hari.</p>
  </>],
  syarat: ['Syarat Penggunaan', <>
    <p>BERARTI Index adalah tes refleksi diri, bukan tes psikologi klinis, bukan diagnosis, dan bukan pengganti bantuan tenaga profesional.</p>
    <p>Saran di laporan dan aplikasi Arah90, termasuk yang dibuat AI, bersifat umum. Keputusan tetap di tanganmu.</p>
    <p>Kode akses bersifat pribadi. Membagikan kode atau isi laporan berbayar ke orang lain tidak diperbolehkan, dan kode yang disalahgunakan dapat dinonaktifkan.</p>
    <p>Kalau kamu merasa tidak aman atau ingin menyakiti diri, hubungi orang yang kamu percaya atau layanan darurat: {CONFIG.LAYANAN_DARURAT}.</p>
  </>],
  refund: ['Kebijakan Refund', <>
    <p>Kamu bisa melihat hasil gratis sebelum membayar, jadi pembelian bersifat final setelah laporan atau aplikasi Arah90 dibuka.</p>
    <p>Kami mengembalikan uangmu penuh kalau: (1) kamu membayar tapi tidak menerima kode dalam 24 jam dan kami tidak bisa memperbaikinya; (2) kamu tertagih dua kali untuk paket yang sama; atau (3) laporan atau aplikasi tidak bisa dibuka karena kesalahan dari kami dan tidak bisa diperbaiki dalam 3 hari kerja.</p>
    <p>Ajukan lewat WhatsApp {CONFIG.NOMOR_WA} dengan menyertakan email pembelian dan nomor transaksi Lynk.id, paling lambat 7 hari setelah pembayaran.</p>
  </>],
};
export default function Legal({ kind }) {
  const [title, body] = PAGES[kind];
  return <div className="narrow legal" style={{ padding: '40px 20px 70px' }}><div className="label">Diperbarui {UPDATED}</div><h1 className="h2">{title}</h1>{body}</div>;
}
