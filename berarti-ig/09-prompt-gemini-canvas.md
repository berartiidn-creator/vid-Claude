# 3 Prompt Gemini Canvas

Urutan bangun: Prompt 1 dulu (landing page dan hasil tes), lalu Prompt 2 (tool gratis), lalu Prompt 3 (Arah90 versi pertama).

Keputusan yang sudah dikunci di prompt ini:
- **Pintu masuk: percaya diri.** Territory tetap arah hidup. Pesan utamanya: pede bukan bawaan lahir, pede datang dari kenal diri dan tahu arah.
- **Faith-friendly.** Terbuka untuk semua orang. Refleksi nilai dan iman ditawarkan sebagai pilihan, tidak dipaksakan.
- **Tool gratis diganti** dari Saring Pilihan ke **Pede60**, karena pintu masuknya sekarang percaya diri dan ini keahlian asli Firas (mengajar public speaking).

Cara pakai: buka gemini.google.com, pilih Canvas, tempel satu prompt utuh. Untuk Prompt 1, unggah juga file `berarti_landing_page.tsx`. Ganti semua `{{...}}` sebelum dibagikan.

---

## Blok pengaman (sudah ada di dalam ketiga prompt, jangan dihapus)

```text
PENGAMAN WAJIB
- Ini alat refleksi diri, bukan diagnosis atau terapi psikologis. Tulis kalimat ini di footer setiap layar hasil.
- Kalau jawaban user mengandung tanda krisis (ingin mengakhiri hidup, menyakiti diri, merasa tidak ada harapan sama sekali, tidak sanggup menjalani hari), hentikan alur coaching. Tampilkan pesan hangat tanpa menghakimi, sarankan bicara dengan orang terdekat dan tenaga profesional (psikolog atau psikiater), dan tampilkan kontak layanan darurat: {{NOMOR_LAYANAN_DARURAT}}. Jangan lanjut ke ajakan membeli di layar itu.
- Jangan pernah mengklaim hasil pasti ("dijamin pede", "pasti sukses").
- Jangan menyimpan atau mengirim data user ke server mana pun selain yang disebut di prompt ini.
```

Isi `{{NOMOR_LAYANAN_DARURAT}}` dengan layanan yang sudah kamu cek masih aktif. Contoh yang pernah dipakai di Indonesia adalah layanan kesehatan jiwa Kemenkes lewat 119 ekstensi 8. Cek dulu sebelum tayang.

---

## Prompt 1: Perbaikan landing page dan halaman hasil BERARTI Index

```text
Saya mengunggah file berarti_landing_page.tsx. Perbaiki file ini tanpa mengubah logika skor dan rumus archetype yang sudah ada (DIMENSIONS, QUESTIONS, ARCHETYPES, cara menghitung norm dan total). Hasil akhir: satu file React yang bisa langsung dijalankan di Canvas.

KONSTANTA DI BAGIAN ATAS FILE (supaya mudah saya ganti)
- LINK_PEMBAYARAN = "{{LINK_PEMBAYARAN_ARAH90}}"
- NOMOR_WA = "{{NOMOR_WA_FORMAT_62}}"
- LINK_INSTAGRAM = "https://instagram.com/firasbyzi"
- VIDEO_URL = "" (kalau kosong, sembunyikan seksi video)
- SHOW_TESTIMONIALS = false
- NOMOR_LAYANAN_DARURAT = "{{NOMOR_LAYANAN_DARURAT}}"

1. NAMA DAN GAYA BAHASA
- Ganti semua "Life Direction Starter Kit" dan "Starter Kit" menjadi "BERARTI Arah90". Nama tes tetap "BERARTI Index".
- Ganti semua sapaan "Anda" menjadi "kamu". Gaya bahasa: santai, hangat, kalimat pendek, pakai "aku" untuk Firas.
- Hapus semua karakter em dash dan simbol ampersand di teks yang tampil. Pakai koma, titik, atau kata "dan".
- Ganti istilah "tes psikologi" menjadi "tes refleksi diri". Ganti "dalam 5 menit" menjadi "sekitar 10 menit".

2. HERO (pintu masuk percaya diri)
- Headline: "Kamu Gak Kurang Pede. Kamu Belum Kenal Dirimu dan Arahmu."
- Subheadline: "Pede bukan bawaan lahir. Pede datang dari tahu kamu siapa, apa yang kamu pegang, dan mau ke mana. Mulai dari tes 60 pertanyaan, gratis."
- Tombol utama: "Mulai Tes BERARTI Index Gratis". Tombol kedua: "Lihat BERARTI Arah90".

3. HAPUS CHECKOUT PALSU
- Hapus modal checkout yang langsung menampilkan "Pemesanan Berhasil".
- Semua tombol beli membuka LINK_PEMBAYARAN di tab baru.

4. HALAMAN HASIL TES (bagian terpenting)
a. Simpan hasil (norm, total, archetype, tanggal) ke localStorage. Saat halaman dibuka ulang, tampilkan tombol "Lihat hasil terakhirku".
b. Tambahkan dua baris setelah nama archetype:
   - "Sumber pede kamu": nama pilar dengan skor tertinggi, plus 1 kalimat kenapa itu modal.
   - "Yang bikin kamu ragu": nama pilar dengan skor terendah, plus 1 kalimat tanpa menghakimi.
c. Kartu hasil ukuran 1080x1920 (rasio 9:16) yang bisa diunduh sebagai PNG pakai html2canvas dari cdnjs. Isi kartu: nama archetype, skor total, 6 bar dimensi, baris "Sumber pede" dan "Yang bikin ragu", teks kecil "BERARTI Index by Firas Byzi". Warna latar #111827, aksen #2563EB, font Inter.
d. Kode hasil yang bisa disalin dengan satu klik, format: BA70-ED55-RA60-AV80-RM45-TI90. Beri label "Simpan kode ini, dipakai di Arah90."
e. Tombol "Kirim hasilku ke WhatsApp Firas" yang membuka https://wa.me/NOMOR_WA?text= dengan pesan terisi: "Halo Firas, hasil BERARTI Index aku: [archetype], skor [total]. Kode: [kode hasil]. Aku mau tahu langkah berikutnya."
f. Jembatan ke produk: "Hasil ini peta. Arah90 yang bantu kamu jalan selama 12 minggu." Tampilkan harga Rp99.000 dan tombol ke LINK_PEMBAYARAN.
g. Pengaman: kalau archetype "The Lost Wanderer", atau skor Relevance and Meaning dan Envisioning Direction dua-duanya di bawah 35, tampilkan dulu kotak dukungan yang hangat (kamu tidak sendirian, wajar merasa begini, bicara dengan orang yang dipercaya atau tenaga profesional, kontak NOMOR_LAYANAN_DARURAT). Tombol beli tetap ada, tapi di bawah kotak itu dan tidak menonjol.

5. ISI PRODUK (seksi "Di dalam Arah90")
Ganti daftar 5 item menjadi:
- Ebook materi inti BERARTI Framework (PDF)
- Workbook Google Sheets yang otomatis mengikuti skor dan archetype kamu: Reflection Journal, Life Design Canvas, Roadmap 90 Hari, Impact Statement, AI Prompt Hub
- Upgrade gratis ke aplikasi Arah90 saat rilis
Beri label kecil "Versi awal".

6. TESTIMONI
Kosongkan array TESTIMONIALS. Kalau SHOW_TESTIMONIALS false atau array kosong, sembunyikan seksinya dan tampilkan kotak "Jadi angkatan pertama Arah90" berisi ajakan memberi masukan.

7. FAQ
- "Bagaimana cara akses produknya?": "Setelah pembayaran berhasil, kamu dapat email berisi ebook dan link salinan workbook Google Sheets milikmu sendiri."
- Tambahkan: "Apakah BERARTI cocok dengan nilai agama aku?": "BERARTI terbuka untuk semua orang. Di dalamnya ada ruang untuk merefleksikan nilai dan iman yang kamu pegang, tanpa memaksakan satu sudut pandang."
- Tambahkan: "Apakah ini diagnosis psikologis?": "Bukan. BERARTI Index adalah alat refleksi diri. Kalau kamu sedang merasa sangat berat, bicara dengan psikolog atau psikiater."
- Garansi: biarkan teksnya, tapi pindahkan angka hari ke konstanta GARANSI_HARI = 7.

8. VIDEO DAN FOOTER
- Seksi video hanya tampil kalau VIDEO_URL berisi link YouTube, tampil sebagai iframe embed.
- Footer: Instagram ke LINK_INSTAGRAM, WhatsApp ke wa.me/NOMOR_WA, Kontak ke wa.me/NOMOR_WA. Hapus Privacy Policy dan Terms kalau belum ada halamannya, atau arahkan ke konstanta LINK_PRIVASI dan LINK_SYARAT yang bisa saya isi.

9. TEKNIS
- Mobile first, tidak ada scroll horizontal di lebar 360px.
- Pertahankan Tailwind dan lucide-react yang sudah dipakai.
- Jangan tambah backend.

PENGAMAN WAJIB
- Ini alat refleksi diri, bukan diagnosis atau terapi psikologis. Tulis kalimat ini di footer setiap layar hasil.
- Kalau jawaban user mengandung tanda krisis, hentikan ajakan membeli di layar itu, tampilkan pesan hangat dan kontak NOMOR_LAYANAN_DARURAT.
- Jangan pernah mengklaim hasil pasti.
```

---

## Prompt 2: Pede60 (tool gratis, pintu masuk TOFU)

```text
Buat aplikasi web satu halaman bernama "Pede60 by BERARTI". Fungsinya: membantu orang Indonesia umur 18 sampai 35 menyiapkan omongan 60 detik supaya lebih pede saat harus bicara.

GAYA
- Bahasa Indonesia santai, pakai "kamu", kalimat pendek. Tanpa em dash, tanpa simbol ampersand.
- Desain: latar putih, teks #111827, aksen #2563EB, font Inter dari Google Fonts, kartu sudut membulat, banyak ruang kosong. Mobile first.

ALUR
Layar 1: "Kamu mau ngomong di situasi apa?" Pilihan kartu:
- Perkenalan diri (kelas, kantor baru, komunitas)
- Interview: "ceritakan tentang dirimu"
- Presentasi atau rapat
- Pitch ide ke atasan atau klien
- Sambutan acara atau kultum singkat
- Lainnya (isi sendiri)

Layar 2: isian singkat sesuai situasi (maksimal 5 kolom), misalnya: siapa audiensnya, 1 hal yang ingin mereka ingat, latar atau pengalamanmu, hal yang bikin kamu grogi. Ada pertanyaan pilihan: "Mau sertakan sentuhan nilai atau iman di omonganmu?" (Ya atau Tidak, default Tidak).

Layar 3: panggil Gemini (pakai integrasi Gemini bawaan Canvas, jangan menulis API key di kode). Minta jawaban dalam format JSON dengan kunci:
- struktur: { pembuka, isi: [3 poin], penutup }
- naskah_60: naskah utuh sekitar 140 sampai 160 kata
- naskah_30: versi pendek sekitar 70 kata
- kata_kunci: 3 kata pengingat (supaya user tidak menghafal kalimat)
- kalimat_darurat: 1 kalimat yang bisa diucapkan kalau tiba-tiba blank
- latihan: 3 langkah latihan 3 menit yang realistis (misalnya baca keras 3 kali, rekam suara, ulang tanpa melihat naskah)
Aturan untuk Gemini: pakai kata-kata user sendiri, jangan mengarang pencapaian atau angka yang tidak user tulis, bahasa lisan yang enak diucapkan, kalau user memilih nilai atau iman cukup 1 kalimat yang tulus dan tidak menggurui.

Tampilan hasil:
- Kartu struktur, naskah 60 detik dengan tombol salin, tab naskah 30 detik.
- Timer 60 detik dengan tombol mulai, supaya user bisa latihan langsung.
- Kartu "3 kata kunci" ukuran 1080x1920 yang bisa diunduh PNG (html2canvas dari cdnjs), dengan teks kecil "Pede60 by BERARTI".
- Tombol "Bikin ulang dengan nada lebih santai" dan "lebih formal".

Layar akhir (ajakan, satu saja):
"Omongan bisa disiapin. Pede yang tahan lama datang dari kenal diri dan tahu arah. Cek posisimu di tes BERARTI Index, gratis." Tombol ke {{LINK_BERARTI_INDEX}}.

TEKNIS
- Simpan isian terakhir di localStorage supaya tidak hilang saat refresh. Bungkus semua akses localStorage dengan try catch.
- Tampilkan status memuat yang jelas saat menunggu Gemini, dan pesan ramah kalau gagal, dengan tombol coba lagi.
- Batasi panjang setiap kolom isian 300 karakter.

PENGAMAN WAJIB
- Ini alat latihan bicara, bukan terapi. Tulis ini kecil di footer.
- Kalau isian user mengandung tanda krisis (ingin mengakhiri hidup, menyakiti diri, merasa tidak ada harapan), jangan buat naskah. Tampilkan pesan hangat, sarankan bicara dengan orang terdekat atau tenaga profesional, dan tampilkan kontak {{NOMOR_LAYANAN_DARURAT}}.
- Jangan mengklaim hasil pasti.
```

---

## Prompt 3: BERARTI Arah90, versi pertama (4 modul)

```text
Buat aplikasi web bernama "BERARTI Arah90". Ini produk berbayar: pendamping 12 minggu untuk orang umur 20 sampai 35 yang ingin lebih pede karena tahu dirinya dan arahnya. Aplikasi memakai hasil tes BERARTI Index sebagai titik awal. Versi pertama berisi 4 modul dalam satu aplikasi dengan navigasi tab: Baca, Gali, Kanvas, Peta 90. Jawaban dari satu modul otomatis dibawa ke modul berikutnya.

GAYA
- Bahasa Indonesia santai dan hangat, pakai "kamu". Tegas pada ide, lembut pada orangnya. Tanpa em dash, tanpa simbol ampersand.
- Desain: latar #F9FAFB, kartu putih, teks #111827, aksen #2563EB, font Inter, sudut membulat, progress bar di atas yang menunjukkan modul mana yang sudah selesai. Mobile first. Terasa seperti alat yang rapi, bukan poster motivasi.

DATA DAN RUMUS (wajib dipakai persis)
6 dimensi (kode, nama, bobot total):
BA Being Aware 0.15, ED Envisioning Direction 0.25, RA Readiness to Act 0.15, AV Alignment of Values 0.15, RM Relevance and Meaning 0.15, TI Transcendence and Impact 0.15.
Total = jumlah (skor dimensi x bobot), dibulatkan.
Archetype, dicek berurutan, yang pertama cocok dipakai:
1 The Future Leader: BA>80, ED>80, RA>80, TI>75
2 The Aligned Builder: BA, ED, RA, AV, RM, TI semua >75
3 The Contributor: RM>75, TI>75, ED>65
4 The Emerging Builder: ED>70, RA>65, BA>65
5 The Meaning Seeker: RM>75, TI>70, ED<65
6 The Drifting Achiever: ED>70, RM<50, TI<60
7 The People Pleaser: AV<45, BA>50
8 The Overthinker: BA>65, RA<45, ED antara 45 dan 70
9 The Explorer: BA>60, ED antara 50 dan 70, RA>50
10 The Lost Wanderer: ED<45, RM<45, BA<60
11 The Transitioner: selain semua di atas

LAYAR MASUK
- Kolom "Kode hasil BERARTI Index" dengan format BA70-ED55-RA60-AV80-RM45-TI90. Kalau user belum punya, tampilkan 6 slider 0 sampai 100 dan link ke {{LINK_BERARTI_INDEX}}.
- Kolom nama panggilan.
- Pertanyaan: "Mau sertakan refleksi nilai dan iman di perjalanan ini?" (Ya atau Tidak). Simpan sebagai preferensi.
- Kolom kode akses. Bandingkan dengan konstanta KODE_AKSES = "{{KODE_AKSES}}" di bagian atas kode. (Catatan untuk saya: ini penghalang ringan, bukan keamanan penuh.)

MODUL 1, BACA
- Tampilkan archetype, total, dan radar chart 6 dimensi (Chart.js dari cdnjs).
- Panggil Gemini untuk menjelaskan dalam bahasa sehari-hari: arti archetype ini untuk hidup dan karier, "Sumber pede kamu" (pilar tertinggi), "Yang bikin kamu ragu" (pilar terendah), dan 1 hal yang perlu diingat minggu ini. Maksimal 180 kata.
- Kartu archetype 1080x1920 bisa diunduh PNG (html2canvas dari cdnjs), dengan teks kecil "BERARTI Arah90".

MODUL 2, GALI
- Tanyakan satu pertanyaan per layar, mulai dari pilar terlemah, lalu pilar lain. Bank pertanyaan dasar:
  BA: Kalau gak ada yang menilai, aktivitas apa yang bakal kamu lakukan tiap hari? / Kekuatan apa yang sering diakui orang lain tapi jarang kamu akui sendiri?
  ED: Bayangin hidupmu 5 tahun lagi dalam versi terbaik, apa yang kamu lihat? / Kalau semua pilihan kelihatan menarik, 3 hal apa yang paling penting buat jadi filter?
  RA: Langkah apa yang udah kamu tahu harus diambil, tapi terus kamu tunda? / Ketakutan terbesar apa yang menahan kamu mulai hari ini?
  AV: Keputusan besar apa yang lebih mengikuti ekspektasi orang lain? / Nilai apa yang paling ingin kamu pegang, apa pun risikonya?
  RM: Momen apa yang terasa paling berarti dalam hidupmu, dan kenapa? / Kalau hidupmu sebuah cerita, tema apa yang ingin kamu perjuangkan di babak berikutnya?
  TI: Siapa yang ingin kamu bantu, dan masalah apa yang ingin kamu selesaikan untuk mereka? / Kamu ingin diingat sebagai orang seperti apa 10 tahun lagi?
- Kalau preferensi nilai dan iman "Ya", tambahkan 1 pertanyaan pilihan di RM atau TI, misalnya: "Keyakinan atau nilai iman apa yang paling ingin kamu hidupi lewat arah ini?"
- Setelah setiap jawaban, panggil Gemini untuk membuat 1 pertanyaan lanjutan yang lebih tajam berdasarkan jawaban itu (maksimal 1 lanjutan per pertanyaan). User boleh melewati.
- Di akhir modul, Gemini membuat ringkasan insight per pilar (maksimal 2 kalimat per pilar) dan satu kalimat "pola yang aku lihat dari jawabanmu". Pakai kata-kata user, jangan mengarang fakta.

MODUL 3, KANVAS
- Gemini mengisi otomatis 6 kotak dari jawaban Gali: Kekuatan dan Potensi (BA), Nilai Inti (AV), Visi Arah 3 sampai 5 tahun (ED), Alasan atau Why (RM), Aksi Prioritas 3 langkah minggu ini (RA), Kontribusi (TI).
- Semua kotak bisa diedit user.
- Ringkasan arah satu paragraf di bawah kanvas.
- Unduh kanvas sebagai PNG dan PDF (jsPDF dari cdnjs).

MODUL 4, PETA 90
- Tanyakan: jam luang per minggu (pilihan 2, 4, 6, 10 jam) dan tanggal mulai.
- Gemini menyusun rencana 12 minggu dalam JSON: untuk tiap minggu { minggu, fokus, aksi: [maksimal 3], ukuran_selesai }, plus 3 milestone (akhir minggu 4, 8, 12). Bulan 1 fokus memperkuat pilar terlemah, pakai pilar terkuat sebagai modal. Aksi harus muat di jam luang yang dipilih.
- Tampilkan sebagai daftar minggu yang bisa dicentang.
- Tombol "Masukkan ke kalender HP": buat file .ics berisi 12 acara mingguan (hari dan jam pilihan user) dengan judul fokus minggu itu. Ini pengingat utamanya.
- Unduh rencana sebagai PDF.

PENYIMPANAN
- Simpan semua progres di localStorage (bungkus dengan try catch).
- Tombol "Unduh file progres" (JSON) dan "Buka file progres" supaya bisa pindah perangkat.

PEMANGGILAN AI
- Pakai integrasi Gemini bawaan Canvas. Jangan menulis API key di kode.
- Setiap panggilan meminta format JSON, dengan validasi dan pesan ramah plus tombol coba lagi kalau gagal.
- Instruksi sistem untuk setiap panggilan: "Kamu adalah pendamping refleksi BERARTI. Gaya: hangat, jujur, praktis, bahasa Indonesia santai, pakai kamu. Pakai kata-kata user, jangan mengarang pengalaman, angka, atau pencapaian. Jangan mendiagnosis. Jangan memakai em dash atau simbol ampersand. Kalau user memilih refleksi nilai dan iman, hormati keyakinannya tanpa menggurui dan tanpa mengutip dalil sebagai dasar klaim psikologis."

PENGAMAN WAJIB
- Footer setiap layar: "Arah90 adalah alat refleksi diri, bukan diagnosis atau terapi psikologis."
- Kalau jawaban user di modul mana pun mengandung tanda krisis (ingin mengakhiri hidup, menyakiti diri, merasa tidak ada harapan sama sekali, tidak sanggup menjalani hari), hentikan alur modul. Tampilkan pesan hangat, sarankan bicara dengan orang terdekat dan tenaga profesional, tampilkan kontak {{NOMOR_LAYANAN_DARURAT}}, lalu beri pilihan "Aku mau lanjut nanti".
- Jangan mengklaim hasil pasti.
```

---

## Setelah 3 prompt ini jalan

1. Uji sendiri sebagai 3 archetype berbeda (misalnya Explorer, Overthinker, Lost Wanderer) dan pastikan pengaman krisis muncul saat diuji dengan kalimat krisis.
2. Minta 5 orang dari audiensmu mencoba Pede60 dan tes Index, catat di mana mereka bingung.
3. Baru setelah itu promosikan lewat Reels. Kata kunci ARAH di Reels TOFU bisa mengirim link Pede60 atau link tes, pilih satu per video.
