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

const C = {skin: '#F2B48A', skinDark: '#D98E64', hair: '#3A2A20', hairHi: '#5B4434', blazer: '#2F5E45', blazerDark: '#244A36', tee: '#F6F4EE',
  pants: '#CDB38C', pantsDark: '#B79C75', shoe: '#F7F7F5', sole: '#1E1E1E', ink: '#231915', lip: '#7A3328'};

const HandShape: React.FC<{hand: Hand; mirror: boolean}> = ({hand, mirror}) => (
  <g transform={mirror ? 'scale(-1 1)' : undefined}>
    {hand === 'relaxed' && <><ellipse cx={0} cy={26} rx={21} ry={27} fill={C.skin} /><ellipse cx={-15} cy={16} rx={8} ry={14} fill={C.skin} transform="rotate(25 -15 16)" /></>}
    {hand === 'fist' && <><circle cx={0} cy={24} r={24} fill={C.skin} /><path d="M-14 20 h28 M-14 30 h28" stroke={C.skinDark} strokeWidth={3} strokeLinecap="round" /></>}
    {hand === 'clicker' && <><circle cx={0} cy={24} r={24} fill={C.skin} /><rect x={-8} y={24} width={16} height={42} rx={7} fill="#1C1C1C" /><circle cx={0} cy={58} r={3} fill="#FF5500" /></>}
    {hand === 'point' && <><circle cx={0} cy={22} r={22} fill={C.skin} /><rect x={-6} y={22} width={14} height={50} rx={7} fill={C.skin} /></>}
    {hand === 'flat' && <><ellipse cx={0} cy={30} rx={20} ry={36} fill={C.skin} /><ellipse cx={-14} cy={14} rx={7} ry={13} fill={C.skin} transform="rotate(30 -14 14)" /></>}
    {(hand === 'open' || hand === 'wave') && <g>
      <ellipse cx={0} cy={24} rx={24} ry={24} fill={C.skin} />
      {[-24, -8, 8, 24].map((a, i) => <rect key={i} x={-6} y={22} width={12} height={i === 0 || i === 3 ? 40 : 46} rx={6} fill={C.skin} transform={`rotate(${a} 0 24)`} />)}
      <rect x={-6} y={10} width={12} height={34} rx={6} fill={C.skin} transform="rotate(70 0 18)" />
    </g>}
  </g>
);

const ArmShape: React.FC<{side: 'R' | 'L'; arm: Arm}> = ({side, arm}) => {
  const sgn = side === 'R' ? 1 : -1; // R = character's right = screen left
  const x = side === 'R' ? 112 : 288;
  return (
    <g transform={`translate(${x} 352) rotate(${sgn * arm.s})`}>
      <path d="M-27 -8 Q0 -26 27 -8 L23 164 Q0 176 -23 164 Z" fill={C.blazer} stroke={C.blazerDark} strokeWidth={4} />
      <g transform={`translate(0 158) rotate(${sgn * arm.e})`}>
        <path d="M-23 0 L-19 140 Q0 150 19 140 L23 0 Z" fill={C.blazer} stroke={C.blazerDark} strokeWidth={4} />
        <circle cx={0} cy={0} r={21} fill={C.blazer} />
        <path d="M-19 128 L-19 142 Q0 152 19 142 L19 128 Z" fill={C.blazerDark} />
        <g transform={`translate(0 142) rotate(${sgn * arm.h})`}><HandShape hand={arm.hand} mirror={side === 'L'} /></g>
      </g>
    </g>
  );
};

const browAng: Record<Brows, [number, number, number]> = {calm: [0, 0, 0], worried: [-14, 14, -6], sad: [-10, 10, 2], up: [-4, 4, -14], think: [-12, 4, -4], determined: [12, -12, 4]};

export const ArtiRig: React.FC<{t: number; pose: RigPose; x: number; y: number; height: number; flip?: boolean; shadow?: boolean}> = ({t, pose: P, x, y, height, flip, shadow = true}) => {
  const s = height / 1000;
  const breath = Math.sin((t * 2 * Math.PI) / 3.4);
  const sway = Math.sin(t * 1.15) * 0.7;
  const blinkPhase = (t + 0.37 * Math.floor(t / 3.7)) % 3.7;
  const blink = blinkPhase < 0.12 ? Math.abs(blinkPhase - 0.06) / 0.06 : 1;
  const eyeOpen = Math.min(blink, P.eyeOpen);
  const talkAmt = P.talk > 0.05 ? P.talk * (0.5 + 0.5 * Math.sin(t * 19)) * (0.6 + 0.4 * Math.sin(t * 6.1)) : 0;
  const drop = P.crouch * 34;
  const tx = P.turn * 16;
  const [bl, br, bdy] = browAng[P.brows];
  const legLen = 380 - drop;
  const mouthPath = (() => {
    switch (P.mouth) {
      case 'smile': return <path d="M-26 52 Q0 76 26 52" fill="none" stroke={C.lip} strokeWidth={7} strokeLinecap="round" />;
      case 'open': return <path d="M-26 50 Q0 92 26 50 Z" fill={C.lip} />;
      case 'calm': return <path d="M-18 58 Q0 66 18 58" fill="none" stroke={C.lip} strokeWidth={6} strokeLinecap="round" />;
      case 'nervous': return <path d="M-24 60 q8 -8 16 0 t16 0 t16 0" fill="none" stroke={C.lip} strokeWidth={6} strokeLinecap="round" />;
      case 'pressed': return <path d="M-16 60 L16 60" stroke={C.lip} strokeWidth={7} strokeLinecap="round" />;
      case 'o': return <ellipse cx={0} cy={60} rx={9} ry={12} fill={C.lip} />;
      case 'sad': return <path d="M-20 66 Q0 52 20 66" fill="none" stroke={C.lip} strokeWidth={6} strokeLinecap="round" />;
      case 'side': return <path d="M-14 62 L18 56" stroke={C.lip} strokeWidth={6} strokeLinecap="round" />;
      default: return <ellipse cx={0} cy={60} rx={16} ry={4 + 14 * talkAmt} fill={C.lip} />;
    }
  })();
  return (
    <div style={{position: 'absolute', left: x - 200 * s, top: y, width: 400 * s, height, transform: flip ? 'scaleX(-1)' : undefined}}>
      <svg width={400 * s} height={height} viewBox="0 0 400 1000" style={{overflow: 'visible'}}>
        {shadow && <ellipse cx={200 + P.shiftX * 0.5} cy={984} rx={130} ry={16} fill="#00000022" />}
        {/* legs */}
        <g transform={`translate(${P.shiftX * 0.4} 0)`}>
          <path d={`M128 ${600 + drop} L190 ${600 + drop} L186 ${600 + drop + legLen} L132 ${600 + drop + legLen} Z`} fill={C.pants} />
          <path d={`M210 ${600 + drop} L272 ${600 + drop} L268 ${600 + drop + legLen} L214 ${600 + drop + legLen} Z`} fill={C.pants} />
          <path d={`M196 ${600 + drop} L204 ${600 + drop} L204 ${700 + drop} Z`} fill={C.pantsDark} />
          <rect x={112} y={942} width={82} height={36} rx={16} fill={C.shoe} /><rect x={112} y={970} width={82} height={12} rx={6} fill={C.sole} />
          <rect x={206} y={942} width={82} height={36} rx={16} fill={C.shoe} /><rect x={206} y={970} width={82} height={12} rx={6} fill={C.sole} />
        </g>
        {/* upper body, pivoting at the hips */}
        <g transform={`translate(${P.shiftX} ${drop}) rotate(${P.lean + sway} 200 600)`}>
          <g transform={`translate(0 ${-breath * 3}) scale(1 ${1 + breath * 0.008})`} style={{transformOrigin: '200px 600px'}}>
            <rect x={178} y={262} width={44} height={70} rx={14} fill={C.skin} />
            <path d="M178 300 Q200 318 222 300 L222 312 Q200 330 178 312 Z" fill={C.skinDark} />
            <path d="M104 334 Q200 304 296 334 L306 612 Q200 634 94 612 Z" fill={C.blazer} />
            <path d="M166 318 L200 330 L234 318 L240 616 L160 616 Z" fill={C.tee} />
            <path d="M160 322 L200 452 L184 466 L132 344 Z" fill={C.blazerDark} />
            <path d="M240 322 L200 452 L216 466 L268 344 Z" fill={C.blazerDark} />
            <rect x={246} y={404} width={40} height={8} rx={4} fill={C.blazerDark} />
            <circle cx={238} cy={520} r={6} fill={C.blazerDark} />
          </g>
          {/* head (lags the body slightly; hair follows through) */}
          <g transform={`translate(200 ${178 - breath * 2}) rotate(${P.tilt + P.nod}) scale(1.1)`}>
            <ellipse cx={-90 + tx * 0.3} cy={12} rx={14} ry={20} fill={C.skin} />
            <ellipse cx={90 + tx * 0.3} cy={12} rx={14 * (1 - Math.max(0, P.turn) * 0.4)} ry={20} fill={C.skin} />
            <path d="M-86 -10 Q-88 76 -40 104 Q0 124 40 104 Q88 76 86 -10 Q80 -96 0 -98 Q-80 -96 -86 -10 Z" fill={C.skin} />
            <g transform={`translate(${tx * 0.25} 0)`}>
              <path d="M-100 6 C-112 -64 -66 -128 -6 -126 C52 -136 116 -100 104 -12 C98 -36 84 -52 64 -58 C70 -34 48 -28 36 -46 C24 -20 -8 -26 -18 -48 C-34 -26 -64 -26 -74 -40 C-86 -26 -92 -12 -100 6 Z" fill={C.hair} />
              <path d="M-40 -104 Q20 -128 70 -96" fill="none" stroke={C.hairHi} strokeWidth={10} strokeLinecap="round" />
              <path d="M52 -50 Q86 -40 92 -2" fill="none" stroke={C.hair} strokeWidth={20} strokeLinecap="round" />
            </g>
            <g transform={`translate(${tx} ${bdy})`}>
              <rect x={-58} y={-34} width={44} height={9} rx={4.5} fill={C.ink} transform={`rotate(${bl} -36 -30)`} />
              <rect x={14} y={-34} width={44} height={9} rx={4.5} fill={C.ink} transform={`rotate(${br} 36 -30)`} />
            </g>
            <g transform={`translate(${tx + P.lookX * 6} ${P.lookY * 5})`}>
              <ellipse cx={-36} cy={6} rx={9} ry={12 * eyeOpen} fill={C.ink} />
              <ellipse cx={36} cy={6} rx={9} ry={12 * eyeOpen} fill={C.ink} />
              {eyeOpen > 0.5 && <><circle cx={-33} cy={1} r={3} fill="white" /><circle cx={39} cy={1} r={3} fill="white" /></>}
            </g>
            <path d={`M${6 + tx * 1.2} 14 Q${-2 + tx * 1.2} 36 ${10 + tx * 1.2} 38`} fill="none" stroke={C.skinDark} strokeWidth={5} strokeLinecap="round" />
            <g transform={`translate(${tx} 0)`}>{mouthPath}</g>
            {(P.mouth === 'smile' || P.mouth === 'open') && <><ellipse cx={-56 + tx} cy={42} rx={14} ry={7} fill="#EE8D72" opacity={0.45} /><ellipse cx={56 + tx} cy={42} rx={14} ry={7} fill="#EE8D72" opacity={0.45} /></>}
          </g>
          <ArmShape side="R" arm={P.armR} />
          <ArmShape side="L" arm={P.armL} />
        </g>
      </svg>
    </div>
  );
};
