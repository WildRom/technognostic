/* ============================================================
   EXPERIMENT 3 — RANDOM TECHNO-GLYPH PULSE (reversible)
   Ambient field variant: frequent low-intensity glyph events in
   randomized groups (1-3 glyphs) at random positions in the
   visible viewport. Pairs with the EXPERIMENT 3 block at the
   end of assets/css/styles.css.
   Event-driven only: setTimeout scheduling + CSS animations
   (opacity/transform). No rAF loop, no canvas.
   Revert = remove this file + its script tag in index.html.
   ============================================================ */
(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];
  const f1 = (n) => n.toFixed(1);

  const S = 'fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" vector-effect="non-scaling-stroke"';

  const dot = (x, y, r = 1.6) =>
    `<circle cx="${f1(x)}" cy="${f1(y)}" r="${r}" fill="currentColor" stroke="none"/>`;
  const line = (x1, y1, x2, y2) =>
    `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" ${S}/>`;
  /* partial arc: a circle clipped by dasharray, rotated via dashoffset */
  const arc = (r, spanDeg, offsetDeg) => {
    const c = 2 * Math.PI * r;
    const span = (c * spanDeg) / 360;
    return `<circle cx="50" cy="50" r="${r}" ${S} stroke-dasharray="${f1(span)} ${f1(c)}" stroke-dashoffset="${f1((-offsetDeg / 360) * c)}"/>`;
  };
  /* scattered measurement ticks: random angles, varied lengths —
     deliberately NOT evenly spaced (no cardinal crosshair language) */
  const scatterTicks = (k) => {
    let out = '';
    for (let i = 0; i < k; i++) {
      const a = (rnd(0, 360) * Math.PI) / 180;
      const r0 = rnd(33, 42);
      out += line(
        50 + r0 * Math.cos(a), 50 + r0 * Math.sin(a),
        50 + (r0 + rnd(5, 9)) * Math.cos(a), 50 + (r0 + rnd(5, 9)) * Math.sin(a)
      );
    }
    return out;
  };

  /* 6 procedural glyph designs — approved families only: broken
     orbits, offset ring fragments, triangle + arc, drafting marks,
     signal diagrams. No reticles, no full circles, no evenly
     spaced cardinal ticks. */
  const designs = [
    () => { /* F: offset concentric fragments — staggered radii + scattered ticks */
      const base = rnd(0, 360);
      const nodeA = ((base + rnd(80, 280)) * Math.PI) / 180;
      return (
        arc(46, rnd(60, 120), base) +
        arc(34, rnd(40, 90), base + rnd(60, 200)) +
        arc(20, rnd(30, 70), base + rnd(140, 300)) +
        scatterTicks(3) +
        dot(50 + 34 * Math.cos(nodeA), 50 + 34 * Math.sin(nodeA), 1.6)
      );
    },
    () => { /* B: orbit fragments on two radii + one orbit dot */
      const phi = (rnd(0, 360) * Math.PI) / 180;
      return (
        arc(46, rnd(50, 110), rnd(0, 360)) +
        arc(46, rnd(25, 60), rnd(0, 360)) +
        arc(24, rnd(40, 100), rnd(0, 360)) +
        dot(50 + 46 * Math.cos(phi), 50 + 46 * Math.sin(phi), 1.8)
      );
    },
    () => { /* G: signal diagram — stepped pulse line + arc + endpoint nodes */
      const y = rnd(38, 62);
      const stepX = rnd(35, 65);
      const stepY = y - rnd(10, 18) * (Math.random() < 0.5 ? 1 : -1);
      return (
        line(12, y, stepX, y) +
        line(stepX, y, stepX, stepY) +
        line(stepX, stepY, 88, stepY) +
        arc(46, rnd(40, 80), rnd(0, 360)) +
        dot(15, y, 1.5) + dot(85, stepY, 1.5)
      );
    },
    () => /* D: triangle fragment + broken ring + off-center node */
      arc(45, rnd(120, 220), rnd(0, 360)) +
      `<path d="M50 9 L86 71 L14 71 Z" ${S} stroke-dasharray="${rnd(40, 90) | 0} ${rnd(30, 70) | 0}" stroke-dashoffset="${rnd(0, 120) | 0}"/>` +
      dot(50 + rnd(-14, 14), 50 + rnd(-10, 10), 1.6),
    () => { /* E: drafting marks — uneven arcs + diagonal + off-axis ticks */
      const d = pick([-1, 1]);
      return (
        arc(44, rnd(70, 100), d * 45) +
        arc(29, rnd(50, 95), 180 - d * rnd(20, 70)) +
        line(22, 78, 58, 42) +
        line(60, 34, 70, 44) +
        line(66, 30, 76, 40) +
        dot(64, 38, 1.5)
      );
    },
    () => { /* H: measurement fragment — hairline with end ticks + broken arc */
      const y = rnd(34, 66);
      const x0 = rnd(14, 22);
      const x1 = rnd(72, 86);
      return (
        line(x0, y, x1, y) +
        line(x0, y - 4, x0, y + 4) +
        line(x1, y - 4, x1, y + 4) +
        arc(42, rnd(60, 130), rnd(0, 360)) +
        scatterTicks(2) +
        dot((x0 + x1) / 2 + rnd(-6, 6), y + rnd(-6, 6), 1.5)
      );
    },
  ];

  const layer = document.createElement('div');
  layer.className = 'glyph-layer';
  layer.setAttribute('aria-hidden', 'true');

  let nextTimer = 0;
  let activeGlyphs = 0;
  const recent = []; // recent spawn points {x, y, t} — prevents constant clustering

  function schedule() {
    window.clearTimeout(nextTimer);
    if (reducedMotion.matches) return; // accessibility kill-switch
    nextTimer = window.setTimeout(spawnGroup, 1800 + Math.random() * 2700); // ~1.8-4.5s
  }

  function maxActive() {
    return window.innerWidth < 700 ? 2 : 3;
  }

  /* Spawn a small randomized group instead of a lone glyph. */
  function spawnGroup() {
    schedule(); // always queue the next group first
    if (document.hidden || reducedMotion.matches) return;
    const compact = window.innerWidth < 700;
    const cap = maxActive();
    const roll = Math.random();
    let count;
    if (compact) {
      count = roll < 0.6 ? 1 : 2;                    // mobile: mostly 1, sometimes 2
    } else {
      count = roll < 0.25 ? 1 : roll < 0.75 ? 2 : 3; // desktop: 25% / 50% / 25%
    }
    count = Math.min(count, cap);
    for (let i = 0; i < count; i++) {
      window.setTimeout(() => {
        if (document.hidden || reducedMotion.matches) return;
        if (activeGlyphs >= maxActive()) return;     // never crowd the viewport
        fireGlyph();
      }, i === 0 ? 0 : 120 + Math.random() * 430);   // stagger 120-550ms
    }
  }

  function tooClose(x, y) {
    const now = Date.now();
    const minD = Math.min(window.innerWidth, window.innerHeight) * 0.22;
    for (let i = recent.length - 1; i >= 0; i--) {
      if (now - recent[i].t > 6000) { recent.splice(i, 1); continue; }
      const dx = recent[i].x - x;
      const dy = recent[i].y - y;
      if (dx * dx + dy * dy < minD * minD) return true;
    }
    return false;
  }

  /* Random viewport position; edge margins, sticky-header clearance,
     a bias toward the outer thirds, and a lightweight attempt to
     avoid images/headings and recently used spots. */
  function pickPosition(size) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const m = size / 2 + 20;
    const yMin = Math.max(m, H * 0.16);
    const yMax = Math.max(yMin + 1, H - Math.max(m, H * 0.08));
    let fallback = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const x = Math.random() < 0.55
        ? (Math.random() < 0.5 ? rnd(W * 0.06, W * 0.3) : rnd(W * 0.7, W * 0.94))
        : rnd(W * 0.06, W * 0.94);
      const y = rnd(yMin, yMax);
      const el = document.elementFromPoint(x, y);
      const tag = el ? el.tagName : '';
      if (tag === 'IMG' || tag === 'H1' || tag === 'H2' || tag === 'H3' || tag === 'H4') continue;
      if (!tooClose(x, y)) return { x, y };
      if (!fallback) fallback = { x, y }; // first clear-but-close spot kept as fallback
    }
    return fallback || { x: rnd(W * 0.1, W * 0.9), y: rnd(H * 0.25, H * 0.8) };
  }

  function fireGlyph() {
    const compact = window.innerWidth < 700;
    const sizeRoll = Math.random();
    const size = Math.round(
      compact
        ? (sizeRoll < 0.9 ? rnd(42, 90) : rnd(90, 110))
        : (sizeRoll < 0.8 ? rnd(48, 105) : sizeRoll < 0.95 ? rnd(105, 130) : rnd(130, 145))
    );
    const pos = pickPosition(size);
    const dur = rnd(0.8, 1.8);
    const roll = Math.random();
    /* cool technological palette: icy pale tones dominate, with a
       controlled neon-cyan electric accent on a minority of events;
       warm gold remains only a rare accent */
    const color = roll < 0.25
      ? 'rgba(112, 222, 245, .8)'    /* neon-cyan electric accent */
      : roll < 0.47
        ? 'rgba(150, 205, 228, .8)'  /* pale electric cyan */
        : roll < 0.62
          ? 'rgba(215, 230, 240, .85)' /* icy blue-white */
          : roll < 0.73
            ? 'rgba(150, 172, 210, .8)' /* cool desaturated blue */
            : roll < 0.81
              ? 'rgba(180, 195, 215, .7)' /* faint blue-grey */
              : roll < 0.93
                ? 'rgba(232, 236, 240, .8)' /* neutral pale white */
                : 'rgba(211, 173, 103, .8)'; /* rare warm-gold accent */

    const el = document.createElement('div');
    el.className = 'glyph-event';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      `<svg viewBox="0 0 100 100" aria-hidden="true">` +
      pick(designs)() +
      `<circle class="glyph-echo" cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-dasharray="176 113" vector-effect="non-scaling-stroke"/>` +
      `</svg>`;
    el.style.setProperty('--gx', pos.x.toFixed(0) + 'px');
    el.style.setProperty('--gy', pos.y.toFixed(0) + 'px');
    el.style.setProperty('--gsize', size + 'px');
    el.style.setProperty('--grot', rnd(-40, 40).toFixed(1) + 'deg');
    el.style.setProperty('--gopacity', (compact ? rnd(0.08, 0.19) : rnd(0.1, 0.24)).toFixed(2));
    el.style.setProperty('--gdur', dur.toFixed(2) + 's');
    el.style.setProperty('--gcolor', color);

    layer.appendChild(el);
    activeGlyphs++;
    recent.push({ x: pos.x, y: pos.y, t: Date.now() });
    if (recent.length > 12) recent.shift();
    window.setTimeout(() => {
      el.remove();
      activeGlyphs--;
    }, dur * 1000 + 400); // recycle node
  }

  document.body.appendChild(layer);
  schedule();
  if (typeof reducedMotion.addEventListener === 'function') {
    reducedMotion.addEventListener('change', schedule); // honour live preference changes
  }
})();