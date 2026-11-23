import React from 'react';
import {B, HEAD, BODY} from './theme';
import {pr, back} from './UI';

/** Dark pill tag as in the reference: orange number + white Archivo Black label. */
export const Pill: React.FC<{t: number; at: number; n?: string; text: string; x: number; y: number; size?: number; out?: number}> = ({t, at, n, text, x, y, size = 40, out}) => {
  const p = pr(t, at, 0.4, back); const o = out !== undefined ? 1 - pr(t, out, 0.25) : 1;
  return <div style={{position: 'absolute', left: x, top: y, display: 'flex', gap: 14, alignItems: 'center', padding: '14px 30px', borderRadius: 999, background: B.pill,
    transform: `scale(${p})`, transformOrigin: 'left center', opacity: o}}>
    {n && <span style={{fontFamily: HEAD, fontSize: size, color: B.orange}}>{n}</span>}
    <span style={{fontFamily: HEAD, fontSize: size, color: 'white', letterSpacing: 0.5}}>{text}</span>
  </div>;
};

export const Sticky: React.FC<{t: number; at: number; text: string; x: number; y: number; color: string; rot?: number}> = ({t, at, text, x, y, color, rot = 0}) => {
  const p = pr(t, at, 0.4, back);
  return <div style={{position: 'absolute', left: x, top: y, width: 150, height: 130, background: color, borderRadius: 6, boxShadow: '0 8px 16px #0000001f',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: BODY, fontWeight: 600, fontSize: 30, color: B.ink,
    transform: `rotate(${rot}deg) scale(${p})`}}>{text}</div>;
};

export const Icon: React.FC<{kind: 'eye' | 'hand' | 'check' | 'star' | 'q' | 'plus' | 'spark'; x: number; y: number; size?: number; color?: string; p?: number}> =
  ({kind, x, y, size = 80, color = B.orange, p = 1}) => {
  const st = {position: 'absolute' as const, left: x - size / 2, top: y - size / 2, transform: `scale(${p})`, opacity: Math.min(1, p * 1.5)};
  if (kind === 'eye') return <svg style={st} width={size} height={size} viewBox="0 0 100 100"><path d="M6 50 Q50 8 94 50 Q50 92 6 50 Z" fill="white" stroke={color} strokeWidth={7} /><circle cx={50} cy={50} r={16} fill={color} /><circle cx={56} cy={44} r={5} fill="white" /></svg>;
  if (kind === 'hand') return <svg style={st} width={size} height={size} viewBox="0 0 100 100"><path d="M8 66 L30 66 Q42 56 58 58 L78 60 Q86 62 84 70 Q82 76 72 75 L56 74 M30 66 L30 88 L8 88 Z" fill="#F3B284" stroke={B.ink} strokeWidth={4} strokeLinejoin="round" /><rect x={46} y={22} width={30} height={26} rx={4} fill={color} /><rect x={58} y={22} width={6} height={26} fill="white" /><rect x={42} y={18} width={38} height={9} rx={3} fill={color} /></svg>;
  if (kind === 'check') return <svg style={st} width={size} height={size} viewBox="0 0 100 100"><circle cx={50} cy={50} r={46} fill="#2E9E5B" /><path d="M28 52 L44 67 L73 36" fill="none" stroke="white" strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (kind === 'plus') return <svg style={st} width={size} height={size} viewBox="0 0 100 100"><circle cx={50} cy={50} r={46} fill={color} /><path d="M50 26 L50 74 M26 50 L74 50" stroke="white" strokeWidth={12} strokeLinecap="round" /></svg>;
  if (kind === 'q') return <div style={{...st, width: size, height: size, borderRadius: size / 2, background: color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontSize: size * 0.6}}>?</div>;
  if (kind === 'spark') return <svg style={st} width={size} height={size} viewBox="0 0 100 100"><path d="M50 4 L58 42 L96 50 L58 58 L50 96 L42 58 L4 50 L42 42 Z" fill={color} /></svg>;
  return <svg style={st} width={size} height={size} viewBox="0 0 100 100"><path d="M50 6 L62 38 L96 40 L69 61 L79 94 L50 75 L21 94 L31 61 L4 40 L38 38 Z" fill={color} /></svg>;
};

/** Two lines (orange and green) that start apart and merge into one path upward: "jalan bareng". */
export const MergePath: React.FC<{p: number; x: number; y: number}> = ({p, x, y}) => (
  <svg style={{position: 'absolute', left: x, top: y}} width={700} height={520} viewBox="0 0 700 520">
    <path d="M60 500 C60 330 330 330 350 200 L350 20" fill="none" stroke={B.orange} strokeWidth={26} strokeLinecap="round" strokeDasharray={900} strokeDashoffset={900 * (1 - p)} />
    <path d="M640 500 C640 330 370 330 350 200 L350 20" fill="none" stroke={B.floor} strokeWidth={26} strokeLinecap="round" strokeDasharray={900} strokeDashoffset={900 * (1 - p)} opacity={0.95} />
  </svg>
);
