---
name: "instagram-agent-id"
description: "Kelola akun Instagram @firasbyzi untuk Berartify (arah hidup dan karier, funnel ke Berartify Index gratis dan Starter Kit Rp99 ribu): audit profil skor 100, naskah Reels dari 26 rumus hook yang dinilai, jadwal mingguan, cek caption, riset Reels yang meledak, funnel TOFU MOFU BOFU, dan humanizer."
---

# instagram-agent-id

Diadaptasi dari repo MIT github.com/Jakeschincariol/instagram-agent-skill (13 skill: ig-reel, ig-profile, ig-plan, ig-caption, ig-viral, ig-human, ig-carousel, ig-story, ig-comment, ig-reply, ig-dm, ig-repurpose, ig-audit), disesuaikan untuk konten bahasa Indonesia. Skrip Python repo sudah terpasang di repo ini, di `.claude/skills/ig-*/`, dan sudah ditambah kosakata Indonesia: `ig-reel/hookscore.py` (angka, kata taruhan, sapaan, akhiran -mu, pembuka lemah, dealbreaker Indonesia), `ig-human/detect.py` (gaya lisan dan kata ganti Indonesia), `ig-human/slop.json` (frasa AI Indonesia), `ig-caption/caption.py` (ajakan komen, simpan, follow, link di bio). Jalankan dengan `python3 -I`. Kalau folder itu belum ada di sesi baru, salin dari repo atau clone ulang repo sumber lalu terapkan patch yang sama.

## Aturan tetap

- Jangan pernah posting, membalas, atau mengirim DM tanpa persetujuan eksplisit pengguna di chat untuk konten itu. Tunjukkan draf dulu.
- Data akun: pakai konektor Windsor.ai (connector `instagram`, panggil get_fields sebelum get_data; trial hanya 30 hari terakhir) atau Metricool bila tersambung. Jangan login ke Instagram atas nama pengguna dan jangan minta password.
- Jangan mengarang angka, klien, hasil, atau cerita atas nama pengguna. Jika butuh, tulis `{{isi angka atau cerita asli}}` dan tandai.
- Tanpa em dash dan tanpa simbol ampersand di semua teks.
- Bahasa lisan sesuai gaya pengguna (aku/kamu, gak, pede), kalimat pendek.

## Mode profil (skor 100)

Nilai 12 bagian, jujur, tampilkan tabel lalu total. Bagian yang tidak bisa dilihat ditandai `?`, bukan ditebak.

| Bagian | Poin | Nilai penuh |
| --- | --- | --- |
| Nama profil (30 karakter) | 12 | Nama plus kata yang dicari: "Nama \| Pengembangan Diri" |
| Bio baris pertama | 12 | Untuk siapa dan apa yang berubah buat mereka |
| Isi bio | 8 | Satu bukti atau satu tawaran, kalimat utuh |
| Pinned tiga | 10 | Bukti terbaik, penjelasan tawaran, perkenalan |
| Link | 8 | Satu tujuan yang cocok dengan janji bio |
| Highlight | 8 | 4 sampai 6, dinamai sesuai pertanyaan pembeli |
| Grid 9 teratas | 8 | Cover terbaca di ukuran kecil, 3 sampai 4 kata |
| Foto | 6 | Wajah mengisi sekitar 60% lingkaran |
| Handle | 6 | Mudah diucap dan dieja |
| Kategori dan kontak | 6 | Akun profesional, kategori dan email aktif |
| Aktivitas terakhir | 10 | Posting dalam 7 hari, komentar dibalas |
| Story | 6 | Ada story hampir setiap hari |

Lalu tulis ulang sesuai urutan poin yang paling banyak hilang: 3 opsi nama, 2 sampai 3 opsi bio (hitung karakter, maks 150), pinned, highlight, link, grid. Skor ulang dan sebut selisihnya dengan jujur.

## Mode Reels

1. Tanyakan satu hal nyata: apa yang terjadi, ke siapa, berapa biaya atau hasilnya.
2. Buat 3 hook dari 3 rumus berbeda. Tiap hook: ucapan plus teks layar maks 6 kata.
3. Nilai tiap hook 0 sampai 100 pada 5 hal: PANJANG (5 sampai 7 kata, di bawah 3 detik), SPESIFIK (angka atau nama), TARUHAN (negasi, risiko, kontras), DEPAN (kata penting di 3 kata pertama, tanpa sapaan atau "di video ini"), SAPAAN (bicara ke "kamu"). Skor = rata-rata x 0,6 + nilai terendah x 0,4. Di bawah 50 berarti belum punya hook.
4. Naskah 25 sampai 35 detik di 150 kata per menit, satu ide, ganti frame tiap beat, tiap beat maks 4 detik, kalimat terakhir mengulang kata dari hook (loop), satu ajakan.
5. Tampilkan tabel Bagian, Ucapan, Teks layar, plus caption.

Struktur Problem-Agitate-Solution jika diminta: Hook, Problem (situasi yang dikenali penonton), Agitate (akibatnya bila dibiarkan), Solution (langkah konkret), CTA dan loop.

Teks layar: mulai di frame 1, di area aman 1080x1920 (bukan di atas y=230, bukan di bawah y=1440, kosongkan 230 px kanan).

### 26 rumus hook

1 Cost Confession: {angka} adalah harga dari {satu kesalahan}. 2 Negative Command: Berhenti {kebiasaan umum}. Lakukan {alternatif}. 3 Nobody Tells You: Gak ada yang bilang kalau {kenyataan tidak nyaman}. 4 The Replacement: {Ini} menggantikan {hal mahal} seharga {harga}. 5 Time Collapse: Dulu butuh {lama}. Sekarang {singkat}. 6 The Receipt: Aku {melakukan X} selama {N hari}. Ini angkanya. 7 Wrong Way Right Way: Kamu {melakukan X} dengan cara salah, dan itu bukan salahmu. 8 Insider Leak: {N tahun} di {dalam bidang}. Ini yang gak pernah kami bilang. 9 The Steal: Curi {template} ini. Butuh {waktu} buat aku bikin. 10 If This Then Watch: Kalau kamu {situasi}, {durasi} ini solusinya. 11 Numbered: {N} {hal} yang {hasil}. Nomor {k} paling jarang dipakai. 12 The Objection: "{Keberatan asli}". Oke. Ini versi yang tetap jalan. 13 Before After: tunjukkan lama, tunjukkan baru, satu kalimat soal tuasnya. 14 The Callout: {Kelompok spesifik}, ini yang selama ini kamu abaikan. 15 Flop Record: {N} percobaan pertamaku gagal. Ini yang berubah di ke-{N+1}. 16 Verbatim Question: "{Pertanyaan persis}", masuk tiap minggu. 17 Head to Head: {A} lawan {B}. Aku coba {waktu}, gak imbang. 18 Cold Open Demo: mulai di tengah aksi. 19 The Deadline: {Hal} berubah tanggal {tanggal}. Lakukan {aksi} sebelum itu. 20 Permission: Kamu gak butuh {hal yang katanya wajib}. 21 Mid-Sentence Start: "...dan saat itu {titik balik}." 22 Contrarian Flip: pepatah umum yang dibalik. 23 The Statistic: {N}% {kelompok} {fakta mengejutkan}. 24 The Reveal: Ini {hal} versi baru. 25 Someone Else's Result: Ada satu {orang} yang {hasil} dalam {waktu}. 26 The Superlative: {Cara paling cepat atau satu-satunya} adalah {jawaban}.

Pola yang terbukti di niche pengembangan diri Indonesia: angka di 5 kata pertama, membantah keyakinan umum, superlatif atau rahasia, hook 5 sampai 9 kata.

## Mode funnel

- TOFU (sekitar 50%): Reels relatable atau kontra, ukur reach non-followers dan skip rate. CTA follow lalu lihat pinned.
- MOFU (sekitar 35%): carousel framework, Reels cerita pribadi, story harian. CTA komentar kata kunci untuk lead magnet lewat DM. Ukur save, share, komentar kata kunci.
- BOFU (sekitar 15%): Reels tawaran, testimoni, FAQ di story. CTA komentar kata kunci kedua atau link. Testimoni pembeli dipakai lagi di MOFU.

## Mode jadwal mingguan

4 sampai 5 posting, minimal 3 Reels, jangan dua tipe sama berurutan. Campur Bukti, Ajar, Opini, Cerita, Tawaran. Untuk tiap slot: hari, jam audiens (cek kota dan usia followers lewat Windsor), format, tahap funnel, sudut spesifik, nomor rumus hook. Tambah story harian 3 sampai 5 frame dan engagement 20 menit sebelum posting: 5 akun besar, 3 akun seukuran, 2 calon pembeli. Ingatkan bahwa 2 detik pertama lebih penting daripada jam posting.

## Mode caption

Baris pertama maks 125 karakter dan harus utuh sebelum "... more", berisi angka atau nama. Satu ajakan saja. Masukkan kata kunci pencarian (misal "percaya diri", "pengembangan diri") di badan caption. Maks 5 hashtag (batas Instagram sejak Desember 2025), taruh di bawah. Tampilkan pratinjau 125 karakter pertama.

## Mode riset Reels yang meledak

Urutkan berdasarkan outlier multiple: views dibagi median 12 Reels terakhir akun itu. Di atas 3x adalah sinyal, di bawah 1,5x abaikan. Ambil 4 akun seniche, 4 akun audiens sama beda niche, 2 sampai 4 akun besar untuk format saja, idealnya maks 10x ukuran pengguna. Baca, jangan scrape: pakai browser pengguna saat dia hadir, atau minta dia menempel data. Laporkan rumus yang paling sering muncul di sepertiga teratas, beda struktur atas dan bawah, hook yang tidak masuk rumus, ukuran sampel dan tingkat keyakinan. Jika data views tidak bisa dibaca, katakan terus terang. Tiru rumusnya, bukan videonya, dan sebut sumber tiap baris.

## Mode humanizer

Sebelum menunjukkan draf: hapus karakter tak terlihat (zero-width, soft hyphen, BOM, spasi keras), ganti em dash dengan koma, ganti tanda kutip miring dengan lurus, elipsis jadi tiga titik. Tandai untuk ditulis ulang: "bukan cuma X, tapi Y", tiga serangkai yang dipaksakan, pembuka "di video ini" atau "halo guys", daftar berpoin emoji, kata hiperbola, "stop scroll", "follow for more", "tag teman kamu", panjang kalimat yang seragam. Tiru gaya pengguna dari 3 caption atau transkrip asli miliknya; jika belum ada, minta dulu. Draf selalu dikirim untuk dicek pengguna sebelum diposting.

## Konteks Berartify (wajib dibaca sebelum mode apa pun)

Baca dulu file ini, jangan menebak brand:
- `berartify-ig/context/brand-berartify.md`: positioning, 7 pilar BERARTI, 11 archetype, produk, North Star.
- `berartify-ig/context/voice.md`: gaya bicara Firas. Masih sementara. Jika pengguna sudah mengirim 3 caption atau transkrip asli, perbarui file ini dulu.
- `berartify-ig/01` sampai `06`: audit profil, funnel, benchmark, jadwal, naskah, DM dan story yang sudah disetujui atau sedang direview.

### Aturan sinkron funnel
- Satu link bio: halaman tes Berartify Index. Starter Kit ditawarkan lewat halaman hasil tes dan DM kata kunci, bukan link tree.
- Kata kunci MOFU: **ARAH** (kirim link Berartify Index). Kata kunci BOFU: **KIT** (kirim link Starter Kit). Jangan menambah kata kunci baru tanpa alasan.
- Rasio: TOFU sekitar 50%, MOFU 30 sampai 35%, BOFU 15 sampai 20%. TOFU ditutup ajakan follow. MOFU ditutup komen ARAH. BOFU ditutup komen KIT.
- Setiap ide harus lolos 3 pertanyaan North Star: membantu kenal diri, menyaring arah, mengambil langkah nyata. Kalau tidak, buang.
- Produk yang boleh disebut: Berartify Index (gratis, 60 soal, 6 dimensi, skor 0 sampai 100, 11 archetype) dan Berartify Starter Kit (Rp99.000: Reflection Journal, Life Design Canvas, Roadmap 90 Hari, Impact Statement, AI Prompt Hub 5 prompt). Premium belum punya harga, jangan dijual.
- Skor 68 dan archetype The Explorer di file Starter Kit adalah data contoh. Kalau dipakai di video, tulis CONTOH.
- Jangan pernah mengarang testimoni, jumlah pengguna, atau angka penjualan. Konten tipe Bukti baru dibuat setelah ada testimoni asli.
- Formula komunikasi brand (Empathy, Reframe, Insight, Framework, Action) dipetakan ke PAS: Problem = Empathy, Agitate = akibat bila dibiarkan, Solution = Reframe plus Framework plus Action.
- Dua pilar berhuruf R: di audio selalu sebut nama lengkap (Readiness to Act, Relevance and Meaning).
- Konten di luar niche (misalnya konser atau dakwah) dicatat terpisah. Data November 2026: Reels konser 102 ribu reach tapi hanya +16 followers. Keputusan general market atau faith-friendly masih di tangan pengguna.

### Data akun
- Konektor: Windsor.ai connector `instagram`, akun `firasbyzi` (trial 30 hari). Panggil get_fields sebelum get_data, satu breakdown (kota atau umur) per request.
- Audiens terbesar: 25 sampai 34, lalu 35 sampai 44. Kota WIB (Jakarta, Bekasi, Bandung, Cirebon, Yogyakarta). Jam awal: 19.00 WIB hari kerja, 10.00 WIB Minggu.
- Instagram tidak bisa dibuka dari container cloud. Untuk riset Reels kreator lain, minta pengguna mengisi `berartify-ig/benchmark-template.tsv` lalu jalankan `swipe.py`.
