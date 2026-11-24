GOAL:    Penonton yang gugup interview merasa lega ("ternyata gak sekelihatan itu"), lalu follow untuk bagian dua.
OUTPUT:  HyperFrames, 1080 x 1920, 30 fps. Preview (voiceover sementara: voice clone "Firas" ElevenLabs).
TIME:    28.4 s x 30 = 852 frames. Voice adalah jam: tiap teks mendarat di kata yang mengucapkannya.
         Musik: loop lofi 95 BPM (CC0, holizna, Freesound 629147), di bawah suara, volume 0.12.
LOOK:    Medium: potongan kertas di atas bidang warna.
         ground: kuning bunga matahari #FFC93C datar, serat kertas 6% (multiply, statis).
         ground twist (scene 3): bata #C62A12. ground CTA: tinta #141414 dengan tipografi penuh lebar.
         ink #141414 untuk semua teks dan garis. kertas #FFFDF7, border 5 px tinta,
         bayangan keras 12 px 12 px 0 tinta (tanpa blur), radius 18 px.
         accent: bata #C62A12, satu fokus per frame (kata kunci). Di ground tomat, accent = kuning.
         display: Archivo Black 400, 76 sampai 150 px, tracking -1%. body: Inter 800/900, 40 sampai 56 px.
         Teks rata kiri di kolom x 120 sampai 780 (zona aman Reels: y 288 sampai 1248).
OBJECTS: HRD: kepala lingkaran kertas dengan dua mata tinta, badan kertas, di balik meja kertas
         dengan papan nama tinta "HRD". Termometer: tabung kertas, bulb, raksa tomat yang turun.
         Suara: 14 batang tinta yang bergoyang. Batang perbandingan: dua bar kertas, isi tinta.
         Stempel: kartu kertas miring -4 derajat. Lingkaran napas: lingkaran kertas yang membesar lalu
         mengecil. Cermin: oval kaca perak #D9E2E8 dengan bingkai tinta 10 px, kilau diagonal putih,
         kaki dudukan. Tombol Follow: kotak kertas 18 px radius (bukan pill).
MOTION:  masuk: expo.out 0.35 s; per kata blur 6 px ke 0 dalam 0.13 s; pegas back.out(1.6) hanya
         di posisi atau skala kartu. flood warna: clip-path circle power2.inOut 0.45 s.
         keluar: blur 8 px plus fade 0.15 s. Judul yang sudah mendarat diam.
SHOTS:   s1 0.00-2.35 hook: "Gugupmu" sudah tampil di frame 0, "gak sekelihatan itu." per kata.
         s2 2.35-8.50 meja HRD: bubble "Silakan perkenalkan diri.", termometer turun, suara goyang,
            mata HRD membesar, "Mereka lihat semuanya?". sfx key tick.
         s3 8.50-13.90 twist: flood tomat dari mata HRD, "Kenyataannya:", dua bar (rasa penuh,
            terlihat sepertiga), "jauh lebih sedikit.", stempel "Tahu ini aja udah bantu". sfx whoosh, pop.
         s4 13.90-16.40 langkah 1: flood kuning, lingkaran napas masuk lalu keluar. sfx whoosh.
         s5 16.40-19.00 langkah 2: kartu "aku semangat" mendarat, "aku harus tenang" dicoret. sfx pop.
         s6 19.00-21.80 langkah 3: cermin, "Oke Firas, siap." (variabel nama).
         s7 21.80-25.50 CTA: flood tinta, tombol Follow ditekan, "Bagian 2", "gaji yang diharapkan". sfx pop.
         s8 25.50-28.40 loop: flood kuning, "Dari kursi HRD," lalu tata letak hook yang sama. sfx whoosh.
         captions: seluruh film, 2 sampai 4 kata per grup, Inter 900 46 px putih bergaris tinta, y 1130 sampai 1240.
BANNED:  void gelap dengan elemen kecil di tengah; glow, partikel; gradien ungu atau biru; kartu kaca;
         kertas krem dengan serif; label "01 / 02" monospace; chip pill; semua rata tengah;
         semua elemen fade dan naik; teks yang bergerak saat dibaca; logo di pojok; tiga kartu sejajar.
QA:      t=0.0 (thumbnail: "Gugupmu" terbaca), 3.9 (bubble penuh), 7.6 (mata dan pertanyaan),
         11.3 (bar dan "sedikit"), 13.0 (stempel), 15.4 (lingkaran besar), 18.8 (coretan),
         21.6 (cermin dengan nama), 25.0 (CTA penuh), 28.3 (frame terakhir sama tata letak dengan hook).
