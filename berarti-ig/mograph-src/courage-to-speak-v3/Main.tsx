import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import project from './project.json';
import {SfxTrack} from './components/SfxTrack';
import {FontFaces} from './Fonts';
import {at, endOf} from './lib/words';
import {B, BODY, HEAD} from './berarti/theme';
import {BrandFonts} from './berarti/BrandFonts';
import {Arti} from './berarti/Arti';
import {Floor, Lingkaran, Subtitles, pr, back} from './berarti/UI';
import {Pill, Icon} from './berarti/Props';
import {Bulb} from './berarti/Sets';
import {StoryTitle, Timer, ClockCard, Cloud, EqCard, PeopleIcon, MegaIcon, DocIcon, Cursor} from './berarti/Story';

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
  idenya: at('Idenya', 0, 2.3), dipakai: at('dipakai', 0, 2.7), padahal: at('Padahal', 0, 5.6), ide9: at('ide itu', 0, 8.0),
  tapi: at('Tapi satu', 0, 10.1), nanti: at('Nanti', 0, 13.0), jadi: at('Jadi dia', 0, 14.8), diam2: at('diam', 1, 16.3), sampai: at('Sampai', 0, 17.0),
  mirip: at('mirip', 0, 18.9), angguk: at('mengangguk', 0, 21.0), malam: at('Malamnya', 0, 21.8), aku: at('Aku ini', 0, 24.9), atau: at('atau cuma', 0, 26.4),
  takut: at('takut', 0, 27.3), pelan: at('Pelan-pelan', 0, 28.1), paham: at('paham', 0, 28.8), rendah: at('Rendah hati itu', 0, 29.6),
  sedangkan: at('sedangkan', 0, 32.8), dua: at('Dua-duanya', 0, 37.2), rapat2: at('Rapat berikutnya', 0, 40.4), kalimat: at('satu kalimat', 0, 42.3),
  usulan: at('Aku punya', 0, 43.3), kalau: at('Kalau kamu', 0, 44.9), gak: at('kamu gak', 0, 46.6), follow: at('Follow', 0, 47.9),
  ngomong: at('kamu yang ngomong', 0, 50.5), end: endOf('kamu yang ngomong', 0, 51.3),
};
// storyboard: 9 scenes, re-timed to the real voice-over
const S = [0, T.padahal - 0.1, T.jadi - 0.1, T.sampai - 0.1, T.malam - 0.1, T.pelan - 0.1, T.rapat2 - 0.1, T.kalau - 0.1, T.follow - 0.1, 999];

const A3 = (k: string) => `arti3/${k}.png`;
const SZ: Record<string, [number, number]> = {p01_ragu: [378, 428], p02_angkat: [378, 377], p03_turun: [378, 428], p04_pena: [378, 376], p05_merenung: [318, 353],
  p06_berani: [299, 410], p07_closeup: [270, 384], p08_dada: [201, 387], p09_rekan: [340, 410]};
const Pose: React.FC<{k: string; scale: number; x: number; bottom?: number; y?: number; opacity?: number; bob?: number}> = ({k, scale, x, bottom = 1470, y, opacity = 1, bob = 0}) => {
  const [w, h] = SZ[k];
  return <Img src={staticFile(A3(k))} style={{position: 'absolute', left: x, top: (y ?? bottom - h * scale) - bob, width: w * scale, height: h * scale, opacity}} />;
};
const Cam: React.FC<{t: number; a: number; b: number; s0: number; s1: number; ox?: string; children: React.ReactNode}> = ({t, a, b, s0, s1, ox = '50% 55%', children}) => {
  const p = Math.max(0, Math.min(1, (t - a) / Math.max(0.1, b - a)));
  const e = p * p * (3 - 2 * p);
  return <AbsoluteFill style={{transform: `scale(${s0 + (s1 - s0) * e})`, transformOrigin: ox}}>{children}</AbsoluteFill>;
};
const Wall: React.FC<{c?: string}> = ({c = '#EDE7DF'}) => <div style={{position: 'absolute', inset: 0, background: c}} />;
const Window: React.FC<{x: number; y: number; w: number; h: number; night?: number}> = ({x, y, w, h, night = 0}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, height: h, background: night > 0.5 ? '#1E3150' : '#CFE6F3', border: '14px solid white', borderRadius: 8, overflow: 'hidden'}}>
    <div style={{position: 'absolute', inset: 0, background: '#1E3150', opacity: night}} />
    <div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 10, marginLeft: -5, background: 'white'}} />
    {night > 0 && <div style={{position: 'absolute', right: 34, top: 30 + (1 - night) * 80, width: 70, height: 70, borderRadius: 35, background: '#F8E7A8', boxShadow: '0 0 40px #F8E7A8', opacity: night}} />}
    <div style={{position: 'absolute', left: -20, bottom: -26, width: w + 40, height: 90, borderRadius: '50%', background: '#8EC58E', opacity: 1 - night * 0.7}} />
  </div>
);
const Board: React.FC<{x: number; y: number}> = ({x, y}) => (
  <div style={{position: 'absolute', left: x, top: y, width: 330, height: 220, background: 'white', border: '6px solid #C9CED6', borderRadius: 8, padding: 24}}>
    <div style={{width: 150, height: 12, background: B.ink, borderRadius: 6, marginBottom: 18}} />
    <div style={{display: 'flex', alignItems: 'flex-end', gap: 14, height: 110}}>{[45, 70, 58, 100].map((h, i) => <div key={i} style={{width: 34, height: `${h}%`, background: i === 3 ? B.orange : '#3E4A68'}} />)}</div>
  </div>
);
const Plant: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <svg width={130 * s} height={190 * s} viewBox="0 0 130 190" style={{position: 'absolute', left: x, top: y}}>
    {[-32, -12, 8, 28, 0].map((r, i) => <ellipse key={i} cx={65} cy={70} rx={16} ry={58} fill={i % 2 ? '#3E8E5C' : '#5BAA74'} transform={`rotate(${r} 65 125)`} />)}
    <path d="M32 125 L98 125 L88 188 L42 188 Z" fill="#C86B3C" />
  </svg>
);

// ---------- scenes ----------
const Sc01Hook: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <Cam t={t} a={0} b={S[1]} s0={1.0} s1={1.1} ox="30% 62%">
      <Wall c="#E4E7EA" />
      <Window x={60} y={300} w={300} h={250} />
      <Board x={620} y={330} />
      <div style={{position: 'absolute', left: 380, right: 0, top: 940, height: 40, background: '#C49A73', borderRadius: 8}} />
      <div style={{position: 'absolute', left: 300, top: 700, transform: 'scale(0.72)', transformOrigin: 'left top', width: 1080, height: 400}}>
        <Arti t={t} img="arti/meet_hijabL.png" w={245} h={335} x={150} y={12} />
        <Arti t={t} img="arti/meet_curly.png" w={265} h={349} x={450} y={0} />
        <Arti t={t} img="arti/meet_hijabR.png" w={200} h={327} x={760} y={22} />
      </div>
      <div style={{position: 'absolute', left: 380, right: 0, top: 975, height: 120, background: '#B98C66'}} />
      <Bulb x={830} y={650} size={90} on={pr(t, T.dipakai + 0.2, 0.3)} opacity={pr(t, T.dipakai, 0.3)} />
      <Plant x={940} y={1000} />
      <Pose k="p01_ragu" scale={2.15} x={-70} bottom={1520} />
    </Cam>
    <Timer t={t} at={0} dur={2.2} x={860} y={300} r={125} />
    {t > T.idenya && <div style={{position: 'absolute', left: 560, top: 520, padding: '18px 26px', background: 'white', borderRadius: 22, fontFamily: BODY, fontWeight: 600, fontSize: 32,
      boxShadow: '0 12px 28px #171A1826', transform: `scale(${pr(t, T.idenya, 0.35, back)})`, transformOrigin: 'right bottom'}}>Gimana kalau kita bikin...</div>}
    <StoryTitle t={t} at={-1} y={1020} lines={['10 menit', {key: 'diam'}, 'di rapat']} size={100} />
  </AbsoluteFill>
);

const Sc02Problem: React.FC<{t: number}> = ({t}) => {
  const worry = t > T.tapi - 0.1;
  const sw = pr(t, T.tapi - 0.15, 0.3);
  return <AbsoluteFill>
    <Cam t={t} a={S[1]} b={S[2]} s0={1.0} s1={1.08} ox="40% 70%">
      <Wall c="#F1EADF" />
      <Window x={680} y={720} w={300} h={260} />
      <Plant x={60} y={900} s={1.1} />
      <Pose k="p04_pena" scale={2.25} x={120} opacity={1 - sw} />
      <Pose k="p01_ragu" scale={2.25} x={70} opacity={sw} />
    </Cam>
    <ClockCard t={t} at={S[1] + 0.1} x={70} y={260} time="09:00" label="PAGI" />
    <Cloud t={t} at={T.ide9 - 0.2} x={560} y={240} w={440} h={300} out={T.nanti - 0.2}>
      <div style={{position: 'relative', width: 260, height: 160}}>
        <Bulb x={80} y={95} size={110} on={worry ? 0.1 : 1} />
        <div style={{position: 'absolute', left: 150, top: 30, transform: 'rotate(8deg)'}}><DocIcon size={100} /></div>
      </div>
    </Cloud>
    <Cloud t={t} at={T.nanti - 0.1} x={480} y={250} w={540} h={300}>
      <div style={{fontFamily: BODY, fontWeight: 700, fontSize: 44, color: B.ink, textAlign: 'center', lineHeight: 1.15}}>Nanti dibilang<br /><span style={{color: B.orange}}>sok tahu...</span></div>
    </Cloud>
    {worry && <StoryTitle t={t} at={T.nanti + 0.2} y={1160} lines={['nanti dibilang', {key: 'sok tahu'}]} size={96} />}
  </AbsoluteFill>;
};

const Sc03Hesitation: React.FC<{t: number}> = ({t}) => {
  const down = pr(t, T.jadi + 0.75, 0.35);
  const arrow = pr(t, T.jadi + 0.5, 0.6);
  return <AbsoluteFill>
    <Cam t={t} a={S[2]} b={S[3]} s0={1.04} s1={1.12} ox="40% 50%">
      <Wall c="#E9EEF2" />
      <Pose k="p02_angkat" scale={2.6} x={-70} opacity={1 - down} />
      <Pose k="p03_turun" scale={2.6} x={-70} opacity={down} />
    </Cam>
    <svg style={{position: 'absolute', left: 640, top: 420}} width={300} height={420} viewBox="0 0 300 420">
      <path d="M60 30 Q260 80 200 360" fill="none" stroke={B.floor} strokeWidth={22} strokeLinecap="round" strokeDasharray={460} strokeDashoffset={460 * (1 - arrow)} />
      <path d="M150 330 L200 380 L250 320" fill="none" stroke={B.floor} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" opacity={arrow > 0.95 ? 1 : 0} />
    </svg>
    <div style={{position: 'absolute', right: 60, top: 1080, padding: '10px 40px 22px', background: B.orange, borderRadius: 14, fontFamily: HEAD, fontSize: 200, color: 'white', lineHeight: 1,
      boxShadow: '10px 12px 0 #171A18', transform: `rotate(-6deg) scale(${pr(t, T.diam2 - 0.2, 0.35, back)})`}}>DIAM</div>
  </AbsoluteFill>;
};

const Sc04Agitate: React.FC<{t: number}> = ({t}) => {
  const nod = (k: number) => t > T.angguk - 0.6 ? Math.max(0, Math.sin((t - T.angguk + 0.6 - k * 0.12) * 8)) * 10 : 0;
  const inset = pr(t, T.angguk - 0.2, 0.35, back);
  return <AbsoluteFill>
    <Cam t={t} a={S[3]} b={S[4]} s0={1.0} s1={1.07} ox="55% 50%">
      <Wall c="#E8E3DA" />
      <Pose k="p09_rekan" scale={2.15} x={260} y={300} />
      <Bulb x={420} y={360} size={110} on={pr(t, T.mirip - 0.3, 0.3)} opacity={pr(t, T.sampai, 0.3)} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1050, height: 420}}>
        <Arti t={t} img="arti/meet_hijabL.png" w={245} h={335} scale={1.05} x={-10} y={140 + 10 - nod(0)} />
        <Arti t={t} img="arti/meet_curly.png" w={265} h={349} scale={1.0} x={400} y={150 - nod(1)} />
        <Arti t={t} img="arti/meet_hijabR.png" w={200} h={327} scale={1.1} x={860} y={140 - nod(2)} />
      </div>
      {[[120, 1110, 0], [530, 1120, 0.12], [970, 1110, 0.24]].map(([x, y, d]) => <Icon key={x} kind="check" x={x} y={y} size={80} p={pr(t, T.angguk - 0.4 + d, 0.35, back)} />)}
    </Cam>
    <StoryTitle t={t} at={T.sampai + 0.4} y={620} lines={['semua', {key: 'mengangguk'}]} size={96} out={T.angguk - 0.3} />
    <div style={{position: 'absolute', left: 60, top: 600, width: 340, height: 340, borderRadius: 170, overflow: 'hidden', background: '#E9EEF2', border: `10px solid ${B.orange}`,
      transform: `scale(${inset})`, boxShadow: '0 18px 40px #171A1844'}}>
      <Img src={staticFile(A3('p03_turun'))} style={{position: 'absolute', left: -150, top: -40, width: 378 * 1.7, height: 428 * 1.7}} />
    </div>
  </AbsoluteFill>;
};

const Sc05Turn: React.FC<{t: number}> = ({t}) => {
  const night = pr(t, S[4], 0.9);
  return <AbsoluteFill>
    <Cam t={t} a={S[4]} b={S[5]} s0={1.0} s1={1.08} ox="35% 70%">
      <div style={{position: 'absolute', inset: 0, background: `linear-gradient(${night > 0.5 ? '#243553' : '#E9EEF2'}, ${night > 0.5 ? '#16223A' : '#E1E6EA'})`}} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#243553, #16223A)', opacity: night}} />
      <Window x={70} y={300} w={320} h={300} night={night} />
      <div style={{position: 'absolute', left: 620, top: 780, width: 420, height: 420, borderRadius: 210, background: 'radial-gradient(#FFE7A8cc, #FFE7A800 70%)', opacity: night}} />
      <Pose k="p05_merenung" scale={2.35} x={60} />
      <Plant x={900} y={1150} s={0.9} />
    </Cam>
    <Cloud t={t} at={T.aku - 0.1} x={380} y={200} w={680} h={460} paper>
      <div style={{fontFamily: HEAD, fontSize: 58, color: B.ink, textAlign: 'center', lineHeight: 1.0, transform: 'rotate(-4deg)'}}>
        <div style={{opacity: pr(t, T.aku + 0.3, 0.3)}}>RENDAH HATI</div>
        <div style={{opacity: pr(t, T.atau - 0.05, 0.3), fontSize: 56}}>ATAU</div>
        <div style={{color: B.orange, fontSize: 88, opacity: pr(t, T.takut - 0.1, 0.3), transform: `scale(${0.8 + 0.2 * pr(t, T.takut - 0.1, 0.35, back)})`}}>TAKUT?</div>
      </div>
    </Cloud>
    <div style={{position: 'absolute', left: 70, top: 660, opacity: pr(t, S[4] + 0.3, 0.4) * (1 - pr(t, T.aku - 0.3, 0.3))}}>
      <Pill t={t} at={S[4] + 0.3} text="MALAMNYA" x={0} y={0} size={40} />
    </div>
  </AbsoluteFill>;
};

const Sc06Solution: React.FC<{t: number}> = ({t}) => {
  const merge = pr(t, T.dua - 0.1, 0.5);
  return <AbsoluteFill>
    <div style={{position: 'absolute', inset: 0, background: B.stage}} />
    <Lingkaran t={t} at={T.paham - 0.2} cx={830} cy={1120} r={250} />
    <Pose k="p08_dada" scale={1.9} x={640} bottom={1462} />
    {[[690, 560, 0], [980, 700, 0.12], [640, 860, 0.24]].map(([x, y, d], i) => <Icon key={i} kind="spark" x={x} y={y} size={60} color={i === 1 ? B.floor : B.orange} p={pr(t, T.paham - 0.1 + d, 0.3, back) * (1 - pr(t, T.rendah, 0.3))} />)}
    <Pill t={t} at={S[5] + 0.1} text="PELAN-PELAN PAHAM" x={60} y={250} size={38} out={T.rendah - 0.2} />
    <div style={{position: 'absolute', inset: 0, transform: `translateY(${-merge * 40}px)`}}>
      <EqCard t={t} at={T.rendah - 0.05} x={40 + merge * 20} y={240} w={420} color={B.floor} icon={<PeopleIcon />} title="RENDAH HATI" body="Cara kita memandang orang" />
      <EqCard t={t} at={T.sedangkan + 0.1} x={540 - merge * 20} y={240} w={420} color={B.orange} icon={<MegaIcon />} title="PERCAYA DIRI" body="Berani menawarkan apa yang kita punya" />
      <Icon kind="plus" x={500} y={480} size={110} color={B.ink} p={pr(t, T.dua - 0.2, 0.4, back)} />
    </div>
    <StoryTitle t={t} at={T.dua + 0.2} y={1110} lines={['dua-duanya', {key: 'bisa jalan bareng'}]} size={78} />
  </AbsoluteFill>;
};

const Sc07Step: React.FC<{t: number}> = ({t}) => {
  const speaking = t > T.usulan - 0.05 && t < T.kalau - 0.3;
  const bob = speaking ? Math.abs(Math.sin(t * 9)) * 5 : 0;
  return <AbsoluteFill>
    <Cam t={t} a={S[6]} b={S[7]} s0={1.0} s1={1.08} ox="35% 65%">
      <Wall c="#E4E7EA" />
      <Board x={660} y={330} />
      <Lingkaran t={t} at={T.kalimat - 0.3} cx={360} cy={1000} r={330} />
      <div style={{position: 'absolute', left: 560, top: 880, transform: 'scale(1.05)', transformOrigin: 'left top', width: 600, height: 400}}>
        <Arti t={t} img="arti/meet_hijabR.png" w={200} h={327} x={40} y={30} />
        <Arti t={t} img="arti/meet_curly.png" w={265} h={349} x={250} y={10} />
      </div>
      <div style={{position: 'absolute', left: 520, right: 0, top: 1240, height: 240, background: '#B98C66'}} />
      {[[700, 900, 0], [930, 890, 0.12]].map(([x, y, d]) => <Icon key={x} kind="check" x={x} y={y} size={74} p={pr(t, T.usulan + 1.0 + d, 0.35, back)} />)}
      <Pose k="p06_berani" scale={2.35} x={-20} bob={bob} />
    </Cam>
    <Pill t={t} at={S[6] + 0.1} n="01" text="RAPAT BERIKUTNYA" x={60} y={250} size={38} />
    <Cloud t={t} at={T.usulan - 0.2} x={420} y={330} w={640} h={360}>
      <div style={{fontFamily: HEAD, fontSize: 56, color: B.ink, textAlign: 'center', lineHeight: 1.05, transform: 'rotate(-3deg)'}}>AKU PUNYA<br /><span style={{color: B.orange, fontSize: 74}}>SATU USULAN</span></div>
    </Cloud>
  </AbsoluteFill>;
};

const Sc08Close: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <Cam t={t} a={S[7]} b={S[8]} s0={1.06} s1={1.0} ox="25% 60%">
      <div style={{position: 'absolute', inset: 0, background: '#F3EBE0'}} />
      <Lingkaran t={t} at={S[7]} cx={250} cy={820} r={380} />
      <Pose k="p07_closeup" scale={2.75} x={-190} />
    </Cam>
    <StoryTitle t={t} at={T.kalau + 0.3} x={50} align="right" y={760} lines={['kamu', 'gak', {key: 'sendirian'}]} size={104} stagger={0.35} />
  </AbsoluteFill>
);

const Sc09Cta: React.FC<{t: number}> = ({t}) => {
  const click = pr(t, T.follow + 0.6, 0.5);
  const press = t > T.follow + 0.6 && t < T.follow + 0.9;
  const ring = pr(t, S[8] + 0.2, 1.0);
  return <AbsoluteFill>
    <Cam t={t} a={S[8]} b={S[8] + 1.4} s0={1.3} s1={1.0} ox="70% 70%">
      <div style={{position: 'absolute', inset: 0, background: B.stage}} />
      <svg style={{position: 'absolute', left: 430, top: 560}} width={640} height={640} viewBox="0 0 640 640">
        <circle cx={320} cy={320} r={290} fill="none" stroke={B.orange} strokeWidth={34} strokeDasharray={1822} strokeDashoffset={1822 * (1 - ring * 0.8)} strokeLinecap="round" transform="rotate(130 320 320)" />
      </svg>
      <div style={{position: 'absolute', left: 470, top: 1350, width: 560, height: 120, borderRadius: '50%', background: B.floor}} />
      <div style={{position: 'absolute', left: 470, top: 1330, width: 560, height: 110, borderRadius: '50%', background: '#1B5A36'}} />
      <Pose k="p08_dada" scale={2.0} x={650} bottom={1395} />
    </Cam>
    <StoryTitle t={t} at={T.follow + 0.3} y={360} lines={['kamu', 'yang', {key: 'ngomong'}]} size={104} stagger={0.25} />
    <div style={{position: 'absolute', right: 60, top: 250, textAlign: 'right', opacity: pr(t, S[8] + 0.6, 0.4)}}>
      <div style={{fontFamily: HEAD, fontSize: 64, color: B.floor, lineHeight: 0.95}}>BERARTI</div>
      <div style={{fontFamily: HEAD, fontSize: 64, color: B.orange, lineHeight: 0.95}}>ACADEMY</div>
    </div>
    <div style={{position: 'absolute', left: 60, top: 860, display: 'flex', alignItems: 'center', gap: 16, padding: '22px 34px', borderRadius: 24, background: press ? '#0A2817' : B.floor, color: 'white',
      fontFamily: BODY, fontWeight: 700, fontSize: 40, transform: `scale(${pr(t, T.follow, 0.4, back) * (press ? 0.95 : 1)})`, transformOrigin: 'left center', boxShadow: '6px 8px 0 #171A18'}}>
      <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.4}><circle cx={9} cy={8} r={4} /><path d="M2 21 Q9 13 16 21" /><path d="M19 8 L19 14 M16 11 L22 11" /></svg>
      {click > 0.6 ? 'Mengikuti' : 'Follow @firasbyzi'}
    </div>
    <Cursor x={400 - 60 * (1 - pr(t, T.follow + 0.1, 0.5))} y={920 + 120 * (1 - pr(t, T.follow + 0.1, 0.5))} click={click} />
  </AbsoluteFill>;
};

export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const scenes = [Sc01Hook, Sc02Problem, Sc03Hesitation, Sc04Agitate, Sc05Turn, Sc06Solution, Sc07Step, Sc08Close, Sc09Cta];
  let idx = S.findIndex((s, i) => t >= s && t < S[i + 1]);
  if (idx < 0) idx = scenes.length - 1;
  const View = scenes[idx];
  const inP = idx === 0 ? 1 : pr(t, S[idx], 0.24);
  return <AbsoluteFill style={{overflow: 'hidden', background: B.stage}}>
    <FontFaces /><BrandFonts />
    <AbsoluteFill style={{opacity: Math.min(1, inP * 1.6), transform: `translateY(${(1 - inP) * 70}px) scale(${1.03 - 0.03 * inP})`}}><View t={t} /></AbsoluteFill>
    <Floor />
    <Subtitles t={t} />
    <SfxTrack />
    {sound.musicFile && <Audio src={staticFile(sound.musicFile)} volume={musicGain} />}
    {project.voiceoverFile && <Audio src={staticFile(project.voiceoverFile)} />}
  </AbsoluteFill>;
};
