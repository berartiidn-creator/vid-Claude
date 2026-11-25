import React from 'react';
import {Img, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import rig from './rig3.json';
import env from './env.json';
import {words} from './lib/words';

export type PoseName = 'tunjuk_atas' | 'lambai' | 'semangat' | 'bertanya' | 'tunjuk_kamu' | 'tawarkan' | 'menyapa' | 'sambutan' | 'tulus' | 'tepuk' | 'tanda_x' | 'hitung_tiga';
export type Expr = 'netral' | 'ramah' | 'serius' | 'ceria' | 'terkejut';
export type Pose = {
  t: number; ease?: number;
  pose?: PoseName;                  // replacement pose (gesture)
  expr?: Expr;                      // eye and brow drawing from the expression set
  brow?: number; browTilt?: number; browAsym?: number;
  lid?: number;                     // 0 open .. 1 closed
  mouth?: 'smile' | 'flat' | 'grin';
  head?: number;                    // head tilt in degrees
  lean?: number;                    // whole-body lean
  nod?: boolean; wink?: boolean;
  beat?: boolean;                   // emphasis: small dip and spring back of the whole figure
};

const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const track = (keys: Pose[], t: number, f: keyof Pose, def: number) => {
  let prev = def, cur = def, start = -1, dur = 0.3;
  for (const k of keys) {
    if (k.t > t) break;
    const v = k[f];
    if (typeof v === 'number') {
      const p0 = start < 0 ? 1 : Math.min(1, (k.t - start) / dur);
      prev = prev + (cur - prev) * easeInOut(p0); cur = v; start = k.t; dur = k.ease ?? 0.3;
    }
  }
  if (start < 0) return def;
  return prev + (cur - prev) * easeInOut(Math.min(1, (t - start) / dur));
};
const last = <K extends keyof Pose>(keys: Pose[], t: number, f: K, def: Pose[K]): Pose[K] => {
  let v = def; for (const k of keys) { if (k.t > t) break; if (k[f] !== undefined) v = k[f]; } return v;
};
const accent = (keys: Pose[], t: number, f: 'nod' | 'wink' | 'beat', len: number) => {
  let out = -1; for (const k of keys) if (k[f] && t >= k.t && t < k.t + len) out = (t - k.t) / len; return out;
};

// ---------- lip-sync: letters -> mouth drawings, spread over each word's spoken time ----------
type Vis = 'rest' | 'M' | 'A' | 'E' | 'O' | 'U' | 'F' | 'G';
const VMAP: Record<string, Vis | null> = {a: 'A', i: 'E', e: 'E', o: 'O', u: 'O', w: 'O', m: 'M', b: 'M', p: 'M', f: 'F', v: 'F',
  s: 'E', t: 'E', d: 'E', n: 'E', l: 'E', r: 'E', c: 'E', j: 'E', z: 'E', y: 'E', k: null, g: null, h: null, q: null, x: null};
const VIS_TRACK: {t: number; v: Vis}[] = (() => {
  const out: {t: number; v: Vis}[] = [];
  for (const w of words) {
    const letters = w.word.toLowerCase().replace(/[^a-z]/g, '').split('');
    if (!letters.length) continue;
    const weight = letters.map((c) => ('aiueo'.includes(c) ? 1.5 : 0.8));
    const total = weight.reduce((a, b) => a + b, 0); const dur = Math.max(0.08, w.end - w.start);
    let tt = w.start, prev: Vis = 'E';
    letters.forEach((c, i) => { const v = VMAP[c] ?? prev; out.push({t: tt, v}); prev = v; tt += dur * weight[i] / total; });
    out.push({t: w.end + 0.02, v: 'rest'});
  }
  return out;
})();
const visemeAt = (t: number): Vis => { let v: Vis = 'rest'; for (const k of VIS_TRACK) { if (k.t > t) break; v = k.v; } return v; };

const BLINKS = [2.0, 5.6, 9.1, 12.9, 16.3, 20.6, 24.7, 29.3, 33.0];
const SWAP = 0.07;   // seconds of smear after a pose cut

export const Character: React.FC<{keys: Pose[]; x: number; y: number; scale: number; forceVis?: string; still?: boolean}> = ({keys, x, y, scale, forceVis, still}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const r = rig as any;
  const W = r.W, H = r.H, OX = r.OX;
  const src = (n: string) => staticFile(`rig3/${n}.png`);
  const box = (b: any, extra: React.CSSProperties = {}): React.CSSProperties => ({position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, ...extra});

  // ---------- pose timeline ----------
  const poseKeys = keys.filter((k) => k.pose);
  let curIdx = -1; poseKeys.forEach((k, i) => { if (k.t <= t) curIdx = i; });
  const cur = poseKeys[Math.max(0, curIdx)];
  const prevPose = curIdx > 0 ? poseKeys[curIdx - 1].pose! : cur.pose!;
  const since = curIdx >= 0 ? t - cur.t : 99;
  const mix = 1; // hard cut, covered by pop, blink and a 2-frame smear
  const smear = curIdx > 0 && since < SWAP ? 1 - since / SWAP : 0;
  const pop = curIdx > 0 ? spring({frame: frame - Math.round(cur.t * fps), fps, config: {damping: 9, stiffness: 240, mass: 0.6}}) : 1;

  // ---------- expression tracks ----------
  const brow = track(keys, t, 'brow', 0), browTilt = track(keys, t, 'browTilt', 0), browAsym = track(keys, t, 'browAsym', 0);
  const baseLid = track(keys, t, 'lid', 0), headTilt = track(keys, t, 'head', 0), lean = track(keys, t, 'lean', 0);
  const mouthRest = last(keys, t, 'mouth', 'smile');
  const exprKeys = keys.filter((k) => k.expr);
  let eIdx = -1; exprKeys.forEach((k, i) => { if (k.t <= t) eIdx = i; });
  const expr: Expr = eIdx >= 0 ? exprKeys[eIdx].expr! : 'netral';
  const prevExpr: Expr = eIdx > 0 ? exprKeys[eIdx - 1].expr! : expr;
  const eSince = eIdx >= 0 ? t - exprKeys[eIdx].t : 99;
  const eMix = eIdx > 0 ? Math.min(1, eSince / 0.12) : 1;
  const np = accent(keys, t, 'nod', 0.45); const nod = np < 0 ? 0 : Math.sin(Math.PI * np) * (1 - np * 0.4);
  const bp = accent(keys, t, 'beat', 0.5); const beat = bp < 0 ? 0 : Math.sin(bp * Math.PI * 2) * Math.exp(-bp * 3.5);
  const wp = accent(keys, t, 'wink', 0.42); const wink = wp < 0 ? 0 : Math.sin(Math.PI * wp);

  const v = (env as any).open[Math.min((env as any).open.length - 1, frame)] ?? 0;
  const speaking = words.some((w) => t >= w.start - 0.04 && t <= w.end + 0.06);
  const open = speaking ? Math.max(0, Math.min(1, (v - 0.1) / 0.7)) : 0;
  const talkBob = speaking ? Math.sin(t * 7.1) * 0.5 + Math.sin(t * 3.3) * 0.8 : 0;
  // soft blink: ease shut in 0.09 s, hold 0.04 s, ease open in 0.13 s
  const blinkCurve = (d: number) => d < 0 || d > 0.26 ? 0 : d < 0.09 ? easeInOut(d / 0.09) : d < 0.13 ? 1 : 1 - easeInOut((d - 0.13) / 0.13);
  let blink = 0; for (const b of BLINKS) blink = Math.max(blink, blinkCurve(t - b));
  // a blink hides every pose swap and expression change, the way animators cover a cut
  if (curIdx > 0) blink = Math.max(blink, blinkCurve(since + 0.06));
  if (eIdx > 0) blink = Math.max(blink, blinkCurve(eSince + 0.06));
  const winkAmt = wp < 0 ? 0 : blinkCurve(wp * 0.42 * 0.62);
  const halfLid = 0 * baseLid;
  const closedL = blink, closedR = Math.max(blink, winkAmt);
  const breath = Math.sin(t * 2 * Math.PI / 3.6);
  const sway = Math.sin(t * 2 * Math.PI / 6.3) * 0.5;
  const intro = still ? 1 : spring({frame, fps, config: {damping: 14, stiffness: 110}});

  // ---------- face pieces ----------
  // half-closed (bored) lid: the pose's own lid skin slides down with a soft edge
  const half = (pose: string, n: 'lidL' | 'lidR', e: any, k: number) => {
    if (k < 0.03) return null;
    const b = r.poses[pose][n]; const cov = 0.2 + k * 0.8; const edgeY = b.y + b.h * cov;
    return (
      <React.Fragment key={'h' + n}>
        <Img src={src(`${pose}_${n}`)} style={box(b, {WebkitMaskImage: `linear-gradient(to bottom, #000 ${cov * 100 - 6}%, transparent ${cov * 100 + 2}%)`, maskImage: `linear-gradient(to bottom, #000 ${cov * 100 - 6}%, transparent ${cov * 100 + 2}%)`})} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <path d={`M ${e.cx - e.rx - 2} ${edgeY - 1} Q ${e.cx} ${edgeY - 6} ${e.cx + e.rx + 2} ${edgeY - 2}`} stroke="#1d1411" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.85} />
        </svg>
      </React.Fragment>
    );
  };
  // closed eye in the style of the asset sheet: lid skin plus one tapered lash arc, dissolved in softly
  const closed = (pose: string, n: 'lidL' | 'lidR', e: any, k: number, outerLeft: boolean) => {
    if (k < 0.02) return null;
    const b = r.poses[pose][n];
    const x0 = e.cx - e.rx - 5, x1 = e.cx + e.rx + 5, y0 = e.cy - 1, y1 = e.cy - 2;
    const arc = `M ${x0} ${y0} Q ${e.cx} ${e.cy + 5} ${x1} ${y1} Q ${e.cx} ${e.cy + 14} ${x0} ${y0} Z`;
    const ox = outerLeft ? x0 : x1, dir = outerLeft ? -1 : 1;
    return (
      <div key={'c' + n} style={{position: 'absolute', inset: 0, opacity: Math.min(1, k * 1.15)}}>
        <Img src={src(`${pose}_${n}`)} style={box(b)} />
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          <path d={`M ${e.cx - e.rx + 8} ${e.cy - 9} Q ${e.cx} ${e.cy - 5} ${e.cx + e.rx - 8} ${e.cy - 10}`} stroke="#8a5a44" strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.45} />
          <path d={arc} fill="#22160f" />
          <path d={`M ${ox} ${outerLeft ? y0 : y1} q ${dir * 7} 1 ${dir * 11} -4`} stroke="#22160f" strokeWidth={3} strokeLinecap="round" fill="none" />
        </svg>
      </div>
    );
  };

  const speakingNow = speaking;
  const vis: Vis = forceVis ? (forceVis as Vis) : speakingNow ? visemeAt(t) : mouthRest === 'grin' ? 'G' : mouthRest === 'flat' ? 'M' : 'rest';
  const mouthFor = (pose: string) => { const v = vis === 'rest' && mouthRest === 'grin' ? 'G' : vis; const b = r.mouth[v][pose];
    return <Img src={src(`${pose}_m_${v}`)} style={box(b)} />; };
  const eyesFor = (pose: string, ex: Expr, op: number) => ex === 'netral' ? null :
    <Img key={ex} src={src(`${pose}_e_${ex}`)} style={box(r.eyes[ex][pose], {opacity: op})} />;
  const headT = (pose: string) => {
    const lock = r.poses[pose].headLock ? 0.15 : 1;
    const tilt = Math.max(-1.8, Math.min(1.8, (headTilt * 0.6 + talkBob * 0.4 - sway * 0.4 + nod * 0.8) * lock));
    return `translateY(${nod * 4 * lock}px) rotate(${tilt}deg)`;
  };
  const stack = (pose: string, opacity: number) => {
    const pm = r.poses[pose];
    const showBrows = expr === 'netral' || (prevExpr === 'netral' && eMix < 1);
    return (
      <div key={pose} style={{position: 'absolute', inset: 0, opacity}}>
        <Img src={src(`${pose}_body`)} style={box(pm.body)} />
        <div style={{position: 'absolute', inset: 0, transformOrigin: `${r.neck.x}px ${r.neck.y}px`, transform: headT(pose)}}>
          <Img src={src(`${pose}_head`)} style={box(pm.head)} />
          {showBrows && <>
            <Img src={src(`${pose}_browL`)} style={box(pm.browL, {transform: `translateY(${-brow + browTilt * 1.2 + blink * 2.5}px) rotate(${browTilt * 3}deg)`, transformOrigin: '80% 60%', opacity: expr === 'netral' ? 1 : 1 - eMix})} />
            <Img src={src(`${pose}_browR`)} style={box(pm.browR, {transform: `translateY(${-brow - browAsym + browTilt * 1.2 + blink * 2}px) rotate(${-browTilt * 3}deg)`, transformOrigin: '20% 60%', opacity: expr === 'netral' ? 1 : 1 - eMix})} />
          </>}
          {eMix < 1 && eyesFor(pose, prevExpr, 1 - eMix)}
          {eyesFor(pose, expr, eMix)}
          {half(pose, 'lidL', r.eyeL, halfLid)}
          {half(pose, 'lidR', r.eyeR, halfLid)}
          {closed(pose, 'lidL', r.eyeL, closedL, true)}
          {closed(pose, 'lidR', r.eyeR, closedR, false)}
          {mouthFor(pose)}
        </div>
        {pm.collar && <Img src={src(`${pose}_collar`)} style={box(pm.collar)} />}
      </div>
    );
  };

  // swap: the new pose pops in with a small overshoot while the old one fades under it
  const popS = 1 + (1 - pop) * 0.035;
  const dip = (1 - pop) * 10;
  return (
    <div style={{position: 'absolute', left: x, top: y + (1 - intro) * 420, width: W, height: H, transform: `scale(${scale})`, transformOrigin: '50% 100%'}}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '50% 100%',
        transform: `translateY(${dip + beat * 8}px) rotate(${lean + sway}deg) scale(${popS * (1 - beat * 0.012)}, ${popS * (1 + breath * 0.005 + beat * 0.02)})`,
        filter: smear > 0 ? `blur(${smear * 3}px)` : undefined}}>
        {mix < 1 && stack(prevPose, 1)}
        {stack(cur.pose!, mix)}
      </div>
    </div>
  );
};
