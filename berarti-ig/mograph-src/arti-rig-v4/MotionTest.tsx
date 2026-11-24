import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ArtiRig, makeTimeline, Key} from './Rig';
import {Floor, Lingkaran} from './UI';
import {BrandFonts} from './BrandFonts';
import {B, HEAD, BODY, FLOOR_Y} from './theme';

const fidgetR = {s: 0, e: -40, h: 0, hand: 'relaxed' as const};
const fidgetL = {s: 0, e: -40, h: 0, hand: 'relaxed' as const};
const KEYS: Key[] = [
  {t: 0, dur: 0.01, p: {brows: 'worried', mouth: 'nervous', lookX: -0.6, lookY: 0.6, armR: fidgetR, armL: fidgetL, nod: 4}},
  {t: 0.4, dur: 0.3, p: {armR: {e: -52}, armL: {e: -30}}},
  {t: 0.75, dur: 0.3, p: {armR: {e: -34}, armL: {e: -48}, lookX: 0.5}},
  {t: 1.1, dur: 0.3, p: {armR: {e: -46}, armL: {e: -36}}},
  // anticipation dip, then raise halfway with overshoot
  {t: 1.6, dur: 0.18, ease: 'out', p: {crouch: 0.35, armR: {s: -8, e: -20, hand: 'open'}, lookX: 0, lookY: -0.2}},
  {t: 1.78, dur: 0.42, ease: 'back', p: {crouch: 0, lean: -2, armR: {s: 118, e: 46}, brows: 'up', mouth: 'o'}},
  // hesitation wobble
  {t: 2.4, dur: 0.25, p: {armR: {s: 110, e: 58}, tilt: -4, brows: 'worried', mouth: 'pressed'}},
  {t: 2.7, dur: 0.25, p: {armR: {s: 114, e: 50}}},
  // lower slowly and slump
  {t: 3.0, dur: 1.0, p: {armR: {s: 4, e: 2, hand: 'relaxed'}, armL: {s: 6, e: 4}, crouch: 0.45, lean: 3, nod: 12, brows: 'sad', mouth: 'sad', lookY: 1, lookX: -0.3}},
  // think: hand to chin, eyes up
  {t: 4.2, dur: 0.5, p: {armR: {s: -20, e: -157, h: -20, hand: 'fist'}, armL: {s: -26, e: -96, hand: 'relaxed'}, crouch: 0.1, lean: 1, nod: -4, tilt: 6, brows: 'think', mouth: 'side', lookX: 0.7, lookY: -0.8}},
  {t: 4.9, dur: 0.6, p: {tilt: 2, lookX: 0.4}},
  // realization: anticipation, then bounce up
  {t: 5.6, dur: 0.14, ease: 'out', p: {crouch: 0.4, nod: 6}},
  {t: 5.74, dur: 0.45, ease: 'back', p: {crouch: 0, nod: -8, tilt: 0, lean: -3, armR: {s: 22, e: 4, h: 0, hand: 'point'}, armL: {s: 30, e: 20, hand: 'open'}, brows: 'up', mouth: 'open', lookX: 0, lookY: -0.3}},
  {t: 6.25, dur: 0.3, p: {nod: 0, lean: 0}},
  // step forward with weight shift
  {t: 6.6, dur: 0.5, p: {shiftX: 60, lean: 4, armR: {s: 10, e: 8, hand: 'relaxed'}, armL: {s: 10, e: 8, hand: 'relaxed'}, brows: 'determined', mouth: 'calm'}},
  {t: 7.1, dur: 0.35, ease: 'back', p: {lean: 0}},
  // open palm offer while talking
  {t: 7.6, dur: 0.4, ease: 'back', p: {armR: {s: 42, e: 48, h: -10, hand: 'open'}, talk: 1, mouth: 'talk', brows: 'calm', tilt: -3, lookX: -0.2}},
  {t: 8.2, dur: 0.3, p: {armR: {s: 36, e: 56}, nod: 4}},
  {t: 8.5, dur: 0.3, p: {nod: -2}},
  // hand on chest, warm smile
  {t: 8.8, dur: 0.5, p: {armR: {s: 6, e: 4, h: 0, hand: 'relaxed'}, armL: {s: -20, e: -136, h: 10, hand: 'flat'}, talk: 0, mouth: 'smile', tilt: 4, nod: 3, eyeOpen: 0.75}},
];
const pose = makeTimeline(KEYS);
const LABELS: Array<[number, string]> = [[0, 'idle gelisah'], [1.6, 'antisipasi + angkat tangan'], [2.4, 'ragu'], [3.0, 'turun pelan + lesu'], [4.2, 'berpikir'], [5.6, 'sadar (bounce)'], [6.6, 'melangkah'], [7.6, 'menawarkan + bicara'], [8.8, 'tangan di dada']];

export const MotionTest: React.FC = () => {
  const t = useCurrentFrame() / 60;
  const P = pose(t);
  const lab = [...LABELS].reverse().find(([s]) => t >= s)![1];
  const cam = 1 + t * 0.006;
  return (
    <AbsoluteFill style={{background: B.stage, overflow: 'hidden'}}>
      <BrandFonts />
      <AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: '50% 70%'}}>
        <Floor />
        <Lingkaran t={t} at={5.74} cx={540 + 30} cy={720} r={360} />
        <ArtiRig t={t} pose={P} x={540} y={FLOOR_Y - 1130} height={1150} />
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 120, width: '100%', textAlign: 'center', fontFamily: HEAD, fontSize: 64, color: B.ink}}>MOTION TEST</div>
      <div style={{position: 'absolute', top: 200, width: '100%', textAlign: 'center', fontFamily: BODY, fontWeight: 600, fontSize: 40, color: B.orange}}>{lab}</div>
    </AbsoluteFill>
  );
};
