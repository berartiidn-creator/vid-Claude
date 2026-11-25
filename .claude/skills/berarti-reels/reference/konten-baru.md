# Menulis `src/reel.tsx` untuk video baru

Mulai dari `reel.tsx` C2. Pertahankan urutan bagiannya dan ganti isinya. Indeks kata didapat dari output `tools/sync.py`.

## 1. Timing (`T`)
- Ambil semua momen dari kata yang diucapkan, misalnya `at('frasa')` untuk awal frasa dan `endOf('frasa')` untuk akhirnya. Jangan pakai detik manual, supaya revisi VO otomatis ikut.
- `end: Math.ceil((endOf('<kata terakhir>') + 1.5) * 10) / 10`, dan harus sama dengan `src/project.json`. `tools/sync.py` sudah menghitungnya.
- `CV = T.<kata pertama setelah hook> - 0.6`. Cover bertahan selama hook diucapkan, jadi **judul cover harus sama dengan kalimat hook VO**.
- `MORPH = 0.55`. `G = at('<kata ajakan terakhir yang menunjuk penonton>') - 0.08`. `L = T.end - 0.8`.
- `STAMP` (opsional) untuk satu momen getar kamera.
- Adegan dimulai di awal kalimat yang membuka bagian baru (misalnya `s2`, `s3`, dan seterusnya).

## 2. Pose karakter (`POSES`)
- Key pertama **wajib** `{t: 0, pose: 'tunjuk_kamu', expr: 'serius', mouth: 'flat', head: 0}`, supaya sama dengan cover.
- Ganti pose di sekitar `CV + 0.3` (di tengah perubahan ukuran), lalu di setiap beat makna.
- Pakai `beat: true` untuk penekanan, `nod: true` untuk anggukan, dan `wink: true` satu kali di ending (`G + 0.75`).
- Key terakhir **wajib** `{t: L + 0.1, expr: 'serius', mouth: 'flat', head: 0}`, supaya frame terakhir sama dengan cover.
- Ekspresi mengikuti makna kalimat. Contoh: "bingung" pakai terkejut, langkah positif pakai ceria atau ramah, dan larangan pakai serius.

## 3. Judul narasi
- `BLOCKS` berisi blok `{a, b, big?}` dengan indeks kata awal dan akhir.
  - Satu blok berisi satu klausa, idealnya maksimal 40 karakter. Lebih panjang dari itu, pecah jadi dua blok.
  - Kata yang diucapkan selama cover tidak dibuatkan blok, jadi blok pertama mulai setelah hook.
- `big` adalah indeks kata raksasa. Pakai untuk 3 sampai 5 kata punchline per video, misalnya kata terakhir kalimat yang paling emosional (C2: nggak., bingung?, mikir., inget.).
- `KW` berisi indeks kata kunci oranye: kata benda atau kerja inti dan angka yang diucapkan. `UL` adalah subset KW yang digaris bawah, maksimal satu per blok.
- `FLOODS` maksimal dua jendela `[mulai, selesai]`: puncak emosi (satu blok) dan dari punchline terakhir sampai `L`, sehingga CTA tampil di atas latar oranye.
- `TRANS` berisi awal setiap adegan (tidak termasuk 0). Transisi mozaik dan dorongan kamera mengikutinya.

## 4. Adegan (`S1` sampai `Sn`)
- Bungkus setiap adegan dengan `<Section from={...} to={...}>`.
- Kit yang tersedia: `In`, `Card`, `Chip`, `Person` (+`AUD` palet), `Badge`, `Check`, `Row`, `Hi`, dan `prog`, `springAt`, `useSpring`, `useT`.
- Posisi ditulis **sebelum DY**: lebar kartu `CW` (936) dengan `left: M` (72). Area aman ada di top 370 sampai 1060.
- **Kartu tidak boleh mengulang teks judul.** Judul sudah mengucapkan kalimatnya, jadi kartu menampilkan visual pendukung, misalnya:
  - mockup UI (slide, chat, kalender)
  - angka yang diucapkan
  - audiens (`Person`)
  - sebelum dan sesudah (`Row`)
  - checklist
- Isi layar. Jangan biarkan setengah layar kosong lebih dari satu detik. Kalau ada jeda VO (misalnya "Baru setelah itu,"), isi dengan rekap atau chip.
- Chip rata kanan pakai `right: 140`, bukan `right: M`, supaya tidak masuk area ikon Reels.
- Elemen yang harus tampil di atas elemen lain ditulis **lebih akhir** di JSX. Badge yang menumpang di pojok kartu ditaruh setelah kartunya.
- Visual angka harus sesuai yang diucapkan. Kalau VO tidak menyebut angka, jangan tampilkan angka.

## 5. Pop close-up (`POPS`)
- Buat 2 sampai 3 pop, masing-masing `{at, dur: 1.3 sampai 1.9, img: 'cu_...', tilt: plus minus 5 sampai 6}`.
- Taruh di momen reaksi, jangan saat CTA.

## 6. SFX (`CUES`)
- Pertahankan pola C2:
  - cue pembuka cover dan transisi `CV`
  - whoosh di setiap `TRANS`
  - pop untuk elemen masuk
  - thump di awal flood
  - ding untuk centang
  - click untuk ketikan dan tap
  - cue ending di `G` dan `L`
- Gain antara 0,05 dan 0,4. Jangan menumpuk lebih dari 3 SFX dalam 0,2 detik.

## 7. Cover (`COVER`)
- `headline` berisi 3 baris pendek (sekitar 14 huruf per baris) dengan `<Marker>` di frasa kunci.
- `bubble` berisi "kalimat yang salah" yang akan dicoret, maksimal 2 baris.
- `pill` berisi solusi singkat.
- `pillar` diisi COMMUNICATION, CONFIDENCE, atau GROW.
- Render `CoverGuides` untuk mengecek garis sepertiga dan potongan 4:5.

## 8. Ekspor
`Reel`, `Cover`, dan `CoverGuides` sudah didaftarkan di `Root.tsx`. Jangan ganti nama komposisinya.
