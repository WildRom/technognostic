/* ============================================================
   HYBRID LAYER — SECONDARY ENERGY BEAM (reversible)
   Occasional thin signal streak crossing the visible viewport.
   Rarer + dimmer + narrower than the primary techno-glyph field
   (assets/js/techno-glyph.js). Pairs with the HYBRID LAYER block
   at the end of assets/css/styles.css.
   Event-driven only: setTimeout + one reused element; CSS animates
   opacity/transform. No rAF loop, no canvas.
   Revert = remove this file + its script tag in index.html.
   ============================================================ */
(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const layer = document.createElement('div');
  layer.className = 'streak-layer';
  layer.setAttribute('aria-hidden', 'true');
  const beam = document.createElement('span');
  beam.className = 'streak-beam';
  layer.appendChild(beam);

  let nextTimer = 0;
  let hideTimer = 0;

  function schedule() {
    window.clearTimeout(nextTimer);
    if (reducedMotion.matches) return; // accessibility kill-switch
    nextTimer = window.setTimeout(fire, 3000 + Math.random() * 3000); // ~3-6s
  }

  /* lightweight glyph avoidance: read live glyph positions from the
     primary layer so streaks never launch on top of fresh glyphs */
  function activeGlyphSpots() {
    const glyphLayer = document.querySelector('.glyph-layer');
    if (!glyphLayer) return [];
    const spots = [];
    for (const el of glyphLayer.children) {
      const x = parseFloat(el.style.getPropertyValue('--gx'));
      const y = parseFloat(el.style.getPropertyValue('--gy'));
      if (!Number.isNaN(x) && !Number.isNaN(y)) spots.push({ x, y });
    }
    return spots;
  }

  function fire() {
    schedule(); // always queue the next streak first
    if (document.hidden || reducedMotion.matches) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const compact = W < 700;
    const len = Math.min(Math.max(W * 0.2, 140), 340) * (0.85 + Math.random() * 0.3); // restrained, slightly varied
    const pad = len;

    // gentle diagonal, either direction
    const dirX = Math.random() < 0.5 ? 1 : -1;
    const slant = (3 + Math.random() * 21) * (Math.random() < 0.5 ? 1 : -1);
    const rad = (slant * Math.PI) / 180;
    const ux = Math.cos(rad) * dirX;
    const uy = Math.sin(rad) * (Math.random() < 0.5 ? 1 : -1);

    // random interior anchor so streaks land somewhere new each time
    const cx = W * (0.18 + Math.random() * 0.64);
    const cy = H * (0.14 + Math.random() * 0.72);

    // where the streak line crosses the (padded) viewport
    let tmin = -Infinity;
    let tmax = Infinity;
    const clip = (p, d, lo, hi) => {
      if (Math.abs(d) < 1e-4) return p >= lo && p <= hi;
      let t1 = (lo - p) / d;
      let t2 = (hi - p) / d;
      if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
      tmin = Math.max(tmin, t1);
      tmax = Math.min(tmax, t2);
      return true;
    };
    if (!clip(cx, ux, -pad, W + pad) || !clip(cy, uy, -pad, H + pad) || tmax <= tmin) return;

    const x0 = cx + ux * tmin;
    const y0 = cy + uy * tmin;
    const travel = tmax - tmin + len;           // cross fully + clear the tail
    const duration = 0.6 + Math.random() * 0.6; // 0.6-1.2s

    // hybrid balance: skip a streak whose mid-crossing point would sit
    // on a freshly visible glyph (the next streak arrives soon anyway)
    for (const spot of activeGlyphSpots()) {
      const mx = x0 + ux * ((tmax - tmin) / 2);
      const my = y0 + uy * ((tmax - tmin) / 2);
      const dx = spot.x - mx;
      const dy = spot.y - my;
      if (dx * dx + dy * dy < 140 * 140) return;
    }

    beam.style.left = x0 + 'px';
    beam.style.top = y0 + 'px';
    beam.style.setProperty('--beam-length', len.toFixed(0) + 'px');
    beam.style.setProperty('--beam-angle', ((Math.atan2(uy, ux) * 180) / Math.PI).toFixed(2) + 'deg');
    beam.style.setProperty('--beam-travel', travel.toFixed(0) + 'px');
    beam.style.setProperty('--beam-duration', duration.toFixed(2) + 's');
    beam.style.setProperty('--beam-opacity', ((compact ? 0.2 : 0.26) + Math.random() * 0.18).toFixed(2));

    layer.classList.remove('is-active');
    void layer.offsetWidth; // restart the animation cleanly
    layer.classList.add('is-active');
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => layer.classList.remove('is-active'), duration * 1000 + 200);
  }

  document.body.appendChild(layer);
  schedule();
  if (typeof reducedMotion.addEventListener === 'function') {
    reducedMotion.addEventListener('change', schedule); // honour live preference changes
  }
})();