import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import project from './project.json';
import {SfxTrack} from './components/SfxTrack';
import {FontFaces} from './Fonts';
import {at, endOf} from './lib/words';
import {B, BODY, HEAD, FLOOR_Y} from './berarti/theme';
import {BrandFonts} from './berarti/BrandFonts';
import {Floor, Lingkaran, Subtitles, Pijak, Bubble, pr, back} from './berarti/UI';
import {Shot, StageSet, Floaty, MeetingSet, TableFront, NightSet, Sweat, QMarks, Burst, BandWipe, TABLE_TOP as TT, CamKey} from './berarti/Kit5';
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
const TABLE_TOP = TT;
const seatY = (h: number) => TABLE_TOP - 0.6 * h + 26;

// ---------- shared acting ----------
const TABLEH = {armR: A(-4, -60), armL: A(-4, -60)};
const typing = (t0: number, t1: number, gap = 0.17): Key[] => {
  const out: Key[] = [];
  for (let x = t0, i = 0; x < t1; x += gap, i++) out.push(k(x, {armR: {e: i % 2 ? -52 : -66}, armL: {e: i % 2 ? -66 : -52}}, gap));
  out.push(k(t1, {armR: {e: -60}, armL: {e: -60}}, 0.2));
  return out;
};
const headOf = (x: number, y: number, h: number) => ({x, y: y + 0.152 * h});
const Spark: React.FC<{t: number; at: number; x: number; y: number; c?: string}> = ({t, at: a, x, y, c}) => <Burst t={t} at={a} x={x} y={y} c={c} r={24} />;
const Card: React.FC<{t: number; children: React.ReactNode; i?: number}> = ({t, children, i = 0}) =>
  <div style={{position: 'absolute', inset: 0, transform: `translateY(${Math.sin(t * 1.6 + i) * 6}px) rotate(${Math.sin(t * 1.1 + i) * 0.6}deg)`}}>{children}</div>;

// ---------- 01 hook ----------
const R1 = makeTimeline([
  k(0, {...TOG, brows: 'worried', mouth: 'nervous', lookX: 0.7, nod: 3, turn: 0.3}, 0.01),
  k(0.6, {armR: {e: -44}, armL: {e: -26}}, 0.3), k(1.0, {armR: {e: -28}, armL: {e: -42}}, 0.3), k(1.4, {lookX: -0.2, lookY: 0.4, turn: 0}, 0.3), k(1.9, {lookX: 0.9, lookY: -0.1, turn: 0.3}, 0.3),
  k(T.idenya, {brows: 'up', mouth: 'o', nod: -2}, 0.3),
  k(T.tapi1, {crouch: 0.3, nod: 11, lean: 2, brows: 'sad', mouth: 'sad', lookY: 0.8, lookX: 0.2, armR: {e: -40}, armL: {e: -30}}, 0.7),
  k(4.6, {armR: {e: -30}, armL: {e: -40}}, 0.4), k(5.0, {lookX: 0.8, lookY: 0.2}, 0.3),
]);
const B1 = makeTimeline([
  k(0, {...TABLEH, mouth: 'calm', lookX: -0.4, turn: -0.2}, 0.01), ...typing(0.3, 2.0),
  k(T.idenya - 0.16, {crouch: 0.2, armR: A(-6, -10)}, 0.16, 'out'),
  k(T.idenya, {crouch: 0, armR: A(130, 40, 'point'), armL: A(8, 4), brows: 'up', mouth: 'smile', lookX: -0.2, lookY: -0.3}, 0.42, 'back'),
  k(T.tapi1, {armR: A(42, 48, 'open', -10), armL: A(30, 60, 'open'), brows: 'calm', lookX: -0.8, lookY: 0}, 0.45, 'back'),
  k(4.5, {armR: {s: 36, e: 56}, nod: 4}, 0.3), k(4.8, {nod: 0}, 0.3),
]);
const SA1 = makeTimeline([k(0, {...TABLEH, mouth: 'calm', lookX: 0.1, lookY: 0.5}, 0.01), ...typing(0.2, 2.3, 0.19),
  k(2.4, {lookX: 0.8, lookY: 0, turn: 0.3, mouth: 'smile', brows: 'up'}, 0.35), ...nods(T.tapi1 + 0.1, 3, 8)]);
const CAM1: CamKey[] = [{t: 0, s: 1.0, x: 540, y: 960}, {t: 0.01, s: 1.07, x: 540, y: 990, d: 2.2}, {t: T.idenya - 0.05, s: 1.32, x: 790, y: 900, d: 0.45, ease: 'out'},
  {t: T.tapi1 - 0.05, s: 1.42, x: 270, y: 960, d: 0.42, ease: 'out'}, {t: 4.5, s: 1.5, x: 255, y: 950, d: 1.0}];
const Sc01: React.FC<{t: number}> = ({t}) => {
  const hR = headOf(210, seatY(900), 900);
  return <AbsoluteFill>
    <Shot t={t} keys={CAM1}>
      <MeetingSet t={t} clock={[10, 0]} />
      <Bulb x={985} y={740} size={90} on={pr(t, T.dipakai + 0.15, 0.3)} opacity={pr(t, T.dipakai, 0.3, back)} />
      <Spark t={t} at={T.dipakai + 0.1} x={985} y={760} />
      <Char t={t} tl={SA1} look={SARI} x={560} y={seatY(900)} h={900} phase={1.3} shadow={false} />
      <Char t={t} tl={B1} look={BIMO} x={870} y={seatY(900)} h={900} phase={2.1} talk={[T.idenya, T.padahal - 0.2]} shadow={false} />
      <Char t={t} tl={R1} x={210} y={seatY(900)} h={900} shadow={false} filter={`saturate(${1 - 0.3 * pr(t, T.tapi1, 0.6)})`} />
      <Sweat t={t} at={T.tapi1 + 0.3} out={S[1]} x={hR.x + 62} y={hR.y - 80} />
      <TableFront laptops={[560]} mugs={[330, 990]} />
    </Shot>
    <div style={{opacity: 1 - pr(t, T.tapi1 - 0.3, 0.3)}}><Timer t={t} at={0} dur={2.2} x={860} y={300} r={110} /></div>
    <EdTitle t={t} at={0.05} label="DI RAPAT" lines={['10 MENIT', {key: 'DIAM'}]} y={240} size={96} out={T.tapi1 - 0.25} card />
    <EdTitle t={t} at={T.tapi1} label="IDENYA DIPAKAI" lines={['BUKAN DIA', {key: 'YANG NGOMONG'}]} y={240} size={84} card />
  </AbsoluteFill>;
};

// ---------- 02 problem ----------
const R2 = makeTimeline([
  k(S[1], {...REL, brows: 'calm', mouth: 'calm', lookX: -0.8, lookY: -0.6, tilt: -3}, 0.01),
  k(6.4, {armR: A(30, 70, 'relaxed'), lookX: -0.6}, 0.4), k(6.9, {armR: A(8, 4), lookX: 0, lookY: 0, tilt: 0}, 0.5),
  k(T.ide9 - 0.1, {...CHIN, brows: 'think', mouth: 'side', lookX: 0.7, lookY: -0.8, tilt: 5}, 0.5),
  k(8.8, {crouch: 0.25, nod: 5}, 0.14, 'out'),
  k(8.94, {crouch: 0, nod: -4, tilt: 0, armR: A(130, 40, 'point'), armL: A(8, 4), brows: 'up', mouth: 'smile', lookX: 0.5, lookY: -0.6}, 0.45, 'back'),
  k(9.6, {liftR: 14}, 0.15), k(9.75, {liftR: 0}, 0.15),
  k(T.tapi - 0.05, {armR: A(4, 2), brows: 'worried', mouth: 'pressed', lookX: -0.3, lookY: 0.5, nod: 4}, 0.55),
  k(11.4, {lookX: 0.5, lookY: -0.4}, 0.4), k(12.3, {lookX: -0.2, lookY: 0.5, armR: A(-10, -90), armL: A(8, 4)}, 0.5),
  k(T.nanti - 0.1, {...TOG, crouch: 0.35, nod: 10, tilt: -5, lean: 2, brows: 'worried', mouth: 'nervous', lookX: -0.6, lookY: 0.6}, 0.4, 'back'),
  k(13.9, {armR: {e: -44}, armL: {e: -26}}, 0.3), k(14.25, {armR: {e: -28}, armL: {e: -42}}, 0.3),
]);
const CAM2: CamKey[] = [{t: 0, s: 1.0, x: 540, y: 960}, {t: S[1] + 0.01, s: 1.05, x: 520, y: 980, d: 2.2}, {t: T.ide9 - 0.1, s: 1.18, x: 620, y: 830, d: 0.6, ease: 'out'},
  {t: T.tapi, s: 1.1, x: 480, y: 900, d: 1.4}, {t: T.nanti - 0.15, s: 1.3, x: 610, y: 790, d: 0.35, ease: 'out'}, {t: 13.9, s: 1.34, x: 615, y: 790, d: 0.8}];
const Sc02: React.FC<{t: number}> = ({t}) => {
  const dim = pr(t, T.tapi, 0.8);
  const h = 920, y = standY(h), hd = headOf(400, y, h);
  return <AbsoluteFill>
    <Shot t={t} keys={CAM2} shakes={[[T.nanti - 0.1, 8]]}>
      <StageSet t={t} glow={dim > 0.5 ? '#E8E6F0' : '#FFFFFF'} />
      <Pijak x={400} y={FLOOR_Y} w={400} />
      <Char t={t} tl={R2} x={400} y={y} h={h} filter={`saturate(${1 - 0.25 * dim})`} />
      <Sweat t={t} at={T.nanti + 0.1} out={S[2]} x={hd.x + 66} y={hd.y - 86} />
      <Cloud t={t} at={T.ide9 - 0.2} x={520} y={330} w={480} h={290} out={T.nanti - 0.25}>
        <div style={{position: 'relative', width: 280, height: 170, transform: `translateX(${Math.sin(t * 40) * 3 * dim * (1 - pr(t, T.tapi + 0.4, 0.2))}px)`}}>
          <Bulb x={80} y={100} size={115} on={1 - 0.9 * dim} />
          <div style={{position: 'absolute', left: 160, top: 26, transform: `rotate(${8 + 10 * dim}deg)`, opacity: 1 - 0.5 * dim}}><DocIcon size={100} /></div>
        </div>
      </Cloud>
      <Spark t={t} at={8.95} x={760} y={470} />
      <Cloud t={t} at={T.nanti - 0.1} x={480} y={330} w={470} h={290}>
        <div style={{fontFamily: HEAD, fontSize: 40, color: B.ink, textAlign: 'center', lineHeight: 1.05, textTransform: 'uppercase'}}>Nanti dibilang<br /><span style={{color: B.orange, fontSize: 56}}>sok tahu...</span></div>
      </Cloud>
    </Shot>
    <div style={{opacity: 1 - pr(t, T.tapi - 0.2, 0.3)}}><ClockCard t={t} at={S[1] + 0.15} x={60} y={250} time="09:00" label="PAGI" /></div>
  </AbsoluteFill>;
};

// ---------- 03 hesitation ----------
const R3 = makeTimeline([
  k(S[2], {...TOG, brows: 'worried', mouth: 'nervous', lookX: 0.2, lookY: 0.3, nod: 4}, 0.01),
  k(T.jadi + 0.05, {crouch: 0.3, armR: A(-8, -20, 'open'), lookY: -0.2}, 0.18, 'out'),
  k(T.jadi + 0.23, {crouch: 0, armR: A(118, 46, 'open'), brows: 'up', mouth: 'o', lookX: 0.5, lookY: -0.3, nod: 0}, 0.4, 'back'),
  k(T.jadi + 0.7, {armR: {s: 110, e: 58}, tilt: -4, brows: 'worried', mouth: 'pressed'}, 0.25), k(T.jadi + 0.95, {armR: {s: 114, e: 50}}, 0.2),
  k(T.jadi + 1.15, {armR: A(4, 2), armL: A(6, 4), crouch: 0.45, lean: 3, nod: 12, brows: 'sad', mouth: 'sad', lookY: 1, lookX: -0.3}, 0.75),
]);
const CAM3: CamKey[] = [{t: 0, s: 1.5, x: 430, y: 800}, {t: T.jadi + 0.2, s: 1.42, x: 400, y: 760, d: 0.5, ease: 'out'}, {t: T.jadi + 1.1, s: 1.06, x: 560, y: 940, d: 0.7}];
const Sc03: React.FC<{t: number}> = ({t}) => {
  const arrow = pr(t, T.jadi + 1.15, 0.6);
  const stamp = pr(t, T.diam2 - 0.15, 0.35, back);
  return <AbsoluteFill>
    <Shot t={t} keys={CAM3} shakes={[[T.diam2 - 0.1, 16]]}>
      <StageSet t={t} glow="#ECEAF0" />
      <Pijak x={420} y={FLOOR_Y} w={400} />
      <Char t={t} tl={R3} x={420} y={standY(920)} h={920} />
    </Shot>
    <svg style={{position: 'absolute', left: 640, top: 560}} width={300} height={420} viewBox="0 0 300 420">
      <path d="M60 30 Q260 80 200 360" fill="none" stroke={B.floor} strokeWidth={20} strokeLinecap="round" strokeDasharray={460} strokeDashoffset={460 * (1 - arrow)} />
      <path d="M150 330 L200 380 L250 320" fill="none" stroke={B.floor} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" opacity={arrow > 0.95 ? 1 : 0} />
    </svg>
    {stamp > 0 && <div style={{position: 'absolute', left: 520, top: 1080, padding: '6px 34px 18px', background: B.orange, borderRadius: 14, fontFamily: HEAD, fontSize: 170, color: 'white', lineHeight: 1,
      boxShadow: '10px 12px 0 #171A18', transform: `rotate(-6deg) scale(${0.6 + 0.4 * stamp})`, opacity: Math.min(1, stamp * 2)}}>DIAM</div>}
    <Burst t={t} at={T.diam2 - 0.1} x={780} y={1170} r={150} n={12} />
  </AbsoluteFill>;
};

// ---------- 04 agitate ----------
const R4 = makeTimeline([
  k(S[3], {...TOG, crouch: 0.3, nod: 8, brows: 'sad', mouth: 'sad', lookX: 0.8, turn: 0.3}, 0.01),
  k(T.mirip, {brows: 'worried', mouth: 'pressed', lookX: 0.9, nod: 4}, 0.4),
  k(T.semua + 0.2, {nod: 14, lookY: 0.8, lookX: 0.2, crouch: 0.4, brows: 'sad', mouth: 'sad'}, 0.6),
]);
const B4 = makeTimeline([
  k(S[3], {...TABLEH, mouth: 'calm', lookX: 0.4, turn: 0.2}, 0.01),
  k(T.temannya - 0.1, {armR: A(42, 48, 'open', -10), armL: A(30, 60, 'open'), brows: 'up', mouth: 'smile', lookX: 0.6}, 0.45, 'back'),
  k(18.3, {armL: {s: 40, e: 40}, nod: 3}, 0.3), k(18.6, {armL: {s: 30, e: 60}, nod: 0}, 0.3),
  k(T.mirip - 0.16, {crouch: 0.2}, 0.16, 'out'),
  k(T.mirip, {crouch: 0, armR: A(130, 40, 'point'), armL: A(8, 4), lookY: -0.4}, 0.42, 'back'),
  k(T.semua, {armR: A(50, 30, 'open'), armL: A(50, 30, 'open'), lookY: 0, lean: -2}, 0.45, 'back'),
]);
const SA4 = makeTimeline([k(S[3], {...TABLEH, mouth: 'calm', lookX: -0.8, turn: -0.3}, 0.01), k(T.mirip, {brows: 'up', mouth: 'smile'}, 0.3), ...nods(T.semua, 3, 10)]);
const NA4 = makeTimeline([k(S[3], {...TABLEH, mouth: 'calm', lookX: -0.2, lookY: 0.5}, 0.01), ...typing(S[3] + 0.1, T.temannya + 0.4),
  k(T.temannya + 0.5, {lookX: -0.9, lookY: 0, turn: -0.3}, 0.3), k(T.mirip + 0.1, {brows: 'up', mouth: 'smile', ...TOG}, 0.35), ...nods(T.semua + 0.12, 3, 9)]);
const CAM4: CamKey[] = [{t: 0, s: 1.0, x: 540, y: 960}, {t: T.temannya - 0.1, s: 1.22, x: 470, y: 890, d: 0.6, ease: 'out'}, {t: T.semua - 0.15, s: 1.0, x: 560, y: 960, d: 0.5},
  {t: T.angguk - 0.25, s: 1.5, x: 185, y: 930, d: 1.0}];
const Sc04: React.FC<{t: number}> = ({t}) => {
  const up = pr(t, T.temannya - 0.3, 0.5, back);
  const sy = seatY(860);
  return <AbsoluteFill>
    <Shot t={t} keys={CAM4}>
      <MeetingSet t={t} clock={[10, 20]} />
      <Bulb x={260} y={600} size={90} on={pr(t, T.mirip + 0.1, 0.3)} opacity={pr(t, T.mirip, 0.3, back)} />
      <Spark t={t} at={T.mirip + 0.05} x={260} y={620} />
      <Char t={t} tl={SA4} look={SARI} x={720} y={sy} h={860} phase={0.7} shadow={false} />
      <Char t={t} tl={NA4} look={NADIA} x={975} y={sy} h={860} phase={1.9} shadow={false} />
      <Char t={t} tl={B4} look={BIMO} x={455} y={sy - 120 * up} h={860} phase={2.4} talk={[T.temannya, T.semua - 0.1]} shadow={false} />
      <Char t={t} tl={R4} x={150} y={sy} h={860} shadow={false} filter={`saturate(${0.75 - 0.25 * pr(t, T.semua, 0.6)}) brightness(${1 - 0.06 * pr(t, T.semua, 0.6)})`} />
      <TableFront laptops={[975]} mugs={[620, 260]} />
      {[[720, 700, 0], [975, 700, 0.12], [455, 560, 0.3]].map(([x, y, d], i) => <Icon key={i} kind="check" x={x - 40} y={y} size={80} p={pr(t, T.semua + 0.2 + d, 0.35, back)} />)}
    </Shot>
    <EdTitle t={t} at={T.semua - 0.1} label="IDE YANG MIRIP" lines={['SEMUA', {key: 'MENGANGGUK'}]} y={240} size={92} card />
  </AbsoluteFill>;
};

// ---------- 05 turn ----------
const R5 = makeTimeline([
  k(S[4], {...REL, brows: 'sad', mouth: 'calm', lookX: 0.7, lookY: -0.4, tilt: 3}, 0.01),
  k(22.4, {liftR: 22, shiftX: 20}, 0.25, 'out'), k(22.65, {liftR: 0, shiftX: 34}, 0.2),
  k(22.9, {...CHIN, brows: 'think', mouth: 'side', lookX: 0.6, lookY: -0.8, tilt: 6}, 0.6),
  k(T.aku, {tilt: 2, lookX: 0.3}, 0.5), k(T.atau, {tilt: -3, lookX: 0.7}, 0.5),
  k(T.takut - 0.1, {lean: -3, brows: 'worried', mouth: 'o', armR: A(-8, -70), armL: A(8, 4), lookX: 0.4, lookY: -0.5, crouch: 0.1}, 0.22, 'out'),
]);
const CAM5: CamKey[] = [{t: 0, s: 1.14, x: 420, y: 880}, {t: S[4] + 0.01, s: 1.0, x: 540, y: 960, d: 2.6}, {t: T.aku - 0.1, s: 1.12, x: 600, y: 820, d: 0.6, ease: 'out'},
  {t: T.takut - 0.1, s: 1.28, x: 600, y: 770, d: 0.25, ease: 'out'}];
const Sc05: React.FC<{t: number}> = ({t}) => {
  const h = 920, y = standY(h);
  return <AbsoluteFill>
    <Shot t={t} keys={CAM5} shakes={[[T.takut - 0.05, 9]]}>
      <NightSet t={t} />
      <Char t={t} tl={R5} x={330} y={y} h={h} filter="brightness(0.86) saturate(0.9)" />
      <QMarks t={t} at={T.atau} out={T.takut + 0.6} x={380} y={560} />
      <Cloud t={t} at={T.aku - 0.1} x={410} y={250} w={560} h={400} paper>
        <div style={{fontFamily: HEAD, fontSize: 54, color: B.ink, textAlign: 'center', lineHeight: 1.0, transform: 'rotate(-4deg)'}}>
          <div style={{opacity: pr(t, T.aku + 0.3, 0.3)}}>RENDAH HATI</div>
          <div style={{opacity: pr(t, T.atau - 0.05, 0.3), fontSize: 46}}>ATAU</div>
          <div style={{color: B.orange, fontSize: 86, opacity: pr(t, T.takut - 0.1, 0.3), transform: `scale(${0.8 + 0.2 * pr(t, T.takut - 0.1, 0.35, back)}) rotate(${Math.sin(t * 30) * 2 * (1 - pr(t, T.takut + 0.4, 0.3))}deg)`}}>TAKUT?</div>
        </div>
      </Cloud>
    </Shot>
    <Pill t={t} at={S[4] + 0.35} text="MALAMNYA" x={60} y={250} size={40} out={T.aku - 0.4} />
  </AbsoluteFill>;
};

// ---------- 06 solution ----------
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
  k(T.menawarkan, {armL: A(42, 48, 'open', -10), armR: A(42, 48, 'open', -10), brows: 'calm', lean: 2, liftL: 16}, 0.45, 'back'),
  k(T.menawarkan + 0.45, {liftL: 0}, 0.2),
  k(36.5, {nod: 5}, 0.3), k(36.8, {nod: 0, lean: 0}, 0.3),
  k(T.dua - 0.1, {armR: A(0, -60, 'fist'), armL: A(0, -60), tilt: 0}, 0.45, 'back'),
  k(T.bareng - 0.6, {...CHEST, armR: A(8, 4, 'clicker'), mouth: 'smile', tilt: 4, nod: 3, eyeOpen: 0.8}, 0.5),
  k(T.bareng + 0.4, {nod: 0}, 0.4),
]);
const CAM6: CamKey[] = [{t: 0, s: 1.3, x: 540, y: 880}, {t: T.paham - 0.06, s: 1.0, x: 540, y: 960, d: 0.5, ease: 'back'}, {t: T.rendah - 0.05, s: 1.02, x: 500, y: 960, d: 1.0},
  {t: T.sedangkan, s: 1.02, x: 580, y: 960, d: 1.0}, {t: T.berani - 0.05, s: 1.2, x: 560, y: 900, d: 0.3, ease: 'out'}, {t: T.menawarkan, s: 1.0, x: 540, y: 960, d: 0.45},
  {t: T.dua, s: 1.04, x: 540, y: 960, d: 1.0}, {t: T.bareng - 0.6, s: 1.22, x: 540, y: 880, d: 0.8}];
const Sc06: React.FC<{t: number}> = ({t}) => {
  const merge = pr(t, T.dua - 0.1, 0.5);
  const gone = pr(t, T.bareng - 0.7, 0.35);
  return <AbsoluteFill>
    <Shot t={t} keys={CAM6} shakes={[[T.berani, 6]]}>
      <StageSet t={t} />
      <Lingkaran t={t} at={T.paham - 0.15} cx={540} cy={1040} r={340} />
      <Pijak x={540} y={FLOOR_Y} w={400} />
      <Char t={t} tl={R6} x={540} y={standY(860)} h={860} />
      {[[300, 760, 0], [800, 700, 0.1], [260, 1080, 0.2], [840, 1040, 0.3]].map(([x, y, d], i) => <Spark key={i} t={t} at={T.paham + d} x={x} y={y} c={i % 2 ? B.floor : B.orange} />)}
      <Burst t={t} at={T.berani + 0.1} x={720} y={820} r={40} />
    </Shot>
    <Pill t={t} at={S[5] + 0.1} text="PELAN-PELAN PAHAM" x={60} y={250} size={38} out={T.rendah - 0.25} />
    <div style={{position: 'absolute', inset: 0, opacity: 1 - gone, transform: `translateY(${-gone * 40}px) scale(${1 - gone * 0.1})`}}>
      <Card t={t} i={0}><EqCard t={t} at={T.rendah - 0.05} x={40 + merge * 50} y={230} w={470} color={B.floor} icon={<PeopleIcon />} title="RENDAH HATI" body="Cara kita memandang orang" /></Card>
      <Card t={t} i={2}><EqCard t={t} at={T.sedangkan + 0.05} x={570 - merge * 50} y={230} w={470} color={B.orange} icon={<MegaIcon />} title="PERCAYA DIRI" body="Berani menawarkan yang kita punya" /></Card>
      <Icon kind="plus" x={540} y={410} size={110} color={B.ink} p={pr(t, T.dua - 0.2, 0.4, back)} />
    </div>
    <EdTitle t={t} at={T.bareng - 0.55} label="DUA-DUANYA" lines={['BISA', {key: 'JALAN BARENG'}]} y={260} size={110} />
  </AbsoluteFill>;
};

// ---------- 07 step ----------
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
  k(42.3, {nod: -3, lookY: -0.2}, 0.4), k(42.6, {nod: 0}, 0.2),
  k(T.usulan - 0.45, {crouch: 0.22, armR: A(-8, -20, 'open')}, 0.15, 'out'),
  k(T.usulan - 0.3, {crouch: 0, armR: A(155, 16, 'open'), brows: 'up', mouth: 'smile', lookX: 0.8, turn: 0.3}, 0.42, 'back'),
  k(T.usulan + 0.35, {armR: A(8, 4, 'clicker'), armL: A(42, 48, 'open', -10), brows: 'calm', lean: -1}, 0.5, 'back'),
  k(44.3, {nod: 4}, 0.25), k(44.55, {nod: 0}, 0.25),
]);
const SA7 = makeTimeline([k(S[6], {...TABLEH, mouth: 'calm', lookX: -0.2, lookY: 0.5}, 0.01), ...typing(S[6] + 0.1, 42.0),
  k(42.1, {lookX: -0.9, lookY: 0, turn: -0.4}, 0.35), k(T.usulan + 0.2, {brows: 'up', mouth: 'smile', ...TOG}, 0.3), ...nods(T.usulan + 0.8, 2, 8)]);
const B7 = makeTimeline([k(S[6], {...TABLEH, mouth: 'calm', lookX: -0.9, turn: -0.4}, 0.01), k(T.usulan + 0.3, {brows: 'up', mouth: 'open'}, 0.3),
  k(T.usulan + 0.9, {mouth: 'smile', armL: A(40, 110, 'fist')}, 0.4, 'back')]);
const CAM7: CamKey[] = [{t: 0, s: 1.15, x: 240, y: 960}, {t: T.rapat2 + 0.05, s: 1.15, x: 380, y: 960, d: 1.4}, {t: T.usulan - 0.45, s: 1.35, x: 330, y: 860, d: 0.35, ease: 'out'},
  {t: T.usulan + 0.4, s: 1.0, x: 540, y: 960, d: 0.6}, {t: 44.2, s: 1.04, x: 540, y: 960, d: 0.6}];
const Sc07: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <Shot t={t} keys={CAM7}>
      <MeetingSet t={t} clock={[10, 0]} />
      <Lingkaran t={t} at={T.kalimat - 0.2} cx={300} cy={1010} r={300} />
      <Char t={t} tl={SA7} look={SARI} x={700} y={seatY(860)} h={860} phase={0.4} shadow={false} />
      <Char t={t} tl={B7} look={BIMO} x={950} y={seatY(860)} h={860} phase={1.6} shadow={false} />
      <TableFront x0={520} laptops={[700]} mugs={[880]} />
      <Char t={t} tl={R7} x={150} y={standY(900)} h={900} talk={[T.usulan - 0.05, T.kalau - 0.2]} />
      {[[660, 700, 0], [910, 700, 0.12]].map(([x, y, d], i) => <Icon key={i} kind="check" x={x} y={y} size={76} p={pr(t, T.usulan + 0.9 + d, 0.35, back)} />)}
      <Burst t={t} at={T.usulan - 0.25} x={230} y={430} r={40} />
    </Shot>
    <Pill t={t} at={S[6] + 0.1} n="01" text="RAPAT BERIKUTNYA" x={60} y={250} size={38} out={T.usulan - 0.4} />
    <Bubble t={t} at={T.usulan - 0.15} text="Aku punya satu usulan." x={330} y={360} w={600} size={50} />
  </AbsoluteFill>
);

// ---------- 08 close ----------
const R8 = makeTimeline([
  k(S[7], {...REL, mouth: 'smile', brows: 'calm', tilt: 3}, 0.01),
  k(45.6, {tilt: -2, nod: 3}, 0.6),
  k(T.gak - 0.2, {...CHEST, eyeOpen: 0.8, tilt: 4, nod: 2}, 0.5),
  k(47.3, {nod: 0}, 0.3),
]);
const Sc08: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <Shot t={t} keys={[{t: 0, s: 1.0, x: 540, y: 960}, {t: S[7] + 0.01, s: 1.08, x: 500, y: 920, d: 3.0}]}>
      <div style={{position: 'absolute', left: -700, right: -700, top: -700, bottom: -700, background: '#F3EBE0'}} />
      <Floaty t={t} />
      <Lingkaran t={t} at={S[7]} cx={380} cy={860} r={380} />
      <Char t={t} tl={R8} x={380} y={510} h={2100} shadow={false} />
    </Shot>
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
    <Shot t={t} keys={[{t: 0, s: 1.25, x: 760, y: 860}, {t: S[8] + 0.01, s: 1.0, x: 540, y: 960, d: 1.3}]}>
      <StageSet t={t} />
      <Lingkaran t={t} at={S[8] + 0.15} cx={780} cy={1040} r={300} />
      <Pijak x={780} y={FLOOR_Y} w={380} />
      <Char t={t} tl={R9} x={780} y={standY(860)} h={860} talk={[T.follow - 0.05, T.end + 0.2]} />
    </Shot>
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
    <Burst t={t} at={T.follow + 0.95} x={250} y={870} r={120} n={10} />
    <div style={{position: 'absolute', left: 64, top: 960, fontFamily: BODY, fontWeight: 600, fontSize: 32, color: B.muted, opacity: pr(t, T.follow + 1.4, 0.4)}}>
      selangkah lebih <span style={{fontFamily: HEAD, color: B.floor}}>BERARTI</span>
    </div>
    <Cursor x={420 - 80 * (1 - cur)} y={880 + 140 * (1 - cur)} click={click} />
  </AbsoluteFill>;
};

// ---------- transitions: a different one at every scene change ----------
type Tr = {type: 'whip' | 'zoom' | 'band' | 'iris'; cx?: number; cy?: number; color?: string};
const TR: Record<number, Tr> = {
  1: {type: 'whip'}, 2: {type: 'zoom', cx: 252, cy: 846}, 3: {type: 'band', color: B.floor}, 4: {type: 'iris', cx: 495, cy: 961, color: '#1E2E4A'},
  5: {type: 'iris', cx: 190, cy: 890, color: B.orange}, 6: {type: 'whip'}, 7: {type: 'zoom', cx: 240, cy: 714}, 8: {type: 'band', color: B.orange},
};
const WH = 0.17, ZO = 0.24, ZI = 0.36;
const ease3 = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const scenes = [Sc01, Sc02, Sc03, Sc04, Sc05, Sc06, Sc07, Sc08, Sc09];
  let idx = S.findIndex((s, i) => t >= s && t < S[i + 1]);
  if (idx < 0) idx = scenes.length - 1;
  const View = scenes[idx];
  const tr = TR[idx], nx = TR[idx + 1], b = S[idx], bn = S[idx + 1];
  const Next = scenes[idx + 1], Prev = scenes[idx - 1];
  let body: React.ReactNode = <AbsoluteFill><View t={t} /></AbsoluteFill>;
  let flash = 0;
  if (nx?.type === 'whip' && t >= bn - WH && Next) {
    const e = ease3(clamp01((t - (bn - WH)) / (2 * WH))); const bl = Math.sin(e * Math.PI) * 14;
    body = <><AbsoluteFill style={{transform: `translateX(${-e * 1080}px)`, filter: `blur(${bl}px)`}}><View t={t} /></AbsoluteFill>
      <AbsoluteFill style={{transform: `translateX(${(1 - e) * 1080}px)`, filter: `blur(${bl}px)`}}><Next t={t} /></AbsoluteFill></>;
  } else if (tr?.type === 'whip' && t < b + WH && Prev) {
    const e = ease3(clamp01((t - (b - WH)) / (2 * WH))); const bl = Math.sin(e * Math.PI) * 14;
    body = <><AbsoluteFill style={{transform: `translateX(${-e * 1080}px)`, filter: `blur(${bl}px)`}}><Prev t={t} /></AbsoluteFill>
      <AbsoluteFill style={{transform: `translateX(${(1 - e) * 1080}px)`, filter: `blur(${bl}px)`}}><View t={t} /></AbsoluteFill></>;
  } else if (nx?.type === 'zoom' && t >= bn - ZO) {
    const e = Math.pow(clamp01((t - (bn - ZO)) / ZO), 2);
    body = <AbsoluteFill style={{transform: `scale(${1 + e * 2.2})`, transformOrigin: `${nx.cx}px ${nx.cy}px`, filter: `blur(${e * 10}px)`}}><View t={t} /></AbsoluteFill>;
    flash = e * 0.5;
  } else if (tr?.type === 'zoom' && t < b + ZI) {
    const p = clamp01((t - b) / ZI); const e = 1 - Math.pow(1 - p, 3);
    body = <AbsoluteFill style={{transform: `scale(${1.35 - 0.35 * e})`, filter: `blur(${(1 - e) * 9}px)`}}><View t={t} /></AbsoluteFill>;
    flash = (1 - p) * 0.5;
  }
  return <AbsoluteFill style={{overflow: 'hidden', background: B.stage}}>
    <FontFaces /><BrandFonts />
    {body}
    {flash > 0 && <AbsoluteFill style={{background: 'white', opacity: flash}} />}
    {Object.entries(TR).map(([i, v]) => v.type === 'band' ? <BandWipe key={i} t={t} at={S[Number(i)]} color={v.color!} accent={v.color === B.orange ? B.floor : B.orange} />
      : v.type === 'iris' ? <Iris key={i} t={t} at={S[Number(i)]} cx={v.cx!} cy={v.cy!} color={v.color} /> : null)}
    <Floor />
    <Subtitles t={t} />
    <SfxTrack />
    {sound.musicFile && <Audio src={staticFile(sound.musicFile)} volume={musicGain} />}
    {project.voiceoverFile && <Audio src={staticFile(project.voiceoverFile)} />}
  </AbsoluteFill>;
};
