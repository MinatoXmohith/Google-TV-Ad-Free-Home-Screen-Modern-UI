"""Instagram Reel (1080x1920) storyboard: the same scenes as the landscape cut, re-composed vertically.

Content stays inside Instagram's safe area: below y=260 (profile row) and above y=1480 (caption and
buttons), and within x=60..1020.
"""
import random


def scenes(el, stroke, card_pt, scribble_ellipse, wobbly_line, arrow, SIZES, meta, RED, INKC):
    out = []

    def step(n):
        return el(f"txt_step{n}.png", 0.0, [200, 330], 100, -3, "slide_left", "tape_rip")

    # s01 hook
    bc, bs = [540, 780], 84
    spons = card_pt("card_before.png", 1280, (230, 282), bc, bs)
    out.append(dict(id="s01", pad=1.0, vo_at=0.4, els=[
        el("txt_ad_before.png", 0.0, [470, 420], 112, -3, "slide_left", "paper_slide"),
        el("card_before.png", 0.1, bc, bs, -2, "slide_up", tape=(0, -6)),
        stroke(scribble_ellipse(spons, 215, 80), 1.0, 0.55),
        el("txt_sponsored.png", 1.7, [600, 1240], 105, 5, "stamp", "stamp"),
    ]))

    # s02 title
    out.append(dict(id="s02", pad=1.0, vo_at=0.35, els=[
        el("title_ransom.png", 0.15, [540, 700], 70, -2, "stamp", "stamp"),
        el("icon_tv.png", 1.0, [780, 1100], 64, 7, "drop", "pop", tape=(0, -4)),
        el("stamp_no_root.png", 3.6, [330, 1240], 105, -6, "stamp", "stamp", shadow=False),
    ]))

    # s03 developer mode
    xs = []
    for i in range(1, 8):
        t0 = 1.7 + (i - 1) * 0.19
        xs.append(el(f"txt_x{i}.png", t0, [540, 920], 135, random.uniform(-6, 6), "pop", "click",
                     out=(t0 + 0.19 if i < 7 else None)))
    out.append(dict(id="s03", pad=1.0, vo_at=0.35, els=[
        step(1),
        el("txt_devmode.png", 0.35, [480, 460], 100, 1, "slide_left"),
        el("txt_build_path.png", 1.0, [540, 660], 100, -1, "slide_up", "typing"),
        *xs,
        el("txt_usb_on.png", 3.4, [540, 1220], 120, 2, "pop", "pop"),
    ]))

    # s04 wifi + adb
    dc, ds = [540, 1290], 92
    ok_btn = [dc[0] + (665 - 380) * ds / 100, dc[1] + (292 - 180) * ds / 100]
    out.append(dict(id="s04", pad=1.0, vo_at=0.35, els=[
        step(2),
        el("txt_wifi.png", 0.35, [530, 460], 88, 1, "slide_left"),
        el("icon_laptop.png", 1.0, [290, 760], 66, -4, "slide_left"),
        el("icon_tv.png", 1.3, [800, 780], 62, 5, "slide_right", tape=(0, -4)),
        stroke(wobbly_line([430, 770], [660, 790], 7, 2), 2.0, 0.6, INKC, 7, "whoosh", dashed=True),
        el("txt_adb.png", 2.6, [540, 1010], 100, -1, "slide_up", "typing"),
        el("dialog_allow.png", 4.3, dc, ds, 3, "pop", "pop"),
        stroke(scribble_ellipse(ok_btn, 90, 52, n=30), 5.2, 0.4, RED, 8, "marker_short"),
    ]))

    # s05 backup
    out.append(dict(id="s05", pad=1.0, vo_at=0.35, els=[
        step(3),
        el("txt_backup.png", 0.35, [540, 460], 92, 1, "slide_left"),
        el("icon_folder.png", 0.9, [540, 760], 110, -4, "drop", "paper_rustle"),
        el("txt_backup_dir.png", 1.5, [540, 1010], 112, 1, "slide_up", "typing"),
        el("stamp_backed_up.png", 2.5, [560, 1250], 135, 0, "stamp", "stamp", shadow=False),
    ]))

    # s06 debloat list
    pc, ps = [540, 890], 82
    pw, ph = SIZES["paper_packages.png"]
    x0 = pc[0] + (meta["package_line_x"][0] - pw / 2) * ps / 100
    x1 = pc[0] + (meta["package_line_x"][1] - pw / 2) * ps / 100
    strikes = []
    for i, y in enumerate(meta["package_lines_y"]):
        yy = pc[1] + (y - 6 - ph / 2) * ps / 100
        strikes.append(stroke(wobbly_line([x0, yy], [x1, yy + random.uniform(-4, 4)]), 1.9 + i * 0.4, 0.3, RED, 7,
                              "marker_short"))
    out.append(dict(id="s06", pad=1.0, vo_at=0.35, els=[
        step(4),
        el("txt_junk.png", 0.35, [500, 460], 100, 1, "slide_left"),
        el("paper_packages.png", 0.8, pc, ps, -1.5, "slide_up", tape=(-300, -8)),
        *strikes,
        el("stamp_disabled.png", 6.6, [560, 1330], 100, 0, "stamp", "stamp", shadow=False),
    ]))

    # s07 new home: figma, then the versions in a 2x2 grid
    vers = [("card_launcher_v1.png", "txt_v1.png"), ("card_domain_clash.png", "txt_v2.png"),
            ("card_spiderman.png", "txt_v3.png"), ("card_final.png", "txt_vfinal.png")]
    grid = [[290, 720], [790, 760], [290, 1110], [790, 1150]]
    vs = []
    for i, (c, lbl) in enumerate(vers):
        x, y = grid[i]
        t0 = 3.9 + i * 0.55
        sc = 48 if c != "card_final.png" else 40
        vs.append(el(c, t0, [x, y], sc, random.uniform(-5, 5), "drop", "paper_slide"))
        vs.append(el(lbl, t0 + 0.25, [x, y + 175], 110, random.uniform(-4, 4), "pop", "pop"))
    s07 = [step(5), el("txt_newhome.png", 0.35, [510, 460], 100, 1, "slide_left")]
    if "card_figma.png" in SIZES:
        s07.append(el("card_figma.png", 0.8, [540, 860], 80, -1.5, "slide_up", tape=(0, -6), out=3.6))
    s07 += [
        el("txt_scratch.png", 1.5, [640, 640], 100, 4, "pop", "pop", out=3.6),
        el("txt_tvos.png", 2.1, [420, 1100], 105, -3, "pop", "pop", out=3.6),
        *vs,
    ]
    out.append(dict(id="s07", pad=1.6, vo_at=0.35, els=s07))

    # s08 liquid glass
    fc, fs = [540, 840], 86
    greet = card_pt("card_final.png", 1920, (330, 140), fc, fs)
    out.append(dict(id="s08", pad=1.0, vo_at=0.35, els=[
        step(6),
        el("txt_glass.png", 0.35, [400, 460], 100, 1, "slide_left"),
        el("card_final.png", 0.7, fc, fs, -1.5, "slide_up", tape=(-250, -6)),
        stroke(scribble_ellipse(greet, 240, 95), 1.9, 0.5, RED, 9, "marker"),
        el("card_panel.png", 2.6, [740, 1215], 46, 4, "pop", "pop", tape=(0, -6)),
        el("txt_panel.png", 3.2, [780, 1415], 110, -3, "pop", "pop"),
        el("card_avatar.png", 4.4, [250, 1210], 80, 6, "pop", "pop"),
        el("txt_myface.png", 4.9, [290, 1415], 100, -2, "pop", "pop"),
    ]))

    # s09 faster + restore
    out.append(dict(id="s09", pad=1.0, vo_at=0.35, els=[
        step(7),
        el("txt_faster.png", 0.35, [540, 460], 96, 1, "slide_left"),
        el("sticker_05x.png", 0.9, [320, 770], 110, -8, "pop", "pop"),
        el("txt_restore.png", 3.4, [560, 1030], 100, -2, "slide_right", "typing"),
        el("stamp_reversible.png", 4.6, [580, 1270], 130, 0, "stamp", "stamp", shadow=False),
    ]))

    # s10 outro
    out.append(dict(id="s10", pad=3.8, vo_at=0.6, els=[
        el("logo_mkdziner.png", 3.2, [540, 400], 62, 4, "pop", "pop"),
        el("card_before_after.png", 0.15, [540, 780], 76, -1, "slide_up", tape=(0, -8)),
        el("txt_outro.png", 2.0, [540, 1120], 80, -2, "stamp", "stamp"),
        el("txt_github.png", 3.8, [540, 1300], 70, 0, "slide_up", "paper_slide"),
    ]))
    return out
