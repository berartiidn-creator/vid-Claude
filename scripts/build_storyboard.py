"""Build the storyboard for the BRI-style 60 s bumper from rendered frames.

Inputs : out/stills/fNNNN.jpg (render them with scripts/render-stills.mjs)
Outputs: renders/storyboard/
           frames/scene-XX-*.jpg   full-HD frames per scene
           storyboard-cover.png    overview of the 9 scenes
           storyboard-page-N.png   3 scenes per page, with notes
           storyboard-scene-XX.png one image per scene (large peak frame + notes)
           STORYBOARD_MANASIK_UMROH_60S.pdf
Usage  : python3 scripts/build_storyboard.py <ttf-font-dir>
"""
import shutil
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
STILLS = ROOT / "out" / "stills"
OUT = ROOT / "renders" / "storyboard"
FD = Path(sys.argv[1])

BG = (3, 30, 25)
PANEL = (6, 46, 38)
GOLD = (214, 179, 74)
WHITE = (239, 255, 249)
MUTED = (150, 196, 182)
LINE = (20, 92, 76)

F = lambda name, size: ImageFont.truetype(str(FD / f"{name}.ttf"), size)
TITLE = F("cinzel-latin-700-normal", 44)
H2 = F("cinzel-latin-700-normal", 30)
LBL = F("montserrat-latin-700-normal", 17)
TXT = F("montserrat-latin-400-normal", 19)
SMALL = F("montserrat-latin-600-normal", 15)

FPS = 30
SCENES = [
    {
        "no": 1, "title": "Pembukaan: Makkah dalam Kabut", "tc": "00:00.0 - 00:04.9", "frames": [27, 78, 120], "hero": 78,
        "visual": "Kabut emerald terbuka. Kota Makkah wireframe 3D: Abraj Al-Bait, menara Masjidil Haram, hotel. Gedung menyala bertahap dari bawah, blueprint scan, jendela berdenyut.",
        "camera": "Low angle, naik perlahan menembus awan 3D di antara menara. Speed ramp, gerak operator halus.",
        "text": "Logo AL-BAHJAH TOUR & TRAVEL muncul lembut (fade + fokus), tanpa distorsi.",
        "fx": "Selendang emas-emerald melintas (1,4 dtk), debu emas bokeh, vignette + grain.",
        "transition": "Wipe kain selendang + motion blur, tepat pada hit musik 4,85 dtk.",
        "audio": "Atmosfer pembuka, logo impact 4,85 dtk.",
    },
    {
        "no": 2, "title": "MEMPERSEMBAHKAN: Abraj Al-Bait", "tc": "00:04.9 - 00:11.1", "frames": [168, 225, 300], "hero": 225,
        "visual": "Shot malam. Menara jam Abraj Al-Bait dengan 4 muka jam emas, mahkota, kubah kecil dan bulan sabit; menara podium di sekelilingnya; awan malam.",
        "camera": "Crane naik tinggi sambil berputar pelan mengitari menara jam, awan lewat dengan paralaks.",
        "text": "MEMPERSEMBAHKAN (Montserrat 500, spasi lebar) diapit garis emas, tracking merapat perlahan.",
        "fx": "Kontur holografik merambat naik, ornamen jam emas berkilau, debu emas.",
        "transition": "Wipe selendang + motion blur di ketukan (11,12 dtk).",
        "audio": "Whoosh kain sebelum cut.",
    },
    {
        "no": 3, "title": "SARANA MEMPERSIAPKAN HATI: Madinah", "tc": "00:11.1 - 00:18.7", "frames": [360, 435, 525], "hero": 435,
        "visual": "Distrik Madinah: menara-menara Masjid Nabawi, Kubah Hijau, payung raksasa di pelataran, hotel di kedua sisi, kabut rendah.",
        "camera": "Glide maju di antara hotel menuju pelataran Nabawi, kabut 3D lewat di depan kamera.",
        "text": "SARANA MEMPERSIAPKAN (kicker) + HATI (Cinzel Decorative, gradasi emas), glow bernapas tiap 2 bar.",
        "fx": "Selendang melintas (13,6 dtk), kilau emas pada HATI mengikuti ketukan, rack focus latar.",
        "transition": "Wipe selendang + motion blur ke kota suci (18,69 dtk).",
        "audio": "Ambience naik menuju drop.",
    },
    {
        "no": 4, "title": "Kota Suci Terbangun", "tc": "00:18.7 - 00:20.9", "frames": [567, 588, 618], "hero": 588,
        "visual": "Layar gelap; garis kota Makkah dan Madinah digambar dari kiri dan kanan seperti blueprint, lalu seluruh kota menyala menjadi hologram penuh.",
        "camera": "Wide shot dengan truck lateral pelan; paralaks langit, kota, lantai.",
        "text": "Tanpa teks (napas visual sebelum drop).",
        "fx": "Line-draw putih, wake cahaya dari bawah ke atas, kabut horizon.",
        "transition": "Bloom cahaya emas tepat pada drop musik 20,85 dtk.",
        "audio": "Scan holografik, drop pertama.",
    },
    {
        "no": 5, "title": "BERTAMU KEPADA ALLAH", "tc": "00:20.9 - 00:26.8", "frames": [648, 705, 774], "hero": 705,
        "visual": "Close-up Ka'bah dengan kiswah dan pintu emas, menara jam di belakang, arcade Masjidil Haram, lantai grid bercahaya.",
        "camera": "Zoom pelan + truck lateral ke kiri, sedikit putaran perspektif; paralaks berlapis.",
        "text": "BERTAMU KEPADA (kicker) + ALLAH (Cinzel Decorative emas) di kanan, bergeser pelan berlawanan arah kamera.",
        "fx": "God rays memancar dari Ka'bah, scan holografik pada permukaan, debu emas.",
        "transition": "Wipe selendang + motion blur (26,80 dtk).",
        "audio": "Teks muncul di ketukan.",
    },
    {
        "no": 6, "title": "BERTAMU KEPADA RASULULLAH", "tc": "00:26.8 - 00:32.7", "frames": [828, 885, 948], "hero": 885,
        "visual": "Close-up Kubah Hijau Masjid Nabawi dengan mesh holografik, menara putih, arcade, kota Madinah.",
        "camera": "Zoom pelan + truck lateral ke kanan, sedikit putaran perspektif.",
        "text": "BERTAMU KEPADA + RASULULLAH dengan salawat (Amiri), di kiri.",
        "fx": "God rays dari Kubah Hijau (emerald-putih), glow kubah berdenyut, selendang melintas.",
        "transition": "Wipe selendang + motion blur (32,74 dtk).",
        "audio": "Whoosh kain.",
    },
    {
        "no": 7, "title": "Judul Utama: MANASIK UMROH", "tc": "00:32.7 - 00:41.3", "frames": [1020, 1107, 1192], "hero": 1192,
        "visual": "Wide horizon kota suci: Ka'bah kiri, Kubah Hijau kanan, cahaya emas di horizon. Judul MANASIK UMROH (versi HD) di langit.",
        "camera": "Wide dengan truck lateral pelan, lalu kamera mundur perlahan ke komposisi penuh pada drop 41,26 dtk.",
        "text": "Judul terbuka dari garis cahaya emas (35,45 dtk); bentuk, ukuran dan posisi tetap. Pantulan kaca samar di bawahnya.",
        "fx": "Kilau metalik + lens flare anamorfik + kerlip bintang (36,5 dtk dan puncak di hit 39,75 dtk), debu lensa.",
        "transition": "Tanpa cut: mengalir langsung ke komposisi akhir, golden sweep pada drop kedua.",
        "audio": "Impact tipografi 35,45 dtk, aksen 39,75 dtk, drop kedua 41,26 dtk.",
    },
    {
        "no": 8, "title": "Komposisi Akhir Terbentuk", "tc": "00:41.3 - 00:47.3", "frames": [1254, 1278, 1344], "hero": 1344,
        "visual": "Key visual penuh: kota Makkah dan Madinah, selendang cahaya di sudut, Mega Mendung samar di langit.",
        "camera": "Ease out ke full frame, lalu truck lateral sangat lambat dengan paralaks.",
        "text": "Logo (41,93 dtk) > plakat tagline 'Umrah Bersama Al-Bahjah, Bernilai Sedekah & Da'wah' (43,01 dtk) > swoosh emas (43,55 dtk), semuanya di ketukan.",
        "fx": "Kilau metalik halus pada logo, pita selendang bergelombang, partikel emas.",
        "transition": "Build bertahap tanpa cut.",
        "audio": "Final branding impact.",
    },
    {
        "no": 9, "title": "Hold Akhir dan Napas Penutup", "tc": "00:47.3 - 01:00.0", "frames": [1437, 1614, 1785], "hero": 1500,
        "visual": "Komposisi branding final tetap hidup: scan blueprint pelan, kontur menyala, jendela berdenyut, kabut horizon, partikel.",
        "camera": "Hold dengan truck lateral sangat lambat dan gerak operator halus; tipografi diam dan tajam.",
        "text": "Logo, MANASIK UMROH dan tagline diam, terbaca jelas dari jauh.",
        "fx": "Golden sweep + kilau judul (47,34 dtk), kerlip ornamen pada hit 53,76 dtk, cahaya horizon membesar lalu frame meredup.",
        "transition": "Fade napas penutup pada bar terakhir.",
        "audio": "Golden shimmer, closing shimmer, musik fade di akhir.",
    },
]


def thumb(frame, w):
    im = Image.open(STILLS / f"f{frame:04d}.jpg").convert("RGB")
    return im.resize((w, round(w * 9 / 16)), Image.LANCZOS)


def ts(frame):
    s = frame / FPS
    return f"{int(s // 60):02d}:{s % 60:04.1f}"


def wrap(draw, xy, text, font, max_w, fill, spacing=6):
    """Word-wrap by measured pixel width."""
    x, y = xy
    for para in text.split("\n"):
        line = ""
        for word in para.split():
            trial = f"{line} {word}".strip()
            if draw.textlength(trial, font=font) <= max_w:
                line = trial
            else:
                draw.text((x, y), line, font=font, fill=fill)
                y += font.size + spacing
                line = word
        if line:
            draw.text((x, y), line, font=font, fill=fill)
            y += font.size + spacing
    return y


def header(d, W, sub):
    d.text((60, 36), "AL-BAHJAH MANASIK UMROH", font=TITLE, fill=GOLD)
    d.text((62, 96), f"Storyboard bumper event 60 detik  |  1920x1080, 30 fps  |  {sub}", font=SMALL, fill=MUTED)
    d.line((60, 130, W - 60, 130), fill=LINE, width=2)


def cover():
    W, H = 2400, 1720
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    header(d, W, "Ikhtisar 9 scene")
    tw = 720
    for i, sc in enumerate(SCENES):
        cx = 60 + (i % 3) * (tw + 60)
        cy = 165 + (i // 3) * 515
        img.paste(thumb(sc["hero"], tw), (cx, cy + 40))
        d.rectangle((cx, cy + 40, cx + tw, cy + 40 + round(tw * 9 / 16)), outline=LINE, width=2)
        d.text((cx, cy), f"SCENE {sc['no']:02d}", font=LBL, fill=GOLD)
        d.text((cx + 110, cy - 1), sc["tc"], font=SMALL, fill=MUTED)
        d.text((cx, cy + 52 + round(tw * 9 / 16)), sc["title"], font=LBL, fill=WHITE)
    img.save(OUT / "storyboard-cover.png", optimize=True)
    return img


def page(n, scenes):
    W, H = 2400, 2280
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    header(d, W, f"Halaman {n}")
    y = 160
    tw = 740
    for sc in scenes:
        d.rounded_rectangle((50, y, W - 50, y + 676), radius=14, fill=PANEL, outline=LINE, width=2)
        d.text((80, y + 22), f"SCENE {sc['no']:02d}", font=LBL, fill=GOLD)
        d.text((80, y + 46), sc["title"], font=H2, fill=WHITE)
        d.text((W - 80 - d.textlength(sc["tc"], font=H2), y + 46), sc["tc"], font=H2, fill=GOLD)
        ty = y + 100
        for k, fr in enumerate(sc["frames"]):
            x = 80 + k * (tw + 20)
            img.paste(thumb(fr, tw), (x, ty))
            d.rectangle((x, ty, x + tw, ty + round(tw * 9 / 16)), outline=LINE, width=2)
            lab = ["AWAL", "PUNCAK", "AKHIR"][k] + "  " + ts(fr)
            d.rectangle((x, ty, x + 16 + d.textlength(lab, font=SMALL), ty + 30), fill=(1, 20, 16))
            d.text((x + 8, ty + 6), lab, font=SMALL, fill=GOLD)
        ny = ty + round(tw * 9 / 16) + 22
        cols = [("VISUAL", sc["visual"]), ("KAMERA", sc["camera"]), ("TEKS", sc["text"]), ("EFEK", sc["fx"]), ("TRANSISI", sc["transition"]), ("AUDIO", sc["audio"])]
        colw = (W - 160) // 3
        row_y = ny
        for r in range(2):
            bottom = row_y
            for c in range(3):
                k, v = cols[r * 3 + c]
                cx = 80 + c * colw
                d.text((cx, row_y), k, font=LBL, fill=GOLD)
                bottom = max(bottom, wrap(d, (cx + 112, row_y - 1), v, SMALL, colw - 140, WHITE, spacing=5))
            row_y = bottom + 14
        y += 700
    img.save(OUT / f"storyboard-page-{n}.png", optimize=True)
    return img


def scene_page(sc):
    """One storyboard image per scene: large peak frame, start/end frames, full notes."""
    W, H = 2400, 1400
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    d.text((60, 34), "AL-BAHJAH MANASIK UMROH", font=SMALL, fill=MUTED)
    d.text((60, 62), f"SCENE {sc['no']:02d} / {len(SCENES):02d}", font=LBL, fill=GOLD)
    d.text((60, 90), sc["title"], font=TITLE, fill=WHITE)
    d.text((W - 60 - d.textlength(sc["tc"], font=TITLE), 90), sc["tc"], font=TITLE, fill=GOLD)
    d.line((60, 160, W - 60, 160), fill=LINE, width=2)
    top = 190
    hw = 1520
    hh = round(hw * 9 / 16)
    sw = W - 120 - hw - 30
    sh = round(sw * 9 / 16)
    shots = [(sc["frames"][1], 60, top, hw, "PUNCAK"), (sc["frames"][0], 60 + hw + 30, top, sw, "AWAL"), (sc["frames"][2], 60 + hw + 30, top + hh - sh, sw, "AKHIR")]
    for fr, x, y, w, name in shots:
        im = thumb(fr, w)
        img.paste(im, (x, y))
        d.rectangle((x, y, x + w, y + im.height), outline=LINE, width=2)
        lab = f"{name}  {ts(fr)}"
        d.rectangle((x, y, x + 20 + d.textlength(lab, font=LBL), y + 36), fill=(1, 20, 16))
        d.text((x + 10, y + 8), lab, font=LBL, fill=GOLD)
    # notes
    ny = top + hh + 36
    cols = [("VISUAL", sc["visual"]), ("KAMERA", sc["camera"]), ("TEKS", sc["text"]), ("EFEK", sc["fx"]), ("TRANSISI", sc["transition"]), ("AUDIO", sc["audio"])]
    colw = (W - 120) // 3
    row_y = ny
    for r in range(2):
        bottom = row_y
        for c in range(3):
            k, v = cols[r * 3 + c]
            cx = 60 + c * colw
            d.text((cx, row_y), k, font=LBL, fill=GOLD)
            bottom = max(bottom, wrap(d, (cx, row_y + 28), v, TXT, colw - 50, WHITE, spacing=6))
        row_y = bottom + 22
    out = OUT / f"storyboard-scene-{sc['no']:02d}.png"
    img = img.crop((0, 0, W, min(H, row_y + 30)))
    img.save(out, optimize=True)
    return img


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "frames").mkdir(exist_ok=True)
    for sc in SCENES:
        for k, fr in enumerate(sc["frames"]):
            shutil.copy(STILLS / f"f{fr:04d}.jpg", OUT / "frames" / f"scene-{sc['no']:02d}-{['a-awal', 'b-puncak', 'c-akhir'][k]}-{ts(fr).replace(':', 'm').replace('.', 's')}.jpg")
    pages = [cover()] + [page(i + 1, SCENES[i * 3 : i * 3 + 3]) for i in range(3)]
    singles = [scene_page(sc) for sc in SCENES]
    pdf = [p.convert("RGB") for p in [pages[0]] + singles]
    pdf[0].save(OUT / "STORYBOARD_MANASIK_UMROH_60S.pdf", save_all=True, append_images=pdf[1:], resolution=150)
    print("ok", len(pages), "pages")


if __name__ == "__main__":
    main()
