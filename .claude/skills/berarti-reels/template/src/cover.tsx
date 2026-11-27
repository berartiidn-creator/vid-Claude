// BERARTI Reels: cover layout (engine). Frame 0 of every reel and the uploaded thumbnail.
// Rule of thirds inside the 4:5 profile-grid crop (y 285..1635): headline in the top third, the "wrong" line as a struck
// speech bubble middle-left, the fix as a pill under it, the face on the right third line, the pointing hand in the bottom third.
import React from 'react';
import {Character} from './Char';

const C = {ink: '#16191A', orange: '#FF6A00', orangeTint: '#FFE7D4', green: '#0F5B46', greenTint: '#DCEFE7', red: '#E5484D'};
const DISPLAY = "'Archivo Black', sans-serif";
const FONT = "'Montserrat', sans-serif";
const SH = '0 2px 4px rgba(48,32,16,0.06), 0 16px 36px rgba(48,32,16,0.10), 0 36px 72px rgba(48,32,16,0.08)';

export const HANDLE = '@berarti.academy';
const ML = 80, CW = 920;
const ROW1 = 333;            // header row (handle left, pillar chip right), 48 px inside the 4:5 crop
const RULE = ROW1 + 72;      // hairline
const HEAD = RULE + 48;      // headline top
export const X1 = 360, X2 = 720, Y1 = 285 + 450, Y2 = 285 + 900;
const F2 = {fx: X2, fy: 1135, s: 1.16};

/** Per-video cover text. Keep the headline to 3 lines of Archivo Black at 86 px (about 14 characters per line). */
export type CoverContent = {headline: React.ReactNode; bubble: React.ReactNode; pill: React.ReactNode; pillar?: string};

const Header: React.FC<{pillar: string}> = ({pillar}) => (
  <>
    <div style={{position: 'absolute', left: ML, width: CW, top: ROW1, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 27, letterSpacing: 0.3, color: C.ink}}>{HANDLE}</span>
      <div style={{display: 'flex', alignItems: 'center', gap: 10, height: 44, padding: '0 20px', borderRadius: 999, background: C.green, color: '#fff',
        fontFamily: FONT, fontWeight: 800, fontSize: 20, letterSpacing: 4}}>
        <span style={{width: 9, height: 9, borderRadius: 99, background: '#7FE0B8'}} />{pillar}
      </div>
    </div>
    <div style={{position: 'absolute', left: ML, width: CW, top: RULE, height: 2, background: 'rgba(22,25,26,0.10)'}} />
  </>
);
const Headline: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', left: ML, width: CW, top: HEAD, fontFamily: DISPLAY, fontSize: 86, lineHeight: 1.0, letterSpacing: -2, color: C.ink, isolation: 'isolate'}}>{children}</div>
);
/** Orange highlighted words inside the cover headline. */
export const Marker: React.FC<{children: React.ReactNode; color?: string}> = ({children, color = C.orange}) => (
  <span style={{position: 'relative', color, whiteSpace: 'nowrap'}}>
    <span style={{position: 'absolute', left: -6, right: -6, bottom: '8%', height: '32%', borderRadius: 10, background: color === C.orange ? C.orangeTint : C.greenTint, zIndex: -1}} />
    {children}
  </span>
);
const Pill: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{display: 'inline-flex', alignItems: 'center', gap: 14, height: 76, padding: '0 34px', borderRadius: 999, background: C.ink, color: '#fff',
    fontFamily: FONT, fontWeight: 800, fontSize: 32, boxShadow: SH, whiteSpace: 'nowrap'}}>{children}</div>
);
/** Character x/y/scale that puts the rig's face centre (canvas 700,330) on (fx, fy). */
export const charAt = (fx: number, fy: number, s: number) => { const W = 1340, H = 1411, faceX = 700, faceY = 330;
  return {x: fx - W / 2 - (faceX - W / 2) * s, y: fy - H + (H - faceY) * s, scale: s}; };
export const COVER_CHAR = charAt(F2.fx, F2.fy, F2.s);
const ei = (v: number) => Math.pow(Math.min(1, Math.max(0, v)), 3);
export const CoverBack: React.FC<{o?: number; t?: number}> = ({o = 0, t = 0}) => (
  <div style={{position: 'absolute', left: F2.fx - 420, top: F2.fy - 440, width: 840, height: 840, borderRadius: 999, opacity: (1 - o) * (1 + 0.08 * Math.sin(t * 2.4)),
    background: 'radial-gradient(circle, rgba(255,106,0,0.16) 0%, rgba(255,106,0,0.06) 45%, rgba(255,106,0,0) 70%)'}} />
);
/** o: exit progress 0..1 (each element staggered), t: seconds for the idle float. o = 0 is the still cover. */
export const CoverFront: React.FC<{o?: number; t?: number; content: CoverContent}> = ({o = 0, t = 0, content}) => {
  const k = (d: number) => ei((o - d) / (1 - d));
  const fl = Math.sin(t * 2.2) * 5;
  return (
    <>
      <div style={{opacity: 1 - k(0.25), transform: `translateY(${-40 * k(0.25)}px) scale(${1 + 0.06 * k(0.25)})`, transformOrigin: '50% 0%', filter: k(0.25) > 0.02 ? `blur(${k(0.25) * 10}px)` : undefined, position: 'absolute', inset: 0}}>
        <Headline>{content.headline}</Headline>
      </div>
      <div style={{position: 'absolute', left: ML, top: Y1 + 40 + (o > 0 ? 0 : fl), width: 540, opacity: 1 - k(0.05), transform: `translateX(${-140 * k(0.05)}px) scale(${1 - 0.25 * k(0.05)}) rotate(${-6 * k(0.05)}deg)`, transformOrigin: '100% 60%'}}>
        <div style={{position: 'relative', background: '#fff', borderRadius: 40, padding: '38px 44px', boxShadow: SH}}>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 58, lineHeight: 1.1, color: C.ink, letterSpacing: -1}}>{content.bubble}</div>
          <div style={{position: 'absolute', left: 34, right: 34, top: '50%', height: 11, borderRadius: 6, background: C.red, transform: 'rotate(-7deg)', boxShadow: '0 4px 10px rgba(229,72,77,0.35)'}} />
          <div style={{position: 'absolute', right: -30, top: 150, width: 0, height: 0, borderTop: '22px solid transparent', borderBottom: '22px solid transparent', borderLeft: '40px solid #fff'}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: ML, top: Y1 + 40 + 268, opacity: 1 - k(0.12), transform: `translateX(${-160 * k(0.12)}px)`}}><Pill>{content.pill}</Pill></div>
      <div style={{position: 'absolute', inset: 0, opacity: 1 - k(0), transform: `translateY(${-24 * k(0)}px)`}}><Header pillar={content.pillar ?? 'COMMUNICATION'} /></div>
    </>
  );
};
/** QC overlay: rule-of-thirds lines and the 4:5 grid crop. */
export const ThirdsGuides: React.FC = () => (
  <>
    {[X1, X2].map((x) => <div key={x} style={{position: 'absolute', left: x - 1, top: 285, width: 2, height: 1350, background: 'rgba(0,163,255,0.8)'}} />)}
    {[Y1, Y2].map((y) => <div key={y} style={{position: 'absolute', top: y - 1, left: 0, width: 1080, height: 2, background: 'rgba(0,163,255,0.8)'}} />)}
    <div style={{position: 'absolute', left: 0, top: 285, width: 1080, height: 1350, outline: '3px solid rgba(0,163,255,0.9)', outlineOffset: -3}} />
  </>
);
