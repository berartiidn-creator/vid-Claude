import React from 'react';

// Flat-vector characters for BERARTI (no outline, one soft shadow layer, ellipse under the feet).
// Default = "Arti" look from the style guide: wavy dark-brown hair with side quiff, forest-green blazer,
// white tee, cream chinos, white sneakers with black sole, black clicker in the right hand.
export type Pose = 'stand' | 'present' | 'offer' | 'raise' | 'think' | 'hold' | 'down';
export type Mood = 'smile' | 'calm' | 'nervous' | 'sad' | 'think' | 'surprised' | 'talk';
export type Hair = 'wavy' | 'short' | 'hijab' | 'curly' | 'bald';

type Arm = {u: number; f: number}; // degrees from straight down; positive = towards the character's own side
const POSES: Record<Pose, {l: Arm; r: Arm}> = {
  stand: {l: {u: 6, f: 2}, r: {u: 6, f: 2}},
  present: {l: {u: 6, f: 2}, r: {u: 28, f: 95}},
  offer: {l: {u: 6, f: 2}, r: {u: 62, f: 30}},
  raise: {l: {u: 6, f: 2}, r: {u: 165, f: 10}},
  think: {l: {u: -14, f: -75}, r: {u: -12, f: -158}},
  hold: {l: {u: -12, f: -70}, r: {u: -12, f: -70}},
  down: {l: {u: 2, f: 0}, r: {u: 2, f: 0}},
};

export type Look = {
  hair?: Hair; hairColor?: string; skin?: string; top?: string; topDark?: string; inner?: string; pants?: string;
  shoes?: string; sole?: string; hijab?: string; glasses?: boolean; blazer?: boolean; clicker?: boolean;
};
export const RAKA: Look = {
  hair: 'wavy', hairColor: '#3A2A20', skin: '#E3A97F', top: '#2F5E45', topDark: '#244A36', inner: '#F6F4EE',
  pants: '#CDB38C', shoes: '#F7F7F5', sole: '#1E1E1E', blazer: true, clicker: true,
};

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const mixArm = (a: Arm, b: Arm, p: number): Arm => ({u: lerp(a.u, b.u, p), f: lerp(a.f, b.f, p)});

const ArmShape: React.FC<{side: 1 | -1; arm: Arm; sleeve: string; skin: string; clicker?: boolean}> = ({side, arm, sleeve, skin, clicker}) => {
  // side: 1 = character's left (screen right), -1 = character's right (screen left)
  const sx = 150 + side * 64, sy = 250;
  return (
    <g transform={`translate(${sx} ${sy}) rotate(${-side * arm.u})`}>
      <rect x={-17} y={-6} width={34} height={118} rx={17} fill={sleeve} />
      <g transform={`translate(0 104) rotate(${-side * arm.f})`}>
        <rect x={-15} y={-8} width={30} height={108} rx={15} fill={sleeve} />
        <circle cx={0} cy={106} r={17} fill={skin} />
        {clicker && <rect x={-7} y={98} width={14} height={34} rx={5} fill="#1C1C1C" />}
      </g>
    </g>
  );
};

const Face: React.FC<{mood: Mood; t: number; skin: string; glasses?: boolean}> = ({mood, t, glasses}) => {
  const blink = (t % 3.9) < 0.12 ? 0.15 : 1;
  const eyeR = mood === 'surprised' ? 9 : 7;
  const brow = {smile: [0, 0], calm: [0, 0], talk: [0, 0], nervous: [9, -9], sad: [10, -10], think: [-6, 6], surprised: [-12, -12]}[mood];
  const talk = mood === 'talk' ? (Math.sin(t * 18) + 1) / 2 : 0;
  const mouth = {
    smile: 'M132 138 Q150 154 168 138',
    calm: 'M136 140 Q150 148 164 140',
    talk: `M136 138 Q150 ${146 + 8 * talk} 164 138`,
    nervous: 'M136 144 Q143 139 150 144 Q157 149 164 144',
    sad: 'M136 146 Q150 136 164 146',
    think: 'M140 142 L162 140',
    surprised: '',
  }[mood];
  return (
    <g>
      <g transform={`translate(129 112) rotate(${brow[0]})`}><rect x={-11} y={-22} width={22} height={5} rx={2.5} fill="#2A1D15" /></g>
      <g transform={`translate(171 112) rotate(${brow[1]})`}><rect x={-11} y={-22} width={22} height={5} rx={2.5} fill="#2A1D15" /></g>
      <ellipse cx={129} cy={113} rx={eyeR * 0.85} ry={eyeR * blink} fill="#231915" />
      <ellipse cx={171} cy={113} rx={eyeR * 0.85} ry={eyeR * blink} fill="#231915" />
      <circle cx={131} cy={110} r={2.2} fill="white" opacity={blink > 0.5 ? 1 : 0} />
      <circle cx={173} cy={110} r={2.2} fill="white" opacity={blink > 0.5 ? 1 : 0} />
      <path d="M148 118 Q146 128 152 129" fill="none" stroke="#B9774F" strokeWidth={3} strokeLinecap="round" />
      {mood === 'surprised'
        ? <ellipse cx={150} cy={145} rx={8} ry={10} fill="#7A2E22" />
        : <path d={mouth} fill={mood === 'smile' ? '#7A2E22' : 'none'} stroke="#7A2E22" strokeWidth={4} strokeLinecap="round" />}
      {(mood === 'smile' || mood === 'talk') && <><ellipse cx={116} cy={132} rx={9} ry={5} fill="#E88B6E" opacity={0.45} /><ellipse cx={184} cy={132} rx={9} ry={5} fill="#E88B6E" opacity={0.45} /></>}
      {mood === 'nervous' && <path d="M196 92 Q204 104 198 110 Q190 104 196 92 Z" fill="#9BD3F2" />}
      {glasses && <g fill="none" stroke="#2A2A2A" strokeWidth={3}><circle cx={129} cy={113} r={15} /><circle cx={171} cy={113} r={15} /><path d="M144 113 L156 113" /></g>}
    </g>
  );
};

const HairShape: React.FC<{hair: Hair; color: string; hijab?: string; back?: boolean}> = ({hair, color, hijab, back}) => {
  if (hair === 'hijab') {
    return back
      ? <path d="M82 120 Q78 30 150 30 Q222 30 218 120 L234 250 Q150 282 66 250 Z" fill={hijab ?? '#B5835A'} />
      : <path d="M92 118 Q92 52 150 50 Q208 52 208 118 Q200 76 150 74 Q100 76 92 118 Z" fill={hijab ?? '#B5835A'} />;
  }
  if (back) return null;
  if (hair === 'short') return <path d="M94 112 Q90 46 150 44 Q210 46 206 112 Q198 72 150 70 Q102 72 94 112 Z" fill={color} />;
  if (hair === 'curly') return <g fill={color}>{[[104, 74], [126, 56], [150, 50], [174, 56], [196, 74], [96, 98], [204, 98]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={22} />)}</g>;
  if (hair === 'bald') return null;
  // wavy with side quiff (Arti)
  return <path d="M90 118 Q80 70 104 50 Q122 30 154 34 Q192 30 210 56 Q222 76 212 112 Q206 86 190 78 Q196 64 176 62 Q170 76 146 72 Q156 60 136 58 Q120 70 104 84 Q96 96 90 118 Z" fill={color} />;
};

export const Character: React.FC<{
  t: number; x: number; y: number; height?: number; look?: Look; pose?: Pose; fromPose?: Pose; poseAt?: number; poseDur?: number;
  mood?: Mood; seated?: boolean; nod?: number; tilt?: number; flip?: boolean; shadow?: boolean; opacity?: number;
}> = ({t, x, y, height = 640, look = RAKA, pose = 'stand', fromPose, poseAt = 0, poseDur = 0.4, mood = 'smile', seated = false,
  nod = 0, tilt = 0, flip = false, shadow = true, opacity = 1}) => {
  const L = {...RAKA, ...look};
  const k = Math.max(0, Math.min(1, (t - poseAt) / poseDur));
  const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  const A = POSES[fromPose ?? pose], B = POSES[pose];
  const la = mixArm(A.l, B.l, e), ra = mixArm(A.r, B.r, e);
  const s = height / 760;
  const legH = seated ? 120 : 250;
  return (
    <div style={{position: 'absolute', left: x - 150 * s, top: y, width: 300 * s, height, opacity,
      transform: `scaleX(${flip ? -1 : 1})`}}>
      <svg width={300 * s} height={height} viewBox="0 0 300 760" style={{overflow: 'visible'}}>
        {shadow && <ellipse cx={150} cy={seated ? 640 : 744} rx={96} ry={13} fill="#0000001f" />}
        {/* legs */}
        {seated ? (
          <g>
            <rect x={104} y={448} width={44} height={70} rx={20} fill={L.pants} />
            <rect x={152} y={448} width={44} height={70} rx={20} fill={L.pants} />
            <rect x={106} y={500} width={40} height={legH} rx={18} fill={L.pants} />
            <rect x={154} y={500} width={40} height={legH} rx={18} fill={L.pants} />
            <rect x={96} y={600} width={58} height={26} rx={12} fill={L.shoes} /><rect x={96} y={618} width={58} height={10} rx={5} fill={L.sole} />
            <rect x={146} y={600} width={58} height={26} rx={12} fill={L.shoes} /><rect x={146} y={618} width={58} height={10} rx={5} fill={L.sole} />
          </g>
        ) : (
          <g>
            <rect x={108} y={448} width={40} height={legH + 30} rx={18} fill={L.pants} />
            <rect x={152} y={448} width={40} height={legH + 30} rx={18} fill={L.pants} />
            <rect x={96} y={706} width={58} height={28} rx={13} fill={L.shoes} /><rect x={96} y={726} width={58} height={11} rx={5} fill={L.sole} />
            <rect x={146} y={706} width={58} height={28} rx={13} fill={L.shoes} /><rect x={146} y={726} width={58} height={11} rx={5} fill={L.sole} />
          </g>
        )}
        <g transform="translate(0 38)"><HairShape hair={L.hair!} color={L.hairColor!} hijab={L.hijab} back /></g>
        {/* torso */}
        <path d="M88 232 Q150 210 212 232 L222 452 Q150 470 78 452 Z" fill={L.top} />
        {L.blazer ? (
          <g>
            <path d="M124 228 L150 330 L176 228 Q150 220 124 228 Z" fill={L.inner} />
            <path d="M118 230 L150 340 L138 352 L104 246 Z" fill={L.topDark} />
            <path d="M182 230 L150 340 L162 352 L196 246 Z" fill={L.topDark} />
            <rect x={170} y={300} width={30} height={6} rx={3} fill={L.topDark} />
            <circle cx={150} cy={392} r={5} fill={L.topDark} />
          </g>
        ) : <path d="M126 228 Q150 252 174 228" fill="none" stroke={L.topDark} strokeWidth={6} />}
        {/* arms */}
        <ArmShape side={-1} arm={ra} sleeve={L.top!} skin={L.skin!} clicker={L.clicker} />
        <ArmShape side={1} arm={la} sleeve={L.top!} skin={L.skin!} />
        {/* head */}
        <g transform={`translate(0 38) rotate(${tilt + nod} 150 190) translate(150 200) scale(1.13) translate(-150 -200)`}>
          {L.hair !== 'hijab' && <rect x={136} y={160} width={28} height={40} rx={10} fill={L.skin} />}
          {L.hair !== 'hijab' && <><ellipse cx={92} cy={118} rx={11} ry={15} fill={L.skin} /><ellipse cx={208} cy={118} rx={11} ry={15} fill={L.skin} /></>}
          <ellipse cx={150} cy={112} rx={58} ry={64} fill={L.skin} />
          <HairShape hair={L.hair!} color={L.hairColor!} hijab={L.hijab} />
          <Face mood={mood} t={t} skin={L.skin!} glasses={L.glasses} />
        </g>
      </svg>
    </div>
  );
};
