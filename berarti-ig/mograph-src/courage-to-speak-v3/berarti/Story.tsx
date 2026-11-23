import React from 'react';
import {B, HEAD, BODY} from './theme';
import {pr, back} from './UI';

/** Storyboard title: big white Archivo Black with a dark edge; keyword in an orange tilted box. */
export const StoryTitle: React.FC<{t: number; at: number; lines: Array<string | {key: string}>; x?: number; y: number; size?: number; align?: 'left' | 'right'; stagger?: number; out?: number}> =
  ({t, at, lines, x = 60, y, size = 110, align = 'left', stagger = 0.12, out}) => {
  const o = out !== undefined ? 1 - pr(t, out, 0.25) : 1;
  return <div style={{position: 'absolute', left: align === 'left' ? x : undefined, right: align === 'right' ? x : undefined, top: y, opacity: o,
    display: 'flex', flexDirection: 'column', alignItems: align === 'left' ? 'flex-start' : 'flex-end', gap: 6}}>
    {lines.map((ln, i) => {
      const p = pr(t, at + i * stagger, 0.42, back);
      const isKey = typeof ln !== 'string';
      const txt = isKey ? (ln as {key: string}).key : (ln as string);
      return <div key={i} style={{fontFamily: HEAD, fontSize: size, lineHeight: 1.0, textTransform: 'uppercase', letterSpacing: -1,
        color: 'white', padding: isKey ? '4px 22px 10px' : 0, background: isKey ? B.orange : undefined, borderRadius: isKey ? 10 : 0,
        transform: `translateY(${(1 - p) * 40}px) scale(${0.85 + 0.15 * p}) rotate(${isKey ? -3 : -1.5}deg)`, opacity: Math.min(1, p * 1.5),
        textShadow: isKey ? '0 6px 0 #00000033' : '4px 4px 0 #171A18, -2px -2px 0 #171A18, 2px -2px 0 #171A18, -2px 2px 0 #171A18, 0 10px 24px #00000055',
        boxShadow: isKey ? '6px 8px 0 #171A18' : undefined}}>{txt}</div>;
    })}
  </div>;
};

/** "10:00 MENIT" timer: orange ring that fills while the minutes count up. */
export const Timer: React.FC<{t: number; at: number; dur: number; x: number; y: number; r?: number}> = ({t, at, dur, x, y, r = 130}) => {
  const p = pr(t, at, dur, (n) => n);
  const enter = pr(t, at - 0.2, 0.4, back);
  const mins = Math.min(10, Math.floor(p * 10.999));
  const C = 2 * Math.PI * (r - 14);
  return <div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, transform: `scale(${enter})`}}>
    <svg width={2 * r} height={2 * r}><circle cx={r} cy={r} r={r - 4} fill="white" /><circle cx={r} cy={r} r={r - 14} fill="none" stroke="#F1E3D6" strokeWidth={18} />
      <circle cx={r} cy={r} r={r - 14} fill="none" stroke={B.orange} strokeWidth={18} strokeDasharray={C} strokeDashoffset={C * (1 - p)} transform={`rotate(-90 ${r} ${r})`} strokeLinecap="round" /></svg>
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <div style={{fontFamily: HEAD, fontSize: r * 0.46, color: B.ink, lineHeight: 1}}>{String(mins).padStart(2, '0')}:00</div>
      <div style={{fontFamily: BODY, fontWeight: 700, fontSize: r * 0.17, color: B.orange, letterSpacing: 3}}>MENIT</div>
    </div>
  </div>;
};

export const ClockCard: React.FC<{t: number; at: number; x: number; y: number; time: string; label: string}> = ({t, at, x, y, time, label}) => {
  const p = pr(t, at, 0.4, back);
  return <div style={{position: 'absolute', left: x, top: y, width: 250, borderRadius: 22, background: 'white', overflow: 'hidden', boxShadow: '0 14px 30px #171A1826',
    transform: `scale(${p}) rotate(-4deg)`, transformOrigin: 'left top'}}>
    <div style={{height: 34, background: B.orange}} />
    <div style={{textAlign: 'center', fontFamily: HEAD, fontSize: 84, color: B.ink, lineHeight: 1.1, marginTop: 8}}>{time}</div>
    <div style={{textAlign: 'center', fontFamily: BODY, fontWeight: 700, fontSize: 26, color: B.muted, letterSpacing: 5, marginBottom: 14}}>{label}</div>
  </div>;
};

/** Cloud thought bubble (optionally with a paper texture). */
export const Cloud: React.FC<{t: number; at: number; x: number; y: number; w: number; h: number; paper?: boolean; children?: React.ReactNode; out?: number}> =
  ({t, at, x, y, w, h, paper, children, out}) => {
  const p = pr(t, at, 0.45, back); const o = out !== undefined ? 1 - pr(t, out, 0.25) : 1;
  if (p <= 0 || o <= 0) return null;
  const id = `cl${x}${y}`;
  return <div style={{position: 'absolute', left: x, top: y, width: w, height: h, transform: `scale(${p})`, transformOrigin: '15% 100%', opacity: o}}>
    <svg width={w} height={h + 90} viewBox={`0 0 ${w} ${h + 90}`} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <defs><filter id={id}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={3} /><feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.3  0 0 0 0.10 0" /><feComposite in2="SourceGraphic" operator="in" /></filter></defs>
      <g fill={paper ? '#FBF6EC' : 'white'} stroke="#171A18" strokeWidth={6}>
        <ellipse cx={w * 0.5} cy={h * 0.5} rx={w * 0.48} ry={h * 0.46} />
        <circle cx={w * 0.18} cy={h + 22} r={22} /><circle cx={w * 0.08} cy={h + 70} r={12} />
      </g>
      {paper && <ellipse cx={w * 0.5} cy={h * 0.5} rx={w * 0.47} ry={h * 0.45} filter={`url(#${id})`} fill="white" />}
    </svg>
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
  </div>;
};

/** Storyboard equation card: icon, title, "=", meaning. */
export const EqCard: React.FC<{t: number; at: number; x: number; y: number; w?: number; color: string; icon: React.ReactNode; title: string; body: string}> =
  ({t, at, x, y, w = 430, color, icon, title, body}) => {
  const p = pr(t, at, 0.5, back);
  return <div style={{position: 'absolute', left: x, top: y, width: w, padding: '30px 26px 34px', borderRadius: 30, background: color, color: 'white', textAlign: 'center',
    boxShadow: '8px 10px 0 #171A18', opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 80}px) rotate(${(1 - p) * -6}deg)`}}>
    <div style={{display: 'flex', justifyContent: 'center', marginBottom: 10}}>{icon}</div>
    <div style={{fontFamily: HEAD, fontSize: 54, lineHeight: 1.0}}>{title}</div>
    <div style={{fontFamily: HEAD, fontSize: 54, lineHeight: 1.1, opacity: 0.8}}>=</div>
    <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 34, lineHeight: 1.2}}>{body}</div>
  </div>;
};

export const PeopleIcon: React.FC<{size?: number}> = ({size = 90}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth={6} strokeLinecap="round">
    <circle cx={50} cy={30} r={13} /><path d="M26 78 Q50 42 74 78" /><circle cx={20} cy={42} r={9} /><path d="M4 80 Q18 58 34 66" /><circle cx={80} cy={42} r={9} /><path d="M96 80 Q82 58 66 66" />
  </svg>
);
export const MegaIcon: React.FC<{size?: number}> = ({size = 90}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth={6} strokeLinejoin="round" strokeLinecap="round">
    <path d="M14 42 L14 60 L30 60 L66 80 L66 22 L30 42 Z" /><path d="M30 60 L36 84 L46 84 L42 62" /><path d="M78 36 Q88 51 78 66" /><path d="M86 28 Q100 51 86 74" />
  </svg>
);
export const DocIcon: React.FC<{size?: number}> = ({size = 70}) => (
  <svg width={size} height={size} viewBox="0 0 100 100"><rect x={18} y={8} width={64} height={84} rx={8} fill="white" stroke={B.ink} strokeWidth={5} />
    {[30, 44, 58, 72].map((y) => <rect key={y} x={30} y={y} width={y === 72 ? 26 : 40} height={6} rx={3} fill={y === 30 ? B.orange : '#9AA0A8'} />)}</svg>
);

export const Cursor: React.FC<{x: number; y: number; click: number}> = ({x, y, click}) => (
  <svg style={{position: 'absolute', left: x, top: y}} width={70} height={80} viewBox="0 0 70 80">
    {click > 0 && <circle cx={10} cy={8} r={20 + 30 * click} fill="none" stroke={B.orange} strokeWidth={5} opacity={1 - click} />}
    <path d="M6 4 L6 62 L22 48 L34 74 L46 68 L34 43 L56 42 Z" fill="white" stroke={B.ink} strokeWidth={5} strokeLinejoin="round" />
  </svg>
);
