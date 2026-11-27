import React from 'react';
import {AbsoluteFill} from 'remotion';
import {B, FLOOR_Y} from './theme';
import {pr} from './UI';
import {Clock} from './Sets';

// ---------- virtual camera: keyframed shots (scale + focus point), handheld drift and impact shakes ----------
export type CamKey = {t: number; s: number; x: number; y: number; d?: number; ease?: 'inout' | 'out' | 'back'};
const EZ = {
  inout: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  out: (x: number) => 1 - Math.pow(1 - x, 3),
  back: (x: number) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
};
export const camAt = (t: number, keys: CamKey[]) => {
  let cur = {s: keys[0].s, x: keys[0].x, y: keys[0].y};
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (t < k.t) break;
    const p = Math.min(1, (t - k.t) / (k.d ?? 0.6));
    const e = EZ[k.ease ?? 'inout'](p);
    cur = {s: cur.s + (k.s - cur.s) * e, x: cur.x + (k.x - cur.x) * e, y: cur.y + (k.y - cur.y) * e};
  }
  return cur;
};
export const Shot: React.FC<{t: number; keys: CamKey[]; shakes?: Array<[number, number]>; children: React.ReactNode}> = ({t, keys, shakes = [], children}) => {
  const c = camAt(t, keys);
  let dx = Math.sin(t * 0.71) * 4, dy = Math.cos(t * 0.53) * 3;
  for (const [a, amp] of shakes) if (t >= a && t < a + 0.45) { const f = 1 - (t - a) / 0.45; dx += Math.sin(t * 75) * amp * f; dy += Math.cos(t * 61) * amp * 0.7 * f; }
  return <AbsoluteFill style={{transform: `translate(${540 - c.x * c.s + dx}px, ${960 - c.y * c.s + dy}px) scale(${c.s})`, transformOrigin: '0 0'}}>{children}</AbsoluteFill>;
};

// ---------- stage set: editorial cream stage that never sits still ----------
export const StageSet: React.FC<{t: number; glow?: string}> = ({t, glow = '#FFFFFF'}) => (
  <>
    <div style={{position: 'absolute', left: -700, right: -700, top: -700, bottom: -700, background: B.stage}} />
    <svg style={{position: 'absolute', left: -300, top: 120}} width={1700} height={1500} viewBox="0 0 1700 1500">
      <defs><pattern id="dots" width={38} height={38} patternUnits="userSpaceOnUse" patternTransform={`translate(${(t * 8) % 38} ${(t * 5) % 38})`}>
        <circle cx={6} cy={6} r={3.2} fill="#E9DACA" /></pattern></defs>
      <rect x={1060} y={60} width={600} height={520} fill="url(#dots)" />
      <rect x={0} y={760} width={480} height={460} fill="url(#dots)" />
      <circle cx={850} cy={880} r={520} fill="none" stroke="#EEDFCF" strokeWidth={4} strokeDasharray="14 18" transform={`rotate(${t * 6} 850 880)`} />
      <circle cx={850} cy={880} r={380} fill="#F4E8DB" />
    </svg>
    <div style={{position: 'absolute', left: 140, top: 240, width: 800, height: 1240, background: `radial-gradient(ellipse at 50% 100%, ${glow}cc, ${glow}00 65%)`}} />
    <Floaty t={t} />
  </>
);
export const Floaty: React.FC<{t: number; dim?: number}> = ({t, dim = 1}) => (
  <svg style={{position: 'absolute', left: 0, top: 0, opacity: dim}} width={1080} height={1920}>
    <circle cx={930} cy={760 + Math.sin(t * 1.4) * 22} r={15} fill={B.orange} />
    <circle cx={140} cy={900 + Math.cos(t * 1.1) * 18} r={22} fill="none" stroke={B.floor} strokeWidth={7} />
    <path d={`M${960} ${1150 + Math.sin(t * 1.2 + 1) * 16} m-16 0 h32 m-16 -16 v32`} stroke={B.floor} strokeWidth={7} strokeLinecap="round" />
    <path d={`M90 ${1240 + Math.cos(t * 0.9) * 14} q20 -24 40 0 t40 0`} fill="none" stroke={B.orange} strokeWidth={7} strokeLinecap="round" />
  </svg>
);

// ---------- meeting room ----------
export const TABLE_TOP = 1290;
export const MeetingSet: React.FC<{t: number; clock?: [number, number]}> = ({t, clock = [10, 0]}) => {
  const sw = Math.sin(t * 1.6) * 3;
  return <>
    <div style={{position: 'absolute', left: -700, right: -700, top: -700, bottom: -700, background: '#ECE4DA'}} />
    <div style={{position: 'absolute', left: -700, right: -700, top: 1000, bottom: -700, background: '#DED1C2'}} />
    <div style={{position: 'absolute', left: -700, right: -700, top: 990, height: 14, background: '#CDBDAA'}} />
    {/* chart board, centre back */}
    <div style={{position: 'absolute', left: 350, top: 560, width: 360, height: 240, background: 'white', borderRadius: 12, boxShadow: '0 12px 26px #0000001c', padding: 26}}>
      <div style={{width: 150, height: 12, background: B.ink, borderRadius: 6, marginBottom: 18}} />
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 16, height: 130}}>{[45, 70, 58, 100].map((h, i) => <div key={i} style={{width: 40, height: `${h}%`, background: i === 3 ? B.orange : '#3E4A68', borderRadius: 4}} />)}</div>
    </div>
    <Clock x={900} y={640} size={130} hour={clock[0]} minute={(clock[1] + t * 2) % 60} />
    {/* window with blinds, left */}
    <div style={{position: 'absolute', left: 40, top: 560, width: 230, height: 300, borderRadius: 10, background: '#CFE6F3', border: '12px solid white', overflow: 'hidden', boxShadow: '0 10px 22px #0000001a'}}>
      <div style={{position: 'absolute', left: -20, bottom: -30, width: 270, height: 90, borderRadius: '50%', background: '#8EC58E'}} />
      {Array.from({length: 7}).map((_, i) => <div key={i} style={{position: 'absolute', left: 0, right: 0, top: i * 22, height: 12, background: '#FFFFFFcc'}} />)}
    </div>
    {/* pendant lamp */}
    <div style={{position: 'absolute', left: 760, top: -40, width: 4, height: 210, background: '#3A3A3A', transformOrigin: '2px 0', transform: `rotate(${sw}deg)`}}>
      <div style={{position: 'absolute', left: -50, top: 200, width: 104, height: 56, borderRadius: '52px 52px 6px 6px', background: B.floor}} />
      <div style={{position: 'absolute', left: -120, top: 250, width: 244, height: 300, background: 'radial-gradient(ellipse at 50% 0%, #FFE9B455, #FFE9B400 70%)'}} />
    </div>
  </>;
};
export const TableFront: React.FC<{x0?: number; x1?: number; laptops?: number[]; mugs?: number[]}> = ({x0 = -60, x1 = 1140, laptops = [], mugs = []}) => (
  <>
    {laptops.map((x, i) => <div key={i} style={{position: 'absolute', left: x - 80, top: TABLE_TOP - 92, width: 160, height: 96, background: '#3B4250', borderRadius: '10px 10px 2px 2px'}}>
      <div style={{position: 'absolute', left: 64, top: 36, width: 32, height: 26, borderRadius: 8, background: '#5A6272'}} /></div>)}
    {mugs.map((x, i) => <div key={i} style={{position: 'absolute', left: x, top: TABLE_TOP - 50, width: 44, height: 52, background: 'white', borderRadius: '6px 6px 14px 14px', border: '5px solid #D8D3CB'}} />)}
    <div style={{position: 'absolute', left: x0, width: x1 - x0, top: TABLE_TOP, height: 34, background: '#A57552', borderRadius: 10}} />
    <div style={{position: 'absolute', left: x0 + 18, width: x1 - x0 - 36, top: TABLE_TOP + 28, height: FLOOR_Y - TABLE_TOP, background: 'linear-gradient(#83583A, #6E4A31)'}} />
    <div style={{position: 'absolute', left: x0 + 18, width: x1 - x0 - 36, top: TABLE_TOP + 28, height: 12, background: '#00000026'}} />
  </>
);

// ---------- night room ----------
export const NightSet: React.FC<{t: number}> = ({t}) => (
  <>
    <div style={{position: 'absolute', left: -700, right: -700, top: -700, bottom: -700, background: 'linear-gradient(#26375A, #16223A)'}} />
    <div style={{position: 'absolute', left: 640, top: 700, width: 360, height: 330, borderRadius: 10, background: '#1E3150', border: '14px solid #E8E2D6', overflow: 'hidden'}}>
      <div style={{position: 'absolute', right: 40, top: 40, width: 72, height: 72, borderRadius: 36, background: '#F8E7A8', boxShadow: '0 0 50px #F8E7A8'}} />
      {[[40, 60, 0], [120, 140, 1], [200, 50, 2], [70, 200, 3], [260, 180, 4]].map(([x, y, i]) => <div key={i} style={{position: 'absolute', left: x, top: y, width: 6, height: 6, borderRadius: 3, background: 'white', opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))}} />)}
      <div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 10, marginLeft: -5, background: '#E8E2D6'}} />
    </div>
    <div style={{position: 'absolute', left: 610, top: 680, width: 90, height: 400, background: '#3C5A86', borderRadius: '0 0 30px 6px', transformOrigin: '50% 0', transform: `skewX(${Math.sin(t * 0.9) * 2}deg)`}} />
    <div style={{position: 'absolute', left: 940, top: 680, width: 90, height: 400, background: '#3C5A86', borderRadius: '0 0 6px 30px', transformOrigin: '50% 0', transform: `skewX(${-Math.sin(t * 0.9) * 2}deg)`}} />
    <div style={{position: 'absolute', left: 20, top: 860, width: 640, height: 640, borderRadius: 320, background: 'radial-gradient(#FFE7A899, #FFE7A800 68%)', opacity: 0.85 + 0.15 * Math.sin(t * 3)}} />
  </>
);

// ---------- little acting helpers ----------
export const Sweat: React.FC<{t: number; at: number; out: number; x: number; y: number; s?: number}> = ({t, at, out, x, y, s = 1}) => {
  if (t < at || t > out) return null;
  const cyc = ((t - at) % 1.1) / 1.1;
  return <svg style={{position: 'absolute', left: x, top: y + cyc * 40 * s, opacity: (1 - cyc) * Math.min(1, (t - at) * 4)}} width={40 * s} height={56 * s} viewBox="0 0 40 56">
    <path d="M20 2 C28 18 36 28 36 38 A16 16 0 0 1 4 38 C4 28 12 18 20 2 Z" fill="#7CC4EA" /><ellipse cx={14} cy={36} rx={4} ry={7} fill="white" opacity={0.7} />
  </svg>;
};
export const QMarks: React.FC<{t: number; at: number; out: number; x: number; y: number}> = ({t, at, out, x, y}) => {
  if (t < at || t > out + 0.3) return null;
  return <>{[[0, 0, -12, 0], [70, -40, 10, 0.18], [-60, -30, -4, 0.32]].map(([dx, dy, r, d], i) => {
    const p = pr(t, at + d, 0.4) * (1 - pr(t, out, 0.3));
    return <div key={i} style={{position: 'absolute', left: x + dx, top: y + dy - p * 20 + Math.sin(t * 3 + i) * 6, fontFamily: "'Brand Black', sans-serif", fontSize: 70 - i * 14, color: i === 0 ? B.orange : '#F3EBE0',
      opacity: p, transform: `rotate(${r}deg) scale(${0.6 + 0.4 * p})`}}>?</div>;
  })}</>;
};
export const Burst: React.FC<{t: number; at: number; x: number; y: number; c?: string; n?: number; r?: number}> = ({t, at, x, y, c = B.orange, n = 8, r = 40}) => {
  const p = pr(t, at, 0.5); if (p <= 0 || p >= 1) return null;
  return <svg style={{position: 'absolute', left: x - 160, top: y - 160}} width={320} height={320} viewBox="-160 -160 320 320">
    {Array.from({length: n}).map((_, i) => <line key={i} x1={0} y1={-r - p * 40} x2={0} y2={-r - 14 - p * 70} stroke={c} strokeWidth={8 * (1 - p)} strokeLinecap="round" transform={`rotate(${(360 / n) * i})`} />)}
  </svg>;
};

// ---------- transitions ----------
export const BandWipe: React.FC<{t: number; at: number; color: string; accent?: string}> = ({t, at, color, accent = B.orange}) => {
  const a = at - 0.36, b = at + 0.36;
  if (t < a || t > b) return null;
  const p = (t - a) / (b - a);
  const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  const x = -3400 + 6800 * e;
  return <div style={{position: 'absolute', left: 540 + x - 1700, top: -400, width: 3400, height: 2720, transform: 'rotate(12deg)', display: 'flex'}}>
    <div style={{width: 360, background: accent}} /><div style={{width: 2680, background: color}} /><div style={{width: 360, background: accent === B.orange ? B.cream : B.orange}} />
  </div>;
};
