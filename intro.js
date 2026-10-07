/* ============================================================
   Entrance intro (v2): line-drawn "HA" monogram on a raised
   neumorphic tile, glass HUD pills, boot counter, kinetic role
   phrases, then a horizontal split that zooms through to the
   real hero.

   Two compositions from the design handoff:
     d  desktop / landscape   1920 x 1080
     m  phone / portrait      1080 x 1920
   The one that matches the viewport is picked on load and when
   the screen rotates. Each is a fixed design canvas scaled to
   fit ("contain"); background, grid and circuit traces bleed out
   to the real screen edges so nothing is letterboxed.

   Plays once per browser session (a calm cross-fade version when
   the visitor has reduced motion on); Skip button / Esc jumps to
   the split. Add ?intro to the URL to force a replay, or
   ?intro=4.2 to freeze on one frame (design review).

   Loaded synchronously at the top of <body> so the overlay is
   in place before the page paints. Everything is rendered from
   a single clock T (seconds), keyed to the scene cues below.
   ============================================================ */
(function () {
  "use strict";

  var KEY = "ha-intro-seen";
  var qm = /[?&]intro(?:=(\d*\.?\d+))?(?:&|$)/.exec(location.search);
  var force = !!qm;
  var freezeAt = qm && qm[1] != null ? parseFloat(qm[1]) : null;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Visitors who asked their system for less motion still get the intro, but a calm version:
  // same drawing, counter and phrases, with a gentle cross-fade instead of the zoom and split.
  var calm = !!reduce;
  var seen = false;
  try { seen = sessionStorage.getItem(KEY) === "1"; } catch (e) {}
  if (!force && (seen || location.hash.length > 1)) return;
  if (!document.body || !window.requestAnimationFrame) return;
  try { sessionStorage.setItem(KEY, "1"); } catch (e) {}

  /* ---------- Scenes (Assemble 4.5s, Phrases 4.8s, Split 2.2s) ---------- */
  var CUES = { Assemble: 0, Phrases: 4.5, Split: 9.3 };
  var END = CUES.Split + 2.0;

  /* ---------- Palette ---------- */
  var INK = "#2B241C", BG = "#F1E9DA", ACCENT = "#2F5D46";
  var SANS = "'Space Grotesk', system-ui, sans-serif";
  var MONO = "'JetBrains Mono', ui-monospace, monospace";
  var SPRING = "cubic-bezier(.34,1.56,.64,1)";
  var GLASS_BG = "linear-gradient(135deg,rgba(255,255,255,.55),rgba(255,255,255,.18))";
  var RAISED_BG = "linear-gradient(145deg,#F7F0E3,#E8DEC9)";

  /* ---------- Motion ---------- */
  var E = {
    outExpo: function (t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); },
    inOutCubic: function (t) { return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; },
    outCubic: function (t) { t -= 1; return t * t * t + 1; },
    inQuad: function (t) { return t * t; },
    inQuart: function (t) { return t * t * t * t; },
    outQuart: function (t) { t -= 1; return 1 - t * t * t * t; },
    inOutQuart: function (t) { if (t < 0.5) return 8 * t * t * t * t; t -= 1; return 1 - 8 * t * t * t * t; },
    inOutSine: function (t) { return -(Math.cos(Math.PI * t) - 1) / 2; }
  };
  var MOTION = { enter: E.outExpo, draw: E.inOutCubic };
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function pr(T, a, b, ease) { return (ease || MOTION.enter)(clamp((T - a) / (b - a), 0, 1)); }

  /* ---------- Shared geometry: monogram (H + A) and corner brackets ---------- */
  var CUBE_EDGES = [];
  for (var ci = 0; ci < 8; ci++) [1, 2, 4].forEach(function (m) { if (!(ci & m)) CUBE_EDGES.push([ci, ci | m]); });
  var STROKES = [
    { d: "M-130 -80 V80", col: INK, a: 1.4, b: 2.4 },
    { d: "M-130 0 H-30", col: INK, a: 2.2, b: 2.9 },
    { d: "M-30 -80 V80", col: INK, a: 1.7, b: 2.7 },
    { d: "M30 80 L85 -80 L140 80", col: ACCENT, a: 2.0, b: 3.0 },
    { d: "M50 30 H120", col: ACCENT, a: 2.8, b: 3.4 }
  ];
  var BRACKETS = [[1, 1, 2.6], [-1, 1, 2.7], [1, -1, 2.8], [-1, -1, 2.9]];

  /* ---------- The two compositions (numbers from intro-piece.jsx / intro-mobile.jsx) ---------- */
  var DESIGN = {
    d: {
      W: 1920, H: 1080, label: 24,
      cy: 540, shrinkY: 210, shrinkS: 0.6, monoK: 1, dy: 600,
      glow: "radial-gradient(ellipse 700px 700px at 0% 30%,rgba(120,150,125,.45),transparent 70%),radial-gradient(ellipse 800px 600px at 45% 100%,rgba(232,170,160,.45),transparent 70%),radial-gradient(ellipse 600px 600px at 100% 60%,rgba(240,205,130,.4),transparent 70%)",
      gridCy: 540, gridR: 1500,
      traceOp: 0.2,
      traces: [
        "M0 180 H260 L330 250 H620 L660 290 V420 H860",
        "M0 420 H140 L200 480 H420 V640 L470 690 H700",
        "M0 860 H300 L360 800 H640 V740 H820",
        "M1920 200 H1640 L1580 260 H1300 L1260 300 V430 H1080",
        "M1920 500 H1760 L1700 560 H1500 V680 L1450 730 H1200",
        "M1920 880 H1560 L1500 820 H1260 V760 H1100",
        "M540 0 V90 L600 150 H860 V260",
        "M1380 0 V120 L1320 180 H1120 V280",
        "M700 1080 V980 L760 920 H900 V820",
        "M1240 1080 V1000 L1180 940 H1040 V840"
      ],
      nodes: [[860, 420], [700, 690], [820, 740], [1080, 430], [1200, 730], [1100, 760], [860, 260], [1120, 280], [900, 820], [1040, 840]],
      cubes: [
        { r: 250, k: 130, a: 0.4, b: 2.6, op: 0.9, opK: 0.2, spin: 1 },
        { r: 140, k: 75, a: 1.0, b: 3.0, op: 0.5, opK: 0, spin: -1.4 }
      ],
      tile: {
        size: 540, radius: 130, inset: 64, innerRadius: 80,
        shadow: "18px 18px 44px rgba(140,120,90,.32),-18px -18px 44px rgba(255,255,255,.95)",
        innerShadow: "inset 10px 10px 24px rgba(140,120,90,.22),inset -10px -10px 24px rgba(255,255,255,.8)"
      },
      hud: {
        boot: { h: "l", v: "t", x: 96, y: 64, st: { padding: "14px 32px", fontSize: "24px", letterSpacing: ".2em" } },
        clock: { h: "r", v: "t", x: 96, y: 64, st: { padding: "14px 32px", fontSize: "24px", letterSpacing: ".2em" } },
        count: { h: "r", v: "b", x: 96, y: 70, st: { padding: "14px 48px 18px", gap: "28px" }, statusFs: "24px", numFs: "88px" },
        bar: { x: 160, y: 70 },
        skip: { x: 96, y: 84 }
      },
      phrase: { top: 590, pad: "22px 64px", radius: 56, fs: 112, ls: ".01em", lh: "normal", space: 34, ty: 70 },
      phrases: [["COMMUNICATIONS ENGINEER"], ["SOFTWARE & IOT DEVELOPER"], ["IT & AUTOMATION"]]
    },
    m: {
      W: 1080, H: 1920, label: 22,
      cy: 760, shrinkY: 260, shrinkS: 0.5, monoK: 0.85, dy: 900,
      glow: "radial-gradient(ellipse 700px 700px at 0% 25%,rgba(120,150,125,.45),transparent 70%),radial-gradient(ellipse 800px 700px at 50% 100%,rgba(232,170,160,.45),transparent 70%),radial-gradient(ellipse 600px 700px at 100% 60%,rgba(240,205,130,.4),transparent 70%)",
      gridCy: 768, gridR: 1600,
      traceOp: 0.25,
      traces: [
        "M0 300 H160 L220 360 H300 V620",
        "M1080 420 H900 L840 480 H760 V720",
        "M0 1520 H200 L260 1460 H420 V1320",
        "M1080 1580 H820 L760 1520 H640 V1380",
        "M300 0 V100 L360 160 H520 V260",
        "M800 0 V140 L740 200 H600 V300"
      ],
      nodes: [[300, 620], [760, 720], [420, 1320], [640, 1380], [520, 260], [600, 300]],
      cubes: [
        { r: 210, k: 105, a: 0.4, b: 2.6, op: 0.9, opK: 0.2, spin: 1 },
        { r: 115, k: 58, a: 1.0, b: 3.0, op: 0.5, opK: 0, spin: -1.4 }
      ],
      tile: {
        size: 460, radius: 112, inset: 56, innerRadius: 68,
        shadow: "16px 16px 40px rgba(140,120,90,.32),-16px -16px 40px rgba(255,255,255,.95)",
        innerShadow: "inset 8px 8px 20px rgba(140,120,90,.22),inset -8px -8px 20px rgba(255,255,255,.8)"
      },
      hud: {
        boot: { h: "c", v: "t", x: 0, y: 90, st: { padding: "14px 30px", fontSize: "22px", letterSpacing: ".18em" } },
        clock: null,
        count: { h: "c", v: "b", x: 0, y: 150, st: { padding: "16px 48px 20px", gap: "24px" }, statusFs: "22px", numFs: "72px" },
        bar: { x: 120, y: 120 },
        skip: null
      },
      phrase: { top: 930, pad: "28px 48px", radius: 48, fs: 92, ls: ".005em", lh: "1.08", space: 0, ty: 60 },
      phrases: [["COMMUNICATIONS", "ENGINEER"], ["SOFTWARE &", "IOT", "DEVELOPER"], ["IT &", "AUTOMATION"]]
    }
  };

  /* ---------- Styles ---------- */
  var css = [
    "html.ha-lock,html.ha-lock body{overflow:hidden}",
    "html.ha-hold .hero .reveal,html.ha-hold .hero .reveal.in{opacity:0;transform:translateY(40px)}",
    "#ha-intro{position:fixed;inset:0;z-index:1000;overflow:hidden;line-height:normal;-webkit-font-smoothing:antialiased}",
    "#ha-intro *{box-sizing:content-box}",
    "#ha-intro .ha-view{position:absolute;inset:0;overflow:hidden;background:" + BG + ";transform-origin:50% 50%}",
    "#ha-intro .ha-bleed,#ha-intro .ha-canvas{position:absolute;left:50%;top:50%;transform-origin:50% 50%}",
    "#ha-intro .ha-glow,#ha-intro .ha-grid{position:absolute;left:0;top:0;width:100%;height:100%}",
    "#ha-intro .ha-grid{opacity:.2;background-image:linear-gradient(rgba(47,93,70,1) 1px,transparent 1px),linear-gradient(90deg,rgba(47,93,70,1) 1px,transparent 1px);background-size:60px 60px}",
    "#ha-intro svg{position:absolute;left:0;top:0;overflow:visible}",
    "#ha-intro .ha-tile{position:absolute;background:" + RAISED_BG + ";border:1px solid rgba(255,255,255,.6)}",
    "#ha-intro .ha-panel{position:absolute;background:" + GLASS_BG + ";-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.75)}",
    "#ha-intro .ha-hud{position:absolute;display:flex;pointer-events:none}",
    "#ha-intro .ha-hud>*{flex:none}",
    "#ha-intro .ha-pill{font-family:" + MONO + ";color:" + INK + ";white-space:nowrap;border-radius:32px;background:" + GLASS_BG + ";-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,.75);box-shadow:0 20px 50px rgba(60,48,30,.14),inset 0 1px 0 rgba(255,255,255,.9)}",
    "#ha-intro .ha-count{display:flex;align-items:baseline;font-family:" + MONO + ";border-radius:48px;background:" + RAISED_BG + ";border:1px solid rgba(255,255,255,.6)}",
    "#ha-intro .ha-status{letter-spacing:.3em}",
    "#ha-intro .ha-num{font-weight:500;color:" + INK + ";font-variant-numeric:tabular-nums}",
    "#ha-intro .ha-bar{position:absolute;height:1px;background:rgba(43,36,28,.14)}",
    "#ha-intro .ha-fill{position:absolute;left:0;top:-.5px;width:100%;height:2px;background:" + ACCENT + ";box-shadow:0 0 5px " + ACCENT + ";transform-origin:0 50%}",
    "#ha-intro .ha-phrase{position:absolute;left:0;display:flex;flex-direction:column;align-items:center;gap:28px}",
    "#ha-intro .ha-idx{font-family:" + MONO + ";font-size:24px;letter-spacing:.3em;color:" + ACCENT + "}",
    "#ha-intro .ha-ph{display:flex;flex-direction:column;align-items:center;font-family:" + SANS + ";font-weight:600;color:" + INK + "}",
    "#ha-intro .ha-row{display:flex}",
    "#ha-intro .ha-row span{display:inline-block}",
    "#ha-intro .ha-flash{position:absolute;left:0;right:0;top:calc(50% - 1px);height:2px;background:#fff;box-shadow:0 0 30px 6px rgba(255,255,255,.9);pointer-events:none}",
    /* skip button: hover / focus / pressed use transform + opacity only */
    "#ha-intro .ha-skip{position:absolute;z-index:2;isolation:isolate;font:500 12px/1 " + MONO + ";letter-spacing:.24em;color:" + INK + ";background:rgba(255,251,242,.55);border:1px solid rgba(43,36,28,.22);border-radius:999px;padding:11px 18px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .25s " + SPRING + "}",
    "#ha-intro .ha-skip::before,#ha-intro .ha-skip::after{content:'';position:absolute;left:-1px;top:-1px;right:-1px;bottom:-1px;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .2s ease}",
    "#ha-intro .ha-skip::before{z-index:-1;background:rgba(255,251,242,.9)}",
    "#ha-intro .ha-skip::after{border:1px solid " + ACCENT + "}",
    "#ha-intro .ha-skip:hover{transform:translateY(-1px)}",
    "#ha-intro .ha-skip:hover::before,#ha-intro .ha-skip:hover::after,#ha-intro .ha-skip:focus-visible::before,#ha-intro .ha-skip:focus-visible::after{opacity:1}",
    "#ha-intro .ha-skip:focus-visible{outline:2px solid " + ACCENT + ";outline-offset:3px}",
    "#ha-intro .ha-skip:active{transform:scale(.96)}"
  ].join("\n");
  var styleEl = document.createElement("style");
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ---------- DOM helpers ---------- */
  var SVGNS = "http://www.w3.org/2000/svg";
  function h(tag, cls, parent, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    if (parent) parent.appendChild(n);
    return n;
  }
  function s(tag, attrs, parent) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  // write-through caches so unchanged values never touch the DOM
  function css1(el, prop, v) { var k = "_c" + prop; if (el[k] !== v) { el[k] = v; el.style[prop] = v; } }
  function att(el, name, v) { var k = "_a" + name; if (el[k] !== v) { el[k] = v; el.setAttribute(name, v); } }
  function txt(el, v) { if (el._t !== v) { el._t = v; el.textContent = v; } }

  /* ---------- Build ---------- */
  var root = h("div", null, document.body);
  root.id = "ha-intro";
  document.body.insertBefore(root, document.body.firstChild);
  document.documentElement.classList.add("ha-lock", "ha-hold");

  var flash = h("div", "ha-flash", root);
  var skip = h("button", "ha-skip", root, "SKIP INTRO →");
  skip.type = "button";

  var views = [], compKey = null, L = {};

  function canvas(parent, C) {
    var c = h("div", "ha-canvas", parent);
    c.style.width = C.W + "px";
    c.style.height = C.H + "px";
    c.style.marginLeft = -C.W / 2 + "px";
    c.style.marginTop = -C.H / 2 + "px";
    return c;
  }
  function hud(parent, spec, cls, html) {
    var box = h("div", "ha-hud", parent);
    var el = h("div", cls, box, html);
    Object.assign(el.style, spec.st);
    return { box: box, el: el, spec: spec };
  }

  function buildView(n, C) {
    var v = { C: C };
    v.el = document.createElement("div");
    v.el.className = "ha-view";
    v.el.setAttribute("aria-hidden", "true");
    root.insertBefore(v.el, flash);

    // bleed layer: background, glow and grid fill the real viewport
    v.bleed = h("div", "ha-bleed", v.el);
    v.glow = h("div", "ha-glow", v.bleed);
    v.glow.style.background = C.glow;
    v.grid = h("div", "ha-grid", v.bleed);

    // design canvas: tile, circuit traces, cubes, monogram
    v.cv = canvas(v.el, C);
    var tl = C.tile;
    v.tile = h("div", "ha-tile", v.cv);
    Object.assign(v.tile.style, {
      left: C.W / 2 - tl.size / 2 + "px", top: C.cy - tl.size / 2 + "px",
      width: tl.size + "px", height: tl.size + "px", borderRadius: tl.radius + "px", boxShadow: tl.shadow
    });
    v.panel = h("div", "ha-panel", v.tile);
    Object.assign(v.panel.style, {
      left: tl.inset + "px", top: tl.inset + "px", right: tl.inset + "px", bottom: tl.inset + "px",
      borderRadius: tl.innerRadius + "px", boxShadow: tl.innerShadow
    });

    v.svg = s("svg", { width: C.W, height: C.H, viewBox: "0 0 " + C.W + " " + C.H }, v.cv);
    var gid = "ha-glow-" + n;
    var filt = s("filter", { id: gid, filterUnits: "userSpaceOnUse", x: -2000, y: -2000, width: 6000, height: 6000 }, s("defs", {}, v.svg));
    s("feGaussianBlur", { stdDeviation: 2.5, result: "b" }, filt);
    var merge = s("feMerge", {}, filt);
    s("feMergeNode", { in: "b" }, merge);
    s("feMergeNode", { in: "SourceGraphic" }, merge);
    var glow = "url(#" + gid + ")";

    v.traces = C.traces.map(function () {
      return {
        base: s("path", { pathLength: 1, fill: "none", stroke: ACCENT, "stroke-width": 1.5, "stroke-opacity": C.traceOp, "stroke-dasharray": "1 1" }, v.svg),
        pulse: s("path", { pathLength: 1, fill: "none", stroke: INK, "stroke-width": 2.5, "stroke-linecap": "round", "stroke-dasharray": "0.05 1" }, v.svg)
      };
    });
    v.nodes = C.nodes.map(function (p) {
      return s("circle", { cx: p[0], cy: p[1], r: 5, fill: "none", stroke: ACCENT, "stroke-width": 1.5 }, v.svg);
    });
    v.cubes = C.cubes.map(function () {
      var g = s("g", {}, v.svg);
      return {
        g: g,
        lines: CUBE_EDGES.map(function (e, k) {
          return s("line", { pathLength: 1, "stroke-dasharray": "1 1", stroke: k % 3 === 0 ? ACCENT : INK, "stroke-width": 1.6, filter: glow }, g);
        }),
        dots: [0, 1, 2, 3, 4, 5, 6, 7].map(function () { return s("circle", { fill: INK }, g); })
      };
    });
    v.mono = s("g", {}, v.svg);
    v.brackets = BRACKETS.map(function (b) {
      var sx = b[0], sy = b[1];
      return s("path", { d: "M" + sx * 170 + " " + sy * 105 + " H" + sx * 210 + " V" + sy * 140, pathLength: 1, fill: "none", stroke: ACCENT, "stroke-width": 2.5, "stroke-dasharray": "1 1" }, v.mono);
    });
    v.strokes = STROKES.map(function (st) {
      return s("path", { d: st.d, pathLength: 1, fill: "none", stroke: st.col, "stroke-width": 7, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": "1 1", filter: glow }, v.mono);
    });

    // HUD: pinned to the real screen edges
    var HD = C.hud;
    v.boot = hud(v.el, HD.boot, "ha-pill", 'SYS.BOOT <span style="color:' + ACCENT + '">//</span> HUSSEIN_ALSAADI');
    v.clock = HD.clock ? hud(v.el, HD.clock, "ha-pill") : null;
    v.bar = h("div", "ha-bar", v.el);
    v.fill = h("div", "ha-fill", v.bar);
    v.count = hud(v.el, HD.count, "ha-count");
    v.count.el.style.boxShadow = tl.shadow;
    v.status = h("span", "ha-status", v.count.el);
    v.status.style.fontSize = HD.count.statusFs;
    v.num = h("span", "ha-num", v.count.el);
    v.num.style.fontSize = HD.count.numFs;

    // kinetic phrases
    var P = C.phrase;
    v.cv2 = canvas(v.el, C);
    v.phrases = C.phrases.map(function (lines, i) {
      var a = CUES.Phrases + i * 1.6;
      var wrap = h("div", "ha-phrase", v.cv2);
      wrap.style.top = P.top + "px";
      wrap.style.width = C.W + "px";
      var idx = h("div", "ha-idx", wrap, "0" + (i + 1) + " / 03");
      var pill = h("div", "ha-ph ha-pill", wrap);
      Object.assign(pill.style, { padding: P.pad, borderRadius: P.radius + "px", fontSize: P.fs + "px", letterSpacing: P.ls, lineHeight: P.lh });
      var chars = [];
      lines.forEach(function (ln) {
        var row = h("div", "ha-row", pill);
        ln.split("").forEach(function (c) {
          var sp = h("span", null, row);
          sp.textContent = c === " " ? " " : c;
          if (c === "&") sp.style.color = ACCENT;
          if (c === " " && P.space) sp.style.width = P.space + "px";
          chars.push(sp);
        });
      });
      return { a: a, b: a + 1.6, wrap: wrap, idx: idx, pill: pill, chars: chars };
    });
    return v;
  }

  function build(key) {
    views.forEach(function (v) { if (v.el.parentNode) v.el.parentNode.removeChild(v.el); });
    compKey = key;
    views = [buildView(0, DESIGN[key]), buildView(1, DESIGN[key])];
  }

  /* ---------- Layout ---------- */
  // push a trace's open end out to the real screen edge
  function extendTrace(d, C, ex, ey) {
    var m = /^M(-?[\d.]+) (-?[\d.]+)(.*)$/.exec(d);
    var x = +m[1], y = +m[2];
    if (x === 0) x = -ex; else if (x === C.W) x = C.W + ex;
    if (y === 0) y = -ey; else if (y === C.H) y = C.H + ey;
    return "M" + x + " " + y + m[3];
  }
  function place(item, hs) {
    var p = item.spec, st = item.box.style;
    st.left = st.right = st.top = st.bottom = "";
    if (p.h === "l") { st.left = p.x * hs + "px"; st.justifyContent = "flex-start"; }
    else if (p.h === "r") { st.right = p.x * hs + "px"; st.justifyContent = "flex-end"; }
    else { st.left = "0"; st.right = "0"; st.justifyContent = "center"; }
    if (p.v === "t") st.top = p.y * hs + "px"; else st.bottom = p.y * hs + "px";
    item.el.style.transformOrigin = (p.h === "l" ? "left" : p.h === "r" ? "right" : "center") + " " + (p.v === "t" ? "top" : "bottom");
    item.el.style.transform = "scale(" + hs + ")";
  }
  function layout() {
    // a window can report 0x0 for a moment while it opens: fall back so nothing divides by zero
    var vw = window.innerWidth || document.documentElement.clientWidth || 1280;
    var vh = window.innerHeight || document.documentElement.clientHeight || 720;
    var key = vw < vh ? "m" : "d";
    if (key !== compKey) build(key);
    var C = DESIGN[key];
    var sc = Math.min(vw / C.W, vh / C.H);          // design canvas -> screen
    var hs = Math.max(sc, 10 / C.label);            // HUD scale: never below ~10px labels
    var bw = vw / sc, bh = vh / sc;                 // viewport in design px
    var ex = (bw - C.W) / 2, ey = (bh - C.H) / 2;   // bleed beyond the canvas
    L = { vw: vw, vh: vh, s: sc, hs: hs, bw: bw, bh: bh, ex: ex, ey: ey, C: C };

    views.forEach(function (v) {
      Object.assign(v.bleed.style, {
        width: bw + "px", height: bh + "px", marginLeft: -bw / 2 + "px", marginTop: -bh / 2 + "px",
        transform: "scale(" + sc + ")"
      });
      v.grid.style.backgroundPosition = (ex % 60) + "px " + (ey % 60) + "px";
      v.cv.style.transform = v.cv2.style.transform = "scale(" + sc + ")";
      v.traces.forEach(function (tr, i) {
        var d = extendTrace(C.traces[i], C, ex, ey);
        tr.base.setAttribute("d", d);
        tr.pulse.setAttribute("d", d);
      });
      place(v.boot, hs);
      if (v.clock) { place(v.clock, hs); v.clock.box.style.display = vw < 640 ? "none" : "flex"; }
      place(v.count, hs);
      Object.assign(v.bar.style, { left: C.hud.bar.x * hs + "px", right: C.hud.bar.x * hs + "px", bottom: C.hud.bar.y * hs + "px" });
    });

    // skip button: bottom-left on landscape; centred under the boot pill on phones
    if (C.hud.skip) {
      Object.assign(skip.style, { left: Math.max(C.hud.skip.x * hs, 18) + "px", right: "auto", top: "auto", bottom: Math.max(C.hud.skip.y * hs, 30) + "px", margin: "0", width: "auto" });
    } else {
      var b = C.hud.boot;
      Object.assign(skip.style, {
        left: "0", right: "0", bottom: "auto", margin: "0 auto", width: "max-content",
        top: Math.round(b.y * hs + views[0].boot.el.offsetHeight * hs + 14) + "px"
      });
    }
  }
  function onResize() { layout(); render(T); }
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(onResize);
  window.addEventListener("resize", onResize);

  /* ---------- Render ---------- */
  function renderCube(c, T, cx, cy, r, draw, op, spin) {
    var a = T * 0.55 * spin + 0.6, b = 0.55 + Math.sin(T * 0.4) * 0.12;
    var V = [];
    for (var i = 0; i < 8; i++) {
      var x = i & 1 ? 1 : -1, y = i & 2 ? 1 : -1, z = i & 4 ? 1 : -1;
      var x1 = x * Math.cos(a) + z * Math.sin(a), z1 = -x * Math.sin(a) + z * Math.cos(a);
      var y1 = y * Math.cos(b) - z1 * Math.sin(b), z2 = y * Math.sin(b) + z1 * Math.cos(b);
      var f = 4 / (4 - z2);
      V.push([cx + x1 * f * r, cy + y1 * f * r, z2]);
    }
    att(c.g, "opacity", op);
    CUBE_EDGES.forEach(function (e, k) {
      var ln = c.lines[k], p = V[e[0]], q = V[e[1]];
      ln.setAttribute("x1", p[0]); ln.setAttribute("y1", p[1]);
      ln.setAttribute("x2", q[0]); ln.setAttribute("y2", q[1]);
      att(ln, "stroke-dashoffset", 1 - pr(draw, k * 0.05, k * 0.05 + 0.4, MOTION.draw));
      ln.setAttribute("stroke-opacity", 0.45 + ((p[2] + q[2]) / 2) * 0.3);
    });
    var dotOp = pr(draw, 0.6, 1);
    c.dots.forEach(function (d, i) {
      d.setAttribute("cx", V[i][0]); d.setAttribute("cy", V[i][1]);
      d.setAttribute("r", 2.6 + V[i][2] * 0.8);
      att(d, "opacity", dotOp);
    });
  }

  function renderView(v, T) {
    var C = v.C;

    // grid spreads out from the centre of the canvas
    var gr = pr(T, 0, 3.2, E.outCubic) * C.gridR;
    var mask = "radial-gradient(circle at " + L.bw / 2 + "px " + (L.ey + C.gridCy) + "px, #000 " + Math.max(gr - 500, 0) + "px, transparent " + gr + "px)";
    css1(v.grid, "webkitMaskImage", mask);
    css1(v.grid, "maskImage", mask);

    v.traces.forEach(function (tr, i) {
      var st = 0.3 + i * 0.12, p = pr(T, st, st + 1.6, MOTION.draw);
      att(tr.base, "stroke-dashoffset", 1 - p);
      att(tr.pulse, "stroke-opacity", 0.55 * p);
      tr.pulse.setAttribute("stroke-dashoffset", -((T * 0.22 + i * 0.37) % 1));
    });
    v.nodes.forEach(function (n, i) { att(n, "stroke-opacity", 0.2 + 0.4 * pr(T, 1.8 + i * 0.1, 2.3 + i * 0.1)); });

    // monogram + tile shrink up as the phrases arrive
    var shrink = pr(T, CUES.Phrases - 0.4, CUES.Phrases + 0.5, MOTION.draw);
    var iScale = 1 - shrink * C.shrinkS, iY = C.cy - shrink * C.shrinkY;
    css1(v.tile, "opacity", String(pr(T, 0.2, 1.4)));
    css1(v.tile, "transform", "translateY(" + (iY - C.cy) + "px) scale(" + iScale + ")");
    C.cubes.forEach(function (cc, i) {
      renderCube(v.cubes[i], T, C.W / 2, iY, cc.r - shrink * cc.k, pr(T, cc.a, cc.b, E.inOutSine), cc.op - shrink * cc.opK, cc.spin);
    });
    att(v.mono, "transform", "translate(" + C.W / 2 + " " + iY + ") scale(" + iScale * C.monoK + ")");
    v.brackets.forEach(function (b, i) { att(b, "stroke-dashoffset", 1 - pr(T, BRACKETS[i][2], BRACKETS[i][2] + 0.9, MOTION.draw)); });
    v.strokes.forEach(function (p, i) { att(p, "stroke-dashoffset", 1 - pr(T, STROKES[i].a, STROKES[i].b, MOTION.draw)); });

    // HUD
    var cnt = Math.floor(100 * pr(T, 0.3, 4.1, E.inOutCubic));
    var done = cnt >= 100;
    var hudIn = String(pr(T, 0.2, 0.8));
    css1(v.boot.el, "opacity", hudIn);
    if (v.clock) {
      css1(v.clock.el, "opacity", hudIn);
      txt(v.clock.el, ("00" + T.toFixed(2)).slice(-5) + "s");
    }
    txt(v.status, done ? "READY" : "LOADING");
    css1(v.status, "color", done ? ACCENT : INK);
    css1(v.status, "opacity", String(done ? 0.65 + 0.35 * Math.sin(T * 6) : 0.6));
    txt(v.num, ("00" + cnt).slice(-3) + "%");
    css1(v.fill, "transform", "scaleX(" + cnt / 100 + ")");

    // kinetic phrases
    var ty = C.phrase.ty;
    v.phrases.forEach(function (ph) {
      var a = ph.a, b = ph.b;
      if (T < a - 0.05 || T > b + 0.05) { css1(ph.wrap, "display", "none"); return; }
      css1(ph.wrap, "display", "flex");
      var vis = String(pr(T, a, a + 0.3) * (1 - pr(T, b - 0.2, b, E.inQuart)));
      css1(ph.idx, "opacity", vis);
      css1(ph.pill, "opacity", vis);
      ph.chars.forEach(function (c, i) {
        var e = pr(T, a + i * 0.02, a + i * 0.02 + 0.5);
        var x = pr(T, b - 0.35 + i * 0.01, b - 0.05 + i * 0.01, E.inQuart);
        css1(c, "opacity", String(e * (1 - x)));
        css1(c, "transform", "translateY(" + ((1 - e) * ty - x * ty) + "px)");
        css1(c, "filter", "blur(" + ((1 - e) * 10 + x * 10) + "px)");
      });
    });
  }

  /* ---------- The real page underneath ---------- */
  var page = [".ambient", ".wrap", ".nav-inner"];
  var pageEls = null, held = true;
  function renderPage(T) {
    if (T < CUES.Split - 0.1) return;
    if (!pageEls) {
      pageEls = page.map(function (q) { return document.querySelector(q); }).filter(Boolean);
      pageEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        el.style.transformOrigin = (L.vw / 2 - r.left) + "px " + (L.vh / 2 - r.top) + "px";
      });
    }
    var sc = pr(T, CUES.Split, CUES.Split + 2, E.outQuart);
    pageEls.forEach(function (el) {
      css1(el, "transform", "scale(" + (calm ? 1 : 1.3 - 0.3 * sc) + ")");
      css1(el, "opacity", String(0.2 + 0.8 * sc));
    });
    if (held && T >= CUES.Split + 1.1) {
      held = false;
      document.documentElement.classList.remove("ha-hold");
    }
  }

  /* ---------- Composite ---------- */
  function render(T) {
    var C = CUES.Split;
    var split = !calm && T >= C - 0.1;
    var sp = pr(T, C, C + 1.9, E.inOutQuart);
    var dy = sp * (L.C.dy / L.C.H) * L.vh, z = 1 + sp * 0.9;
    var fade = 1 - pr(T, C + 1.5, C + 1.9, E.inQuad);

    if (!split) {
      renderView(views[0], T);
      css1(views[0].el, "display", "block");
      css1(views[0].el, "clipPath", "none");
      css1(views[0].el, "transform", "none");
      css1(views[0].el, "opacity", calm ? String(1 - pr(T, C, C + 1.2, E.inQuad)) : "1");   // calm: plain cross-fade
      css1(views[1].el, "display", "none");
    } else {
      views.forEach(function (v, i) {
        var sign = i === 0 ? -1 : 1;
        renderView(v, T);
        css1(v.el, "display", "block");
        css1(v.el, "clipPath", i === 0 ? "inset(0 0 50% 0)" : "inset(50% 0 0 0)");
        css1(v.el, "transform", "translateY(" + sign * dy + "px) scale(" + z + ")");
        css1(v.el, "opacity", String(fade));
      });
    }
    var fl = calm ? 0 : pr(T, C - 0.05, C + 0.35, E.outQuart) * (1 - pr(T, C + 0.35, C + 1.6, E.inQuart));
    css1(flash, "opacity", String(fl));
    css1(flash, "transform", "scaleX(" + (0.2 + 0.8 * fl) + ")");
    css1(skip, "opacity", String(1 - pr(T, C - 0.1, C + 0.3)));
    css1(skip, "visibility", T >= C + 0.3 ? "hidden" : "visible");
    renderPage(T);
  }

  /* ---------- Clock ---------- */
  var T = 0, last = null, raf = 0, finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", onResize);
    document.removeEventListener("keydown", onKey);
    (pageEls || []).forEach(function (el) {
      el.style.transform = ""; el.style.opacity = ""; el.style.transformOrigin = "";
    });
    document.documentElement.classList.remove("ha-lock", "ha-hold");
    if (root.parentNode) root.parentNode.removeChild(root);
    if (styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
  }
  function tick(now) {
    // accumulate clamped deltas so a backgrounded tab resumes where it paused
    if (last !== null) T += Math.min((now - last) / 1000, 0.1);
    last = now;
    if (T >= END) { finish(); return; }
    render(T);
    raf = requestAnimationFrame(tick);
  }
  function skipToSplit() {
    if (freezeAt != null) { finish(); return; }
    if (T < CUES.Split - 0.1) T = CUES.Split - 0.1;
    else finish();
  }
  function onKey(e) { if (e.key === "Escape") skipToSplit(); }
  skip.addEventListener("click", skipToSplit);
  document.addEventListener("keydown", onKey);

  if (freezeAt != null) {
    T = Math.min(freezeAt, END - 0.001);   // hold a single frame for design review
    render(T);
  } else {
    render(0);
    raf = requestAnimationFrame(tick);
  }
})();
