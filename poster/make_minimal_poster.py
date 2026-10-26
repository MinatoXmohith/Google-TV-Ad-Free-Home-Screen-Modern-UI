"""Clean, minimal poster for the TV home screen project. Run: python make_minimal_poster.py"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
W, H = 2160, 2700
OUTFIT = os.path.join(ROOT, "cleanyourtv/launcher/app/src/main/res/font/outfit.ttf")
INK, GREY, ACCENT, BG = (22, 22, 24), (120, 120, 126), (46, 140, 90), (245, 244, 240)

def f(size, w):
    ft = ImageFont.truetype(OUTFIT, size)
    ft.set_variation_by_axes([w])
    return ft

img = Image.new("RGB", (W, H), BG).convert("RGBA")
d = ImageDraw.Draw(img)

# headline: two lines, light + medium weight
d.text((W / 2, 300), "Your TV.", font=f(190, 300), fill=INK, anchor="ma")
d.text((W / 2, 510), "Without the ads.", font=f(190, 500), fill=INK, anchor="ma")
d.text((W / 2, 790), "A liquid glass home screen for Android TV & Google TV.", font=f(52, 400), fill=GREY, anchor="ma")

# hero: thin black TV with the real home screen, soft floor shadow
shot = Image.open(os.path.join(ROOT, "docs/screenshots/home.jpg")).convert("RGB")
tvw = 1680; bez = 22
sw = tvw - 2 * bez
scr = shot.resize((sw, round(shot.height * sw / shot.width)), Image.LANCZOS)
tvh = scr.height + 2 * bez
tv = Image.new("RGBA", (tvw, tvh), (0, 0, 0, 0))
m = Image.new("L", (tvw, tvh), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, tvw - 1, tvh - 1], 24, fill=255)
tv.paste(Image.new("RGBA", (tvw, tvh), (16, 16, 18, 255)), (0, 0), m)
sm = Image.new("L", scr.size, 0); ImageDraw.Draw(sm).rounded_rectangle([0, 0, scr.width - 1, scr.height - 1], 8, fill=255)
tv.paste(scr, (bez, bez), sm)
x0, y0 = (W - tvw) // 2, 960
sh = Image.new("L", (W, H), 0)
ImageDraw.Draw(sh).ellipse([x0 + 140, y0 + tvh + 10, x0 + tvw - 140, y0 + tvh + 90], fill=120)
sh = sh.filter(ImageFilter.GaussianBlur(40))
img.paste(Image.new("RGBA", (W, H), (0, 0, 0, 255)), (0, 0), sh.point(lambda v: v * 0.5))
sh2 = Image.new("L", (W, H), 0); ImageDraw.Draw(sh2).rounded_rectangle([x0 + 30, y0 + 50, x0 + tvw - 30, y0 + tvh + 20], 30, fill=90)
img.paste(Image.new("RGBA", (W, H), (0, 0, 0, 255)), (0, 0), sh2.filter(ImageFilter.GaussianBlur(50)))
img.alpha_composite(tv, (x0, y0))
# slim stand
sy = y0 + tvh
d.rounded_rectangle([W / 2 - 34, sy, W / 2 + 34, sy + 70], 6, fill=(40, 40, 44))
d.rounded_rectangle([W / 2 - 260, sy + 66, W / 2 + 260, sy + 82], 8, fill=(40, 40, 44))

# three features, separated by thin rules
fy = 2150
items = [("No ads", "11 bloat apps switched off"), ("No root", "Set up over Wi-Fi"), ("Reversible", "One-command restore")]
colw = 560; xs = [W / 2 - colw, W / 2, W / 2 + colw]
for i, (title, sub) in enumerate(items):
    d.text((xs[i], fy), title, font=f(64, 600), fill=INK, anchor="ma")
    d.text((xs[i], fy + 92), sub, font=f(40, 400), fill=GREY, anchor="ma")
    if i:
        d.line([(xs[i] - colw / 2, fy + 10), (xs[i] - colw / 2, fy + 140)], fill=(210, 208, 202), width=3)

# footer: logo left, accent link right, hairline above
d.line([(140, 2460), (W - 140, 2460)], fill=(220, 218, 212), width=2)
logo = Image.open(os.path.join(ROOT, "wallpapers/mkdziner-logo.webp")).convert("L")
lm = ImageOps.invert(logo).point(lambda v: 0 if v < 60 else min(255, (v - 60) * 255 // 140)); lm = lm.crop(lm.getbbox())
lm = lm.resize((330, round(lm.height * 330 / lm.width)), Image.LANCZOS)
img.paste(Image.new("RGBA", lm.size, INK + (255,)), (140, 2560 - lm.height // 2), lm)
d.text((W - 140, 2560), "Free & open source  →  github.com/MinatoXmohith", font=f(42, 500), fill=ACCENT, anchor="rm")

out = img.convert("RGB")
out.save(os.path.join(HERE, "minimal-poster.png"), optimize=True)
out.resize((1080, 1350), Image.LANCZOS).save(os.path.join(HERE, "minimal-poster-instagram.jpg"), quality=92)
print("done")
