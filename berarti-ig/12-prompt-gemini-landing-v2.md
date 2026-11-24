# Prompt Gemini Canvas: Landing Page BERARTI v2 (simple, gaya FYI)

Cara pakai: buka Gemini, pilih Canvas, tempel seluruh isi blok di bawah sebagai satu pesan. Setelah jadi, isi semua `{{...}}` di bagian CONFIG paling atas kode.

Sesudah Gemini selesai, cek tiga hal:
1. Hitung soalnya, harus 36.
2. Kerjakan tes sampai hasil muncul.
3. Coba kode akses untuk membuka laporan Signature.

---

```
Buatkan satu halaman web lengkap (single-file React + Tailwind, siap jalan di Canvas) untuk BERARTI: landing page, tes 36 pertanyaan, halaman hasil gratis, dan laporan berbayar "BERARTI Signature" yang terkunci kode akses. Semua teks berbahasa Indonesia, santai tapi sopan, sapaan "kamu". Jangan pakai em dash (—) dan jangan pakai simbol "&" di teks yang tampil; pakai koma, titik, atau kata "dan".

=== 1. KONFIGURASI (taruh paling atas kode, mudah diedit) ===
const CONFIG = {
  LINK_PEMBAYARAN: "{{LINK_PEMBAYARAN_SIGNATURE}}",   // payment link Rp99.000 dengan pengiriman otomatis
  URL_APPS_SCRIPT: "{{URL_GOOGLE_APPS_SCRIPT}}",      // endpoint POST untuk simpan data dan kirim email hasil
  KODE_AKSES: ["{{KODE_AKSES_1}}"],                   // kode yang dikirim setelah bayar (huruf besar, tanpa spasi)
  NOMOR_WA: "{{NOMOR_WA_FORMAT_62}}",
  LINK_INSTAGRAM: "https://instagram.com/firasbyzi",
  NOMOR_LAYANAN_DARURAT: "{{NOMOR_LAYANAN_DARURAT}}",
  HARGA: "Rp99.000",
  SHOW_TESTIMONIALS: false   // jangan buat testimoni contoh; tampilkan hanya kalau nanti ada yang asli
};
Kalau URL_APPS_SCRIPT masih berisi "{{", lewati pengiriman data tanpa error dan tetap tampilkan hasil.

=== 2. GAYA VISUAL "BOLD EDITORIAL STAGE" ===
- Warna: latar krem #FAF3ED, hijau tua #0F3822 (panggung, tombol sekunder, footer), oranye #FF5500 (aksen dan tombol utama), teks #171A18, kartu putih.
- Huruf: Archivo Black untuk judul (HURUF BESAR, rata kiri, satu kata kunci berwarna oranye per judul), Poppins untuk teks lain. Muat dari Google Fonts.
- Label kecil di atas judul: Poppins Semibold oranye, diawali garis pendek oranye.
- Kartu: putih, sudut 26px, bayangan lembut. Kartu bernomor pakai angka besar oranye (01, 02, 03).
- Motif "Lingkaran Berani": lingkaran oranye besar di belakang elemen penting (hero dan archetype di halaman hasil).
- Mobile-first (lebar 390px), tetap rapi di desktop (maks 1100px). Tombol utama besar, mudah ditekan jempol.
- Animasi halus: muncul dari bawah saat scroll, tombol membal sedikit saat ditekan. Jangan berlebihan.

=== 3. STRUKTUR LANDING PAGE (urut dari atas) ===
1. Header tipis: logo teks "BERARTI" (Archivo Black, hijau tua) dan tombol kecil "Mulai Tes".
2. Hero:
   Label: TES REFLEKSI DIRI GRATIS
   Judul: TEMUKAN ARAH YANG BERARTI (kata BERARTI oranye)
   Subjudul: 36 pertanyaan, sekitar 6 menit. Lihat archetype, skor 6 dimensi, dan sumber percaya dirimu.
   Tombol utama: Mulai Tes Gratis
   Teks kecil di bawah tombol: Gratis, tanpa kartu kredit. Hasil langsung tampil.
   Di samping atau bawah: lingkaran oranye dengan kartu contoh hasil (archetype "Penggerak Berarti" dan radar chart 6 dimensi, beri label kecil "contoh").
3. Tiga poin singkat dengan ikon: Kenali dirimu. Lihat arahmu. Mulai langkahmu.
4. Bagian "6 ARCHETYPE BERARTI": 6 kartu (lihat bagian 6). Tiap kartu: nama, satu kalimat sisi kuat, satu kalimat "tapi..." sisi tumbuh. Di HP bisa digeser ke samping.
5. Bagian "APA YANG KAMU DAPAT": dua kolom saja.
   - Kolom GRATIS (Rp0): Archetype kamu. Skor BERARTI Index 0 sampai 100. Radar 6 dimensi. Sumber percaya dirimu. Pemicu ragumu. 1 langkah untuk minggu ini. Kartu hasil untuk Instagram Story.
   - Kolom BERARTI SIGNATURE (Rp99.000, label "bayar setelah lihat hasil"): semua yang gratis, ditambah Pola Khasmu, Titik Buta, Cara Pikir yang Perlu Digeser, Sumber Pede yang Belum Kamu Pakai, Peta 90 Hari (Arah90), dan Langkah 7 Hari Pertama.
   - Kalimat kecil di bawah: Kerjakan tesnya dulu. Bayar hanya kalau kamu ingin membuka laporan lengkap.
6. Bagian "CARA KERJANYA": 4 kartu bernomor. 01 Jawab 36 pertanyaan. 02 Isi nama dan email supaya hasil terkirim. 03 Lihat hasil gratismu. 04 Buka BERARTI Signature kalau kamu ingin rencana 90 hari.
7. Bagian "DI BALIK TES INI": kotak foto (placeholder abu-abu bertuliskan "Foto Firas") dan teks: "Tes ini disusun oleh Firas Byzi untuk membantu kamu mengenal diri, menyaring arah, dan mulai melangkah. Ini tes refleksi diri, bukan tes psikologi klinis dan bukan diagnosis."
8. Testimoni: hanya dirender kalau CONFIG.SHOW_TESTIMONIALS true. Jangan isi contoh.
9. FAQ (accordion):
   - Berapa lama tesnya? Sekitar 6 menit untuk 36 pertanyaan.
   - Apakah gratis? Tes dan hasil dasarnya gratis. Laporan BERARTI Signature Rp99.000, opsional, dibayar setelah kamu melihat hasil.
   - Apakah ini tes psikologi? Bukan. Ini tes refleksi diri untuk mengenal pola arah hidupmu, bukan diagnosis.
   - Data saya dipakai untuk apa? Untuk mengirim hasilmu dan info dari BERARTI. Kamu bisa minta berhenti atau minta datamu dihapus kapan saja lewat WhatsApp.
   - Apakah hasil bisa berubah? Bisa. Hasilnya menggambarkan kondisimu sekarang. Coba lagi setelah 90 hari.
   - Bagaimana kalau saya sedang sangat terpuruk? Tes ini bukan pengganti bantuan profesional. Kalau kamu merasa tidak aman, hubungi layanan darurat di CONFIG.NOMOR_LAYANAN_DARURAT atau orang yang kamu percaya.
10. Footer hijau tua: BERARTI, tagline "Dari bingung menjadi berarti", link Instagram, WhatsApp, Kebijakan Privasi (buka modal berisi kebijakan singkat dan jujur sesuai FAQ data), dan Syarat Penggunaan (modal).

=== 4. ALUR TES ===
- Layar pembuka (seperti kartu ringkasan): Total 36 pertanyaan. Estimasi 6 menit. Output: archetype, skor 6 dimensi, langkah pertama. Kalimat: "Di akhir tes kamu mengisi nama dan email supaya hasilnya bisa dikirim. WhatsApp boleh dikosongkan." Penjelasan skala 1 sampai 5. Tombol "Mulai".
- Satu pertanyaan per layar, urutan diacak (seed tetap supaya konsisten), tampil "Pertanyaan 7 dari 36" dan bilah progres.
- Lima tombol jawaban besar: 1 Sangat tidak setuju, 2 Tidak setuju, 3 Netral, 4 Setuju, 5 Sangat setuju. Tekan jawaban langsung pindah ke soal berikutnya. Ada tombol "Kembali".
- Simpan progres ke localStorage (dibungkus try/catch) supaya tidak hilang saat halaman ter-refresh.
- Layar data (setelah soal 36): Nama (wajib), Email (wajib, cek format), WhatsApp (opsional, format 62...), centang wajib "Saya setuju data saya disimpan untuk mengirim hasil dan info dari BERARTI. Saya bisa berhenti kapan saja." Tombol "Lihat Hasilku".
- Saat tombol ditekan: kirim POST JSON ke CONFIG.URL_APPS_SCRIPT berisi nama, email, wa, persetujuan, waktu, 6 skor, skor total, archetype, dimensi terendah, dan sumber kunjungan (utm_source dari URL). Pakai mode "no-cors". Apa pun hasilnya, lanjut tampilkan hasil.

=== 5. PERTANYAAN (36, gunakan persis) ===
Dimensi dan bobot skor total:
- BA Mengenal Diri (0.15)
- ED Kejelasan Arah (0.25)
- RA Kesiapan Bertindak (0.15)
- AV Keselarasan Nilai (0.15)
- RM Makna Hidup (0.15)
- TI Kontribusi (0.15)
Tanda (R) = skor dibalik (6 dikurangi jawaban).

BA:
1. Saya mengetahui kemampuan yang paling menonjol dalam diri saya.
2. Saya tahu aktivitas yang membuat saya bersemangat.
3. Saya memahami situasi yang membuat saya tampil optimal.
4. Saya memahami apa yang penting bagi diri saya.
5. (R) Saya sering bingung sebenarnya saya ingin menjadi pribadi seperti apa.
6. (R) Saya merasa identitas diri saya masih berubah-ubah mengikuti lingkungan.
ED:
7. Saya memiliki gambaran hidup yang ingin saya bangun.
8. Saya mengetahui prioritas terbesar dalam hidup saya saat ini.
9. Saya memiliki tujuan jangka panjang yang cukup jelas.
10. Saya mengetahui langkah besar yang perlu saya ambil berikutnya.
11. (R) Saya sering merasa kehilangan arah hidup.
12. (R) Saya bingung harus fokus pada hal apa dalam beberapa tahun ke depan.
RA:
13. Saya yakin bisa menghadapi tantangan yang muncul dalam hidup saya.
14. Saya mampu membuat keputusan penting ketika diperlukan.
15. Saya percaya masa depan saya bisa menjadi lebih baik melalui usaha yang saya lakukan.
16. Saya mampu bangkit kembali setelah mengalami kegagalan.
17. (R) Saya terlalu banyak berpikir sampai sulit mengambil tindakan.
18. (R) Saya takut mencoba karena khawatir dinilai orang lain.
AV:
19. Saya mengetahui nilai hidup yang paling penting bagi saya.
20. Saya berusaha mengambil keputusan sesuai dengan prinsip yang saya yakini.
21. Saya memiliki alasan yang jelas atas pilihan hidup yang saya ambil.
22. Saya merasa hidup saya cukup sesuai dengan hati nurani saya.
23. (R) Saya sering menjalani sesuatu hanya karena ekspektasi orang lain.
24. (R) Saya merasa hidup saya terlalu dipengaruhi penilaian orang lain.
RM:
25. Saya merasa hidup saya memiliki arti yang penting.
26. Saya merasa kehidupan yang saya jalani memiliki tujuan yang bernilai.
27. Saya merasa apa yang saya lakukan saat ini memiliki makna bagi diri saya.
28. Saya memiliki alasan yang membuat saya tetap bersemangat menjalani hidup.
29. (R) Saya merasa hanya menjalani rutinitas tanpa makna yang jelas.
30. (R) Saya sering mempertanyakan apakah hidup saya benar-benar berarti.
TI:
31. Saya ingin hidup saya memberi manfaat bagi orang lain.
32. Saya ingin kemampuan yang saya miliki dapat digunakan untuk hal yang bermanfaat.
33. Saya ingin meninggalkan dampak positif melalui hidup saya.
34. Saya ingin kehidupan saya bernilai di hadapan manusia dan Tuhan.
35. (R) Saya jarang memikirkan manfaat yang bisa saya berikan untuk orang lain.
36. (R) Saya merasa kemampuan saya belum cukup berarti untuk membantu orang lain.

Skor per dimensi: jumlah 6 jawaban (6 sampai 30), lalu ubah ke 0 sampai 100 dengan rumus round((jumlah - 6) / 24 * 100).
Skor total BERARTI Index: jumlah skor dimensi dikali bobotnya, dibulatkan.

=== 6. ARCHETYPE (6, ditentukan oleh dimensi dengan skor tertinggi) ===
Kalau seri, urutan prioritas: ED, RA, AV, RM, TI, BA.
- ED Penentu Arah Berarti. Kuat: kamu tahu mau ke mana dan bisa memilah prioritas. Tumbuh: tapi kamu bisa terlalu kaku pada rencana sampai lupa menikmati prosesnya.
- RA Penggerak Berarti. Kuat: kamu berani mulai dan cepat bangkit. Tumbuh: tapi kamu kadang jalan sebelum arahnya benar-benar jelas.
- AV Penjaga Nilai Berarti. Kuat: kamu konsisten dan pilihanmu tulus. Tumbuh: tapi kamu bisa sulit berkompromi saat keadaan berubah.
- RM Pencari Makna Berarti. Kuat: kamu peka pada alasan di balik setiap hal. Tumbuh: tapi kamu bisa lama ragu sebelum memilih jalan.
- TI Pemberi Dampak Berarti. Kuat: kamu ingin hidupmu bermanfaat bagi orang lain. Tumbuh: tapi kamu bisa lupa merawat dirimu sendiri.
- BA Penjelajah Berarti. Kuat: kamu paham dirimu dan senang belajar hal baru. Tumbuh: tapi kamu bisa terlalu lama merenung sebelum bertindak.
Kalau semua skor di bawah 45: tetap tampilkan archetype tertinggi, tambahkan kalimat "Semua dimensimu sedang rendah, dan itu boleh. Mulai dari satu langkah kecil di bawah ini, pelan-pelan."

=== 7. HALAMAN HASIL GRATIS ===
Urutan:
1. Label "ARCHETYPE KAMU", nama archetype besar (Archivo Black) di depan Lingkaran Berani oranye, lalu sisi kuat dan sisi tumbuh.
2. Skor BERARTI Index 0 sampai 100 dengan angka besar.
3. Radar chart 6 dimensi (SVG buatan sendiri, tanpa library) dan daftar 6 skor dengan bilah.
4. Kartu "Sumber percaya dirimu" (dimensi tertinggi):
   BA: Kamu cukup kenal dirimu. Itu dasar pede yang gak gampang goyah.
   ED: Kamu punya gambaran arah. Orang yang tahu tujuannya lebih tenang saat ragu datang.
   RA: Kamu berani mulai. Pede tumbuh dari langkah, dan modal itu sudah kamu punya.
   AV: Kamu pegang nilai yang jelas. Itu bikin kamu gak gampang terseret pendapat orang.
   RM: Kamu tahu apa yang bikin hidup terasa berarti. Alasan yang kuat bikin kamu bertahan.
   TI: Kamu ingin hidupmu bermanfaat. Niat itu bisa jadi bahan bakar pede yang sehat.
5. Kartu "Pemicu ragumu" (dimensi terendah):
   BA: Kamu belum yakin apa kekuatanmu, jadi gampang membandingkan diri dengan orang lain.
   ED: Arahmu belum jelas, jadi setiap pilihan terasa berisiko.
   RA: Kamu sering menunda mulai. Ragu biasanya mengecil setelah langkah pertama, bukan sebelumnya.
   AV: Pilihanmu masih banyak dipengaruhi ekspektasi orang, jadi pede ikut naik turun mengikuti penilaian mereka.
   RM: Kamu belum menemukan alasan yang bikin semua ini layak, jadi semangat cepat habis.
   TI: Kamu belum melihat dampak dirimu untuk orang lain, padahal itu sering jadi sumber pede yang paling tahan lama.
6. Kartu "1 langkah minggu ini" (dimensi terendah):
   BA: Tanya 3 orang terdekat: "Menurutmu, apa yang paling aku kuasai?" Tulis jawabannya.
   ED: Tulis satu kalimat: "Satu tahun lagi, aku ingin..." Tempel di tempat yang kamu lihat tiap hari.
   RA: Pilih satu hal yang sudah lama kamu tunda, kerjakan 15 menit saja hari ini.
   AV: Tulis 3 nilai hidup terpentingmu, lalu cek satu keputusan minggu ini dengan ketiganya.
   RM: Setiap malam selama 7 hari, tulis satu hal yang hari ini terasa berarti.
   TI: Bantu satu orang minggu ini dengan kemampuan yang kamu punya, sekecil apa pun.
7. Tombol "Unduh kartu Story": buat gambar 1080x1920 dengan canvas (latar krem, Lingkaran Berani oranye, nama archetype, radar kecil, skor, tulisan "#jadiberarti" dan "@firasbyzi"), lalu unduh sebagai PNG.
8. Bagian terkunci "BERARTI SIGNATURE": tampilkan judul 6 bagian laporan (lihat bagian 8) dengan isi diburamkan (blur), ikon gembok, lalu:
   Judul: BUKA LAPORAN LENGKAPMU
   Teks: Pola khas, titik buta, dan Peta 90 Hari yang disusun dari jawabanmu sendiri.
   Tombol utama: "Buka BERARTI Signature Rp99rb" (buka CONFIG.LINK_PEMBAYARAN di tab baru).
   Di bawahnya kolom "Sudah bayar? Masukkan kode akses" dan tombol "Buka". Kode dicocokkan dengan CONFIG.KODE_AKSES (tidak peka huruf besar kecil). Kalau cocok, buka laporan dan simpan status terbuka ke localStorage. Kalau salah, tampilkan "Kode belum cocok. Cek pesan setelah pembayaran atau hubungi kami di WhatsApp."
9. Tombol sekunder "Kirim hasilku ke WhatsApp" yang membuka wa.me ke CONFIG.NOMOR_WA dengan pesan berisi archetype dan skor.

=== 8. LAPORAN BERARTI SIGNATURE (setelah kode benar) ===
Disusun dari archetype dan dimensi terendah. Tulis isinya sendiri mengikuti aturan berikut, lalu tandai setiap blok teks dengan komentar // DRAF, PERLU DICEK FIRAS:
1. Pola Khasmu: 3 kalimat per archetype, menjelaskan cara archetype itu biasanya mengambil keputusan dan bergerak.
2. Titik Buta: 3 kalimat per archetype, jujur tapi tidak menghakimi.
3. Cara Pikir yang Perlu Digeser: 3 pasangan "Dari: ... Ke: ..." per archetype.
4. Sumber Pede yang Belum Kamu Pakai: berdasarkan dimensi terendah kedua, 2 kalimat.
5. Peta 90 Hari (Arah90): berdasarkan dimensi terendah, 3 fase (Hari 1 sampai 30, 31 sampai 60, 61 sampai 90), tiap fase 1 fokus dan 2 aksi mingguan yang konkret dan bisa diukur.
6. Langkah 7 Hari Pertama: checklist 7 hari yang bisa dicentang (status disimpan ke localStorage).
Aturan isi: tidak menjanjikan hasil pasti, tidak memakai dalil agama sebagai dasar klaim, refleksi iman hanya sebagai pilihan ("kalau kamu nyaman..."), bahasa sederhana, kalimat pendek.
Tambahkan tombol "Cetak atau simpan PDF" (window.print dengan gaya cetak yang rapi).

=== 9. LARANGAN ===
- Jangan membuat testimoni, jumlah pengguna, rating, logo media, atau klaim ilmiah yang tidak ada.
- Jangan menulis "tes psikologi". Tulis "tes refleksi diri".
- Jangan menampilkan mentoring, komunitas, atau harga lain selain Rp99.000.
- Jangan memakai library chart eksternal; radar chart buat dengan SVG.
```

---

## Yang perlu kamu siapkan sebelum halaman dipasang

| Isian | Dari mana |
| --- | --- |
| `{{LINK_PEMBAYARAN_SIGNATURE}}` | Payment link Rp99.000 dari platform pembayaranmu. Atur pesan terima kasih otomatis berisi kode akses dan link Peta 90 Hari versi workbook |
| `{{URL_GOOGLE_APPS_SCRIPT}}` | Web app Apps Script yang menyimpan data ke Google Sheets dan mengirim email hasil. Saya bisa tuliskan kodenya terpisah |
| `{{KODE_AKSES_1}}` | Kode yang kamu tentukan sendiri, misalnya diganti tiap bulan |
| `{{NOMOR_WA_FORMAT_62}}` | Nomor WhatsApp BERARTI |
| `{{NOMOR_LAYANAN_DARURAT}}` | Nomor layanan krisis yang berlaku di Indonesia, cek sendiri sebelum tayang |

Catatan jujur soal kode akses: kode yang dicek di dalam halaman bisa ditemukan oleh orang yang paham teknis. Untuk volume sekarang risikonya kecil. Kalau penjualan sudah puluhan per hari, pindahkan pengecekan kode ke Apps Script.
