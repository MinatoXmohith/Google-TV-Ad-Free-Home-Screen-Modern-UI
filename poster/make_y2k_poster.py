"""Y2K commercial poster for the TV home screen project. Run: python make_y2k_poster.py"""
import math, os, random
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps, ImageChops

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
W, H = 2160, 2700
random.seed(9)
SUP = "/System/Library/Fonts/Supplemental/"
OUTFIT = os.path.join(ROOT, "cleanyourtv/launcher/app/src/main/res/font/outfit.ttf")

def f(path, size, w=None, idx=0):
    ft = ImageFont.truetype(path, size, index=idx)
    if w is not None:
        try: ft.set_variation_by_axes([w])
        except Exception: pass
    return ft

def lerp(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

# ---------------------------------------------------------------- background: holographic gradient
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
t = (yy / H)
c1, c2, c3 = np.array([12, 18, 74]), np.array([40, 110, 230]), np.array([150, 230, 255])
bg = np.where(t[..., None] < 0.55, c1 + (c2 - c1) * (t[..., None] / 0.55), c2 + (c3 - c2) * ((t[..., None] - 0.55) / 0.45))
# holographic sheen bands
band = (np.sin((xx * 0.0022 + yy * 0.0014) * math.pi * 2) * 0.5 + 0.5) ** 3
holo = np.stack([255 * band, 120 * band, 255 * band], -1) * 0.22
bg = np.clip(bg + holo, 0, 255).astype(np.uint8)
img = Image.fromarray(bg)
d = ImageDraw.Draw(img)

# radial glow behind the hero
glow = Image.new("L", (W, H), 0); ImageDraw.Draw(glow).ellipse([W*0.05, H*0.28, W*0.95, H*0.78], fill=200)
glow = glow.filter(ImageFilter.GaussianBlur(220))
img = Image.composite(Image.new("RGB", (W, H), (255, 120, 230)), img, glow.point(lambda v: v * 0.55))

# perspective grid floor
grid = Image.new("RGBA", (W, H), (0, 0, 0, 0)); g = ImageDraw.Draw(grid)
hz = int(H * 0.74); vx = W // 2
for i in range(-22, 23):
    g.line([(vx, hz), (vx + i * 260, H + 40)], fill=(190, 250, 255, 150), width=3)
k = 0
while True:
    y = hz + int(6 * (1.32 ** k)); k += 1
    if y > H: break
    g.line([(0, y), (W, y)], fill=(190, 250, 255, 150), width=3)
fade = Image.linear_gradient("L").resize((W, H - hz))
mask = Image.new("L", (W, H), 0); mask.paste(fade, (0, hz))
grid.putalpha(ImageChops.multiply(grid.getchannel("A"), mask))
img = img.convert("RGBA"); img.alpha_composite(grid)

# halftone dots top-left and bottom-right
ht = Image.new("RGBA", (W, H), (0, 0, 0, 0)); hd = ImageDraw.Draw(ht)
for y in range(0, H, 34):
    for x in range(0, W, 34):
        s = max(0, 1 - math.hypot(x / W, y / H) * 1.6) * 9
        s2 = max(0, 1 - math.hypot((W - x) / W, (H - y) / H) * 2.2) * 9
        r = max(s, s2)
        if r > 1: hd.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, 60))
img.alpha_composite(ht)

# orbit rings
rings = Image.new("RGBA", (W, H), (0, 0, 0, 0)); rd = ImageDraw.Draw(rings)
for i, (a, b) in enumerate([(1900, 520), (2150, 640)]):
    rd.ellipse([W/2 - a/2, H*0.55 - b/2, W/2 + a/2, H*0.55 + b/2], outline=(255, 255, 255, 120 - i * 40), width=5)
rings = rings.rotate(-9, center=(W/2, H*0.55))
img.alpha_composite(rings)

def sparkle(layer, cx, cy, r, col=(255, 255, 255, 255)):
    dd = ImageDraw.Draw(layer)
    pts = []
    for i in range(8):
        ang = math.pi / 4 * i; rr = r if i % 2 == 0 else r * 0.18
        pts.append((cx + rr * math.cos(ang - math.pi/2), cy + rr * math.sin(ang - math.pi/2)))
    dd.polygon(pts, fill=col)

# ---------------------------------------------------------------- chrome text
def chrome_text(text, font, stroke=10, tilt=0):
    tmp = ImageDraw.Draw(Image.new("L", (1, 1)))
    l, tp, r, b = tmp.textbbox((0, 0), text, font=font, stroke_width=stroke)
    w, h = r - l + 80, b - tp + 80
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).text((40 - l, 40 - tp), text, font=font, fill=255)
    ms = Image.new("L", (w, h), 0)
    ImageDraw.Draw(ms).text((40 - l, 40 - tp), text, font=font, fill=255, stroke_width=stroke, stroke_fill=255)
    # chrome gradient: sky - horizon line - ground
    gy = np.linspace(0, 1, h)[:, None]
    top = np.array([235, 245, 255]); mid1 = np.array([120, 160, 220]); mid2 = np.array([40, 40, 90]); bot = np.array([250, 200, 255])
    col = np.where(gy < 0.5, top + (mid1 - top) * (gy / 0.5),
                   np.where(gy < 0.53, mid2, mid2 + (bot - mid2) * ((gy - 0.53) / 0.47)))
    chrome = Image.fromarray(np.ascontiguousarray(np.broadcast_to(col.reshape(h, 1, 3), (h, w, 3))).astype(np.uint8))
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(Image.new("RGBA", (w, h), (20, 10, 70, 255)), (0, 0), ms)          # dark outline
    edge = ms.filter(ImageFilter.MaxFilter(5))
    out.paste(Image.new("RGBA", (w, h), (255, 255, 255, 255)), (0, 0), ImageChops.subtract(edge, ms))  # white rim
    out.paste(chrome.convert("RGBA"), (0, 0), m)
    # specular highlight streak
    hl = Image.new("L", (w, h), 0); ImageDraw.Draw(hl).rectangle([0, int(h*0.22), w, int(h*0.3)], fill=150)
    out.paste(Image.new("RGBA", (w, h), (255, 255, 255, 255)), (0, 0), ImageChops.multiply(hl.filter(ImageFilter.GaussianBlur(6)), m))
    if tilt: out = out.rotate(tilt, expand=True, resample=Image.BICUBIC)
    return out

def drop_glow(layer, color, rad):
    a = layer.getchannel("A").filter(ImageFilter.GaussianBlur(rad))
    gl = Image.new("RGBA", layer.size, color); gl.putalpha(a.point(lambda v: min(255, v * 2)))
    return gl

def paste_center(base, layer, cx, cy):
    base.alpha_composite(layer, (int(cx - layer.width / 2), int(cy - layer.height / 2)))

impact = SUP + "Impact.ttf"
t1 = chrome_text("TAKE YOUR", f(impact, 250), 12, 3)
t2 = chrome_text("TV BACK!", f(impact, 420), 16, 3)
for layer, cy in [(t1, 300), (t2, 590)]:
    paste_center(img, drop_glow(layer, (255, 90, 220, 255), 30), W/2, cy)
    paste_center(img, layer, W/2, cy)

# subline pill
def pill(text, font, fill, fg, pad=(46, 22), outline=None):
    tmp = ImageDraw.Draw(Image.new("L", (1, 1)))
    l, tp, r, b = tmp.textbbox((0, 0), text, font=font)
    w, h = r - l + pad[0] * 2, b - tp + pad[1] * 2
    p = Image.new("RGBA", (w + 12, h + 12), (0, 0, 0, 0)); pd = ImageDraw.Draw(p)
    pd.rounded_rectangle([6, 6, w + 5, h + 5], radius=h // 2, fill=fill, outline=outline, width=5 if outline else 0)
    pd.rounded_rectangle([6 + h//4, 10, w + 5 - h//4, 6 + h * 0.42], radius=h // 4, fill=(255, 255, 255, 70))
    pd.text((6 + pad[0] - l, 6 + pad[1] - tp), text, font=font, fill=fg)
    return p

sub = pill("THE AD-FREE HOME SCREEN  ·  LIQUID GLASS UI", f(OUTFIT, 60, 700), (255, 255, 255, 235), (25, 20, 90))
paste_center(img, sub, W/2, 850)

# ---------------------------------------------------------------- hero: TV with the real home screen
shot = Image.open(os.path.join(ROOT, "docs/screenshots/home.jpg")).convert("RGB")
tvw = 1640; sw = tvw - 70
scr = shot.resize((sw, round(shot.height * sw / shot.width)), Image.LANCZOS)
tvh = scr.height + 70
tv = Image.new("RGBA", (tvw, tvh + 120), (0, 0, 0, 0)); td = ImageDraw.Draw(tv)
# bezel: glossy silver Y2K plastic
bez = Image.new("RGBA", (tvw, tvh), (0, 0, 0, 0))
gy = np.linspace(0, 1, tvh)[:, None]
silver = (np.array([245, 248, 255]) * (1 - gy) + np.array([150, 160, 190]) * gy)
bez = Image.fromarray(np.broadcast_to(silver.reshape(tvh, 1, 3), (tvh, tvw, 3)).astype(np.uint8)).convert("RGBA")
bm = Image.new("L", (tvw, tvh), 0); ImageDraw.Draw(bm).rounded_rectangle([0, 0, tvw - 1, tvh - 1], 46, fill=255)
tv.paste(bez, (0, 0), bm)
sm = Image.new("L", scr.size, 0); ImageDraw.Draw(sm).rounded_rectangle([0, 0, scr.width - 1, scr.height - 1], 18, fill=255)
tv.paste(scr, (35, 35), sm)
# screen gloss
gl = Image.new("L", scr.size, 0); ImageDraw.Draw(gl).polygon([(0, 0), (scr.width * 0.55, 0), (scr.width * 0.3, scr.height), (0, scr.height)], fill=38)
tv.paste(Image.new("RGBA", scr.size, (255, 255, 255, 255)), (35, 35), ImageChops.multiply(gl, sm))
# stand
td.polygon([(tvw/2 - 120, tvh), (tvw/2 + 120, tvh), (tvw/2 + 220, tvh + 90), (tvw/2 - 220, tvh + 90)], fill=(200, 208, 230, 255))
td.rounded_rectangle([tvw/2 - 330, tvh + 80, tvw/2 + 330, tvh + 112], 16, fill=(225, 230, 245, 255))
tv = tv.rotate(-3, expand=True, resample=Image.BICUBIC)
shadow = drop_glow(tv, (10, 0, 60, 200), 40)
hero_cy = 1560
paste_center(img, drop_glow(tv, (120, 240, 255, 255), 60), W/2, hero_cy)
paste_center(img, shadow, W/2 + 30, hero_cy + 40)
paste_center(img, tv, W/2, hero_cy)

# ---------------------------------------------------------------- starburst sticker
def starburst(r, text_lines):
    s = Image.new("RGBA", (r * 2 + 40, r * 2 + 40), (0, 0, 0, 0)); sd = ImageDraw.Draw(s)
    cx = cy = r + 20; pts = []
    for i in range(48):
        rr = r if i % 2 == 0 else r * 0.82
        a = math.pi * 2 * i / 48
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    sd.polygon(pts, fill=(255, 230, 40, 255), outline=(230, 30, 140, 255))
    sd.ellipse([cx - r*0.74, cy - r*0.74, cx + r*0.74, cy + r*0.74], outline=(230, 30, 140, 255), width=8)
    fy = cy - (len(text_lines) * 92) / 2
    for i, (txt, size) in enumerate(text_lines):
        ft = f(impact, size); w = sd.textlength(txt, font=ft)
        sd.text((cx - w / 2, fy + i * 98), txt, font=ft, fill=(200, 10, 120))
    return s.rotate(14, resample=Image.BICUBIC)

sb = starburst(250, [("NO ADS!", 104), ("NO ROOT!", 92), ("100% FREE", 70)])
paste_center(img, drop_glow(sb, (0, 0, 40, 160), 20), 1880 + 10, 1200 + 14)
paste_center(img, sb, 1880, 1200)

# ---------------------------------------------------------------- feature bubbles
feats = [("LIQUID GLASS", (255, 110, 220)), ("LIVE WEATHER", (90, 220, 255)),
         ("NOW PLAYING", (180, 120, 255)), ("TRENDING MOVIES", (255, 190, 60))]
ff = f(OUTFIT, 56, 800)
pos = [(560, 2215), (1600, 2215), (560, 2345), (1600, 2345)]
for (txt, col), (x, y) in zip(feats, pos):
    p = pill(txt, ff, col + (255,), (255, 255, 255), pad=(44, 24), outline=(255, 255, 255, 255))
    paste_center(img, drop_glow(p, (20, 0, 80, 200), 14), x + 6, y + 10)
    paste_center(img, p, x, y)
    sparkle(img, x - p.width / 2 + 10, y - p.height / 2 + 14, 26)

# ---------------------------------------------------------------- footer
foot = Image.new("RGBA", (W, 230), (10, 10, 50, 215))
img.alpha_composite(foot, (0, H - 230))
fd = ImageDraw.Draw(img)
logo = Image.open(os.path.join(ROOT, "wallpapers/mkdziner-logo.webp")).convert("L")
lm = ImageOps.invert(logo).point(lambda v: 0 if v < 60 else min(255, (v - 60) * 255 // 140)); lm = lm.crop(lm.getbbox())
lm = lm.resize((520, round(lm.height * 520 / lm.width)), Image.LANCZOS)
img.paste(Image.new("RGBA", lm.size, (255, 255, 255, 255)), (110, H - 115 - lm.height // 2), lm)
fd.text((W - 110, H - 150), "AVAILABLE NOW  ·  FREE & OPEN SOURCE", font=f(OUTFIT, 50, 800), fill=(255, 235, 80), anchor="ra")
fd.text((W - 110, H - 82), "github.com/MinatoXmohith  ·  For Android TV & Google TV", font=f(OUTFIT, 36, 500), fill=(220, 230, 255), anchor="ra")

# sparkles everywhere (last, on top)
sp = Image.new("RGBA", (W, H), (0, 0, 0, 0))
for (x, y, r) in [(230, 160, 70), (1960, 230, 90), (150, 960, 50), (2040, 1700, 60), (330, 1980, 46), (1150, 120, 40),
                  (1880, 2000, 40), (90, 1500, 34), (1940, 860, 30), (150, 700, 26)]:
    sparkle(sp, x, y, r)
img.alpha_composite(drop_glow(sp, (255, 200, 255, 255), 10)); img.alpha_composite(sp)

# fine print + film grain
fd.text((W/2, 2412), "Debloats over Wi-Fi in minutes. Nothing uninstalled. One-command restore.", font=f(OUTFIT, 40, 600), fill=(255, 255, 255), anchor="ma", stroke_width=3, stroke_fill=(20, 10, 70))
arr = np.asarray(img.convert("RGB")).astype(np.int16)
arr = np.clip(arr + np.random.randint(-7, 8, arr.shape[:2])[..., None], 0, 255).astype(np.uint8)
out = Image.fromarray(arr)
out.save(os.path.join(HERE, "y2k-poster.png"), optimize=True)
out.resize((1080, 1350), Image.LANCZOS).save(os.path.join(HERE, "y2k-poster-instagram.jpg"), quality=92)
print("done")
