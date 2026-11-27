# Bonus: Cerita yang direbut (di luar 30 episode)

Bonus Serial Edukasi Komunikasi · Pilar konten COMMUNICATION · Tidak ada di silabus public speaking (topiknya mendengarkan dalam obrolan) · Target 45 sampai 50 detik (108 kata) · Keyword CTA: KOMUNIKASI

Tema: tanpa sadar kita "merebut" cerita lawan bicara dengan membalas pakai cerita sendiri (shift response). Gantinya: support response, yaitu tanya dulu dan biarkan ceritanya selesai.

## 1. Naskah per beat

| Beat | Waktu | Siapa | Teks |
|---|---|---|---|
| HOOK | 0 sampai 4 | Narasi | Kamu ngerasa ngobrolnya lancar. Lawan bicaramu justru pengen cepet pergi. |
| SKENARIO | 4 sampai 14 | Dina | Kemarin aku presentasi, terus laptopku mati di tengah jalan. |
| | | Firas | Ah, itu mah belum seberapa. Aku dulu proyektornya meledak! |
| | | Dina | Oh... iya, hehe. |
| AKIBAT | 14 sampai 22 | Narasi | Niatnya nyambung. Tapi buat Dina, ceritanya baru aja direbut. Dan orang yang ceritanya direbut, pelan-pelan berhenti cerita. |
| REFRAME | 22 sampai 29 | Narasi | Ini namanya shift response: obrolan digeser ke diri kita. Biasanya bukan karena egois. Kita cuma pengen relate. |
| SOLUSI | 29 sampai 40 | Narasi | Ganti pakai support response. Sebelum cerita versimu, tanya dulu: "Terus kamu gimana?" Biarin dia selesai. Ceritamu bisa nunggu. |
| PENUTUP | 40 sampai 44 | Narasi | Kadang cara paling cepat bikin orang nyaman, ya nggak cerita apa-apa dulu. |
| CTA | 44 sampai 52 | Narasi | Komen KOMUNIKASI, nanti aku kirim contoh kalimatnya plus tes gratis buat cek skor speaking-mu lewat DM. |

Total 108 kata (sekitar 45 detik bicara, ditambah jeda dialog). Penutup sengaja menyambung ke hook saat video mengulang: "...nggak cerita apa-apa dulu." lalu "Kamu ngerasa ngobrolnya lancar."

### Cek penulisan
- **viral-hooks:** hook lolos semua cek. Topik langsung jelas, kalimatnya mudah, ditujukan ke "kamu", dan ada kontras antara "lancar" dan "pengen cepet pergi".
- **storytelling:** alurnya dialog, **tapi** ceritanya direbut, **jadi** ganti dengan support response. Tidak ada rangkaian "lalu... lalu...".
- **dumbify:** satu-satunya istilah (shift response dan support response) langsung dijelaskan di kalimat yang sama.
- **anti-ai-writing:** tidak ada pola "bukan X tapi Y" yang kosong. Kalimat "Biasanya bukan karena egois" langsung dibayar dengan alasan yang konkret.

## 2. Karakter

- **A: Firas.** Di skenario dia sengaja memerankan kesalahannya, lalu menjelaskan sebagai narator. Ini menunjukkan "kita semua pernah begini", bukan menggurui.
- **B: Dina, teman kantor.** Tampil sebagai balon chat dengan avatar (opsi A).

## 3. VO ElevenLabs

Pakai mode dialog (Text to Dialogue, v3). Speaker 1 adalah suara kloningmu. Speaker 2 adalah suara stok perempuan ElevenLabs. **Jangan pakai kloning suara orang lain.**

```
Speaker 1: [confident, slightly teasing] Kamu ngerasa ngobrolnya lancar. [beat] Lawan bicaramu justru pengen cepet pergi.
Speaker 2: [frustrated, storytelling] Kemarin aku presentasi, terus laptopku mati di tengah jalan.
Speaker 1: [excited, interrupting energy] Ah, itu mah belum seberapa! Aku dulu proyektornya meledak!
Speaker 2: [awkward, deflated] Oh... iya, hehe.
Speaker 1: [softer, explaining] Niatnya nyambung. [beat] Tapi buat Dina, ceritanya baru aja direbut. [slow] Dan orang yang ceritanya direbut... pelan-pelan berhenti cerita.
Speaker 1: [warm, curious] Ini namanya shift response: obrolan digeser ke diri kita. Biasanya bukan karena egois. Kita cuma pengen relate.
Speaker 1: [clear, practical] Ganti pakai support response. Sebelum cerita versimu, tanya dulu: [gentle] "Terus kamu gimana?" [firm] Biarin dia selesai. Ceritamu bisa nunggu.
Speaker 1: [slow, warm] Kadang cara paling cepat bikin orang nyaman... ya nggak cerita apa-apa dulu.
Speaker 1: [friendly, upbeat] Komen KOMUNIKASI, nanti aku kirim contoh kalimatnya plus tes gratis buat cek skor speaking-mu lewat DM.
```

Kalau mode dialog tidak tersedia: buat baris Speaker 1 dengan suaramu dan dua baris Speaker 2 dengan suara stok secara terpisah, lalu kirim ketiga file beserta urutannya. Saya yang menyambungkan.

## 4. Storyboard per adegan

Posisi mengikuti layout C2: judul narasi kata demi kata di atas, satu kartu di tengah, Firas di bawah.

| Adegan | Kartu tengah | Firas (pose, ekspresi) | Judul narasi | SFX |
|---|---|---|---|---|
| HOOK (cover) | cover Bonus (lihat bagian 8) | tunjuk_kamu, serius | dari cover, bukan blok judul | pop_hi pembuka |
| SKENARIO | `SpeechBubble` kiri "DINA · TEMAN KANTOR": "Kemarin aku presentasi, terus laptopku mati di tengah jalan." Lalu balon kanan oranye milik Firas: "Ah, itu mah belum seberapa! Aku dulu proyektornya meledak!" Lalu balon kiri kecil: "Oh... iya, hehe." | tulus, ramah saat Dina bicara (mulut diam lewat `mute`). Lalu semangat, ceria, beat saat merebut. Lalu bertanya, netral saat Dina menjawab canggung | balon dialog menggantikan judul narasi di adegan ini | pop tiap balon, click_lo di "hehe" |
| AKIBAT | Balon cerita Dina mengecil dan terdorong ke kiri oleh balon Firas yang membesar. Avatar Dina meredup, lalu chip "berhenti cerita" | tanda_x, serius | "direbut." jadi **kata raksasa**, dengan **flood oranye** di blok ini | whoosh_short, thump di "direbut" |
| REFRAME | Kartu "SHIFT RESPONSE" dengan `Row`: Dia cerita, lalu Aku nyambung, lalu Topik pindah ke aku (yang terakhir dicoret dan meredup). Chip hijau "niatnya pengen relate" | bertanya, ramah, nod | kata kunci: shift response, relate | pop per item |
| SOLUSI | Dua kartu banding. ✕ SHIFT: "Aku juga pernah, malah..." (abu, dicoret). ✓ SUPPORT: "Terus kamu gimana?" (oranye, `Check` tergambar). Lalu chip "biarin dia selesai" | tawarkan, ramah, lalu hitung_tiga saat "Biarin dia selesai" | "nunggu." jadi **kata raksasa** | ding di centang |
| PENUTUP | Kartu bersih: dua kursi ngobrol, balon kosong di sisi Firas, balon penuh di sisi lawan bicara | tulus, ramah, nod | kata kunci: nyaman | pop lembut |
| CTA | `CtaDM` master: KOMUNIKASI, Kirim, DM "Ilmu Komunikasi · Bonus", lalu "Ilmunya lewat DM!" | membesar, tunjuk_kamu, ramah, lalu wink | blok CTA lalu penutup master | SFX bawaan CtaDM |

Pop close-up: cu_empati di AKIBAT, cu_tertawa di SKENARIO (saat Dina menjawab canggung).

Transisi mozaik di awal AKIBAT, REFRAME, SOLUSI, dan CTA.

## 5. Spesifikasi CTA master

- VO: "Komen KOMUNIKASI, nanti aku kirim contoh kalimatnya plus tes gratis buat cek skor speaking-mu lewat DM."
- `keyword`: KOMUNIKASI
- `dmTitle`: Ilmu Komunikasi · Bonus
- `dmLine`: 2 kalimat support response · tes gratis
- Penutup visual: "Ilmunya lewat DM!" (master, tidak diubah)

## 6. Teks DM otomatis (untuk pemicu KOMUNIKASI)

```
Hai! Ini lanjutan Bonus: cara biar cerita orang nggak "direbut".

Dua kalimat support response yang bisa langsung kamu pakai: "Terus kamu gimana?" dan "Waktu itu kamu ngerasanya gimana?" Tanya dulu, cerita belakangan.

Penasaran seberapa bagus speaking-mu sekarang? Cek di BERARTI Speaking Index: 35 pertanyaan, 7 menit, gratis.
Hasilnya langsung keluar: skor speaking, tipe pembicaramu, peta 7 pilar, dan 3 latihan sesuai titik lemahmu.
Lihat skor pilar B (sadar diri dan audiens) kamu di sana: [link BERARTI Speaking Index]?src=ig-bonus01
```

## 7. Caption

```
Kamu ngerasa ngobrolnya lancar. Lawan bicaramu justru pengen cepet pergi.

Temanmu cerita laptopnya mati pas presentasi. Kamu bales: "Itu belum seberapa, aku dulu..."
Niatnya nyambung. Tapi ceritanya baru aja kamu rebut.

Coba tanya dulu: "Terus kamu gimana?" Biarin dia selesai. Ceritamu bisa nunggu.

Komen KOMUNIKASI, nanti aku kirim contoh kalimatnya plus tes gratis buat cek skor speaking-mu lewat DM.

#komunikasi #publicspeaking #pengembangandiri
```

## 8. Cover (rule of thirds)

- Judul 3 baris: **KAMU NGERASA / LANCAR, DIA / PENGEN PERGI**, dengan Marker di "PENGEN PERGI".
- Balon yang dicoret merah: "Aku juga pernah, malah lebih parah..."
- Pill solusi: "Tanya dulu: terus kamu gimana?"
- Chip pilar: COMMUNICATION · BONUS
- Pose cover: tunjuk_kamu, serius

## Sumber konsep

Istilah shift response dan support response berasal dari sosiolog Charles Derber, *The Pursuit of Attention* (1979). Naskah tidak memakai angka atau persentase dari penelitian.
