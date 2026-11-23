# Benchmark 5 Kreator di Niche Pengembangan Diri dan Arah Hidup

## Baca ini dulu: batas data

Mode riset Reels di skill mengharuskan views tiap Reels dibaca langsung, lalu diurutkan dengan **outlier multiple** (views dibagi median 12 Reels terakhir akun itu). Dari sesi ini aku **tidak bisa membuka Instagram** (domain instagram.com diblok di jaringan container), dan pencarian web tidak memuat angka views per Reels kreator-kreator ini. Jadi:

- Aku **tidak menulis angka views apa pun** untuk kreator lain. Semua angka di bawah yang berasal dari akun kamu sendiri diambil dari Windsor.
- Pola di bawah disusun dari pengetahuan umum soal gaya konten akun-akun ini dan pola niche pengembangan diri Indonesia di skill (angka di 5 kata pertama, membantah keyakinan umum, superlatif atau rahasia, hook 5 sampai 9 kata). **Tingkat keyakinan: rendah sampai sedang.**
- Untuk mengubahnya jadi tinggi, isi `benchmark-template.tsv` (10 menit per akun) lalu jalankan `swipe.py`. Caranya di bagian akhir.

Handle di bawah perlu kamu verifikasi saat membuka Instagram.

## 5 akun benchmark

Komposisi mengikuti skill: akun seniche, akun audiens sama beda sudut, dan akun besar khusus untuk referensi format.

| # | Kreator | Handle (verifikasi) | Kenapa dipilih | Yang ditiru |
| --- | --- | --- | --- | --- |
| 1 | Satu Persen | @satupersen.id | Paling dekat ke territory Berartify: "sekolah kehidupan", quarter life crisis, kenal diri | Format penjelasan psikologi yang dibungkus pertanyaan relatable, visual sistem |
| 2 | Fellexandro Ruby | @fellexandro | Karier dan produktivitas untuk 20 sampai 35, audiens young professional | Talking head tajam, framework bernama, opini kontra soal karier |
| 3 | Analisa Widyaningrum | @analisa.widyaningrum | Psikolog, audiens yang overthinking dan butuh validasi | Validasi dulu, lalu reframe (sama dengan formula Empathy ke Reframe di blueprint) |
| 4 | Jiemi Ardian | @jiemiardian | Psikiater, membongkar mitos kesehatan mental | Hook membantah keyakinan umum, bahasa awam untuk istilah psikologi |
| 5 | Raymond Chin | @raymondchins | Akun besar (format saja), bisnis dan pengembangan diri | Hook angka dan cerita, tempo edit cepat, CTA tunggal |

## 10 pola konten performa tinggi yang berulang di akun-akun ini

| # | Pola | Rumus hook terdekat | Kenapa kerja di niche ini | Dipakai di |
| --- | --- | --- | --- | --- |
| P1 | Angka di depan plus daftar ("3 tanda...", "5 hal...") | #11 Numbered | Janji jelas dan bisa diukur, penonton tahu kapan selesai | C1, C3 |
| P2 | Membantah nasihat umum ("berhenti cari passion") | #2 Negative Command, #22 Contrarian Flip | Kontras bikin berhenti scroll, sekaligus posisi berbeda dari akun motivasi | C2, C8 |
| P3 | Callout umur atau fase hidup ("umur 25", "kerja 3 tahun") | #14 The Callout | Penonton merasa disebut namanya | C4, C5 |
| P4 | Validasi dulu, baru reframe ("kamu bukan malas") | #22 | Audiens reflektif dan mudah menyalahkan diri | C1, C3 |
| P5 | Kuis tipe kepribadian ("kamu yang mana?") | #11 dan #24 | Memancing komentar dan share ke teman | C6 |
| P6 | Cerita titik balik pribadi | #15 Flop Record, #21 Mid-Sentence | Membangun kepercayaan ke founder | C7 |
| P7 | Framework bernama dengan visual sistem (matriks, filter) | #10 If This Then Watch | Bikin save, terlihat seperti alat | C3, C6 |
| P8 | Mini exercise "malam ini tulis..." | #2 dan #10 | Save tinggi, penonton merasa langsung dapat hasil | C1, C2, C8 |
| P9 | Menjawab keberatan secara langsung | #12 The Objection | Mengurangi penolakan sebelum orang beli | C10 |
| P10 | Demo produk di layar (rekam layar) dengan sebelum sesudah | #13 Before After | Produk digital lebih dipercaya kalau isinya terlihat | C9, C10 |

### Beda struktur Reels atas dan bawah (pengamatan umum, belum diukur)
- Atas: klaim di detik 0, teks layar besar sejak frame 1, satu ide, ada langkah konkret di 10 detik terakhir.
- Bawah: pembuka "halo guys" atau "di video ini", banyak ide dalam satu video, CTA lebih dari satu.

### Bukti dari akun kamu sendiri (data asli)

| Reels | Views | Reach | Skip rate 3 detik | Rata-rata ditonton |
| --- | --- | --- | --- | --- |
| 1 Nov, soundcheck Konser Langit | 151.398 | 102.803 | 25,3% | 17,9 detik |
| 3 Nov, belum move on Konser Langit | 17.136 | 13.412 | 45,7% | 10,9 detik |

Yang bisa dipelajari: video 1 Nov dibuka langsung di tengah aksi (rumus #18 Cold Open Demo) dan skip rate-nya jauh lebih rendah. Format itu bisa dipakai lagi untuk topik arah hidup, misalnya membuka C7 dengan potongan kamu sedang mengajar atau di panggung. Yang tidak bisa ditiru: topiknya, karena penontonnya datang untuk penceramah, bukan untuk arah hidup.

## Cara mengubah benchmark ini jadi data asli (10 menit per akun)

1. Buka tiap akun di HP, tab Reels.
2. Catat 12 Reels terakhir: views dan kalimat pertama (ucapan atau teks layar).
3. Hitung median views 12 Reels itu.
4. Isi `benchmark-template.tsv` (kolom: account, followers, median, views, hook).
5. Kirim file itu ke aku, atau jalankan sendiri:

```bash
python3 -I ~/.claude/skills/ig-viral/swipe.py berartify-ig/benchmark-template.tsv --out ~/.claude/instagram/swipe.md
```

Hasilnya: Reels diurutkan berdasarkan outlier multiple (di atas 3x adalah sinyal, di bawah 1,5x diabaikan) dan rumus hook tiap baris. `ig-reel` akan membaca `swipe.md` itu untuk naskah berikutnya.
