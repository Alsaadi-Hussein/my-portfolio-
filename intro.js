/* ============================================================
   Entrance intro: line-drawn "HA" monogram, boot counter,
   kinetic role phrases, then a horizontal split that zooms
   through to the real hero. Plays once per browser session;
   Skip button / Esc jumps to the split. Add ?intro to the URL
   to force it to replay.

   Loaded synchronously at the top of <body> so the overlay is
   in place before the page paints. Everything is rendered from
   a single clock T (seconds), keyed to the scene cues below.
   ============================================================ */
(function () {
  "use strict";

  var KEY = "ha-intro-seen";
  var force = /[?&]intro\b/.test(location.search);
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var seen = false;
  try { seen = sessionStorage.getItem(KEY) === "1"; } catch (e) {}
  if (!force && (seen || reduce || location.hash.length > 1)) return;
  if (!document.body || !window.requestAnimationFrame) return;
  try { sessionStorage.setItem(KEY, "1"); } catch (e) {}

  /* ---------- Scenes (Assemble 4.5s, Phrases 4.8s, Split 2.2s) ---------- */
  var CUES = { Assemble: 0, Phrases: 4.5, Split: 9.3 };
  var END = CUES.Split + 2.0;

  /* ---------- Palette ---------- */
  var INK = "#2B241C", BG = "#F1E9DA", ACCENT = "#2F5D46";
  var SANS = "'Space Grotesk', system-ui, sans-serif";
  var MONO = "'JetBrains Mono', ui-monospace, monospace";

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

  /* ---------- Geometry (1920x1080 design space) ---------- */
  var TRACES = [
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
  ];
  var NODES = [[860,420],[700,690],[820,740],[1080,430],[1200,730],[1100,760],[860,260],[1120,280],[900,820],[1040,840]];
  var CUBE_EDGES = [];
  for (var ci = 0; ci < 8; ci++) [1, 2, 4].forEach(function (m) { if (!(ci & m)) CUBE_EDGES.push([ci, ci | m]); });
  // Monogram: H (left) + A (right), then four corner brackets
  var STROKES = [
    { d: "M-130 -80 V80", col: INK, a: 1.4, b: 2.4 },
    { d: "M-130 0 H-30", col: INK, a: 2.2, b: 2.9 },
    { d: "M-30 -80 V80", col: INK, a: 1.7, b: 2.7 },
    { d: "M30 80 L85 -80 L140 80", col: ACCENT, a: 2.0, b: 3.0 },
    { d: "M50 30 H120", col: ACCENT, a: 2.8, b: 3.4 }
  ];
  var BRACKETS = [[1, 1, 2.6], [-1, 1, 2.7], [1, -1, 2.8], [-1, -1, 2.9]];
  var PHRASES = [
    { text: "COMMUNICATIONS ENGINEER", a: CUES.Phrases, b: CUES.Phrases + 1.6 },
    { text: "SOFTWARE & IOT DEVELOPER", a: CUES.Phrases + 1.6, b: CUES.Phrases + 3.2 },
    { text: "IT & AUTOMATION", a: CUES.Phrases + 3.2, b: CUES.Phrases + 4.8 }
  ];

  /* ---------- Styles ---------- */
  var css = [
    "html.ha-lock,html.ha-lock body{overflow:hidden}",
    "html.ha-hold .hero .reveal,html.ha-hold .hero .reveal.in{opacity:0;transform:translateY(40px)}",
    "#ha-intro{position:fixed;inset:0;z-index:1000;overflow:hidden;-webkit-font-smoothing:antialiased}",
    "#ha-intro .ha-view{position:absolute;inset:0;overflow:hidden;background:" + BG + ";transform-origin:50% 50%}",
    "#ha-intro .ha-bg{position:absolute;left:50%;top:50%;width:1920px;height:1080px;margin:-540px 0 0 -960px}",
    "#ha-intro .ha-glow{position:absolute;inset:0;background:radial-gradient(ellipse 700px 700px at 0% 30%,rgba(120,150,125,.45),transparent 70%),radial-gradient(ellipse 800px 600px at 45% 100%,rgba(232,170,160,.45),transparent 70%),radial-gradient(ellipse 600px 600px at 100% 60%,rgba(240,205,130,.4),transparent 70%)}",
    "#ha-intro .ha-grid{position:absolute;inset:0;opacity:.2;background-image:linear-gradient(rgba(47,93,70,1) 1px,transparent 1px),linear-gradient(90deg,rgba(47,93,70,1) 1px,transparent 1px);background-size:60px 60px}",
    "#ha-intro svg{position:absolute;left:0;top:0;overflow:visible}",
    "#ha-intro .ha-mono{position:absolute;font-family:" + MONO + ";color:" + INK + ";white-space:nowrap}",
    "#ha-intro .ha-count{position:absolute;display:flex;align-items:baseline;font-family:" + MONO + "}",
    "#ha-intro .ha-num{font-weight:500;color:" + INK + ";font-variant-numeric:tabular-nums}",
    "#ha-intro .ha-bar{position:absolute;height:1px;background:rgba(43,36,28,.14)}",
    "#ha-intro .ha-fill{position:absolute;left:0;top:-.5px;height:2px;background:" + ACCENT + ";box-shadow:0 0 5px " + ACCENT + "}",
    "#ha-intro .ha-phrase{position:absolute;left:0;width:100%;display:flex;flex-direction:column;align-items:center}",
    "#ha-intro .ha-idx{font-family:" + MONO + ";letter-spacing:.3em;color:" + ACCENT + "}",
    "#ha-intro .ha-row{display:flex;white-space:nowrap;font-family:" + SANS + ";font-weight:600;letter-spacing:.01em;color:" + INK + ";line-height:1.2}",
    "#ha-intro .ha-row span{display:inline-block}",
    "#ha-intro .ha-flash{position:absolute;left:0;right:0;top:calc(50% - 1px);height:2px;background:#fff;box-shadow:0 0 30px 6px rgba(255,255,255,.9);pointer-events:none}",
    "#ha-intro .ha-skip{position:absolute;z-index:2;font:500 12px/1 " + MONO + ";letter-spacing:.24em;color:" + INK + ";background:rgba(255,251,242,.55);border:1px solid rgba(43,36,28,.22);border-radius:999px;padding:11px 18px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background .2s,border-color .2s}",
    "#ha-intro .ha-skip:hover,#ha-intro .ha-skip:focus-visible{background:rgba(255,251,242,.9);border-color:" + ACCENT + ";outline:none}"
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

  function buildView(n) {
    var v = {};
    v.el = h("div", "ha-view", root);
    v.el.setAttribute("aria-hidden", "true");

    // background layer: fixed 1920x1080 design, scaled to cover
    v.bg = h("div", "ha-bg", v.el);
    h("div", "ha-glow", v.bg);
    v.grid = h("div", "ha-grid", v.bg);
    var bsvg = s("svg", { width: 1920, height: 1080, viewBox: "0 0 1920 1080" }, v.bg);
    v.traces = TRACES.map(function (d) {
      return {
        base: s("path", { d: d, pathLength: 1, fill: "none", stroke: ACCENT, "stroke-width": 1.5, "stroke-opacity": 0.2, "stroke-dasharray": "1 1" }, bsvg),
        pulse: s("path", { d: d, pathLength: 1, fill: "none", stroke: INK, "stroke-width": 2.5, "stroke-linecap": "round", "stroke-dasharray": "0.05 1" }, bsvg)
      };
    });
    v.nodes = NODES.map(function (p) {
      return s("circle", { cx: p[0], cy: p[1], r: 5, fill: "none", stroke: ACCENT, "stroke-width": 1.5 }, bsvg);
    });

    // foreground layer: design coordinates centred on the viewport
    v.fg = s("svg", { preserveAspectRatio: "xMidYMid meet" }, v.el);
    var gid = "ha-glow-" + n;
    var filt = s("filter", { id: gid, filterUnits: "userSpaceOnUse", x: -2000, y: -2000, width: 6000, height: 6000 }, s("defs", {}, v.fg));
    s("feGaussianBlur", { stdDeviation: 2.5, result: "b" }, filt);
    var merge = s("feMerge", {}, filt);
    s("feMergeNode", { in: "b" }, merge);
    s("feMergeNode", { in: "SourceGraphic" }, merge);
    var glow = "url(#" + gid + ")";

    function cube() {
      var g = s("g", {}, v.fg);
      return {
        g: g,
        lines: CUBE_EDGES.map(function (e, k) {
          return s("line", { pathLength: 1, "stroke-dasharray": "1 1", stroke: k % 3 === 0 ? ACCENT : INK, "stroke-width": 1.6, filter: glow }, g);
        }),
        dots: [0, 1, 2, 3, 4, 5, 6, 7].map(function () { return s("circle", { fill: INK }, g); })
      };
    }
    v.cubes = [cube(), cube()];

    v.mono = s("g", {}, v.fg);
    v.brackets = BRACKETS.map(function (b) {
      var sx = b[0], sy = b[1];
      return s("path", { d: "M" + sx * 170 + " " + sy * 105 + " H" + sx * 210 + " V" + sy * 140, pathLength: 1, fill: "none", stroke: ACCENT, "stroke-width": 2.5, "stroke-dasharray": "1 1" }, v.mono);
    });
    v.strokes = STROKES.map(function (st) {
      return s("path", { d: st.d, pathLength: 1, fill: "none", stroke: st.col, "stroke-width": 7, "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-dasharray": "1 1", filter: glow }, v.mono);
    });

    // HUD
    v.boot = h("div", "ha-mono", v.el, 'SYS.BOOT <span style="color:' + ACCENT + '">//</span> HUSSEIN_ALSAADI');
    v.clock = h("div", "ha-mono", v.el);
    v.bar = h("div", "ha-bar", v.el);
    v.fill = h("div", "ha-fill", v.bar);
    v.count = h("div", "ha-count", v.el);
    v.status = h("span", null, v.count);
    v.num = h("span", "ha-num", v.count);

    // phrases
    v.phrases = PHRASES.map(function (p, i) {
      var wrap = h("div", "ha-phrase", v.el);
      var idx = h("div", "ha-idx", wrap, "0" + (i + 1) + " / 03");
      var row = h("div", "ha-row", wrap);
      var chars = p.text.split("").map(function (c) {
        var sp = h("span", null, row);
        sp.textContent = c === " " ? " " : c;
        if (c === "&") sp.style.color = ACCENT;
        sp._space = c === " ";
        return sp;
      });
      return { p: p, wrap: wrap, idx: idx, row: row, chars: chars, w: 0 };
    });
    return v;
  }

  var views = [buildView(0), buildView(1)];
  var flash = h("div", "ha-flash", root);
  var skip = h("button", "ha-skip", root, "SKIP INTRO →");
  skip.type = "button";

  /* ---------- Layout ---------- */
  var L = {};
  function measurePhrases(v) {
    v.phrases.forEach(function (ph) {
      var prev = ph.wrap.style.display;
      ph.wrap.style.display = "flex";
      ph.wrap.style.visibility = "hidden";
      ph.row.style.fontSize = "112px";
      ph.chars.forEach(function (c) { if (c._space) c.style.width = "34px"; });
      ph.w = ph.row.scrollWidth || ph.row.offsetWidth;
      ph.wrap.style.display = prev;
      ph.wrap.style.visibility = "";
    });
  }
  function layout() {
    var vw = window.innerWidth, vh = window.innerHeight;
    // u: design-px scale for centred content; equals 1 at 1920x1080
    var u = Math.min(vw / 1100, vh / 1080);
    var cover = Math.max(vw / 1920, vh / 1080);
    L = { vw: vw, vh: vh, u: u };
    var fs = function (px, min) { return Math.max(px * u, min) + "px"; };

    views.forEach(function (v, vi) {
      v.bg.style.transform = "scale(" + cover + ")";
      var w = vw / u, hh = vh / u;
      v.fg.setAttribute("width", vw);
      v.fg.setAttribute("height", vh);
      v.fg.setAttribute("viewBox", (960 - w / 2) + " " + (540 - hh / 2) + " " + w + " " + hh);

      var edge = Math.max(96 * u, 18), top = Math.max(80 * u, 22);
      Object.assign(v.boot.style, { left: edge + "px", top: top + "px", fontSize: fs(24, 10), letterSpacing: ".2em" });
      Object.assign(v.clock.style, { right: edge + "px", top: top + "px", fontSize: fs(24, 10), letterSpacing: ".2em", display: vw < 640 ? "none" : "" });
      Object.assign(v.count.style, { right: edge + "px", bottom: Math.max(84 * u, 30) + "px", gap: 28 * u + "px" });
      Object.assign(v.status.style, { fontSize: fs(24, 10), letterSpacing: ".3em" });
      v.num.style.fontSize = fs(88, 34);
      var barX = 160 * (vw / 1920);
      Object.assign(v.bar.style, { left: barX + "px", right: barX + "px", bottom: Math.max(70 * u, 22) + "px" });

      if (vi === 0) measurePhrases(v);
      v.phrases.forEach(function (ph, i) {
        var w112 = views[0].phrases[i].w || 1;
        var ps = Math.min(u, (vw * 0.92) / w112);
        ph.ps = ps;
        ph.wrap.style.top = (vh / 2 + 50 * u) + "px";
        ph.wrap.style.gap = 28 * u + "px";
        ph.idx.style.fontSize = fs(24, 10);
        ph.row.style.fontSize = 112 * ps + "px";
        ph.chars.forEach(function (c) { if (c._space) c.style.width = 34 * ps + "px"; });
      });
    });
    skip.style.left = Math.max(96 * u, 18) + "px";
    skip.style.bottom = Math.max(84 * u, 30) + "px";
  }
  layout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  window.addEventListener("resize", layout);

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
    // grid spreads out from the centre
    var gr = pr(T, 0, 3.2, E.outCubic) * 1500;
    var mask = "radial-gradient(circle at 50% 50%, #000 " + Math.max(gr - 500, 0) + "px, transparent " + gr + "px)";
    css1(v.grid, "webkitMaskImage", mask);
    css1(v.grid, "maskImage", mask);

    v.traces.forEach(function (tr, i) {
      var st = 0.3 + i * 0.12, p = pr(T, st, st + 1.6, MOTION.draw);
      att(tr.base, "stroke-dashoffset", 1 - p);
      att(tr.pulse, "stroke-opacity", 0.55 * p);
      tr.pulse.setAttribute("stroke-dashoffset", -((T * 0.22 + i * 0.37) % 1));
    });
    v.nodes.forEach(function (n, i) { att(n, "stroke-opacity", 0.2 + 0.4 * pr(T, 1.8 + i * 0.1, 2.3 + i * 0.1)); });

    // monogram shrinks up as the phrases arrive
    var shrink = pr(T, CUES.Phrases - 0.4, CUES.Phrases + 0.5, MOTION.draw);
    var iScale = 1 - shrink * 0.6, iY = 540 - shrink * 210;
    renderCube(v.cubes[0], T, 960, iY, 250 - shrink * 130, pr(T, 0.4, 2.6, E.inOutSine), 0.9 - shrink * 0.2, 1);
    renderCube(v.cubes[1], T, 960, iY, 140 - shrink * 75, pr(T, 1.0, 3.0, E.inOutSine), 0.5, -1.4);
    att(v.mono, "transform", "translate(960 " + iY + ") scale(" + iScale + ")");
    v.brackets.forEach(function (b, i) { att(b, "stroke-dashoffset", 1 - pr(T, BRACKETS[i][2], BRACKETS[i][2] + 0.9, MOTION.draw)); });
    v.strokes.forEach(function (p, i) { att(p, "stroke-dashoffset", 1 - pr(T, STROKES[i].a, STROKES[i].b, MOTION.draw)); });

    // HUD
    var cnt = Math.floor(100 * pr(T, 0.3, 4.1, E.inOutCubic));
    var done = cnt >= 100;
    css1(v.boot, "opacity", String(0.7 * pr(T, 0.2, 0.8)));
    css1(v.clock, "opacity", String(0.45 * pr(T, 0.2, 0.8)));
    txt(v.clock, ("00" + T.toFixed(2)).slice(-5) + "s");
    txt(v.status, done ? "READY" : "LOADING");
    css1(v.status, "color", done ? ACCENT : INK);
    css1(v.status, "opacity", String(done ? 0.65 + 0.35 * Math.sin(T * 6) : 0.6));
    txt(v.num, ("00" + cnt).slice(-3) + "%");
    css1(v.fill, "width", cnt + "%");

    // kinetic phrases
    v.phrases.forEach(function (ph, n) {
      var a = ph.p.a, b = ph.p.b;
      if (T < a - 0.05 || T > b + 0.05) { css1(ph.wrap, "display", "none"); return; }
      css1(ph.wrap, "display", "flex");
      css1(ph.idx, "opacity", String(pr(T, a, a + 0.3) * (1 - pr(T, b - 0.2, b, E.inQuart))));
      var k = ph.ps;
      ph.chars.forEach(function (c, i) {
        var e = pr(T, a + i * 0.02, a + i * 0.02 + 0.5);
        var x = pr(T, b - 0.35 + i * 0.01, b - 0.05 + i * 0.01, E.inQuart);
        css1(c, "opacity", String(e * (1 - x)));
        css1(c, "transform", "translateY(" + ((1 - e) * 70 - x * 70) * k + "px)");
        css1(c, "filter", "blur(" + ((1 - e) * 10 + x * 10) * k + "px)");
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
      css1(el, "transform", "scale(" + (1.3 - 0.3 * sc) + ")");
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
    var split = T >= C - 0.1;
    var sp = pr(T, C, C + 1.9, E.inOutQuart);
    var dy = sp * 600 * (L.vh / 1080), z = 1 + sp * 0.9;
    var fade = 1 - pr(T, C + 1.5, C + 1.9, E.inQuad);

    if (!split) {
      renderView(views[0], T);
      css1(views[0].el, "clipPath", "none");
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
    var fl = pr(T, C - 0.05, C + 0.35, E.outQuart) * (1 - pr(T, C + 0.35, C + 1.6, E.inQuart));
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
    window.removeEventListener("resize", layout);
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
    if (T < CUES.Split - 0.1) T = CUES.Split - 0.1;
    else finish();
  }
  function onKey(e) { if (e.key === "Escape") skipToSplit(); }
  skip.addEventListener("click", skipToSplit);
  document.addEventListener("keydown", onKey);

  render(0);
  raf = requestAnimationFrame(tick);
})();
