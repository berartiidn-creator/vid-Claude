import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import project from './project.json';
import {SfxTrack} from './components/SfxTrack';
import {FontFaces} from './Fonts';
import {at, endOf} from './lib/words';
import {B, BODY, HEAD} from './berarti/theme';
import {BrandFonts} from './berarti/BrandFonts';
import {Character, Look} from './berarti/Character';
import {Headline, NumCard, Bubble, Floor, Lingkaran, Pijak, Subtitles, pr, back} from './berarti/UI';
import {Bulb, RoomBack, RoomTable, Office, OfficeDesk, Bedroom, BedFront, StageBg, Stairs} from './berarti/Sets';

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

// colleagues (generic, original)
const HIJAB: Look = {hair: 'hijab', hijab: '#B5835A', top: '#C9A27E', topDark: '#A88360', blazer: false, clicker: false, skin: '#E9B892', pants: '#5A4636'};
const CURLY: Look = {hair: 'curly', hairColor: '#1F1712', top: '#3F4A6B', topDark: '#323B57', blazer: false, clicker: false, skin: '#B97F58', pants: '#2F3646', glasses: true};
const SHORT: Look = {hair: 'short', hairColor: '#2A1E17', top: '#8A4B3A', topDark: '#6E3B2E', blazer: false, clicker: false, skin: '#D69C73', pants: '#3A3F4A'};

// ---------- timing from the real voice-over ----------
const T = {
  idenya: at('Idenya', 0, 2.3), dipakai: at('dipakai', 0, 2.7), padahal: at('Padahal', 0, 5.6), jam: at('jam 9', 0, 6.8), tapi: at('Tapi satu', 0, 10.1),
  nanti: at('Nanti', 0, 13.0), jadi: at('Jadi dia', 0, 14.8), diam2: at('diam', 1, 16.3), sampai: at('Sampai', 0, 17.0), mirip: at('mirip', 0, 18.9),
  angguk: at('mengangguk', 0, 21.0), malam: at('Malamnya', 0, 21.8), aku: at('Aku ini', 0, 24.9), takut: at('takut', 0, 27.3), pelan: at('Pelan-pelan', 0, 28.1),
  rendah: at('Rendah hati itu', 0, 29.6), sedangkan: at('sedangkan', 0, 32.8), dua: at('Dua-duanya', 0, 37.2), bareng: at('bareng', 0, 39.5),
  rapat2: at('Rapat berikutnya', 0, 40.4), usulan: at('Aku punya', 0, 43.3), kalau: at('Kalau kamu', 0, 44.9), follow: at('Follow', 0, 47.9),
  end: endOf('kamu yang ngomong', 0, 51.3),
};
const S = [0, T.idenya - 0.1, T.padahal - 0.1, T.tapi - 0.1, T.jadi - 0.1, T.sampai - 0.1, T.malam - 0.1, T.aku - 0.1, T.pelan - 0.1,
  T.rendah - 0.1, T.dua - 0.1, T.rapat2 - 0.1, T.kalau - 0.1, T.follow - 0.1, 999];

const Cam: React.FC<{t: number; a: number; b: number; s0: number; s1: number; ox?: string; children: React.ReactNode}> = ({t, a, b, s0, s1, ox = '50% 55%', children}) => {
  const p = Math.max(0, Math.min(1, (t - a) / Math.max(0.1, b - a)));
  const e = p * p * (3 - 2 * p);
  return <AbsoluteFill style={{transform: `scale(${s0 + (s1 - s0) * e})`, transformOrigin: ox}}>{children}</AbsoluteFill>;
};

// ---------- scenes ----------
const MeetingTable: React.FC<{t: number; rakaMood: 'nervous' | 'sad' | 'smile' | 'talk'; rightTalk?: boolean; nodAt?: number; rakaLook?: 'down' | 'up'; raka?: boolean}> =
  ({t, rakaMood, rightTalk, nodAt, rakaLook, raka = true}) => {
  const nod = (k: number) => nodAt !== undefined && t > nodAt ? Math.sin((t - nodAt - k * 0.15) * 7) * 6 : 0;
  return <>
    <Character t={t} x={200} y={810} height={640} look={HIJAB} seated mood={nodAt !== undefined && t > nodAt ? 'smile' : 'calm'} nod={nod(0)} />
    {raka && <Character t={t} x={540} y={810} height={640} seated pose="hold" mood={rakaMood} tilt={rakaLook === 'down' ? 8 : 0} />}
    <Character t={t} x={880} y={810} height={640} look={CURLY} seated pose={rightTalk ? 'offer' : 'stand'} fromPose="stand" poseAt={T.dipakai} flip
      mood={rightTalk ? 'talk' : nodAt !== undefined && t > nodAt ? 'smile' : 'calm'} nod={nod(2)} />
  </>;
};

const Scene1: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <Cam t={t} a={0} b={S[1]} s0={1.3} s1={1.18} ox="50% 62%">
      <RoomBack clock={[10, Math.min(10, t * 5)]} />
      <MeetingTable t={t} rakaMood="nervous" />
      <RoomTable />
    </Cam>
    <Headline t={t} at={-1} label="PERNAH NGALAMIN INI?" lines={['10 menit', 'diam di rapat.']} key1="diam" />
  </AbsoluteFill>
);

const Scene2: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <Cam t={t} a={S[1]} b={S[2]} s0={1.04} s1={1.0}>
      <RoomBack clock={[10, 10]} />
      <MeetingTable t={t} rakaMood="sad" rightTalk />
      <RoomTable />
      <Bulb x={880} y={760} size={110} on={pr(t, T.dipakai + 0.2, 0.3)} opacity={pr(t, T.dipakai, 0.3)} />
      <Bubble t={t} at={T.dipakai} text="Gimana kalau kita..." x={500} y={1010} w={360} tail="right" size={34} />
    </Cam>
    <Headline t={t} at={S[1]} label="RAPAT TIM" lines={['idenya dipakai', 'orang lain.']} key1="dipakai" />
  </AbsoluteFill>
);

const Scene3: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <Cam t={t} a={S[2]} b={S[3]} s0={1.0} s1={1.08} ox="50% 70%">
      <Office />
      <Character t={t} x={420} y={800} height={640} seated pose="think" mood="think" />
      <OfficeDesk />
      <Bulb x={420} y={770} size={120} on={pr(t, T.jam + 0.6, 0.3)} opacity={pr(t, T.jam + 0.3, 0.3)} />
    </Cam>
    <Headline t={t} at={S[2]} label="JAM 09.00" lines={['idenya', 'sudah ada.']} key1="ada." />
  </AbsoluteFill>
);

const Scene4: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: B.night}}>
    <Cam t={t} a={S[3]} b={S[4]} s0={1.0} s1={1.06} ox="50% 40%">
      <Character t={t} x={540} y={560} height={1900} pose="hold" mood="nervous" shadow={false} />
    </Cam>
    <Headline t={t} at={S[3]} label="SATU PIKIRAN" lines={['yang bikin', 'nahan diri.']} key1="nahan" color="white" out={T.nanti - 0.3} />
    <Bubble t={t} at={T.nanti - 0.1} text="Nanti dibilang sok tahu..." x={110} y={260} w={600} thought size={44} />
  </AbsoluteFill>
);

const Scene5: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <Cam t={t} a={S[4]} b={S[5]} s0={1.0} s1={1.12} ox="50% 62%">
      <RoomBack clock={[10, 10]} dim={0.35 * pr(t, S[4], 0.5)} />
      <MeetingTable t={t} rakaMood="sad" rakaLook="down" />
      <RoomTable />
    </Cam>
    <div style={{position: 'absolute', left: 80, top: 260, fontFamily: HEAD, fontWeight: 900, fontSize: 230, color: B.orange, letterSpacing: -4,
      opacity: pr(t, T.jadi + 0.3, 0.3), transform: `scale(${0.9 + 0.1 * pr(t, T.jadi + 0.3, 0.4, back)})`, transformOrigin: 'left center'}}>DIAM.</div>
  </AbsoluteFill>
);

const Scene6: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <Cam t={t} a={S[5]} b={S[6]} s0={1.0} s1={1.14} ox="75% 60%">
      <RoomBack clock={[10, 10]} />
      <MeetingTable t={t} rakaMood="sad" rakaLook="down" rightTalk nodAt={T.angguk - 0.6} />
      <RoomTable />
      <Bulb x={880} y={760} size={120} on={1} />
      <Bubble t={t} at={T.sampai + 0.2} text="Gimana kalau kita..." x={500} y={1010} w={360} tail="right" size={34} />
    </Cam>
    <Headline t={t} at={S[5]} label="IDE YANG MIRIP" lines={['semua orang', 'mengangguk.']} key1="mengangguk." />
  </AbsoluteFill>
);

const Scene7: React.FC<{t: number}> = ({t}) => {
  const q = T.aku - 0.05;
  return <AbsoluteFill>
    <Cam t={t} a={S[6]} b={S[8]} s0={1.0} s1={1.1} ox="45% 70%">
      <Bedroom />
      <Character t={t} x={480} y={800} height={760} seated pose={t > q ? 'think' : 'hold'} fromPose="hold" poseAt={q} mood={t > q ? 'think' : 'sad'} tilt={-6} />
      <BedFront />
    </Cam>
    <Headline t={t} at={S[6]} label="MALAMNYA" lines={['satu', 'pertanyaan.']} key1="pertanyaan." color="white" out={q - 0.25} />
    <Bubble t={t} at={q} text="Rendah hati?" x={90} y={330} w={420} thought size={44} />
    <Bubble t={t} at={T.takut - 0.5} text="Atau cuma takut?" x={520} y={480} w={470} thought size={44} />
  </AbsoluteFill>;
};

const Scene9: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <StageBg />
    <Lingkaran t={t} at={T.pelan + 0.3} cx={540} cy={1060} r={340} />
    <Pijak x={540} y={1462} w={360} />
    <Character t={t} x={540} y={760} height={710} pose="stand" mood="calm" />
    <Headline t={t} at={S[8]} label="PELAN-PELAN" lines={['dia paham.']} key1="paham." />
  </AbsoluteFill>
);

const Scene10: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <StageBg />
    <Lingkaran t={t} at={S[9]} cx={790} cy={1190} r={220} />
    <Pijak x={790} y={1462} w={260} />
    <Character t={t} x={790} y={900} height={570} pose="present" fromPose="stand" poseAt={T.rendah} mood="talk" />
    <Headline t={t} at={S[9]} label="BEDANYA" lines={['rendah hati', 'dan pede.']} key1="pede." size={96} />
    <NumCard t={t} at={T.rendah + 0.2} n="01" title="Rendah hati" body="Cara kita memandang orang." x={70} y={620} w={640} />
    <NumCard t={t} at={T.sedangkan + 0.3} n="02" title="Pede" body="Berani menawarkan yang kita punya." x={70} y={850} w={640} />
  </AbsoluteFill>
);

const Scene11: React.FC<{t: number}> = ({t}) => {
  const m = pr(t, T.dua + 0.2, 0.8);
  return <AbsoluteFill>
    <StageBg />
    <Lingkaran t={t} at={S[10] - 0.2} cx={540} cy={1180} r={300} />
    <Pijak x={540} y={1462} w={320} />
    <Character t={t} x={540} y={900} height={570} pose="offer" fromPose="present" poseAt={T.dua} mood="smile" />
    <Headline t={t} at={S[10]} label="DUA-DUANYA" lines={['bisa jalan', 'bareng.']} key1="bareng." />
    {['RENDAH HATI', 'PEDE'].map((w, i) => (
      <div key={w} style={{position: 'absolute', top: 680, left: i === 0 ? 110 + 80 * m : 630 - 80 * m, width: 340, padding: '24px 0', textAlign: 'center',
        background: 'white', borderRadius: 26, boxShadow: '0 16px 36px #171A1822', fontFamily: HEAD, fontWeight: 900, fontSize: 40, color: i === 1 ? B.orange : B.ink,
        opacity: pr(t, S[10] + i * 0.15, 0.4)}}>{w}</div>
    ))}
    <div style={{position: 'absolute', top: 690, left: 515, width: 50, height: 50, borderRadius: 25, background: B.orange, color: 'white', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 900, fontSize: 40, transform: `scale(${pr(t, T.bareng - 0.3, 0.4, back)})`}}>+</div>
  </AbsoluteFill>;
};

const Scene12: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <Cam t={t} a={S[11]} b={S[12]} s0={1.0} s1={1.1} ox="50% 60%">
      <RoomBack clock={[9, 0]} />
      <Lingkaran t={t} at={T.usulan - 0.6} cx={540} cy={1000} r={250} />
      <Character t={t} x={200} y={810} height={640} look={HIJAB} seated mood={t > T.usulan ? 'smile' : 'calm'} tilt={t > T.usulan ? -6 : 0} />
      <Character t={t} x={540} y={640} height={700} pose={t > T.usulan - 0.2 ? 'raise' : 'stand'} fromPose="stand" poseAt={T.rapat2 + 1.2} mood={t > T.usulan ? 'talk' : 'calm'} />
      <Character t={t} x={880} y={810} height={640} look={CURLY} seated flip mood={t > T.usulan ? 'smile' : 'calm'} tilt={t > T.usulan ? -6 : 0} />
      <RoomTable />
      <Bubble t={t} at={T.usulan - 0.1} text="Aku punya satu usulan." x={330} y={420} w={470} contoh tail="left" size={40} />
    </Cam>
    <Headline t={t} at={S[11]} label="RAPAT BERIKUTNYA" lines={['cukup satu', 'kalimat.']} key1="kalimat." out={T.usulan - 0.3} />
  </AbsoluteFill>
);

const Scene13: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <StageBg />
    <Pijak x={540} y={1462} w={900} />
    {[[180, HIJAB, 0.25], [400, undefined, 0], [660, SHORT, 0.15], [890, CURLY, 0.35]].map(([x, look, d], i) => (
      <Character key={i} t={t} x={x as number} y={930} height={540} look={look as Look | undefined} pose={i === 1 ? 'offer' : 'stand'} mood="smile"
        opacity={pr(t, S[12] + (d as number), 0.4)} flip={i > 1} />
    ))}
    <Headline t={t} at={S[12]} label="KALAU KAMU PERNAH JADI RAKA" lines={['kamu gak', 'sendirian.']} key1="sendirian." />
  </AbsoluteFill>
);

const Scene14: React.FC<{t: number}> = ({t}) => {
  const st = pr(t, S[13], 0.5);
  const walk = pr(t, S[13] + 0.3, 2.4);
  const stepsXY: Array<[number, number]> = [[200, 942], [410, 822], [630, 702], [900, 582]];
  const seg = Math.min(2.999, walk * 3), k = Math.floor(seg), f = seg - k;
  const hop = Math.sin(f * Math.PI) * 40;
  const x = stepsXY[k][0] + (stepsXY[k + 1][0] - stepsXY[k][0]) * f;
  const y = stepsXY[k][1] + (stepsXY[k + 1][1] - stepsXY[k][1]) * Math.min(1, f * 1.6) - hop;
  return <AbsoluteFill>
    <StageBg />
    <Stairs p={st} />
    <Character t={t} x={x} y={y} height={540} pose={walk > 0.95 ? 'raise' : 'stand'} poseAt={S[13] + 2.7} mood="smile" />
    <div style={{position: 'absolute', left: 80, top: 260, opacity: pr(t, S[13] + 0.2, 0.5)}}>
      <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 40, color: B.ink}}>selangkah lebih</div>
      <div style={{fontFamily: HEAD, fontWeight: 900, fontSize: 140, color: B.orange, lineHeight: 1, letterSpacing: -3}}>BERARTI.</div>
    </div>
    <div style={{position: 'absolute', left: 80, top: 520, padding: '18px 34px', borderRadius: 999, background: B.floor, color: 'white', fontFamily: BODY, fontWeight: 700,
      fontSize: 36, opacity: pr(t, T.follow + 0.2, 0.4), transform: `scale(${0.9 + 0.1 * pr(t, T.follow + 0.2, 0.4, back)})`}}>Follow @firasbyzi</div>
    <div style={{position: 'absolute', left: 80, top: 640, fontFamily: HEAD, fontWeight: 900, fontSize: 64, color: B.ink, opacity: pr(t, T.end, 0.4)}}>
      berarti<span style={{color: B.orange}}>.</span><span style={{fontFamily: BODY, fontWeight: 600, fontSize: 22, letterSpacing: 8, marginLeft: 16}}>ACADEMY</span></div>
  </AbsoluteFill>;
};

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const scenes = [Scene1, Scene2, Scene3, Scene4, Scene5, Scene6, Scene7, Scene7, Scene9, Scene10, Scene11, Scene12, Scene13, Scene14];
  let idx = S.findIndex((s, i) => t >= s && t < S[i + 1]);
  if (idx < 0) idx = scenes.length - 1;
  const View = scenes[idx];
  const start = S[idx];
  const cont = idx === 7; // scene 8 continues scene 7 (same bedroom)
  const fade = idx === 0 || cont ? 1 : pr(t, start, 0.2);
  return <AbsoluteFill style={{overflow: 'hidden', background: B.stage}}>
    <FontFaces /><BrandFonts />
    <AbsoluteFill style={{opacity: fade, transform: `scale(${1.02 - 0.02 * fade})`}}><View t={t} /></AbsoluteFill>
    <Floor />
    <Subtitles t={t} />
    <SfxTrack />
    {sound.musicFile && <Audio src={staticFile(sound.musicFile)} volume={musicGain} />}
    {project.voiceoverFile && <Audio src={staticFile(project.voiceoverFile)} />}
  </AbsoluteFill>;
};
