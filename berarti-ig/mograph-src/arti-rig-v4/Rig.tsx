import React from 'react';

// Rigged flat-vector Arti for BERARTI "Bold Editorial Stage".
// Every joint is a number, so poses blend smoothly: anticipation, overshoot, follow-through, breathing, blinking, lip movement.
export type Hand = 'relaxed' | 'open' | 'point' | 'fist' | 'flat' | 'clicker' | 'wave';
export type Brows = 'calm' | 'worried' | 'sad' | 'up' | 'think' | 'determined';
export type Mouth = 'smile' | 'calm' | 'nervous' | 'pressed' | 'o' | 'sad' | 'open' | 'talk' | 'side';
export type Arm = {s: number; e: number; h: number; hand: Hand};
export type RigPose = {
  lean: number; crouch: number; shiftX: number; tilt: number; nod: number; turn: number;
  liftR: number; liftL: number; legAR: number; legAL: number;
  armR: Arm; armL: Arm; brows: Brows; mouth: Mouth; lookX: number; lookY: number; eyeOpen: number; talk: number;
};
export const BASE: RigPose = {
  lean: 0, crouch: 0, shiftX: 0, tilt: 0, nod: 0, turn: 0, liftR: 0, liftL: 0, legAR: 0, legAL: 0,
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
      for (const f of ['lean', 'crouch', 'shiftX', 'tilt', 'nod', 'turn', 'liftR', 'liftL', 'legAR', 'legAL', 'lookX', 'lookY', 'eyeOpen', 'talk'] as const) blended[f] = L(prev[f], target[f], e);
      blended.armR = lerpArm(prev.armR, target.armR, e); blended.armL = lerpArm(prev.armL, target.armL, e);
      blended.brows = e < 0.5 ? prev.brows : target.brows; blended.mouth = e < 0.5 ? prev.mouth : target.mouth;
      if (p < 1) { if (i === keys.length - 1 || t < keys[i + 1].t) return blended; }
      prev = blended;
    }
    return prev;
  };
};

export const C = {skin: '#F1B387', skinShade: '#DE9A6E', hair: '#2C241E', hairHi: '#6A625B', blazer: '#2F6845', blazerShade: '#245637', tee: '#F7F5F0',
  pants: '#D3B78F', pantsShade: '#BEA078', shoe: '#F7F7F5', sole: '#1E1E1E', ink: '#231915', lip: '#7A3328'};
export type Look = typeof C & {hair: 'arti' | 'curly' | 'hijab'; pocket: boolean; hijab?: string; hijabShade?: string};
export const ARTI: Look = {...C, hair: 'arti', pocket: true};
const ARM_SHADOW = 'drop-shadow(3px 5px 0 rgba(18,45,30,0.22))';

const HandShape: React.FC<{hand: Hand; mirror: boolean; c: Look}> = ({hand, mirror, c}) => (
  <g transform={`${mirror ? 'scale(-1 1) ' : ''}scale(0.86)`}>
    {hand === 'relaxed' && <><ellipse cx={0} cy={26} rx={20} ry={27} fill={c.skin} /><ellipse cx={-15} cy={14} rx={8} ry={14} fill={c.skin} transform="rotate(25 -15 14)" /><path d="M8 20 Q12 34 6 46" fill="none" stroke={c.skinShade} strokeWidth={3} strokeLinecap="round" /></>}
    {hand === 'fist' && <><circle cx={0} cy={24} r={23} fill={c.skin} /><path d="M-12 18 h24 M-12 28 h24" stroke={c.skinShade} strokeWidth={3} strokeLinecap="round" /></>}
    {hand === 'clicker' && <><rect x={-8} y={20} width={17} height={50} rx={8} fill="#1C1C1C" /><circle cx={0} cy={24} r={23} fill={c.skin} /><ellipse cx={-17} cy={14} rx={7} ry={12} fill={c.skin} transform="rotate(20 -17 14)" /></>}
    {hand === 'point' && <><circle cx={0} cy={22} r={21} fill={c.skin} /><rect x={-6} y={22} width={13} height={48} rx={6.5} fill={c.skin} /></>}
    {hand === 'flat' && <><ellipse cx={0} cy={30} rx={19} ry={34} fill={c.skin} /><ellipse cx={-14} cy={14} rx={7} ry={13} fill={c.skin} transform="rotate(30 -14 14)" /></>}
    {(hand === 'open' || hand === 'wave') && <g>
      {[-22, -7, 8, 23].map((a, i) => <rect key={i} x={-5.5} y={22} width={11} height={i === 0 || i === 3 ? 38 : 44} rx={5.5} fill={c.skin} transform={`rotate(${a} 0 24)`} />)}
      <ellipse cx={0} cy={24} rx={22} ry={22} fill={c.skin} />
      <rect x={-5.5} y={10} width={11} height={32} rx={5.5} fill={c.skin} transform="rotate(70 0 18)" />
    </g>}
  </g>
);

const SHOULDER = {R: [132, 314], L: [268, 314]} as const;
const ArmShape: React.FC<{side: 'R' | 'L'; arm: Arm; lag: number; c: Look}> = ({side, arm, lag, c}) => {
  const sgn = side === 'R' ? 1 : -1; // R = character's right = screen left
  const [x, y] = SHOULDER[side];
  return (
    <g transform={`translate(${x} ${y}) rotate(${sgn * arm.s})`} style={{filter: ARM_SHADOW}}>
      <path d="M-24 -12 Q0 -30 24 -12 L21 150 Q0 160 -21 150 Z" fill={c.blazer} />
      <g transform={`translate(0 146) rotate(${sgn * arm.e})`}>
        <circle cx={0} cy={0} r={21} fill={c.blazer} />
        <path d="M-21 0 L-18 128 Q0 134 18 128 L21 0 Z" fill={c.blazer} />
        <path d="M-18 118 L-18 130 Q0 136 18 130 L18 118 Z" fill={c.blazerShade} />
        <g transform={`translate(0 130) rotate(${sgn * (arm.h + lag)})`}><HandShape hand={arm.hand} mirror={side === 'L'} c={c} /></g>
      </g>
    </g>
  );
};

const browAng: Record<Brows, [number, number, number]> = {calm: [0, 0, 0], worried: [-14, 14, -6], sad: [-10, 10, 2], up: [-4, 4, -14], think: [-12, 4, -4], determined: [12, -12, 4]};

/** Torso panel of an open blazer for the screen-left side; the right side is its mirror. */
const Panel: React.FC<{mirror?: boolean; pocket?: boolean; c: Look}> = ({mirror, pocket, c}) => (
  <g transform={mirror ? 'translate(400 0) scale(-1 1)' : undefined}>
    <path d="M120 312 Q124 294 146 290 L170 288 L166 470 L164 606 Q140 612 116 602 L114 340 Z" fill={c.blazer} />
    <path d="M170 288 L154 298 L146 328 L156 336 L150 350 L166 450 Z" fill={c.blazerShade} />
    {pocket && <rect x={126} y={394} width={28} height={20} rx={3} fill={c.blazerShade} />}
  </g>
);

export const ArtiRig: React.FC<{t: number; pose: RigPose; lagPose?: RigPose; x: number; y: number; height: number; flip?: boolean; shadow?: boolean; look?: Look; phase?: number; mouthOpen?: number; filter?: string}> = ({t: t0, pose: P, lagPose, x, y, height, flip, shadow = true, look = ARTI, phase = 0, mouthOpen, filter}) => {
  const c = look; const t = t0 + phase;
  const s = height / 1000;
  const breath = Math.sin((t * 2 * Math.PI) / 3.4);
  const sway = Math.sin(t * 1.15) * 0.6;
  const blinkPhase = (t + 0.37 * Math.floor(t / 3.7)) % 3.7;
  const blink = blinkPhase < 0.12 ? Math.abs(blinkPhase - 0.06) / 0.06 : 1;
  const eyeOpen = Math.min(blink, P.eyeOpen);
  const talkAmt = mouthOpen !== undefined && mouthOpen > 0.03 ? mouthOpen : P.talk > 0.05 ? P.talk * (0.5 + 0.5 * Math.sin(t * 19)) * (0.6 + 0.4 * Math.sin(t * 6.1)) : 0;
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
    switch (mouthOpen !== undefined && mouthOpen > 0.03 ? 'talk' : P.mouth) {
      case 'smile': return <path d="M-22 54 Q0 72 22 54" fill="none" stroke={c.lip} strokeWidth={6} strokeLinecap="round" />;
      case 'open': return <path d="M-24 50 Q0 90 24 50 Z" fill={c.lip} />;
      case 'calm': return <path d="M-16 58 Q0 64 16 58" fill="none" stroke={c.lip} strokeWidth={6} strokeLinecap="round" />;
      case 'nervous': return <path d="M-22 60 q7 -7 14 0 t14 0 t14 0" fill="none" stroke={c.lip} strokeWidth={5.5} strokeLinecap="round" />;
      case 'pressed': return <path d="M-14 60 L14 60" stroke={c.lip} strokeWidth={6} strokeLinecap="round" />;
      case 'o': return <ellipse cx={0} cy={60} rx={9} ry={12} fill={c.lip} />;
      case 'sad': return <path d="M-18 66 Q0 54 18 66" fill="none" stroke={c.lip} strokeWidth={6} strokeLinecap="round" />;
      case 'side': return <path d="M-12 62 L16 57" stroke={c.lip} strokeWidth={6} strokeLinecap="round" />;
      default: return <ellipse cx={0} cy={60} rx={15} ry={4 + 13 * talkAmt} fill={c.lip} />;
    }
  })();
  return (
    <div style={{position: 'absolute', left: x - 200 * s, top: y, width: 400 * s, height, transform: flip ? 'scaleX(-1)' : undefined, filter}}>
      <svg width={400 * s} height={height} viewBox="0 0 400 1000" style={{overflow: 'visible'}}>
        {shadow && <ellipse cx={200 + P.shiftX} cy={982} rx={120 - (P.liftR + P.liftL) * 0.5} ry={15} fill="#00000020" />}
        {/* whole figure moves together; legs swing from the hips */}
        <g transform={`translate(${P.shiftX} 0)`}>
        <g>
          {([['R', 164, 124, P.liftR, P.legAR], ['L', 236, 204, P.liftL, P.legAL]] as const).map(([k, hx, sx, lift, ang]) => {
            const top = 690 + drop, ank = 956 - lift, from = 572 + drop;
            const inner = k === 'R' ? [199, 190] : [201, 210];
            const outer = k === 'R' ? [128, 140] : [272, 260];
            return (
              <g key={k} transform={`rotate(${k === 'R' ? ang : -ang} ${hx} ${top})`}>
                <path d={`M${outer[0] - 1} ${from} L${inner[0] + (k === 'R' ? 4 : -4)} ${from} L${inner[0]} ${top} L${inner[1]} ${ank} L${outer[1]} ${ank} L${outer[0]} ${top} Z`} fill={c.pants} />
                {k === 'L' && <path d={`M201 ${top + 10} Q216 ${top + 30} 218 ${ank} L210 ${ank} Z`} fill={c.pantsShade} opacity={0.8} />}
                {lift > 2 && <path d={`M${(outer[0] + inner[0]) / 2 - 30} ${(top + ank) / 2 + 10} q30 8 60 0`} fill="none" stroke={c.pantsShade} strokeWidth={4} strokeLinecap="round" opacity={Math.min(1, lift / 20)} />}
                <g transform={`translate(0 ${-lift}) rotate(${(k === 'R' ? -1 : 1) * lift * 0.25} ${sx + 38} 960)`}>
                  <path d={`M${sx + 6} 950 Q${sx + 4} 938 ${sx + 20} 936 L${sx + 56} 936 Q${sx + 74} 940 ${sx + 74} 962 L${sx + 74} 970 L${sx + 2} 970 Z`} fill={c.shoe} />
                  <path d={`M${sx + 22} 946 L${sx + 46} 946`} stroke="#D9D9D6" strokeWidth={3} strokeLinecap="round" />
                  <rect x={sx} y={968} width={76} height={12} rx={6} fill={c.sole} />
                </g>
              </g>
            );
          })}
          <path d={`M170 ${572 + drop} L230 ${572 + drop} L224 ${700 + drop} Q200 ${716 + drop} 176 ${700 + drop} Z`} fill={c.pants} />
        </g>
        {/* upper body, pivoting at the hips */}
        <g transform={`translate(0 ${drop}) rotate(${P.lean + sway + (P.liftL - P.liftR) * 0.06} 200 600)`}>
          <g transform={`translate(0 ${-breath * 3}) scale(1 ${1 + breath * 0.008})`} style={{transformOrigin: '200px 600px'}}>
            <rect x={182} y={232} width={36} height={70} rx={12} fill={c.skin} />
            <path d="M182 262 Q200 278 218 262 L218 276 Q200 292 182 276 Z" fill={c.skinShade} />
            <path d="M150 294 Q200 284 250 294 L254 604 L146 604 Z" fill={c.tee} />
            <path d="M176 292 Q200 306 224 292" fill="none" stroke="#E4E0D8" strokeWidth={4} strokeLinecap="round" />
            <rect x={146} y={594} width={108} height={12} fill={c.pantsShade} />
            <Panel pocket={c.pocket} c={c} />
            <Panel mirror c={c} />
          </g>
          {/* head */}
          <g transform={`translate(200 ${152 - breath * 2}) rotate(${P.tilt + P.nod}) scale(0.92)`}>
            {c.hair === 'hijab' && <g transform={`rotate(${hairLag * 0.5} 0 -40)`}>
              <path d="M-112 0 C-118 -110 -62 -158 0 -158 C62 -158 118 -110 112 0 C110 70 96 120 150 170 L172 250 Q0 300 -172 250 L-150 170 C-96 120 -110 70 -112 0 Z" fill={c.hijab} />
              <path d="M-150 170 C-120 190 -60 200 0 204 C60 200 120 190 150 170 L172 250 Q0 300 -172 250 Z" fill={c.hijabShade} />
            </g>}
            {c.hair !== 'hijab' && <>
            <ellipse cx={-88 + tx * 0.3} cy={14} rx={14} ry={20} fill={c.skin} />
            <ellipse cx={88 + tx * 0.3} cy={14} rx={14 * (1 - Math.max(0, P.turn) * 0.4)} ry={20} fill={c.skin} />
            <ellipse cx={-88 + tx * 0.3} cy={14} rx={6} ry={10} fill={c.skinShade} />
            <ellipse cx={88 + tx * 0.3} cy={14} rx={6} ry={10} fill={c.skinShade} />
            </>}
            <path d="M-84 -10 Q-86 70 -42 104 Q0 128 42 104 Q86 70 84 -10 Q78 -96 0 -98 Q-78 -96 -84 -10 Z" fill={c.skin} />
            {c.hair === 'arti' && <g transform={`translate(${tx * 0.25} 0) rotate(${hairLag} 0 -60)`}>
              <path d="M-86 26 C-100 2 -112 -30 -104 -58 C-118 -92 -90 -124 -62 -126 C-50 -152 -8 -156 8 -142 C32 -160 78 -150 88 -120 C114 -110 120 -70 106 -46 C116 -20 106 6 90 26 L82 -4 C80 -24 78 -36 72 -48 C70 -34 60 -26 48 -44 C56 -54 58 -62 50 -66 C18 -74 -30 -72 -64 -52 C-74 -40 -76 -18 -74 6 Z" fill={c.hair === 'arti' ? C.hair : C.hair} />
              <path d="M-14 -122 Q48 -140 74 -100 Q86 -80 72 -66" fill="none" stroke={C.hairHi} strokeWidth={9} strokeLinecap="round" />
            </g>}
            {c.hair === 'curly' && <g transform={`translate(${tx * 0.25} 0) rotate(${hairLag * 0.6} 0 -60)`} fill="#1F1915">
              <path d="M-88 20 L-90 -40 L-76 -60 L-74 4 Z M88 20 L90 -40 L76 -60 L74 4 Z" />
              {[[-82, -52, 30], [-70, -92, 34], [-36, -118, 36], [6, -128, 38], [46, -118, 36], [78, -90, 34], [88, -52, 30], [-40, -76, 30], [0, -86, 32], [40, -76, 30]].map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} />)}
              {[[-50, -110], [10, -120], [60, -100]].map(([cx, cy], i) => <path key={i} d={`M${cx - 12} ${cy} q12 -12 24 0`} fill="none" stroke="#4A3D34" strokeWidth={5} strokeLinecap="round" />)}
            </g>}
            {c.hair === 'hijab' && <path d={`M-92 10 C-96 -80 -50 -112 ${tx * 0.4} -112 C50 -112 96 -80 92 10 C90 -40 60 -78 ${tx * 0.4} -80 C-60 -78 -90 -40 -92 10 Z`} fill={c.hijab} />}
            <g transform={`translate(${tx} ${bdy})`}>
              <rect x={-56} y={-32} width={40} height={8} rx={4} fill={c.ink} transform={`rotate(${bl} -36 -28)`} />
              <rect x={16} y={-32} width={40} height={8} rx={4} fill={c.ink} transform={`rotate(${br} 36 -28)`} />
            </g>
            <g transform={`translate(${tx + P.lookX * 6} ${P.lookY * 5})`}>
              <ellipse cx={-34} cy={8} rx={8.5} ry={11 * eyeOpen} fill={c.ink} />
              <ellipse cx={34} cy={8} rx={8.5} ry={11 * eyeOpen} fill={c.ink} />
              {eyeOpen > 0.5 && <><circle cx={-31} cy={4} r={2.6} fill="white" /><circle cx={37} cy={4} r={2.6} fill="white" /></>}
            </g>
            <path d={`M${6 + tx * 1.2} 16 Q${-2 + tx * 1.2} 36 ${10 + tx * 1.2} 38`} fill="none" stroke={c.skinShade} strokeWidth={5} strokeLinecap="round" />
            <g transform={`translate(${tx} 0)`}>{mouthPath}</g>
          </g>
          <ArmShape side="R" arm={P.armR} lag={handLagR} c={c} />
          <ArmShape side="L" arm={P.armL} lag={handLagL} c={c} />
        </g>
        </g>
      </svg>
    </div>
  );
};
