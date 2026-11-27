import React from 'react';
import {interpolate, Easing} from 'remotion';
import {B, HEAD, BODY, FLOOR_Y} from './theme';
import {words as allWords, Word} from '../lib/words';

export const pr = (t: number, a: number, d = 0.45, ease = Easing.bezier(0.22, 1, 0.36, 1)) =>
  interpolate(t, [a, a + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
export const back = Easing.bezier(0.34, 1.56, 0.64, 1);

/** Editorial headline: left aligned, uppercase, Archivo Black, one orange keyword. */
export const Headline: React.FC<{t: number; at: number; label?: string; lines: string[]; key1?: string; y?: number; size?: number; color?: string; out?: number; card?: boolean}> =
  ({t, at, label, lines, key1, y = 250, size: sizeIn, color = B.ink, out, card}) => {
  const size = sizeIn ?? (card ? 84 : 100);
  const p = pr(t, at, 0.5);
  const o = out !== undefined ? 1 - pr(t, out, 0.25) : 1;
  return (
    <div style={{position: 'absolute', left: card ? 56 : 80, right: card ? 56 : 80, top: card ? y - 30 : y, opacity: Math.min(p * 1.5, 1) * o,
      background: card ? '#F2EFE8' : undefined, borderRadius: card ? 34 : 0, padding: card ? '30px 40px 36px' : 0, boxShadow: card ? '0 18px 40px #171A1826' : undefined,
      transform: card ? `translateY(${(1 - p) * -30}px)` : undefined}}>
      {label && <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: BODY, fontWeight: 600, fontSize: 28, color: B.orange, letterSpacing: 3, marginBottom: 14,
        transform: `translateX(${(1 - p) * -30}px)`}}><div style={{width: 44, height: 5, background: B.orange, borderRadius: 3}} />{label}</div>}
      {lines.map((ln, i) => {
        const q = pr(t, at + 0.08 + i * 0.1, 0.5);
        return <div key={i} style={{overflow: 'hidden'}}>
          <div style={{fontFamily: HEAD, fontWeight: 400, fontSize: size, lineHeight: 1.04, color, textTransform: 'uppercase', letterSpacing: -1,
            transform: `translateY(${(1 - q) * 105}%)`}}>
            {ln.split(' ').map((w, j) => <span key={j} style={{color: key1 && w.replace(/[.,?!:]/g, '').toUpperCase() === key1.toUpperCase() ? B.orange : undefined}}>{w}{' '}</span>)}
          </div>
        </div>;
      })}
    </div>
  );
};

/** White card, radius 26, big orange number. */
export const NumCard: React.FC<{t: number; at: number; n: string; title: string; body: string; x: number; y: number; w?: number}> = ({t, at, n, title, body, x, y, w = 920}) => {
  const p = pr(t, at, 0.5, back);
  return <div style={{position: 'absolute', left: x, top: y, width: w, background: B.card, borderRadius: 26, padding: '30px 36px', display: 'flex', gap: 30,
    alignItems: 'center', boxShadow: '0 18px 40px #171A1822', opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 60}px) scale(${0.94 + 0.06 * p})`}}>
    <div style={{fontFamily: HEAD, fontWeight: 900, fontSize: 84, color: B.orange, lineHeight: 1}}>{n}</div>
    <div><div style={{fontFamily: HEAD, fontWeight: 900, fontSize: 40, color: B.ink, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{title}</div>
      <div style={{fontFamily: BODY, fontWeight: 500, fontSize: 31, color: B.muted, lineHeight: 1.25}}>{body}</div></div>
  </div>;
};

/** Speech or thought bubble (white), or the green "CONTOH" example bubble. */
export const Bubble: React.FC<{t: number; at: number; text: string; x: number; y: number; w?: number; tail?: 'left' | 'right' | 'none'; contoh?: boolean; thought?: boolean; size?: number; out?: number}> =
  ({t, at, text, x, y, w = 460, tail = 'left', contoh, thought, size = 36, out}) => {
  const p = pr(t, at, 0.4, back);
  const o = out !== undefined ? 1 - pr(t, out, 0.25) : 1;
  if (p <= 0 || o <= 0) return null;
  const bg = contoh ? B.floor : 'white';
  return <div style={{position: 'absolute', left: x, top: y, width: w, opacity: o, transform: `scale(${p})`, transformOrigin: tail === 'right' ? '90% 100%' : '10% 100%'}}>
    <div style={{background: bg, borderRadius: thought ? 60 : 26, padding: contoh ? '22px 30px 26px' : '22px 30px', boxShadow: '0 14px 34px #171A1826',
      border: thought ? '4px dashed #C9C2B8' : 'none'}}>
      {contoh && <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 22, letterSpacing: 4, color: B.orange, marginBottom: 6}}>CONTOH</div>}
      <div style={{fontFamily: BODY, fontWeight: 600, fontSize: size, lineHeight: 1.25, color: contoh ? 'white' : B.ink}}>{text}</div>
    </div>
    {tail !== 'none' && !thought && <div style={{position: 'absolute', bottom: -18, [tail === 'right' ? 'right' : 'left']: 44, width: 0, height: 0,
      borderLeft: '16px solid transparent', borderRight: '16px solid transparent', borderTop: `20px solid ${bg}`}} />}
    {thought && <><div style={{position: 'absolute', bottom: -30, left: 50, width: 26, height: 26, borderRadius: 13, background: 'white', border: '4px dashed #C9C2B8'}} />
      <div style={{position: 'absolute', bottom: -58, left: 30, width: 16, height: 16, borderRadius: 8, background: 'white', border: '3px dashed #C9C2B8'}} /></>}
  </div>;
};

/** The green stage floor with the 6px orange line. Always present: it carries the subtitles. */
export const Floor: React.FC = () => (
  <div style={{position: 'absolute', left: 0, right: 0, top: FLOOR_Y, bottom: 0, background: B.floor}}>
    <div style={{height: 6, background: B.orange}} />
  </div>
);

/** Lingkaran Berani: orange circle behind Raka. Only on courage/solution beats. */
export const Lingkaran: React.FC<{t: number; at: number; cx: number; cy: number; r?: number; out?: number}> = ({t, at, cx, cy, r = 330, out}) => {
  const p = pr(t, at, 0.7, back);
  const o = out !== undefined ? 1 - pr(t, out, 0.3) : 1;
  return <div style={{position: 'absolute', left: cx - r, top: cy - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: B.orange,
    transform: `scale(${p})`, opacity: o}} />;
};

/** Spotlight ellipse under the feet. */
export const Pijak: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 320}) => (
  <div style={{position: 'absolute', left: x - w / 2, top: y - 24, width: w, height: 48, borderRadius: '50%', background: '#F3E4CF'}} />
);

// ---------- subtitles: white Poppins on the floor, spoken word orange with a thick underline ----------
type Page = {words: Word[]; start: number; end: number};
const buildPages = (ws: Word[], max = 4): Page[] => {
  const pages: Page[] = [];
  let cur: Word[] = [];
  ws.forEach((w, i) => {
    cur.push(w);
    const endSentence = /[.?!]$/.test(w.word);
    if (cur.length >= max || endSentence || i === ws.length - 1) {
      pages.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end});
      cur = [];
    }
  });
  pages.forEach((p, i) => { const nx = pages[i + 1]; p.end = Math.min(nx ? nx.start : Infinity, p.end + 0.5); });
  return pages;
};
const PAGES = buildPages(allWords);
export const Subtitles: React.FC<{t: number; y?: number}> = ({t, y = FLOOR_Y + 70}) => {
  const page = PAGES.find((p) => t >= p.start - 0.06 && t < p.end);
  if (!page) return null;
  const pop = pr(t, page.start - 0.06, 0.16);
  return <div style={{position: 'absolute', top: y, left: 70, right: 70, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '0 16px',
    opacity: pop, transform: `translateY(${(1 - pop) * 14}px)`}}>
    {page.words.map((w) => {
      const on = t >= w.start - 0.03 && t < w.end + 0.08;
      const said = t >= w.start - 0.03;
      return <span key={w.i} style={{fontFamily: BODY, fontWeight: 600, fontSize: 48, lineHeight: 1.35, color: on ? B.orange : 'white', opacity: said ? 1 : 0.55,
        borderBottom: on ? `6px solid ${B.orange}` : '6px solid transparent'}}>{w.word.replace(/[.,;:]+$/, '')}</span>;
    })}
  </div>;
};
