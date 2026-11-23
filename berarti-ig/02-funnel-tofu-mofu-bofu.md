# Funnel Konten: dari Reels ke Berartify Starter Kit

Funnel ini disambungkan ke Content-to-Conversion Architecture di Brand Blueprint (Awareness, Consideration, Diagnosis, Activation, Transformation) dan ke produk yang sudah ada.

```
TOFU  Reels relatable / kontra (50%)
  |   CTA: follow, lalu lihat pinned
  v
PROFIL  nama + bio + 1 link ke Berartify Index
  |
MOFU  framework, cerita founder, mini exercise (30 sampai 35%)
  |   CTA: komen ARAH  ->  DM otomatis/manual berisi link Index
  v
DIAGNOSIS  Berartify Index (gratis): 60 soal, 6 dimensi, skor 0-100, 11 archetype
  |   halaman hasil wajib punya tombol ke Starter Kit
  v
BOFU  Reels tawaran, demo Starter Kit, keberatan, FAQ story (15 sampai 20%)
  |   CTA: komen KIT  ->  DM berisi link pembelian
  v
AKTIVASI  Berartify Starter Kit Rp99.000
  |   minta testimoni di hari ke-7 dan ke-30 (form testimoni di sheet Link dan Bantuan)
  v
TRANSFORMASI  komunitas, workshop, mentoring 1-on-1 (harga belum final)
      testimoni pembeli dipakai lagi di MOFU dan pin #3
```

## Tahap per tahap

| Tahap | Tujuan (blueprint) | Format | Konten di rencana ini | CTA | Ukur |
| --- | --- | --- | --- | --- | --- |
| TOFU | Audiens merasa dipahami | Reels 25 sampai 35 detik, opini dan relatable | C1, C2, C3, C4, C5 | Follow, lihat pinned | Reach non-followers, skip rate 3 detik, follows per 1.000 reach |
| MOFU | Memberi kerangka berpikir dan diagnosis | Reels framework, carousel, cerita, story harian | C6, C7, C8 | Komen ARAH | Komentar ARAH, save, share, klik link bio |
| BOFU | Mengubah insight jadi rencana (beli) | Reels demo produk, keberatan, FAQ story | C9, C10 | Komen KIT | Komentar KIT, DM dibalas, pembelian |

## Jembatan antar tahap

1. **TOFU ke profil.** Semua TOFU berakhir dengan follow. Orang yang buka profil harus langsung lihat pin #1 (archetype) dan link tes. Ini yang gagal di Reels konser: 102 ribu reach, +16 followers, 0 klik link.
2. **MOFU ke Index.** Satu kata kunci saja, **ARAH**. Balas DM dalam 1 jam pertama setelah posting (lihat `06-story-dm-engagement.md`).
3. **Index ke Starter Kit.** Ini di luar Instagram, di halaman hasil tes. Pastikan ada kalimat jembatan: "Hasil ini peta. Starter Kit yang bantu kamu jalan." Pesan ini sama dengan C9 supaya terasa satu perjalanan.
4. **BOFU ke pembelian.** Kata kunci kedua **KIT**. Orang yang komen KIT biasanya sudah tes, jadi DM-nya langsung ke link beli plus satu pertanyaan soal archetype mereka.
5. **Pembeli ke testimoni.** Belum ada testimoni di file yang kamu kirim, jadi tidak ada konten "Bukti" di 2 minggu pertama. Begitu ada, testimoni masuk ke MOFU dan pin #3. Jangan pernah mengarang testimoni.

## Yang harus beres sebelum funnel jalan

Detail dan alasannya ada di `07-audit-landing-dan-starter-kit.md`.

- [ ] File Starter Kit di Drive dikunci (sekarang siapa saja yang punya link bisa mengedit), sel input dikosongkan, dibagikan sebagai link `/copy` hanya setelah bayar.
- [ ] Tombol "Bayar Rp99.000" di landing page dihubungkan ke pembayaran nyata (sekarang langsung menampilkan "Pemesanan Berhasil" tanpa menagih).
- [ ] Testimoni di landing page dipastikan asli, atau dihapus.
- [ ] Nama di landing page diganti dari "BERARTI™ Index" ke "Berartify™ Index", AI Prompt Hub ditambahkan ke daftar isi kit.
- [ ] Landing page dionlinekan (sekarang masih file .tsx) lalu link-nya dipasang di bio.
- [ ] Halaman hasil Index punya tombol atau link ke Starter Kit.
- [ ] Sheet "Link dan Bantuan" di Starter Kit masih placeholder semua (ebook, video tutorial, WhatsApp support, form feedback, website, form testimoni). Pembeli akan melihat teks "[GANTI DENGAN LINK ...]". Isi sebelum C9 tayang.
- [ ] Cara kirim DM kata kunci: manual dulu (cukup untuk volume sekarang), atau pakai alat auto-DM resmi yang terhubung ke Instagram API kalau komentar sudah puluhan per posting.
- [ ] Keputusan positioning general market atau faith-friendly (lihat `01-audit-profil.md`).

## Metrik mingguan

| Metrik | Sumber | Target awal (hipotesis, cek ulang setelah 2 minggu) |
| --- | --- | --- |
| Reach non-followers per Reels TOFU | Windsor `reach_non_followers` | Naik dari baseline sekarang (15 sampai 30 per hari) |
| Follows per 1.000 reach | Windsor `follower_count` dibagi reach | Lebih tinggi dari Reels konser (0,16 per 1.000) |
| Komentar ARAH | hitung manual atau Windsor `comments` | Catat per posting, belum ada baseline |
| Klik link profil | Windsor `profile_links_taps` | Dari 0 ke angka berapa pun |
| Pembelian Starter Kit | sistem pembayaran kamu | Catat sumbernya: ARAH, KIT, atau link bio |
