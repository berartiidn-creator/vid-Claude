# Spesifikasi gaya Kinetic Cream (terkunci)

Semua nilai di bawah ini sudah ada di `template/src/kit.tsx` dan `template/src/cover.tsx`. Dokumen ini menjelaskan alasannya, supaya revisi tetap konsisten.

## Kanvas dan zona
- 1080x1920, 30 fps. Durasi = akhir kata terakhir + 1,5 detik.
- **Judul narasi:** top 226, margin kiri kanan 50, rata tengah, biasanya selesai sebelum y 560.
- **Konten adegan:** semua elemen di dalam `<Section>` otomatis turun `DY = 230`. Di kode, tulis posisi sebelum DY. Konten terlihat di y 600 sampai 1290.
- **Karakter kecil:** wajah di (575, 1480), skala 0.71. Kepala mulai sekitar y 1320.
- **Zona aman Reels:**
  - Jangan taruh teks atau chip di x > 950 pada y 1050 sampai 1700, karena tertutup ikon like, komen, dan share.
  - y > 1600 di kiri tertutup caption Instagram. Hanya badan karakter yang boleh di sana.
  - y < 200 tertutup bar atas.
- **Tidak ada handle di tengah atas** (user minta dihapus). Handle dan pilar hanya ada di cover.

## Palet
| Peran | Nilai |
|---|---|
| Latar | gradasi `#FCF8F2`, `#F6EFE5`, `#F0E6D9` |
| Teks | ink `#16191A`, soft `#5E625D` |
| Oranye brand | `#FF6A00` (deep `#D95500`, tint `#FFE7D4`) |
| Hijau brand | `#0F5B46` (tint `#DCEFE7`) |
| Merah coret | `#E5484D` |
| Flood | radial `#FF8F45`, `#FF6A00`, `#E05A00` |

Detail latar:
- **Semburat lembut** dengan blur 90 yang bergerak sangat pelan: oranye 22% di kanan atas, hijau 10% di kiri, peach 20% di bawah.
- **Grid** 60 px, garis 5% ink, memudar ke tepi.
- **Kotak piksel:** 46 sel 60 px oranye atau hijau dengan alpha 3 sampai 11% yang berdenyut.
- Vignette tipis dan grain multiply 14%.

## Tipografi
- **Judul narasi:** Montserrat 800, line-height 1.08, letter-spacing -1.5.
  - Ukuran menurut panjang blok: sampai 16 karakter 112 px, sampai 28 karakter 100 px, sampai 40 karakter 88 px, lebih dari itu 80 px.
  - Baris pengantar pada blok kata raksasa: 84 px.
- **Kata raksasa:** Archivo Black, ukuran min(220, 960 / (jumlah huruf x 0.72)).
  - Gradasi `#FF9A4D`, `#FF6A00`, `#D95500` dengan bayangan oranye lembut.
  - Saat flood, gradasinya putih ke peach.
  - Saat kata raksasa muncul, baris pengantar meredup ke 38% dan mengecil 12%.
- **UI kartu:** Montserrat 500 sampai 800. Label file atau kode pakai Mograph Mono.
- **Cover:** judul Archivo Black 86 px, 3 baris. Kata kunci diberi Marker oranye.

## Gerak
- **Kata muncul** sesuai suara: mulai 0,06 detik sebelum kata diucapkan, durasi 0,3 detik, naik 0,35 em, blur 8 px ke 0.
  - Kata kunci berwarna oranye. Saat flood, kata kunci jadi ink dan teks biasa jadi putih.
  - Garis bawah setebal 0,075 em tergambar 0,1 detik setelah kata diucapkan, durasi 0,35 detik.
- **Ganti blok judul:** blok lama keluar dalam 0,14 detik (naik 36 px dan blur).
- **Kartu masuk** dengan spring `In`: up (miring 3D), left atau right (skew), pop, atau drop. Kilau sapuan memakai putih 55%.
- **Adegan keluar** dalam 0,2 detik dengan blur dan naik.
- **Kamera** mendorong 1,8% selama 6 detik per adegan. Getar kamera hanya di satu momen stamp.
- **Transisi mozaik** di setiap awal adegan:
  - Sel 90 px, 40% grid.
  - Tiap sel tampil 0,1 detik dalam jendela -0,2 sampai +0,14 detik.
  - Warna cream, oranye, dan hijau.
- **Flood oranye** masuk 0,22 detik dan keluar 0,3 detik. Maksimal dua kali per video: puncak emosi dan CTA.

## Karakter
- Rig `Char.tsx` dengan 12 pose: tunjuk_atas, lambai, semangat, bertanya, tunjuk_kamu, tawarkan, menyapa, sambutan, tulus, tepuk, tanda_x, hitung_tiga.
- Ekspresi: netral, ramah, serius, ceria, terkejut.
- Ganti pose memakai potongan keras, pop, smear 2 frame, dan kedip paksa. Jangan pernah crossfade, karena memunculkan lengan hantu.
- Lip-sync dari viseme per huruf ditambah `env.open`. Kedip lembut. Kemiringan kepala maksimal 1,8 derajat.
- Di belakang karakter ada sorot putih ke peach, dengan drop-shadow `0 26px 34px rgba(60,35,10,0.20)`.
- **Pop close-up** di momen emosi, 2 sampai 3 per video: cu_bingung, cu_empati, cu_menekankan, cu_merenung, cu_semangat, cu_terkejut, cu_tertawa.

## Cover, pembuka, dan ending
- **Cover adalah frame 0.** Layout rule of thirds di dalam potongan grid 4:5 (y 285 sampai 1635):
  - header: handle di kiri dan chip pilar hijau di kanan, sejajar, dengan garis tipis di bawahnya
  - judul di sepertiga atas
  - balon "kalimat yang salah" dicoret merah di tengah kiri, dengan pill solusi di bawahnya
  - wajah di garis vertikal kanan (x 720) dengan skala 1.16, menunjuk penonton (tunjuk_kamu serius)
  - Tidak ada lingkaran logo.
- **Pembuka:** cover bertahan selama kalimat hook yang sama dengan judul cover, sampai `cv`.
  - Elemen cover lalu pecah dalam 0,36 detik secara berurutan: header, balon, pill, judul.
  - Karakter mengecil ke posisi kecil dalam 0,55 detik dengan easing bezier(0.7, 0, 0.2, 1). Pose berganti di tengah perubahan ukuran.
- **Ending:**
  - Di kata ajakan terakhir (C2: "kamu berikutnya"), karakter membesar ke posisi (720, 1450, 0.95) di bawah kartu CTA, lalu mengedip.
  - Di `l = end - 0.8` kartu pergi, cover tersusun ulang, dan karakter kembali ke posisi cover dengan ekspresi serius.
  - Frame terakhir sama dengan frame 0, jadi loop mulus.

## Suara
- VO tanpa jeda tambahan.
- **Musik** `bed.mp3` (orisinal), di-duck mengikuti env (0,55 sampai 1,0) x 0,9, dan fade out 1,2 detik terakhir.
- **SFX** dari `public/audio/lemo`:
  - whoosh di awal adegan (0,16)
  - pop atau pop_hi untuk elemen masuk (0,06 sampai 0,1)
  - click untuk mengetik
  - thump di awal flood (0,13 sampai 0,16)
  - ding untuk sukses atau centang
  - click_lo untuk detak
- **Master:** -14 LUFS, true peak -1,5 dB.
