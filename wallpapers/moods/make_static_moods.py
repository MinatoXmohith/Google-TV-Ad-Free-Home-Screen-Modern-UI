"""Five original mood wallpapers (1920x1080) for the launcher's Wallpapers screen. Run with Pillow + numpy."""
import math, os, random
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 1920, 1080
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
nx, ny = xx / W, yy / H

def vgrad(top, bot, curve=1.0):
    t = ny ** curve
    return np.stack([top[i] + (bot[i] - top[i]) * t for i in range(3)], -1)

def blob(img, cx, cy, rx, ry, color, strength):
    d = ((nx - cx) / rx) ** 2 + ((ny - cy) / ry) ** 2
    a = np.exp(-d * 2.2)[..., None] * strength
    return img * (1 - a) + np.array(color, np.float32) * a

def wave_band(img, y0, amp, freq, phase, thick, color, strength):
    yc = y0 + amp * np.sin(nx * freq * 2 * math.pi + phase)
    a = np.clip(1 - np.abs(ny - yc) / thick, 0, 1) ** 2
    a = a[..., None] * strength
    return img * (1 - a) + np.array(color, np.float32) * a

def hills(img, base, amp, freq, phase, color, soft=0.004):
    yc = base + amp * np.sin(nx * freq * 2 * math.pi + phase) + amp * 0.4 * np.sin(nx * freq * 5.1 * math.pi + phase * 2)
    a = np.clip((ny - yc) / soft, 0, 1)[..., None]
    return img * (1 - a) + np.array(color, np.float32) * a

def finish(img, name, vignette=0.35, grain=4):
    v = ((nx - 0.5) ** 2 + (ny - 0.5) ** 2)
    img = img * (1 - np.clip(v * vignette * 2.2, 0, 0.6))[..., None]
    img = img + np.random.default_rng(1).normal(0, grain, img.shape[:2])[..., None]
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    im.save(os.path.join(HERE, name + ".jpg"), quality=86, optimize=True, progressive=True)
    print(name, os.path.getsize(os.path.join(HERE, name + ".jpg")) // 1024, "KB")

# 1. Calm: still ocean at blue hour
img = vgrad((14, 40, 72), (6, 18, 34), 0.9)
img = blob(img, 0.62, 0.38, 0.5, 0.18, (120, 200, 230), 0.35)
for i in range(7):
    img = wave_band(img, 0.58 + i * 0.06, 0.008 + i * 0.002, 1.2 + i * 0.3, i * 1.7, 0.012 + i * 0.003, (90, 170, 210), 0.10 + i * 0.015)
finish(img, "calm")

# 2. Cozy: amber dusk over layered hills
img = vgrad((58, 28, 30), (196, 104, 52), 1.3)
img = blob(img, 0.7, 0.62, 0.22, 0.2, (255, 196, 120), 0.75)
img = hills(img, 0.66, 0.035, 0.8, 0.4, (120, 54, 42))
img = hills(img, 0.74, 0.03, 1.1, 2.0, (78, 34, 32))
img = hills(img, 0.83, 0.025, 1.5, 4.1, (44, 20, 22))
finish(img, "cozy")

# 3. Focus: graphite with a single soft beam
img = vgrad((22, 24, 30), (10, 11, 15), 1.0)
beam = np.exp(-(((nx - 0.25) - (ny * 0.45)) / 0.16) ** 2) * np.exp(-((ny - 0.2) / 0.9) ** 2)
img = img + beam[..., None] * np.array([46, 54, 70], np.float32) * 0.9
img = blob(img, 0.82, 0.25, 0.2, 0.2, (70, 90, 120), 0.25)
finish(img, "focus", vignette=0.5)

# 4. Dreamy: pastel clouds, lilac and pink
img = vgrad((78, 60, 120), (170, 110, 160), 1.0)
rng = random.Random(4)
for _ in range(14):
    img = blob(img, rng.uniform(0, 1), rng.uniform(0.2, 1), rng.uniform(0.12, 0.3), rng.uniform(0.06, 0.14),
               rng.choice([(255, 200, 230), (210, 190, 255), (255, 225, 210)]), rng.uniform(0.25, 0.5))
img = img * 0.82
finish(img, "dreamy")

# 5. Fresh: morning mist over a pine valley
img = vgrad((150, 196, 190), (40, 92, 80), 1.1)
img = blob(img, 0.3, 0.3, 0.4, 0.2, (240, 250, 235), 0.35)
for i, (base, col) in enumerate([(0.55, (70, 120, 106)), (0.64, (46, 92, 78)), (0.74, (28, 66, 54)), (0.86, (16, 40, 34))]):
    # jagged pine ridge
    ridge = base + 0.03 * np.sin(nx * (3 + i) * math.pi + i) + 0.012 * np.sin(nx * (9 + i * 3) * math.pi + i * 2)
    a = np.clip((ny - ridge) / 0.006, 0, 1)[..., None]
    img = img * (1 - a) + np.array(col, np.float32) * a
    img = blob(img, 0.5, base - 0.02, 1.2, 0.03, (220, 235, 225), 0.22)
img = img * 0.9
finish(img, "fresh")

# contact sheet
sheet = Image.new("RGB", (1920, 216))
for i, n in enumerate(["calm", "cozy", "focus", "dreamy", "fresh"]):
    sheet.paste(Image.open(os.path.join(HERE, n + ".jpg")).resize((384, 216)), (i * 384, 0))
sheet.save(os.path.join(HERE, "_sheet.jpg"))
