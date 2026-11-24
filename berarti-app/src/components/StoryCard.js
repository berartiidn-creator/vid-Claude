import { DIMS, ARCHETYPES, strongest, total } from '../../shared/index-model.js';

// Instagram Story card (1080×1920) drawn on a canvas → PNG blob
export async function storyBlob(scores) {
  try { await Promise.all(['72px "Archivo Black"', '600 40px Poppins', '700 40px Poppins'].map(f => document.fonts.load(f))); } catch {}
  const W = 1080, H = 1920, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  x.fillStyle = '#FAF3ED'; x.fillRect(0, 0, W, H);
  x.fillStyle = '#0F3822'; x.fillRect(0, H - 300, W, 300); x.fillStyle = '#FF5500'; x.fillRect(0, H - 300, W, 10);
  x.fillStyle = '#FF5500'; x.beginPath(); x.arc(W / 2, 720, 380, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#FF5500'; x.font = '600 40px Poppins'; x.textAlign = 'left'; x.fillRect(90, 196, 60, 8); x.fillText('ARCHETYPE KAMU', 170, 214);
  const name = ARCHETYPES[strongest(scores)].name.toUpperCase().split(' ');
  x.font = '96px "Archivo Black"'; x.fillStyle = '#0F3822';
  const lines = []; let cur = '';
  for (const w of name) { const t = cur ? cur + ' ' + w : w; if (x.measureText(t).width > W - 180 && cur) { lines.push(cur); cur = w; } else cur = t; }
  lines.push(cur); lines.forEach((l, i) => x.fillText(l, 90, 330 + i * 100));
  // radar
  const cx = W / 2, cy = 860, R = 300, n = DIMS.length, pt = (i, v) => { const a = -Math.PI / 2 + i / n * Math.PI * 2; return [cx + Math.cos(a) * R * v, cy + Math.sin(a) * R * v]; };
  x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 3;
  for (const k of [.33, .66, 1]) { x.beginPath(); DIMS.forEach((_, i) => { const [px, py] = pt(i, k); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.closePath(); x.stroke(); }
  x.beginPath(); DIMS.forEach((d, i) => { const [px, py] = pt(i, scores[d.id] / 100); i ? x.lineTo(px, py) : x.moveTo(px, py); }); x.closePath();
  x.fillStyle = 'rgba(15,56,34,.85)'; x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 6; x.stroke();
  x.font = '600 34px Poppins'; x.fillStyle = '#171A18'; x.textAlign = 'center';
  DIMS.forEach((d, i) => { const [px, py] = pt(i, 1.22); x.fillText(d.name, px, py + 12); });
  x.textAlign = 'center'; x.fillStyle = '#0F3822'; x.font = '150px "Archivo Black"'; x.fillText(String(total(scores)), W / 2, 1410);
  x.font = '600 38px Poppins'; x.fillStyle = '#6B6F6A'; x.fillText('Skor BERARTI Index', W / 2, 1468);
  x.fillStyle = '#fff'; x.font = '64px "Archivo Black"'; x.fillText('#JADIBERARTI', W / 2, H - 170);
  x.font = '600 40px Poppins'; x.fillText('Tes gratis di bio @firasbyzi', W / 2, H - 100);
  return await new Promise(r => c.toBlob(r, 'image/png'));
}
