"""Generate ORIGINAL placeholder audio (no samples, no copyrighted material).

Creates public/audio/music_bed.wav (40 s cinematic pad that follows the six
scenes) and public/audio/sfx/*.wav (one file per sound cue in
src/config/sound.ts). Replace any file with licensed audio of the same name to
upgrade the sound design without touching code.

Usage: python3 scripts/generate_audio.py
"""
from pathlib import Path
import wave

import numpy as np

SR = 48000
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio"
rng = np.random.default_rng(1447)


def t_axis(sec):
    return np.arange(int(sec * SR)) / SR


def write(path, stereo, peak_db=-6.0):
    stereo = np.asarray(stereo, dtype=np.float64)
    if stereo.ndim == 1:
        stereo = np.stack([stereo, stereo])
    peak = np.max(np.abs(stereo)) + 1e-9
    stereo = stereo / peak * (10 ** (peak_db / 20))
    data = (np.clip(stereo.T, -1, 1) * 32767).astype("<i2")
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print(f"{path.relative_to(ROOT)}  {stereo.shape[1] / SR:.2f}s")


def fft_filter(x, lo=None, hi=None, slope=1.0):
    n = len(x)
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(n, 1 / SR)
    g = np.ones_like(f)
    if hi:
        g *= 1 / (1 + (f / hi) ** (2 * slope))
    if lo:
        g *= 1 / (1 + (lo / np.maximum(f, 1e-3)) ** (2 * slope))
    return np.fft.irfft(X * g, n)


def svf(x, cutoff, q=0.7, mode="bp"):
    """Time-varying state variable filter; cutoff may be an array."""
    cutoff = np.broadcast_to(np.asarray(cutoff, dtype=float), x.shape)
    low = band = 0.0
    out = np.empty_like(x)
    damp = 1 / q
    for i in range(len(x)):
        fc = 2 * np.sin(np.pi * min(cutoff[i], SR / 6) / SR)
        high = x[i] - low - damp * band
        band += fc * high
        low += fc * band
        out[i] = band if mode == "bp" else low if mode == "lp" else high
    return out


def reverb(x, seconds=2.5, mix=0.35, bright=4000):
    n = int(seconds * SR)
    tt = np.arange(n) / SR
    outs = []
    for ch in range(2):
        ir = rng.standard_normal(n) * np.exp(-tt / (seconds / 6.5))
        ir = fft_filter(ir, hi=bright)
        ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
        ir /= np.sqrt(np.sum(ir**2)) + 1e-9
        L = len(x) + n
        wet = np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(ir, L), L)
        dry = np.concatenate([x, np.zeros(n)])
        outs.append(dry * (1 - mix) + wet * mix * 2.2)
    return np.stack(outs)


def env_adsr(n, a, d, s_level, r):
    e = np.ones(n) * s_level
    ai, di, ri = int(a * SR), int(d * SR), int(r * SR)
    e[:ai] = np.linspace(0, 1, ai)
    e[ai : ai + di] = np.linspace(1, s_level, di)
    e[n - ri :] *= np.linspace(1, 0, ri)
    return e


def soft_voice(freq, tt, harmonics=6, detune=0.25):
    out = np.zeros_like(tt)
    for k in range(1, harmonics + 1):
        for dt in (-detune, 0, detune):
            ph = rng.uniform(0, 2 * np.pi)
            out += np.sin(2 * np.pi * (freq * k + dt * k) * tt + ph) / (k**1.6)
    return out / harmonics


def boom(sec=2.5, f0=110, f1=38, noise=0.25, decay=0.6):
    tt = t_axis(sec)
    freq = f1 + (f0 - f1) * np.exp(-tt / 0.08)
    ph = 2 * np.cumsum(np.pi * freq / SR)
    body = np.sin(ph) * np.exp(-tt / decay)
    n = fft_filter(rng.standard_normal(len(tt)), hi=900) * np.exp(-tt / 0.12) * noise
    click = fft_filter(rng.standard_normal(len(tt)), lo=2000) * np.exp(-tt / 0.006) * 0.15
    return body + n + click


def bells(tt, notes, start_times, decay=1.4, amp=0.3):
    out = np.zeros_like(tt)
    for f, st in zip(notes, start_times):
        m = tt >= st
        tl = tt[m] - st
        tone = sum(np.sin(2 * np.pi * f * r * tl) * a for r, a in ((1, 1), (2.76, 0.35), (5.4, 0.12)))
        out[m] += tone * np.exp(-tl / decay) * amp
    return out


NOTE = lambda n: 440 * 2 ** ((n - 69) / 12)  # midi -> Hz

# --------------------------------------------------------------------------
# Music bed: chord per section, crossfaded
# --------------------------------------------------------------------------
def music_bed():
    dur = 40.0
    tt = t_axis(dur)
    sections = [
        (0, 6, [38, 45, 50, 53, 57, 64], 0.55),  # Dm(add9)
        (6, 10, [38, 45, 50, 53, 57, 64], 0.7),
        (10, 16, [34, 46, 50, 53, 57, 62], 0.85),  # Bbmaj7
        (16, 22, [31, 43, 50, 53, 58, 62], 0.95),  # Gm7
        (22, 28, [38, 45, 50, 57, 62, 65], 1.15),  # Dm
        (28, 34, [34, 46, 53, 57, 62, 65], 1.15),  # Bbmaj7
        (34, 40, [41, 48, 53, 57, 60, 64], 1.0),  # F(add9) - uplifting resolve
    ]
    pad = np.zeros_like(tt)
    for (a, b, notes, level) in sections:
        w = np.clip((tt - a + 0.8) / 1.6, 0, 1) * np.clip((b + 0.8 - tt) / 1.6, 0, 1)
        if a == 0:
            w = np.clip((b + 0.8 - tt) / 1.6, 0, 1) * np.clip(tt / 3.5, 0, 1)
        if b == 40:
            w = np.clip((tt - a + 0.8) / 1.6, 0, 1)
        chord = sum(soft_voice(NOTE(n), tt) * (1.3 if i == 0 else 0.8) for i, n in enumerate(notes))
        pad += chord * w * level
    swell = 0.75 + 0.25 * np.sin(2 * np.pi * tt / 8.0)
    pad = fft_filter(pad * swell, hi=1800, slope=1.2)
    # air
    air = fft_filter(rng.standard_normal(len(tt)), lo=400, hi=5000) * 0.05 * (0.6 + 0.4 * np.clip(tt / 22, 0, 1))
    # heartbeat pulse in scene 4 (anticipation)
    pulse = np.zeros_like(tt)
    for k in np.arange(16.0, 22.0, 60 / 72):
        m = (tt >= k) & (tt < k + 0.5)
        tl = tt[m] - k
        pulse[m] += np.sin(2 * np.pi * 48 * tl) * np.exp(-tl / 0.12) * (0.4 + 0.6 * (k - 16) / 6)
    # sparse bell motif (scenes 3, 6)
    motif = bells(
        tt,
        [NOTE(n) for n in (74, 77, 81, 79, 74, 77, 81, 84, 81, 77, 76, 81)],
        [10.5, 11.25, 12.0, 13.5, 28.6, 29.2, 29.8, 31.0, 34.5, 35.4, 36.6, 38.0],
        decay=1.8,
        amp=0.12,
    )
    mono = pad * 0.5 + air + pulse * 0.35
    st = reverb(mono, 3.0, mix=0.25)[:, : len(tt)]
    st += reverb(motif, 3.2, mix=0.5, bright=6000)[:, : len(tt)]
    fade = np.clip((dur - tt) / 2.5, 0, 1)
    write(OUT / "music_bed.wav", st * fade, peak_db=-9)


def sfx():
    d = OUT / "sfx"
    # 00 deep atmospheric intro
    tt = t_axis(5.0)
    sub = np.sin(2 * np.pi * 41 * tt + 0.5 * np.sin(2 * np.pi * 0.3 * tt))
    nz = fft_filter(rng.standard_normal(len(tt)), lo=60, hi=500)
    e = np.clip(tt / 2.2, 0, 1) ** 1.5 * np.exp(-np.maximum(tt - 2.4, 0) / 1.0)
    write(d / "00_deep_intro.wav", reverb((sub * 0.8 + nz * 0.5) * e, 3.0, 0.4)[:, : len(tt) + SR])

    # 02 digital activation: rising blips
    tt = t_axis(1.6)
    x = np.zeros_like(tt)
    for i in range(9):
        st = i * 0.065
        m = (tt >= st) & (tt < st + 0.09)
        tl = tt[m] - st
        f = 700 * 2 ** (i / 6)
        x[m] += np.sin(2 * np.pi * f * tl + 2 * np.sin(2 * np.pi * f * 2 * tl)) * np.exp(-tl / 0.03)
    x += np.sin(2 * np.pi * 1400 * tt) * np.exp(-np.maximum(tt - 0.6, 0) / 0.25) * (tt > 0.6) * 0.5
    write(d / "02_digital_activation.wav", reverb(x, 1.6, 0.35, 7000))

    # 04 logo impact
    b = boom(3.0, 120, 40, 0.3, 0.7)
    tt = t_axis(3.0)
    shimmer = bells(tt, [NOTE(n) for n in (74, 81, 86)], [0.0, 0.02, 0.04], 1.6, 0.18)
    write(d / "04_logo_impact.wav", reverb(b + shimmer, 3.0, 0.35))

    # 07 soft whoosh (stereo pan)
    tt = t_axis(1.4)
    cut = 300 + 2600 * np.sin(np.pi * np.clip(tt / 1.2, 0, 1)) ** 2
    x = svf(rng.standard_normal(len(tt)), cut, q=1.2) * np.sin(np.pi * np.clip(tt / 1.3, 0, 1)) ** 2
    pan = np.clip(tt / 1.3, 0, 1)
    write(d / "07_soft_whoosh.wav", reverb(x, 1.2, 0.25)[:, : len(tt)] * np.stack([1 - pan * 0.7, 0.3 + pan * 0.7]))

    # 11 holographic scan
    tt = t_axis(2.2)
    cut = 900 + 2200 * (0.5 + 0.5 * np.sin(2 * np.pi * 1.1 * tt))
    x = svf(rng.standard_normal(len(tt)), cut, q=6) * 0.6
    x += np.sin(2 * np.pi * (600 + 500 * tt) * tt) * 0.15 * (0.5 + 0.5 * np.sin(2 * np.pi * 14 * tt))
    x *= np.sin(np.pi * np.clip(tt / 2.1, 0, 1))
    write(d / "11_holo_scan.wav", reverb(x, 1.5, 0.4, 6000))

    # 16 rising ambience (riser)
    tt = t_axis(5.5)
    rise = np.clip(tt / 5.0, 0, 1)
    tone = sum(np.sin(2 * np.pi * NOTE(n) * (1 + 0.5 * rise**2) * tt) for n in (50, 57, 62)) / 3
    nz = svf(rng.standard_normal(len(tt)), 400 + 5000 * rise**2, q=0.9, mode="lp")
    x = (tone * 0.5 + nz * 0.5) * rise**2 * np.clip((5.5 - tt) / 0.4, 0, 1)
    write(d / "16_rising_ambience.wav", reverb(x, 2.0, 0.35))

    # 22 main transition impact
    b = boom(4.0, 140, 34, 0.45, 0.9)
    tt = t_axis(4.0)
    chord = bells(tt, [NOTE(n) for n in (62, 69, 74, 77)], [0.0, 0.01, 0.02, 0.03], 2.2, 0.15)
    write(d / "22_main_impact.wav", reverb(b + chord, 3.6, 0.4))

    # 24 typography impact
    b = boom(2.5, 160, 55, 0.25, 0.45)
    tt = t_axis(2.5)
    metal = bells(tt, [1320, 1980, 2640], [0, 0.005, 0.01], 0.9, 0.12)
    write(d / "24_type_impact.wav", reverb(b + metal, 2.4, 0.4))

    # 27 title stabilise accent
    write(d / "27_title_hit.wav", reverb(boom(2.0, 90, 45, 0.15, 0.5), 2.0, 0.35))

    # 28 final branding impact
    b = boom(5.0, 130, 32, 0.5, 1.1)
    tt = t_axis(5.0)
    chord = bells(tt, [NOTE(n) for n in (58, 65, 70, 74, 77)], [0, 0.01, 0.02, 0.03, 0.05], 2.8, 0.13)
    write(d / "28_final_impact.wav", reverb(b + chord, 4.0, 0.42))

    # 32 golden shimmer
    tt = t_axis(2.6)
    notes = [NOTE(n) for n in (86, 89, 93, 96, 98, 101, 105)]
    starts = [0.0, 0.11, 0.2, 0.32, 0.41, 0.55, 0.7]
    x = bells(tt, notes, starts, 0.9, 0.2)
    x += svf(rng.standard_normal(len(tt)), 7000, q=2) * np.exp(-tt / 0.8) * 0.15
    write(d / "32_golden_shimmer.wav", reverb(x, 2.8, 0.55, 9000))

    # 34 ambient sustain
    tt = t_axis(6.5)
    x = sum(soft_voice(NOTE(n), tt, 4, 0.3) for n in (53, 60, 65, 69, 72)) * env_adsr(len(tt), 1.5, 1.0, 0.85, 3.0)
    write(d / "34_ambient_sustain.wav", reverb(fft_filter(x, hi=2500), 3.0, 0.45)[:, : len(tt)])


if __name__ == "__main__":
    music_bed()
    sfx()
