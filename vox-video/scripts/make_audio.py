"""Synthesizes the sound effects and a lo-fi music bed for the collage video (no downloads, free to use).

Output: ../sfx/*.wav and ../music/lofi_bed.wav (44.1 kHz, 16-bit).
Run: python make_audio.py [music_seconds]
"""
import os
import sys
import wave

import numpy as np

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.dirname(HERE)
rng = np.random.default_rng(11)


def write(path, x, stereo=False):
    x = np.clip(x, -1, 1)
    data = (x * 32767).astype(np.int16)
    if stereo and data.ndim == 1:
        data = np.stack([data, data], axis=1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2 if data.ndim == 2 else 1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())


def t(sec):
    return np.arange(int(sec * SR)) / SR


def env(n, attack, release, curve=3.0):
    a = int(attack * SR)
    e = np.ones(n)
    if a:
        e[:a] = np.linspace(0, 1, a)
    e[a:] = np.exp(-curve * np.linspace(0, 1, n - a) * (1 / max(release, 1e-3)) * (n - a) / SR)
    return e


def lowpass(x, cutoff):
    """Windowed-sinc FIR lowpass."""
    fc = cutoff / SR
    n = 101
    k = np.arange(n) - (n - 1) / 2
    h = np.sinc(2 * fc * k) * np.hamming(n)
    h /= h.sum()
    return np.convolve(x, h, mode="same")


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def bandpass(x, lo, hi):
    return lowpass(highpass(x, lo), hi)


def norm(x, peak=0.8):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def noise(sec):
    return rng.uniform(-1, 1, int(sec * SR))


# ------------------------------------------------------------------ effects
def paper_slide():
    n = noise(0.38)
    x = bandpass(n, 900, 6000) * env(len(n), 0.04, 0.22)
    grit = (rng.random(len(n)) < 0.004) * rng.uniform(-1, 1, len(n))
    return norm(x + lowpass(grit, 5000) * 0.6, 0.55)


def paper_rustle():
    n = noise(0.6)
    am = np.abs(lowpass(rng.uniform(-1, 1, len(n)), 30)) * 8
    return norm(bandpass(n, 1500, 9000) * am * env(len(n), 0.02, 0.4), 0.5)


def pop():
    tt = t(0.12)
    f = 700 * np.exp(-tt * 18) + 180
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(tt), 0.002, 0.08)
    return norm(x, 0.7)


def click():
    tt = t(0.05)
    x = noise(0.05) * np.exp(-tt * 300) * 0.6 + np.sin(2 * np.pi * 2200 * tt) * np.exp(-tt * 120)
    return norm(highpass(x, 400), 0.6)


def marker():
    tt = t(0.45)
    n = bandpass(noise(0.45), 2500, 7000)
    squeak = np.sin(2 * np.pi * (1800 + 300 * np.sin(2 * np.pi * 7 * tt)) * tt) * 0.15
    am = 0.6 + 0.4 * np.sin(2 * np.pi * 34 * tt)
    return norm((n * am + squeak) * env(len(tt), 0.03, 0.35), 0.45)


def marker_short():
    x = marker()
    return x[: int(0.2 * SR)] * np.linspace(1, 0, int(0.2 * SR))


def stamp():
    tt = t(0.45)
    thud = np.sin(2 * np.pi * (55 + 60 * np.exp(-tt * 30)) * tt) * np.exp(-tt * 9)
    slap = lowpass(noise(0.45), 2500) * np.exp(-tt * 40)
    return norm(thud + slap * 0.7, 0.9)


def whoosh():
    sec = 0.55
    n = noise(sec)
    out = np.zeros_like(n)
    seg = 1024
    for i in range(0, len(n), seg):
        p = i / len(n)
        cutoff = 300 + 5000 * np.sin(np.pi * p)
        out[i:i + seg] = lowpass(n[max(0, i - 200):i + seg + 200], cutoff)[200 if i else 0:][:len(n[i:i + seg])]
    return norm(out * np.sin(np.pi * np.linspace(0, 1, len(n))) ** 1.5, 0.5)


def tape_rip():
    n = noise(0.3)
    crackle = (rng.random(len(n)) < 0.03) * rng.uniform(-1, 1, len(n))
    return norm(bandpass(n * 0.4 + crackle, 1200, 10000) * env(len(n), 0.01, 0.25), 0.5)


def typing():
    out = np.zeros(int(0.9 * SR))
    for k in range(9):
        c = click() * rng.uniform(0.5, 1.0)
        start = int((k * 0.095 + rng.uniform(0, 0.02)) * SR)
        out[start:start + len(c)] += c[: len(out) - start]
    return norm(out, 0.55)


# ------------------------------------------------------------------ music bed
def music(seconds):
    bpm = 84
    beat = 60 / bpm
    n = int(seconds * SR)
    out = np.zeros((n, 2))
    chords = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]]   # Cmaj7 Am7 Fmaj7 G7

    def mtof(m):
        return 440 * 2 ** ((m - 69) / 12)

    bar = 4 * beat
    i = 0
    tbar = 0.0
    while tbar < seconds:
        ch = chords[i % 4]
        # soft electric-piano chord, slightly strummed
        for j, m in enumerate(ch):
            st = tbar + j * 0.018
            dur = bar * 0.98
            s0, s1 = int(st * SR), min(n, int((st + dur) * SR))
            if s0 >= n:
                continue
            tt = np.arange(s1 - s0) / SR
            f = mtof(m)
            tone = (np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 3)) \
                * np.exp(-tt * 0.9) * 0.07
            pan = 0.35 + 0.1 * j
            out[s0:s1, 0] += tone * (1 - pan)
            out[s0:s1, 1] += tone * pan
        # bass on beats 1 and 3
        for b in (0, 2):
            st = tbar + b * beat
            s0, s1 = int(st * SR), min(n, int((st + beat * 1.6) * SR))
            if s0 >= n:
                continue
            tt = np.arange(s1 - s0) / SR
            bass = np.sin(2 * np.pi * mtof(ch[0] - 24) * tt) * np.exp(-tt * 2.2) * 0.16
            out[s0:s1] += bass[:, None]
        # kick, snare-ish rim, hats
        for b in range(4):
            st = tbar + b * beat
            s0 = int(st * SR)
            if s0 >= n:
                continue
            if b in (0, 2):
                tt = np.arange(int(0.25 * SR)) / SR
                k = np.sin(2 * np.pi * (50 + 90 * np.exp(-tt * 35)) * tt) * np.exp(-tt * 14) * 0.28
                e = min(n, s0 + len(k))
                out[s0:e] += k[: e - s0, None]
            else:
                tt = np.arange(int(0.12 * SR)) / SR
                r = highpass(rng.uniform(-1, 1, len(tt)), 1500) * np.exp(-tt * 45) * 0.08
                e = min(n, s0 + len(r))
                out[s0:e] += r[: e - s0, None]
            for h in (0, 0.5):
                s0h = int((st + h * beat) * SR)
                tt = np.arange(int(0.05 * SR)) / SR
                hat = highpass(rng.uniform(-1, 1, len(tt)), 7000) * np.exp(-tt * 90) * 0.035
                e = min(n, s0h + len(hat))
                if s0h < n:
                    out[s0h:e] += hat[: e - s0h, None]
        tbar += bar
        i += 1
    # vinyl crackle and warmth
    crackle = (rng.random(n) < 0.0008) * rng.uniform(-0.15, 0.15, n)
    out += lowpass(crackle, 6000)[:, None]
    out[:, 0] = lowpass(out[:, 0], 9000)
    out[:, 1] = lowpass(out[:, 1], 9000)
    fade = int(2.5 * SR)
    out[:int(1.0 * SR)] *= np.linspace(0, 1, int(1.0 * SR))[:, None]
    out[-fade:] *= np.linspace(1, 0, fade)[:, None]
    return out / np.max(np.abs(out)) * 0.7


if __name__ == "__main__":
    sfx_dir = os.path.join(VIDEO, "sfx")
    os.makedirs(sfx_dir, exist_ok=True)
    for name, fn in [("paper_slide", paper_slide), ("paper_rustle", paper_rustle), ("pop", pop), ("click", click),
                     ("marker", marker), ("marker_short", marker_short), ("stamp", stamp), ("whoosh", whoosh),
                     ("tape_rip", tape_rip), ("typing", typing)]:
        write(os.path.join(sfx_dir, name + ".wav"), fn(), stereo=True)
    secs = float(sys.argv[1]) if len(sys.argv) > 1 else 70
    os.makedirs(os.path.join(VIDEO, "music"), exist_ok=True)
    m = music(secs)
    with wave.open(os.path.join(VIDEO, "music", "lofi_bed.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(m, -1, 1) * 32767).astype(np.int16).tobytes())
    print("sfx + music written")
