import React from 'react';
import {Img, staticFile} from 'remotion';
import data from './artiData.json';

// Arti exactly as in the creator's own reference videos (cut out from their artwork), with a vector
// expression layer on top: brows, mouth and eyes are repainted per mood to match the voice-over.
export type Expr = 'neutral' | 'nervous' | 'surprised' | 'sad' | 'excited' | 'worried' | 'cringe' | 'pressed' | 'down'
  | 'pensive' | 'confused' | 'realize' | 'calm' | 'talk' | 'smile' | 'determined' | 'warm';
type Face = {w: number; h: number; el: number[]; er: number[]; bl: number[]; br: number[]; gap: number; mouth: number[];
  forehead: string; mouthSkin: string; skin: string};
const FACES = (data as unknown as {faces: Record<string, Face>}).faces;

const BROW: Record<Expr, {l: number; r: number; dy: number}> = {
  neutral: {l: 0, r: 0, dy: 0}, calm: {l: 0, r: 0, dy: 0}, smile: {l: 0, r: 0, dy: -0.04}, warm: {l: -4, r: 4, dy: -0.04},
  nervous: {l: -16, r: 16, dy: -0.08}, worried: {l: -18, r: 18, dy: -0.1}, cringe: {l: -20, r: 20, dy: 0.02}, sad: {l: -14, r: 14, dy: 0.02},
  surprised: {l: 0, r: 0, dy: -0.3}, excited: {l: -4, r: 4, dy: -0.22}, pressed: {l: -8, r: 8, dy: 0.06}, down: {l: -10, r: 10, dy: 0.06},
  pensive: {l: -8, r: 8, dy: 0}, confused: {l: -12, r: 6, dy: -0.06}, realize: {l: 0, r: 0, dy: -0.24}, talk: {l: 0, r: 0, dy: -0.06},
  determined: {l: 10, r: -10, dy: 0.04},
};

export const Arti: React.FC<{
  img: string; faceKey?: string; x: number; y: number; scale?: number; expr?: Expr; t: number; talk?: boolean;
  look?: [number, number]; sweat?: boolean; blush?: boolean; zip?: number; rotate?: number; origin?: string; opacity?: number;
  w: number; h: number;
}> = ({img, faceKey, x, y, scale = 1, expr = 'neutral', t, talk, look = [0, 0], sweat, blush, zip = 0, rotate = 0, origin = '50% 100%', opacity = 1, w, h}) => {
  const F = faceKey ? FACES[faceKey] : undefined;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w * scale, height: h * scale, transform: `rotate(${rotate}deg)`, transformOrigin: origin, opacity}}>
      <Img src={staticFile(img)} style={{width: '100%', height: '100%'}} />
      {F && <FaceLayer F={F} expr={expr} t={t} talk={talk} look={look} sweat={sweat} blush={blush} zip={zip} />}
    </div>
  );
};

const FaceLayer: React.FC<{F: Face; expr: Expr; t: number; talk?: boolean; look: [number, number]; sweat?: boolean; blush?: boolean; zip: number}> =
  ({F, expr, t, talk, look, sweat, blush, zip}) => {
  const g = F.gap;
  const id = `f${F.w}x${F.h}`;
  const b = BROW[expr];
  const [ex, ey] = [look[0] * g * 0.18, look[1] * g * 0.18];
  const blink = (t % 4.1) < 0.11;
  const closedHappy = expr === 'excited' || expr === 'warm';
  const repaintEyes = blink || closedHappy || expr === 'surprised' || expr === 'realize' || look[0] !== 0 || look[1] !== 0 || expr === 'down' || expr === 'pensive';
  const eyeR = (expr === 'surprised' || expr === 'realize' ? 0.32 : 0.24) * g;
  const eyeRy = (expr === 'surprised' || expr === 'realize' ? 0.42 : 0.34) * g;
  const eDy = expr === 'down' ? 0.16 * g : expr === 'pensive' ? -0.12 * g : 0;
  const mx = F.mouth[0], my = F.mouth[1];
  const open = talk ? (Math.sin(t * 17) * 0.5 + 0.5) * (Math.sin(t * 5.3) * 0.3 + 0.7) : 0;
  const mw = g * 0.62;
  const mouth = (() => {
    switch (expr) {
      case 'smile': case 'warm': return <path d={`M${mx - mw} ${my - 2} Q${mx} ${my + g * 0.45} ${mx + mw} ${my - 2}`} fill="none" stroke="#7A3328" strokeWidth={g * 0.12} strokeLinecap="round" />;
      case 'excited': case 'realize': return <path d={`M${mx - mw} ${my - g * 0.08} Q${mx} ${my + g * 0.62} ${mx + mw} ${my - g * 0.08} Z`} fill="#7A3328" />;
      case 'sad': case 'down': return <path d={`M${mx - mw * 0.8} ${my + g * 0.12} Q${mx} ${my - g * 0.18} ${mx + mw * 0.8} ${my + g * 0.12}`} fill="none" stroke="#7A3328" strokeWidth={g * 0.11} strokeLinecap="round" />;
      case 'nervous': case 'cringe': return <path d={`M${mx - mw} ${my} q${mw * 0.33} ${-g * 0.14} ${mw * 0.66} 0 t${mw * 0.66} 0 t${mw * 0.66} 0`} fill="none" stroke="#7A3328" strokeWidth={g * 0.1} strokeLinecap="round" />;
      case 'surprised': return <ellipse cx={mx} cy={my + g * 0.05} rx={g * 0.2} ry={g * 0.27} fill="#7A3328" />;
      case 'pressed': return <path d={`M${mx - mw * 0.7} ${my} L${mx + mw * 0.7} ${my}`} stroke="#7A3328" strokeWidth={g * 0.13} strokeLinecap="round" />;
      case 'confused': case 'pensive': case 'worried': return <path d={`M${mx - mw * 0.6} ${my + g * 0.05} L${mx + mw * 0.5} ${my - g * 0.06}`} stroke="#7A3328" strokeWidth={g * 0.11} strokeLinecap="round" />;
      case 'determined': return <path d={`M${mx - mw * 0.7} ${my} Q${mx} ${my + g * 0.16} ${mx + mw * 0.7} ${my}`} fill="none" stroke="#7A3328" strokeWidth={g * 0.12} strokeLinecap="round" />;
      case 'talk': return <ellipse cx={mx} cy={my + g * 0.04} rx={mw * 0.55} ry={g * (0.06 + 0.2 * open)} fill="#7A3328" />;
      default: return <path d={`M${mx - mw * 0.6} ${my} L${mx + mw * 0.6} ${my}`} stroke="#7A3328" strokeWidth={g * 0.11} strokeLinecap="round" />;
    }
  })();
  const talking = talk && expr !== 'talk' ? <ellipse cx={mx} cy={my + g * 0.06} rx={mw * 0.5} ry={g * (0.05 + 0.18 * open)} fill="#7A3328" /> : null;
  return (
    <svg viewBox={`0 0 ${F.w} ${F.h}`} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible'}}>
      <defs><filter id={`${id}b`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={g * 0.07} /></filter></defs>
      {/* repaint brows and mouth with the face's own skin tone */}
      <g filter={`url(#${id}b)`}>
        <ellipse cx={F.bl[0]} cy={F.bl[1]} rx={g * 1.05} ry={g * 0.42} fill={F.forehead} />
        <ellipse cx={F.br[0]} cy={F.br[1]} rx={g * 1.05} ry={g * 0.42} fill={F.forehead} />
        <ellipse cx={mx} cy={my} rx={g * 1.05} ry={g * 0.5} fill={F.mouthSkin} />
        {repaintEyes && <><ellipse cx={F.el[0]} cy={F.el[1]} rx={g * 0.42} ry={g * 0.55} fill={F.skin} /><ellipse cx={F.er[0]} cy={F.er[1]} rx={g * 0.42} ry={g * 0.55} fill={F.skin} /></>}
      </g>
      {/* brows */}
      {[[F.bl, b.l], [F.br, b.r]].map(([p, ang], i) => {
        const pt = p as number[];
        return <rect key={i} x={pt[0] - g * 0.82} y={pt[1] - g * 0.17 + b.dy * g} width={g * 1.64} height={g * 0.34} rx={g * 0.17} fill="#2A1C14"
          transform={`rotate(${ang as number} ${pt[0]} ${pt[1] + b.dy * g})`} />;
      })}
      {/* eyes (only when they change) */}
      {repaintEyes && [F.el, F.er].map((p, i) => blink || closedHappy
        ? <path key={i} d={closedHappy ? `M${p[0] - g * 0.28} ${p[1] + g * 0.08} Q${p[0]} ${p[1] - g * 0.28} ${p[0] + g * 0.28} ${p[1] + g * 0.08}` : `M${p[0] - g * 0.26} ${p[1]} L${p[0] + g * 0.26} ${p[1]}`}
            fill="none" stroke="#231915" strokeWidth={g * 0.12} strokeLinecap="round" />
        : <g key={i}><ellipse cx={p[0] + ex} cy={p[1] + ey + eDy} rx={eyeR} ry={eyeRy} fill="#231915" /><circle cx={p[0] + ex + eyeR * 0.35} cy={p[1] + ey + eDy - eyeRy * 0.4} r={eyeR * 0.3} fill="white" /></g>)}
      {mouth}{talking}
      {blush && <><ellipse cx={F.el[0] - g * 0.3} cy={F.el[1] + g * 1.05} rx={g * 0.45} ry={g * 0.22} fill="#F07F6B" opacity={0.4} /><ellipse cx={F.er[0] + g * 0.3} cy={F.er[1] + g * 1.05} rx={g * 0.45} ry={g * 0.22} fill="#F07F6B" opacity={0.4} /></>}
      {sweat && <path d={`M${F.er[0] + g * 1.25} ${F.br[1] - g * 0.2} q${g * 0.28} ${g * 0.45} 0 ${g * 0.62} q${-g * 0.28} ${-g * 0.17} 0 ${-g * 0.62} Z`} fill="#8FD0F2"
        transform={`translate(0 ${((t * 18) % 10) * g * 0.02})`} />}
      {zip > 0 && <g opacity={zip} transform={`translate(${mx} ${my})`}>
        <rect x={-g * 0.85} y={-g * 0.13} width={g * 1.7} height={g * 0.26} rx={g * 0.1} fill="#5B5F66" />
        {Array.from({length: 7}).map((_, i) => <rect key={i} x={-g * 0.78 + i * g * 0.24} y={-g * 0.2} width={g * 0.1} height={g * 0.4} fill="#9AA0A8" />)}
        <rect x={g * 0.7} y={-g * 0.26} width={g * 0.32} height={g * 0.5} rx={g * 0.08} fill="#C9CDD3" />
      </g>}
    </svg>
  );
};

// natural sizes of the cut-outs (pixels, same scale as the 1080x1920 reference frames)
export const SIZE: Record<string, [number, number]> = {
  meet_hijabL: [245, 335], meet_arti: [295, 347], meet_curly: [265, 349], meet_hijabR: [200, 327],
  bust_front: [406, 583], bust_dark: [319, 391], stand_present: [464, 738], desk_arti: [340, 365],
};
