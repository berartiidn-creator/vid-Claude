# Prompt Gemini: Aset Karakter Firas untuk Animasi

Tujuan: membuat bentuk mulut, ekspresi, dan gestur dari gambar Firas yang sudah ada, supaya karakter bisa cuap-cuap mengikuti VO, ganti ekspresi, dan ganti gestur. Semua gambar dibuat dengan **mengedit gambar dasar**, bukan generate dari nol. Karena sisa gambar identik, bagian yang berubah bisa dipotong otomatis dan posisinya pas.

## Gambar dasar

`file_000000004360821186e51116baffd764.png` di folder ASET (Firas menunjuk ke atas, blazer hijau, latar krem).

## Cara kerja di Gemini

1. Buka Gemini, pilih model gambar (Nano Banana). Satu gambar per chat baru, supaya hasil sebelumnya tidak ikut terbawa.
2. Unggah **gambar dasar yang asli** setiap kali. Jangan mengedit dari hasil edit sebelumnya, karena perubahan kecil akan menumpuk.
3. Tempel **KUNCI** di bawah, lalu satu prompt perubahan.
4. Cek hasilnya dengan membandingkan bolak-balik dengan gambar asli. Kalau ada yang ikut berubah (rambut, baju, warna, ukuran, posisi), ulangi. Wajar butuh 1 sampai 3 kali percobaan.
5. Unduh ukuran penuh, beri nama sesuai kolom **Nama file**, lalu unggah ke folder ASET, di subfolder baru bernama `RIG`.

## KUNCI (tempel di setiap prompt)

```
Edit gambar ini. Ubah HANYA bagian yang saya sebut di bawah. Semua bagian lain harus identik dengan gambar asli: wajah, bentuk kepala, rambut, mata, alis, hidung, telinga, mulut, tangan, blazer hijau, kemeja putih, kancing, posisi tubuh, ukuran, sudut pandang, pencahayaan, warna, ketebalan garis tepi hitam, dan latar krem polos. Jangan menggeser, memperbesar, memotong, atau memutar gambar. Ukuran dan rasio gambar sama persis dengan aslinya. Gaya ilustrasi kartun semi-realis yang sama persis. Jangan menambah teks, bayangan baru, atau objek lain.
```

---

## A. Bentuk mulut untuk lip-sync (prioritas 1)

Sebelum setiap prompt mulut, tambahkan kalimat ini sesudah KUNCI:
`Yang boleh berubah HANYA area mulut dan bibir. Mata, alis, dan pipi tetap sama.`

| # | Nama file | Prompt perubahan |
| --- | --- | --- |
| A1 | `mulut_MBP.png` | Ubah mulutnya menjadi terkatup rapat, kedua bibir saling menekan, seperti sedang mengucapkan huruf "M". Tidak ada gigi yang terlihat. |
| A2 | `mulut_A.png` | Ubah mulutnya menjadi terbuka lebar seperti mengucapkan huruf "A". Rahang turun sedikit, deretan gigi atas terlihat, lidah terlihat samar di bawah. |
| A3 | `mulut_E.png` | Ubah mulutnya menjadi melebar ke samping seperti mengucapkan huruf "E" atau "I". Sedikit terbuka, gigi atas dan bawah terlihat rapat. |
| A4 | `mulut_O.png` | Ubah mulutnya menjadi bulat seperti mengucapkan huruf "O". Bibir membentuk lingkaran sedang, bagian dalam mulut gelap terlihat. |
| A5 | `mulut_U.png` | Ubah mulutnya menjadi bulat kecil dan bibir sedikit maju seperti mengucapkan huruf "U" atau "W". |
| A6 | `mulut_FV.png` | Ubah mulutnya seperti mengucapkan huruf "F": gigi atas menyentuh bibir bawah. |
| A7 | `mulut_LTD.png` | Ubah mulutnya menjadi sedikit terbuka dan rileks, gigi atas terlihat sedikit, seperti mengucapkan huruf "L" atau "T". |
| A8 | `mulut_tawa.png` | Ubah mulutnya menjadi tertawa lebar dan gembira, gigi atas dan bawah terlihat, sudut bibir naik tinggi. |

## B. Gestur tangan (prioritas 2)

Lengan yang dimaksud adalah **lengan yang terangkat di sisi kiri gambar**. Tambahkan kalimat ini sesudah KUNCI:
`Yang boleh berubah HANYA lengan dan tangan di sisi kiri gambar, dari bahu sampai jari. Lengan blazer tetap hijau dengan dua kancing di manset dan ujung kemeja putih terlihat di pergelangan. Kepala, wajah, dan tangan kanan di saku tetap sama.`

| # | Nama file | Prompt perubahan |
| --- | --- | --- |
| B1 | `tangan_turun.png` | Turunkan lengan itu sehingga tergantung santai lurus di samping badan, telapak menghadap ke paha. Bagian blazer yang tadinya tertutup lengan sekarang terlihat dan digambar utuh. |
| B2 | `tangan_telapak.png` | Ubah menjadi gestur menjelaskan: siku ditekuk di depan perut, telapak tangan terbuka menghadap ke atas, jari rapat. |
| B3 | `tangan_jempol.png` | Ubah menjadi jempol ke atas setinggi dada, empat jari lain menggenggam. |
| B4 | `tangan_dua.png` | Ubah menjadi menghitung angka dua: telunjuk dan jari tengah terangkat, tangan setinggi bahu, punggung tangan menghadap ke kamera. |
| B5 | `tangan_tiga.png` | Ubah menjadi menghitung angka tiga: telunjuk, jari tengah, dan jari manis terangkat, tangan setinggi bahu. |
| B6 | `tangan_dagu.png` | Ubah menjadi pose berpikir: tangan menyentuh dagu, jempol di bawah dagu, telunjuk di pipi. Ekspresi wajah tetap sama. |
| B7 | `tangan_lambai.png` | Ubah menjadi melambai ramah: telapak terbuka menghadap ke kamera setinggi kepala, jari sedikit terbuka. |
| B8 | `tangan_stop.png` | Ubah menjadi gestur "berhenti": lengan lurus ke depan, telapak terbuka menghadap ke kamera setinggi dada. |

## C. Ekspresi mata dan alis (prioritas 3)

Tambahkan kalimat ini sesudah KUNCI:
`Yang boleh berubah HANYA mata dan alis. Mulut tetap senyum tipis seperti aslinya.`

| # | Nama file | Prompt perubahan |
| --- | --- | --- |
| C1 | `mata_kaget.png` | Ubah menjadi kaget: mata terbuka lebar, iris terlihat utuh dengan putih mata di sekelilingnya, kedua alis naik tinggi. |
| C2 | `mata_serius.png` | Ubah menjadi serius dan tegas: alis turun dan sedikit mengerut di tengah, mata sedikit menyipit. |
| C3 | `mata_senang.png` | Ubah menjadi senang: mata menyipit melengkung ke atas karena tersenyum, alis rileks. |
| C4 | `mata_bingung.png` | Ubah menjadi bingung: satu alis (sisi kanan gambar) naik, alis satunya turun sedikit. |
| C5 | `mata_sedih.png` | Ubah menjadi sedih atau prihatin: ujung dalam kedua alis naik, mata sedikit turun. |

## D. Pose badan penuh (opsional, prioritas 4)

Pose ini mengubah lebih banyak bagian, jadi kalimat batasnya berbeda. Tambahkan sesudah KUNCI:
`Yang boleh berubah HANYA kedua lengan dan tangan. Kepala, wajah, rambut, dan badan tetap identik dan di posisi yang sama.`

| # | Nama file | Prompt perubahan |
| --- | --- | --- |
| D1 | `pose_pipi.png` | Ubah menjadi kaget lucu: kedua telapak tangan menempel di kedua pipi, siku turun di depan dada. Mulut terbuka bulat kecil. |
| D2 | `pose_silang.png` | Ubah menjadi kedua tangan menyilang di depan dada dengan percaya diri. |
| D3 | `pose_dua_tangan.png` | Ubah menjadi menjelaskan dengan kedua tangan: kedua telapak terbuka di depan perut menghadap ke atas, seperti menawarkan sesuatu. |

---

## Urutan yang disarankan

1. Set awal yang langsung terasa bedanya: **A1 sampai A8** dan **B1, B2, B3, B5**. Totalnya 12 gambar. Dengan set ini, mulut sudah cuap-cuap sesuai kata, dan tangan bisa berganti antara menunjuk, menjelaskan, jempol, dan menghitung.
2. Lalu C1 sampai C5.
3. Terakhir D1 sampai D3, kalau ingin pose kaget seperti video referensi.

## Cek sebelum unggah

- [ ] Ukuran gambar sama dengan aslinya (1115 x 1411 piksel), atau minimal rasionya sama. Kalau berbeda sedikit, saya sejajarkan otomatis.
- [ ] Posisi kepala dan badan tidak bergeser. Bandingkan bolak-balik dengan aslinya.
- [ ] Warna kulit, blazer, dan latar tidak berubah.
- [ ] Ketebalan garis tepi hitam tetap sama.
- [ ] Jumlah jari benar (lima, kecuali yang menekuk).
- [ ] Nama file sesuai tabel.

Kalau satu gambar selalu gagal setelah 3 kali percobaan, lewati saja dan beri tahu nomornya. Bagian itu tetap saya animasikan dengan cara sekarang.
