# QC sebelum kirim preview dan sebelum render final

## Cara
1. Render still setiap 0,5 detik dari 0 sampai akhir dengan `SCALE=0.4`, maksimal 12 per lembar:
   `SCALE=0.4 node scripts/stills.mjs out/qa/sN <12 detik>`
2. Baca setiap `sheet.jpg` dengan teliti. Catat semua temuan, perbaiki semuanya, lalu render ulang detik-detik yang terdampak untuk verifikasi.
3. Setelah render, cek:
   - loudness -14 LUFS dan puncak -1,5 dB atau lebih rendah (`ffmpeg -af ebur128=peak=true`)
   - frame pertama sama dengan frame terakhir
   - durasi sesuai `project.json`

## Checklist per frame
- Tidak ada elemen yang **tertutup** elemen lain. Perhatikan urutan JSX, karena yang ditulis belakangan tampil di atas.
- Tidak ada elemen yang **menutupi teks** penting, misalnya badge di pojok kartu yang menutup label.
- Tidak ada teks atau chip di area ikon Reels (x > 950, y 1050 sampai 1700), dan tidak ada teks di bawah y 1600 di kiri.
- Wajah karakter tidak tertutup apa pun. Kursor atau tangan tidak lewat di atas kepala.
- Kepala karakter tidak menabrak kartu atau chip, terutama saat membesar di ending.
- Judul tidak keluar margin (50 px) dan maksimal 3 baris.
- Kartu tidak mengulang teks judul.
- Tidak ada setengah layar kosong lebih dari satu detik.
- Kata kunci oranye tetap terbaca saat flood (otomatis jadi ink).
- Visual angka sesuai yang diucapkan VO.
- Cover: elemennya ada di dalam potongan 4:5, header (handle kiri, pilar kanan) sejajar, dan tidak ada lingkaran logo.

## Temuan C2 yang sudah diperbaiki di mesin atau contoh konten (jangan diulang)
1. Stopwatch tertutup kartu audiens karena ditulis sebelum kartu di JSX. Solusinya: tulis setelah kartu.
2. Stopwatch menutupi label "2 dengerin · 4 skip". Solusinya: stopwatch menghilang tepat sebelum label muncul.
3. Timer "00:07" terbaca sebagai klaim "7 detik" yang tidak diucapkan. Solusinya: stopwatch tanpa angka.
4. Kartu kutipan mengulang kalimat yang sama dengan judul narasi. Solusinya: diganti kartu tanggal 25 dan 10 yang besar dan rata tengah.
5. Kartu tanggal kecil dan menempel di kiri, sehingga setengah layar kosong. Solusinya: ditumpuk, diperbesar 1,42x, dan rata tengah.
6. Chip "ganti 1 kalimat" dan "biarin mereka mikir" masuk area ikon Reels. Solusinya: `right: 140`.
7. Kursor tap Simpan mulai dari atas kepala karakter. Solusinya: mulai dari samping (860, 975).
8. Mulut dan dagu karakter tertutup caption IG. Solusinya: wajah dinaikkan ke y 1480.
9. Handle di tengah atas dihapus atas permintaan user.
10. Layar kosong di jeda "Baru setelah itu,". Solusinya: rekap chip ✓ Masalah, ✓ Jeda, Nama.
