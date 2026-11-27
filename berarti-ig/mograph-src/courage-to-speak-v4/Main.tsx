import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import project from './project.json';
import {SfxTrack} from './components/SfxTrack';
import {FontFaces} from './Fonts';
import {at, endOf} from './lib/words';
import {B, BODY, HEAD, FLOOR_Y} from './berarti/theme';
import {BrandFonts} from './berarti/BrandFonts';
import {Floor, Lingkaran, Subtitles, Pijak, Bubble, pr, back} from './berarti/UI';
import {Pill, Icon} from './berarti/Props';
import {Bulb} from './berarti/Sets';
import {Timer, ClockCard, Cloud, EqCard, PeopleIcon, MegaIcon, DocIcon, Cursor} from './berarti/Story';
import {ArtiRig, makeTimeline, Key, Arm, Hand} from './berarti/Rig';
import {RAKA, SARI, NADIA, BIMO} from './berarti/Cast';
import {EdTitle, Iris, mouth} from './berarti/Ed';
import type {Look} from './berarti/Rig';

const sound = project as {musicFile?: string | null; musicVolume?: number; musicAutomation?: Array<{frame: number; volume: number}>};
const musicGain = (frame: number): number => {
  const pts = sound.musicAutomation ?? [];
  if (pts.length === 0) return sound.musicVolume ?? 0.24;
  if (frame <= pts[0].frame) return pts[0].volume;
  if (frame >= pts[pts.length - 1].frame) return pts[pts.length - 1].volume;
  let i = 1; while (i < pts.length && pts[i].frame < frame) i++;
  const a = pts[i - 1], b = pts[i];
  return a.volume + (b.volume - a.volume) * Math.max(0, Math.min(1, (frame - a.frame) / Math.max(1, b.frame - a.frame)));
};

const T = {
  idenya: at('Idenya', 0, 2.3), dipakai: at('dipakai', 0, 2.7), tapi1: at('tapi bukan', 0, 3.6), padahal: at('Padahal', 0, 5.6), ide9: at('ide itu', 0, 8.0),
  tapi: at('Tapi satu', 0, 10.1), nanti: at('Nanti', 0, 13.0), jadi: at('Jadi dia', 0, 14.8), diam2: at('diam', 1, 16.3), sampai: at('Sampai', 0, 17.0),
  temannya: at('temannya', 0, 17.4), mirip: at('mirip', 0, 18.9), semua: at('semua orang', 0, 20.0), angguk: at('mengangguk', 0, 21.0), malam: at('Malamnya', 0, 21.8),
  aku: at('Aku ini', 0, 24.9), atau: at('atau cuma', 0, 26.4), takut: at('takut', 0, 27.3), pelan: at('Pelan-pelan', 0, 28.1), paham: at('paham', 0, 28.8),
  rendah: at('Rendah hati itu', 0, 29.6), sedangkan: at('sedangkan', 0, 32.8), berani: at('berani', 0, 34.6), menawarkan: at('menawarkan', 0, 35.3),
  dua: at('Dua-duanya', 0, 37.2), bareng: at('jalan bareng', 0, 39.3), rapat2: at('Rapat berikutnya', 0, 40.4), kalimat: at('satu kalimat', 0, 42.3),
  usulan: at('Aku punya', 0, 43.3), kalau: at('Kalau kamu', 0, 44.9), gak: at('kamu gak', 0, 46.6), follow: at('Follow', 0, 47.9),
  ngomong: at('kamu yang ngomong', 0, 50.5), end: endOf('kamu yang ngomong', 0, 51.3),
};
const S = [0, T.padahal - 0.1, T.jadi - 0.1, T.sampai - 0.1, T.malam - 0.1, T.pelan - 0.1, T.rapat2 - 0.1, T.kalau - 0.1, T.follow - 0.1, 999];

// ---------- pose shorthands ----------
const A = (s: number, e: number, hand: Hand = 'relaxed', h = 0): Arm => ({s, e, h, hand});
const REL = {armR: A(8, 4), armL: A(8, 4)};
const TOG = {armR: A(0, -34), armL: A(0, -34)};
const CHIN = {armR: A(-22, -160, 'fist', -20), armL: A(-26, -96)};
const CHEST = {armL: A(30, -145, 'flat', 14)};
const k = (t: number, p: Key['p'], dur?: number, ease?: Key['ease']): Key => ({t, p, dur, ease});
const nods = (t0: number, n: number, amp = 9, gap = 0.3): Key[] => Array.from({length: n * 2}, (_, i) => k(t0 + i * gap / 2, {nod: i % 2 ? 0 : amp}, gap / 2));

const Char: React.FC<{t: number; tl: ReturnType<typeof makeTimeline>; look?: Look; x: number; y: number; h: number; talk?: [number, number]; phase?: number; filter?: string; shadow?: boolean}> =
  ({t, tl, look = RAKA, x, y, h, talk, phase, filter, shadow}) => (
  <ArtiRig t={t} pose={tl(t)} lagPose={tl(Math.max(0, t - 0.1))} look={look} x={x} y={y} height={h} phase={phase} filter={filter} shadow={shadow}
    mouthOpen={talk ? mouth(t, talk[0], talk[1]) : undefined} />
);
const standY = (h: number) => FLOOR_Y - 0.982 * h;
const TABLE_TOP = 1196;
const seatY = (h: number) => TABLE_TOP - 0.6 * h + 26;

// ---------- sets ----------
const Cam: React.FC<{t: number; a: number; b: number; s0: number; s1: number; x0?: number; x1?: number; ox?: string; children: React.ReactNode}> = ({t, a, b, s0, s1, x0 = 0, x1 = 0, ox = '50% 60%', children}) => {
  const p = Math.max(0, Math.min(1, (t - a) / Math.max(0.1, b - a)));
  const e = p * p * (3 - 2 * p);
  return <AbsoluteFill style={{transform: `translateX(${x0 + (x1 - x0) * e}px) scale(${s0 + (s1 - s0) * e})`, transformOrigin: ox}}>{children}</AbsoluteFill>;
};
/** Parallax layer: moves a fraction of the scene's drift so depth reads. */
const Par: React.FC<{t: number; a: number; d: number; children: React.ReactNode}> = ({t, a, d, children}) =>
  <AbsoluteFill style={{transform: `translateX(${-(t - a) * 9 * d}px)`}}>{children}</AbsoluteFill>;
const Wall: React.FC<{c?: string}> = ({c = '#E4E7EA'}) => <div style={{position: 'absolute', inset: -80, background: c}} />;
const Window: React.FC<{x: number; y: number; w: number; h: number; night?: number}> = ({x, y, w, h, night = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: '#CFE6F3', border: '14px solid white', borderRadius: 8, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, background: '#1E3150', opacity: night}} />
    <div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 10, marginLeft: -5, background: 'white'}} />
    {night > 0 && <div style={{position: 'absolute', right: 30, top: 26, width: 66, height: 66, borderRadius: 33, background: '#F8E7A8', boxShadow: '0 0 40px #F8E7A8', opacity: night}} />}
    {night > 0 && [[30, 40], [90, 120], [150, 60]].map(([l, tp], i) => <div key={i} style={{position: 'absolute', left: l, top: tp, width: 5, height: 5, borderRadius: 3, background: 'white', opacity: night * 0.8}} />)}
    <div style={{position: 'absolute', left: -20, bottom: -26, width: w + 40, height: 90, borderRadius: '50%', background: '#8EC58E', opacity: 1 - night * 0.75}} />
  </div>
);
const Board: React.FC<{x: number; y: number; t: number; a?: number}> = ({x, y, t, a = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 330, height: 220, background: 'white', border: '6px solid #C9CED6', borderRadius: 8, padding: 24}}>
    <div style={{width: 150, height: 12, background: B.ink, borderRadius: 6, marginBottom: 18}} />
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 14, height: 110}}>{[45, 70, 58, 100].map((h, i) => <div key={i} style={{width: 34, height: `${h * pr(t, a + i * 0.08, 0.5)}%`, background: i === 3 ? B.orange : '#3E4A68'}} />)}</div>
  </div>
);
const Plant: React.FC<{x: number; y: number; s?: number; t: number}> = ({x, y, s = 1, t}) => (
  <svg width={130 * s} height={190 * s} viewBox="0 0 130 190" style={{position: 'absolute', left: x, top: y, overflow: 'visible'}}>
    {[-32, -12, 8, 28, 0].map((r, i) => <ellipse key={i} cx={65} cy={70} rx={16} ry={58} fill={i % 2 ? '#3E8E5C' : '#5BAA74'} transform={`rotate(${r + Math.sin(t * 1.3 + i) * 2} 65 125)`} />)}
    <path d="M32 125 L98 125 L88 188 L42 188 Z" fill="#C86B3C" />
  </svg>
);
const Table: React.FC<{x0?: number; x1?: number; props?: boolean}> = ({x0 = -40, x1 = 1120, props = true}) => (
  <>
    {props && <>
      <div style={{position: 'absolute', left: x0 + 120, top: TABLE_TOP - 70, width: 150, height: 80}}>
        <div style={{position: 'absolute', left: 10, top: 0, width: 130, height: 74, background: '#3B4250', borderRadius: '8px 8px 0 0', transform: 'perspective(200px) rotateX(-12deg)'}} />
      </div>
      <div style={{position: 'absolute', left: x1 - 260, top: TABLE_TOP - 46, width: 46, height: 52, background: 'white', borderRadius: '6px 6px 14px 14px', border: '5px solid #D8D3CB'}} />
      <div style={{position: 'absolute', left: (x0 + x1) / 2 - 60, top: TABLE_TOP - 8, width: 140, height: 14, background: 'white', borderRadius: 2, transform: 'rotate(-4deg)'}} />
    </>}
    <div style={{position: 'absolute', left: x0, width: x1 - x0, top: TABLE_TOP, height: 36, background: B.refTableTop, borderRadius: 10}} />
    <div style={{position: 'absolute', left: x0 + 16, width: x1 - x0 - 32, top: TABLE_TOP + 30, height: FLOOR_Y - TABLE_TOP, background: B.refTable}} />
    <div style={{position: 'absolute', left: x0 + 16, width: x1 - x0 - 32, top: TABLE_TOP + 30, height: 14, background: '#00000022'}} />
  </>
);
const Meeting: React.FC<{t: number; a: number}> = ({t, a}) => (
  <Par t={t} a={a} d={0.4}>
    <Wall />
    <Window x={50} y={330} w={300} h={250} />
    <Board x={680} y={330} t={t} a={a + 0.2} />
    <Plant x={420} y={1010} s={1.0} t={t} />
  </Par>
);
const Spark: React.FC<{t: number; at: number; x: number; y: number; c?: string}> = ({t, at: a, x, y, c = B.orange}) => {
  const p = pr(t, a, 0.5); if (p <= 0 || p >= 1) return null;
  return <svg style={{position: 'absolute', left: x - 60, top: y - 60}} width={120} height={120} viewBox="-60 -60 120 120">
    {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => <line key={r} x1={0} y1={-18 - p * 26} x2={0} y2={-30 - p * 30} stroke={c} strokeWidth={7 * (1 - p)} strokeLinecap="round" transform={`rotate(${r})`} />)}
  </svg>;
};

// ---------- 01 hook: meeting, the idea is used, Raka stays quiet ----------
const R1 = makeTimeline([
  k(0, {...TOG, brows: 'worried', mouth: 'nervous', lookX: 0.7, nod: 3, turn: 0.3}, 0.01),
  k(0.6, {armR: {e: -44}, armL: {e: -26}}, 0.3), k(1.0, {armR: {e: -28}, armL: {e: -42}}, 0.3), k(1.5, {lookX: 0.9, lookY: -0.1}, 0.3),
  k(T.idenya, {brows: 'up', mouth: 'o', nod: -2}, 0.3),
  k(T.tapi1, {crouch: 0.3, nod: 11, lean: 2, brows: 'sad', mouth: 'sad', lookY: 0.8, lookX: 0.2, armR: {e: -40}, armL: {e: -30}}, 0.7),
  k(4.6, {armR: {e: -30}, armL: {e: -40}}, 0.4),
]);
const B1 = makeTimeline([
  k(0, {...REL, mouth: 'calm', lookX: -0.6, turn: -0.3}, 0.01),
  k(T.idenya - 0.16, {crouch: 0.2, armR: A(-6, -10, 'relaxed')}, 0.16, 'out'),
  k(T.idenya, {crouch: 0, armR: A(130, 40, 'point'), brows: 'up', mouth: 'smile', lookX: -0.2, lookY: -0.3}, 0.42, 'back'),
  k(T.tapi1, {armR: A(42, 48, 'open', -10), armL: A(30, 60, 'open'), brows: 'calm', lookX: -0.8, lookY: 0}, 0.45, 'back'),
  k(4.5, {armR: {s: 36, e: 56}, nod: 4}, 0.3), k(4.8, {nod: 0}, 0.3),
]);
const SA1 = makeTimeline([k(0, {...REL, mouth: 'smile', lookX: 0.8, turn: 0.3}, 0.01), ...nods(T.tapi1 + 0.1, 3, 8)]);
const Sc01: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <Cam t={t} a={0} b={S[1]} s0={1.0} s1={1.08} ox="25% 60%">
      <Meeting t={t} a={0} />
      <Bulb x={930} y={560} size={90} on={pr(t, T.dipakai + 0.15, 0.3)} opacity={pr(t, T.dipakai, 0.3, back)} />
      <Spark t={t} at={T.dipakai + 0.1} x={975} y={605} />
      <Char t={t} tl={SA1} look={SARI} x={560} y={seatY(900)} h={900} phase={1.3} shadow={false} />
      <Char t={t} tl={B1} look={BIMO} x={870} y={seatY(900)} h={900} phase={2.1} talk={[T.idenya, T.padahal - 0.2]} shadow={false} />
      <Char t={t} tl={R1} x={210} y={seatY(900)} h={900} shadow={false} filter={`saturate(${1 - 0.3 * pr(t, T.tapi1, 0.6)})`} />
      <Table />
    </Cam>
    <div style={{opacity: 1 - pr(t, T.tapi1 - 0.3, 0.3)}}><Timer t={t} at={0} dur={2.2} x={860} y={300} r={110} /></div>
    <EdTitle t={t} at={0.05} label="DI RAPAT" lines={['10 MENIT', {key: 'DIAM'}]} y={240} size={96} out={T.tapi1 - 0.25} card />
    <EdTitle t={t} at={T.tapi1} label="IDENYA DIPAKAI" lines={['BUKAN DIA', {key: 'YANG NGOMONG'}]} y={240} size={84} card />
  </AbsoluteFill>
);

// ---------- 02 problem: the idea since 9 am, then one thought stops him ----------
const R2 = makeTimeline([
  k(S[1], {...REL, brows: 'calm', mouth: 'calm', lookX: -0.8, lookY: -0.6, tilt: -3}, 0.01),
  k(6.9, {lookX: 0, lookY: 0, tilt: 0}, 0.5),
  k(T.ide9 - 0.1, {...CHIN, brows: 'think', mouth: 'side', lookX: 0.7, lookY: -0.8, tilt: 5}, 0.5),
  k(8.8, {crouch: 0.25, nod: 5}, 0.14, 'out'),
  k(8.94, {crouch: 0, nod: -4, tilt: 0, armR: A(130, 40, 'point'), armL: A(8, 4), brows: 'up', mouth: 'smile', lookX: 0.5, lookY: -0.6}, 0.45, 'back'),
  k(T.tapi - 0.05, {armR: A(4, 2), brows: 'worried', mouth: 'pressed', lookX: -0.3, lookY: 0.5, nod: 4}, 0.55),
  k(11.4, {lookX: 0.5, lookY: -0.4}, 0.4), k(12.3, {lookX: -0.2, lookY: 0.5}, 0.5),
  k(T.nanti - 0.1, {...TOG, crouch: 0.35, nod: 10, tilt: -5, lean: 2, brows: 'worried', mouth: 'nervous', lookX: -0.6, lookY: 0.6}, 0.4, 'back'),
  k(13.9, {armR: {e: -44}, armL: {e: -26}}, 0.3), k(14.25, {armR: {e: -28}, armL: {e: -42}}, 0.3),
]);
const Sc02: React.FC<{t: number}> = ({t}) => {
  const dim = pr(t, T.tapi, 0.8);
  return <AbsoluteFill>
    <Cam t={t} a={S[1]} b={S[2]} s0={1.0} s1={1.1} ox="38% 62%">
      <Par t={t} a={S[1]} d={0.3}><Wall c={B.stage} /><Plant x={900} y={1290} s={0.9} t={t} /></Par>
      <Pijak x={400} y={FLOOR_Y} w={380} />
      <Char t={t} tl={R2} x={400} y={standY(860)} h={860} filter={`saturate(${1 - 0.25 * dim})`} />
    </Cam>
    <ClockCard t={t} at={S[1] + 0.1} x={60} y={250} time="09:00" label="PAGI" />
    <Cloud t={t} at={T.ide9 - 0.2} x={540} y={300} w={480} h={290} out={T.nanti - 0.25}>
      <div style={{position: 'relative', width: 280, height: 170, transform: `translateX(${Math.sin(t * 40) * 3 * dim * (1 - pr(t, T.tapi + 0.4, 0.2))}px)`}}>
        <Bulb x={80} y={100} size={115} on={1 - 0.9 * dim} />
        <div style={{position: 'absolute', left: 160, top: 26, transform: `rotate(${8 + 10 * dim}deg)`, opacity: 1 - 0.5 * dim}}><DocIcon size={100} /></div>
      </div>
    </Cloud>
    <Cloud t={t} at={T.nanti - 0.1} x={500} y={290} w={540} h={300}>
      <div style={{fontFamily: HEAD, fontSize: 52, color: B.ink, textAlign: 'center', lineHeight: 1.05, textTransform: 'uppercase'}}>Nanti dibilang<br /><span style={{color: B.orange, fontSize: 66}}>sok tahu...</span></div>
    </Cloud>
  </AbsoluteFill>;
};

// ---------- 03 hesitation: the hand goes up halfway, then down ----------
const R3 = makeTimeline([
  k(S[2], {...TOG, brows: 'worried', mouth: 'nervous', lookX: 0.2, lookY: 0.3, nod: 4}, 0.01),
  k(T.jadi + 0.05, {crouch: 0.3, armR: A(-8, -20, 'open'), lookY: -0.2}, 0.18, 'out'),
  k(T.jadi + 0.23, {crouch: 0, armR: A(118, 46, 'open'), brows: 'up', mouth: 'o', lookX: 0.5, lookY: -0.3, nod: 0}, 0.4, 'back'),
  k(T.jadi + 0.7, {armR: {s: 110, e: 58}, tilt: -4, brows: 'worried', mouth: 'pressed'}, 0.25), k(T.jadi + 0.95, {armR: {s: 114, e: 50}}, 0.2),
  k(T.jadi + 1.15, {armR: A(4, 2), armL: A(6, 4), crouch: 0.45, lean: 3, nod: 12, brows: 'sad', mouth: 'sad', lookY: 1, lookX: -0.3}, 0.75),
]);
const Sc03: React.FC<{t: number}> = ({t}) => {
  const arrow = pr(t, T.jadi + 1.15, 0.6);
  const stamp = pr(t, T.diam2 - 0.15, 0.35, back);
  return <AbsoluteFill>
    <Cam t={t} a={S[2]} b={S[3]} s0={1.12} s1={1.2} ox="40% 55%">
      <Wall c={B.stage} />
      <Pijak x={420} y={FLOOR_Y} w={380} />
      <Char t={t} tl={R3} x={420} y={standY(860)} h={860} />
    </Cam>
    <svg style={{position: 'absolute', left: 620, top: 600}} width={300} height={420} viewBox="0 0 300 420">
      <path d="M60 30 Q260 80 200 360" fill="none" stroke={B.floor} strokeWidth={20} strokeLinecap="round" strokeDasharray={460} strokeDashoffset={460 * (1 - arrow)} />
      <path d="M150 330 L200 380 L250 320" fill="none" stroke={B.floor} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" opacity={arrow > 0.95 ? 1 : 0} />
    </svg>
    {stamp > 0 && <div style={{position: 'absolute', left: 520, top: 1060, padding: '6px 34px 18px', background: B.orange, borderRadius: 14, fontFamily: HEAD, fontSize: 170, color: 'white', lineHeight: 1,
      boxShadow: '10px 12px 0 #171A18', transform: `rotate(-6deg) scale(${0.6 + 0.4 * stamp})`, opacity: Math.min(1, stamp * 2)}}>DIAM</div>}
  </AbsoluteFill>;
};

// ---------- 04 agitate: a colleague says a similar idea, everyone nods ----------
const R4 = makeTimeline([
  k(S[3], {...TOG, crouch: 0.3, nod: 8, brows: 'sad', mouth: 'sad', lookX: 0.8, turn: 0.3}, 0.01),
  k(T.mirip, {brows: 'worried', mouth: 'pressed', lookX: 0.9, nod: 4}, 0.4),
  k(T.semua + 0.2, {nod: 14, lookY: 0.8, lookX: 0.2, crouch: 0.4, brows: 'sad', mouth: 'sad'}, 0.6),
]);
const B4 = makeTimeline([
  k(S[3], {...REL, mouth: 'calm', lookX: 0.4, turn: 0.2}, 0.01),
  k(T.temannya - 0.1, {armR: A(42, 48, 'open', -10), armL: A(30, 60, 'open'), brows: 'up', mouth: 'smile', lookX: 0.6}, 0.45, 'back'),
  k(T.mirip - 0.16, {crouch: 0.2}, 0.16, 'out'),
  k(T.mirip, {crouch: 0, armR: A(130, 40, 'point'), armL: A(8, 4), lookY: -0.4}, 0.42, 'back'),
  k(T.semua, {armR: A(50, 30, 'open'), armL: A(50, 30, 'open'), lookY: 0, lean: -2}, 0.45, 'back'),
]);
const SA4 = makeTimeline([k(S[3], {...REL, mouth: 'calm', lookX: -0.8, turn: -0.3}, 0.01), k(T.mirip, {brows: 'up', mouth: 'smile'}, 0.3), ...nods(T.semua, 3, 10)]);
const NA4 = makeTimeline([k(S[3], {...TOG, mouth: 'calm', lookX: -0.9, turn: -0.3}, 0.01), k(T.mirip + 0.1, {brows: 'up', mouth: 'smile'}, 0.3), ...nods(T.semua + 0.12, 3, 9)]);
const Sc04: React.FC<{t: number}> = ({t}) => {
  const up = pr(t, T.temannya - 0.3, 0.5, back);
  return <AbsoluteFill>
    <Cam t={t} a={S[3]} b={S[4]} s0={1.0} s1={1.07} ox="45% 60%">
      <Meeting t={t} a={S[3]} />
      <Bulb x={250} y={540} size={90} on={pr(t, T.mirip + 0.1, 0.3)} opacity={pr(t, T.mirip, 0.3, back)} />
      <Spark t={t} at={T.mirip + 0.05} x={295} y={585} />
      <Char t={t} tl={SA4} look={SARI} x={730} y={seatY(860)} h={860} phase={0.7} shadow={false} />
      <Char t={t} tl={NA4} look={NADIA} x={990} y={seatY(860)} h={860} phase={1.9} shadow={false} />
      <Char t={t} tl={B4} look={BIMO} x={460} y={seatY(860) - 110 * up} h={860} phase={2.4} talk={[T.temannya, T.semua - 0.1]} shadow={false} />
      <Char t={t} tl={R4} x={150} y={seatY(860)} h={860} shadow={false} filter={`saturate(${0.75 - 0.25 * pr(t, T.semua, 0.6)}) brightness(${1 - 0.06 * pr(t, T.semua, 0.6)})`} />
      <Table />
      {[[690, 560, 0], [950, 560, 0.12], [420, 450, 0.3]].map(([x, y, d], i) => <Icon key={i} kind="check" x={x} y={y} size={80} p={pr(t, T.semua + 0.2 + d, 0.35, back)} />)}
    </Cam>
    <EdTitle t={t} at={T.semua - 0.1} label="IDE YANG MIRIP" lines={['SEMUA', {key: 'MENGANGGUK'}]} y={240} size={92} card />
  </AbsoluteFill>;
};

// ---------- 05 turn: at night, an honest question ----------
const R5 = makeTimeline([
  k(S[4], {...REL, brows: 'sad', mouth: 'calm', lookX: 0.7, lookY: -0.4, tilt: 3}, 0.01),
  k(22.9, {...CHIN, brows: 'think', mouth: 'side', lookX: 0.6, lookY: -0.8, tilt: 6}, 0.6),
  k(T.aku, {tilt: 2, lookX: 0.3}, 0.5), k(T.atau, {tilt: -3, lookX: 0.7}, 0.5),
  k(T.takut - 0.1, {lean: -3, brows: 'worried', mouth: 'o', armR: A(-8, -70), armL: A(8, 4), lookX: 0.4, lookY: -0.5, crouch: 0.1}, 0.22, 'out'),
]);
const Sc05: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <Cam t={t} a={S[4]} b={S[5]} s0={1.0} s1={1.08} ox="35% 65%">
      <div style={{position: 'absolute', inset: -80, background: 'linear-gradient(#243553, #16223A)'}} />
      <Par t={t} a={S[4]} d={0.3}>
        <Window x={660} y={740} w={330} h={300} night={1} />
        <div style={{position: 'absolute', left: 40, top: 900, width: 520, height: 520, borderRadius: 260, background: 'radial-gradient(#FFE7A8aa, #FFE7A800 70%)'}} />
      </Par>
      <Char t={t} tl={R5} x={330} y={standY(860)} h={860} filter="brightness(0.86) saturate(0.9)" />
    </Cam>
    <Pill t={t} at={S[4] + 0.35} text="MALAMNYA" x={60} y={250} size={40} out={T.aku - 0.4} />
    <Cloud t={t} at={T.aku - 0.1} x={380} y={230} w={660} h={430} paper>
      <div style={{fontFamily: HEAD, fontSize: 58, color: B.ink, textAlign: 'center', lineHeight: 1.0, transform: 'rotate(-4deg)'}}>
        <div style={{opacity: pr(t, T.aku + 0.3, 0.3)}}>RENDAH HATI</div>
        <div style={{opacity: pr(t, T.atau - 0.05, 0.3), fontSize: 50}}>ATAU</div>
        <div style={{color: B.orange, fontSize: 90, opacity: pr(t, T.takut - 0.1, 0.3), transform: `scale(${0.8 + 0.2 * pr(t, T.takut - 0.1, 0.35, back)}) rotate(${Math.sin(t * 30) * 2 * (1 - pr(t, T.takut + 0.4, 0.3))}deg)`}}>TAKUT?</div>
      </div>
    </Cloud>
  </AbsoluteFill>
);

// ---------- 06 solution: humble and confident can walk together ----------
const R6 = makeTimeline([
  k(S[5], {...CHIN, brows: 'think', mouth: 'side', lookX: 0.3, lookY: -0.6, tilt: 4}, 0.01),
  k(T.paham - 0.2, {crouch: 0.4, nod: 6}, 0.14, 'out'),
  k(T.paham - 0.06, {crouch: 0, nod: -6, tilt: 0, armR: A(30, 20, 'open'), armL: A(30, 20, 'open'), brows: 'up', mouth: 'open', lookX: 0, lookY: -0.2}, 0.45, 'back'),
  k(T.paham + 0.45, {mouth: 'smile', nod: 0, armR: A(10, 6), armL: A(8, 4)}, 0.3),
  k(T.rendah - 0.05, {armR: A(120, 10, 'open'), lookX: -0.8, lookY: -0.8, turn: -0.4, tilt: -4, brows: 'calm'}, 0.45, 'back'),
  k(30.9, {armR: {s: 102, e: 20}, nod: 4}, 0.4), k(31.6, {armR: {s: 114, e: 12}, nod: 0}, 0.4),
  k(T.sedangkan - 0.3, {armR: A(8, 4), turn: 0, lookX: 0, tilt: 0}, 0.4),
  k(T.sedangkan + 0.05, {armL: A(120, 10, 'open'), lookX: 0.8, lookY: -0.8, turn: 0.4, tilt: 4}, 0.45, 'back'),
  k(T.berani - 0.16, {crouch: 0.2}, 0.16, 'out'),
  k(T.berani, {crouch: 0, armL: A(40, 110, 'fist'), brows: 'determined', mouth: 'smile', turn: 0, lookX: 0, lookY: 0, tilt: 0}, 0.4, 'back'),
  k(T.menawarkan, {armL: A(42, 48, 'open', -10), armR: A(42, 48, 'open', -10), brows: 'calm', lean: 2}, 0.45, 'back'),
  k(36.5, {nod: 5}, 0.3), k(36.8, {nod: 0, lean: 0}, 0.3),
  k(T.dua - 0.1, {armR: A(0, -60, 'fist'), armL: A(0, -60), tilt: 0}, 0.45, 'back'),
  k(T.bareng - 0.6, {...CHEST, armR: A(8, 4, 'clicker'), mouth: 'smile', tilt: 4, nod: 3, eyeOpen: 0.8}, 0.5),
  k(T.bareng + 0.4, {nod: 0}, 0.4),
]);
const Sc06: React.FC<{t: number}> = ({t}) => {
  const merge = pr(t, T.dua - 0.1, 0.5);
  const gone = pr(t, T.bareng - 0.7, 0.35);
  return <AbsoluteFill>
    <Cam t={t} a={S[5]} b={S[6]} s0={1.0} s1={1.05} ox="50% 70%">
      <Wall c={B.stage} />
      <Lingkaran t={t} at={T.paham - 0.15} cx={540} cy={1040} r={340} />
      <Pijak x={540} y={FLOOR_Y} w={400} />
      <Char t={t} tl={R6} x={540} y={standY(860)} h={860} />
      {[[300, 760, 0], [800, 700, 0.1], [260, 1080, 0.2], [840, 1040, 0.3]].map(([x, y, d], i) => <Spark key={i} t={t} at={T.paham + d} x={x} y={y} c={i % 2 ? B.floor : B.orange} />)}
    </Cam>
    <Pill t={t} at={S[5] + 0.1} text="PELAN-PELAN PAHAM" x={60} y={250} size={38} out={T.rendah - 0.25} />
    <div style={{position: 'absolute', inset: 0, opacity: 1 - gone, transform: `translateY(${-gone * 40}px)`}}>
      <EqCard t={t} at={T.rendah - 0.05} x={40 + merge * 50} y={230} w={470} color={B.floor} icon={<PeopleIcon />} title="RENDAH HATI" body="Cara kita memandang orang" />
      <EqCard t={t} at={T.sedangkan + 0.05} x={570 - merge * 50} y={230} w={470} color={B.orange} icon={<MegaIcon />} title="PERCAYA DIRI" body="Berani menawarkan yang kita punya" />
      <Icon kind="plus" x={540} y={410} size={110} color={B.ink} p={pr(t, T.dua - 0.2, 0.4, back)} />
    </div>
    <EdTitle t={t} at={T.bareng - 0.55} label="DUA-DUANYA" lines={['BISA', {key: 'JALAN BARENG'}]} y={260} size={110} />
  </AbsoluteFill>;
};

// ---------- 07 step: next meeting, one sentence ----------
const STEP = (t0: number, x0: number, dx: number, side: 'R' | 'L'): Key[] => side === 'R' ? [
  k(t0, {liftR: 34, legAR: 3, shiftX: x0 + dx * 0.45, lean: 3, armR: A(-6, 6), armL: A(18, 10)}, 0.24, 'out'),
  k(t0 + 0.24, {liftR: 0, legAR: 0, shiftX: x0 + dx}, 0.18, 'in'),
] : [
  k(t0, {liftL: 34, legAL: 3, shiftX: x0 + dx * 0.45, lean: 3, armR: A(18, 10), armL: A(-6, 6)}, 0.24, 'out'),
  k(t0 + 0.24, {liftL: 0, legAL: 0, shiftX: x0 + dx}, 0.18, 'in'),
];
const R7 = makeTimeline([
  k(S[6], {...REL, brows: 'determined', mouth: 'calm', lookX: 0.6}, 0.01),
  ...STEP(T.rapat2 + 0.05, 0, 55, 'R'), ...STEP(T.rapat2 + 0.47, 55, 55, 'L'), ...STEP(T.rapat2 + 0.89, 110, 50, 'R'),
  k(T.rapat2 + 1.35, {...REL, lean: 0, mouth: 'smile', brows: 'calm'}, 0.35, 'back'),
  k(T.usulan - 0.45, {crouch: 0.22, armR: A(-8, -20, 'open')}, 0.15, 'out'),
  k(T.usulan - 0.3, {crouch: 0, armR: A(155, 16, 'open'), brows: 'up', mouth: 'smile', lookX: 0.8, turn: 0.3}, 0.42, 'back'),
  k(T.usulan + 0.35, {armR: A(8, 4, 'clicker'), armL: A(42, 48, 'open', -10), brows: 'calm', lean: -1}, 0.5, 'back'),
  k(44.3, {nod: 4}, 0.25), k(44.55, {nod: 0}, 0.25),
]);
const SA7 = makeTimeline([k(S[6], {...REL, mouth: 'calm', lookX: -0.9, turn: -0.4}, 0.01), k(T.usulan + 0.2, {brows: 'up', mouth: 'smile'}, 0.3), ...nods(T.usulan + 0.8, 2, 8)]);
const B7 = makeTimeline([k(S[6], {...TOG, mouth: 'calm', lookX: -0.9, turn: -0.4}, 0.01), k(T.usulan + 0.3, {brows: 'up', mouth: 'open'}, 0.3), k(T.usulan + 0.9, {mouth: 'smile', armL: A(40, 110, 'fist')}, 0.4, 'back')]);
const Sc07: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <Cam t={t} a={S[6]} b={S[7]} s0={1.0} s1={1.06} ox="30% 65%">
      <Meeting t={t} a={S[6]} />
      <Lingkaran t={t} at={T.kalimat - 0.2} cx={300} cy={1010} r={300} />
      <Char t={t} tl={SA7} look={SARI} x={700} y={seatY(860)} h={860} phase={0.4} shadow={false} />
      <Char t={t} tl={B7} look={BIMO} x={950} y={seatY(860)} h={860} phase={1.6} shadow={false} />
      <Table x0={500} />
      <Char t={t} tl={R7} x={150} y={standY(900)} h={900} talk={[T.usulan - 0.05, T.kalau - 0.2]} />
      {[[700, 560, 0], [950, 560, 0.12]].map(([x, y, d], i) => <Icon key={i} kind="check" x={x} y={y} size={76} p={pr(t, T.usulan + 0.9 + d, 0.35, back)} />)}
    </Cam>
    <Pill t={t} at={S[6] + 0.1} n="01" text="RAPAT BERIKUTNYA" x={60} y={250} size={38} out={T.usulan - 0.4} />
    <Bubble t={t} at={T.usulan - 0.15} text="Aku punya satu usulan." x={330} y={360} w={600} size={50} />
  </AbsoluteFill>
);

// ---------- 08 close: you are not alone ----------
const R8 = makeTimeline([
  k(S[7], {...REL, mouth: 'smile', brows: 'calm', tilt: 3}, 0.01),
  k(45.6, {tilt: -2, nod: 3}, 0.6),
  k(T.gak - 0.2, {...CHEST, eyeOpen: 0.8, tilt: 4, nod: 2}, 0.5),
  k(47.3, {nod: 0}, 0.3),
]);
const Sc08: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <Cam t={t} a={S[7]} b={S[8]} s0={1.04} s1={1.0} ox="30% 50%">
      <Wall c="#F3EBE0" />
      <Lingkaran t={t} at={S[7]} cx={380} cy={860} r={380} />
      <Char t={t} tl={R8} x={380} y={510} h={2100} shadow={false} />
    </Cam>
    <EdTitle t={t} at={T.kalau + 0.3} lines={['KAMU', 'GAK', {key: 'SENDIRIAN'}]} y={250} size={88} align="right" x={50} />
  </AbsoluteFill>
);

// ---------- 09 CTA ----------
const R9 = makeTimeline([
  k(S[8], {...REL, mouth: 'smile', lookX: -0.3}, 0.01),
  k(T.follow + 0.05, {armR: A(150, 20, 'open'), brows: 'up'}, 0.4, 'back'),
  k(T.follow + 0.45, {armR: {e: 42}}, 0.25), k(T.follow + 0.7, {armR: {e: 10}}, 0.25), k(T.follow + 0.95, {armR: {e: 40}}, 0.25),
  k(T.follow + 1.25, {armR: A(8, 4, 'clicker'), ...CHEST, brows: 'calm', lookX: 0}, 0.5),
  k(T.ngomong, {nod: 5}, 0.25), k(T.ngomong + 0.3, {nod: 0}, 0.3),
]);
const Sc09: React.FC<{t: number}> = ({t}) => {
  const click = pr(t, T.follow + 0.9, 0.5);
  const press = t > T.follow + 0.9 && t < T.follow + 1.2;
  const cur = pr(t, T.follow + 0.3, 0.55);
  return <AbsoluteFill>
    <Wall c={B.stage} />
    <Lingkaran t={t} at={S[8] + 0.15} cx={780} cy={1040} r={300} />
    <Pijak x={780} y={FLOOR_Y} w={380} />
    <Char t={t} tl={R9} x={780} y={standY(860)} h={860} talk={[T.follow - 0.05, T.end + 0.2]} />
    <div style={{position: 'absolute', right: 60, top: 250, textAlign: 'right', opacity: pr(t, S[8] + 0.4, 0.4)}}>
      <div style={{fontFamily: HEAD, fontSize: 60, color: B.floor, lineHeight: 0.95}}>BERARTI</div>
      <div style={{fontFamily: HEAD, fontSize: 60, color: B.orange, lineHeight: 0.95}}>ACADEMY</div>
    </div>
    <EdTitle t={t} at={T.ngomong - 0.5} lines={['KAMU YANG', {key: 'NGOMONG'}]} y={440} size={96} />
    <div style={{position: 'absolute', left: 60, top: 820, display: 'flex', alignItems: 'center', gap: 16, padding: '22px 34px', borderRadius: 24, background: press ? '#0A2817' : B.floor, color: 'white',
      fontFamily: BODY, fontWeight: 700, fontSize: 38, transform: `scale(${pr(t, T.follow, 0.4, back) * (press ? 0.95 : 1)})`, transformOrigin: 'left center', boxShadow: '6px 8px 0 #171A18'}}>
      <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.4}><circle cx={9} cy={8} r={4} /><path d="M2 21 Q9 13 16 21" /><path d="M19 8 L19 14 M16 11 L22 11" /></svg>
      {click > 0.6 ? 'Mengikuti' : 'Follow @firasbyzi'}
    </div>
    <div style={{position: 'absolute', left: 64, top: 960, fontFamily: BODY, fontWeight: 600, fontSize: 32, color: B.muted, opacity: pr(t, T.follow + 1.4, 0.4)}}>
      selangkah lebih <span style={{fontFamily: HEAD, color: B.floor}}>BERARTI</span>
    </div>
    <Cursor x={420 - 80 * (1 - cur)} y={880 + 140 * (1 - cur)} click={click} />
  </AbsoluteFill>;
};

// iris transitions on the three turning points; the rest are hard cuts on action with a short settle
const IRIS: Record<number, {cx: number; cy: number; color: string}> = {4: {cx: 540, cy: 900, color: '#1E2E4A'}, 5: {cx: 540, cy: 1000, color: B.orange}, 8: {cx: 400, cy: 860, color: B.orange}};

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const scenes = [Sc01, Sc02, Sc03, Sc04, Sc05, Sc06, Sc07, Sc08, Sc09];
  let idx = S.findIndex((s, i) => t >= s && t < S[i + 1]);
  if (idx < 0) idx = scenes.length - 1;
  const View = scenes[idx];
  const settle = idx === 0 || IRIS[idx] ? 1 : pr(t, S[idx], 0.32);
  return <AbsoluteFill style={{overflow: 'hidden', background: B.stage}}>
    <FontFaces /><BrandFonts />
    <AbsoluteFill style={{transform: `scale(${1.035 - 0.035 * settle})`}}><View t={t} /></AbsoluteFill>
    <Floor />
    <Subtitles t={t} />
    {Object.entries(IRIS).map(([i, v]) => <Iris key={i} t={t} at={S[Number(i)]} cx={v.cx} cy={v.cy} color={v.color} />)}
    <SfxTrack />
    {sound.musicFile && <Audio src={staticFile(sound.musicFile)} volume={musicGain} />}
    {project.voiceoverFile && <Audio src={staticFile(project.voiceoverFile)} />}
  </AbsoluteFill>;
};
