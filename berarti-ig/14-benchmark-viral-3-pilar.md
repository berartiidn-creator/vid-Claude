# Benchmark Viral 3 Pilar BERARTI: Communication, Confidence, Grow

Riset 24 November 2026 dengan metode `/ig-viral`. Dipakai untuk naskah di `15-naskah-30-konten-3-pilar.md`.

## Ringkasan jujur dulu

- **Sumbernya YouTube Shorts, bukan Instagram.** Instagram tidak bisa dibuka dari container ini, dan skill melarang login atas namamu. Skill mengizinkan Shorts sebagai korpus kedua karena rumus hooknya sama. Hasilnya tetap perlu dicek di Reels.
- **Sampel:** 1.487 Shorts dari 40 channel Indonesia untuk menghitung median. Dari situ dipilih 79 Shorts yang relevan dengan 3 pilar, dari 23 akun, dibagi sepertiga atas dan sepertiga bawah. Hook ucapan (kata di bawah detik 3,0 dari caption otomatis) didapat untuk 40 video. Sisanya pakai judul, karena YouTube mulai meminta verifikasi bot dan saya berhenti di situ.
- **Tingkat keyakinan: sedang untuk Communication dan Grow, rendah untuk Confidence.** Confidence hanya punya 6 video di sepertiga atas, dan sebagian besar bukan soal pede secara langsung (luka, kehilangan, emosi). Topik pede murni di sampel ini justru rata-rata di bawah 2x.
- **Tiga outlier terbesar perlu dicurigai.** Zahid Ibrahim 230x adalah konten berbayar Gemini (penutupnya ajakan klaim Gemini), sangat mungkin didorong iklan. Dedi Setiawan 585x dan Maya Rachma 266x tidak bisa diverifikasi organik atau berbayar. Masing-masing satu baris, jadi rumusnya dipakai sebagai petunjuk, bukan bukti.
- **Ukuran akun.** Skill menyarankan akun sekitar 10x ukuranmu. Banyak akun di sini jauh lebih besar (sampai 3,7 juta subscriber), jadi mereka dipakai untuk format saja, bukan untuk tone atau frekuensi posting. Yang paling dekat ukurannya: Steny Agustaf (12 ribu), Ngobrol Sama Alya (32 ribu), Upgrade Hidup (53 ribu), Glints (69 ribu), Jason Stanley (78 ribu).

## Metode

1. **Permintaan (apa yang dicari orang):** autocomplete YouTube Indonesia untuk 10 kata kunci per pilar. Ini menunjukkan topik yang dicari, bukan yang viral.
2. **Bukti viral:** 40 Shorts terakhir dari tiap channel, hitung median views per channel, lalu outlier multiple = views dibagi median channel itu sendiri. Di atas 3x adalah sinyal. Di bawah 1,5x adalah hari biasa akun itu.
3. **Hook:** kata yang diucapkan sebelum detik 3,0 dari caption otomatis. Beberapa caption otomatis keluar dalam terjemahan Inggris dari YouTube; itu ditandai sebagai apa adanya.
4. **Rumus:** classifier `swipe.py` berbasis bahasa Inggris dan hampir semua hook Indonesia keluar "unclassified", jadi semua dilabeli manual ke 26 rumus. Pola yang tidak ada di 26 rumus diberi kode N.
5. Simbol ampersand di judul asli kreator ditulis "dan" sesuai aturan penulisan BERARTI.

## Apa yang dicari orang (autocomplete YouTube Indonesia)

**Communication**
- Bicara di depan umum agar tidak gugup atau grogi, cara memulai bicara di depan umum
- Menjawab pertanyaan HRD saat interview, memperkenalkan diri saat interview
- Ngobrol dengan orang baru, komunikasi yang baik dengan orang lain dan pasangan
- Ngomong tidak belibet, public speaking jadi lancar
- Presentasi di depan kelas, seminar proposal, skripsi, menjawab pertanyaan saat presentasi

**Confidence**
- Percaya diri saat presentasi, interview, di depan kamera, di depan orang banyak
- Pede ngomong sama orang, agar tidak minder, tidak jadi pemalu
- Menghilangkan rasa malu berlebihan, malu karena kejadian memalukan
- Berhenti overthinking
- Menghargai diri sendiri tanpa pengakuan orang lain, juga "menurut islam"
- Berani ke mana-mana sendiri, berani ambil risiko

**Grow**
- Umur 25 harus ngapain, umur 25 belum punya apa-apa, umur 25 masih nganggur
- Quarter life crisis, juga "dalam islam" dan "ustadz Nuzul Dzikri"
- Berubah jadi lebih baik, mengembangkan diri dan potensi, mengembangkan value diri
- Disiplin waktu, disiplin bangun pagi, konsisten belajar
- Berhenti malas, berhenti menunda-nunda
- Menemukan passion, bingung mau jadi apa

Pencarian faith-friendly muncul sendiri di dua pilar (menghargai diri menurut islam, quarter life crisis dalam islam). Ini mendukung keputusan positioning faith-friendly.

## Temuan 1: rumus yang over-index

Sepertiga atas: 26 video, multiple 4,1x sampai 585x. Sepertiga bawah: 26 video, 0,1x sampai 1,7x.

| Rumus | Atas | Bawah | Baca |
| --- | --- | --- | --- |
| N3 Cara {situasi spesifik} | 3 | 0 | Paling konsisten. "Cara menghadapi orang yang bikin hati lelah", "Cara menyapa orang baru saat networking", "Cara alter ego ubah minder jadi pede". Situasinya bisa dibayangkan. |
| #11 Numbered | 3 | 1 | Menang kalau isinya kesalahan atau kebiasaan ("5 kebiasaan bikin kekurangan uang", "5 kesalahan berlogika"). Kalah kalau isinya umum ("tanpa sadar ada tiga hal"). |
| #25 Someone Else's Result dan #21 cerita | 3 | 0 | Cerita orang lain dengan tahun dan tempat jelas ("di tahun 2012 di Olimpiade"). |
| #6 Receipt (cara pribadi) | 2 | 0 | "Bagaimana aku membaca satu buku setiap minggu", "Manfaat yang aku rasakan jadi morning person". |
| #26 Superlative atau satu aturan | 2 | 0 | "Tiap kali mau ambil keputusan, tanya satu hal". |
| #22 Contrarian Flip | 2 | 3 | **Netral.** Membalik pepatah tidak cukup. Yang menang membalik hal yang dirasakan ("Waktu tidak menyembuhkan luka"), yang kalah membalik slogan ("it's not failure, it's the price"). |
| #10 If This Then Watch | 0 | 4 | **Kalah di sampel ini.** "Kalau kamu masih sering nge-blank...", "PDKT selalu gagal? coba cek...". |
| Q Kutipan motivasi umum | 0 | 4 | **Kalah.** "Ada usaha, ada perubahan", "Tetap percaya pada proses". Semua dari satu akun, tapi polanya jelas. |
| Topik abstrak tanpa situasi | 1 | 8 | **Paling kalah.** "Sejarah singkat ilmu komunikasi", "perang dingin antar generasi", hook yang dibuka musik tanpa ucapan. |

Dua rumus yang dipegang: **N3 situasi spesifik** dan **kesalahan atau kebiasaan bernomor**. Sisanya sinyal lemah (2 sampai 3 kali muncul), bukan temuan.

## Temuan 2: beda struktur atas dan bawah

- **Panjang hook sama**, median 8 kata di atas dan di bawah. Panjang bukan pembedanya.
- **Skor `hookscore.py` tidak membedakan atas dan bawah.** Median skor hook di sepertiga atas 42,2, di sepertiga bawah juga 42,2. Jadi skor itu alat cek kebersihan hook (ada angka, ada taruhan, langsung ke penonton), bukan peramal viral. Topik dan situasinya yang membedakan.
- **Kata aku, kamu, gua, lo** muncul di 10 hook atas dan 6 hook bawah. Bicara langsung ke satu orang sedikit lebih menang.
- **Durasi:** median 58 detik di atas, 68,5 detik di bawah (17 dan 22 video yang durasinya terbaca). Selisih kecil, arahnya: lebih pendek.
- **Penutup:** dari 13 video atas yang captionnya lengkap, 9 berakhir di punchline tanpa ajakan, 3 minta komentar, 1 jualan (yang berbayar). Di bawah: 6 punchline, 5 minta komentar, 2 minta follow. Sampelnya kecil dan tercampur (PRESENTA selalu menutup dengan "jangan lupa follow"), jadi ini sinyal lemah. Yang aman diambil: **akhiri dengan kalimat yang kena dulu, baru satu ajakan pendek.** Jangan "jangan lupa follow terus akun ini".
- **Format:** hampir semua talking head satu orang. Yang paling besar di Communication adalah demo langsung (contoh MC), bukan penjelasan.

## Temuan 3: pola yang tidak ada di 26 rumus

| Kode | Pola | Contoh di sampel | Catatan |
| --- | --- | --- | --- |
| N1 | Gak Cuma Kamu: buka dengan perasaan yang sama | "Mungkin enggak cuma aku sendiri yang ngerasa..." (Zahid, 230x), "Gua tahu lu capek banget..." (Menjadi Manusia, 3,3x) | Layak masuk `hooks.json`. Skor hookscore rendah, tapi dipakai video terbesar di sampel. |
| N2 | Cermin Kontradiksi: "Kamu bilang X, tapi Y" | "Lo bilang lo enggak punya waktu tapi tiap hari scrolling" (Rama Satya, 10x) | Satu baris kuat, satu lemah (PRESENTA 1,7x). Butuh nada tanpa menghakimi. |
| N3 | Cara {situasi spesifik} | 3 kali di atas | Mirip #10 tapi tanpa "kalau kamu...". Langsung ke situasinya. |
| N5 | Kebenaran universal | "Kita semua akan mengalami kehilangan" (Rory Asyari, 5,4x) | Satu baris. |
| N6 | Analogi | "Lo gak akan dengerin nasihat gym dari orang yang badannya gendut" (Rama Satya, 4,2x) | Satu baris. Hati-hati menghina fisik. |
| N7 | Kutipan tokoh | "Kita ini human being, bukan human doing" (Ariel Tatum di Menjadi Manusia, 4,1x) | Butuh tokoh dan izin. |
| N8 | Skit situasi kerja | "HRD gak sengaja ketemu kandidat di minimart" (Glints, 3,4x) | Butuh pemeran kedua. |

## Per pilar: tema yang punya permintaan dan bukti

**Communication** (bukti paling kuat): menjawab HRD dan "ceritakan tentang dirimu", membuka presentasi tanpa perkenalan, ngobrol dengan orang baru, ngomong tidak muter-muter, menghadapi orang yang melelahkan, jawaban pendek saat ditanya dadakan, demo langsung. Akun penentu: PRESENTA, Maya Rachma, Steny Agustaf, Jason Stanley.

**Confidence** (bukti tipis): pede di depan kamera, minder, malu karena kejadian memalukan, overthinking, menghargai diri tanpa pujian. Video Confidence yang menang di sampel bukan "cara pede" tapi validasi emosi yang tenang (Jiemi Ardian, Rory Asyari) dan cerita titik terendah (Menjadi Manusia). "Cara pede dalam semenit" dan "23 detik bikin pede" justru di bawah 2x. Artinya untuk BERARTI: **jual pede lewat situasi dan kenal diri, bukan lewat janji instan.** Ini cocok dengan pesan utama "Kamu gak kurang pede. Kamu belum kenal dirimu."

**Grow** (bukti sedang): umur 25 dan quarter life crisis, menunda, screen time, kebiasaan, eksperimen pribadi. Akun penentu: Rama Satya (5 video di atas 3x), Zahid Ibrahim (4 video).

## Swipe file: sepertiga atas (26 video)

| Multiple | Akun | Views | Median akun | Pilar | Hook verbatim (sumber) | Rumus | Video |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 585,4x | Dedi Setiawan (kanal L dan D) | 1.200.000 | 2.050 | comm | "Cara menghadapi orang yang bikin hati kita lelah" (judul) | N3 Cara Situasi Spesifik | [link](https://www.youtube.com/shorts/WbvFKokSU8A) |
| 265,6x | Maya Rachma | 903.000 | 3.400 | comm | "Contoh MC Acara Semi-Formal" (judul) | #18 Cold Open Demo | [link](https://www.youtube.com/shorts/6xABBxjFpEY) |
| 230,3x | Zahid Ibrahim | 3.800.000 | 16.500 | grow | "Mungkin enggak cuma aku sendiri yang ngerasa kalau membuat keputusan di akhir" (ucapan) | N1 Gak Cuma Kamu | [link](https://www.youtube.com/shorts/B-ndOw8zS6s) |
| 36,2x | Denny Santoso | 152.000 | 4.200 | grow | "Lima alasan kenapa banyak orang zaman sekarang hidupnya selalu" (ucapan) | #11 Numbered | [link](https://www.youtube.com/shorts/jCPpi3rqb58) |
| 24,7x | Raymond Chin | 939.000 | 38.000 | grow | "Peneliti di luar, dia ngebedain mindset orang miskin" (ucapan) | #23 Statistic | [link](https://www.youtube.com/shorts/HAg3YwHnNdE) |
| 13,0x | PRESENTA | 15.000 | 1.150 | comm | "Berhenti buka presentasi dengan perkenalan diri." (ucapan) | #2 Negative Command | [link](https://www.youtube.com/shorts/tcP12YhaL4k) |
| 11,5x | Maya Rachma | 39.000 | 3.400 | comm | "3 Fakta Menarik Tentang Jurusan Ilmu Komunikasi" (judul) | #11 Numbered | [link](https://www.youtube.com/shorts/PFW5iA6hilU) |
| 10,0x | Rama Satya | 40.000 | 4.000 | grow | "Lo bilang lo enggak punya waktu tapi setiap hari lo malah scrolling-srolling" (ucapan) | N2 Cermin Kontradiksi | [link](https://www.youtube.com/shorts/kLs1FDCK6HI) |
| 9,2x | Ngobrol Sama Alya | 12.000 | 1.300 | comm | "Jawaban singkat ala hook bikin dia jadi Putri Indonesia 2026 ❤" (judul) | #25 Someone Else | [link](https://www.youtube.com/shorts/So39rKZ9PWQ) |
| 9,1x | Maya Rachma | 31.000 | 3.400 | comm | "hindari Lima kesalahan berlogika atau logical fallases" (ucapan) | #11 Numbered | [link](https://www.youtube.com/shorts/fgsuCz3jQXo) |
| 8,8x | Zahid Ibrahim | 146.000 | 16.500 | grow | "Bagaimana aku membaca satu buku setiap Minggu" (ucapan) | #6 Receipt | [link](https://www.youtube.com/shorts/u8teM868edg) |
| 7,5x | Fellexandro Ruby | 20.000 | 2.650 | conf | "Cara Alter Ego Ubah Minder Jadi Percaya Diri" (judul) | N3 Cara Situasi Spesifik | [link](https://www.youtube.com/shorts/M3gMGj5Id_k) |
| 7,5x | Menjadi Manusia | 15.000 | 2.000 | conf | "di tahun 2012 di Olimpiade" (ucapan) | #25 Someone Else | [link](https://www.youtube.com/shorts/ym41xwCgsQc) |
| 7,4x | PRESENTA | 8.500 | 1.150 | comm | "Kesalahan yang sering terjadi: kamu pakai pendekatan yang sama untuk semua jenis audiens" (judul) | #7 Wrong Way | [link](https://www.youtube.com/shorts/h2Z0d1-0398) |
| 7,2x | Rama Satya | 29.000 | 4.000 | grow | "Ini adalah cara memanipulasi otak lu untuk mendapatkan apapun" (ucapan) | #26 Superlative | [link](https://www.youtube.com/shorts/rnlqFxAhEtY) |
| 6,2x | Zahid Ibrahim | 102.000 | 16.500 | grow | "Dewasa = Diam?" (judul) | #22 Contrarian Flip | [link](https://www.youtube.com/shorts/zAKf9-djdDY) |
| 6,0x | Steny Agustaf | 5.100 | 852 | comm | "CARA MENYAPA ORANG BARU SAAT NETWORKING" (judul) | N3 Cara Situasi Spesifik | [link](https://www.youtube.com/shorts/wr-egF6gctM) |
| 5,9x | Zahid Ibrahim | 97.000 | 16.500 | grow | "Aku menghentikan habitsku untuk..." (judul) | #6 Receipt | [link](https://www.youtube.com/shorts/0wOKSPGsBFE) |
| 5,4x | Rory Asyari | 20.000 | 3.700 | conf | "Kita Semua Akan Mengalami Kehilangan" (judul) | N5 Kebenaran Universal | [link](https://www.youtube.com/shorts/SSyra3nXDU8) |
| 5,3x | Fellexandro Ruby | 14.000 | 2.650 | grow | "Kalau dulu waktu gua kecil, gua enggak milih dengerin" (ucapan) | #21 Mid-Sentence | [link](https://www.youtube.com/shorts/a8YxcJNK73k) |
| 4,5x | Rama Satya | 18.000 | 4.000 | grow | "Di dunia ini, loh cuman punya dua pilihan. Jadi konsumen [musik]" (ucapan) | #17 Head to Head | [link](https://www.youtube.com/shorts/aH7fkPK_k14) |
| 4,2x | Rama Satya | 17.000 | 4.000 | grow | "Tiap kali lu mau ngambil keputusan, selalu tanya satu hal" (ucapan) | #26 Superlative | [link](https://www.youtube.com/shorts/SqvjUOR9Xvg) |
| 4,2x | Rama Satya | 17.000 | 4.000 | grow | "Lo enggak akan mau dengerin nasihat Jim dari orang yang badannya gendut." (ucapan) | N6 Analogi | [link](https://www.youtube.com/shorts/MjRJWTy2q_Y) |
| 4,1x | Menjadi Manusia | 8.200 | 2.000 | conf | "Ariel Tatum: “Kita ini human being, bukan human doing.”" (judul) | N7 Kutipan Tokoh | [link](https://www.youtube.com/shorts/HQGMDvZj3ag) |
| 4,1x | Jiemi Ardian | 20.000 | 4.900 | conf | "Memori Eksplisit dan Memori Implisit dalam Trauma" (judul) | tidak masuk rumus | [link](https://www.youtube.com/shorts/yhOa2GlnvCk) |
| 4,1x | Jiemi Ardian | 20.000 | 4.900 | conf | "Waktu tidak menyembuhkan luka." (judul) | #22 Contrarian Flip | [link](https://www.youtube.com/shorts/X8ouu8ZNU8c) |

## Swipe file: sepertiga bawah (26 video)

Disimpan supaya kelihatan apa yang tidak jalan. Perhatikan PRESENTA: akun yang sama punya 13x dan 0,1x. Bedanya di topik (presentasi konkret menang, topik organisasi abstrak kalah), bukan di rumus.

| Multiple | Akun | Views | Median akun | Pilar | Hook verbatim (sumber) | Rumus | Video |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1,7x | Agusleo Halim | 14.000 | 8.100 | conf | "23 Detik ini bakal bikin lo jadi PERCAYA DIRI" (judul) | #10 If This Then | [link](https://www.youtube.com/shorts/qhvQj5_EC0Y) |
| 1,7x | PRESENTA | 1.900 | 1.150 | conf | "Mau sampai kapan nunggu siap buat berani presentasi?" (judul) | N2 Cermin Kontradiksi | [link](https://www.youtube.com/shorts/fzTOTt4oj2A) |
| 0,8x | Timothy Ronald | 7.800 | 10.000 | grow | "Sukses Jalur Bapaknya vs Sukses Jalur Keringat Sendiri." (judul) | #17 Head to Head | [link](https://www.youtube.com/shorts/QYuvSjlhmq4) |
| 0,8x | Suara Berkelas | 15.000 | 19.500 | grow | "apa yang harus siap kita hadapi ketika menjadi" (ucapan) | tidak masuk rumus | [link](https://www.youtube.com/shorts/cd8Q1cBLhD0) |
| 0,8x | Upgrade Hidup | 2.400 | 3.200 | grow | "Bukan Malas, Tapi Cara Hidup Lu Salah / Kenapa Kerja Keras Tetap Gak Gerak" (judul) | #22 Contrarian Flip | [link](https://www.youtube.com/shorts/Btk5QE3DTps) |
| 0,7x | Akbar Abi | 2.700 | 3.700 | grow | "Kebiasaan Baca Buku Bisa Mengubah Otakmu" (judul) | tidak masuk rumus | [link](https://www.youtube.com/shorts/Ve6Pz7cXmE8) |
| 0,7x | Maya Rachma | 2.400 | 3.400 | comm | "gimana sih Awalnya Ilmu Komunikasi itu mulai Dipelajari" (ucapan) | tidak masuk rumus | [link](https://www.youtube.com/shorts/8o8XIUpjjBE) |
| 0,6x | Jason Stanley | 3.600 | 6.000 | grow | "Kalau misalkan lo masih sering nge-blank, beliibet," (ucapan) | #10 If This Then | [link](https://www.youtube.com/shorts/F8263CuFnsY) |
| 0,6x | Rory Asyari | 2.200 | 3.700 | conf | "[musik]" (ucapan) | tidak masuk rumus | [link](https://www.youtube.com/shorts/n_delrtctRQ) |
| 0,6x | Akbar Abi | 2.100 | 3.700 | conf | "Ya Allah, I trust you." (judul) | Q Kutipan motivasi umum | [link](https://www.youtube.com/shorts/ddxtvNfCkrc) |
| 0,5x | Rama Satya | 2.100 | 4.000 | grow | "it’s not failure, it’s the price that you have to pay." (judul) | #22 Contrarian Flip | [link](https://www.youtube.com/shorts/PtCxzWfo5oc) |
| 0,5x | Akbar Abi | 1.900 | 3.700 | conf | "Kunci mencintai diri sendiri" (judul) | Q Kutipan motivasi umum | [link](https://www.youtube.com/shorts/MD3rM26a_YI) |
| 0,5x | PRESENTA | 563 | 1.150 | comm | "Seringkali dalam dunia kerja terjadi perang dingin antar generasi." (ucapan) | tidak masuk rumus | [link](https://www.youtube.com/shorts/3h3c9KErAlk) |
| 0,5x | Satu Persen | 5.300 | 11.500 | grow | "Ada pepatah yang bilang, lo butuh belajar 10.000 jam" (ucapan) | #22 Contrarian Flip | [link](https://www.youtube.com/shorts/ljUuzPgVpkk) |
| 0,4x | Maya Rachma | 1.500 | 3.400 | comm | "Di dunia jurnalistik, ada teknik interview yang sifatnya" (ucapan) | tidak masuk rumus | [link](https://www.youtube.com/shorts/ho8_UNrbC8Y) |
| 0,4x | Akbar Abi | 1.600 | 3.700 | grow | "Tetap percaya pada proses dan jangan pernah protes pada proses" (judul) | Q Kutipan motivasi umum | [link](https://www.youtube.com/shorts/0FanCFsM6wY) |
| 0,4x | PRESENTA | 411 | 1.150 | comm | "Introvert vs Extrovert" (judul) | #17 Head to Head | [link](https://www.youtube.com/shorts/uo8AjfhLprM) |
| 0,3x | PRESENTA | 388 | 1.150 | comm | "Tanpa sadar, ada tiga hal yang kamu lakukan" (ucapan) | #11 Numbered | [link](https://www.youtube.com/shorts/vTgKmPkuah4) |
| 0,3x | PRESENTA | 377 | 1.150 | comm | "Banyak orang kalau menggunakan bahasa formal mendadak kayak" (ucapan) | #7 Wrong Way | [link](https://www.youtube.com/shorts/jikQWH26K3o) |
| 0,3x | Ngobrol Sama Alya | 418 | 1.300 | comm | "Alya, spill dong salah satu teknik opening" (ucapan) | #16 Verbatim Question | [link](https://www.youtube.com/shorts/CSWMUhqlgeg) |
| 0,3x | Jason Stanley | 1.800 | 6.000 | grow | "PDKT selalu gagal? coba deh lo cek beberapa hal ini terlebih dahulu.." (judul) | #10 If This Then | [link](https://www.youtube.com/shorts/mtlel6YZtUA) |
| 0,3x | Pagar Kehidupan | 1.300 | 4.500 | conf | "Do you still think that you're not special ? Why" (ucapan) | tidak masuk rumus | [link](https://www.youtube.com/shorts/IthXuE7yXXo) |
| 0,3x | Akbar Abi | 1.000 | 3.700 | conf | "Ada usaha, ada perubahan." (judul) | Q Kutipan motivasi umum | [link](https://www.youtube.com/shorts/cdMonqIzwWM) |
| 0,2x | Akbar Abi | 871 | 3.700 | conf | "just some random video on my camera roll📽️" (judul) | tidak masuk rumus | [link](https://www.youtube.com/shorts/XiJ3EVzTV0g) |
| 0,2x | Steny Agustaf | 156 | 852 | comm | "If a segment suddenly has to be cut , how" (ucapan) | #10 If This Then | [link](https://www.youtube.com/shorts/EcFQHkS8TmY) |
| 0,1x | PRESENTA | 103 | 1.150 | comm | "Ada satu kalimat yang sebaiknya dihindari dalam diskusi." (ucapan) | #2 Negative Command | [link](https://www.youtube.com/shorts/Ud5Ir14Mq1g) |

## Yang tidak bisa disimpulkan dari data ini

- Apakah pola ini sama di Reels. Perlu diuji di akunmu sendiri: tiap naskah dicatat views, non-follower reach, dan skip rate 3 detik.
- Pengaruh jam posting, thumbnail, dan musik. Tidak diukur.
- Confidence sebagai topik tunggal. Sampelnya terlalu kecil. Ulangi riset ini bulan depan dengan Saved collection Instagram-mu sendiri, karena itu korpus yang paling relevan.

## File data

- `work/benchmark-viral-2026-11.tsv`: 79 baris lengkap dengan akun, median, views, multiple, pilar, rumus, sumber hook, dan link.
- `~/.claude/instagram/swipe.md` dan salinannya `work/swipe.md`: dibaca oleh `/ig-reel` dan `/ig-plan`.
