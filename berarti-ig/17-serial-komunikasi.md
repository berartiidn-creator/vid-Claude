# Serial Edukasi Komunikasi (berarti.academy)

Format: micro-storytelling dengan dialog 2 karakter · 1 tema per video · target 45 sampai 55 detik (maksimal 65) · 1 CTA yang sama di setiap episode.
Produksi video memakai skill `berarti-reels` (gaya Kinetic Cream C2) dalam mode serial. Ketik **"Konten 01"** sampai **"Konten 30"** untuk paket produksi lengkap.

## CTA master (jangan diubah)

| Bagian | Isi tetap |
|---|---|
| Keyword | **KOMUNIKASI** (semua episode serial ini) |
| VO ajakan | "Komen KOMUNIKASI untuk [konteks tema], nanti aku kirim lewat DM." |
| Visual | kolom komentar, keyword diketik, tombol **Kirim** ditekan, "✓ Komentar terkirim", kartu DM dari berarti.academy masuk, lalu **"Ilmunya lewat DM!"** di atas latar oranye penuh |
| Jalur | komentar KOMUNIKASI, lalu DM otomatis berisi materi episode |

Layout, animasi, SFX, dan posisi CTA dikunci di komponen `CtaDM` (skill berarti-reels). Per episode yang berubah hanya konteks di kalimat VO dan judul pill di kartu DM ("Ilmu Komunikasi · EP 01").

Supaya CTA ini jalan: pasang balasan otomatis komentar ke DM (misalnya ManyChat untuk Instagram) dengan pemicu kata KOMUNIKASI. Setiap paket "Konten NN" menyertakan teks DM berisi materi episodenya.

## Struktur naskah per episode

| Beat | Waktu | Isi |
|---|---|---|
| HOOK | 0 sampai 4 dtk | situasi yang langsung terbayang, bukan topik. Jadi judul cover |
| SKENARIO | 4 sampai 16 dtk | dialog 2 karakter (2 sampai 4 baris), situasi sehari-hari |
| AKIBAT | 16 sampai 24 dtk | dampak perilaku itu ke hubungan atau hasil |
| REFRAME | 24 sampai 32 dtk | sudut pandang baru, tanpa menghakimi |
| SOLUSI | 32 sampai 44 dtk | 1 sampai 3 langkah praktis dengan contoh kalimat |
| PENUTUP | 44 sampai 47 dtk | satu kalimat yang kena dan menyambung ke hook saat video mengulang |
| CTA | 47 sampai 55 dtk | CTA master |

Penyesuaian dari draf awal (berdasarkan data benchmark kita): total dipangkas ke sekitar 55 detik karena video yang menang di sampel bermedian 58 detik, sedangkan yang kalah 68 detik. CTA dibatasi sekitar 8 detik. Ditambah satu kalimat penutup sebelum CTA, karena video atas selalu ditutup kalimat yang kena, baru ajakan.

## 30 episode (hook sudah diaudit dengan viral-hooks)

Kolom "Hook dipakai" adalah versi final. Kalau sama dengan aslinya, ditulis "tetap".

### Batch 1: Kebiasaan komunikasi yang sering tidak disadari

| No | Hook asli | Catatan audit | Hook dipakai |
|---|---|---|---|
| 01 | Pernah nggak, tanpa sadar kamu melakukan hal-hal yang bikin orang lain merasa nggak nyaman saat berbicara? | "hal-hal" kabur, 17 kata, tidak ada kontras | Kamu ngerasa ngobrolnya lancar. Lawan bicaramu justru pengen cepet pergi. |
| 02 | Pernah nggak kamu merasa sudah menjelaskan dengan baik, tapi orang lain malah salah paham? | kuat, dipadatkan | Udah jelasin panjang lebar, tapi orang malah salah paham? |
| 03 | Kenapa ada orang yang baru bicara sebentar, tapi kita langsung merasa nyaman dengannya? | bagus, ganti "kita" jadi situasi | Baru ngobrol dua menit, kamu udah nyaman sama dia. Ini yang dia lakukan. |
| 04 | Pernah nggak kamu memotong pembicaraan orang, karena merasa sudah tahu apa yang mau dia katakan? | kuat | tetap |
| 05 | Jangan buru-buru menjawab ketika seseorang sedang bercerita. Bisa jadi dia belum selesai. | mirip 04, dibedakan: fokus ke jeda | Temanmu berhenti ngomong. Jangan langsung jawab. Dia mungkin belum selesai. |
| 06 | Pernah nggak kamu memberikan solusi, padahal temanmu sebenarnya hanya ingin didengarkan? | sangat kuat | tetap |
| 07 | Kenapa cara kita mengatakan sesuatu kadang lebih penting daripada apa yang kita katakan? | abstrak, tidak ada situasi | Kalimatnya sama: "Oke, terserah." Yang satu bikin tenang, yang satu bikin perang. |
| 08 | Pernah nggak kamu bercanda, tapi ternyata orang lain tersinggung? | kuat | tetap |
| 09 | Ada kebiasaan kecil yang bisa membuat kita terlihat tidak menghargai lawan bicara. | kabur ("kebiasaan kecil") | Ngobrol sambil lirik HP? Itu yang bikin lawan bicaramu berhenti cerita. |
| 10 | Kalau kamu sering bilang "terserah", mungkin tanpa sadar kamu sedang membuat komunikasi menjadi sulit. | kuat, dipadatkan | Sering jawab "terserah"? Kamu lagi bikin orang lain nebak-nebak. |

### Batch 2: Skill komunikasi sehari-hari

Pola "Cara..." jelas tapi kurang memancing penasaran. Di data kita, hook yang membuka dengan situasi menang dari hook yang membuka dengan topik, jadi semua diubah ke situasi dulu.

| No | Hook asli | Hook dipakai |
|---|---|---|
| 11 | Cara menolak ajakan tanpa membuat orang lain merasa ditolak. | Diajak pergi pas kamu lagi capek? Tolak pakai kalimat ini, tanpa bikin dia ngerasa ditolak. |
| 12 | Cara menyampaikan kritik tanpa membuat orang merasa diserang. | Mau kritik kerjaan teman tanpa bikin dia defensif? Pakai urutan ini. |
| 13 | Cara meminta bantuan tanpa terdengar memaksa. | Minta tolong tapi takut kedengeran nyuruh? Ganti kalimat pertamanya. |
| 14 | Cara menghadapi orang yang selalu memotong pembicaraan. | Tiap kamu ngomong, dia selalu motong? Jangan ikut ngegas. |
| 15 | Cara menjawab pertanyaan sulit tanpa panik. | Ditanya hal sulit di depan banyak orang? Jangan langsung jawab. |
| 16 | Cara berbicara ketika kamu tidak tahu jawabannya. | Ditanya dan kamu nggak tahu jawabannya? Jangan ngarang. Bilang ini. |
| 17 | Cara membuat orang merasa dihargai saat sedang berbicara denganmu. | Orang betah ngobrol sama kamu kalau kamu melakukan satu hal ini. |
| 18 | Cara menghindari salah paham ketika berkomunikasi lewat chat. | "Oke." Dua huruf ini di chat bisa bikin orang salah paham. |
| 19 | Cara meminta maaf yang benar, bukan sekadar mengatakan "sorry". | "Sorry ya." Kalau cuma itu, permintaan maafmu belum selesai. |
| 20 | Cara menyampaikan pendapat tanpa harus selalu memenangkan argumen. | Kamu menang debat, tapi kehilangan temannya. |

### Batch 3: Confidence dan public speaking (tetap keyword KOMUNIKASI)

| No | Hook asli | Catatan audit | Hook dipakai |
|---|---|---|---|
| 21 | Kenapa kamu sering gugup ketika harus berbicara di depan banyak orang? | umum, tumpang tindih dengan C1 di bank | Tangan dingin lima menit sebelum maju? Itu bukan tanda kamu nggak siap. |
| 22 | Jangan hafalkan seluruh kata-kata ketika presentasi. Ini yang sebaiknya kamu lakukan. | kuat | tetap |
| 23 | Kalau suara kamu gemetar saat berbicara, jangan langsung menganggap kamu tidak percaya diri. | kuat | tetap |
| 24 | Cara memulai presentasi agar orang langsung memperhatikan. | **sudah diproduksi sebagai C2**, diganti | Presentasimu bagus, tapi nggak ada yang inget. Masalahnya di 10 detik terakhir. |
| 25 | 3 hal yang membuat presentasi terasa membosankan. | bagus, beri situasi | Audiens mulai buka HP di menit ketiga? Ini 3 penyebabnya. |
| 26 | Cara mengatasi blank saat sedang berbicara. | ubah ke situasi | Blank di tengah presentasi? Jangan minta maaf. Lakukan ini. |
| 27 | Kenapa orang yang percaya diri tidak selalu berbicara paling banyak? | kuat | tetap |
| 28 | Cara berbicara agar pesanmu lebih mudah diingat. | ubah ke situasi | Presentasi 20 menit, yang diingat cuma satu kalimat. Pastikan kalimatnya ini. |
| 29 | Kamu tidak harus menjadi orang paling pintar untuk menjadi komunikator yang baik. | cukup (pola izin) | tetap |
| 30 | Sebenarnya, public speaking bukan tentang berbicara sempurna. | pola "bukan X" yang kosong, ciri tulisan AI | Pembicara favoritmu juga salah ngomong. Bedanya cuma di satu hal. |

Catatan tumpang tindih: 04, 05, dan 14 sama-sama soal memotong pembicaraan, jadi tayangkan berjauhan dan bedakan sudutnya (04 kebiasaanmu, 05 jeda, 14 menghadapi orang lain). 06 dan 17 sama-sama soal mendengarkan.

## Status produksi

| No | Status |
|---|---|
| 01 sampai 30 | belum |
