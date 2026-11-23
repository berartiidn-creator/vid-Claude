# BERARTI x @firasbyzi: Strategi Instagram

Semua isi folder ini adalah draf untuk dicek Firas sebelum dipakai. Tidak ada yang diposting otomatis.

| File | Isi |
| --- | --- |
| `01-audit-profil.md` | Skor profil 100, temuan data Windsor, opsi nama dan bio yang sudah dihitung karakternya |
| `02-funnel-tofu-mofu-bofu.md` | Alur dari Reels ke BERARTI Index (gratis) ke Arah90 (Rp99 ribu), checklist sebelum jalan |
| `03-benchmark-5-kreator.md` | 5 kreator benchmark, 10 pola konten, batas data, cara ubah jadi data asli |
| `benchmark-template.tsv` | Template 5 akun x 12 Reels untuk `swipe.py` |
| `04-rencana-dan-jadwal.md` | Minggu persiapan, jadwal 2 minggu (30 Nov sampai 13 Des 2026), engagement harian |
| `05-naskah-reels-PAS.md` | 10 naskah Problem-Agitate-Solution, hook dinilai, teks layar, caption, hasil cek |
| `06-story-dm-engagement.md` | DM kata kunci ARAH dan MULAI, follow up, template story, urutan balas komentar |
| `08-micro-tools-dan-arah90.md` | 30 masalah untuk micro-tools AI, 6 tool gratis yang dibangun duluan, Arah90 versi aplikasi (Arah90) |
| `07-audit-landing-dan-starter-kit.md` | Temuan di landing page dan file Arah90 yang harus beres sebelum konten BOFU tayang |
| `context/` | `brand-berarti.md`, `voice.md` sementara, template voice asli |
| `work/` | Sumber naskah, caption, dan hook mentah untuk dijalankan ulang di skrip |

## Skill yang terpasang

- 13 skill dari github.com/Jakeschincariol/instagram-agent-skill (MIT) di `.claude/skills/ig-*`, dengan patch kosakata Indonesia di `hookscore.py`, `detect.py`, `slop.json`, dan `caption.py`.
- `.claude/skills/instagram-agent-id/SKILL.md`: versi skill instagram-agent-id yang sudah disinkronkan dengan Brand Blueprint dan Arah90 BERARTI.

Menjalankan ulang cek:

```bash
python3 -I .claude/skills/ig-reel/hookscore.py --hook "hook kamu"
python3 -I .claude/skills/ig-reel/beats.py berarti-ig/work/scripts/C1.txt --wpm 150 --target 30
python3 -I .claude/skills/ig-caption/caption.py berarti-ig/work/captions/C1.txt
python3 -I .claude/skills/ig-human/humanize.py draf.txt -o bersih.txt
python3 -I .claude/skills/ig-human/detect.py bersih.txt
```
