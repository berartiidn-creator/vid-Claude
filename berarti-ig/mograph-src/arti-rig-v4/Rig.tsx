import React from 'react';

// Rigged flat-vector Arti for BERARTI "Bold Editorial Stage".
// Every joint is a number, so poses blend smoothly: anticipation, overshoot, follow-through, breathing, blinking, lip movement.
export type Hand = 'relaxed' | 'open' | 'point' | 'fist' | 'flat' | 'clicker' | 'wave';
export type Brows = 'calm' | 'worried' | 'sad' | 'up' | 'think' | 'determined';
export type Mouth = 'smile' | 'calm' | 'nervous' | 'pressed' | 'o' | 'sad' | 'open' | 'talk' | 'side';
export type Arm = {s: number; e: number; h: number; hand: Hand};
export type RigPose = {
  lean: number; crouch: number; shiftX: number; tilt: number; nod: number; turn: number;
  armR: Arm; armL: Arm; brows: Brows; mouth: Mouth; lookX: number; lookY: number; eyeOpen: number; talk: number;
};
export const BASE: RigPose = {
  lean: 0, crouch: 0, shiftX: 0, tilt: 0, nod: 0, turn: 0,
  armR: {s: 8, e: 4, h: 0, hand: 'clicker'}, armL: {s: 8, e: 4, h: 0, hand: 'relaxed'},
  brows: 'calm', mouth: 'smile', lookX: 0, lookY: 0, eyeOpen: 1, talk: 0,
};
export type Key = {t: number; dur?: number; ease?: 'inout' | 'back' | 'out' | 'in'; p: Partial<Omit<RigPose, 'armR' | 'armL'>> & {armR?: Partial<Arm>; armL?: Partial<Arm>}};

const E = {
  inout: (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  out: (x: number) => 1 - Math.pow(1 - x, 3),
  in: (x: number) => x * x * x,
  back: (x: number) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
};
const L = (a: number, b: number, p: number) => a + (b - a) * p;
const lerpArm = (a: Arm, b: Arm, p: number): Arm => ({s: L(a.s, b.s, p), e: L(a.e, b.e, p), h: L(a.h, b.h, p), hand: p < 0.5 ? a.hand : b.hand});

/** Builds full states from cumulative keyframes and samples the pose at time t. */
export const makeTimeline = (keys: Key[], start: RigPose = BASE) => {
  const states: RigPose[] = [];
  let cur = start;
  for (const k of keys) {
    cur = {...cur, ...k.p, armR: {...cur.armR, ...(k.p.armR ?? {})}, armL: {...cur.armL, ...(k.p.armL ?? {})}} as RigPose;
    states.push(cur);
  }
  return (t: number): RigPose => {
    let prev = start;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i], d = k.dur ?? 0.45;
      if (t < k.t) return prev;
      const p = Math.min(1, (t - k.t) / d);
      const e = E[k.ease ?? 'inout'](p);
      const target = states[i];
      const blended: RigPose = {...target};
      for (const f of ['lean', 'crouch', 'shiftX', 'tilt', 'nod', 'turn', 'lookX', 'lookY', 'eyeOpen', 'talk'] as const) blended[f] = L(prev[f], target[f], e);
      blended.armR = lerpArm(prev.armR, target.armR, e); blended.armL = lerpArm(prev.armL, target.armL, e);
      blended.brows = e < 0.5 ? prev.brows : target.brows; blended.mouth = e < 0.5 ? prev.mouth : target.mouth;
      if (p < 1) { if (i === keys.length - 1 || t < keys[i + 1].t) return blended; }
      prev = blended;
    }
    return prev;
  };
};

const C = {skin: '#F1B387', skinShade: '#DE9A6E', hair: '#2C241E', hairHi: '#6A625B', blazer: '#2F6845', blazerShade: '#245637', tee: '#F7F5F0',
  pants: '#D3B78F', pantsShade: '#BEA078', shoe: '#F7F7F5', sole: '#1E1E1E', ink: '#231915', lip: '#7A3328'};
const ARM_SHADOW = 'drop-shadow(3px 5px 0 rgba(18,45,30,0.22))';

const HandShape: React.FC<{hand: Hand; mirror: boolean}> = ({hand, mirror}) => (
  <g transform={`${mirror ? 'scale(-1 1) ' : ''}scale(0.86)`}>
    {hand === 'relaxed' && <><ellipse cx={0} cy={26} rx={20} ry={27} fill={C.skin} /><ellipse cx={-15} cy={14} rx={8} ry={14} fill={C.skin} transform="rotate(25 -15 14)" /><path d="M8 20 Q12 34 6 46" fill="none" stroke={C.skinShade} strokeWidth={3} strokeLinecap="round" /></>}
    {hand === 'fist' && <><circle cx={0} cy={24} r={23} fill={C.skin} /><path d="M-12 18 h24 M-12 28 h24" stroke={C.skinShade} strokeWidth={3} strokeLinecap="round" /></>}
    {hand === 'clicker' && <><rect x={-8} y={20} width={17} height={50} rx={8} fill="#1C1C1C" /><circle cx={0} cy={24} r={23} fill={C.skin} /><ellipse cx={-17} cy={14} rx={7} ry={12} fill={C.skin} transform="rotate(20 -17 14)" /></>}
    {hand === 'point' && <><circle cx={0} cy={22} r={21} fill={C.skin} /><rect x={-6} y={22} width={13} height={48} rx={6.5} fill={C.skin} /></>}
    {hand === 'flat' && <><ellipse cx={0} cy={30} rx={19} ry={34} fill={C.skin} /><ellipse cx={-14} cy={14} rx={7} ry={13} fill={C.skin} transform="rotate(30 -14 14)" /></>}
    {(hand === 'open' || hand === 'wave') && <g>
      {[-22, -7, 8, 23].map((a, i) => <rect key={i} x={-5.5} y={22} width={11} height={i === 0 || i === 3 ? 38 : 44} rx={5.5} fill={C.skin} transform={`rotate(${a} 0 24)`} />)}
      <ellipse cx={0} cy={24} rx={22} ry={22} fill={C.skin} />
      <rect x={-5.5} y={10} width={11} height={32} rx={5.5} fill={C.skin} transform="rotate(70 0 18)" />
    </g>}
  </g>
);

const SHOULDER = {R: [132, 314], L: [268, 314]} as const;
const ArmShape: React.FC<{side: 'R' | 'L'; arm: Arm; lag: number}> = ({side, arm, lag}) => {
  const sgn = side === 'R' ? 1 : -1; // R = character's right = screen left
  const [x, y] = SHOULDER[side];
  return (
    <g transform={`translate(${x} ${y}) rotate(${sgn * arm.s})`} style={{filter: ARM_SHADOW}}>
      <path d="M-24 -12 Q0 -30 24 -12 L21 150 Q0 160 -21 150 Z" fill={C.blazer} />
      <g transform={`translate(0 146) rotate(${sgn * arm.e})`}>
        <circle cx={0} cy={0} r={21} fill={C.blazer} />
        <path d="M-21 0 L-18 128 Q0 134 18 128 L21 0 Z" fill={C.blazer} />
        <path d="M-18 118 L-18 130 Q0 136 18 130 L18 118 Z" fill={C.blazerShade} />
        <g transform={`translate(0 130) rotate(${sgn * (arm.h + lag)})`}><HandShape hand={arm.hand} mirror={side === 'L'} /></g>
      </g>
    </g>
  );
};

const browAng: Record<Brows, [number, number, number]> = {calm: [0, 0, 0], worried: [-14, 14, -6], sad: [-10, 10, 2], up: [-4, 4, -14], think: [-12, 4, -4], determined: [12, -12, 4]};

/** Torso panel of an open blazer for the screen-left side; the right side is its mirror. */
const Panel: React.FC<{mirror?: boolean; pocket?: boolean}> = ({mirror, pocket}) => (
  <g transform={mirror ? 'translate(400 0) scale(-1 1)' : undefined}>
    <path d="M120 312 Q124 294 146 290 L170 288 L166 470 L164 606 Q140 612 116 602 L114 340 Z" fill={C.blazer} />
    <path d="M170 288 L154 298 L146 328 L156 336 L150 350 L166 450 Z" fill={C.blazerShade} />
    {pocket && <rect x={126} y={394} width={28} height={20} rx={3} fill={C.blazerShade} />}
  </g>
);

export const ArtiRig: React.FC<{t: number; pose: RigPose; lagPose?: RigPose; x: number; y: number; height: number; flip?: boolean; shadow?: boolean}> = ({t, pose: P, lagPose, x, y, height, flip, shadow = true}) => {
  const s = height / 1000;
  const breath = Math.sin((t * 2 * Math.PI) / 3.4);
  const sway = Math.sin(t * 1.15) * 0.6;
  const blinkPhase = (t + 0.37 * Math.floor(t / 3.7)) % 3.7;
  const blink = blinkPhase < 0.12 ? Math.abs(blinkPhase - 0.06) / 0.06 : 1;
  const eyeOpen = Math.min(blink, P.eyeOpen);
  const talkAmt = P.talk > 0.05 ? P.talk * (0.5 + 0.5 * Math.sin(t * 19)) * (0.6 + 0.4 * Math.sin(t * 6.1)) : 0;
  const drop = P.crouch * 30;
  const tx = P.turn * 16;
  const [bl, br, bdy] = browAng[P.brows];
  // follow-through: hair and hands trail behind fast head/arm moves
  const L0 = lagPose ?? P;
  const headAng = P.tilt + P.nod + P.lean, headAng0 = L0.tilt + L0.nod + L0.lean;
  const hairLag = Math.max(-10, Math.min(10, (headAng0 - headAng) * 0.9 + (L0.crouch - P.crouch) * 14));
  const handLagR = Math.max(-25, Math.min(25, (L0.armR.s + L0.armR.e - P.armR.s - P.armR.e) * 0.35));
  const handLagL = Math.max(-25, Math.min(25, (L0.armL.s + L0.armL.e - P.armL.s - P.armL.e) * 0.35));
  const mouthPath = (() => {
    switch (P.mouth) {
      case 'smile': return <path d="M-22 54 Q0 72 22 54" fill="none" stroke={C.lip} strokeWidth={6} strokeLinecap="round" />;
      case 'open': return <path d="M-24 50 Q0 90 24 50 Z" fill={C.lip} />;
      case 'calm': return <path d="M-16 58 Q0 64 16 58" fill="none" stroke={C.lip} strokeWidth={6} strokeLinecap="round" />;
      case 'nervous': return <path d="M-22 60 q7 -7 14 0 t14 0 t14 0" fill="none" stroke={C.lip} strokeWidth={5.5} strokeLinecap="round" />;
      case 'pressed': return <path d="M-14 60 L14 60" stroke={C.lip} strokeWidth={6} strokeLinecap="round" />;
      case 'o': return <ellipse cx={0} cy={60} rx={9} ry={12} fill={C.lip} />;
      case 'sad': return <path d="M-18 66 Q0 54 18 66" fill="none" stroke={C.lip} strokeWidth={6} strokeLinecap="round" />;
      case 'side': return <path d="M-12 62 L16 57" stroke={C.lip} strokeWidth={6} strokeLinecap="round" />;
      default: return <ellipse cx={0} cy={60} rx={15} ry={4 + 13 * talkAmt} fill={C.lip} />;
    }
  })();
  return (
    <div style={{position: 'absolute', left: x - 200 * s, top: y, width: 400 * s, height, transform: flip ? 'scaleX(-1)' : undefined}}>
      <svg width={400 * s} height={height} viewBox="0 0 400 1000" style={{overflow: 'visible'}}>
        {shadow && <ellipse cx={200 + P.shiftX * 0.5} cy={982} rx={120} ry={15} fill="#00000020" />}
        {/* legs: slim chinos with one soft shade on the inner leg */}
        <g transform={`translate(${P.shiftX * 0.4} 0)`}>
          <path d={`M126 ${570 + drop} L274 ${570 + drop} L272 ${700 + drop} L128 ${700 + drop} Z`} fill={C.pants} />
          <path d={`M128 ${690 + drop} L199 ${690 + drop} L190 956 L140 956 Z`} fill={C.pants} />
          <path d={`M201 ${690 + drop} L272 ${690 + drop} L260 956 L210 956 Z`} fill={C.pants} />
          <path d={`M200 ${700 + drop} Q216 ${720 + drop} 218 956 L210 956 Z`} fill={C.pantsShade} opacity={0.8} />
          {[[124, 0], [204, 1]].map(([sx, i]) => (
            <g key={i}>
              <path d={`M${sx + 6} 950 Q${sx + 4} 938 ${sx + 20} 936 L${sx + 56} 936 Q${sx + 74} 940 ${sx + 74} 962 L${sx + 74} 970 L${sx + 2} 970 Z`} fill={C.shoe} />
              <path d={`M${sx + 22} 946 L${sx + 46} 946`} stroke="#D9D9D6" strokeWidth={3} strokeLinecap="round" />
              <rect x={sx} y={968} width={76} height={12} rx={6} fill={C.sole} />
            </g>
          ))}
        </g>
        {/* upper body, pivoting at the hips */}
        <g transform={`translate(${P.shiftX} ${drop}) rotate(${P.lean + sway} 200 600)`}>
          <g transform={`translate(0 ${-breath * 3}) scale(1 ${1 + breath * 0.008})`} style={{transformOrigin: '200px 600px'}}>
            <rect x={182} y={232} width={36} height={70} rx={12} fill={C.skin} />
            <path d="M182 262 Q200 278 218 262 L218 276 Q200 292 182 276 Z" fill={C.skinShade} />
            <path d="M150 294 Q200 284 250 294 L254 604 L146 604 Z" fill={C.tee} />
            <path d="M176 292 Q200 306 224 292" fill="none" stroke="#E4E0D8" strokeWidth={4} strokeLinecap="round" />
            <rect x={146} y={594} width={108} height={12} fill={C.pantsShade} />
            <Panel pocket />
            <Panel mirror />
          </g>
          {/* head */}
          <g transform={`translate(200 ${152 - breath * 2}) rotate(${P.tilt + P.nod}) scale(0.92)`}>
            <ellipse cx={-88 + tx * 0.3} cy={14} rx={14} ry={20} fill={C.skin} />
            <ellipse cx={88 + tx * 0.3} cy={14} rx={14 * (1 - Math.max(0, P.turn) * 0.4)} ry={20} fill={C.skin} />
            <ellipse cx={-88 + tx * 0.3} cy={14} rx={6} ry={10} fill={C.skinShade} />
            <ellipse cx={88 + tx * 0.3} cy={14} rx={6} ry={10} fill={C.skinShade} />
            <path d="M-84 -10 Q-86 70 -42 104 Q0 128 42 104 Q86 70 84 -10 Q78 -96 0 -98 Q-78 -96 -84 -10 Z" fill={C.skin} />
            <g transform={`translate(${tx * 0.25} 0) rotate(${hairLag} 0 -60)`}>
              <path d="M-86 26 C-100 2 -112 -30 -104 -58 C-118 -92 -90 -124 -62 -126 C-50 -152 -8 -156 8 -142 C32 -160 78 -150 88 -120 C114 -110 120 -70 106 -46 C116 -20 106 6 90 26 L82 -4 C80 -24 78 -36 72 -48 C70 -34 60 -26 48 -44 C56 -54 58 -62 50 -66 C18 -74 -30 -72 -64 -52 C-74 -40 -76 -18 -74 6 Z" fill={C.hair} />
              <path d="M-14 -122 Q48 -140 74 -100 Q86 -80 72 -66" fill="none" stroke={C.hairHi} strokeWidth={9} strokeLinecap="round" />
            </g>
            <g transform={`translate(${tx} ${bdy})`}>
              <rect x={-56} y={-32} width={40} height={8} rx={4} fill={C.ink} transform={`rotate(${bl} -36 -28)`} />
              <rect x={16} y={-32} width={40} height={8} rx={4} fill={C.ink} transform={`rotate(${br} 36 -28)`} />
            </g>
            <g transform={`translate(${tx + P.lookX * 6} ${P.lookY * 5})`}>
              <ellipse cx={-34} cy={8} rx={8.5} ry={11 * eyeOpen} fill={C.ink} />
              <ellipse cx={34} cy={8} rx={8.5} ry={11 * eyeOpen} fill={C.ink} />
              {eyeOpen > 0.5 && <><circle cx={-31} cy={4} r={2.6} fill="white" /><circle cx={37} cy={4} r={2.6} fill="white" /></>}
            </g>
            <path d={`M${6 + tx * 1.2} 16 Q${-2 + tx * 1.2} 36 ${10 + tx * 1.2} 38`} fill="none" stroke={C.skinShade} strokeWidth={5} strokeLinecap="round" />
            <g transform={`translate(${tx} 0)`}>{mouthPath}</g>
          </g>
          <ArmShape side="R" arm={P.armR} lag={handLagR} />
          <ArmShape side="L" arm={P.armL} lag={handLagL} />
        </g>
      </svg>
    </div>
  );
};
