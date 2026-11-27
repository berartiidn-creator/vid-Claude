// 2D overlay (1080×1920): narration subtitles, bubbles, hanging cardboard signs (DIAM, Follow)
import { BUB, MUTE_SUBS, DUR } from './story.js';
import { clamp, seg, back, ss, lerp } from './engine/lib.js';

const INK = '#3a2a24';
export const CPS = 26;
export const W = 1080, H = 1920;

// subtitle pages from word timings: ≤ 32 characters, broken at punctuation when possible
export function buildCues(words) {
  const cues = []; let cur = [];
  const txt = a => a.map(w => w.word).join(' ');
  const flush = () => { if (!cur.length) return; cues.push({ t0: cur[0].start, t1: cur[cur.length - 1].end, text: txt(cur) }); cur = []; };
  for (const w of words) {
    if (cur.length && (txt(cur) + ' ' + w.word).length > 30) flush();
    cur.push(w);
    if (/[.?!]$/.test(w.word) || (/,$/.test(w.word) && txt(cur).length > 16)) flush();
  }
  flush();
  cues.forEach((c, i) => { const nx = cues[i + 1]; c.t1 = Math.min(nx ? nx.t0 - .02 : c.t1 + .8, c.t1 + .6); c.t0 -= .06; });
  return cues;
}
const muted = t => MUTE_SUBS.some(([a, b]) => t >= a && t < b);
export function drawSubs(x, t, cues) {
  if (muted(t)) return;
  const cur = cues.filter(c => t >= c.t0 && t < c.t1).slice(-1);
  for (const c of cur) {
    const a = Math.min(seg(t, c.t0, c.t0 + .12), 1 - seg(t, c.t1 - .08, c.t1));
    x.save(); x.globalAlpha = a; x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.lineJoin = 'round';
    x.font = '600 50px Fredoka';
    x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 16;
    x.lineWidth = 11; x.strokeStyle = 'rgba(40,24,14,.85)'; x.strokeText(c.text, W / 2, 1540);
    x.shadowBlur = 0; x.fillStyle = '#fffaf0'; x.fillText(c.text, W / 2, 1540);
    x.restore();
  }
}
export function subsTexts(t, cues) { if (muted(t)) return []; return cues.filter(c => t >= c.t0 && t < c.t1).map((c, i) => ({ id: 'sub' + c.t0, text: c.text, x0: 60, y0: 1450, x1: 1020, y1: 1515, pass: true })); }

function wrap(x, text, maxW) {
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const s = cur ? cur + ' ' + w : w; if (x.measureText(s).width > maxW && cur) { lines.push(cur); cur = w; } else cur = s; }
  if (cur) lines.push(cur); return lines;
}
// anchors: who → [sx, sy] screen point at the top of the speaker's head
export function drawBubbles(x, t, anchors) {
  for (const [who, t0, t1, text, kind] of BUB) {
    if (t < t0 - .05 || t > t1 + .25) continue;
    const an = anchors[who]; if (!an) continue;
    const k = back(seg(t, t0, t0 + .24), 2.0) * (1 - ss(seg(t, t1, t1 + .2)));
    if (k <= 0) continue;
    const n = Math.floor(clamp((t - t0 - .12) * CPS, 0, text.length));
    x.save(); x.font = '600 54px Fredoka';
    const lines = wrap(x, text, 640), tw = Math.max(...lines.map(l => x.measureText(l).width), 240);
    const bw = tw + 96, bh = 70 + lines.length * 66;
    const bx = clamp(an[0] - bw * .4, 40, W - 40 - bw), by = clamp(an[1] - bh - 110, 200, 1300);
    const tx = clamp(an[0], bx + 60, bx + bw - 60);
    x.translate(tx, by + bh); x.scale(k, k); x.translate(-tx, -(by + bh));
    x.fillStyle = 'rgba(40,25,15,.22)'; x.beginPath(); x.roundRect(bx + 8, by + 12, bw, bh, 46); x.fill();
    x.lineWidth = 7; x.strokeStyle = INK; x.lineJoin = 'round'; x.fillStyle = '#fffdf8';
    if (kind === 'think') {
      for (const [f, r] of [[.45, 22], [.75, 13]]) { x.beginPath(); x.arc(lerp(tx, an[0], f), lerp(by + bh + 20, an[1] - 20, f), r, 0, Math.PI * 2); x.fill(); x.stroke(); }
      x.beginPath(); x.roundRect(bx, by, bw, bh, 60); x.fill(); x.stroke();
    } else {
      x.beginPath(); x.roundRect(bx, by, bw, bh, 46); x.fill(); x.stroke();
      x.beginPath(); x.moveTo(tx - 28, by + bh - 3); x.lineTo(lerp(tx, an[0], .7), Math.min(an[1] - 14, by + bh + 64)); x.lineTo(tx + 22, by + bh - 3); x.closePath(); x.fill(); x.stroke();
      x.fillRect(tx - 24, by + bh - 10, 44, 11);
    }
    x.fillStyle = '#241814'; x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    let left = n;
    lines.forEach((l, i) => { const s = l.slice(0, Math.max(0, left)); left -= l.length + 1; x.fillText(s, bx + 48, by + 82 + i * 66); });
    x.restore();
  }
}
export function bubbleTexts(t) {
  return BUB.filter(([, t0, t1]) => t >= t0 && t <= t1).map(([who, t0, , text]) => ({ id: 'bub' + t0, text, x0: 60, y0: 300, x1: 1020, y1: 700 }));
}
export function blipTimes() {
  const ev = [];
  for (const [who, t0, , text] of BUB) for (let i = 0; i < text.length; i++) if (/[A-Za-z?!]/.test(text[i]) && i % 2 === 0) ev.push({ t: t0 + .12 + i / CPS, type: 'blip', who });
  return ev;
}

// a cardboard sign that drops on two strings and swings
export function hangSign(x, t, t0, t1, draw, cx = 540, cy = 520, w = 640, h = 300) {
  if (t < t0 || t > t1 + .7) return;
  const kin = seg(t, t0, t0 + .7), kout = seg(t, t1, t1 + .6);
  const drop = (1 - back(kin, 1.5)) * -900 - ss(kout) * 1100, sw = Math.sin((t - t0) * 3.4) * .045 * (1 - kin * .55) * (1 - kout);
  x.save(); x.translate(cx, cy + drop); x.rotate(sw);
  x.strokeStyle = '#6b5a4a'; x.lineWidth = 4; x.beginPath(); x.moveTo(-w * .36, -h / 2); x.lineTo(-w * .36, -h / 2 - 1400); x.moveTo(w * .36, -h / 2); x.lineTo(w * .36, -h / 2 - 1400); x.stroke();
  x.fillStyle = 'rgba(30,20,12,.28)'; x.beginPath(); x.roundRect(-w / 2 + 12, -h / 2 + 16, w, h, 26); x.fill();
  x.fillStyle = '#b9ad9c'; x.beginPath(); x.roundRect(-w / 2 - 6, -h / 2 + 4, w + 12, h + 6, 28); x.fill();
  x.fillStyle = '#e8d4ad'; x.beginPath(); x.roundRect(-w / 2, -h / 2, w, h, 26); x.fill(); x.lineWidth = 8; x.strokeStyle = INK; x.stroke();
  for (const sx of [-w * .36, w * .36]) { x.beginPath(); x.arc(sx, -h / 2 + 26, 10, 0, Math.PI * 2); x.fillStyle = '#6b5a4a'; x.fill(); }
  draw(x, w, h);
  x.restore();
}
export function drawSigns(x, t, T) {
  hangSign(x, t, T.diam - .1, T.sampai - .15, (k, w, h) => {
    k.textAlign = 'center'; k.textBaseline = 'middle'; k.font = '190px "Lilita One"'; k.lineJoin = 'round';
    k.lineWidth = 22; k.strokeStyle = INK; k.strokeText('DIAM', 0, 18); k.fillStyle = '#ff5500'; k.fillText('DIAM', 0, 18);
  }, 600, 470, 600, 290);
  hangSign(x, t, T.follow + .9, 99, (k, w, h) => {
    k.textAlign = 'center'; k.textBaseline = 'middle';
    k.font = '600 46px Fredoka'; k.fillStyle = '#5a4434'; k.fillText('kamu yang ngomong berikutnya', 0, -70);
    k.font = '96px "Lilita One"'; k.lineJoin = 'round'; k.lineWidth = 16; k.strokeStyle = INK; k.strokeText('Follow', 0, 20); k.fillStyle = '#ff5500'; k.fillText('Follow', 0, 20);
    k.font = '700 60px Fredoka'; k.fillStyle = '#0f3822'; k.fillText('@firasbyzi', 0, 104);
  }, 540, 400, 760, 330);
}
export function signTexts(t, T) {
  const out = [];
  if (t > T.diam + .4 && t < T.sampai - .15) out.push({ id: 'diam', text: 'DIAM', x0: 300, y0: 330, x1: 900, y1: 620 });
  if (t > T.follow + 1.5) out.push({ id: 'follow', text: 'Follow @firasbyzi', x0: 160, y0: 400, x1: 920, y1: 730 });
  return out;
}
