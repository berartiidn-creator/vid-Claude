# Panduan tim: Serial Edukasi Komunikasi

## Setup sekali per orang
1. Minta pemilik repo mengundang akun GitHub-mu ke `berartiidn-creator/vid-claude` (GitHub, Settings, Collaborators).
2. Login claude.ai dengan akunmu sendiri, hubungkan GitHub di claude.ai/connect-github.
3. Buka claude.ai/code, pilih repo `vid-claude`, mulai sesi. Skill `berarti-reels` aktif otomatis.

## Perintah harian

| Ketik | Hasil |
|---|---|
| `Status serial` | Ringkasan progres 30 episode dan EP berikutnya |
| `Konten berikutnya` | Paket produksi untuk EP berikutnya yang belum diambil orang |
| `Konten 07` | Paket produksi untuk EP tertentu |
| `Video Konten 07` | Video preview, setelah VO disetujui |
| `Render final` | Video final, setelah preview disetujui |
| `Konten 07 tayang 3 Desember` | Catat bahwa episode sudah diposting |

Sebutkan namamu sekali di awal sesi supaya tercatat sebagai PIC.

## Aturan
- Sumber episode: `18-peta-serial-speaking-index.md`. Progres dicatat di tabel Status produksi di file itu.
- Jangan ambil EP yang PIC-nya sudah terisi orang lain.
- Setiap selesai satu tahap, perubahan disimpan lewat pull request ke `main` supaya tim lain melihat status terbaru. Yang menyetujui merge: pemilik repo.
- VO memakai suara Firas atas izinnya. Jangan pernah memakai sample suara orang lain.
- API key (ElevenLabs dan lainnya) dimasukkan lewat form aman di sesi, jangan ditempel di chat.
- Gaya visual, CTA KOMUNIKASI, dan penutup "Ilmunya lewat DM!" tidak diubah per episode.

## Halaman peta
Halaman peta visual dibangun dari file 18: `python3 berarti-ig/tools/peta-serial/build.py`, lalu publish `berarti-ig/tools/peta-serial/index.html` sebagai Artifact.
