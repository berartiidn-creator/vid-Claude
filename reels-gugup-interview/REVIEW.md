# Review: preview v1 (renders/preview-gugup-interview-v1.mp4)

## Keputusan kreatif
- Naskah dan hook dari chat dipakai apa adanya, jadi tiga storyline alternatif tidak dibuat.
- Medium potongan kertas di atas bidang kuning, dengan satu scene twist berwarna merah bata dan CTA di latar tinta.
- Voiceover sementara memakai voice clone "Firas" dari ElevenLabs. Versi final menunggu rekaman asli.
- Musik: loop lofi 95 BPM, CC0 dari Freesound (holizna, #629147). Generate musik ElevenLabs ditolak karena izin API key, dan katalog HeyGen butuh login.
- Aksen diganti dari tomat #FF5A36 ke merah bata #C62A12 karena kontras di latar kuning gagal (2,0:1 jadi 3,65:1).

## Yang diukur, bukan didengar
- check: 0 error. Loudness hasil render -12,0 LUFS, true peak -1,0 dBFS. Sedikit di atas target sosial (-16 sampai -14). Belum ada yang mendengarkan hasilnya.
- Frame QA dilihat di 0,3; 4,9; 7,7; 11,4; 13,4; 15,5; 18,9; 21,6; 25,1; 28,15 detik.

## Peringatan yang sengaja dibiarkan
- line_unread di s8: baris terakhir tampil kurang dari 2 detik. Ini disengaja karena video loop kembali ke hook dengan tata letak yang sama.
- timeline_track_too_dense di captions.html: 32 grup caption dalam satu file, sesuai aturan satu host caption.
- Caption "Oke Firas," ditulis langsung di file caption. Variabel nama di s6 tidak ikut mengubah caption.

## Shot terlemah
- s4 dan s5 di awal scene: angka "1." dan "2." sempat sendirian sekitar 0,3 detik sebelum judul muncul.
- Paruh bawah frame (y 1250 ke bawah) sengaja kosong karena tertutup UI Instagram.
- Dengan waktu lebih: animasi tangan atau wajah kandidat di s2, dan level audio diturunkan sekitar 2,5 dB.
