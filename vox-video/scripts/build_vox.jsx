// Built by build_project.py. Run in After Effects: File > Scripts > Run Script File...
// Creates the project "TV debloat - Vox collage" with one comp per scene and a MAIN comp.
(function () {
app.beginUndoGroup("Vox collage build");
// Always a fresh project, so whatever is open stays untouched (AE asks to save unsaved changes first).
var proj = app.newProject();
if (!proj) return;
var ROOT = "/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/";
var W = 1920, H = 1080, FPS = 24;
var folders = {};
function folder(n) { if (!folders[n]) folders[n] = proj.items.addFolder(n); return folders[n]; }
var cache = {};
function F(path, fold) {
  if (cache[path]) return cache[path];
  var f = new File(path);
  if (!f.exists) throw new Error("Missing file: " + path);
  var it = proj.importFile(new ImportOptions(f));
  it.parentFolder = folder(fold || "assets");
  cache[path] = it; return it;
}
function easeAll(p) {
  for (var k = 1; k <= p.numKeys; k++) {
    var e = new KeyframeEase(0, 70);
    try { p.setTemporalEaseAtKey(k, [e], [e]); } catch (a) {
      try { p.setTemporalEaseAtKey(k, [e, e], [e, e]); } catch (b) {
        try { p.setTemporalEaseAtKey(k, [e, e, e], [e, e, e]); } catch (c) {} } }
  }
}
function shadow(L) {
  var fx = L.property("ADBE Effect Parade").addProperty("ADBE Drop Shadow");
  try { fx.property(2).setValue(110); fx.property(3).setValue(135); fx.property(4).setValue(12); fx.property(5).setValue(22); } catch (e) {}
}
var JR = "posterizeTime(12); wiggle(1.4, 0.7)";
var JP = "posterizeTime(12); wiggle(1.4, 2.2)";
function img(comp, s) {
  var L = comp.layers.add(F(ROOT + "assets/" + s.a));
  var tr = L.property("ADBE Transform Group");
  var P = tr.property("ADBE Position"), S = tr.property("ADBE Scale"), R = tr.property("ADBE Rotate Z"), O = tr.property("ADBE Opacity");
  var x = s.pos[0], y = s.pos[1], sc = s.scale, r = s.rot, t = s.t;
  R.setValue(r); S.setValue([sc, sc]); P.setValue([x, y]);
  if (s.anim == "slide_up") { P.setValueAtTime(t, [x, y + 900]); P.setValueAtTime(t + 0.3, [x, y - 14]); P.setValueAtTime(t + 0.42, [x, y]); }
  else if (s.anim == "slide_left") { P.setValueAtTime(t, [x - 1400, y]); P.setValueAtTime(t + 0.3, [x + 14, y]); P.setValueAtTime(t + 0.42, [x, y]); }
  else if (s.anim == "slide_right") { P.setValueAtTime(t, [x + 1400, y]); P.setValueAtTime(t + 0.3, [x - 14, y]); P.setValueAtTime(t + 0.42, [x, y]); }
  else if (s.anim == "drop") { P.setValueAtTime(t, [x, y - 700]); P.setValueAtTime(t + 0.28, [x, y + 12]); P.setValueAtTime(t + 0.4, [x, y]);
                               R.setValueAtTime(t, r + 14); R.setValueAtTime(t + 0.4, r); }
  else if (s.anim == "pop") { S.setValueAtTime(t, [0, 0]); S.setValueAtTime(t + 0.14, [sc * 1.12, sc * 1.12]); S.setValueAtTime(t + 0.26, [sc, sc]); }
  else if (s.anim == "stamp") { S.setValueAtTime(t, [sc * 1.9, sc * 1.9]); S.setValueAtTime(t + 0.1, [sc * 0.94, sc * 0.94]); S.setValueAtTime(t + 0.18, [sc, sc]);
                                O.setValueAtTime(t, 0); O.setValueAtTime(t + 0.05, 100); }
  else if (s.anim == "fade") { O.setValueAtTime(t, 0); O.setValueAtTime(t + 0.25, 100); }
  easeAll(P); easeAll(S); easeAll(R);
  R.expression = JR;
  P.expression = JP;
  S.expression = "posterizeTime(12); value";
  if (s.shadow) shadow(L);
  L.inPoint = Math.max(0, t);
  if (s.out) L.outPoint = s.out;
  if (s.tape) {
    var T = comp.layers.add(F(ROOT + "assets/tape_1.png"));
    T.moveBefore(L); T.parent = L;
    var src = L.source;
    T.property("ADBE Transform Group").property("ADBE Position").setValue([src.width / 2 + s.tape[0], 12 + s.tape[1]]);
    T.property("ADBE Transform Group").property("ADBE Rotate Z").setValue((Math.random() - 0.5) * 12);
    T.inPoint = L.inPoint; if (s.out) T.outPoint = s.out;
  }
  return L;
}
function strk(comp, s) {
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
  if (s.dashed) {
    try { var d = st.property("ADBE Vector Stroke Dashes");
      d.addProperty("ADBE Vector Stroke Dash 1").setValue(22); d.addProperty("ADBE Vector Stroke Gap 1").setValue(16); } catch (e) {}
  }
  var tr = root.addProperty("ADBE Vector Filter - Trim");
  var en = tr.property("ADBE Vector Trim End");
  en.setValueAtTime(s.t, 0); en.setValueAtTime(s.t + s.dur, 100);
  en.expression = "posterizeTime(12); value";
  L.inPoint = s.t; if (s.out) L.outPoint = s.out;
  return L;
}
function sceneComp(name, dur, els) {
  var c = proj.items.addComp(name, W, H, 1, dur, FPS);
  c.parentFolder = folder("scenes");
  var bg = c.layers.add(F(ROOT + "assets/bg_paper.png"));
  var bs = bg.property("ADBE Transform Group").property("ADBE Scale");
  bs.setValueAtTime(0, [100, 100]); bs.setValueAtTime(dur, [107.0, 107.0]);
  for (var i = 0; i < els.length; i++) {
    var s = els[i];
    if (s.kind == "img") img(c, s); else strk(c, s);
  }
  return c;
}
var main = proj.items.addComp("MAIN - TV debloat - Vox collage", W, H, 1, 71.67, FPS);

var c_s01 = sceneComp("s01", 4.81, [{"kind": "img", "a": "card_before.png", "t": 0.1, "pos": [960, 470], "scale": 72, "rot": -2, "anim": "slide_up", "sfx": "paper_slide", "tape": [0, -6], "out": null, "shadow": true}, {"kind": "stroke", "pts": [[636.1, 364.1], [665.7, 356.3], [698.2, 352.5], [730.9, 348.8], [763.3, 348.3], [790.6, 352.8], [817.3, 356.8], [849.1, 359.0], [863.7, 369.0], [879.0, 378.2], [899.3, 386.9], [897.8, 399.8], [902.1, 411.9], [891.2, 424.7], [881.5, 437.5], [859.3, 448.9], [842.7, 461.3], [818.6, 472.5], [787.1, 480.1], [756.3, 488.2], [722.7, 493.2], [689.5, 493.3], [655.0, 497.7], [623.6, 495.6], [596.3, 490.7], [573.0, 484.1], [542.5, 480.0], [529.3, 469.4], [513.9, 459.4], [505.1, 447.7], [506.3, 434.7], [508.7, 421.5], [526.1, 408.6], [537.6, 395.3], [562.5, 384.1], [583.9, 371.7], [614.1, 362.2], [649.6, 357.7], [682.2, 351.8], [715.8, 347.8]], "t": 1.0, "dur": 0.55, "color": [0.84, 0.19, 0.15], "width": 9, "sfx": "marker", "dashed": false, "out": null}, {"kind": "img", "a": "txt_sponsored.png", "t": 1.7, "pos": [1430, 860], "scale": 85, "rot": 5, "anim": "stamp", "sfx": "stamp", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_ad_before.png", "t": 2.4, "pos": [560, 900], "scale": 100, "rot": -3, "anim": "slide_left", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}]);
var l_s01 = main.layers.add(c_s01); l_s01.startTime = 0.0;
var c_s02 = sceneComp("s02", 6.65, [{"kind": "img", "a": "title_ransom.png", "t": 0.15, "pos": [900, 430], "scale": 120, "rot": -2, "anim": "stamp", "sfx": "stamp", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "icon_tv.png", "t": 1.0, "pos": [1580, 740], "scale": 62, "rot": 7, "anim": "drop", "sfx": "pop", "tape": [0, -4], "out": null, "shadow": true}, {"kind": "img", "a": "stamp_no_root.png", "t": 3.6, "pos": [480, 820], "scale": 100, "rot": -6, "anim": "stamp", "sfx": "stamp", "tape": null, "out": null, "shadow": false}]);
var l_s02 = main.layers.add(c_s02); l_s02.startTime = 4.81;
var c_s03 = sceneComp("s03", 6.13, [{"kind": "img", "a": "txt_step1.png", "t": 0.0, "pos": [260, 140], "scale": 100, "rot": -3, "anim": "slide_left", "sfx": "tape_rip", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_devmode.png", "t": 0.35, "pos": [560, 290], "scale": 100, "rot": 1, "anim": "slide_left", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_build_path.png", "t": 1.0, "pos": [700, 520], "scale": 100, "rot": -1, "anim": "slide_up", "sfx": "typing", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_x1.png", "t": 1.7, "pos": [1430, 560], "scale": 100, "rot": 5.585761666778435, "anim": "pop", "sfx": "click", "tape": null, "out": 1.89, "shadow": true}, {"kind": "img", "a": "txt_x2.png", "t": 1.89, "pos": [1430, 560], "scale": 100, "rot": -0.7660576004708481, "anim": "pop", "sfx": "click", "tape": null, "out": 2.08, "shadow": true}, {"kind": "img", "a": "txt_x3.png", "t": 2.08, "pos": [1430, 560], "scale": 100, "rot": 1.519779490401648, "anim": "pop", "sfx": "click", "tape": null, "out": 2.27, "shadow": true}, {"kind": "img", "a": "txt_x4.png", "t": 2.27, "pos": [1430, 560], "scale": 100, "rot": -2.3876856188939355, "anim": "pop", "sfx": "click", "tape": null, "out": 2.46, "shadow": true}, {"kind": "img", "a": "txt_x5.png", "t": 2.46, "pos": [1430, 560], "scale": 100, "rot": 0.08691580594871429, "anim": "pop", "sfx": "click", "tape": null, "out": 2.65, "shadow": true}, {"kind": "img", "a": "txt_x6.png", "t": 2.65, "pos": [1430, 560], "scale": 100, "rot": -1.369604893861169, "anim": "pop", "sfx": "click", "tape": null, "out": 2.84, "shadow": true}, {"kind": "img", "a": "txt_x7.png", "t": 2.84, "pos": [1430, 560], "scale": 100, "rot": -1.7890741347578398, "anim": "pop", "sfx": "click", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_usb_on.png", "t": 3.4, "pos": [820, 800], "scale": 110, "rot": 2, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}]);
var l_s03 = main.layers.add(c_s03); l_s03.startTime = 11.46;
var c_s04 = sceneComp("s04", 7.98, [{"kind": "img", "a": "txt_step2.png", "t": 0.0, "pos": [260, 140], "scale": 100, "rot": -3, "anim": "slide_left", "sfx": "tape_rip", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_wifi.png", "t": 0.35, "pos": [640, 290], "scale": 100, "rot": 1, "anim": "slide_left", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "icon_laptop.png", "t": 1.0, "pos": [460, 660], "scale": 80, "rot": -4, "anim": "slide_left", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "icon_tv.png", "t": 1.3, "pos": [1460, 700], "scale": 72, "rot": 5, "anim": "slide_right", "sfx": "paper_slide", "tape": [0, -4], "out": null, "shadow": true}, {"kind": "stroke", "pts": [[640.2, 660.0], [722.1, 665.7], [803.4, 671.4], [884.7, 675.7], [964.3, 681.4], [1047.2, 686.6], [1127.6, 690.9], [1208.2, 696.3], [1290.1, 700.0]], "t": 2.0, "dur": 0.6, "color": [0.11, 0.1, 0.09], "width": 7, "sfx": "whoosh", "dashed": true, "out": null}, {"kind": "img", "a": "txt_adb.png", "t": 2.6, "pos": [960, 900], "scale": 100, "rot": -1, "anim": "slide_up", "sfx": "typing", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "dialog_allow.png", "t": 4.3, "pos": [1430, 420], "scale": 72, "rot": 3, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}, {"kind": "stroke", "pts": [[1606.2, 462.5], [1621.4, 455.9], [1639.2, 453.5], [1655.6, 456.9], [1673.1, 457.7], [1686.1, 464.0], [1696.4, 471.6], [1705.1, 480.0], [1711.9, 489.5], [1712.8, 500.3], [1705.0, 510.6], [1700.2, 521.2], [1687.0, 529.2], [1675.3, 538.2], [1658.3, 542.8], [1641.4, 547.8], [1623.0, 549.0], [1606.1, 545.9], [1588.9, 543.2], [1577.7, 535.1], [1568.6, 526.6], [1559.4, 517.8], [1559.7, 506.9], [1560.2, 496.3], [1564.7, 485.5], [1573.2, 475.2], [1587.4, 467.5], [1602.7, 461.0], [1618.6, 454.0], [1637.1, 453.3]], "t": 5.2, "dur": 0.4, "color": [0.84, 0.19, 0.15], "width": 8, "sfx": "marker_short", "dashed": false, "out": null}]);
var l_s04 = main.layers.add(c_s04); l_s04.startTime = 17.59;
var c_s05 = sceneComp("s05", 5.28, [{"kind": "img", "a": "txt_step3.png", "t": 0.0, "pos": [260, 140], "scale": 100, "rot": -3, "anim": "slide_left", "sfx": "tape_rip", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_backup.png", "t": 0.35, "pos": [700, 290], "scale": 100, "rot": 1, "anim": "slide_left", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "icon_folder.png", "t": 0.9, "pos": [640, 640], "scale": 100, "rot": -4, "anim": "drop", "sfx": "paper_rustle", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_backup_dir.png", "t": 1.5, "pos": [660, 900], "scale": 100, "rot": 1, "anim": "slide_up", "sfx": "typing", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "stamp_backed_up.png", "t": 2.5, "pos": [1360, 620], "scale": 110, "rot": 0, "anim": "stamp", "sfx": "stamp", "tape": null, "out": null, "shadow": false}]);
var l_s05 = main.layers.add(c_s05); l_s05.startTime = 25.57;
var c_s06 = sceneComp("s06", 8.83, [{"kind": "img", "a": "txt_step4.png", "t": 0.0, "pos": [260, 140], "scale": 100, "rot": -3, "anim": "slide_left", "sfx": "tape_rip", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_junk.png", "t": 0.35, "pos": [700, 250], "scale": 100, "rot": 1, "anim": "slide_left", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "paper_packages.png", "t": 0.8, "pos": [960, 650], "scale": 74, "rot": -1.5, "anim": "slide_up", "sfx": "paper_slide", "tape": [-300, -8], "out": null, "shadow": true}, {"kind": "stroke", "pts": [[586.4, 433.9], [710.8, 434.7], [836.5, 435.8], [961.6, 436.6], [1087.7, 436.4], [1212.0, 438.5], [1336.9, 437.6]], "t": 1.9, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "stroke", "pts": [[585.6, 479.8], [709.9, 479.8], [836.3, 477.7], [961.7, 482.6], [1085.9, 483.2], [1212.0, 484.2], [1337.1, 483.6]], "t": 2.3, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "stroke", "pts": [[584.6, 525.7], [711.2, 529.2], [835.7, 526.0], [961.7, 525.4], [1086.5, 525.6], [1211.8, 527.9], [1337.0, 527.6]], "t": 2.7, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "stroke", "pts": [[584.6, 571.6], [711.3, 570.6], [835.6, 574.4], [961.0, 570.5], [1086.7, 574.4], [1211.3, 572.1], [1337.1, 573.7]], "t": 3.1, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "stroke", "pts": [[586.3, 617.4], [710.5, 618.4], [836.9, 616.9], [960.9, 614.5], [1086.8, 614.9], [1212.7, 619.4], [1336.8, 616.9]], "t": 3.5, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "stroke", "pts": [[585.8, 663.3], [710.6, 661.1], [835.8, 666.2], [961.0, 663.5], [1086.6, 664.4], [1211.9, 668.3], [1336.7, 665.8]], "t": 3.9, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "stroke", "pts": [[586.3, 709.2], [710.7, 712.9], [837.0, 708.4], [962.0, 713.3], [1087.1, 711.7], [1211.7, 711.0], [1336.9, 712.7]], "t": 4.300000000000001, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "stroke", "pts": [[585.1, 755.1], [710.0, 758.0], [836.6, 758.3], [962.3, 758.2], [1086.9, 752.1], [1212.6, 753.4], [1337.0, 755.8]], "t": 4.7, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "stroke", "pts": [[585.4, 801.0], [711.1, 799.9], [835.7, 803.6], [961.4, 803.0], [1086.5, 799.0], [1212.2, 803.3], [1336.7, 801.2]], "t": 5.1, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "stroke", "pts": [[586.2, 846.8], [709.9, 848.3], [836.9, 844.8], [961.0, 846.9], [1086.8, 848.6], [1212.0, 851.6], [1336.4, 850.2]], "t": 5.5, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "stroke", "pts": [[584.8, 892.7], [711.8, 894.7], [835.3, 891.7], [961.1, 889.9], [1086.5, 891.8], [1212.3, 889.3], [1336.8, 889.7]], "t": 5.9, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "img", "a": "stamp_disabled.png", "t": 6.6, "pos": [1180, 930], "scale": 72, "rot": 0, "anim": "stamp", "sfx": "stamp", "tape": null, "out": null, "shadow": false}]);
var l_s06 = main.layers.add(c_s06); l_s06.startTime = 30.85;
var c_s07 = sceneComp("s07", 8.9, [{"kind": "img", "a": "txt_step5.png", "t": 0.0, "pos": [260, 140], "scale": 100, "rot": -3, "anim": "slide_left", "sfx": "tape_rip", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_newhome.png", "t": 0.35, "pos": [700, 250], "scale": 100, "rot": 1, "anim": "slide_left", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "card_figma.png", "t": 0.8, "pos": [960, 610], "scale": 78, "rot": -1.5, "anim": "slide_up", "sfx": "paper_slide", "tape": [0, -6], "out": 3.6, "shadow": true}, {"kind": "img", "a": "txt_scratch.png", "t": 1.5, "pos": [1460, 360], "scale": 100, "rot": 4, "anim": "pop", "sfx": "pop", "tape": null, "out": 3.6, "shadow": true}, {"kind": "img", "a": "txt_tvos.png", "t": 2.1, "pos": [520, 960], "scale": 100, "rot": -3, "anim": "pop", "sfx": "pop", "tape": null, "out": 3.6, "shadow": true}, {"kind": "img", "a": "card_launcher_v1.png", "t": 3.9, "pos": [300, 618], "scale": 42, "rot": -3.7624497616581554, "anim": "drop", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_v1.png", "t": 4.15, "pos": [300, 840], "scale": 100, "rot": 0.44420754930310924, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "card_domain_clash.png", "t": 4.45, "pos": [740, 582], "scale": 42, "rot": 2.160428220260103, "anim": "drop", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_v2.png", "t": 4.7, "pos": [740, 840], "scale": 100, "rot": -0.9580955031339702, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "card_spiderman.png", "t": 5.0, "pos": [1180, 618], "scale": 42, "rot": -4.200987699126143, "anim": "drop", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_v3.png", "t": 5.25, "pos": [1180, 840], "scale": 100, "rot": -2.5715508435391454, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "card_final.png", "t": 5.55, "pos": [1620, 582], "scale": 38, "rot": -1.2672542437301693, "anim": "drop", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_vfinal.png", "t": 5.8, "pos": [1620, 840], "scale": 100, "rot": 0.8354789406222807, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}]);
var l_s07 = main.layers.add(c_s07); l_s07.startTime = 39.68;
var c_s08 = sceneComp("s08", 9.09, [{"kind": "img", "a": "txt_step6.png", "t": 0.0, "pos": [260, 140], "scale": 100, "rot": -3, "anim": "slide_left", "sfx": "tape_rip", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_glass.png", "t": 0.35, "pos": [640, 250], "scale": 100, "rot": 1, "anim": "slide_left", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "card_final.png", "t": 0.7, "pos": [800, 610], "scale": 70, "rot": -1.5, "anim": "slide_up", "sfx": "paper_slide", "tape": [-250, -6], "out": null, "shadow": true}, {"kind": "img", "a": "card_panel.png", "t": 2.3, "pos": [1500, 420], "scale": 42, "rot": 4, "anim": "pop", "sfx": "pop", "tape": [0, -6], "out": null, "shadow": true}, {"kind": "img", "a": "txt_panel.png", "t": 3.0, "pos": [1520, 650], "scale": 100, "rot": -3, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}, {"kind": "stroke", "pts": [[466.0, 376.1], [502.2, 370.7], [537.3, 363.0], [573.8, 361.3], [608.7, 362.4], [641.9, 365.2], [673.6, 369.4], [703.1, 375.8], [722.9, 386.7], [744.1, 397.1], [752.9, 411.0], [755.6, 425.5], [759.5, 440.0], [755.1, 455.4], [733.9, 469.9], [720.2, 485.0], [696.6, 498.5], [672.3, 512.5], [639.9, 523.4], [602.1, 528.9], [566.6, 537.8], [528.7, 540.6], [493.3, 538.2], [457.5, 537.5], [427.8, 531.0], [392.5, 527.8], [369.2, 517.6], [346.6, 506.9], [333.9, 493.3], [328.0, 478.4], [325.9, 463.0], [333.8, 447.1], [351.7, 432.0], [363.0, 416.1], [392.5, 403.7], [418.3, 390.7], [445.3, 376.8], [484.1, 371.5], [520.0, 364.8], [557.0, 360.7]], "t": 4.0, "dur": 0.5, "color": [0.84, 0.19, 0.15], "width": 9, "sfx": "marker", "dashed": false, "out": null}, {"kind": "img", "a": "card_avatar.png", "t": 4.6, "pos": [1640, 860], "scale": 90, "rot": 6, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_myface.png", "t": 5.1, "pos": [1300, 980], "scale": 100, "rot": -2, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}, {"kind": "stroke", "pts": [[1150.0, 975.0], [1181.3, 976.0], [1212.3, 975.5], [1242.9, 973.7], [1273.1, 970.6], [1303.0, 966.0], [1332.6, 960.1], [1361.8, 952.8], [1390.7, 944.1], [1419.3, 934.0], [1447.5, 922.6], [1475.3, 909.8], [1502.8, 895.6], [1530.0, 880.0], [1516.4, 902.2], [1530, 880], [1504.0, 880.5]], "t": 5.5, "dur": 0.45, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}]);
var l_s08 = main.layers.add(c_s08); l_s08.startTime = 48.58;
var c_s09 = sceneComp("s09", 7.07, [{"kind": "img", "a": "txt_step7.png", "t": 0.0, "pos": [260, 140], "scale": 100, "rot": -3, "anim": "slide_left", "sfx": "tape_rip", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_faster.png", "t": 0.35, "pos": [720, 250], "scale": 100, "rot": 1, "anim": "slide_left", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "sticker_05x.png", "t": 0.9, "pos": [520, 640], "scale": 100, "rot": -8, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_restore.png", "t": 3.4, "pos": [1200, 600], "scale": 100, "rot": -2, "anim": "slide_right", "sfx": "typing", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "stamp_reversible.png", "t": 4.6, "pos": [1250, 840], "scale": 110, "rot": 0, "anim": "stamp", "sfx": "stamp", "tape": null, "out": null, "shadow": false}]);
var l_s09 = main.layers.add(c_s09); l_s09.startTime = 57.67;
var c_s10 = sceneComp("s10", 6.93, [{"kind": "img", "a": "card_before_after.png", "t": 0.15, "pos": [960, 450], "scale": 70, "rot": -1, "anim": "slide_up", "sfx": "paper_slide", "tape": [0, -8], "out": null, "shadow": true}, {"kind": "img", "a": "txt_outro.png", "t": 2.0, "pos": [960, 860], "scale": 90, "rot": -2, "anim": "stamp", "sfx": "stamp", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "logo_mkdziner.png", "t": 3.2, "pos": [1660, 140], "scale": 42, "rot": 4, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_github.png", "t": 3.8, "pos": [960, 1000], "scale": 82, "rot": 0, "anim": "slide_up", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}]);
var l_s10 = main.layers.add(c_s10); l_s10.startTime = 64.74;
(function(){ var L = main.layers.add(F(ROOT + "assets/bg_paper.png")); L.name = "wipe s02";
  var P = L.property("ADBE Transform Group").property("ADBE Position");
  L.property("ADBE Transform Group").property("ADBE Scale").setValue([100, 100]);
  P.setValueAtTime(4.560, [3260, 540]); P.setValueAtTime(4.810, [960, 540]); P.setValueAtTime(5.060, [-1340, 540]);
  P.expression = "posterizeTime(12); value"; shadow(L);
  L.inPoint = 4.510; L.outPoint = 5.110; })();
(function(){ var L = main.layers.add(F(ROOT + "assets/bg_paper.png")); L.name = "wipe s03";
  var P = L.property("ADBE Transform Group").property("ADBE Position");
  L.property("ADBE Transform Group").property("ADBE Scale").setValue([100, 100]);
  P.setValueAtTime(11.210, [3260, 540]); P.setValueAtTime(11.460, [960, 540]); P.setValueAtTime(11.710, [-1340, 540]);
  P.expression = "posterizeTime(12); value"; shadow(L);
  L.inPoint = 11.160; L.outPoint = 11.760; })();
(function(){ var L = main.layers.add(F(ROOT + "assets/bg_paper.png")); L.name = "wipe s04";
  var P = L.property("ADBE Transform Group").property("ADBE Position");
  L.property("ADBE Transform Group").property("ADBE Scale").setValue([100, 100]);
  P.setValueAtTime(17.340, [3260, 540]); P.setValueAtTime(17.590, [960, 540]); P.setValueAtTime(17.840, [-1340, 540]);
  P.expression = "posterizeTime(12); value"; shadow(L);
  L.inPoint = 17.290; L.outPoint = 17.890; })();
(function(){ var L = main.layers.add(F(ROOT + "assets/bg_paper.png")); L.name = "wipe s05";
  var P = L.property("ADBE Transform Group").property("ADBE Position");
  L.property("ADBE Transform Group").property("ADBE Scale").setValue([100, 100]);
  P.setValueAtTime(25.320, [3260, 540]); P.setValueAtTime(25.570, [960, 540]); P.setValueAtTime(25.820, [-1340, 540]);
  P.expression = "posterizeTime(12); value"; shadow(L);
  L.inPoint = 25.270; L.outPoint = 25.870; })();
(function(){ var L = main.layers.add(F(ROOT + "assets/bg_paper.png")); L.name = "wipe s06";
  var P = L.property("ADBE Transform Group").property("ADBE Position");
  L.property("ADBE Transform Group").property("ADBE Scale").setValue([100, 100]);
  P.setValueAtTime(30.600, [3260, 540]); P.setValueAtTime(30.850, [960, 540]); P.setValueAtTime(31.100, [-1340, 540]);
  P.expression = "posterizeTime(12); value"; shadow(L);
  L.inPoint = 30.550; L.outPoint = 31.150; })();
(function(){ var L = main.layers.add(F(ROOT + "assets/bg_paper.png")); L.name = "wipe s07";
  var P = L.property("ADBE Transform Group").property("ADBE Position");
  L.property("ADBE Transform Group").property("ADBE Scale").setValue([100, 100]);
  P.setValueAtTime(39.430, [3260, 540]); P.setValueAtTime(39.680, [960, 540]); P.setValueAtTime(39.930, [-1340, 540]);
  P.expression = "posterizeTime(12); value"; shadow(L);
  L.inPoint = 39.380; L.outPoint = 39.980; })();
(function(){ var L = main.layers.add(F(ROOT + "assets/bg_paper.png")); L.name = "wipe s08";
  var P = L.property("ADBE Transform Group").property("ADBE Position");
  L.property("ADBE Transform Group").property("ADBE Scale").setValue([100, 100]);
  P.setValueAtTime(48.330, [3260, 540]); P.setValueAtTime(48.580, [960, 540]); P.setValueAtTime(48.830, [-1340, 540]);
  P.expression = "posterizeTime(12); value"; shadow(L);
  L.inPoint = 48.280; L.outPoint = 48.880; })();
(function(){ var L = main.layers.add(F(ROOT + "assets/bg_paper.png")); L.name = "wipe s09";
  var P = L.property("ADBE Transform Group").property("ADBE Position");
  L.property("ADBE Transform Group").property("ADBE Scale").setValue([100, 100]);
  P.setValueAtTime(57.420, [3260, 540]); P.setValueAtTime(57.670, [960, 540]); P.setValueAtTime(57.920, [-1340, 540]);
  P.expression = "posterizeTime(12); value"; shadow(L);
  L.inPoint = 57.370; L.outPoint = 57.970; })();
(function(){ var L = main.layers.add(F(ROOT + "assets/bg_paper.png")); L.name = "wipe s10";
  var P = L.property("ADBE Transform Group").property("ADBE Position");
  L.property("ADBE Transform Group").property("ADBE Scale").setValue([100, 100]);
  P.setValueAtTime(64.490, [3260, 540]); P.setValueAtTime(64.740, [960, 540]); P.setValueAtTime(64.990, [-1340, 540]);
  P.expression = "posterizeTime(12); value"; shadow(L);
  L.inPoint = 64.440; L.outPoint = 65.040; })();
(function(){ var L = main.layers.add(F(ROOT + "assets/halftone.png")); L.blendingMode = BlendingMode.MULTIPLY;
  L.property("ADBE Transform Group").property("ADBE Opacity").setValue(55); L.name = "halftone";
  L.property("ADBE Transform Group").property("ADBE Position").setValue([W / 2, H / 2]);
  if (H > W) L.property("ADBE Transform Group").property("ADBE Rotate Z").setValue(90); })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/vo/s01.wav", "vo")); L.startTime = 0.400;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([0, 0]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 0.100;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/marker.wav", "sfx")); L.startTime = 1.000;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/stamp.wav", "sfx")); L.startTime = 1.700;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 2.400;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/vo/s02.wav", "vo")); L.startTime = 5.160;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([0, 0]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/stamp.wav", "sfx")); L.startTime = 4.960;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/pop.wav", "sfx")); L.startTime = 5.810;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/stamp.wav", "sfx")); L.startTime = 8.410;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/whoosh.wav", "sfx")); L.startTime = 4.560;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-8, -8]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/vo/s03.wav", "vo")); L.startTime = 11.810;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([0, 0]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/tape_rip.wav", "sfx")); L.startTime = 11.460;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 11.810;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/typing.wav", "sfx")); L.startTime = 12.460;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/click.wav", "sfx")); L.startTime = 13.160;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/click.wav", "sfx")); L.startTime = 13.350;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/click.wav", "sfx")); L.startTime = 13.540;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/click.wav", "sfx")); L.startTime = 13.730;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/click.wav", "sfx")); L.startTime = 13.920;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/click.wav", "sfx")); L.startTime = 14.110;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/click.wav", "sfx")); L.startTime = 14.300;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/pop.wav", "sfx")); L.startTime = 14.860;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/whoosh.wav", "sfx")); L.startTime = 11.210;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-8, -8]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/vo/s04.wav", "vo")); L.startTime = 17.940;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([0, 0]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/tape_rip.wav", "sfx")); L.startTime = 17.590;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 17.940;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 18.590;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 18.890;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/whoosh.wav", "sfx")); L.startTime = 19.590;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/typing.wav", "sfx")); L.startTime = 20.190;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/pop.wav", "sfx")); L.startTime = 21.890;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/marker_short.wav", "sfx")); L.startTime = 22.790;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/whoosh.wav", "sfx")); L.startTime = 17.340;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-8, -8]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/vo/s05.wav", "vo")); L.startTime = 25.920;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([0, 0]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/tape_rip.wav", "sfx")); L.startTime = 25.570;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 25.920;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_rustle.wav", "sfx")); L.startTime = 26.470;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/typing.wav", "sfx")); L.startTime = 27.070;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/stamp.wav", "sfx")); L.startTime = 28.070;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/whoosh.wav", "sfx")); L.startTime = 25.320;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-8, -8]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/vo/s06.wav", "vo")); L.startTime = 31.200;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([0, 0]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/tape_rip.wav", "sfx")); L.startTime = 30.850;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 31.200;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 31.650;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/marker_short.wav", "sfx")); L.startTime = 32.750;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/marker_short.wav", "sfx")); L.startTime = 33.150;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/marker_short.wav", "sfx")); L.startTime = 33.550;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/marker_short.wav", "sfx")); L.startTime = 33.950;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/marker_short.wav", "sfx")); L.startTime = 34.350;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/marker_short.wav", "sfx")); L.startTime = 34.750;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/marker_short.wav", "sfx")); L.startTime = 35.150;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/marker_short.wav", "sfx")); L.startTime = 35.550;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/marker_short.wav", "sfx")); L.startTime = 35.950;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/marker_short.wav", "sfx")); L.startTime = 36.350;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/marker_short.wav", "sfx")); L.startTime = 36.750;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/stamp.wav", "sfx")); L.startTime = 37.450;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/whoosh.wav", "sfx")); L.startTime = 30.600;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-8, -8]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/vo/s07.wav", "vo")); L.startTime = 40.030;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([0, 0]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/tape_rip.wav", "sfx")); L.startTime = 39.680;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 40.030;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 40.480;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/pop.wav", "sfx")); L.startTime = 41.180;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/pop.wav", "sfx")); L.startTime = 41.780;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 43.580;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/pop.wav", "sfx")); L.startTime = 43.830;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 44.130;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/pop.wav", "sfx")); L.startTime = 44.380;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 44.680;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/pop.wav", "sfx")); L.startTime = 44.930;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 45.230;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/pop.wav", "sfx")); L.startTime = 45.480;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/whoosh.wav", "sfx")); L.startTime = 39.430;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-8, -8]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/vo/s08.wav", "vo")); L.startTime = 48.930;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([0, 0]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/tape_rip.wav", "sfx")); L.startTime = 48.580;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 48.930;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 49.280;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/pop.wav", "sfx")); L.startTime = 50.880;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/pop.wav", "sfx")); L.startTime = 51.580;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/marker.wav", "sfx")); L.startTime = 52.580;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/pop.wav", "sfx")); L.startTime = 53.180;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/pop.wav", "sfx")); L.startTime = 53.680;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/marker_short.wav", "sfx")); L.startTime = 54.080;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/whoosh.wav", "sfx")); L.startTime = 48.330;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-8, -8]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/vo/s09.wav", "vo")); L.startTime = 58.020;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([0, 0]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/tape_rip.wav", "sfx")); L.startTime = 57.670;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 58.020;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/pop.wav", "sfx")); L.startTime = 58.570;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/typing.wav", "sfx")); L.startTime = 61.070;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/stamp.wav", "sfx")); L.startTime = 62.270;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/whoosh.wav", "sfx")); L.startTime = 57.420;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-8, -8]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/vo/s10.wav", "vo")); L.startTime = 65.340;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([0, 0]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 64.890;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/stamp.wav", "sfx")); L.startTime = 66.740;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/pop.wav", "sfx")); L.startTime = 67.940;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 68.540;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/whoosh.wav", "sfx")); L.startTime = 64.490;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-8, -8]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/music/lofi_bed.wav", "music")); L.startTime = 0; L.name = "music bed";
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-19, -19]); } catch (e) {} })();
var rq = proj.renderQueue.items.add(main);
var om = rq.outputModule(1);
var tpl = om.templates, chosen = null;
for (var i = 0; i < tpl.length; i++) { if (tpl[i].indexOf("H.264") === 0 && !chosen) chosen = tpl[i]; }
if (chosen) om.applyTemplate(chosen);
om.file = new File(ROOT + "render/vox_tv_debloat" + (chosen ? ".mp4" : ".mov"));
main.openInViewer();
proj.save(new File(ROOT + "TV debloat - Vox collage.aep"));
app.endUndoGroup();
})();
