# P3. Salah ngomong pas meeting (pilar CONFIDENCE) · versi 3

Format serial edukasi (template HOOK, SKENARIO, AKIBAT, REFRAME, SOLUSI, PENUTUP, CTA) · Funnel TOFU · 113 kata, sekitar 47 detik · Keyword CTA: **PEDE** · Video: skill berarti-reels (gaya C2)

## Kenapa versi 3

Versi 2.1 dinilai user masih belum relevan. Ada dua penyebab:
- **Konteksnya dunia mahasiswa** (kepeleset di kelas), padahal audiens BERARTI usia 20 sampai 35 sedang sibuk dengan pekerjaan dan karier.
- **Dialognya tidak realistis.** Jarang ada orang yang mengungkit kejadian memalukan tiga tahun lalu.

Versi 3 memindahkan semuanya ke kantor dan ke momen yang paling sering bikin orang kepikiran, yaitu salah ngomong di meeting hari ini. Dialognya jadi percakapan yang wajar sehabis meeting. Insightnya tetap spotlight effect, dan sudutnya tetap berbeda dari serial nomor 26 (teknik saat blank): episode ini soal rasa malu **sesudah** kejadian.

## 1. Naskah per beat

| Beat | Waktu | Siapa | Teks |
|---|---|---|---|
| HOOK | 0 sampai 5 | Narasi | Salah ngomong pas meeting, kamu kepikiran semalaman. Yang lain? Sibuk sama dirinya sendiri. |
| SKENARIO | 5 sampai 12 | Dina | Aduh, tadi di meeting aku salah sebut nama klien. Malu banget. |
| | | Firas | Hah, masa? Aku malah inget usulanmu yang bagus. |
| AKIBAT | 12 sampai 19 | Narasi | Dina ngulang momen itu semalaman. Padahal aku, yang duduk di sebelahnya, bahkan nggak nyadar. |
| REFRAME | 19 sampai 30 | Narasi | Ini namanya spotlight effect. Di eksperimen, mahasiswa yang pakai kaos norak yakin banyak yang notice. Nyatanya, jauh lebih sedikit. Kita ngerasa disorot, padahal semua orang sibuk sama dirinya sendiri. |
| SOLUSI | 30 sampai 38 | Narasi | Jadi kalau malunya muncul, tanya satu hal: "Kalau terulang, aku mau ngapain beda?" Jawab. Terus lanjut kerja. |
| PENUTUP | 38 sampai 41 | Narasi | Yang paling inget kesalahanmu, biasanya cuma kamu. |
| CTA | 41 sampai 47 | Narasi | Komen PEDE untuk latihan pas rasa malunya muncul lagi, nanti aku kirim lewat DM. |

Penutup menyambung ke hook saat video mengulang: "...biasanya cuma kamu." lalu "Salah ngomong pas meeting..."

### Cek penulisan
- **viral-hooks:** dibuka dengan situasi kerja yang langsung terbayang, ditujukan ke "kamu", dan ada kontras antara "kamu kepikiran semalaman" dan "yang lain sibuk sama dirinya sendiri". Klaimnya sesuai mekanisme riset, tanpa angka.
- **storytelling:** Dina malu, **tapi** Firas malah ingat hal yang bagus, **padahal** Dina mengulang momen itu semalaman, **jadi** ada satu pertanyaan sebagai tindakan. Kalimat Firas membuktikan insightnya: orang lain mengingat hal yang berbeda.
- **dumbify:** istilah langsung dijelaskan. Solusinya satu pertanyaan yang bisa langsung dipakai.
- **anti-ai-writing:** kontras "padahal semua orang sibuk sama dirinya sendiri" sudah dibayar dengan adegan di skenario.

## 2. Karakter
- **A: Firas,** rekan kerja yang duduk di sebelah Dina, sekaligus narator.
- **B: Dina,** karakter tetap yang sama di serial (karakter tetap). Tampil sebagai balon chat dengan avatar.

## 3. VO ElevenLabs (mode dialog, v3)

Speaker 1 adalah suara kloningmu. Speaker 2 adalah suara stok perempuan yang sama di semua episode. Jangan pakai kloning suara orang lain.

```
Speaker 1: [knowing, gentle] Salah ngomong pas meeting, kamu kepikiran semalaman. [beat] Yang lain? Sibuk sama dirinya sendiri.
Speaker 2: [embarrassed, groaning] Aduh, tadi di meeting aku salah sebut nama klien. Malu banget.
Speaker 1: [surprised, genuine] Hah, masa? [warm] Aku malah inget usulanmu yang bagus.
Speaker 1: [softer, empathetic] Dina ngulang momen itu semalaman. [beat] [amused] Padahal aku, yang duduk di sebelahnya, bahkan nggak nyadar.
Speaker 1: [curious, explaining] Ini namanya spotlight effect. Di eksperimen, mahasiswa yang pakai kaos norak yakin banyak yang notice. [beat] Nyatanya? Jauh lebih sedikit. [warm] Kita ngerasa disorot... padahal semua orang sibuk sama dirinya sendiri.
Speaker 1: [calm, practical] Jadi kalau malunya muncul, tanya satu hal: [softly] "Kalau terulang, aku mau ngapain beda?" [firm] Jawab. Terus lanjut kerja.
Speaker 1: [slow, warm] Yang paling inget kesalahanmu... biasanya cuma kamu.
Speaker 1: [friendly, upbeat] Komen PEDE untuk latihan pas rasa malunya muncul lagi, nanti aku kirim lewat DM.
```

Kalau mode dialog tidak tersedia: buat baris Speaker 1 dengan suaramu dan baris Speaker 2 terpisah, lalu kirim semuanya beserta urutannya.

## 4. Storyboard per adegan

| Adegan | Kartu tengah | Firas (pose, ekspresi) | Judul narasi | SFX |
|---|---|---|---|---|
| HOOK (cover) | cover (lihat bagian 8) | tunjuk_kamu, serius | dari cover | pop_hi pembuka |
| SKENARIO | Kartu jendela meeting (mockup video call atau ruang rapat), dengan chip "Meeting · Klien" yang memudar. Lalu `SpeechBubble` kiri "DINA · REKAN KERJA": "Aduh, tadi di meeting aku salah sebut nama klien. Malu banget." Lalu balon kanan oranye milik Firas: "Hah, masa? Aku malah inget usulanmu yang bagus." | tulus, ramah saat Dina bicara (mulut diam lewat `mute`). Lalu bertanya, terkejut, lalu ramah, senyum | balon dialog menggantikan judul narasi | pop tiap balon |
| AKIBAT | Layar HP malam hari: jam berganti dari malam ke dini hari, dengan ikon putar ulang. Lalu kartu kecil dua kursi: Dina dengan awan pikiran penuh, Firas dengan awan kosong | tanda_x, serius, lalu tulus | "semalaman." jadi **kata raksasa** dengan **flood oranye** | click_lo tiap jam berganti, thump di flood |
| REFRAME | Ruangan berisi `Person`, satu memakai kaos norak (ikon mikrofon dan not balok) yang disorot lampu, yang lain menunduk ke HP masing-masing. Dua bar tanpa angka: "Yang mereka kira notice" panjang, "Yang beneran notice" pendek | bertanya, ramah, nod | kata kunci: spotlight effect, sedikit. "sendiri." jadi **kata raksasa** | pop per bar |
| SOLUSI | Kartu pertanyaan "Kalau terulang, aku mau ngapain beda?" dengan kursor mengetik. Lalu chip hijau "lanjut kerja" dengan `Check` | tawarkan, ramah, lalu hitung_tiga di "Jawab" | kata kunci: beda | click mengetik, ding di centang |
| PENUTUP | Kartu bersih: satu lampu sorot kecil yang meredup | tulus, ramah | kata kunci: cuma kamu | pop lembut |
| CTA | `CtaDM` master: keyword **PEDE**, Kirim, DM "Ilmu Pede · Malu habis salah ngomong", lalu "Ilmunya lewat DM!" | membesar, tunjuk_kamu, ramah, lalu wink | CTA master | SFX bawaan CtaDM |

Pop close-up: cu_tertawa (Dina canggung) di SKENARIO, cu_merenung di AKIBAT.

Transisi mozaik di awal AKIBAT, REFRAME, SOLUSI, dan CTA.

## 5. Spesifikasi CTA
- VO: "Komen PEDE untuk latihan pas rasa malunya muncul lagi, nanti aku kirim lewat DM."
- `keyword`: PEDE
- `dmTitle`: Ilmu Pede · Malu habis salah ngomong
- `dmLine`: latihan 3 langkah, 2 menit
- Penutup visual: "Ilmunya lewat DM!" (master)

## 6. Teks DM otomatis (pemicu PEDE)

```
Hai! Ini latihan buat kamu yang masih kepikiran habis salah ngomong.

Pas malunya muncul lagi, lakukan 3 langkah ini (2 menit):

1. Kasih nama: "Ini spotlight effect. Aku ngerasa disorot, padahal orang lain sibuk sama dirinya sendiri."
2. Tanya satu hal: "Kalau terulang, aku mau ngapain beda?" Tulis jawabannya di notes HP, satu kalimat aja.
3. Lanjut: begitu jawabannya ketulis, kerjakan satu tugas kecil yang bisa selesai dalam 10 menit. Fokusmu pindah ke hal yang bisa kamu kontrol.

Kalau kesalahannya berdampak ke orang lain (misalnya salah info ke klien), cukup satu pesan singkat: akui, perbaiki, selesai. Nggak perlu minta maaf berkali-kali.

Kalau rasa malu sering bikin kamu susah tidur atau ganggu kerja dalam waktu lama, ngobrol sama psikolog itu langkah yang kuat, bukan lemah.

Penasaran seberapa bagus speaking-mu sekarang? Cek di BERARTI Speaking Index: 35 pertanyaan, 7 menit, gratis. Lihat skor pilar B (sadar diri) kamu di sana: [link BERARTI Speaking Index]?src=ig-p3
```

## 7. Caption

```
Salah ngomong pas meeting, kamu kepikiran semalaman. Yang lain? Sibuk sama dirinya sendiri.

Dina salah sebut nama klien dan malu semalaman. Rekan di sebelahnya malah cuma inget usulannya yang bagus.
Namanya spotlight effect: kita ngerasa disorot, padahal semua orang sibuk sama dirinya sendiri.

Kalau malunya muncul, tanya: "Kalau terulang, aku mau ngapain beda?" Jawab, terus lanjut kerja.

Komen PEDE, nanti aku kirim latihan 2 menitnya lewat DM.
Tag rekan kerja yang suka kepikiran semalaman.

#percayadiri #duniakerja #pengembangandiri
```

## 8. Cover (rule of thirds)
- Judul 3 baris, sama dengan awal hook: **SALAH NGOMONG / PAS MEETING? / CUMA KAMU**, dengan Marker di "CUMA KAMU"
- Balon yang dicoret merah: "Semua orang pasti ngetawain aku..."
- Pill solusi: "Yang lain sibuk sama dirinya"
- Chip pilar: CONFIDENCE
- Pose cover: tunjuk_kamu, serius

## Sumber klaim
Gilovich, Medvec, Savitsky (2000), "The spotlight effect in social judgment", Journal of Personality and Social Psychology 78(2), 211 sampai 222. Naskah sengaja tanpa persentase, karena sumber sekunder yang dicek tidak konsisten soal angka "yang beneran notice". "Semua orang sibuk sama dirinya sendiri" adalah penjelasan mekanisme yang dipakai para penelitinya (bias egosentris), bukan angka.
