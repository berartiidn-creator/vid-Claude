# AL-BAHJAH MANASIK UMROH: prompt generate video per scene

Bumper 60 detik, 9 scene. Prompt ditulis dalam bahasa Inggris agar akurat di generator video (Runway, Kling, Veo, atau sejenisnya).

Cara pakai:

- Mode image-to-video: unggah frame AWAL (dan AKHIR bila tool mendukung) dari `frames/` sebagai acuan, lalu tempel prompt scene.
- Scene 04 sampai 09: unggah juga key visual "Background Loop" sebagai gambar referensi agar Ka'bah, Kubah Hijau dan kota tetap identik.
- Generate tanpa tulisan. Logo, MANASIK UMROH, teks kartu dan tagline ditambahkan saat editing (sudah tersedia di proyek Remotion) agar tetap tajam dan ejaannya benar.
- Gabungkan prompt scene dengan baris Style di bawah, dan isi kolom negative prompt dengan baris Negative.

**Style (tambahkan di akhir setiap prompt):**

> Style: futuristic Islamic digital architecture, emerald green palette (deep forest green #032E28, emerald #075B43, neon emerald #10B99A, cyan highlights #35DCC8, restrained gold #D6B34A), transparent holographic wireframe buildings, volumetric light, premium cinematic broadcast event opener, anamorphic lens, subtle film grain, smooth slow motion, 16:9, 1920x1080, 30 fps.

**Negative prompt (semua scene):**

> text, letters, numbers, captions, logo, watermark, people, crowds, distorted or warped architecture, morphing geometry, melting buildings, flicker, strobing, jittery camera, fast whip pans, oversaturated neon, cartoon look, plastic CGI look, low resolution, blurry details, incorrect Kaaba shape, extra domes on the Kaaba

## Scene 01: Pembukaan: Makkah dalam Kabut (00:00.0 - 00:04.9, 4.9 dtk)

- Start frame: `frames/` AWAL 00:00.9  |  End frame: AKHIR 00:04.0
- Kamera: Slow crane up with a slight push-in, gentle handheld drift, eased start and end.
- Teks yang ditambahkan saat editing: Logo AL-BAHJAH TOUR & TRAVEL muncul lembut (fade + fokus), tanpa distorsi.

```text
Cinematic low-angle shot slowly rising through soft emerald mist and drifting volumetric clouds between tall transparent wireframe skyscrapers of a futuristic holy city of Makkah. In the distance the Abraj Al-Bait clock tower and the minarets of Masjidil Haram are built from glowing emerald and cyan holographic lines. The buildings light up progressively from the ground upward, slow blueprint scan lines sweep across the facades, a few windows pulse softly. A translucent flowing ribbon of emerald and gold light with tiny gold particles drifts across the frame. Keep clean empty space in the upper center for a logo. Style: futuristic Islamic digital architecture, emerald green palette (deep forest green #032E28, emerald #075B43, neon emerald #10B99A, cyan highlights #35DCC8, restrained gold #D6B34A), transparent holographic wireframe buildings, volumetric light, premium cinematic broadcast event opener, anamorphic lens, subtle film grain, smooth slow motion, 16:9, 1920x1080, 30 fps.
```

## Scene 02: MEMPERSEMBAHKAN: Abraj Al-Bait (00:04.9 - 00:11.1, 6.2 dtk)

- Start frame: `frames/` AWAL 00:05.6  |  End frame: AKHIR 00:10.0
- Kamera: Crane rising high while slowly orbiting the clock tower, clouds passing the lens with parallax, smooth and steady.
- Teks yang ditambahkan saat editing: MEMPERSEMBAHKAN (Montserrat 500, spasi lebar) diapit garis emas, tracking merapat perlahan.

```text
Night shot of the Abraj Al-Bait clock tower in a futuristic holographic Makkah: four glowing gold clock faces, crown, small dome and crescent finial, surrounded by six podium hotel towers, all drawn as transparent emerald and cyan wireframe with fine curtain-wall grids. Dark emerald night sky, soft clouds passing in front with parallax. Holographic light travels slowly up the building contours, gold clock details shimmer, a few windows pulse. Keep clean negative space in the center for a single line of text. Style: futuristic Islamic digital architecture, emerald green palette (deep forest green #032E28, emerald #075B43, neon emerald #10B99A, cyan highlights #35DCC8, restrained gold #D6B34A), transparent holographic wireframe buildings, volumetric light, premium cinematic broadcast event opener, anamorphic lens, subtle film grain, smooth slow motion, 16:9, 1920x1080, 30 fps.
```

## Scene 03: SARANA MEMPERSIAPKAN HATI: Madinah (00:11.1 - 00:18.7, 7.6 dtk)

- Start frame: `frames/` AWAL 00:12.0  |  End frame: AKHIR 00:17.5
- Kamera: Slow forward dolly at low height with a gentle lateral drift, mist layers passing the camera.
- Teks yang ditambahkan saat editing: SARANA MEMPERSIAPKAN (kicker) + HATI (Cinzel Decorative, gradasi emas), glow bernapas tiap 2 bar.

```text
Low glide through a futuristic holographic Madinah between transparent wireframe hotel towers toward Masjid Nabawi: tall white minarets, the Green Dome as a glowing emerald holographic mesh, giant plaza umbrellas outlined in light, low layers of mist drifting over the plaza. Emerald and cyan glowing edges, restrained gold accents, a translucent flowing silk ribbon of light with gold particles passing gently. Keep empty space in the upper center for text. Style: futuristic Islamic digital architecture, emerald green palette (deep forest green #032E28, emerald #075B43, neon emerald #10B99A, cyan highlights #35DCC8, restrained gold #D6B34A), transparent holographic wireframe buildings, volumetric light, premium cinematic broadcast event opener, anamorphic lens, subtle film grain, smooth slow motion, 16:9, 1920x1080, 30 fps.
```

## Scene 04: Kota Suci Terbangun (00:18.7 - 00:20.9, 2.2 dtk)

- Start frame: `frames/` AWAL 00:18.9  |  End frame: AKHIR 00:20.6
- Kamera: Locked wide shot with a very slow lateral truck, subtle depth parallax.
- Teks yang ditambahkan saat editing: Tanpa teks (napas visual sebelum drop).

```text
Dark emerald screen. White blueprint outlines of the Makkah and Madinah skyline draw themselves in from the left and right edges: the Kaaba and the clock tower on the left, the Green Dome and minarets on the right, a perspective grid floor converging to a golden horizon. Then the whole holographic city lights up in emerald and gold from the ground upward. Wide symmetrical composition. Style: futuristic Islamic digital architecture, emerald green palette (deep forest green #032E28, emerald #075B43, neon emerald #10B99A, cyan highlights #35DCC8, restrained gold #D6B34A), transparent holographic wireframe buildings, volumetric light, premium cinematic broadcast event opener, anamorphic lens, subtle film grain, smooth slow motion, 16:9, 1920x1080, 30 fps.
```

## Scene 05: BERTAMU KEPADA ALLAH (00:20.9 - 00:26.8, 5.9 dtk)

- Start frame: `frames/` AWAL 00:21.6  |  End frame: AKHIR 00:25.8
- Kamera: Slow push-in combined with a lateral truck to the left, slight perspective rotation, layered parallax.
- Teks yang ditambahkan saat editing: BERTAMU KEPADA (kicker) + ALLAH (Cinzel Decorative emas) di kanan, bergeser pelan berlawanan arah kamera.

```text
Close-up of a holographic Kaaba with black kiswah, gold calligraphy band and golden door, the clock tower glowing behind, arcades of Masjidil Haram, a reflective glowing grid floor and a warm golden sun on the horizon. Soft golden god rays radiate upward from the Kaaba, holographic scan light moves slowly over its surface, fine gold dust floats in the air. Keep the right half of the frame calm and empty for text. Style: futuristic Islamic digital architecture, emerald green palette (deep forest green #032E28, emerald #075B43, neon emerald #10B99A, cyan highlights #35DCC8, restrained gold #D6B34A), transparent holographic wireframe buildings, volumetric light, premium cinematic broadcast event opener, anamorphic lens, subtle film grain, smooth slow motion, 16:9, 1920x1080, 30 fps.
```

## Scene 06: BERTAMU KEPADA RASULULLAH (00:26.8 - 00:32.7, 5.9 dtk)

- Start frame: `frames/` AWAL 00:27.6  |  End frame: AKHIR 00:31.6
- Kamera: Slow push-in combined with a lateral truck to the right, slight perspective rotation, layered parallax.
- Teks yang ditambahkan saat editing: BERTAMU KEPADA + RASULULLAH dengan salawat (Amiri), di kiri.

```text
Close-up of the Green Dome of Masjid Nabawi as a glowing emerald holographic mesh dome, white minarets and long arcades of the futuristic Madinah, glowing grid floor and golden horizon light. Soft emerald and white god rays radiate upward from the dome, the dome glow pulses gently, a translucent ribbon of light passes in the background. Keep the left half of the frame calm and empty for text. Style: futuristic Islamic digital architecture, emerald green palette (deep forest green #032E28, emerald #075B43, neon emerald #10B99A, cyan highlights #35DCC8, restrained gold #D6B34A), transparent holographic wireframe buildings, volumetric light, premium cinematic broadcast event opener, anamorphic lens, subtle film grain, smooth slow motion, 16:9, 1920x1080, 30 fps.
```

## Scene 07: Judul Utama: MANASIK UMROH (00:32.7 - 00:41.3, 8.5 dtk)

- Start frame: `frames/` AWAL 00:34.0  |  End frame: AKHIR 00:39.7
- Kamera: Slow lateral truck, then a gentle pull-back that settles into the full composition, steady and elegant.
- Teks yang ditambahkan saat editing: Judul terbuka dari garis cahaya emas (35,45 dtk); bentuk, ukuran dan posisi tetap. Pantulan kaca samar di bawahnya.

```text
Wide symmetrical view of the holographic holy city at the golden horizon: the Kaaba and the clock tower on the left, the Green Dome and minarets on the right, long glowing arcades leading to a warm golden sun, a reflective emerald grid floor with light pulses. A horizontal anamorphic lens flare glides across the upper center. Faint Mega Mendung cloud motifs in the upper corners. Keep the sky in the upper center empty for a large title. Style: futuristic Islamic digital architecture, emerald green palette (deep forest green #032E28, emerald #075B43, neon emerald #10B99A, cyan highlights #35DCC8, restrained gold #D6B34A), transparent holographic wireframe buildings, volumetric light, premium cinematic broadcast event opener, anamorphic lens, subtle film grain, smooth slow motion, 16:9, 1920x1080, 30 fps.
```

## Scene 08: Komposisi Akhir Terbentuk (00:41.3 - 00:47.3, 6.0 dtk)

- Start frame: `frames/` AWAL 00:41.8  |  End frame: AKHIR 00:44.8
- Kamera: Ease-out pull-back to the full frame, then a very slow lateral drift with parallax.
- Teks yang ditambahkan saat editing: Logo (41,93 dtk) > plakat tagline 'Umrah Bersama Al-Bahjah, Bernilai Sedekah & Da'wah' (43,01 dtk) > swoosh emas (43,55 dtk), semuanya di ketukan.

```text
The same wide composition of the holographic Makkah and Madinah city fully revealed: Kaaba left, Green Dome right, golden horizon, flowing emerald and gold light ribbons in the top right and bottom left corners with gold particles following them, faint Mega Mendung clouds in the upper corners. Keep the top center and center empty for a logo, a title and a tagline plaque. Style: futuristic Islamic digital architecture, emerald green palette (deep forest green #032E28, emerald #075B43, neon emerald #10B99A, cyan highlights #35DCC8, restrained gold #D6B34A), transparent holographic wireframe buildings, volumetric light, premium cinematic broadcast event opener, anamorphic lens, subtle film grain, smooth slow motion, 16:9, 1920x1080, 30 fps.
```

## Scene 09: Hold Akhir dan Napas Penutup (00:47.3 - 01:00.0, 12.7 dtk)

- Start frame: `frames/` AWAL 00:47.9  |  End frame: AKHIR 00:59.5
- Kamera: Almost locked-off camera with a very slow lateral drift and subtle micro movement. If the tool is limited to 10 seconds, generate two clips and blend.
- Teks yang ditambahkan saat editing: Logo, MANASIK UMROH dan tagline diam, terbaca jelas dari jauh.

```text
Living hold of the final composition of the holographic holy city: slow blueprint scans across the buildings, contour lights travelling upward, windows pulsing softly, horizon haze drifting, gold particles floating, the light ribbons swaying like transparent fabric in a gentle wind, one soft golden light sweep across the scene, then the horizon glow swells slowly and the frame gently dims at the end. Keep the top center and center empty for branding. Style: futuristic Islamic digital architecture, emerald green palette (deep forest green #032E28, emerald #075B43, neon emerald #10B99A, cyan highlights #35DCC8, restrained gold #D6B34A), transparent holographic wireframe buildings, volumetric light, premium cinematic broadcast event opener, anamorphic lens, subtle film grain, smooth slow motion, 16:9, 1920x1080, 30 fps.
```
