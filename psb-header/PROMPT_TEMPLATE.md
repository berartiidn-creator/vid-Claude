# Template Prompt: Edit Video PSB Al-Bahjah Buyut

Salin blok di bawah, isi bagian [DALAM KURUNG], hapus poin yang tidak dipakai.

```
Saya ingin Anda mengedit video dari Google Drive berikut:
[LINK FOLDER GDRIVE]

STRUKTUR FOLDER
- RAW       : video yang akan diedit (kerjakan SEMUA file di folder ini, cek ulang isinya)
- REFERENSI : video contoh format header PSB
- ASET      : logo asli (LOGO AB BUYUT.png)

ATURAN UMUM
- Jangan render final dulu. Selalu kirim PREVIEW dulu dan tunggu persetujuan saya.
- Ubah HANYA bagian yang saya minta. Subtitle, kartu, audio, transisi, dan isi lain tetap.
- Hasil harus terlihat premium dan bersih, tanpa bekas, noda, atau bayangan logo lama.
- Beri rekomendasi terbaik Anda dengan alasan; jangan sekadar mengiyakan ide saya.

1. HEADER (wajib, semua video)
- Hapus logo lama di tengah atas sampai bersih (termasuk bayangan/outline-nya).
- Ganti dengan header PSB persis seperti video REFERENSI:
  kiri  : logo putih + "Lembaga Pengembangan Da'wah" + "Al-Bahjah Buyut" (Buyut hijau)
  kanan : "PSB [TAHUN AJARAN]" kuning + "SMPIQu dan SMAIQu" putih
  font Plus Jakarta Sans, gradasi gelap tipis di bagian atas.
- Sembunyikan header (fade) di kartu putih atau end card yang sudah punya logo sendiri.
- Jika video sudah memakai header PSB yang benar, jangan diubah.

2. PERUBAHAN KONTEN TAMBAHAN (opsional)
- Hapus teks: [contoh: label "PERTANYAAN 1/2/3" di kartu putih]
- Ganti teks: [contoh: "SMP-IQu dan SMA-IQu" menjadi "SMPIQu dan SMAIQu"]
  (font, ukuran, posisi, dan animasi harus identik dengan teks aslinya)

3. COVER / THUMBNAIL HOOK (satu per video, satu seri yang seragam)
Hook   : [isi sendiri, atau "buatkan hook dari isi video"]
Label  : [contoh: TESTIMONI SANTRI / PSB 2027/2028 DIBUKA / CERITA SANTRI]
Subjudul: [contoh: Dengar langsung cerita santri Al-Bahjah Buyut]
Kartu foto: [2 adegan, contoh: Tahfidz Qur'an (santri baca Qur'an), Lab Komputer]

Gaya desain (ikuti persis):
- Ukuran 1080x1920. Foto santri memakai latar ASLI, posisi tengah.
- Pilih frame dengan ekspresi terbaik: senyum, mata terbuka, menghadap kamera,
  tanpa caption di wajah.
- Gradasi hijau brand hanya dari bawah wajah ke area hook, vignette tipis di sisi.
- Hook di bawah, rata kiri, font Bebas Neue, 3 baris, baris terakhir kuning (#F5C518).
- Label kuning di atas hook, garis aksen hijau dan subjudul di bawahnya.
- 2 kartu foto di kanan hook, setinggi blok hook, sedikit miring (+5 dan -4 derajat),
  saling tindih hanya di ujung, bingkai putih rounded, label pill di dalam foto.
- Foto kartu harus sesuai labelnya dan tidak boleh sama antar cover dalam satu seri.
- Header PSB tetap di atas.
- SAFE ZONE Reels/TikTok: semua teks dan kartu di area x 72-936, y 250-1500
  (atas 250, bawah 420, kanan 144 px tertutup UI). Area bawah dibiarkan gradasi gelap.

4. SEMATKAN COVER DI AWAL VIDEO
- Cover tampil [0.4] detik, lalu transisi zoom + fade 0.2 detik ke video.
- Audio digeser agar caption tetap sinkron.

5. OUTPUT
- Preview: video 1080p + PNG cover + gambar perbandingan sebelum/sesudah.
- Final (setelah saya setujui): MP4 1080x1920, fps sama dengan sumber, kualitas penuh,
  plus file PNG cover terpisah untuk diunggah sebagai thumbnail.
```

## Catatan teknis (untuk Claude)

Script pendukung ada di folder `psb-header/` repo ini:

| File | Fungsi |
|---|---|
| `make_header.py` | membuat overlay header PSB dari logo ASET |
| `logo_model.py`, `regress.py`, `simple_fill.py` | menghapus logo lama (un-blend bayangan, isian mulus atau clone tekstur) |
| `process.py`, `process_talking.py` | pipeline per video: hapus logo, pasang header, hapus/ganti teks, sematkan cover |
| `school_text.py` | mengganti teks end card dengan animasi yang sama |
| `cover_v5.py` | desain cover seri (gaya terakhir yang disetujui) |
| `embed_cover.py` | menyematkan cover ke video yang header-nya sudah benar |

Akses Google Drive butuh environment yang mengizinkan `drive.google.com`,
`drive.usercontent.google.com`, dan `docs.google.com` (environment "vid-Claude").
