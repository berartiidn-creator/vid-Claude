// Paper-cut art for "The Courage to Speak": four characters (pose redrawn on change), meeting room, night room, cards.
import { mulberry, TAU, clamp, lerp } from './engine/lib.js';
import { cv, finishCut, sh, blob, smoothClosed, crescent, paperFill, INK, GRAIN, rr } from './engine/paper.js';

const LW = 10, LW2 = 6;
export const PPM = 5200;                     // pixels per metre on every prop canvas

// item for cutMesh: {c, w, h, ax, ay}; ay = 1 means the anchor is the bottom edge
export function cut(wm, hm, draw, o = {}) {
  const pad = o.pad ?? 60, W = Math.round(wm * PPM), H = Math.round(hm * PPM);
  const art = cv(W + pad * 2, H + pad * 2), x = art.getContext('2d');
  x.translate(pad, pad); draw(x, W, H); x.setTransform(1, 0, 0, 1, 0, 0);
  const c = o.raw ? art : finishCut(art, o.border ?? 14, { grainA: .75 });
  const sw = (W + pad * 2) / PPM, shh = (H + pad * 2) / PPM;
  return { c, w: sw, h: shh, ax: o.ax ?? .5, ay: o.ay ?? (H + pad) / (H + pad * 2) };
}

// ================= characters =================
export const CW = 820, CH = 1500;           // character canvas
export const LOOKS = {
  raka: { skin: '#f1b387', skinS: '#dc9468', hair: 'arti', hairC: '#2c241e', top: '#2f6845', topS: '#245637', inner: '#f7f5f0', low: '#d3b78f', lowS: '#b99b72', shoe: '#f6f3ec', lip: '#8a3a2c' },
  sari: { skin: '#edb48c', skinS: '#d6976d', hair: 'hijab', hijab: '#c9826b', hijabS: '#a9644f', top: '#3f4e73', topS: '#313e5e', inner: '#efe4d2', low: '#4a4f63', lowS: '#3b3f50', shoe: '#7a4a35', lip: '#a0483e', skirt: true },
  bimo: { skin: '#c98b62', skinS: '#ad6f49', hair: 'curly', hairC: '#1f1915', top: '#4c6e9e', topS: '#3d5b86', inner: '#f0eee8', low: '#4a4f5c', lowS: '#3a3f4b', shoe: '#2d2a28', lip: '#6e2e24' },
  nadia: { skin: '#e3a47a', skinS: '#c9895f', hair: 'hijab', hijab: '#2f4a6b', hijabS: '#243a55', top: '#d9a441', topS: '#bd8a30', inner: '#fbf7ef', low: '#3d3f48', lowS: '#2f3138', shoe: '#5b3a2a', lip: '#9a4038' },
};

function limb(a, x0, y0, ang, len, wid, col, colS) {
  a.save(); a.translate(x0, y0); a.rotate(ang);
  rr(a, -wid / 2, -wid * .3, wid, len + wid * .3, wid / 2); sh(a, col, LW2);
  a.restore();
  return [x0 - Math.sin(ang) * len, y0 + Math.cos(ang) * len];
}
// arm: shoulder angle s (0 = hanging, + = outward/up), elbow bend e (+ = forearm swings further the same way)
function arm(a, L, side, s, e, hand) {
  const sx = 410 + side * 165, sy = 640;
  const A1 = -side * s, el = limb(a, sx, sy, A1, 190, 70, L.top, L.topS);
  const A2 = A1 - side * e, wr = limb(a, el[0], el[1], A2, 170, 62, L.top, L.topS);
  // cuff + hand
  a.save(); a.translate(wr[0], wr[1]); a.rotate(A2);
  if (hand === 'open') {
    a.beginPath(); a.ellipse(0, 34, 38, 46, 0, 0, TAU); sh(a, L.skin, LW2);
    for (const fx of [-22, -7, 8, 23]) { rr(a, fx - 8, 50, 16, 52, 8); sh(a, L.skin, LW2 - 1); }
  } else if (hand === 'point') {
    a.beginPath(); a.arc(0, 30, 36, 0, TAU); sh(a, L.skin, LW2); rr(a, -10, 40, 20, 70, 10); sh(a, L.skin, LW2 - 1);
  } else if (hand === 'flat') {
    a.beginPath(); a.ellipse(0, 46, 34, 58, 0, 0, TAU); sh(a, L.skin, LW2);
  } else { a.beginPath(); a.arc(0, 30, 38, 0, TAU); sh(a, L.skin, LW2); }
  a.restore();
}

function eye(a, ex, ey, p) {
  const { blink = 0, eyes = 'open', look = [0, 0] } = p;
  a.lineCap = 'round'; a.strokeStyle = INK;
  if (eyes === 'happy') { a.beginPath(); a.moveTo(ex - 24, ey + 8); a.quadraticCurveTo(ex, ey - 30, ex + 24, ey + 8); a.lineWidth = 11; a.stroke(); return; }
  if (eyes === 'closed' || blink > .85) { a.beginPath(); a.moveTo(ex - 22, ey + 2); a.quadraticCurveTo(ex, ey + 14, ex + 22, ey + 2); a.lineWidth = 10; a.stroke(); return; }
  const big = eyes === 'wide' ? 1.2 : eyes === 'down' ? .9 : 1, ry = 34 * big * (1 - blink * .9), rx = 21 * big;
  const ox = look[0] * 9, oy = look[1] * 10 + (eyes === 'down' ? 10 : 0);
  a.beginPath(); a.ellipse(ex + ox, ey + oy, rx, ry, 0, 0, TAU); a.fillStyle = INK; a.fill();
  if (ry > 14) { a.beginPath(); a.ellipse(ex + ox - 6, ey + oy - ry * .4, 7 * big, 10 * big, -.2, 0, TAU); a.fillStyle = '#fff'; a.fill(); }
}
const BROW = { calm: [0, 0, 0], worried: [-.32, .32, -8], sad: [-.24, .24, 4], up: [-.08, .08, -22], determined: [.3, -.3, 6], think: [-.25, .1, -6] };

function face(a, L, p, cx, cy) {
  const { brows = 'calm', mouth = 'smile', talk = 0 } = p;
  // cheeks
  a.fillStyle = 'rgba(255,120,110,.32)';
  a.beginPath(); a.ellipse(cx - 112, cy + 70, 34, 20, 0, 0, TAU); a.fill(); a.beginPath(); a.ellipse(cx + 112, cy + 70, 34, 20, 0, 0, TAU); a.fill();
  eye(a, cx - 64, cy + 6, p); eye(a, cx + 64, cy + 6, p);
  const [bl, br, by] = BROW[brows] || BROW.calm;
  a.lineCap = 'round'; a.strokeStyle = INK; a.lineWidth = 12;
  for (const [bx, ang] of [[cx - 64, bl], [cx + 64, br]]) { a.save(); a.translate(bx, cy - 52 + by); a.rotate(ang); a.beginPath(); a.moveTo(-28, 0); a.lineTo(28, 0); a.stroke(); a.restore(); }
  // nose
  a.lineWidth = 7; a.strokeStyle = L.skinS; a.beginPath(); a.moveTo(cx + 6, cy + 30); a.quadraticCurveTo(cx - 6, cy + 58, cx + 10, cy + 62); a.stroke();
  const mx = cx, my = cy + 104; a.strokeStyle = INK; a.lineWidth = 10;
  if (talk > .05) { a.beginPath(); a.ellipse(mx, my + 4, 26, 8 + 24 * talk, 0, 0, TAU); sh(a, '#8a2a2a', 7); return; }
  if (mouth === 'smile') { a.beginPath(); a.moveTo(mx - 34, my - 4); a.quadraticCurveTo(mx, my + 28, mx + 34, my - 4); a.stroke(); }
  else if (mouth === 'grin' || mouth === 'open') { a.beginPath(); a.moveTo(mx - 40, my - 8); a.quadraticCurveTo(mx, my + 52, mx + 40, my - 8); a.closePath(); sh(a, '#8a2a2a', 7); }
  else if (mouth === 'o') { a.beginPath(); a.ellipse(mx, my + 6, 15, 20, 0, 0, TAU); sh(a, '#8a2a2a', 7); }
  else if (mouth === 'sad') { a.beginPath(); a.moveTo(mx - 28, my + 14); a.quadraticCurveTo(mx, my - 6, mx + 28, my + 14); a.stroke(); }
  else if (mouth === 'worried') { a.beginPath(); a.moveTo(mx - 32, my + 8); a.bezierCurveTo(mx - 14, my - 6, mx - 4, my + 14, mx + 10, my + 2); a.quadraticCurveTo(mx + 22, my - 8, mx + 32, my + 6); a.lineWidth = 9; a.stroke(); }
  else if (mouth === 'pressed') { a.beginPath(); a.moveTo(mx - 24, my + 4); a.lineTo(mx + 24, my + 4); a.stroke(); }
  else if (mouth === 'calm') { a.beginPath(); a.moveTo(mx - 22, my + 2); a.quadraticCurveTo(mx, my + 12, mx + 22, my + 2); a.stroke(); }
}

const HEAD = () => [410, 330];
function hairBack(a, L) {
  if (L.hair === 'hijab') {
    const hj = () => { a.beginPath(); a.moveTo(410, 90); a.bezierCurveTo(600, 90, 670, 250, 650, 420); a.bezierCurveTo(640, 520, 690, 600, 720, 700); a.quadraticCurveTo(410, 790, 100, 700); a.bezierCurveTo(130, 600, 180, 520, 170, 420); a.bezierCurveTo(150, 250, 220, 90, 410, 90); a.closePath(); };
    crescent(a, hj, L.hijabS, -30, 24, L.hijab); hj(); sh(a, null, LW);
  }
}
function hairFront(a, L) {
  const [hx, hy] = HEAD();
  if (L.hair === 'arti') {
    const h = () => { a.beginPath(); a.moveTo(hx - 196, hy + 40); a.bezierCurveTo(hx - 236, hy - 90, hx - 170, hy - 230, hx - 40, hy - 238); a.bezierCurveTo(hx + 90, hy - 262, hx + 236, hy - 190, hx + 214, hy + 30); a.bezierCurveTo(hx + 200, hy - 40, hx + 180, hy - 76, hx + 146, hy - 92); a.bezierCurveTo(hx + 150, hy - 50, hx + 110, hy - 40, hx + 92, hy - 76); a.bezierCurveTo(hx + 30, hy - 110, hx - 60, hy - 112, hx - 140, hy - 70); a.bezierCurveTo(hx - 170, hy - 40, hx - 178, hy, hx - 196, hy + 40); a.closePath(); };
    crescent(a, h, '#1c1612', 18, 22, L.hairC); h(); sh(a, null, LW);
    a.beginPath(); a.moveTo(hx - 40, hy - 214); a.quadraticCurveTo(hx + 110, hy - 236, hx + 150, hy - 140); a.lineWidth = 14; a.strokeStyle = '#6a625b'; a.lineCap = 'round'; a.stroke();
  } else if (L.hair === 'curly') {
    a.fillStyle = L.hairC; a.strokeStyle = INK; a.lineWidth = LW;
    const pts = [[-170, -40, 62], [-150, -130, 70], [-80, -190, 74], [10, -212, 76], [100, -196, 74], [160, -130, 70], [180, -40, 60], [-60, -120, 64], [40, -136, 66]];
    for (const [dx, dy, r] of pts) { a.beginPath(); a.arc(hx + dx, hy + dy, r, 0, TAU); a.fill(); a.stroke(); }
    for (const [dx, dy, r] of pts) { a.beginPath(); a.arc(hx + dx, hy + dy, r - 6, 0, TAU); a.fill(); }
    a.strokeStyle = '#4a3d34'; a.lineWidth = 6; for (const [dx, dy] of [[-90, -170], [20, -190], [120, -160]]) { a.beginPath(); a.arc(hx + dx, hy + dy, 22, Math.PI * 1.1, Math.PI * 1.9); a.stroke(); }
  } else if (L.hair === 'hijab') {
    const fr = () => { a.beginPath(); a.moveTo(hx - 200, hy + 40); a.bezierCurveTo(hx - 206, hy - 150, hx - 110, hy - 220, hx, hy - 222); a.bezierCurveTo(hx + 110, hy - 220, hx + 206, hy - 150, hx + 200, hy + 40); a.bezierCurveTo(hx + 190, hy - 70, hx + 120, hy - 150, hx, hy - 150); a.bezierCurveTo(hx - 120, hy - 150, hx - 190, hy - 70, hx - 200, hy + 40); a.closePath(); };
    fr(); sh(a, L.hijab, LW);
  }
}

// p: {armL, armR, elbL, elbR, handL, handR, eyes, brows, mouth, look, blink, tilt, talk, slump}
export function drawPerson(x, L, p = {}) {
  const { armL = .12, armR = .12, elbL = 0, elbR = 0, handL = 'fist', handR = 'fist', tilt = 0, slump = 0 } = p;
  x.clearRect(0, 0, CW, CH);
  const W = cv(CW, CH), a = W.getContext('2d');
  // legs / skirt
  if (L.skirt) {
    const sk = () => { a.beginPath(); a.moveTo(300, 960); a.lineTo(520, 960); a.lineTo(560, 1400); a.quadraticCurveTo(410, 1420, 260, 1400); a.closePath(); };
    crescent(a, sk, L.lowS, -26, 0, L.low); sk(); sh(a, null, LW);
  } else {
    for (const lx of [345, 475]) { const up = Math.max(0, (lx < 400 ? 1 : -1) * (p.step || 0)) * 46; const lg = () => { rr(a, lx - 58, 960, 116, 440 - up, 30); }; crescent(a, lg, L.lowS, -20, 0, L.low); lg(); sh(a, null, LW); }
  }
  for (const lx of [345, 475]) { const up = L.skirt ? 0 : Math.max(0, (lx < 400 ? 1 : -1) * (p.step || 0)) * 46; blob(a, lx + 8, 1428 - up, 76, 40, .03, lx); sh(a, L.shoe, LW2 + 1); }
  // back hijab drape
  a.save(); a.translate(410, 960); a.rotate(slump * .04); a.translate(-410, -960);
  hairBack(a, L);
  // torso
  const torso = () => { a.beginPath(); a.moveTo(250, 640); a.quadraticCurveTo(410, 590, 570, 640); a.lineTo(590, 1000); a.quadraticCurveTo(410, 1030, 230, 1000); a.closePath(); };
  crescent(a, torso, L.topS, -30, 0, L.top); torso(); sh(a, null, LW);
  if (L.hair !== 'hijab') {
    a.beginPath(); a.moveTo(360, 610); a.lineTo(460, 610); a.lineTo(450, 1005); a.lineTo(370, 1005); a.closePath(); sh(a, L.inner, LW2);
    a.beginPath(); a.moveTo(352, 612); a.lineTo(395, 760); a.lineTo(330, 700); a.closePath(); sh(a, L.topS, LW2);
    a.beginPath(); a.moveTo(468, 612); a.lineTo(425, 760); a.lineTo(490, 700); a.closePath(); sh(a, L.topS, LW2);
  } else { a.beginPath(); a.moveTo(380, 760); a.lineTo(440, 760); a.lineTo(440, 1005); a.lineTo(380, 1005); a.closePath(); sh(a, L.inner, LW2); }
  // arms (behind-the-head order is fine for a flat card)
  arm(a, L, -1, armR, elbR, handR); arm(a, L, 1, armL, elbL, handL);
  // neck + head
  const [hx, hy] = HEAD();
  a.save(); a.translate(hx, hy + 210); a.rotate(tilt); a.translate(-hx, -(hy + 210));
  if (L.hair !== 'hijab') { rr(a, hx - 42, hy + 150, 84, 120, 30); sh(a, L.skin, LW2); a.beginPath(); a.ellipse(hx - 188, hy + 20, 32, 44, 0, 0, TAU); sh(a, L.skin, LW2); a.beginPath(); a.ellipse(hx + 188, hy + 20, 32, 44, 0, 0, TAU); sh(a, L.skin, LW2); }
  const head = () => { a.beginPath(); a.ellipse(hx, hy + 10, 190, 205, 0, 0, TAU); };
  crescent(a, head, L.skinS, 30, 24, L.skin); head(); sh(a, null, LW + 1);
  hairFront(a, L);
  face(a, L, p, hx, hy + 20);
  a.restore();
  a.restore();
  x.drawImage(finishCut(W, 16, { grainA: .7 }), 0, 0);
}
// back view (for the reverse shot)
export function drawPersonBack(x, L, p = {}) {
  const { armL = .12, armR = .12 } = p;
  x.clearRect(0, 0, CW, CH);
  const W = cv(CW, CH), a = W.getContext('2d');
  for (const lx of [345, 475]) { rr(a, lx - 58, 960, 116, 440, 30); sh(a, L.low, LW); blob(a, lx + 8, 1428, 76, 40, .03, lx); sh(a, L.shoe, LW2 + 1); }
  const torso = () => { a.beginPath(); a.moveTo(250, 640); a.quadraticCurveTo(410, 590, 570, 640); a.lineTo(590, 1000); a.quadraticCurveTo(410, 1030, 230, 1000); a.closePath(); };
  crescent(a, torso, L.topS, 30, 0, L.top); torso(); sh(a, null, LW);
  a.beginPath(); a.moveTo(410, 640); a.lineTo(410, 1000); a.lineWidth = LW2; a.strokeStyle = L.topS; a.stroke();
  arm(a, L, -1, armL, 0, 'fist'); arm(a, L, 1, armR, 0, 'fist');
  const [hx, hy] = HEAD();
  rr(a, hx - 42, hy + 150, 84, 120, 30); sh(a, L.skin, LW2);
  a.beginPath(); a.ellipse(hx - 188, hy + 20, 32, 44, 0, 0, TAU); sh(a, L.skin, LW2); a.beginPath(); a.ellipse(hx + 188, hy + 20, 32, 44, 0, 0, TAU); sh(a, L.skin, LW2);
  const hd = () => { a.beginPath(); a.ellipse(hx, hy - 10, 205, 222, 0, 0, TAU); };
  crescent(a, hd, '#1c1612', -18, 20, L.hairC); hd(); sh(a, null, LW + 1);
  a.beginPath(); a.moveTo(hx + 40, hy - 214); a.quadraticCurveTo(hx - 110, hy - 236, hx - 150, hy - 140); a.lineWidth = 14; a.strokeStyle = '#6a625b'; a.lineCap = 'round'; a.stroke();
  x.drawImage(finishCut(W, 16, { grainA: .7 }), 0, 0);
}

// ================= page art (2048 × 1396 for 0.44 × 0.30 m) =================
export const PW = 2048, PH = 1396;
const gx = m => (m / .44 + .5) * PW, gy = m => (1 - m / .30) * PH;   // backdrop: metres → px (y up)

export function wallMeeting(mode = 'day') {
  const c = cv(PW, PH), x = c.getContext('2d');
  paperFill(x, PW, PH, mode === 'morning' ? '#eee3c9' : '#e3ecd9', 3);
  // wainscot
  x.fillStyle = mode === 'morning' ? '#c9c39c' : '#aecba6'; x.fillRect(0, PH * .74, PW, PH * .26);
  x.fillStyle = '#0f3822'; x.fillRect(0, PH * .735, PW, 14);
  for (let i = 0; i < 9; i++) { x.strokeStyle = 'rgba(15,56,34,.25)'; x.lineWidth = 5; x.strokeRect(40 + i * 225, PH * .77, 180, PH * .19); }
  // window
  const wx = 120, wy = 230, ww = 520, wh = 470;
  x.fillStyle = mode === 'morning' ? '#ffd9a0' : '#bfe3f3'; x.fillRect(wx, wy, ww, wh);
  x.fillStyle = mode === 'morning' ? '#f6b26b' : '#8fcf8f'; x.beginPath(); x.ellipse(wx + ww * .3, wy + wh, ww * .45, 120, 0, Math.PI, 0); x.fill();
  x.beginPath(); x.ellipse(wx + ww * .8, wy + wh, ww * .35, 90, 0, Math.PI, 0); x.fillStyle = mode === 'morning' ? '#e89b55' : '#79c07a'; x.fill();
  if (mode === 'morning') { x.fillStyle = '#ff8a3d'; x.beginPath(); x.arc(wx + ww * .7, wy + wh * .55, 70, 0, TAU); x.fill(); }
  x.lineWidth = 22; x.strokeStyle = '#fffaf0'; x.strokeRect(wx, wy, ww, wh); x.beginPath(); x.moveTo(wx + ww / 2, wy); x.lineTo(wx + ww / 2, wy + wh); x.moveTo(wx, wy + wh / 2); x.lineTo(wx + ww, wy + wh / 2); x.stroke();
  x.lineWidth = 8; x.strokeStyle = INK; x.strokeRect(wx - 11, wy - 11, ww + 22, wh + 22);
  if (mode === 'morning') { // light shaft
    const g = x.createLinearGradient(wx + ww, wy, wx + ww + 700, PH); g.addColorStop(0, 'rgba(255,214,150,.55)'); g.addColorStop(1, 'rgba(255,214,150,0)');
    x.fillStyle = g; x.beginPath(); x.moveTo(wx + ww * .5, wy); x.lineTo(wx + ww, wy); x.lineTo(wx + ww + 820, PH); x.lineTo(wx + 300, PH); x.closePath(); x.fill();
  }
  x.save(); x.globalAlpha = .5; x.fillStyle = x.createPattern(GRAIN, 'repeat'); x.fillRect(0, 0, PW, PH); x.restore();
  return c;
}
export function floorMeeting() {
  const c = cv(PW, PH), x = c.getContext('2d');
  paperFill(x, PW, PH, '#c8d3c1', 5);
  x.fillStyle = 'rgba(15,56,34,.08)'; for (let i = 0; i < 30; i++) x.fillRect(0, i * 48, PW, 3);
  return c;
}
export function wallNight(mode = 'night') {
  const c = cv(PW, PH), x = c.getContext('2d');
  const dawn = mode === 'dawn';
  paperFill(x, PW, PH, dawn ? '#5b6aa6' : '#2c3768', 8, .08);
  // window
  const wx = 760, wy = 200, ww = 560, wh = 520;
  const g = x.createLinearGradient(0, wy, 0, wy + wh); g.addColorStop(0, dawn ? '#3c4f99' : '#141c45'); g.addColorStop(1, dawn ? '#ffb27a' : '#3a4a8c');
  x.fillStyle = g; x.fillRect(wx, wy, ww, wh);
  const R = mulberry(4); x.fillStyle = '#fff6c8'; for (let i = 0; i < 26; i++) { x.beginPath(); x.arc(wx + R() * ww, wy + R() * wh * .7, 3 + R() * 4, 0, TAU); x.fill(); }
  x.fillStyle = '#1b2350'; x.beginPath(); x.moveTo(wx, wy + wh); for (let i = 0; i <= 8; i++) x.lineTo(wx + i * ww / 8, wy + wh - 60 - (i % 3) * 40 - R() * 40); x.lineTo(wx + ww, wy + wh); x.fill();
  x.lineWidth = 22; x.strokeStyle = '#f1e6cf'; x.strokeRect(wx, wy, ww, wh); x.beginPath(); x.moveTo(wx + ww / 2, wy); x.lineTo(wx + ww / 2, wy + wh); x.stroke();
  x.lineWidth = 8; x.strokeStyle = INK; x.strokeRect(wx - 11, wy - 11, ww + 22, wh + 22);
  // curtains
  for (const [cx0, dir] of [[wx - 110, 1], [wx + ww + 10, -1]]) { const cu = () => { x.beginPath(); x.moveTo(cx0, wy - 60); x.lineTo(cx0 + 100, wy - 60); x.quadraticCurveTo(cx0 + 50 + dir * 30, wy + 300, cx0 + 100, wy + wh + 80); x.lineTo(cx0, wy + wh + 80); x.closePath(); }; crescent(x, cu, '#7a3f2e', 18 * dir, 0, '#a8553c'); cu(); sh(x, null, 8); }
  // shelf + frame
  x.fillStyle = '#8a5a34'; x.fillRect(150, 520, 420, 26); x.lineWidth = 6; x.strokeStyle = INK; x.strokeRect(150, 520, 420, 26);
  rr(x, 200, 380, 120, 140, 6); sh(x, '#f1e6cf', 6); rr(x, 360, 420, 70, 100, 6); sh(x, '#ff5500', 6); rr(x, 450, 400, 60, 120, 6); sh(x, '#2f6845', 6);
  x.fillStyle = 'rgba(10,12,40,.35)'; x.fillRect(0, PH * .78, PW, PH * .22);
  x.save(); x.globalAlpha = .45; x.fillStyle = x.createPattern(GRAIN, 'repeat'); x.fillRect(0, 0, PW, PH); x.restore();
  return c;
}
export function floorNight() {
  const c = cv(PW, PH), x = c.getContext('2d');
  paperFill(x, PW, PH, '#8a6a52', 9, .07);
  for (let i = 0; i < 14; i++) { x.fillStyle = 'rgba(40,25,15,.18)'; x.fillRect(0, i * 100, PW, 4); }
  x.fillStyle = '#c96f4a'; x.beginPath(); x.ellipse(PW * .5, PH * .62, 620, 260, 0, 0, TAU); x.fill();
  x.lineWidth = 14; x.strokeStyle = '#f1e6cf'; x.beginPath(); x.ellipse(PW * .5, PH * .62, 560, 220, 0, 0, TAU); x.stroke();
  return c;
}

// ================= props =================
export function table(w) {
  return cut(w, .021, (x, W, H) => {
    const top = () => { x.beginPath(); x.moveTo(0, H * .05); x.lineTo(W, H * .05); x.lineTo(W, H * .3); x.lineTo(0, H * .3); x.closePath(); };
    crescent(x, top, '#9a6a44', 0, 14, '#c08a5c'); top(); sh(x, null, LW);
    const fr = () => { x.beginPath(); x.moveTo(W * .02, H * .3); x.lineTo(W * .98, H * .3); x.lineTo(W * .96, H); x.lineTo(W * .04, H); x.closePath(); };
    crescent(x, fr, '#6e4a31', 0, -20, '#8a5e3f'); fr(); sh(x, null, LW);
    x.strokeStyle = 'rgba(40,25,15,.25)'; x.lineWidth = 4; for (let i = 1; i < 6; i++) { x.beginPath(); x.moveTo(W * .05, H * (.3 + i * .12)); x.bezierCurveTo(W * .3, H * (.32 + i * .12), W * .6, H * (.28 + i * .12), W * .95, H * (.3 + i * .12)); x.stroke(); }
  });
}
export function laptop(w) {
  return cut(w, w * .62, (x, W, H) => { rr(x, W * .08, 0, W * .84, H * .9, 18); sh(x, '#4a5262', LW); x.beginPath(); x.arc(W / 2, H * .45, W * .08, 0, TAU); x.fillStyle = '#c9ced8'; x.fill(); rr(x, 0, H * .88, W, H * .12, 8); sh(x, '#6a7282', LW2); });
}
export function mug(h) {
  return cut(h * .8, h, (x, W, H) => { rr(x, 0, 0, W * .8, H, 20); sh(x, '#fffaf0', LW); x.beginPath(); x.arc(W * .82, H * .45, H * .22, -Math.PI / 2, Math.PI / 2); x.lineWidth = 16; x.strokeStyle = INK; x.stroke(); x.fillStyle = '#ff5500'; x.fillRect(W * .1, H * .35, W * .6, H * .18); });
}
export function plant(h) {
  return cut(h * .7, h, (x, W, H) => {
    for (const [r, c] of [[-.5, '#3e8e5c'], [-.2, '#5baa74'], [.15, '#3e8e5c'], [.45, '#5baa74'], [0, '#6cbb82']]) { x.save(); x.translate(W / 2, H * .62); x.rotate(r); x.beginPath(); x.ellipse(0, -H * .28, W * .14, H * .3, 0, 0, TAU); sh(x, c, LW2); x.restore(); }
    const p = () => { x.beginPath(); x.moveTo(W * .22, H * .6); x.lineTo(W * .78, H * .6); x.lineTo(W * .7, H); x.lineTo(W * .3, H); x.closePath(); };
    crescent(x, p, '#a8552c', 14, 0, '#c86b3c'); p(); sh(x, null, LW);
  });
}
export function whiteboard(w) {
  return cut(w, w * .66, (x, W, H) => {
    rr(x, 0, 0, W, H * .9, 20); sh(x, '#fffdf7', LW); rr(x, W * .08, H * .1, W * .4, H * .07, 8); x.fillStyle = INK; x.fill();
    const bars = [.35, .55, .45, .8]; bars.forEach((b, i) => { rr(x, W * (.12 + i * .2), H * (.82 - b * .6), W * .13, H * b * .6, 6); sh(x, i === 3 ? '#ff5500' : '#3e4a68', LW2); });
    rr(x, W * .3, H * .9, W * .4, H * .08, 6); sh(x, '#9aa0a8', LW2);
  });
}
export function clockFace(d) {
  return cut(d, d, (x, W, H) => {
    x.beginPath(); x.arc(W / 2, H / 2, W * .48, 0, TAU); sh(x, '#fffdf7', LW + 4);
    x.strokeStyle = INK; x.lineWidth = 8; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; x.beginPath(); x.moveTo(W / 2 + Math.cos(a) * W * .36, H / 2 + Math.sin(a) * W * .36); x.lineTo(W / 2 + Math.cos(a) * W * .42, H / 2 + Math.sin(a) * W * .42); x.stroke(); }
  }, { ay: .5 });
}
export function clockHand(len, wid, col) {
  return cut(wid, len, (x, W, H) => { rr(x, 0, 0, W, H, W / 2); sh(x, col, LW2); }, { ay: 1, border: 0, pad: 20 });
}
export function bulb(h) {
  return cut(h * .72, h, (x, W, H) => {
    const g = x.createRadialGradient(W / 2, H * .38, 0, W / 2, H * .38, W * .7); g.addColorStop(0, 'rgba(255,214,90,.0)'); x.fillStyle = g;
    const b = () => { x.beginPath(); x.moveTo(W * .5, 0); x.bezierCurveTo(W * 1.02, 0, W * 1.02, H * .55, W * .7, H * .7); x.lineTo(W * .3, H * .7); x.bezierCurveTo(-W * .02, H * .55, -W * .02, 0, W * .5, 0); x.closePath(); };
    crescent(x, b, '#f2b92e', -18, 18, '#ffd84a'); b(); sh(x, null, LW);
    rr(x, W * .3, H * .72, W * .4, H * .12, 8); sh(x, '#9aa0a8', LW2); rr(x, W * .34, H * .86, W * .32, H * .1, 8); sh(x, '#7a8088', LW2);
    x.strokeStyle = '#fff'; x.lineWidth = 10; x.lineCap = 'round'; x.beginPath(); x.arc(W * .36, H * .3, W * .14, Math.PI * 1.1, Math.PI * 1.5); x.stroke();
  }, { ay: 0 });
}
export function cloudCard(w, kind) {
  return cut(w, w * .6, (x, W, H) => {
    const p = () => { x.beginPath(); x.moveTo(W * .12, H * .9); x.arc(W * .2, H * .62, H * .3, Math.PI * .55, Math.PI * 1.5); x.arc(W * .44, H * .4, H * .38, Math.PI * 1.08, Math.PI * 1.9); x.arc(W * .72, H * .46, H * .34, Math.PI * 1.25, Math.PI * .15); x.arc(W * .84, H * .7, H * .2, Math.PI * 1.6, Math.PI * .55); x.closePath(); };
    const dark = kind === 'worry';
    crescent(x, p, dark ? '#7c8294' : '#d7e6f2', 0, -22, dark ? '#a3a9b8' : '#ffffff'); p(); sh(x, null, LW);
    if (kind === 'idea') {
      const bx = W * .36, by = H * .5; x.beginPath(); x.arc(bx, by - 20, 62, 0, TAU); sh(x, '#ffd84a', LW2); rr(x, bx - 26, by + 40, 52, 34, 6); sh(x, '#9aa0a8', LW2);
      rr(x, W * .55, H * .26, W * .2, H * .46, 10); sh(x, '#fffdf7', LW2); for (let i = 0; i < 4; i++) { rr(x, W * .58, H * (.33 + i * .09), W * (i === 3 ? .08 : .14), 12, 6); x.fillStyle = i === 0 ? '#ff5500' : '#9aa0a8'; x.fill(); }
    } else if (kind === 'worry') {
      x.fillStyle = '#241814'; x.textAlign = 'center'; x.font = `600 ${Math.round(W * .105)}px Fredoka`; x.fillText('Nanti dibilang', W * .5, H * .52);
      x.fillStyle = '#c7380c'; x.font = `700 ${Math.round(W * .14)}px Fredoka`; x.fillText('sok tahu...', W * .5, H * .76);
    }
  }, { ay: 0 });
}
export function check(d) {
  return cut(d, d, (x, W, H) => { x.beginPath(); x.arc(W / 2, H / 2, W * .46, 0, TAU); sh(x, '#2f9e5b', LW); x.beginPath(); x.moveTo(W * .28, H * .52); x.lineTo(W * .44, H * .68); x.lineTo(W * .74, H * .34); x.lineWidth = 34; x.strokeStyle = '#fff'; x.lineCap = 'round'; x.lineJoin = 'round'; x.stroke(); }, { ay: .5 });
}
export function disc(d, col = '#ff5500') {
  return cut(d, d, (x, W, H) => { const p = () => blob(x, W / 2, H / 2, W * .47, H * .47, .025, 17); crescent(x, p, '#e04400', -26, 22, col); p(); sh(x, null, LW + 2); }, { ay: .5 });
}
export function stick(h) { return cut(.006, h, (x, W, H) => { rr(x, 0, 0, W, H, W / 2); sh(x, '#8d5a31', LW2); }, { border: 0, pad: 20 }); }
// meaning card on a post: RENDAH HATI / PERCAYA DIRI
export function meaningCard(w, title, body, col, icon, post = true) {
  return cut(w, w * (post ? 1.05 : .7), (x, W, H) => {
    if (post) { rr(x, W / 2 - 22, H * .62, 44, H * .38, 10); sh(x, '#8d5a31', LW2); } else H = H / .66 * 1.0;
    const c = () => { x.beginPath(); x.roundRect(0, 0, W, H * .66, 40); };
    crescent(x, c, col === '#ff5500' ? '#d94600' : '#0a2a19', 0, 18, col); c(); sh(x, null, LW);
    x.save(); x.translate(W / 2, H * .13); x.strokeStyle = '#fffaf0'; x.lineWidth = 16; x.lineCap = 'round'; x.lineJoin = 'round';
    if (icon === 'people') { for (const [dx, r, s] of [[0, 34, 1], [-80, 26, .8], [80, 26, .8]]) { x.beginPath(); x.arc(dx, 0, r, 0, TAU); x.stroke(); x.beginPath(); x.arc(dx, 90 * s, 60 * s, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); } }
    else { x.beginPath(); x.moveTo(-90, -20); x.lineTo(-90, 40); x.lineTo(-40, 40); x.lineTo(70, 100); x.lineTo(70, -80); x.lineTo(-40, -20); x.closePath(); x.stroke(); x.beginPath(); x.arc(100, 10, 40, -.8, .8); x.stroke(); }
    x.restore();
    x.fillStyle = '#fffaf0'; x.textAlign = 'center'; x.font = `${Math.round(W * .13)}px "Lilita One"`; x.fillText(title, W / 2, H * .41);
    x.font = `600 ${Math.round(W * .062)}px Fredoka`; const words = body.split(' '); let line = '', ly = H * .5;
    for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (x.measureText(t).width > W * .84) { x.fillText(line, W / 2, ly); line = wd; ly += W * .075; } else line = t; }
    x.fillText(line, W / 2, ly);
  });
}
// a paper path (stones) laid on the floor, drawn lengthways (top = far end)
export function pathStrip(w, l) {
  const c = cv(Math.round(w * PPM), Math.round(l * PPM)), x = c.getContext('2d'), W = c.width, H = c.height, R = mulberry(31);
  for (let i = 0; i < 9; i++) { const y = H * (i + .5) / 9; blob(x, W / 2 + (R() - .5) * W * .3, y, W * .32, H / 9 * .36, .08, i + 3); sh(x, i % 2 ? '#f6e7c8' : '#ffd9a0', LW); }
  return finishCut(c, 10, { grainA: .6 });
}

// a hanging meaning card: icon, title, one-line meaning
export function hangCard(w, title, body, col, icon) {
  return cut(w, w * .9, (x, W, H) => {
    const c = () => { x.beginPath(); x.roundRect(0, 0, W, H, W * .12); };
    crescent(x, c, col === '#ff5500' ? '#d94600' : '#0a2a19', 0, 16, col); c(); sh(x, null, LW);
    x.save(); x.translate(W / 2, H * .26); const k = W / 520; x.scale(k, k); x.strokeStyle = '#fffaf0'; x.lineWidth = 18; x.lineCap = 'round'; x.lineJoin = 'round';
    if (icon === 'people') { for (const [dx, r, s] of [[0, 34, 1], [-90, 26, .8], [90, 26, .8]]) { x.beginPath(); x.arc(dx, -20, r, 0, TAU); x.stroke(); x.beginPath(); x.arc(dx, 70 * s, 56 * s, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); } }
    else { x.beginPath(); x.moveTo(-90, -40); x.lineTo(-90, 20); x.lineTo(-40, 20); x.lineTo(70, 80); x.lineTo(70, -100); x.lineTo(-40, -40); x.closePath(); x.stroke(); x.beginPath(); x.arc(100, -10, 40, -.8, .8); x.stroke(); }
    x.restore();
    x.fillStyle = '#fffaf0'; x.textAlign = 'center'; x.font = `${Math.round(W * .135)}px "Lilita One"`; x.fillText(title, W / 2, H * .64);
    x.font = `600 ${Math.round(W * .068)}px Fredoka`; const words = body.split(' '); let line = '', ly = H * .78;
    for (const wd of words) { const t = line ? line + ' ' + wd : wd; if (x.measureText(t).width > W * .86) { x.fillText(line, W / 2, ly); line = wd; ly += W * .08; } else line = t; }
    x.fillText(line, W / 2, ly);
  });
}
