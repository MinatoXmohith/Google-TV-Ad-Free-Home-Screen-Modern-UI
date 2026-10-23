"""Writes the After Effects build script (build_vox.jsx) and a Premiere Pro sequence (premiere_sequence.xml)
from one timeline, so animation, voiceover and sound effects line up.

Run after make_assets.py, make_audio.py and the voiceover step:  python build_project.py
"""
import json
import math
import os
import random
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.dirname(HERE)
ASSETS = os.path.join(VIDEO, "assets")
FPS = 24
REEL = len(sys.argv) > 1 and sys.argv[1] == "reel"     # python build_project.py reel  -> 1080x1920 Instagram cut
W, H = (1080, 1920) if REEL else (1920, 1080)
TAG = "_reel" if REEL else ""
NAME = "TV debloat - Vox collage" + (" (Reel)" if REEL else "")
BG = 150 if REEL else 100          # paper background scale that covers the frame
RED = [0.84, 0.19, 0.15]
INKC = [0.11, 0.10, 0.09]
GREEN = [0.12, 0.47, 0.27]
random.seed(3)
meta = json.load(open(os.path.join(ASSETS, "meta.json")))
SIZES = meta["sizes"]


def wav_seconds(path):
    out = subprocess.run(["afinfo", path], capture_output=True, text=True).stdout
    for line in out.splitlines():
        if "estimated duration" in line:
            return float(line.split()[2])
    return 0.0


# ------------------------------------------------------------------ helpers for positions on cards
def card_pt(asset, shot_w, pt, center, scale, inner_w=None, border=16):
    """A point on the original screenshot -> comp coordinates of the card placed at center/scale."""
    cw, ch = SIZES[asset]
    inner_w = inner_w or (cw - 2 * border)
    k = inner_w / shot_w
    px, py = pt[0] * k + border, pt[1] * k + border
    s = scale / 100
    return [center[0] + (px - cw / 2) * s, center[1] + (py - ch / 2) * s]


def scribble_ellipse(c, rx, ry, start=-110, sweep=385, n=40, tilt=-6):
    pts = []
    for i in range(n):
        a = math.radians(start + sweep * i / (n - 1))
        r = 1 + random.uniform(-0.035, 0.035) + 0.06 * i / n
        x, y = rx * r * math.cos(a), ry * r * math.sin(a)
        tr = math.radians(tilt)
        pts.append([round(c[0] + x * math.cos(tr) - y * math.sin(tr), 1),
                    round(c[1] + x * math.sin(tr) + y * math.cos(tr), 1)])
    return pts


def wobbly_line(p0, p1, n=7, amp=3.5):
    pts = []
    for i in range(n):
        t = i / (n - 1)
        pts.append([round(p0[0] + (p1[0] - p0[0]) * t + random.uniform(-1, 1), 1),
                    round(p0[1] + (p1[1] - p0[1]) * t + random.uniform(-amp, amp) * (0 < i < n - 1), 1)])
    return pts


def arrow(p0, p1, bend=60, head=26):
    mx, my = (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2
    dx, dy = p1[0] - p0[0], p1[1] - p0[1]
    ln = math.hypot(dx, dy) or 1
    cx, cy = mx - dy / ln * bend, my + dx / ln * bend
    pts = []
    for i in range(14):
        t = i / 13
        x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * cx + t * t * p1[0]
        y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * cy + t * t * p1[1]
        pts.append([round(x, 1), round(y, 1)])
    ang = math.atan2(p1[1] - pts[-2][1], p1[0] - pts[-2][0])
    hl = [p1[0] + head * math.cos(ang + math.pi - 0.5), p1[1] + head * math.sin(ang + math.pi - 0.5)]
    hr = [p1[0] + head * math.cos(ang + math.pi + 0.5), p1[1] + head * math.sin(ang + math.pi + 0.5)]
    pts += [[round(hl[0], 1), round(hl[1], 1)], list(p1), [round(hr[0], 1), round(hr[1], 1)]]
    return pts


# ------------------------------------------------------------------ the storyboard
def el(a, t, pos, scale=100, rot=0, anim="slide_up", sfx="paper_slide", tape=None, out=None, shadow=True):
    return dict(kind="img", a=a, t=t, pos=pos, scale=scale, rot=rot, anim=anim, sfx=sfx, tape=tape, out=out,
                shadow=shadow)


def stroke(pts, t, dur=0.45, color=RED, width=9, sfx="marker", dashed=False, out=None):
    return dict(kind="stroke", pts=pts, t=t, dur=dur, color=color, width=width, sfx=sfx, dashed=dashed, out=out)


scenes = []

# s01 hook: the ad
before_c, before_s = [960, 470], 72
spons = card_pt("card_before.png", 1280, (230, 282), before_c, before_s)
scenes.append(dict(id="s01", pad=1.0, vo_at=0.4, els=[
    el("card_before.png", 0.1, before_c, before_s, -2, "slide_up", tape=(0, -6)),
    stroke(scribble_ellipse(spons, 190, 70), 1.0, 0.55),
    el("txt_sponsored.png", 1.7, [1430, 860], 85, 5, "stamp", "stamp"),
    el("txt_ad_before.png", 2.4, [560, 900], 100, -3, "slide_left"),
]))

# s02 title
scenes.append(dict(id="s02", pad=1.0, vo_at=0.35, els=[
    el("title_ransom.png", 0.15, [900, 430], 120, -2, "stamp", "stamp", shadow=True),
    el("icon_tv.png", 1.0, [1580, 740], 62, 7, "drop", "pop", tape=(0, -4)),
    el("stamp_no_root.png", 3.6, [480, 820], 100, -6, "stamp", "stamp", shadow=False),
]))

# s03 developer mode
x_els = []
for i in range(1, 8):
    t0 = 1.7 + (i - 1) * 0.19
    x_els.append(el(f"txt_x{i}.png", t0, [1430, 560], 100, random.uniform(-6, 6), "pop", "click",
                    out=(t0 + 0.19 if i < 7 else None)))
scenes.append(dict(id="s03", pad=1.0, vo_at=0.35, els=[
    el("txt_step1.png", 0.0, [260, 140], 100, -3, "slide_left", "tape_rip"),
    el("txt_devmode.png", 0.35, [560, 290], 100, 1, "slide_left"),
    el("txt_build_path.png", 1.0, [700, 520], 100, -1, "slide_up", "typing"),
    *x_els,
    el("txt_usb_on.png", 3.4, [820, 800], 110, 2, "pop", "pop"),
]))

# s04 wifi + adb
dlg_c, dlg_s = [1430, 420], 72
ok_btn = [dlg_c[0] + (665 - 380) * dlg_s / 100, dlg_c[1] + (292 - 180) * dlg_s / 100]
scenes.append(dict(id="s04", pad=1.0, vo_at=0.35, els=[
    el("txt_step2.png", 0.0, [260, 140], 100, -3, "slide_left", "tape_rip"),
    el("txt_wifi.png", 0.35, [640, 290], 100, 1, "slide_left"),
    el("icon_laptop.png", 1.0, [460, 660], 80, -4, "slide_left"),
    el("icon_tv.png", 1.3, [1460, 700], 72, 5, "slide_right", tape=(0, -4)),
    stroke(wobbly_line([640, 660], [1290, 700], 9, 2), 2.0, 0.6, INKC, 7, "whoosh", dashed=True),
    el("txt_adb.png", 2.6, [960, 900], 100, -1, "slide_up", "typing"),
    el("dialog_allow.png", 4.3, dlg_c, dlg_s, 3, "pop", "pop"),
    stroke(scribble_ellipse(ok_btn, 75, 45, n=30), 5.2, 0.4, RED, 8, "marker_short"),
]))

# s05 backup
scenes.append(dict(id="s05", pad=1.0, vo_at=0.35, els=[
    el("txt_step3.png", 0.0, [260, 140], 100, -3, "slide_left", "tape_rip"),
    el("txt_backup.png", 0.35, [700, 290], 100, 1, "slide_left"),
    el("icon_folder.png", 0.9, [640, 640], 100, -4, "drop", "paper_rustle"),
    el("txt_backup_dir.png", 1.5, [660, 900], 100, 1, "slide_up", "typing"),
    el("stamp_backed_up.png", 2.5, [1360, 620], 110, 0, "stamp", "stamp", shadow=False),
]))

# s06 debloat list with strikes
pk_c, pk_s = [960, 650], 74
pw, ph = SIZES["paper_packages.png"]
x0 = pk_c[0] + (meta["package_line_x"][0] - pw / 2) * pk_s / 100
x1 = pk_c[0] + (meta["package_line_x"][1] - pw / 2) * pk_s / 100
strikes = []
for i, y in enumerate(meta["package_lines_y"]):
    yy = pk_c[1] + (y - 6 - ph / 2) * pk_s / 100
    strikes.append(stroke(wobbly_line([x0, yy], [x1, yy + random.uniform(-4, 4)]), 1.9 + i * 0.4, 0.3, RED, 7,
                          "marker_short"))
scenes.append(dict(id="s06", pad=1.0, vo_at=0.35, els=[
    el("txt_step4.png", 0.0, [260, 140], 100, -3, "slide_left", "tape_rip"),
    el("txt_junk.png", 0.35, [700, 250], 100, 1, "slide_left"),
    el("paper_packages.png", 0.8, pk_c, pk_s, -1.5, "slide_up", tape=(-300, -8)),
    *strikes,
    el("stamp_disabled.png", 6.6, [1180, 930], 72, 0, "stamp", "stamp", shadow=False),
]))

# s07 new home: figma, then the versions
vers = [("card_launcher_v1.png", "txt_v1.png"), ("card_domain_clash.png", "txt_v2.png"),
        ("card_spiderman.png", "txt_v3.png"), ("card_final.png", "txt_vfinal.png")]
ver_els = []
for i, (c, lbl) in enumerate(vers):
    x = 300 + i * 440
    t0 = 3.9 + i * 0.55
    sc = 42 if c != "card_final.png" else 38
    ver_els.append(el(c, t0, [x, 600 + (-18 if i % 2 else 18)], sc, random.uniform(-5, 5), "drop", "paper_slide"))
    ver_els.append(el(lbl, t0 + 0.25, [x, 840], 100, random.uniform(-4, 4), "pop", "pop"))
s07 = [
    el("txt_step5.png", 0.0, [260, 140], 100, -3, "slide_left", "tape_rip"),
    el("txt_newhome.png", 0.35, [700, 250], 100, 1, "slide_left"),
]
if "card_figma.png" in SIZES:
    s07.append(el("card_figma.png", 0.8, [960, 610], 78, -1.5, "slide_up", tape=(0, -6), out=3.6))
s07 += [
    el("txt_scratch.png", 1.5, [1460, 360], 100, 4, "pop", "pop", out=3.6),
    el("txt_tvos.png", 2.1, [520, 960], 100, -3, "pop", "pop", out=3.6),
    *ver_els,
]
scenes.append(dict(id="s07", pad=1.6, vo_at=0.35, els=s07))

# s08 liquid glass
fin_c, fin_s = [800, 610], 70
greet = card_pt("card_final.png", 1920, (330, 140), fin_c, fin_s)
scenes.append(dict(id="s08", pad=1.0, vo_at=0.35, els=[
    el("txt_step6.png", 0.0, [260, 140], 100, -3, "slide_left", "tape_rip"),
    el("txt_glass.png", 0.35, [640, 250], 100, 1, "slide_left"),
    el("card_final.png", 0.7, fin_c, fin_s, -1.5, "slide_up", tape=(-250, -6)),
    el("card_panel.png", 2.3, [1500, 420], 42, 4, "pop", "pop", tape=(0, -6)),
    el("txt_panel.png", 3.0, [1520, 650], 100, -3, "pop", "pop"),
    stroke(scribble_ellipse(greet, 210, 85), 4.0, 0.5, RED, 9, "marker"),
    el("card_avatar.png", 4.6, [1640, 860], 90, 6, "pop", "pop"),
    el("txt_myface.png", 5.1, [1300, 980], 100, -2, "pop", "pop"),
    stroke(arrow([1150, 975], [1530, 880]), 5.5, 0.45, RED, 7, "marker_short"),
]))

# s09 faster + restore
scenes.append(dict(id="s09", pad=1.0, vo_at=0.35, els=[
    el("txt_step7.png", 0.0, [260, 140], 100, -3, "slide_left", "tape_rip"),
    el("txt_faster.png", 0.35, [720, 250], 100, 1, "slide_left"),
    el("sticker_05x.png", 0.9, [520, 640], 100, -8, "pop", "pop"),
    el("txt_restore.png", 3.4, [1200, 600], 100, -2, "slide_right", "typing"),
    el("stamp_reversible.png", 4.6, [1250, 840], 110, 0, "stamp", "stamp", shadow=False),
]))

# s10 outro
scenes.append(dict(id="s10", pad=3.8, vo_at=0.6, els=[
    el("card_before_after.png", 0.15, [960, 450], 70, -1, "slide_up", tape=(0, -8)),
    el("txt_outro.png", 2.0, [960, 860], 90, -2, "stamp", "stamp"),
    el("logo_mkdziner.png", 3.2, [1660, 140], 42, 4, "pop", "pop"),
    el("txt_github.png", 3.8, [960, 1000], 82, 0, "slide_up", "paper_slide"),
]))

if REEL:
    import reel_layout
    random.seed(5)
    scenes = reel_layout.scenes(el, stroke, card_pt, scribble_ellipse, wobbly_line, arrow, SIZES, meta, RED, INKC)

# ------------------------------------------------------------------ timing
t = 0.0
cues = []          # (time, file, level_db)
for s in scenes:
    vo = os.path.join(VIDEO, "vo", s["id"] + ".wav")
    s["vo"] = vo
    s["vo_len"] = wav_seconds(vo)
    last = max([e["t"] + 0.6 for e in s["els"]] + [0])
    s["dur"] = round(max(s["vo_at"] + s["vo_len"] + s["pad"], last + 0.6), 2)
    s["start"] = round(t, 3)
    cues.append((s["start"] + s["vo_at"], vo, 0, "vo"))
    for e in s["els"]:
        if e.get("sfx"):
            cues.append((s["start"] + e["t"], os.path.join(VIDEO, "sfx", e["sfx"] + ".wav"), -6, "sfx"))
    if t > 0:
        cues.append((s["start"] - 0.25, os.path.join(VIDEO, "sfx", "whoosh.wav"), -8, "sfx"))
    t += s["dur"]
TOTAL = round(t, 2)
MUSIC = os.path.join(VIDEO, "music", "lofi_bed.wav")


# ------------------------------------------------------------------ After Effects script
def js(v):
    return json.dumps(v)


jsx = []
jsx.append(f"""// Built by build_project.py. Run in After Effects: File > Scripts > Run Script File...
// Creates the project "TV debloat - Vox collage" with one comp per scene and a MAIN comp.
(function () {{
app.beginUndoGroup("Vox collage build");
// Always a fresh project, so whatever is open stays untouched (AE asks to save unsaved changes first).
var proj = app.newProject();
if (!proj) return;
var ROOT = {js(VIDEO + '/')};
var W = {W}, H = {H}, FPS = {FPS};
var folders = {{}};
function folder(n) {{ if (!folders[n]) folders[n] = proj.items.addFolder(n); return folders[n]; }}
var cache = {{}};
function F(path, fold) {{
  if (cache[path]) return cache[path];
  var f = new File(path);
  if (!f.exists) throw new Error("Missing file: " + path);
  var it = proj.importFile(new ImportOptions(f));
  it.parentFolder = folder(fold || "assets");
  cache[path] = it; return it;
}}
function easeAll(p) {{
  for (var k = 1; k <= p.numKeys; k++) {{
    var e = new KeyframeEase(0, 70);
    try {{ p.setTemporalEaseAtKey(k, [e], [e]); }} catch (a) {{
      try {{ p.setTemporalEaseAtKey(k, [e, e], [e, e]); }} catch (b) {{
        try {{ p.setTemporalEaseAtKey(k, [e, e, e], [e, e, e]); }} catch (c) {{}} }} }}
  }}
}}
function shadow(L) {{
  var fx = L.property("ADBE Effect Parade").addProperty("ADBE Drop Shadow");
  try {{ fx.property(2).setValue(110); fx.property(3).setValue(135); fx.property(4).setValue(12); fx.property(5).setValue(22); }} catch (e) {{}}
}}
var JR = "posterizeTime(12); wiggle(1.4, 0.7)";
var JP = "posterizeTime(12); wiggle(1.4, 2.2)";
function img(comp, s) {{
  var L = comp.layers.add(F(ROOT + "assets/" + s.a));
  var tr = L.property("ADBE Transform Group");
  var P = tr.property("ADBE Position"), S = tr.property("ADBE Scale"), R = tr.property("ADBE Rotate Z"), O = tr.property("ADBE Opacity");
  var x = s.pos[0], y = s.pos[1], sc = s.scale, r = s.rot, t = s.t;
  R.setValue(r); S.setValue([sc, sc]); P.setValue([x, y]);
  if (s.anim == "slide_up") {{ P.setValueAtTime(t, [x, y + 900]); P.setValueAtTime(t + 0.3, [x, y - 14]); P.setValueAtTime(t + 0.42, [x, y]); }}
  else if (s.anim == "slide_left") {{ P.setValueAtTime(t, [x - 1400, y]); P.setValueAtTime(t + 0.3, [x + 14, y]); P.setValueAtTime(t + 0.42, [x, y]); }}
  else if (s.anim == "slide_right") {{ P.setValueAtTime(t, [x + 1400, y]); P.setValueAtTime(t + 0.3, [x - 14, y]); P.setValueAtTime(t + 0.42, [x, y]); }}
  else if (s.anim == "drop") {{ P.setValueAtTime(t, [x, y - 700]); P.setValueAtTime(t + 0.28, [x, y + 12]); P.setValueAtTime(t + 0.4, [x, y]);
                               R.setValueAtTime(t, r + 14); R.setValueAtTime(t + 0.4, r); }}
  else if (s.anim == "pop") {{ S.setValueAtTime(t, [0, 0]); S.setValueAtTime(t + 0.14, [sc * 1.12, sc * 1.12]); S.setValueAtTime(t + 0.26, [sc, sc]); }}
  else if (s.anim == "stamp") {{ S.setValueAtTime(t, [sc * 1.9, sc * 1.9]); S.setValueAtTime(t + 0.1, [sc * 0.94, sc * 0.94]); S.setValueAtTime(t + 0.18, [sc, sc]);
                                O.setValueAtTime(t, 0); O.setValueAtTime(t + 0.05, 100); }}
  else if (s.anim == "fade") {{ O.setValueAtTime(t, 0); O.setValueAtTime(t + 0.25, 100); }}
  easeAll(P); easeAll(S); easeAll(R);
  R.expression = JR;
  P.expression = JP;
  S.expression = "posterizeTime(12); value";
  if (s.shadow) shadow(L);
  L.inPoint = Math.max(0, t);
  if (s.out) L.outPoint = s.out;
  if (s.tape) {{
    var T = comp.layers.add(F(ROOT + "assets/tape_1.png"));
    T.moveBefore(L); T.parent = L;
    var src = L.source;
    T.property("ADBE Transform Group").property("ADBE Position").setValue([src.width / 2 + s.tape[0], 12 + s.tape[1]]);
    T.property("ADBE Transform Group").property("ADBE Rotate Z").setValue((Math.random() - 0.5) * 12);
    T.inPoint = L.inPoint; if (s.out) T.outPoint = s.out;
  }}
  return L;
}}
function strk(comp, s) {{
  var L = comp.layers.addShape(); L.name = "marker";
  L.property("ADBE Transform Group").property("ADBE Position").setValue([0, 0]);
  var root = L.property("ADBE Root Vectors Group");
  var g = root.addProperty("ADBE Vector Group");
  var gc = g.property("ADBE Vectors Group");
  var p = gc.addProperty("ADBE Vector Shape - Group");
  var sh = new Shape(); sh.vertices = s.pts; sh.closed = false;
  p.property("ADBE Vector Shape").setValue(sh);
  var st = gc.addProperty("ADBE Vector Graphic - Stroke");
  st.property("ADBE Vector Stroke Color").setValue(s.color);
  st.property("ADBE Vector Stroke Width").setValue(s.width);
  st.property("ADBE Vector Stroke Line Cap").setValue(2);
  st.property("ADBE Vector Stroke Line Join").setValue(2);
  if (s.dashed) {{
    try {{ var d = st.property("ADBE Vector Stroke Dashes");
      d.addProperty("ADBE Vector Stroke Dash 1").setValue(22); d.addProperty("ADBE Vector Stroke Gap 1").setValue(16); }} catch (e) {{}}
  }}
  var tr = root.addProperty("ADBE Vector Filter - Trim");
  var en = tr.property("ADBE Vector Trim End");
  en.setValueAtTime(s.t, 0); en.setValueAtTime(s.t + s.dur, 100);
  en.expression = "posterizeTime(12); value";
  L.inPoint = s.t; if (s.out) L.outPoint = s.out;
  return L;
}}
function sceneComp(name, dur, els) {{
  var c = proj.items.addComp(name, W, H, 1, dur, FPS);
  c.parentFolder = folder("scenes");
  var bg = c.layers.add(F(ROOT + "assets/bg_paper.png"));
  var bs = bg.property("ADBE Transform Group").property("ADBE Scale");
  bs.setValueAtTime(0, [{BG}, {BG}]); bs.setValueAtTime(dur, [{BG * 1.07:.1f}, {BG * 1.07:.1f}]);
  for (var i = 0; i < els.length; i++) {{
    var s = els[i];
    if (s.kind == "img") img(c, s); else strk(c, s);
  }}
  return c;
}}
var main = proj.items.addComp({js("MAIN - " + NAME)}, W, H, 1, {TOTAL}, FPS);
""")
for s in scenes:
    jsx.append(f"var c_{s['id']} = sceneComp({js(s['id'])}, {s['dur']}, {js(s['els'])});")
    jsx.append(f"var l_{s['id']} = main.layers.add(c_{s['id']}); l_{s['id']}.startTime = {s['start']};")
# paper wipes over every cut
for s in scenes[1:]:
    b = s["start"]
    jsx.append(f"""(function(){{ var L = main.layers.add(F(ROOT + "assets/bg_paper.png")); L.name = "wipe {s['id']}";
  var P = L.property("ADBE Transform Group").property("ADBE Position");
  L.property("ADBE Transform Group").property("ADBE Scale").setValue([{BG}, {BG}]);
  P.setValueAtTime({b - 0.25:.3f}, [{W/2 + 2300*BG/100:.0f}, {H/2:.0f}]); P.setValueAtTime({b:.3f}, [{W/2:.0f}, {H/2:.0f}]); P.setValueAtTime({b + 0.25:.3f}, [{W/2 - 2300*BG/100:.0f}, {H/2:.0f}]);
  P.expression = "posterizeTime(12); value"; shadow(L);
  L.inPoint = {b - 0.3:.3f}; L.outPoint = {b + 0.3:.3f}; }})();""")
jsx.append("""(function(){ var L = main.layers.add(F(ROOT + "assets/halftone.png")); L.blendingMode = BlendingMode.MULTIPLY;
  L.property("ADBE Transform Group").property("ADBE Opacity").setValue(55); L.name = "halftone";
  L.property("ADBE Transform Group").property("ADBE Position").setValue([W / 2, H / 2]);
  if (H > W) L.property("ADBE Transform Group").property("ADBE Rotate Z").setValue(90); })();""")
for (tm, path, db, kind) in cues:
    jsx.append(f"""(function(){{ var L = main.layers.add(F({js(path)}, {js(kind)})); L.startTime = {tm:.3f};
  try {{ L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([{db}, {db}]); }} catch (e) {{}} }})();""")
jsx.append(f"""(function(){{ var L = main.layers.add(F({js(MUSIC)}, "music")); L.startTime = 0; L.name = "music bed";
  try {{ L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-19, -19]); }} catch (e) {{}} }})();
var rq = proj.renderQueue.items.add(main);
var om = rq.outputModule(1);
var tpl = om.templates, chosen = null;
for (var i = 0; i < tpl.length; i++) {{ if (tpl[i].indexOf("H.264") === 0 && !chosen) chosen = tpl[i]; }}
if (chosen) om.applyTemplate(chosen);
om.file = new File(ROOT + "render/vox_tv_debloat{TAG}" + (chosen ? ".mp4" : ".mov"));
main.openInViewer();
proj.save(new File(ROOT + {js(NAME + ".aep")}));
app.endUndoGroup();
}})();
""")
with open(os.path.join(HERE, f"build_vox{TAG}.jsx"), "w") as f:
    f.write("\n".join(jsx))


# ------------------------------------------------------------------ Premiere Pro sequence (FCP 7 XML)
def frames(sec):
    return int(round(sec * FPS))


def url(p):
    return "file://localhost" + p.replace(" ", "%20")


fid = [0]


def file_el(path, dur_s, video=False):
    fid[0] += 1
    name = os.path.basename(path)
    media = (f"<video><samplecharacteristics><width>{W}</width><height>{H}</height></samplecharacteristics></video>"
             if video else "")
    return (f'<file id="file-{fid[0]}"><name>{name}</name><pathurl>{url(path)}</pathurl>'
            f"<rate><timebase>{FPS}</timebase><ntsc>FALSE</ntsc></rate><duration>{frames(dur_s)}</duration>"
            f"<media>{media}<audio><samplecharacteristics><depth>16</depth><samplerate>44100</samplerate>"
            f"</samplecharacteristics><channelcount>2</channelcount></audio></media></file>")


def clip(path, start_s, dur_s, track_kind, video=False):
    s, e = frames(start_s), frames(start_s + dur_s)
    return (f"<clipitem><name>{os.path.basename(path)}</name><duration>{frames(dur_s)}</duration>"
            f"<rate><timebase>{FPS}</timebase><ntsc>FALSE</ntsc></rate><start>{s}</start><end>{e}</end>"
            f"<in>0</in><out>{e - s}</out>{file_el(path, dur_s, video)}"
            + ("" if video else "<sourcetrack><mediatype>audio</mediatype><trackindex>1</trackindex></sourcetrack>")
            + "</clipitem>")


render = os.path.join(VIDEO, "render", f"vox_tv_debloat{TAG}.mp4")
vo_clips = "".join(clip(p, tm, wav_seconds(p), "a") for tm, p, db, k in cues if k == "vo")
sfx_items = [(tm, p) for tm, p, db, k in cues if k == "sfx"]
# SFX on two tracks so overlapping effects never collide
sfx_tracks = [[], []]
ends = [0.0, 0.0]
for tm, p in sorted(sfx_items):
    d = wav_seconds(p)
    k = 0 if ends[0] <= tm else 1
    sfx_tracks[k].append(clip(p, tm, d, "a"))
    ends[k] = tm + d
xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE xmeml>
<xmeml version="5">
<sequence>
<name>{NAME}</name>
<duration>{frames(TOTAL)}</duration>
<rate><timebase>{FPS}</timebase><ntsc>FALSE</ntsc></rate>
<media>
<video><format><samplecharacteristics><width>{W}</width><height>{H}</height>
<rate><timebase>{FPS}</timebase><ntsc>FALSE</ntsc></rate></samplecharacteristics></format>
<track>{clip(render, 0, TOTAL, "v", video=True)}</track></video>
<audio>
<track>{vo_clips}</track>
<track>{''.join(sfx_tracks[0])}</track>
<track>{''.join(sfx_tracks[1])}</track>
<track>{clip(MUSIC, 0, min(TOTAL, wav_seconds(MUSIC)), "a")}</track>
</audio>
</media>
</sequence>
</xmeml>
"""
with open(os.path.join(VIDEO, f"premiere_sequence{TAG}.xml"), "w") as f:
    f.write(xml)

timeline = [{k: s[k] for k in ("id", "start", "dur", "vo_at")} for s in scenes]
json.dump({"total": TOTAL, "scenes": timeline}, open(os.path.join(VIDEO, f"timeline{TAG}.json"), "w"), indent=1)
print("total", TOTAL, "s;", len(cues), "audio cues; jsx + xml written")
