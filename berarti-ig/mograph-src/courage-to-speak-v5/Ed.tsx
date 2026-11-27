import React from 'react';
import {B, HEAD, BODY} from './theme';
import {pr} from './UI';
import {words} from '../lib/words';

/** Style-guide title: orange Poppins label after a short line, then Archivo Black uppercase, left aligned, dark green, one orange keyword.
 *  Each word rises out of a mask, staggered. */
export const EdTitle: React.FC<{t: number; at: number; label?: string; lines: Array<string | {key: string}>; x?: number; y: number; size?: number; align?: 'left' | 'right'; out?: number; color?: string; card?: boolean}> =
  ({t, at, label, lines, x = 60, y, size = 96, align = 'left', out, color = B.floor, card}) => {
  const o = out !== undefined ? 1 - pr(t, out, 0.22) : 1;
  if (t < at - 0.05 || o <= 0) return null;
  let k = 0;
  return <div style={{position: 'absolute', top: y, left: align === 'left' ? x : undefined, right: align === 'right' ? x : undefined, opacity: o,
    display: 'flex', flexDirection: 'column', alignItems: align === 'left' ? 'flex-start' : 'flex-end', transform: `translateY(${(1 - o) * -20}px) scale(${card ? 0.9 + 0.1 * pr(t, at, 0.35) : 1})`, transformOrigin: 'left top',
    ...(card ? {background: 'white', borderRadius: 26, padding: '22px 34px 18px', boxShadow: '0 16px 34px #171A182E'} : {})}}>
    {label && <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, opacity: pr(t, at, 0.3), transform: `translateX(${(1 - pr(t, at, 0.4)) * -30}px)`}}>
      <div style={{width: 46 * pr(t, at, 0.4), height: 5, background: B.orange, borderRadius: 3}} />
      <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 32, color: B.orange, letterSpacing: 2}}>{label}</div>
    </div>}
    {lines.map((ln, i) => {
      const isKey = typeof ln !== 'string';
      const txt = (isKey ? (ln as {key: string}).key : (ln as string)).split(' ');
      return <div key={i} style={{display: 'flex', gap: size * 0.22, lineHeight: 1.02}}>
        {txt.map((w, j) => {
          const p = pr(t, at + 0.12 + (k++) * 0.07, 0.42);
          return <div key={j} style={{overflow: 'hidden', paddingBottom: 6}}>
            <div style={{fontFamily: HEAD, fontSize: size, textTransform: 'uppercase', letterSpacing: -1, color: isKey ? B.orange : color,
              transform: `translateY(${(1 - p) * 105}%) rotate(${(1 - p) * 6}deg)`, transformOrigin: 'left bottom'}}>{w}</div>
          </div>;
        })}
      </div>;
    })}
  </div>;
};

/** Mouth openness from the voice-over words between a and b: syllable-rate flaps inside each word. */
export const mouth = (t: number, a: number, b: number): number => {
  for (const w of words) {
    if (w.start < a - 0.01 || w.start > b) continue;
    if (t >= w.start && t <= w.end) {
      const syl = Math.max(1, (w.word.toLowerCase().match(/[aiueo]+/g) ?? []).length);
      const ph = ((t - w.start) / Math.max(0.08, w.end - w.start)) * syl;
      return 0.25 + 0.75 * Math.abs(Math.sin(ph * Math.PI));
    }
  }
  return 0;
};

/** Iris transition: an orange disc closes over the old scene, then opens a hole onto the new one. */
export const Iris: React.FC<{t: number; at: number; cx: number; cy: number; color?: string}> = ({t, at, cx, cy, color = B.orange}) => {
  const a = at - 0.24, b = at + 0.3;
  if (t < a || t > b) return null;
  const R = 2300;
  if (t < at) {
    const p = (t - a) / 0.24; const e = p * p;
    return <div style={{position: 'absolute', left: cx - R * e, top: cy - R * e, width: 2 * R * e, height: 2 * R * e, borderRadius: '50%', background: color}} />;
  }
  const p = (t - at) / 0.3; const e = 1 - Math.pow(1 - p, 3);
  return <svg style={{position: 'absolute', inset: 0}} width={1080} height={1920}>
    <defs><mask id={`iris${at}`}><rect width={1080} height={1920} fill="white" /><circle cx={cx} cy={cy} r={R * e} fill="black" /></mask></defs>
    <rect width={1080} height={1920} fill={color} mask={`url(#iris${at})`} />
  </svg>;
};
