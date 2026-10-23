"""Builds every visual element for the Vox-style collage video from the real TV screenshots.

Output: ../assets/*.png (transparent cut-outs, paper, tape, stamps, labels) and ../assets/meta.json
(positions the After Effects script needs, such as the y of each line on the package list).
Run: python make_assets.py   (needs Pillow and numpy)
"""
import json
import os
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.dirname(HERE)
ROOT = os.path.dirname(VIDEO)                      # ~/Desktop/TV-Demo
OUT = os.path.join(VIDEO, "assets")
SHOTS = os.path.join(ROOT, "docs", "screenshots", "original")
os.makedirs(OUT, exist_ok=True)
random.seed(7)
np.random.seed(7)

SUP = "/System/Library/Fonts/Supplemental/"
FONTS = {
    "impact": SUP + "Impact.ttf",
    "georgia_b": SUP + "Georgia Bold.ttf",
    "georgia_i": SUP + "Georgia Italic.ttf",
    "times_b": SUP + "Times New Roman Bold.ttf",
    "courier_b": SUP + "Courier New Bold.ttf",
    "courier": SUP + "Courier New.ttf",
    "rockwell": SUP + "Rockwell.ttc",
    "futura": SUP + "Futura.ttc",
    "bodoni": SUP + "Bodoni 72.ttc",
    "typewriter": SUP + "AmericanTypewriter.ttc",
    "outfit": os.path.join(ROOT, "cleanyourtv/launcher/app/src/main/res/font/outfit.ttf"),
}
PAPER = (241, 233, 216)
INK = (28, 26, 24)
RED = (214, 48, 39)
YELLOW = (255, 214, 64)
meta = {}


def font(name, size, weight=None, index=0):
    f = ImageFont.truetype(FONTS[name], size, index=index)
    if weight is not None:
        try:
            f.set_variation_by_axes([weight])
        except Exception:
            pass
    return f


def grain(img, amount=10):
    """Fine paper grain on an RGBA or RGB image."""
    a = np.asarray(img).astype(np.int16)
    n = np.random.randint(-amount, amount + 1, a.shape[:2])[..., None]
    a[..., :3] = np.clip(a[..., :3] + n, 0, 255)
    return Image.fromarray(a.astype(np.uint8), img.mode)


def torn_mask(w, h, rough=6, edges="tblr"):
    """Alpha mask of a rectangle with hand-torn edges."""
    m = Image.new("L", (w, h), 0)
    pts = []
    def walk(n):
        v, out = 0.0, []
        for _ in range(n):
            v = max(-rough, min(rough, v + random.uniform(-2.2, 2.2)))
            out.append(v)
        return out
    top = walk(w // 6 + 1) if "t" in edges else [0] * (w // 6 + 1)
    for i, d in enumerate(top):
        pts.append((i * 6, rough + d if "t" in edges else 0))
    right = walk(h // 6 + 1) if "r" in edges else [0] * (h // 6 + 1)
    for i, d in enumerate(right):
        pts.append((w - 1 - (rough + d if "r" in edges else 0), i * 6))
    bottom = walk(w // 6 + 1) if "b" in edges else [0] * (w // 6 + 1)
    for i, d in enumerate(bottom):
        pts.append((w - 1 - i * 6, h - 1 - (rough + d if "b" in edges else 0)))
    left = walk(h // 6 + 1) if "l" in edges else [0] * (h // 6 + 1)
    for i, d in enumerate(left):
        pts.append((rough + d if "l" in edges else 0, h - 1 - i * 6))
    ImageDraw.Draw(m).polygon(pts, fill=255)
    return m


def save(img, name):
    img.save(os.path.join(OUT, name), optimize=True)
    meta.setdefault("sizes", {})[name] = list(img.size)


# ---------------------------------------------------------------- backgrounds
def paper_bg(w, h, base, name, fibers=900):
    img = Image.new("RGB", (w, h), base)
    d = ImageDraw.Draw(img)
    for _ in range(fibers):
        x, y = random.randrange(w), random.randrange(h)
        l = random.randint(6, 30)
        a = random.uniform(0, 3.14)
        c = tuple(max(0, min(255, v + random.randint(-22, 10))) for v in base)
        d.line([(x, y), (x + l * np.cos(a), y + l * np.sin(a))], fill=c, width=1)
    blot = Image.new("L", (w, h), 0)
    bd = ImageDraw.Draw(blot)
    for _ in range(40):
        x, y, r = random.randrange(w), random.randrange(h), random.randint(60, 260)
        bd.ellipse([x - r, y - r, x + r, y + r], fill=random.randint(8, 26))
    blot = blot.filter(ImageFilter.GaussianBlur(80))
    dark = Image.new("RGB", (w, h), tuple(int(v * 0.86) for v in base))
    img = Image.composite(dark, img, blot)
    yy, xx = np.mgrid[0:h, 0:w]
    v = ((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2
    vig = Image.fromarray(np.clip(v * 70, 0, 110).astype(np.uint8))
    img = Image.composite(Image.new("RGB", (w, h), (40, 30, 20)), img, vig)
    save(grain(img, 9), name)


paper_bg(2200, 1300, PAPER, "bg_paper.png")
paper_bg(2200, 1300, (32, 34, 38), "bg_dark.png", fibers=500)

# halftone dots, strongest at the bottom-left corner
W, H = 1920, 1080
ht = Image.new("RGBA", (W, H), (0, 0, 0, 0))
hd = ImageDraw.Draw(ht)
for y in range(0, H, 14):
    for x in range(0, W, 14):
        t = max(0.0, 1.0 - ((x / W) * 0.9 + (1 - y / H) * 0.9))
        r = 5.5 * t
        if r > 0.6:
            hd.ellipse([x - r, y - r, x + r, y + r], fill=(30, 25, 20, 70))
save(ht, "halftone.png")


# ---------------------------------------------------------------- tape
def tape(w, h, name, color=(232, 224, 196, 170)):
    img = Image.new("RGBA", (w, h), color)
    img.putalpha(Image.fromarray((np.asarray(torn_mask(w, h, 5, "lr")) * (color[3] / 255)).astype(np.uint8)))
    img = grain(img, 12)
    save(img, name)


tape(260, 70, "tape_1.png")
tape(200, 62, "tape_2.png", (250, 236, 170, 175))


# ---------------------------------------------------------------- photo cut-outs
def card(src, name, width=1100, border=16, crop=None, round_=False):
    im = Image.open(src).convert("RGB")
    if crop:
        im = im.crop(crop)
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    if round_:
        s = min(im.size)
        im = im.crop(((im.width - s) // 2, (im.height - s) // 2, (im.width + s) // 2, (im.height + s) // 2))
        out = Image.new("RGBA", (s + border * 2, s + border * 2), (0, 0, 0, 0))
        m = Image.new("L", out.size, 0)
        ImageDraw.Draw(m).ellipse([0, 0, out.width - 1, out.height - 1], fill=255)
        out.paste(Image.new("RGBA", out.size, (255, 255, 255, 255)), (0, 0), m)
        m2 = Image.new("L", im.size, 0)
        ImageDraw.Draw(m2).ellipse([0, 0, s - 1, s - 1], fill=255)
        out.paste(im, (border, border), m2)
    else:
        out = Image.new("RGBA", (im.width + border * 2, im.height + border * 2), (252, 250, 245, 255))
        out.paste(im, (border, border))
        out.putalpha(torn_mask(out.width, out.height, 3))
    save(grain(out, 5), name)


card(os.path.join(SHOTS, "after-debloat.png"), "card_before.png")
card(os.path.join(SHOTS, "new-home.png"), "card_launcher_v1.png", 900)
card(os.path.join(SHOTS, "home-wallpaper-logo.png"), "card_domain_clash.png", 900)
card(os.path.join(SHOTS, "home-spiderman.png"), "card_spiderman.png", 900)
card(os.path.join(SHOTS, "home-glass.png"), "card_glass_v1.png", 900)
card(os.path.join(SHOTS, "new-ui-avatar.png"), "card_final.png", 1100)
card(os.path.join(SHOTS, "new-ui-2.png"), "card_panel.png", 1000)
card(os.path.join(SHOTS, "new-ui-avatar.png"), "card_pill.png", 620, crop=(1540, 40, 1840, 160))
card(os.path.join(ROOT, "docs", "before-after.jpg"), "card_before_after.png", 1300)
card(os.path.join(ROOT, "my-theme", "avatar.jpg"), "card_avatar.png", 300, border=10, round_=True)
figma = os.path.join(VIDEO, "assets_src", "figma_frames.webp")
if os.path.exists(figma):
    card(figma, "card_figma.png", 1200)


# ---------------------------------------------------------------- paper labels
def label(text, name, fnt, size, fg=INK, bg=(250, 247, 238), pad=(28, 16), weight=None, idx=0, rough=4):
    f = font(fnt, size, weight, idx)
    tmp = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    l, t, r, b = tmp.textbbox((0, 0), text, font=f)
    w, h = r - l + pad[0] * 2, b - t + pad[1] * 2
    img = Image.new("RGBA", (w, h), bg + (255,))
    ImageDraw.Draw(img).text((pad[0] - l, pad[1] - t), text, font=f, fill=fg)
    img.putalpha(torn_mask(w, h, rough))
    save(grain(img, 7), name)


label("SPONSORED.", "txt_sponsored.png", "impact", 120)
label("an ad before Netflix?", "txt_ad_before.png", "georgia_i", 64)
label("STEP 1", "txt_step1.png", "impact", 70, fg=INK, bg=YELLOW)
label("STEP 2", "txt_step2.png", "impact", 70, fg=INK, bg=YELLOW)
label("STEP 3", "txt_step3.png", "impact", 70, fg=INK, bg=YELLOW)
label("STEP 4", "txt_step4.png", "impact", 70, fg=INK, bg=YELLOW)
label("STEP 5", "txt_step5.png", "impact", 70, fg=INK, bg=YELLOW)
label("STEP 6", "txt_step6.png", "impact", 70, fg=INK, bg=YELLOW)
label("STEP 7", "txt_step7.png", "impact", 70, fg=INK, bg=YELLOW)
label("Developer mode", "txt_devmode.png", "georgia_b", 84)
label("Settings  →  About  →  Build", "txt_build_path.png", "courier_b", 48)
label("USB debugging:  ON", "txt_usb_on.png", "courier_b", 52, fg=(255, 255, 255), bg=(40, 140, 80))
label("Talk to the TV over Wi-Fi", "txt_wifi.png", "georgia_b", 76)
label("ADB  ·  192.168.1.36 : 5555", "txt_adb.png", "courier_b", 46)
label("Back up everything first", "txt_backup.png", "georgia_b", 76)
label("backup-20261020-1723/", "txt_backup_dir.png", "courier_b", 52)
label("Switch off the junk", "txt_junk.png", "georgia_b", 80)
label("A new home screen", "txt_newhome.png", "georgia_b", 80)
label("designed from scratch", "txt_scratch.png", "georgia_i", 56)
label("tvOS 2026 inspired", "txt_tvos.png", "georgia_i", 50)
label("Liquid glass", "txt_glass.png", "georgia_b", 84)
label("control panel", "txt_panel.png", "typewriter", 50)
label("my name, my face", "txt_myface.png", "typewriter", 50)
label("Faster. And reversible.", "txt_faster.png", "georgia_b", 76)
label("restore.sh my-tv-debloat.txt", "txt_restore.png", "courier_b", 46, fg=(230, 230, 230), bg=(30, 32, 36))
label("NO ADS.  NO ROOT.  JUST MY TV.", "txt_outro.png", "impact", 96)
label("github.com/MinatoXmohith/Google-TV-Ad-Free-Home-Screen-Modern-UI", "txt_github.png", "courier_b", 34)
label("v1", "txt_v1.png", "typewriter", 44)
label("v2", "txt_v2.png", "typewriter", 44)
label("v3", "txt_v3.png", "typewriter", 44)
label("final", "txt_vfinal.png", "typewriter", 44)

# counter cut-outs for "Build x7"
for i in range(1, 8):
    label(f"×{i}", f"txt_x{i}.png", "impact", 150, fg=RED, bg=(250, 247, 238), pad=(24, 6))

# ransom-note title
title_lines = ["HOW I TOOK", "MY TV BACK"]
styles = [("impact", INK, (250, 247, 238)), ("georgia_b", (250, 247, 238), INK), ("rockwell", INK, YELLOW),
          ("bodoni", RED, (250, 247, 238)), ("futura", (250, 247, 238), RED), ("times_b", INK, (220, 230, 240))]
pieces = []
for line in title_lines:
    row = []
    for ch in line:
        if ch == " ":
            row.append(None)
            continue
        fn, fg, bg = random.choice(styles)
        f = font(fn, random.randint(118, 150))
        tmp = ImageDraw.Draw(Image.new("RGB", (1, 1)))
        l, t, r, b = tmp.textbbox((0, 0), ch, font=f)
        w, h = r - l + 34, b - t + 34
        im = Image.new("RGBA", (w, h), bg + (255,))
        ImageDraw.Draw(im).text((17 - l, 17 - t), ch, font=f, fill=fg)
        im.putalpha(torn_mask(w, h, 4))
        im = im.rotate(random.uniform(-7, 7), expand=True, resample=Image.BICUBIC)
        row.append(grain(im, 8))
    pieces.append(row)
rows = []
for row in pieces:
    wsum = sum(p.width if p else 50 for p in row) + 6 * len(row)
    hmax = max(p.height for p in row if p)
    r = Image.new("RGBA", (wsum, hmax), (0, 0, 0, 0))
    x = 0
    for p in row:
        if p is None:
            x += 50
            continue
        r.alpha_composite(p, (x, (hmax - p.height) // 2 + random.randint(-6, 6) if hmax > p.height else 0))
        x += p.width + 6
    rows.append(r)
tw = max(r.width for r in rows)
title = Image.new("RGBA", (tw, sum(r.height for r in rows) + 20), (0, 0, 0, 0))
y = 0
for r in rows:
    title.alpha_composite(r, ((tw - r.width) // 2, y))
    y += r.height + 20
save(title, "title_ransom.png")


# ---------------------------------------------------------------- stamps
def stamp(text, name, size=96, color=RED):
    f = font("impact", size)
    tmp = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    l, t, r, b = tmp.textbbox((0, 0), text, font=f)
    w, h = r - l + 80, b - t + 60
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([6, 6, w - 7, h - 7], radius=18, outline=color + (255,), width=9)
    d.text((40 - l, 30 - t), text, font=f, fill=color + (255,))
    a = np.asarray(im).copy()
    holes = np.random.rand(h, w) < 0.18
    holes = np.asarray(Image.fromarray((holes * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))) > 90
    a[..., 3][holes] = (a[..., 3][holes] * 0.25).astype(np.uint8)
    save(Image.fromarray(a, "RGBA").rotate(-8, expand=True, resample=Image.BICUBIC), name)


stamp("BACKED UP", "stamp_backed_up.png")
stamp("DISABLED, NOT DELETED", "stamp_disabled.png", 80)
stamp("REVERSIBLE", "stamp_reversible.png", color=(30, 120, 70))
stamp("NO ROOT", "stamp_no_root.png", color=(30, 120, 70))

# "0.5x" sticker
st = Image.new("RGBA", (300, 300), (0, 0, 0, 0))
d = ImageDraw.Draw(st)
d.ellipse([4, 4, 295, 295], fill=YELLOW + (255,), outline=INK + (255,), width=6)
f = font("impact", 110)
l, t, r, b = d.textbbox((0, 0), "0.5×", font=f)
d.text(((300 - (r - l)) / 2 - l, (300 - (b - t)) / 2 - t - 18), "0.5×", font=f, fill=INK)
f2 = font("courier_b", 30)
l, t, r, b = d.textbbox((0, 0), "animations", font=f2)
d.text(((300 - (r - l)) / 2 - l, 200), "animations", font=f2, fill=INK)
save(grain(st, 6), "sticker_05x.png")

# ---------------------------------------------------------------- package list on lined paper
pkgs = [
    "com.tcl.bi                  telemetry",
    "com.tcl.tv.tclhome_passive  home pushes",
    "com.tcl.waterfall.overseas  web feed",
    "com.tcl.esticker            demo stickers",
    "com.tcl.tvweishi            'cleaner'",
    "com.tcl.notereminder        reminder",
    "com.tcl.appmarket2          TCL store",
    "...tvrecommendations        ad rows",
    "...leanbacklauncher.recs    ad rows",
    "com.tcl.partnercustomizer   TCL Channel",
    "...MultiScreenInteraction   MagiConnect",
]
pw, top, step = 1180, 120, 62
ph = top + step * len(pkgs) + 50
pl = Image.new("RGBA", (pw, ph), (252, 250, 242, 255))
d = ImageDraw.Draw(pl)
for i in range(len(pkgs) + 1):
    yy = top + i * step - 14
    d.line([(0, yy), (pw, yy)], fill=(170, 200, 230, 255), width=2)
d.line([(70, 0), (70, ph)], fill=(230, 120, 120, 255), width=3)
d.text((90, 34), "my-tv-debloat.txt", font=font("courier_b", 44), fill=INK)
fp = font("courier", 33)
lines_y = []
for i, p in enumerate(pkgs):
    yy = top + i * step
    d.text((90, yy), p, font=fp, fill=INK)
    lines_y.append(yy + 20)
pl.putalpha(torn_mask(pw, ph, 4))
save(grain(pl, 6), "paper_packages.png")
meta["package_lines_y"] = lines_y
meta["package_line_x"] = [84, 1100]


# ---------------------------------------------------------------- icons
def tv_icon(s):
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    w, h = int(s * .84), int(s * .58)
    x, y = (s - w) // 2, int(s * .2)
    lw = max(4, s // 26)
    d.line([(s * .36, y), (s * .26, s * .04)], fill=INK, width=lw)
    d.line([(s * .64, y), (s * .74, s * .04)], fill=INK, width=lw)
    d.rounded_rectangle([x, y, x + w, y + h], radius=s // 9, fill=INK)
    d.rounded_rectangle([x + s // 16, y + s // 16, x + w - s // 16, y + h - s // 16], radius=s // 14, fill=(255, 200, 110))
    d.rounded_rectangle([s * .3, y + h + s * .03, s * .42, y + h + s * .1], radius=s // 40, fill=INK)
    d.rounded_rectangle([s * .58, y + h + s * .03, s * .7, y + h + s * .1], radius=s // 40, fill=INK)
    return im


def laptop_icon(s):
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([s * .16, s * .2, s * .84, s * .7], radius=s // 22, fill=INK)
    d.rounded_rectangle([s * .2, s * .24, s * .8, s * .66], radius=s // 30, fill=(120, 190, 220))
    d.polygon([(s * .06, s * .74), (s * .94, s * .74), (s * .88, s * .82), (s * .12, s * .82)], fill=INK)
    f = font("courier_b", s // 9)
    d.text((s * .26, s * .38), "$ adb_", font=f, fill=INK)
    return im


def on_paper(icon, name):
    pad = 26
    bg = Image.new("RGBA", (icon.width + pad * 2, icon.height + pad * 2), (250, 247, 238, 255))
    bg.alpha_composite(icon, (pad, pad))
    bg.putalpha(torn_mask(bg.width, bg.height, 5))
    save(grain(bg, 6), name)


on_paper(tv_icon(360), "icon_tv.png")
on_paper(laptop_icon(360), "icon_laptop.png")

# "Allow USB debugging?" dialog
dw, dh = 760, 360
dl = Image.new("RGBA", (dw, dh), (36, 38, 44, 255))
d = ImageDraw.Draw(dl)
d.text((40, 36), "Allow USB debugging?", font=font("outfit", 44, 600), fill=(255, 255, 255))
d.text((40, 104), "The computer's RSA key fingerprint is:", font=font("outfit", 28, 400), fill=(190, 190, 195))
d.text((40, 142), "3F:A2:9C:...:71:0B", font=font("courier_b", 28), fill=(190, 190, 195))
d.rounded_rectangle([40, 196, 76, 232], radius=6, fill=(110, 180, 255))
d.text((92, 196), "Always allow from this computer", font=font("outfit", 28, 500), fill=(255, 255, 255))
d.rounded_rectangle([dw - 300, dh - 96, dw - 170, dh - 40], radius=12, fill=(60, 62, 70))
d.text((dw - 276, dh - 88), "Cancel", font=font("outfit", 30, 500), fill=(255, 255, 255))
d.rounded_rectangle([dw - 150, dh - 96, dw - 40, dh - 40], radius=12, fill=(240, 240, 240))
d.text((dw - 120, dh - 88), "OK", font=font("outfit", 30, 600), fill=INK)
m = Image.new("L", (dw, dh), 0)
ImageDraw.Draw(m).rounded_rectangle([0, 0, dw - 1, dh - 1], radius=26, fill=255)
dl.putalpha(m)
save(dl, "dialog_allow.png")

# folder icon for the backup
fw, fh = 420, 320
fo = Image.new("RGBA", (fw, fh), (0, 0, 0, 0))
d = ImageDraw.Draw(fo)
d.rounded_rectangle([10, 30, 170, 90], radius=16, fill=(235, 170, 60))
d.rounded_rectangle([10, 60, fw - 10, fh - 10], radius=22, fill=(250, 196, 80))
d.text((40, 150), "packages\nsettings\ngetprop", font=font("courier_b", 34), fill=(90, 60, 10))
save(fo, "icon_folder.png")

# mkdziner logo, dark ink on a cream card
logo_src = os.path.join(ROOT, "wallpapers", "mkdziner-logo.webp")
lg = Image.open(logo_src).convert("L")
lm = ImageOps.invert(lg).point(lambda v: 0 if v < 60 else min(255, (v - 60) * 255 // 140))
lm = lm.crop(lm.getbbox())
lm = lm.resize((700, round(lm.height * 700 / lm.width)), Image.LANCZOS)
lc = Image.new("RGBA", (lm.width + 120, lm.height + 100), (250, 247, 238, 255))
lc.paste(Image.new("RGBA", lm.size, INK + (255,)), (60, 50), lm)
lc.putalpha(torn_mask(lc.width, lc.height, 5))
save(grain(lc, 6), "logo_mkdziner.png")

with open(os.path.join(OUT, "meta.json"), "w") as fh_:
    json.dump(meta, fh_, indent=1)
print(len(meta["sizes"]), "assets written to", OUT)
