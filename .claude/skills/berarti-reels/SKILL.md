---
name: berarti-reels
description: "Bikin video Reels animasi BERARTI, termasuk serial edukasi Komunikasi (perintah 'Konten 01' sampai 'Konten 30', 'Konten berikutnya', 'Status serial'), dengan gaya Kinetic Cream yang dipakai di C2 'Jangan buka presentasi pakai perkenalan': kalimat VO tampil besar kata demi kata sebagai judul, satu kartu UI di tengah, karakter Firas lip-sync di bawah, latar cream premium dengan flood oranye di momen puncak, transisi mozaik piksel, cover rule of thirds yang jadi frame pertama, dan ending yang kembali ke cover supaya loop mulus. Pakai saat user minta video, Reels, atau animasi dari naskah dan VO untuk @berarti.academy, bilang 'pakai style C2', 'gaya editan kemarin', 'buat video kayak C2', atau minta revisi video dengan gaya ini."
---

# berarti-reels (gaya Kinetic Cream)

Gaya ini dikunci dari video final C2 yang sudah disetujui user. Jangan mengganti gaya, palet, font, tata letak, atau mesin animasinya kecuali user minta. Yang diganti per video hanya konten.

Isi folder:
- `template/` proyek Remotion 4 siap pakai. `src/kit.tsx` dan `src/cover.tsx` adalah **mesin gaya** (jangan diubah per video). `src/reel.tsx` adalah **konten** C2, dipakai sebagai contoh lengkap untuk ditiru. `src/Char.tsx` plus `public/rig3/` adalah rig karakter Firas (12 pose, viseme, ekspresi, kedip, close-up). Font, SFX (`public/audio/lemo`), dan musik orisinal (`public/audio/music/bed.mp3`) sudah termasuk.
- `reference/serial.md` protokol paket produksi "Konten NN" untuk serial edukasi.
- `tools/sync.py` membuat `env.json` (lip-sync dan ducking) dan durasi dari VO. `tools/tighten_vo.py` memadatkan bagian VO yang lambat.
- `reference/gaya.md` spesifikasi gaya. `reference/konten-baru.md` cara menulis `reel.tsx` untuk video baru. `reference/qc.md` checklist QC dan pelajaran dari C2.

## Aturan tetap
- **Skill ini menang untuk semua video BERARTI.** Di repo ini juga terpasang Hyperframes, ffmpeg-skill, voynann, lemo-opuscar, dan skill Remotion. Untuk Reels animasi @berarti.academy selalu pakai template Remotion di skill ini. Hyperframes dan yang lain hanya dipakai kalau user secara eksplisit meminta framework itu. ffmpeg-skill boleh dipakai untuk mengolah rekaman atau file audio dan video mentah.
- File VO adalah kloning suara user. Jangan pernah commit atau push file audio VO. Simpan hanya di proyek kerja di scratchpad.
- Tanpa em dash dan tanpa simbol "&" di semua teks yang terlihat (judul, kartu, caption).
- Jangan mengarang angka atau klaim yang tidak ada di naskah. Visual tidak boleh menyiratkan angka yang tidak diucapkan (pelajaran C2: timer "00:07" diganti stopwatch tanpa angka).
- Preview dulu, tanya user, baru render final. Final hanya setelah user bilang "render final".
- Pakai bahasa Indonesia ke user.

## Mode serial (Konten NN)
Kalau user mengetik "Konten 01" sampai "Konten 30", "Konten berikutnya", "lanjut serial", atau "Status serial", ikuti `reference/serial.md`. Sumber episodenya adalah peta resmi `berarti-ig/18-peta-serial-speaking-index.md`, termasuk tabel Status produksi yang wajib diperbarui di setiap tahap. CTA master ada di `berarti-ig/17-serial-komunikasi.md`. CTA serial memakai komponen `CtaDM` (keyword KOMUNIKASI, tombol Kirim, kartu DM, lalu "Ilmunya lewat DM!") dan tidak boleh diubah per episode. Dialog dua karakter memakai `SpeechBubble`, dengan spec `mute` supaya mulut Firas diam saat lawan bicara berbicara.

## Alur kerja
1. **Input.** Naskah final, VO mp3 (ElevenLabs suara user), pilar (COMMUNICATION, CONFIDENCE, atau GROW), dan teks cover. Teks cover terdiri dari judul 3 baris, kalimat "yang salah" untuk balon, dan pill solusi. Kalau belum ada, usulkan dari hook naskah.
2. **Siapkan proyek.** Salin `template/` ke `<scratchpad>/mograph-projects/<slug>/`, lalu `npm install`. Taruh VO di `public/vo.mp3` dan naskah bersih di `input/script.clean.txt`.
3. **Timing kata.** Jalankan `npm run align -- --setup` (sekali, unduh model), lalu `npm run align -- public/vo.mp3 input/script.clean.txt`. Hasilnya `src/words.json`.
4. **Opsional, padatkan.** Kalau ada bagian yang lambat (biasanya contoh atau langkah terpanjang), jalankan `python3 -I tools/tighten_vo.py <proyek> --from A --to B`. Jangan lebih dari tempo 1.10.
5. **Sync.** Jalankan `python3 -I tools/sync.py <proyek>`. Ini menulis env dan durasi, lalu mencetak indeks kata untuk langkah berikut.
6. **Tulis konten** di `src/reel.tsx` mengikuti `reference/konten-baru.md`: timing, pose, blok judul narasi, kata kunci, flood, transisi, kartu per adegan, pop close-up, SFX, dan cover.
7. **Cek cepat.** Jalankan `npx tsc --noEmit`, lalu `SCALE=0.4 node scripts/stills.mjs out/qc <detik...>` dan baca `out/qc/sheet.jpg`.
8. **Preview.** `node scripts/draft.mjs out/<slug>-raw.mp4` (540p). Lalu `ffmpeg -i out/<slug>-raw.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -c:a aac -b:a 192k out/<slug>-preview.mp4`. Kirim ke user.
9. **QC menyeluruh** per 0,5 detik sesuai `reference/qc.md` sebelum dan sesudah revisi. Perbaiki semua temuan, jangan cuma yang dilaporkan user.
10. **Final** setelah user setuju:
    - Video: `SCALE=1 CRF=16 node scripts/draft.mjs out/FINAL-raw.mp4`, lalu loudnorm seperti di atas dengan `-b:a 256k -ar 48000 -movflags +faststart`.
    - Cover: `SCALE=1 node scripts/stills.mjs out/cover 0 --comp=Cover`.
    - Cek: -14 LUFS, puncak -1,5 dB atau lebih rendah, dan frame terakhir sama dengan frame pertama.
11. **Caption.** Pakai skill instagram-agent-id atau ig-caption: satu ajakan utama, maksimal tiga hashtag, bebas em dash dan "&".

## Penilaian kualitas (untuk menjawab "berapa nilainya")
Nilai 100 terbagi lima aspek, masing-masing 20:
- hook 3 detik
- nilai dan kejelasan isi
- retensi dan tempo
- visual dan audio
- CTA dan distribusi

C2 final dinilai 84. Kekurangannya ada di distribusi: caption dan pemicu komentar. Selalu katakan bahwa ini penilaian kualitas, bukan prediksi views.
