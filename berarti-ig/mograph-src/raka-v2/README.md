# Sumber motion grafis "Raka diam 10 menit di rapat" (v2)

Versi 2 memakai tokoh Arti dan rekan-rekan yang dipotong langsung dari video referensi milik Firas sendiri (BERARTI Communication, Rumus 3J, dan video potensi atau arah), lalu diberi lapisan ekspresi vektor yang mengikuti voice-over.

- `public-arti/`: potongan PNG transparan (Arti duduk di rapat, close-up depan, close-up latar hijau, berdiri presentasi, duduk di meja, dua rekan berhijab, rekan berambut keriting) dan plate penonton.
- `berarti/Arti.tsx`: menampilkan potongan dan menggambar ulang alis, mata, dan mulut per ekspresi (gugup, kaget, senang, cemas, sedih, mulut beresleting, bingung, mantap, hangat, bicara).
- `berarti/artiData.json`: posisi mata, alis, mulut, dan warna kulit tiap potongan.
- `berarti/Props.tsx`: label pil gelap, sticky note, ikon, jalur menyatu.
- `tools/`: skrip pemotong (OpenCV) untuk membuat potongan baru dari frame video referensi.
- Font: Archivo Black (judul) dan Poppins SemiBold (teks), sama dengan video referensi.

Audio (voice-over kloning) tidak disimpan di repo.
