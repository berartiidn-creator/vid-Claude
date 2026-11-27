# Mode serial: "Konten NN"

**Serial ini adalah corong ke BERARTI Speaking Index.** Peta 30 episode ada di `berarti-ig/17-serial-komunikasi.md`. Setiap episode memecah satu pokok bahasan Kurikulum Public Speaking BERARTI Academy dan terhubung ke satu pilar BERARTI (B, R-Makna, E, A, R-Aksi, T, I) serta satu pertemuan kelas (MP-1 sampai MP-4).

**Aturan kulit (wajib):**
- Konten menampilkan masalah, akibat, dan konsep atau riset di REFRAME. SOLUSI boleh menyebut rumus dan poin dari silabus (PREP, Vokal 4P, kartu 3K, enam qaulan, jika-maka), tapi tanpa pendalaman.
- Kalimat CTA berbeda di setiap episode: pertanyaan yang memancing penasaran sesuai tema, lalu "Komen KOMUNIKASI" dan tes gratis lewat DM. Hanya janjikan yang ada di hasil tes (skor, level, tipe pembicara, peta 7 pilar, 3 latihan, soal kuis). Draf hook, skenario, solusi, dan CTA tiap episode ada di `berarti-ig/18-peta-serial-speaking-index.md`.
- DM hanya memberi satu tambahan kecil dan link tes `?src=ig-epNN`.
- Teknik lengkap, drill, checklist, dan rubrik milik tes dan kelas.
- Kelas tidak disebut di konten maupun DM, karena kelas baru muncul di akhir hasil tes.
- Klaim riset hanya yang berstatus "Terverifikasi" di bagian H kurikulum.

Daftar episode, hook final, dan CTA master ada di `berarti-ig/17-serial-komunikasi.md`. Saat user mengetik **"Konten NN"** (01 sampai 30), buat satu paket produksi lengkap, simpan di `berarti-ig/serial-komunikasi/NN-<slug>.md`, lalu tunggu VO. Jangan render sebelum ada VO dan persetujuan.

## Isi paket "Konten NN"

1. **Naskah per beat dengan target waktu:** HOOK, SKENARIO (dialog), AKIBAT, REFRAME, SOLUSI, PENUTUP, CTA. Totalnya 110 sampai 130 kata (45 sampai 55 detik).
   - Hook diambil dari kolom "Hook dipakai".
   - Penutup adalah satu kalimat yang menyambung ke hook saat video mengulang.
   - Cek dengan viral-hooks (hook), storytelling (pakai "tapi" atau "jadi", bukan "lalu"), dumbify (bahasa sehari-hari), dan anti-ai-writing versi lisan.
2. **Dialog skenario:** 2 sampai 4 baris. Karakter A adalah Firas, karakter B adalah lawan bicara dengan nama dan peran, misalnya "Dina, teman kantor". Tulis siapa mengucapkan apa.
3. **VO ElevenLabs:**
   - Narasi dan baris Firas memakai suara kloning user.
   - Baris karakter B memakai suara stok ElevenLabs. **Jangan pernah memakai kloning suara orang lain.**
   - Pakai tag emosi v3 dan tulis angka sebagai kata.
   - Beri dua blok terpisah (VO utama dan baris B) plus urutan penggabungannya, atau satu skrip mode dialog ElevenLabs.
4. **Storyboard per adegan:** visual kartu di tengah, pose dan ekspresi Firas, kata raksasa, flood, dan pop close-up. Semuanya dipetakan ke komponen kit:
   - dialog memakai `SpeechBubble`, dengan side 'left' untuk karakter B dan 'right' untuk Firas
   - mockup UI memakai `Card`, `Chip`, dan `Row`
   - audiens memakai `Person`
   - checklist memakai `Check`
5. **SFX** mengikuti pola gaya. CTA sudah punya SFX sendiri di `CtaDM`.
6. **CTA master:** kalimat VO "Komen KOMUNIKASI, nanti aku kirim tes gratis buat cek [aspek episode]-mu lewat DM." Isi spesifikasinya: `dmTitle` "Ilmu Komunikasi · EP NN" dan `dmLine` "Tes gratis · cek skor speaking-mu".
7. **Teks DM otomatis** (yang dikirim ke komentator), siap ditempel ke ManyChat. Pakai template DM di `17-serial-komunikasi.md`:
   - satu tambahan kecil (bukan teknik lengkap)
   - ajakan cek BERARTI Speaking Index dengan link `?src=ig-epNN`
   - pilar BERARTI episode itu
   - Tanpa angka yang tidak bisa dipertanggungjawabkan, dan tanpa menyebut kelas.
8. **Caption:**
   - Baris pertama memakai hook.
   - Isinya 3 baris inti.
   - Ajakannya sama dengan CTA master (komen KOMUNIKASI).
   - Maksimal 3 hashtag.
   - Bebas em dash dan "&".
9. **Teks cover** (rule of thirds):
   - judul 3 baris dari hook
   - balon berisi kalimat atau kebiasaan yang salah, dicoret
   - pill berisi solusi singkat
   - pilar COMMUNICATION dan label episode "EP NN"

## Di `reel.tsx` (saat video dibuat)

- **Dialog:**
  - Setiap baris karakter B ditulis sebagai `SpeechBubble side="left"` pada waktu kata pertamanya.
  - Rentang waktu baris B dimasukkan ke `mute` di spec, supaya mulut Firas diam saat B bicara.
  - Saat B bicara, Firas memakai pose mendengar (tulus, ekspresi ramah).
- **CTA:**
  - Tulis adegan terakhir sebagai `<CtaDM c={CTA} />`.
  - Set waktunya: `start` di kata "Komen", `type` di kata keyword, `tap` sekitar 0,4 detik setelah keyword, `dm` di kata "DM", dan `close` sekitar 0,3 detik setelah kalimat CTA selesai.
  - Set spec: `closeAt: CTA.close`, `g: CTA.start`, dan `l` sekitar 1,6 detik setelah `close`.
  - Tambahkan jendela flood `[CTA.close - 0.1, L]`.
  - Kalimat CTA tetap jadi blok judul narasi, dengan keyword masuk `KW`.
- **Durasi:** `end` mengikuti waktu `close` ditambah sekitar 2,4 detik, karena kalimat VO bisa selesai sebelum penutup visual. Set `project.json` ke nilai yang sama.
- **Demo CTA:** render komposisi `CtaDemo` untuk melihat CTA master sendirian.

## Keyword per pilar
Pola CTA (komen keyword, DM, lalu "Ilmunya lewat DM!") dipakai di semua pilar. Keywordnya: COMMUNICATION memakai **KOMUNIKASI**, CONFIDENCE memakai **PEDE**, dan GROW belum ditentukan (tanya user sebelum episode Grow pertama). Chip pilar di cover mengikuti pilarnya.

## Konsistensi serial
- Keyword, jalur DM, tulisan "Ilmunya lewat DM!", layout kartu komentar dan DM, tombol Kirim, animasi, dan SFX CTA tidak boleh diubah per episode.
- Yang berubah per episode hanya tema, dialog, isi kartu adegan, konteks di kalimat ajakan, dan `dmTitle` atau `dmLine`.
- Setelah episode tayang, perbarui tabel status di `17-serial-komunikasi.md`.
