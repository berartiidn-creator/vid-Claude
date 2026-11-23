# Audit Landing Page dan File Starter Kit

Dicek 23 November 2026. Sumber: file `berarti_landing_page (3).tsx` di Google Drive dan file `Berartify Starter Kit FIX.xlsx` di Google Drive.

## Status singkat

| Bagian | Status |
| --- | --- |
| Landing page | Masih file kode React (.tsx), belum punya alamat web. Belum bisa dipasang di bio. |
| Tes BERARTI Index di landing page | Jalan: 60 pertanyaan, 6 dimensi, skor 0 sampai 100, 11 archetype. Logika archetype sama dengan file Starter Kit. |
| Tombol bayar | **Belum terhubung ke pembayaran apa pun.** |
| Testimoni di landing page | **Perlu dicek: asli atau contoh?** |
| File Starter Kit di Drive | **Siapa pun yang punya link bisa mengedit file master.** |

## 3 masalah kritis

### 1. Tombol "Bayar Rp99.000" belum menagih uang
Saat tombol diklik, halaman langsung menampilkan "Pemesanan Berhasil! Link akses Starter Kit telah otomatis dikirimkan ke email dan nomor WhatsApp Anda." Tidak ada pembayaran, tidak ada email, tidak ada WhatsApp yang terkirim. Data nama, email, dan nomor WhatsApp yang diketik juga tidak disimpan ke mana pun.

Akibatnya: calon pembeli mengira sudah bayar dan menunggu link yang tidak pernah datang. Ini merusak kepercayaan di titik paling mahal.

Perbaikan: ganti tombol itu dengan link ke halaman pembayaran yang nyata (misalnya payment link dari penyedia pembayaran atau platform produk digital yang kamu pilih), yang otomatis mengirim produk setelah lunas.

### 2. Testimoni Sarah M., Bima A., Dina R.
Kalau ketiganya pembeli asli yang sudah setuju namanya dipakai, aman. Kalau ini contoh dari template, **hapus sebelum halaman tayang**. Testimoni yang tidak nyata menyesatkan pembeli, dan rencana konten ini juga sengaja tidak memakai testimoni sampai ada yang asli. Ganti dengan bagian "Jadi yang pertama" atau kosongkan dulu.

### 3. File Starter Kit bisa diedit siapa saja yang punya link
Pengaturan berbagi file sekarang: "Siapa saja yang memiliki link: Editor". Kalau link `/edit` ini sampai ke pembeli atau tersebar:
- Satu orang bisa mengubah atau menghapus isi file untuk semua orang.
- Jawaban satu pembeli terlihat oleh pembeli lain.
- Orang bisa membagikannya gratis, jadi tidak ada yang perlu membeli.

File master sekarang juga masih berisi jawaban isian (misalnya "desain grafis", "Jago ngajar public speaking") di Reflection Journal dan Life Design Canvas.

Perbaikan:
1. Ubah akses link ke "Dibatasi", atau minimal "Viewer".
2. Kosongkan semua sel kuning (input) di file master, kembalikan Hasil Index ke contoh yang jelas ditandai CONTOH.
3. Konversi file ke format Google Sheets asli (File, Simpan sebagai Google Spreadsheet), lalu bagikan ke pembeli dalam bentuk link salinan: ganti akhir link dari `/edit...` jadi `/copy`. Tiap pembeli otomatis dapat salinan miliknya sendiri.
4. Link salinan itu hanya dikirim **setelah pembayaran**, lewat email otomatis dari sistem pembayaran. Jangan dikirim lewat DM kata kunci MULAI. DM MULAI berisi link halaman pembayaran. Langkah ini berlaku selama produk masih spreadsheet; setelah Arah90 jadi, yang dikirim adalah link aplikasi plus kode akses.

## Ketidaksesuaian dengan Brand Blueprint dan konten

| Di landing page | Seharusnya (Blueprint) | Kenapa penting |
| --- | --- | --- |
| "BERARTI™ Index", "BERARTI™ by Firas Byzi" | Sudah benar. Brand sekarang BERARTI, nama Berartify tidak dipakai lagi. | Pastikan bio, Reels, DM, dan halaman bayar memakai nama yang sama. |
| "Life Direction Starter Kit" | BERARTI Arah90 | Nama produk harus sama di Reels, DM, dan halaman bayar. |
| Isi kit 5 item versi file | 7 modul aplikasi Arah90 (Baca, Gali, Saring, Kanvas, Peta 90, Bio, Cek-in) | Reels C9 dan C10 menunjukkan aplikasinya. Kalau landing page masih menjual file, orang dari Reels merasa salah halaman. |
| FAQ: akses lewat "member area" untuk unduh "PDF, Template" | File Google Sheets (plus ebook PDF) | Ekspektasi pembeli harus cocok dengan yang diterima. |
| "Tes psikologi gratis ... dalam 5 menit" | Assessment refleksi diri, 60 pertanyaan | 60 pertanyaan dalam 5 menit berarti 5 detik per soal. Tulis "sekitar 10 menit". Kata "tes psikologi" sebaiknya diganti "tes refleksi diri" kecuali instrumennya sudah divalidasi psikolog. |
| Video "Tonton Video 4 Menit Ini" hanya kotak dengan ikon play | Video asli atau hapus | Tombol play yang tidak bisa diputar terlihat rusak. |
| Footer: Privacy Policy, Terms, Contact, Instagram, WhatsApp semua `href="#"` | Link asli | Halaman yang meminta data pribadi dan uang perlu kebijakan privasi dan kontak yang bisa diklik. |
| Hasil tes hilang saat halaman di-refresh, tidak ada pengiriman hasil | Hasil bisa disimpan | Starter Kit butuh 6 skor itu diketik ulang di sheet Hasil Index. Tambah tombol "Simpan hasil" (screenshot atau kirim ke email atau WhatsApp). Ini juga cara mengumpulkan kontak calon pembeli. |
| Garansi uang kembali 100% dalam 7 hari | Pastikan kamu memang siap menjalankannya | Kalau ditulis, wajib ditepati dan perlu kontak yang jelas untuk klaim. |

Yang sudah bagus dan selaras: hero memakai core statement Blueprint, ada tagline "Dari Bingung Menjadi Berarti", tombol hasil tes langsung mengarah ke Starter Kit (jembatan Index ke Kit sudah ada), dan harga Rp99.000 konsisten.

## Urutan kerja yang disarankan

1. Kunci file Starter Kit (akses Dibatasi, kosongkan sel input, buat link `/copy`).
2. Siapkan halaman pembayaran yang mengirim link `/copy` otomatis setelah lunas.
3. Perbaiki landing page: nama produk jadi BERARTI Arah90, tombol bayar ke halaman pembayaran, testimoni, daftar 7 modul, FAQ, durasi tes, footer.
4. Online-kan landing page supaya punya alamat web, lalu pasang di bio.
5. Baru jalankan jadwal konten. C1 sampai C8 aman tayang begitu link tes hidup. C9 dan C10 tunggu langkah 2 selesai.
