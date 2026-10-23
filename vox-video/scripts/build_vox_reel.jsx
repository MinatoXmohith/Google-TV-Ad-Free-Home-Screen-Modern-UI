// Built by build_project.py. Run in After Effects: File > Scripts > Run Script File...
// Creates the project "TV debloat - Vox collage" with one comp per scene and a MAIN comp.
(function () {
app.beginUndoGroup("Vox collage build");
// Always a fresh project, so whatever is open stays untouched (AE asks to save unsaved changes first).
var proj = app.newProject();
if (!proj) return;
var ROOT = "/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/";
var W = 1080, H = 1920, FPS = 24;
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
  bs.setValueAtTime(0, [150, 150]); bs.setValueAtTime(dur, [160.5, 160.5]);
  for (var i = 0; i < els.length; i++) {
    var s = els[i];
    if (s.kind == "img") img(c, s); else strk(c, s);
  }
  return c;
}
var main = proj.items.addComp("MAIN - TV debloat - Vox collage (Reel)", W, H, 1, 71.67, FPS);

var c_s01 = sceneComp("s01", 4.81, [{"kind": "img", "a": "txt_ad_before.png", "t": 0.0, "pos": [470, 420], "scale": 112, "rot": -3, "anim": "slide_left", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "card_before.png", "t": 0.1, "pos": [540, 780], "scale": 84, "rot": -2, "anim": "slide_up", "sfx": "paper_slide", "tape": [0, -6], "out": null, "shadow": true}, {"kind": "stroke", "pts": [[162.3, 655.9], [197.4, 647.8], [234.5, 642.2], [272.5, 638.5], [308.9, 639.2], [345.2, 640.2], [369.7, 649.6], [401.4, 654.0], [430.7, 660.7], [445.1, 672.7], [461.0, 684.4], [455.3, 699.4], [460.1, 712.9], [450.0, 727.3], [441.0, 741.8], [422.3, 755.8], [392.0, 767.2], [365.7, 779.3], [334.0, 789.4], [301.4, 800.6], [262.8, 805.9], [225.0, 806.0], [185.9, 810.7], [153.4, 805.4], [116.9, 804.1], [92.2, 795.2], [69.3, 786.3], [38.4, 779.4], [33.7, 765.0], [26.2, 751.8], [13.7, 738.5], [21.1, 723.2], [41.5, 708.6], [51.1, 693.0], [80.2, 680.2], [107.8, 667.3], [144.1, 658.5], [176.1, 646.2], [215.7, 640.8], [255.3, 635.0]], "t": 1.0, "dur": 0.55, "color": [0.84, 0.19, 0.15], "width": 9, "sfx": "marker", "dashed": false, "out": null}, {"kind": "img", "a": "txt_sponsored.png", "t": 1.7, "pos": [600, 1240], "scale": 105, "rot": 5, "anim": "stamp", "sfx": "stamp", "tape": null, "out": null, "shadow": true}]);
var l_s01 = main.layers.add(c_s01); l_s01.startTime = 0.0;
var c_s02 = sceneComp("s02", 6.65, [{"kind": "img", "a": "title_ransom.png", "t": 0.15, "pos": [540, 700], "scale": 70, "rot": -2, "anim": "stamp", "sfx": "stamp", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "icon_tv.png", "t": 1.0, "pos": [780, 1100], "scale": 64, "rot": 7, "anim": "drop", "sfx": "pop", "tape": [0, -4], "out": null, "shadow": true}, {"kind": "img", "a": "stamp_no_root.png", "t": 3.6, "pos": [330, 1240], "scale": 105, "rot": -6, "anim": "stamp", "sfx": "stamp", "tape": null, "out": null, "shadow": false}]);
var l_s02 = main.layers.add(c_s02); l_s02.startTime = 4.81;
var c_s03 = sceneComp("s03", 6.13, [{"kind": "img", "a": "txt_step1.png", "t": 0.0, "pos": [200, 330], "scale": 100, "rot": -3, "anim": "slide_left", "sfx": "tape_rip", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_devmode.png", "t": 0.35, "pos": [480, 460], "scale": 100, "rot": 1, "anim": "slide_left", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_build_path.png", "t": 1.0, "pos": [540, 660], "scale": 100, "rot": -1, "anim": "slide_up", "sfx": "typing", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_x1.png", "t": 1.7, "pos": [540, 920], "scale": 135, "rot": 4.724900130917742, "anim": "pop", "sfx": "click", "tape": null, "out": 1.89, "shadow": true}, {"kind": "img", "a": "txt_x2.png", "t": 1.89, "pos": [540, 920], "scale": 135, "rot": -2.414533225753587, "anim": "pop", "sfx": "click", "tape": null, "out": 2.08, "shadow": true}, {"kind": "img", "a": "txt_x3.png", "t": 2.08, "pos": [540, 920], "scale": 135, "rot": -1.6657207833313903, "anim": "pop", "sfx": "click", "tape": null, "out": 2.27, "shadow": true}, {"kind": "img", "a": "txt_x4.png", "t": 2.27, "pos": [540, 920], "scale": 135, "rot": -4.008527314443053, "anim": "pop", "sfx": "click", "tape": null, "out": 2.46, "shadow": true}, {"kind": "img", "a": "txt_x5.png", "t": 2.46, "pos": [540, 920], "scale": 135, "rot": -4.25157708551181, "anim": "pop", "sfx": "click", "tape": null, "out": 2.65, "shadow": true}, {"kind": "img", "a": "txt_x6.png", "t": 2.65, "pos": [540, 920], "scale": 135, "rot": -5.2183234394918845, "anim": "pop", "sfx": "click", "tape": null, "out": 2.84, "shadow": true}, {"kind": "img", "a": "txt_x7.png", "t": 2.84, "pos": [540, 920], "scale": 135, "rot": -2.38369079076645, "anim": "pop", "sfx": "click", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_usb_on.png", "t": 3.4, "pos": [540, 1220], "scale": 120, "rot": 2, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}]);
var l_s03 = main.layers.add(c_s03); l_s03.startTime = 11.46;
var c_s04 = sceneComp("s04", 7.98, [{"kind": "img", "a": "txt_step2.png", "t": 0.0, "pos": [200, 330], "scale": 100, "rot": -3, "anim": "slide_left", "sfx": "tape_rip", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_wifi.png", "t": 0.35, "pos": [530, 460], "scale": 88, "rot": 1, "anim": "slide_left", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "icon_laptop.png", "t": 1.0, "pos": [290, 760], "scale": 66, "rot": -4, "anim": "slide_left", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "icon_tv.png", "t": 1.3, "pos": [800, 780], "scale": 62, "rot": 5, "anim": "slide_right", "sfx": "paper_slide", "tape": [0, -4], "out": null, "shadow": true}, {"kind": "stroke", "pts": [[430.2, 770.0], [468.7, 772.7], [506.3, 777.9], [545.0, 779.3], [583.3, 784.2], [620.8, 788.6], [659.0, 790.0]], "t": 2.0, "dur": 0.6, "color": [0.11, 0.1, 0.09], "width": 7, "sfx": "whoosh", "dashed": true, "out": null}, {"kind": "img", "a": "txt_adb.png", "t": 2.6, "pos": [540, 1010], "scale": 100, "rot": -1, "anim": "slide_up", "sfx": "typing", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "dialog_allow.png", "t": 4.3, "pos": [540, 1290], "scale": 92, "rot": 3, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}, {"kind": "stroke", "pts": [[765.6, 1346.6], [786.8, 1344.4], [807.1, 1339.3], [827.4, 1341.4], [847.1, 1343.9], [861.8, 1351.6], [875.2, 1359.5], [885.5, 1369.1], [895.4, 1379.6], [891.1, 1392.3], [890.0, 1404.8], [881.7, 1417.0], [868.1, 1427.9], [848.9, 1435.2], [829.8, 1441.7], [809.2, 1446.2], [787.6, 1448.3], [768.1, 1444.1], [747.4, 1441.6], [730.8, 1434.4], [717.8, 1425.0], [714.6, 1412.5], [705.8, 1401.1], [712.9, 1388.3], [718.0, 1375.9], [727.9, 1363.9], [742.1, 1352.9], [762.6, 1346.5], [782.4, 1338.9], [804.7, 1337.5]], "t": 5.2, "dur": 0.4, "color": [0.84, 0.19, 0.15], "width": 8, "sfx": "marker_short", "dashed": false, "out": null}]);
var l_s04 = main.layers.add(c_s04); l_s04.startTime = 17.59;
var c_s05 = sceneComp("s05", 5.28, [{"kind": "img", "a": "txt_step3.png", "t": 0.0, "pos": [200, 330], "scale": 100, "rot": -3, "anim": "slide_left", "sfx": "tape_rip", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_backup.png", "t": 0.35, "pos": [540, 460], "scale": 92, "rot": 1, "anim": "slide_left", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "icon_folder.png", "t": 0.9, "pos": [540, 760], "scale": 110, "rot": -4, "anim": "drop", "sfx": "paper_rustle", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_backup_dir.png", "t": 1.5, "pos": [540, 1010], "scale": 112, "rot": 1, "anim": "slide_up", "sfx": "typing", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "stamp_backed_up.png", "t": 2.5, "pos": [560, 1250], "scale": 135, "rot": 0, "anim": "stamp", "sfx": "stamp", "tape": null, "out": null, "shadow": false}]);
var l_s05 = main.layers.add(c_s05); l_s05.startTime = 25.57;
var c_s06 = sceneComp("s06", 8.83, [{"kind": "img", "a": "txt_step4.png", "t": 0.0, "pos": [200, 330], "scale": 100, "rot": -3, "anim": "slide_left", "sfx": "tape_rip", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_junk.png", "t": 0.35, "pos": [500, 460], "scale": 100, "rot": 1, "anim": "slide_left", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "paper_packages.png", "t": 0.8, "pos": [540, 890], "scale": 82, "rot": -1.5, "anim": "slide_up", "sfx": "paper_slide", "tape": [-300, -8], "out": null, "shadow": true}, {"kind": "stroke", "pts": [[124.7, 650.6], [263.1, 647.9], [403.2, 653.5], [541.0, 646.6], [681.5, 649.8], [819.2, 647.5], [958.4, 649.1]], "t": 1.9, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "stroke", "pts": [[124.9, 701.4], [264.8, 698.1], [402.8, 703.7], [540.9, 702.8], [681.4, 702.1], [819.9, 698.4], [958.1, 701.0]], "t": 2.3, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "stroke", "pts": [[124.7, 752.2], [264.9, 755.2], [403.7, 752.8], [541.6, 755.2], [680.5, 752.6], [819.2, 752.1], [958.0, 755.0]], "t": 2.7, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "stroke", "pts": [[125.3, 803.1], [263.6, 800.8], [402.3, 806.3], [542.4, 803.9], [681.1, 807.5], [819.7, 807.3], [958.7, 806.8]], "t": 3.1, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "stroke", "pts": [[124.6, 853.9], [264.5, 855.5], [402.4, 857.6], [541.9, 855.3], [679.5, 855.3], [818.8, 856.5], [958.1, 855.6]], "t": 3.5, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "stroke", "pts": [[125.7, 904.8], [264.2, 906.6], [403.4, 904.1], [542.3, 907.9], [680.9, 908.9], [820.3, 905.9], [958.3, 905.9]], "t": 3.9, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "stroke", "pts": [[126.0, 955.6], [264.3, 957.6], [403.2, 954.2], [542.2, 957.5], [680.8, 956.8], [819.6, 959.8], [958.5, 958.3]], "t": 4.300000000000001, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "stroke", "pts": [[124.4, 1006.4], [264.2, 1003.8], [403.2, 1006.1], [540.7, 1004.4], [679.9, 1000.8], [818.6, 1002.0], [957.6, 1002.7]], "t": 4.7, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "stroke", "pts": [[125.0, 1057.3], [264.2, 1057.3], [402.3, 1058.9], [540.6, 1054.8], [680.1, 1054.2], [818.6, 1056.5], [957.9, 1053.6]], "t": 5.1, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "stroke", "pts": [[124.3, 1108.1], [263.6, 1108.8], [403.7, 1110.7], [541.5, 1110.8], [680.8, 1107.8], [818.6, 1109.5], [958.3, 1109.0]], "t": 5.5, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "stroke", "pts": [[125.3, 1159.0], [264.7, 1156.1], [402.0, 1160.7], [541.9, 1158.3], [680.8, 1164.2], [819.1, 1161.6], [957.7, 1162.7]], "t": 5.9, "dur": 0.3, "color": [0.84, 0.19, 0.15], "width": 7, "sfx": "marker_short", "dashed": false, "out": null}, {"kind": "img", "a": "stamp_disabled.png", "t": 6.6, "pos": [560, 1330], "scale": 100, "rot": 0, "anim": "stamp", "sfx": "stamp", "tape": null, "out": null, "shadow": false}]);
var l_s06 = main.layers.add(c_s06); l_s06.startTime = 30.85;
var c_s07 = sceneComp("s07", 8.9, [{"kind": "img", "a": "txt_step5.png", "t": 0.0, "pos": [200, 330], "scale": 100, "rot": -3, "anim": "slide_left", "sfx": "tape_rip", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_newhome.png", "t": 0.35, "pos": [510, 460], "scale": 100, "rot": 1, "anim": "slide_left", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "card_figma.png", "t": 0.8, "pos": [540, 860], "scale": 80, "rot": -1.5, "anim": "slide_up", "sfx": "paper_slide", "tape": [0, -6], "out": 3.6, "shadow": true}, {"kind": "img", "a": "txt_scratch.png", "t": 1.5, "pos": [640, 640], "scale": 100, "rot": 4, "anim": "pop", "sfx": "pop", "tape": null, "out": 3.6, "shadow": true}, {"kind": "img", "a": "txt_tvos.png", "t": 2.1, "pos": [420, 1100], "scale": 105, "rot": -3, "anim": "pop", "sfx": "pop", "tape": null, "out": 3.6, "shadow": true}, {"kind": "img", "a": "card_launcher_v1.png", "t": 3.9, "pos": [290, 720], "scale": 48, "rot": 4.724546276651214, "anim": "drop", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_v1.png", "t": 4.15, "pos": [290, 895], "scale": 110, "rot": -0.9617557296817578, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "card_domain_clash.png", "t": 4.45, "pos": [790, 760], "scale": 48, "rot": 4.611390967291932, "anim": "drop", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_v2.png", "t": 4.7, "pos": [790, 935], "scale": 110, "rot": 3.309978136958323, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "card_spiderman.png", "t": 5.0, "pos": [290, 1110], "scale": 48, "rot": 0.9580997820161654, "anim": "drop", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_v3.png", "t": 5.25, "pos": [290, 1285], "scale": 110, "rot": -1.9214027678354855, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "card_final.png", "t": 5.55, "pos": [790, 1150], "scale": 40, "rot": 4.809805624246797, "anim": "drop", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_vfinal.png", "t": 5.8, "pos": [790, 1325], "scale": 110, "rot": -0.02955596142600303, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}]);
var l_s07 = main.layers.add(c_s07); l_s07.startTime = 39.68;
var c_s08 = sceneComp("s08", 9.09, [{"kind": "img", "a": "txt_step6.png", "t": 0.0, "pos": [200, 330], "scale": 100, "rot": -3, "anim": "slide_left", "sfx": "tape_rip", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_glass.png", "t": 0.35, "pos": [400, 460], "scale": 100, "rot": 1, "anim": "slide_left", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "card_final.png", "t": 0.7, "pos": [540, 840], "scale": 86, "rot": -1.5, "anim": "slide_up", "sfx": "paper_slide", "tape": [-250, -6], "out": null, "shadow": true}, {"kind": "stroke", "pts": [[139.2, 563.1], [178.4, 555.2], [218.2, 545.0], [259.8, 545.1], [299.2, 546.2], [338.6, 547.6], [370.4, 555.3], [406.8, 560.5], [430.6, 572.0], [448.4, 585.4], [469.8, 598.2], [477.3, 614.3], [463.3, 632.1], [464.3, 648.8], [445.7, 665.5], [433.9, 683.4], [404.2, 698.5], [366.2, 709.9], [330.5, 721.5], [291.0, 730.0], [251.5, 742.1], [208.7, 741.4], [166.1, 744.4], [126.6, 741.5], [87.9, 737.6], [54.9, 729.5], [24.8, 719.8], [11.6, 704.3], [-13.9, 692.2], [-15.0, 674.9], [-20.1, 658.3], [-10.7, 640.8], [3.1, 623.5], [19.8, 606.1], [47.2, 590.4], [80.1, 576.4], [113.4, 562.0], [154.9, 552.6], [198.7, 548.5], [241.0, 542.5]], "t": 1.9, "dur": 0.5, "color": [0.84, 0.19, 0.15], "width": 9, "sfx": "marker", "dashed": false, "out": null}, {"kind": "img", "a": "card_panel.png", "t": 2.6, "pos": [740, 1215], "scale": 46, "rot": 4, "anim": "pop", "sfx": "pop", "tape": [0, -6], "out": null, "shadow": true}, {"kind": "img", "a": "txt_panel.png", "t": 3.2, "pos": [780, 1415], "scale": 110, "rot": -3, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "card_avatar.png", "t": 4.4, "pos": [250, 1210], "scale": 80, "rot": 6, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_myface.png", "t": 4.9, "pos": [290, 1415], "scale": 100, "rot": -2, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}]);
var l_s08 = main.layers.add(c_s08); l_s08.startTime = 48.58;
var c_s09 = sceneComp("s09", 7.07, [{"kind": "img", "a": "txt_step7.png", "t": 0.0, "pos": [200, 330], "scale": 100, "rot": -3, "anim": "slide_left", "sfx": "tape_rip", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_faster.png", "t": 0.35, "pos": [540, 460], "scale": 96, "rot": 1, "anim": "slide_left", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "sticker_05x.png", "t": 0.9, "pos": [320, 770], "scale": 110, "rot": -8, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_restore.png", "t": 3.4, "pos": [560, 1030], "scale": 100, "rot": -2, "anim": "slide_right", "sfx": "typing", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "stamp_reversible.png", "t": 4.6, "pos": [580, 1270], "scale": 130, "rot": 0, "anim": "stamp", "sfx": "stamp", "tape": null, "out": null, "shadow": false}]);
var l_s09 = main.layers.add(c_s09); l_s09.startTime = 57.67;
var c_s10 = sceneComp("s10", 6.93, [{"kind": "img", "a": "logo_mkdziner.png", "t": 3.2, "pos": [540, 400], "scale": 62, "rot": 4, "anim": "pop", "sfx": "pop", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "card_before_after.png", "t": 0.15, "pos": [540, 780], "scale": 76, "rot": -1, "anim": "slide_up", "sfx": "paper_slide", "tape": [0, -8], "out": null, "shadow": true}, {"kind": "img", "a": "txt_outro.png", "t": 2.0, "pos": [540, 1120], "scale": 80, "rot": -2, "anim": "stamp", "sfx": "stamp", "tape": null, "out": null, "shadow": true}, {"kind": "img", "a": "txt_github.png", "t": 3.8, "pos": [540, 1300], "scale": 70, "rot": 0, "anim": "slide_up", "sfx": "paper_slide", "tape": null, "out": null, "shadow": true}]);
var l_s10 = main.layers.add(c_s10); l_s10.startTime = 64.74;
(function(){ var L = main.layers.add(F(ROOT + "assets/bg_paper.png")); L.name = "wipe s02";
  var P = L.property("ADBE Transform Group").property("ADBE Position");
  L.property("ADBE Transform Group").property("ADBE Scale").setValue([150, 150]);
  P.setValueAtTime(4.560, [3990, 960]); P.setValueAtTime(4.810, [540, 960]); P.setValueAtTime(5.060, [-2910, 960]);
  P.expression = "posterizeTime(12); value"; shadow(L);
  L.inPoint = 4.510; L.outPoint = 5.110; })();
(function(){ var L = main.layers.add(F(ROOT + "assets/bg_paper.png")); L.name = "wipe s03";
  var P = L.property("ADBE Transform Group").property("ADBE Position");
  L.property("ADBE Transform Group").property("ADBE Scale").setValue([150, 150]);
  P.setValueAtTime(11.210, [3990, 960]); P.setValueAtTime(11.460, [540, 960]); P.setValueAtTime(11.710, [-2910, 960]);
  P.expression = "posterizeTime(12); value"; shadow(L);
  L.inPoint = 11.160; L.outPoint = 11.760; })();
(function(){ var L = main.layers.add(F(ROOT + "assets/bg_paper.png")); L.name = "wipe s04";
  var P = L.property("ADBE Transform Group").property("ADBE Position");
  L.property("ADBE Transform Group").property("ADBE Scale").setValue([150, 150]);
  P.setValueAtTime(17.340, [3990, 960]); P.setValueAtTime(17.590, [540, 960]); P.setValueAtTime(17.840, [-2910, 960]);
  P.expression = "posterizeTime(12); value"; shadow(L);
  L.inPoint = 17.290; L.outPoint = 17.890; })();
(function(){ var L = main.layers.add(F(ROOT + "assets/bg_paper.png")); L.name = "wipe s05";
  var P = L.property("ADBE Transform Group").property("ADBE Position");
  L.property("ADBE Transform Group").property("ADBE Scale").setValue([150, 150]);
  P.setValueAtTime(25.320, [3990, 960]); P.setValueAtTime(25.570, [540, 960]); P.setValueAtTime(25.820, [-2910, 960]);
  P.expression = "posterizeTime(12); value"; shadow(L);
  L.inPoint = 25.270; L.outPoint = 25.870; })();
(function(){ var L = main.layers.add(F(ROOT + "assets/bg_paper.png")); L.name = "wipe s06";
  var P = L.property("ADBE Transform Group").property("ADBE Position");
  L.property("ADBE Transform Group").property("ADBE Scale").setValue([150, 150]);
  P.setValueAtTime(30.600, [3990, 960]); P.setValueAtTime(30.850, [540, 960]); P.setValueAtTime(31.100, [-2910, 960]);
  P.expression = "posterizeTime(12); value"; shadow(L);
  L.inPoint = 30.550; L.outPoint = 31.150; })();
(function(){ var L = main.layers.add(F(ROOT + "assets/bg_paper.png")); L.name = "wipe s07";
  var P = L.property("ADBE Transform Group").property("ADBE Position");
  L.property("ADBE Transform Group").property("ADBE Scale").setValue([150, 150]);
  P.setValueAtTime(39.430, [3990, 960]); P.setValueAtTime(39.680, [540, 960]); P.setValueAtTime(39.930, [-2910, 960]);
  P.expression = "posterizeTime(12); value"; shadow(L);
  L.inPoint = 39.380; L.outPoint = 39.980; })();
(function(){ var L = main.layers.add(F(ROOT + "assets/bg_paper.png")); L.name = "wipe s08";
  var P = L.property("ADBE Transform Group").property("ADBE Position");
  L.property("ADBE Transform Group").property("ADBE Scale").setValue([150, 150]);
  P.setValueAtTime(48.330, [3990, 960]); P.setValueAtTime(48.580, [540, 960]); P.setValueAtTime(48.830, [-2910, 960]);
  P.expression = "posterizeTime(12); value"; shadow(L);
  L.inPoint = 48.280; L.outPoint = 48.880; })();
(function(){ var L = main.layers.add(F(ROOT + "assets/bg_paper.png")); L.name = "wipe s09";
  var P = L.property("ADBE Transform Group").property("ADBE Position");
  L.property("ADBE Transform Group").property("ADBE Scale").setValue([150, 150]);
  P.setValueAtTime(57.420, [3990, 960]); P.setValueAtTime(57.670, [540, 960]); P.setValueAtTime(57.920, [-2910, 960]);
  P.expression = "posterizeTime(12); value"; shadow(L);
  L.inPoint = 57.370; L.outPoint = 57.970; })();
(function(){ var L = main.layers.add(F(ROOT + "assets/bg_paper.png")); L.name = "wipe s10";
  var P = L.property("ADBE Transform Group").property("ADBE Position");
  L.property("ADBE Transform Group").property("ADBE Scale").setValue([150, 150]);
  P.setValueAtTime(64.490, [3990, 960]); P.setValueAtTime(64.740, [540, 960]); P.setValueAtTime(64.990, [-2910, 960]);
  P.expression = "posterizeTime(12); value"; shadow(L);
  L.inPoint = 64.440; L.outPoint = 65.040; })();
(function(){ var L = main.layers.add(F(ROOT + "assets/halftone.png")); L.blendingMode = BlendingMode.MULTIPLY;
  L.property("ADBE Transform Group").property("ADBE Opacity").setValue(55); L.name = "halftone";
  L.property("ADBE Transform Group").property("ADBE Position").setValue([W / 2, H / 2]);
  if (H > W) L.property("ADBE Transform Group").property("ADBE Rotate Z").setValue(90); })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/vo/s01.wav", "vo")); L.startTime = 0.400;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([0, 0]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 0.000;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 0.100;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/marker.wav", "sfx")); L.startTime = 1.000;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/stamp.wav", "sfx")); L.startTime = 1.700;
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
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/marker.wav", "sfx")); L.startTime = 50.480;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/pop.wav", "sfx")); L.startTime = 51.180;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/pop.wav", "sfx")); L.startTime = 51.780;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/pop.wav", "sfx")); L.startTime = 52.980;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/pop.wav", "sfx")); L.startTime = 53.480;
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
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/pop.wav", "sfx")); L.startTime = 67.940;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/paper_slide.wav", "sfx")); L.startTime = 64.890;
  try { L.property("ADBE Audio Group").property("ADBE Audio Levels").setValue([-6, -6]); } catch (e) {} })();
(function(){ var L = main.layers.add(F("/Users/mohithreddykotamreddy/Desktop/TV-Demo/vox-video/sfx/stamp.wav", "sfx")); L.startTime = 66.740;
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
om.file = new File(ROOT + "render/vox_tv_debloat_reel" + (chosen ? ".mp4" : ".mov"));
main.openInViewer();
proj.save(new File(ROOT + "TV debloat - Vox collage (Reel).aep"));
app.endUndoGroup();
})();
