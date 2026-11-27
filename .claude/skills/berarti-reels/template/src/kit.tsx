// BERARTI Reels: style engine (kinetic cream). Do not edit per video; per-video content lives in reel.tsx.
import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FontFaces} from './Fonts';
import {Character, Pose} from './Char';
import {words} from './lib/words';
import env from './env.json';
import {COVER_CHAR, CoverBack, CoverContent, CoverFront, ThirdsGuides, charAt} from './cover';

// ============================================================ design tokens
export const C = {
  bg: '#F6F0E8', ink: '#16191A', soft: '#5E625D', faint: '#B9B1A6', line: '#E9E2D8',
  orange: '#FF6A00', orangeDeep: '#D95500', orangeTint: '#FFE7D4',
  green: '#0F5B46', greenDeep: '#0A3F31', greenTint: '#DCEFE7', red: '#E5484D', card: '#FFFFFF',
};
export const FONT = "'Montserrat', sans-serif";
export const DISPLAY = "'Archivo Black', 'Montserrat', sans-serif";
export const MONO = "'Mograph Mono', monospace";
export const M = 72;
export const CW = 1080 - M * 2;
export const SH = '0 1px 2px rgba(48,32,16,0.06), 0 10px 24px rgba(48,32,16,0.08), 0 28px 60px rgba(48,32,16,0.08)';
export const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
export const expoOut = Easing.bezier(0.16, 1, 0.3, 1);

// ============================================================ per-video data the engine reads
export type Pop = {at: number; dur: number; img: string; tilt: number};
export type Cue = [number, string, number];
export type Place = {x: number; y: number; scale: number};
export type ReelSpec = {
  end: number;              // composition length (s)
  cv: number; morph: number; // cover holds until cv, then morphs into the layout over morph seconds
  g: number; l: number;     // ending: character grows at g, cover rebuilds at l (lands on frame 0 = seamless loop)
  stamp?: number;           // optional camera shake moment
  poses: Pose[]; pops: Pop[]; cues: Cue[];
  blocks: Blk[]; kw: Set<number>; ul: Set<number>; floods: [number, number][]; trans: number[];
  cover: CoverContent;
  small?: Place; endPlace?: Place;
  closeAt?: number;          // serial CTA: narration headline gives way to the closing message
  mute?: [number, number][]; // dialog: spans spoken by the other character
};
const SpecCtx = React.createContext<ReelSpec>(null as unknown as ReelSpec);
export const useSpec = () => React.useContext(SpecCtx);

// ============================================================ helpers
export const useT = () => { const f = useCurrentFrame(); const {fps} = useVideoConfig(); return {t: f / fps, f, fps}; };
export const springAt = (f: number, fps: number, start: number, cfg = {damping: 12, stiffness: 170, mass: 0.9}) =>
  spring({frame: f - Math.round(start * fps), fps, config: cfg});
export const useSpring = (start: number, cfg?: {damping: number; stiffness: number; mass: number}) => { const {f, fps} = useT(); return springAt(f, fps, start, cfg); };
export const prog = (t: number, a: number, d: number, ease = expoOut) => interpolate(t, [a, a + d], [0, 1], {...clamp, easing: ease});

export const In: React.FC<{at: number; from?: 'up' | 'left' | 'right' | 'pop' | 'drop'; style?: React.CSSProperties; rot?: number; children: React.ReactNode}> = ({at: a, from = 'up', style, rot = 0, children}) => {
  const p = useSpring(a, {damping: 13, stiffness: 150, mass: 0.9});
  const o = interpolate(p, [0, 0.4], [0, 1], clamp);
  const blur = Math.max(0, (1 - p) * 14);
  const tr = from === 'up' ? `perspective(1400px) translateY(${(1 - p) * 90}px) rotateX(${(1 - p) * 18}deg) scale(${0.92 + 0.08 * p})`
    : from === 'left' ? `translateX(${(1 - p) * -110}px) skewX(${(1 - p) * 6}deg)`
    : from === 'right' ? `translateX(${(1 - p) * 110}px) skewX(${(1 - p) * -6}deg)`
    : from === 'drop' ? `translateY(${(1 - p) * -140}px) rotate(${(1 - p) * -14 + rot}deg)`
    : `scale(${0.3 + 0.7 * p}) rotate(${(1 - p) * -10 + rot}deg)`;
  return <div style={{position: 'absolute', opacity: o, transform: tr, transformOrigin: '50% 100%', filter: blur > 0.3 ? `blur(${blur}px)` : undefined, ...style}}>{children}</div>;
};
export const Card: React.FC<{w: number; h?: number; pad?: number | string; style?: React.CSSProperties; sweep?: number; children?: React.ReactNode}> = ({w, h, pad = 32, style, sweep, children}) => {
  const {t} = useT();
  const sp = sweep === undefined ? -1 : interpolate(t, [sweep, sweep + 0.9], [-0.4, 1.4], {...clamp, easing: Easing.inOut(Easing.quad)});
  return (
    <div style={{width: w, height: h, padding: pad, boxSizing: 'border-box', background: 'linear-gradient(180deg, #FFFFFF 0%, #FFFDFA 100%)', borderRadius: 32,
      boxShadow: `${SH}, inset 0 1px 0 rgba(255,255,255,1), inset 0 0 0 1.5px rgba(40,25,10,0.07)`, position: 'relative', overflow: style?.overflow ?? 'visible', ...style}}>
      {children}
      {sp > -0.4 && sp < 1.4 && <div style={{position: 'absolute', inset: 0, borderRadius: 32, overflow: 'hidden', pointerEvents: 'none'}}>
        <div style={{position: 'absolute', top: '-20%', bottom: '-20%', width: '28%', left: `${sp * 100}%`, transform: 'skewX(-18deg)',
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)', mixBlendMode: 'screen'}} />
      </div>}
    </div>
  );
};
export const Chip: React.FC<{bg: string; fg?: string; size?: number; children: React.ReactNode}> = ({bg, fg = '#fff', size = 30, children}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 10, background: bg, color: fg, fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1,
    padding: `${size * 0.46}px ${size * 0.78}px`, borderRadius: 999, boxShadow: '0 10px 22px rgba(40,20,0,0.14), inset 0 1px 0 rgba(255,255,255,0.25)', whiteSpace: 'nowrap', letterSpacing: 0.2}}>{children}</span>
);
export const TitleAt = React.createContext(0);
export const Hi: React.FC<{c?: string; children: React.ReactNode}> = ({c = C.orange, children}) => {
  const a = React.useContext(TitleAt); const {t} = useT();
  const p = prog(t, a + 0.45, 0.55);
  return <span style={{position: 'relative', color: c, whiteSpace: 'nowrap'}}>
    <span style={{position: 'absolute', left: -6, right: -6, bottom: 4, height: '34%', borderRadius: 8, background: c === C.orange ? C.orangeTint : C.greenTint,
      transform: `scaleX(${p})`, transformOrigin: 'left', zIndex: -1}} />
    <span style={{position: 'relative'}}>{children}</span>
  </span>;
};


const GRAIN = `url("data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 0.55 0"/></filter><rect width="240" height="240" filter="url(#n)"/></svg>')}")`;
export const useCamera = () => {
  const {t} = useT();
  const sp = useSpec();
  let s0 = 0; [0, ...sp.trans].forEach((s) => { if (t >= s) s0 = s; });
  const push = 1 + 0.018 * prog(t, s0, 6, Easing.inOut(Easing.quad));
  const sh = sp.stamp !== undefined && t >= sp.stamp ? Math.max(0, 1 - (t - sp.stamp) / 0.35) : 0;
  return `translate(${Math.sin(t * 90) * 9 * sh}px, ${Math.cos(t * 77) * 7 * sh}px) scale(${push})`;
};

// scene content sits under the kinetic narration headline
export const DY = 230;
export const Section: React.FC<{from: number; to: number; children: React.ReactNode}> = ({from, to, children}) => {
  const {t} = useT();
  if (t < from - 0.05 || t > to + 0.12) return null;
  const e = prog(t, to - 0.08, 0.2, Easing.in(Easing.cubic));
  return <AbsoluteFill style={{opacity: 1 - e, transform: `translateY(${DY - 70 * e}px)`, filter: e > 0 ? `blur(${e * 10}px)` : undefined}}>{children}</AbsoluteFill>;
};

// ============================================================ illustration bits
export const AUD = ['#E9A27A', '#7FB3A0', '#D9B56C', '#A79FDB', '#E3958F', '#82AACE'];
export const Person: React.FC<{c: string; size?: number; look?: number; children?: React.ReactNode}> = ({c, size = 120, look = 0, children}) => (
  <div style={{position: 'relative', width: size, height: size * 1.2}}>
    <div style={{position: 'absolute', left: size * 0.24, top: size * 0.04 + look * size * 0.08, width: size * 0.52, height: size * 0.52, borderRadius: 999, background: c}}>
      <div style={{position: 'absolute', left: '28%', top: look > 0.5 ? '62%' : '45%', width: size * 0.06, height: size * 0.06, borderRadius: 9, background: 'rgba(0,0,0,0.55)'}} />
      <div style={{position: 'absolute', right: '28%', top: look > 0.5 ? '62%' : '45%', width: size * 0.06, height: size * 0.06, borderRadius: 9, background: 'rgba(0,0,0,0.55)'}} />
    </div>
    <div style={{position: 'absolute', left: size * 0.04, top: size * 0.62, width: size * 0.92, height: size * 0.58, borderRadius: `${size * 0.46}px ${size * 0.46}px 16px 16px`, background: c, filter: 'brightness(0.93)'}} />
    {children}
  </div>
);
export const Badge: React.FC<{p: number; bg: string; children: React.ReactNode; style?: React.CSSProperties}> = ({p, bg, children, style}) => (
  <div style={{position: 'absolute', width: 50, height: 50, borderRadius: 99, background: bg, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 28,
    display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.15)', transform: `scale(${p})`, ...style}}>{children}</div>
);
export const Check: React.FC<{p: number; size?: number; color?: string}> = ({p, size = 80, color = C.green}) => (
  <svg width={size} height={size} viewBox="0 0 80 80">
    <circle cx={40} cy={40} r={38 * Math.min(1, p * 1.6)} fill={color} />
    <path d="M23 41 L35 53 L58 28" stroke="#fff" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none"
      strokeDasharray={60} strokeDashoffset={60 * (1 - interpolate(p, [0.35, 1], [0, 1], clamp))} />
  </svg>
);

export const Row: React.FC<{items: string[]; a: number; hi?: number; dimLast?: boolean; glow: number; hiOn: boolean}> = ({items, a, hi, dimLast, glow, hiOn}) => {
  const {t} = useT();
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
      {items.map((x, i) => {
        const p = prog(t, a + i * 0.16, 0.45);
        const on = hi === i && hiOn;
        const lastDim = dimLast && i === items.length - 1;
        return <React.Fragment key={i}>
          {i > 0 && <div style={{width: 48 * p, height: 6, borderRadius: 3, background: C.faint, position: 'relative'}}>
            <div style={{position: 'absolute', right: -4, top: -7, width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: `14px solid ${C.faint}`, opacity: p}} /></div>}
          <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 40, padding: '14px 24px', borderRadius: 18, opacity: p, transform: `translateY(${(1 - p) * 16}px) scale(${on ? 1 + 0.06 * glow : 1})`,
            background: on ? C.orange : '#F4EFE8', color: on ? '#fff' : lastDim ? C.faint : C.ink,
            textDecoration: lastDim ? 'line-through' : 'none', boxShadow: on ? `0 0 ${40 * glow}px rgba(255,106,0,${0.6 * glow})` : 'none'}}>{x}</span>
        </React.Fragment>;
      })}
    </div>
  );
};

const ReactionPops: React.FC = () => {
  const {t, f, fps} = useT();
  const p = useSpec().pops.find((x) => t >= x.at && t < x.at + x.dur + 0.25);
  if (!p) return null;
  const inS = springAt(f, fps, p.at, {damping: 10, stiffness: 220, mass: 0.7});
  const out = prog(t, p.at + p.dur, 0.22, Easing.in(Easing.cubic));
  const sc = inS * (1 - out);
  return (
    <div style={{position: 'absolute', left: 668, top: 1250, width: 330, height: 330, transform: `scale(${sc * 0.86}) rotate(${p.tilt * (1 - inS * 0.4)}deg)`, transformOrigin: '20% 90%', opacity: Math.min(1, sc * 2)}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 40, background: C.orangeTint, border: `8px solid #fff`, boxShadow: SH, overflow: 'hidden'}}>
        <Img src={staticFile(`rig3/${p.img}.png`)} style={{position: 'absolute', left: -15, top: -30, width: 360}} />
      </div>
      <div style={{position: 'absolute', left: -20, bottom: 22, width: 0, height: 0, borderTop: '22px solid transparent', borderBottom: '22px solid transparent', borderRight: '30px solid #fff'}} />
    </div>
  );
};


const Sound: React.FC = () => {
  const {fps} = useVideoConfig();
  const sp = useSpec();
  const open = (env as any).open as number[];
  return (
    <>
      <Audio src={staticFile('vo.mp3')} />
      <Audio src={staticFile('audio/music/bed.mp3')} volume={(f) => {
        const v = open[Math.min(open.length - 1, f)] ?? 0;
        const fadeOut = interpolate(f, [(sp.end - 1.2) * fps, sp.end * fps], [1, 0], clamp);
        return (0.55 + 0.45 * (1 - Math.min(1, v * 1.5))) * 0.9 * fadeOut;
      }} />
      {sp.cues.map(([time, name, g], i) => (
        <Sequence key={i} from={Math.max(0, Math.round(time * fps))} durationInFrames={Math.round(2 * fps)}>
          <Audio src={staticFile(`audio/lemo/${name}.wav`)} volume={g} />
        </Sequence>
      ))}
    </>
  );
};


// headline colours: normal / on the orange flood
const TX = {text: '#16191A', kw: '#FF6A00', ul: '#FF6A00', ftext: '#FFFFFF', fkw: '#16191A', ful: '#16191A',
  big: 'linear-gradient(180deg, #FF9A4D 0%, #FF6A00 52%, #D95500 100%)', fbig: 'linear-gradient(180deg, #FFFFFF 0%, #FFE7D4 100%)', bigShadow: 'drop-shadow(0 10px 22px rgba(217,85,0,0.22))'};
const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const CELL = 60;
const MOSAIC = Array.from({length: 46}, (_, i) => ({cx: Math.floor(hash(i) * 18), cy: Math.floor(hash(i + 50) * 32), a: 0.03 + hash(i + 99) * 0.08, ph: hash(i + 7) * 6.28}));


const CreamBG: React.FC<{flood: number}> = ({flood}) => {
  const {t, f} = useT();
  const blob = (x: number, y: number, s: number, c: string, k: number) => <div style={{position: 'absolute', left: x + Math.sin(t * 0.22 + k) * 40, top: y + Math.cos(t * 0.18 + k) * 30,
    width: s, height: s, borderRadius: 999, background: c, filter: 'blur(90px)'}} />;
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #FCF8F2 0%, #F6EFE5 55%, #F0E6D9 100%)'}}>
      {blob(640, -160, 620, 'rgba(255,138,61,0.22)', 0)}
      {blob(-260, 780, 640, 'rgba(15,91,70,0.10)', 2)}
      {blob(380, 1380, 700, 'rgba(255,170,110,0.20)', 4)}
      <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(22,25,26,0.05) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(22,25,26,0.05) 1.5px, transparent 1.5px)',
        backgroundSize: `${CELL}px ${CELL}px`, WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, #000 35%, transparent 100%)', maskImage: 'radial-gradient(ellipse 80% 70% at 50% 45%, #000 35%, transparent 100%)'}} />
      {MOSAIC.map((m, i) => <div key={i} style={{position: 'absolute', left: m.cx * CELL, top: m.cy * CELL, width: CELL, height: CELL,
        background: i % 4 === 0 ? `rgba(15,91,70,${(m.a * 0.6 * (0.55 + 0.45 * Math.sin(t * 1.3 + m.ph))).toFixed(3)})` : `rgba(255,106,0,${(m.a * 0.75 * (0.55 + 0.45 * Math.sin(t * 1.3 + m.ph))).toFixed(3)})`}} />)}
      {flood > 0.001 && <AbsoluteFill style={{opacity: flood}}>
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 110% 80% at 50% 36%, #FF8F45 0%, #FF6A00 48%, #E05A00 100%)'}} />
        <AbsoluteFill style={{backgroundImage: 'linear-gradient(rgba(255,255,255,0.10) 1.5px, transparent 1.5px), linear-gradient(90deg, rgba(255,255,255,0.10) 1.5px, transparent 1.5px)', backgroundSize: `${CELL}px ${CELL}px`}} />
        {MOSAIC.map((m, i) => <div key={i} style={{position: 'absolute', left: ((m.cx + 7) % 18) * CELL, top: ((m.cy + 11) % 32) * CELL, width: CELL, height: CELL,
          background: i % 3 ? 'rgba(120,40,0,0.10)' : 'rgba(255,255,255,0.12)'}} />)}
      </AbsoluteFill>}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 120% 90% at 50% 45%, rgba(0,0,0,0) 60%, rgba(70,40,10,0.10) 100%)'}} />
      <AbsoluteFill style={{backgroundImage: GRAIN, backgroundSize: '240px 240px', backgroundPosition: `${(f * 37) % 240}px ${(f * 53) % 240}px`, opacity: 0.14, mixBlendMode: 'multiply'}} />
    </AbsoluteFill>
  );
};


// ---- the narration itself is the headline, word by word (word indices into words.json)
export type Blk = {a: number; b: number; big?: number};
const blkStart = (sp: ReelSpec, k: number) => words[sp.blocks[k].a].start - 0.1;
export const floodAt = (sp: ReelSpec, t: number) => Math.max(0, ...sp.floods.map(([a, z]) => prog(t, a, 0.22) * (1 - prog(t, z - 0.1, 0.3))));
const clean = (s: string) => s.replace(/["]/g, '');

const Block: React.FC<{k: number; t: number; fade: number}> = ({k, t, fade}) => {
  const sp = useSpec();
  const b = sp.blocks[k];
  const fl = floodAt(sp, t) > 0.5;
  const lead = words.slice(b.a, (b.big ?? b.b + 1));
  const text = lead.map((w) => clean(w.word)).join(' ');
  const size = b.big !== undefined ? 84 : text.length <= 16 ? 112 : text.length <= 28 ? 100 : text.length <= 40 ? 88 : 80;
  const bigP = b.big !== undefined ? prog(t, words[b.big].start - 0.06, 0.4) : 0;
  return (
    <div style={{position: 'absolute', left: 50, right: 50, top: 226, textAlign: 'center', opacity: 1 - fade, transform: `translateY(${-36 * fade}px)`, filter: fade > 0 ? `blur(${fade * 8}px)` : undefined}}>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.08, letterSpacing: -1.5, opacity: 1 - 0.62 * bigP, transform: `scale(${1 - 0.12 * bigP})`, transformOrigin: '50% 100%'}}>
        {lead.map((w, n) => {
          const id = b.a + n;
          const p = prog(t, w.start - 0.06, 0.3);
          return <span key={id} style={{display: 'inline-block', margin: '0 0.12em', position: 'relative', color: sp.kw.has(id) ? (fl ? TX.fkw : TX.kw) : (fl ? TX.ftext : TX.text),
            opacity: p, transform: `translateY(${(1 - p) * 0.35}em)`, filter: p < 0.98 ? `blur(${(1 - p) * 8}px)` : undefined}}>
            {clean(w.word)}
            {sp.ul.has(id) && <span style={{position: 'absolute', left: 0, right: 0, bottom: '0.02em', height: '0.075em', borderRadius: 4, background: fl ? TX.ful : TX.ul,
              transform: `scaleX(${prog(t, w.start + 0.1, 0.35)})`, transformOrigin: 'left'}} />}
          </span>;
        })}
      </div>
      {b.big !== undefined && (() => {
        const word = clean(words[b.big].word);
        const bs = Math.min(220, 960 / (word.length * 0.72));
        return <div style={{fontFamily: DISPLAY, fontSize: bs, lineHeight: 1.02, letterSpacing: -4, marginTop: -4, opacity: Math.min(1, bigP * 1.6),
          transform: `scale(${1.22 - 0.22 * bigP})`, filter: bigP < 0.98 ? `blur(${(1 - bigP) * 12}px)` : (fl ? 'drop-shadow(0 10px 22px rgba(120,40,0,0.25))' : TX.bigShadow),
          backgroundImage: fl ? TX.fbig : TX.big, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'}}>{word}</div>;
      })()}
    </div>
  );
};
const Headline2: React.FC = () => {
  const {t} = useT();
  const sp = useSpec();
  let k = -1; sp.blocks.forEach((_, i) => { if (t >= blkStart(sp, i)) k = i; });
  if (k < 0) return null;
  const endFade = prog(t, Math.min(sp.l, sp.closeAt ?? sp.l) - 0.05, 0.25);
  const prevFade = prog(t, blkStart(sp, k), 0.14);
  return <>
    {k > 0 && prevFade < 1 && <Block k={k - 1} t={t} fade={prevFade} />}
    {endFade < 1 && <Block k={k} t={t} fade={endFade} />}
  </>;
};

// ---- pixel-mosaic cut between scenes
const Mosaic: React.FC = () => {
  const {t} = useT();
  const tr = useSpec().trans.find((x) => t > x - 0.3 && t < x + 0.3);
  if (tr === undefined) return null;
  const cell = 90, cols = 12, rows = 22, cells: React.ReactNode[] = [];
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const i = y * cols + x;
    if (hash(i + tr * 13) > 0.4) continue;
    const d = hash(i * 3.1 + tr) * 0.34 - 0.2;
    if (!(t >= tr + d && t < tr + d + 0.1)) continue;
    const h2 = hash(i * 7.7 + tr * 3);
    cells.push(<div key={i} style={{position: 'absolute', left: x * cell, top: y * cell, width: cell, height: cell,
      background: h2 < 0.5 ? '#F6EFE5' : h2 < 0.82 ? 'rgba(255,106,0,0.55)' : 'rgba(15,91,70,0.85)'}} />);
  }
  return <AbsoluteFill>{cells}</AbsoluteFill>;
};

const faceOf = (p: Place) => ({x: p.x + 670 + 30 * p.scale, y: p.y + 1411 - 1081 * p.scale});
const Spot: React.FC<{p: Place}> = ({p}) => {
  const fc = faceOf(p); const R = 620 * p.scale;
  return <div style={{position: 'absolute', left: fc.x - R, top: fc.y - R * 0.75, width: R * 2, height: R * 2, borderRadius: 999,
    background: 'radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(255,240,226,0.5) 35%, rgba(255,200,150,0) 68%)'}} />;
};

const SMALL2 = charAt(575, 1480, 0.71);   // face clear of the Reels caption overlay
const END2 = charAt(720, 1450, 0.95);
const ReelInner: React.FC<{children: React.ReactNode}> = ({children}) => {
  const sp = useSpec();
  const cam = useCamera();
  const {t} = useT();
  const {cv: CV, morph: MORPH, g: G, l: L} = sp;
  const ease = Easing.bezier(0.7, 0, 0.2, 1);
  const lerp = (a: Place, b: Place, k: number) => ({x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, scale: a.scale + (b.scale - a.scale) * k});
  const m1 = prog(t, CV, MORPH, ease), g = prog(t, G, 0.6, ease), l = prog(t, L, 0.5, ease);
  const small = sp.small ?? SMALL2, end = sp.endPlace ?? END2;
  const ch = t < G ? lerp(COVER_CHAR, small, m1) : t < L ? lerp(small, end, g) : lerp(end, COVER_CHAR, l);
  const coverO = t > L ? 1 - interpolate(t, [L + 0.16, L + 0.56], [0, 1], clamp) : interpolate(t, [CV, CV + 0.36], [0, 1], clamp);
  const showCover = t < CV + MORPH + 0.1 || t > L;
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <FontFaces />
      <CreamBG flood={floodAt(sp, t)} />
      <AbsoluteFill style={{transform: cam}}>
        {showCover && <CoverBack o={t > L ? 1 - prog(t, L + 0.16, 0.45) : prog(t, CV, 0.3)} t={t} />}
        <Spot p={ch} />
        {children}
        <Mosaic />
        <Headline2 />
        <div style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 26px 34px rgba(60,35,10,0.20))'}}>
          <Character keys={sp.poses} x={ch.x} y={ch.y} scale={ch.scale} still mute={sp.mute} />
        </div>
        {showCover && <CoverFront o={coverO} t={t} content={sp.cover} />}
        <ReactionPops />
      </AbsoluteFill>
      <Sound />
    </AbsoluteFill>
  );
};
/** The whole reel: style engine + this video's scenes (children) and data (spec). */
export const ReelShell: React.FC<{spec: ReelSpec; children: React.ReactNode}> = ({spec, children}) => (
  <SpecCtx.Provider value={spec}><ReelInner>{children}</ReelInner></SpecCtx.Provider>
);
/** The cover still: exactly frame 0 of the reel. */
export const CoverStill: React.FC<{spec: ReelSpec; guides?: boolean}> = ({spec, guides}) => (
  <AbsoluteFill style={{overflow: 'hidden', background: '#F6EFE5'}}>
    <FontFaces />
    <CreamBG flood={0} />
    <CoverBack />
    <div style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 26px 34px rgba(60,35,10,0.20))'}}>
      <Character keys={[{...spec.poses[0], t: 0}]} x={COVER_CHAR.x} y={COVER_CHAR.y} scale={COVER_CHAR.scale} forceVis="M" still />
    </div>
    <CoverFront content={spec.cover} />
    {guides && <ThirdsGuides />}
  </AbsoluteFill>
);

// ============================================================ SERIAL: dialog bubble (scenario scenes with two characters)
/** Speech bubble for the scenario dialog. side 'left' = the other person (avatar + name), 'right' = Firas. Positions are pre-DY. */
export const SpeechBubble: React.FC<{at: number; side: 'left' | 'right'; name?: string; color?: string; top: number; children: React.ReactNode}> = ({at, side, name, color = AUD[1], top, children}) => {
  const {f, fps} = useT();
  const p = springAt(f, fps, at, {damping: 13, stiffness: 190, mass: 0.7});
  const left = side === 'left';
  return (
    <div style={{position: 'absolute', top, left: left ? M : undefined, right: left ? undefined : M, maxWidth: 760, display: 'flex', alignItems: 'flex-end', gap: 16,
      flexDirection: left ? 'row' : 'row-reverse', opacity: Math.min(1, p * 1.6), transform: `translateY(${(1 - p) * 40}px) scale(${0.9 + 0.1 * p})`, transformOrigin: left ? '0% 100%' : '100% 100%'}}>
      {left && <div style={{width: 84, height: 84, borderRadius: 99, background: '#fff', boxShadow: SH, overflow: 'hidden', flexShrink: 0, position: 'relative'}}>
        <div style={{position: 'absolute', left: 4, top: 6}}><Person c={color} size={76} /></div></div>}
      <div style={{background: left ? '#fff' : C.orange, color: left ? C.ink : '#fff', borderRadius: left ? '34px 34px 34px 8px' : '34px 34px 8px 34px', padding: '22px 30px', boxShadow: SH,
        fontFamily: FONT, fontWeight: 700, fontSize: 40, lineHeight: 1.2, letterSpacing: -0.5}}>
        {name && <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 20, letterSpacing: 3, color: left ? C.soft : 'rgba(255,255,255,0.8)', marginBottom: 6}}>{name}</div>}
        {children}
      </div>
    </div>
  );
};

// ============================================================ SERIAL: CTA master (do not restyle per episode)
// Comment the keyword -> tap Kirim -> DM arrives -> "Ilmunya lewat DM!" on the orange flood. Same layout, motion and SFX every episode.
export type CtaSpec = {
  keyword: string;   // KOMUNIKASI for the Communication series
  start: number;     // CTA line starts (comment card enters)
  type: number;      // keyword typed (when the VO says the keyword)
  tap: number;       // Kirim pressed
  dm: number;        // DM card arrives (when the VO says "DM")
  close: number;     // closing message "Ilmunya lewat DM!" (put a flood window from close to l)
  dmTitle: string;   // e.g. "Ilmu Komunikasi · EP 01"
  dmLine?: string;   // small line under the pill, e.g. "3 kalimat pembuka + contoh"
};
const Sfx: React.FC<{at: number; name: string; g: number}> = ({at, name, g}) => {
  const {fps} = useVideoConfig();
  return <Sequence from={Math.max(0, Math.round(at * fps))} durationInFrames={Math.round(2 * fps)}><Audio src={staticFile(`audio/lemo/${name}.wav`)} volume={g} /></Sequence>;
};
export const CtaDM: React.FC<{c: CtaSpec}> = ({c}) => {
  const {t, f, fps} = useT();
  const inP = springAt(f, fps, c.start, {damping: 14, stiffness: 150, mass: 0.9});
  const n = Math.floor(interpolate(t, [c.type, c.type + 0.5], [0, c.keyword.length], clamp));
  const press = interpolate(t, [c.tap - 0.06, c.tap, c.tap + 0.16], [1, 0.82, 1], clamp);
  const sent = prog(t, c.tap + 0.08, 0.3);
  const dmP = springAt(f, fps, c.dm, {damping: 12, stiffness: 170, mass: 0.8});
  const cl = prog(t, c.close, 0.5);
  const dmBig = springAt(f, fps, c.close + 0.12, {damping: 10, stiffness: 140, mass: 0.9});
  const mv = prog(t, c.start + 0.3, Math.max(0.2, c.tap - c.start - 0.35), Easing.bezier(0.65, 0, 0.35, 1));
  const kx = 72 + 936 - 150, ky = 660 + 52;
  const sfx: [number, string, number][] = [[c.start, 'whoosh_short', 0.12]];
  for (let i = 0; i < c.keyword.length; i++) sfx.push([c.type + (i * 0.5) / c.keyword.length, 'click', 0.05]);
  sfx.push([c.tap, 'click', 0.2], [c.tap + 0.05, 'pop', 0.08], [c.dm, 'ding', 0.16], [c.close - 0.05, 'whoosh', 0.15], [c.close + 0.12, 'thump', 0.14]);
  return (
    <>
      {t >= c.start - 0.05 && <AbsoluteFill>
        {/* comment box with the keyword and the Kirim button */}
        <div style={{position: 'absolute', left: 72, top: 660, width: 936, opacity: Math.min(1, inP * 1.5), transform: `translateY(${(1 - inP) * 80}px)`}}>
          <div style={{background: '#fff', borderRadius: 34, padding: '0 34px', height: 124, display: 'flex', alignItems: 'center', gap: 24, boxShadow: SH,
            outline: `3px solid ${n > 0 ? C.orange : 'rgba(22,25,26,0.08)'}`, outlineOffset: -3}}>
            <div style={{width: 60, height: 60, borderRadius: 99, background: 'radial-gradient(circle at 35% 30%, #FFB37A, #FF6A00 60%, #D95500)'}} />
            <div style={{flex: 1, fontFamily: FONT, fontWeight: n > 0 ? 800 : 600, fontSize: n > 0 ? 50 : 38, letterSpacing: n > 0 ? 1 : 0, whiteSpace: 'nowrap', color: n > 0 ? C.ink : C.faint}}>
              {n > 0 ? c.keyword.slice(0, n) : 'Tambahkan komentar...'}
              {n > 0 && n < c.keyword.length && <span style={{display: 'inline-block', width: 4, height: 46, background: C.orange, marginLeft: 4, verticalAlign: -6}} />}
            </div>
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.orange, transform: `scale(${press})`}}>Kirim</div>
          </div>
          <div style={{marginTop: 14, textAlign: 'right', fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: 3, color: C.green, opacity: sent, transform: `translateY(${(1 - sent) * 10}px)`}}>
            ✓ KOMENTAR TERKIRIM</div>
        </div>
        {/* tap cursor */}
        {t < c.tap + 0.6 && <div style={{position: 'absolute', left: interpolate(mv, [0, 1], [860, kx + 40]), top: interpolate(mv, [0, 1], [1010, ky + 10]), transform: `scale(${press})`,
          opacity: prog(t, c.start + 0.2, 0.2) * (1 - prog(t, c.tap + 0.35, 0.25))}}>
          <svg width={72} height={72} viewBox="0 0 24 24"><path d="M9 11V4.5a1.5 1.5 0 0 1 3 0V10l5 1.2c.9.2 1.5 1.1 1.3 2l-1 5.3a2 2 0 0 1-2 1.5H11a2 2 0 0 1-1.6-.8L6 15c-.6-.8 0-2 1-2 .4 0 .8.2 1 .5L9 15z" fill="#fff" stroke={C.ink} strokeWidth={1.3} strokeLinejoin="round" /></svg>
        </div>}
        {/* DM arrives */}
        {t >= c.dm - 0.05 && <div style={{position: 'absolute', left: 72, top: 862, width: 936, opacity: Math.min(1, dmP * 1.6), transform: `translateY(${(1 - dmP) * -40}px) scale(${0.94 + 0.06 * dmP})`}}>
          <div style={{background: '#fff', borderRadius: 34, padding: '28px 34px', boxShadow: SH}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
              <Img src={staticFile('logo_academy.png')} style={{width: 56, height: 56, borderRadius: 99}} />
              <span style={{fontFamily: FONT, fontWeight: 800, fontSize: 32, color: C.ink}}>berarti.academy</span>
              <span style={{fontFamily: FONT, fontWeight: 600, fontSize: 26, color: C.soft}}>mengirim pesan</span>
              <span style={{marginLeft: 'auto', width: 16, height: 16, borderRadius: 99, background: C.red}} />
            </div>
            <div style={{display: 'inline-block', marginTop: 20, background: C.orange, color: '#fff', borderRadius: 18, padding: '16px 26px', fontFamily: FONT, fontWeight: 800, fontSize: 36}}>{c.dmTitle}</div>
            {c.dmLine && <div style={{marginTop: 14, fontFamily: MONO, fontSize: 24, color: C.soft}}>{c.dmLine}</div>}
          </div>
        </div>}
        {/* closing message in the headline zone */}
        {t >= c.close - 0.05 && <div style={{position: 'absolute', left: 50, right: 50, top: 236, textAlign: 'center', opacity: cl, transform: `translateY(${(1 - cl) * 30}px)`}}>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 100, lineHeight: 1.05, letterSpacing: -1.5, color: '#fff'}}>Ilmunya lewat</div>
          <div style={{fontFamily: DISPLAY, fontSize: 220, lineHeight: 1.0, letterSpacing: -4, transform: `scale(${1.25 - 0.25 * dmBig})`, opacity: Math.min(1, dmBig * 1.5),
            backgroundImage: 'linear-gradient(180deg, #FFFFFF 0%, #FFE7D4 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            filter: 'drop-shadow(0 10px 22px rgba(120,40,0,0.25))'}}>DM!</div>
        </div>}
      </AbsoluteFill>}
      {sfx.map(([at, name, g], i) => <Sfx key={i} at={at} name={name} g={g} />)}
    </>
  );
};
/** Preview of the CTA master on its own (composition "CtaDemo", 6.5 s). */
export const CtaDemo: React.FC<{keyword?: string; dmTitle?: string; dmLine?: string}> = ({keyword = 'KOMUNIKASI', dmTitle = 'Ilmu Komunikasi · EP 01', dmLine = '3 langkah + contoh kalimat'}) => {
  const {t} = useT();
  const c: CtaSpec = {keyword, start: 0.3, type: 1.0, tap: 1.75, dm: 2.4, close: 3.7, dmTitle, dmLine};
  const end = charAt(720, 1450, 0.95);
  const flood = prog(t, c.close - 0.1, 0.22);
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <FontFaces />
      <CreamBG flood={flood} />
      <Spot p={end} />
      <div style={{position: 'absolute', left: 50, right: 50, top: 236, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 88, lineHeight: 1.08, color: C.ink,
        opacity: 1 - prog(t, c.close - 0.1, 0.2)}}>Komen <span style={{color: C.orange}}>KOMUNIKASI</span>, nanti aku kirim lewat DM.</div>
      <CtaDM c={c} />
      <div style={{position: 'absolute', inset: 0, filter: 'drop-shadow(0 26px 34px rgba(60,35,10,0.20))'}}>
        <Character keys={[{t: 0, pose: 'tunjuk_kamu', expr: 'ramah', mouth: 'smile'}, {t: 4.6, wink: true, head: 2}]} x={end.x} y={end.y} scale={end.scale} forceVis="G" still />
      </div>
    </AbsoluteFill>
  );
};
