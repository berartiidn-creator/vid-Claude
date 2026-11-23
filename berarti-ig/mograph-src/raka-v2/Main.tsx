import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';
import project from './project.json';
import {SfxTrack} from './components/SfxTrack';
import {FontFaces} from './Fonts';
import {at, endOf} from './lib/words';
import {B, BODY, HEAD} from './berarti/theme';
import {BrandFonts} from './berarti/BrandFonts';
import {Arti, SIZE, Expr} from './berarti/Arti';
import {Headline, Bubble, Floor, Lingkaran, Pijak, Subtitles, pr, back} from './berarti/UI';
import {Pill, Sticky, Icon, MergePath} from './berarti/Props';
import {Bulb, Clock, StageBg, Stairs} from './berarti/Sets';

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
  idenya: at('Idenya', 0, 2.3), dipakai: at('dipakai', 0, 2.7), tapi1: at('tapi bukan', 0, 3.6), padahal: at('Padahal', 0, 5.6), jam: at('jam 9', 0, 6.8),
  ide9: at('ide itu', 0, 8.0), tapi: at('Tapi satu', 0, 10.1), nanti: at('Nanti', 0, 13.0), jadi: at('Jadi dia', 0, 14.8), diam2: at('diam', 1, 16.3),
  sampai: at('Sampai', 0, 17.0), mirip: at('mirip', 0, 18.9), angguk: at('mengangguk', 0, 21.0), malam: at('Malamnya', 0, 21.8), aku: at('Aku ini', 0, 24.9),
  atau: at('atau cuma', 0, 26.4), pelan: at('Pelan-pelan', 0, 28.1), paham: at('paham', 0, 28.8), rendah: at('Rendah hati itu', 0, 29.6),
  sedangkan: at('sedangkan', 0, 32.8), dua: at('Dua-duanya', 0, 37.2), bareng: at('bareng', 0, 39.5), rapat2: at('Rapat berikutnya', 0, 40.4),
  kalimat: at('satu kalimat', 0, 42.3), usulan: at('Aku punya', 0, 43.3), kalau: at('Kalau kamu', 0, 44.9), sendiri: at('sendirian', 0, 47.0),
  follow: at('Follow', 0, 47.9), end: endOf('kamu yang ngomong', 0, 51.3),
};
const S = [0, T.idenya - 0.1, T.padahal - 0.1, T.tapi - 0.1, T.jadi - 0.1, T.sampai - 0.1, T.malam - 0.1, T.aku - 0.1, T.pelan - 0.1,
  T.rendah - 0.1, T.dua - 0.1, T.rapat2 - 0.1, T.kalau - 0.1, T.follow - 0.1, 999];

const Cam: React.FC<{t: number; a: number; b: number; s0: number; s1: number; x0?: number; x1?: number; y0?: number; y1?: number; ox?: string; children: React.ReactNode}> =
  ({t, a, b, s0, s1, x0 = 0, x1 = 0, y0 = 0, y1 = 0, ox = '50% 55%', children}) => {
  const p = Math.max(0, Math.min(1, (t - a) / Math.max(0.1, b - a)));
  const e = p * p * (3 - 2 * p);
  return <AbsoluteFill style={{transform: `translate(${x0 + (x1 - x0) * e}px, ${y0 + (y1 - y0) * e}px) scale(${s0 + (s1 - s0) * e})`, transformOrigin: ox}}>{children}</AbsoluteFill>;
};

// ---------- meeting room in the style of the reference videos ----------
const RefRoom: React.FC<{clock?: [number, number]; dim?: number; children?: React.ReactNode}> = ({clock, dim = 0, children}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: B.refWall}} />
    {[170, 470, 780].map((x) => <div key={x} style={{position: 'absolute', left: x, top: 0, width: 130, height: 18, background: '#2B2F36', borderRadius: '0 0 30px 30px'}} />)}
    <div style={{position: 'absolute', left: 50, top: 650, width: 280, height: 220, background: '#BFDDEF', border: '12px solid white', borderRadius: 6}}>
      <div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 10, marginLeft: -5, background: 'white'}} />
      <div style={{position: 'absolute', left: -30, bottom: -20, width: 220, height: 90, borderRadius: '50%', background: '#8EC58E'}} /></div>
    <div style={{position: 'absolute', left: 700, top: 660, width: 320, height: 210, background: 'white', borderRadius: 8, border: '6px solid #C9CED6', padding: 24}}>
      <div style={{width: 150, height: 12, background: B.ink, borderRadius: 6, marginBottom: 18}} />
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 14, height: 110}}>{[45, 70, 58, 100].map((h, i) => <div key={i} style={{width: 34, height: `${h}%`, background: i === 3 ? B.orange : '#3E4A68'}} />)}</div></div>
    {clock && <Clock x={540} y={760} size={110} hour={clock[0]} minute={clock[1]} />}
    <div style={{position: 'absolute', left: 310, top: 837, width: 200, height: 265, background: '#262B33', borderRadius: 26}} />
    {children}
    <div style={{position: 'absolute', left: 0, right: 0, top: 1244, height: 48, background: B.refTableTop}} />
    <div style={{position: 'absolute', left: 0, right: 0, top: 1290, height: 190, background: B.refTable}} />
    {dim > 0 && <div style={{position: 'absolute', inset: 0, background: '#171A18', opacity: dim}} />}
  </>
);
const Row: React.FC<{t: number; arti: Expr; talk?: boolean; look?: [number, number]; sweat?: boolean; zip?: number; curlyTalk?: boolean; nodAt?: number; checkAt?: number}> =
  ({t, arti, talk, look, sweat, zip, curlyTalk, nodAt, checkAt}) => {
  const bob = (k: number) => nodAt !== undefined && t > nodAt ? Math.max(0, Math.sin((t - nodAt - k * 0.12) * 8)) * 9 : 0;
  const cbob = curlyTalk ? Math.abs(Math.sin(t * 6)) * 4 : 0;
  return <>
    <Arti t={t} img="arti/meet_hijabL.png" w={245} h={335} x={0} y={909 + bob(0)} />
    <Arti t={t} img="arti/meet_curly.png" w={265} h={349} x={640} y={895 + bob(1) - cbob} />
    <Arti t={t} img="arti/meet_hijabR.png" w={200} h={327} x={880} y={917 + bob(2)} />
    <Arti t={t} img="arti/meet_arti.png" faceKey="meet_arti" w={295} h={347} x={270} y={897} expr={arti} talk={talk} look={look} sweat={sweat} zip={zip} />
    {checkAt !== undefined && [[120, 0], [770, 0.12], [985, 0.24]].map(([x, d]) => <Icon key={x} kind="check" x={x} y={880} size={70} p={pr(t, checkAt + d, 0.35, back)} />)}
  </>;
};

// ---------- scenes ----------
const Scene1: React.FC<{t: number}> = ({t}) => {
  const glance = Math.sin(t * 3.2) > 0 ? 1 : -1;
  return <AbsoluteFill>
    <Cam t={t} a={0} b={S[1]} s0={1.16} s1={1.08} ox="45% 62%">
      <RefRoom clock={[10, (t * 240) % 60]}><Row t={t} arti="nervous" sweat look={[glance, 0]} /></RefRoom>
    </Cam>
    <Headline t={t} at={-1} card label="PERNAH NGALAMIN INI?" lines={['10 menit', 'diam di rapat.']} key1="diam" />
  </AbsoluteFill>;
};

const Scene2: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <Cam t={t} a={S[1]} b={S[2]} s0={1.06} s1={1.12} ox="70% 60%">
      <RefRoom clock={[10, 10]}>
        <Row t={t} arti={t < T.tapi1 ? 'surprised' : 'sad'} look={[1, 0]} curlyTalk />
        <Bulb x={590} y={880} size={90} on={pr(t, T.dipakai + 0.2, 0.3)} opacity={pr(t, T.dipakai, 0.3)} />
      </RefRoom>
      <Bubble t={t} at={T.idenya} text="Gimana kalau kita bikin..." x={630} y={760} w={400} tail="left" size={34} />
    </Cam>
    <Headline t={t} at={S[1]} card label="RAPAT TIM" lines={['idenya dipakai', 'orang lain.']} key1="dipakai" />
  </AbsoluteFill>
);

const Scene3: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <Cam t={t} a={S[2]} b={S[3]} s0={1.0} s1={1.1} ox="50% 70%">
      <div style={{position: 'absolute', inset: 0, background: '#ECE1D2'}} />
      <div style={{position: 'absolute', left: 60, top: 700, width: 280, height: 16, background: B.refTable}} />
      {['#C0583A', '#3E4A68', '#E0B44A', B.floor, '#8B6BA8'].map((c, i) => <div key={i} style={{position: 'absolute', left: 74 + i * 48, top: 600 + (i % 2) * 12, width: 38, height: 100 - (i % 2) * 12, background: c, borderRadius: 3}} />)}
      <div style={{position: 'absolute', left: 700, top: 640, width: 300, height: 220, background: '#BFDDEF', border: '12px solid white', borderRadius: 6}}>
        <div style={{position: 'absolute', left: -30, bottom: -20, width: 260, height: 90, borderRadius: '50%', background: '#8EC58E'}} /></div>
      <Sticky t={t} at={T.padahal + 0.2} text="ide?" x={90} y={800} color={B.note1} rot={-6} />
      <Sticky t={t} at={T.padahal + 0.4} text="usulan" x={760} y={900} color={B.note3} rot={5} />
      <Sticky t={t} at={T.padahal + 0.6} text="rapat 10.00" x={110} y={960} color={B.note2} rot={4} />
      <div style={{position: 'absolute', left: 330, top: 870, width: 240, height: 330, background: '#262B33', borderRadius: 26}} />
      <Arti t={t} img="arti/desk_arti.png" faceKey="desk_arti" w={340} h={365} x={370} y={897} expr={t > T.ide9 - 0.2 ? 'excited' : 'smile'} blush />
      <Bulb x={548} y={850} size={120} on={pr(t, T.ide9 - 0.1, 0.3)} opacity={pr(t, T.jam, 0.3)} />
      <div style={{position: 'absolute', left: 120, right: 120, top: 1255, height: 30, background: B.refTableTop, borderRadius: 4}} />
      <div style={{position: 'absolute', left: 150, right: 150, top: 1284, height: 190, background: B.refTable}} />
      <div style={{position: 'absolute', left: 640, top: 1120, width: 250, height: 140, background: '#2B2F36', borderRadius: '12px 12px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: HEAD, fontSize: 56, color: B.orange}}>09.00</div>
      <div style={{position: 'absolute', left: 620, top: 1252, width: 290, height: 14, background: '#454A52', borderRadius: 4}} />
      <div style={{position: 'absolute', inset: 0, background: '#E9B872', opacity: 0.08}} />
    </Cam>
    <Headline t={t} at={S[2]} card label="KILAS BALIK" lines={['jam 09.00,', 'ide sudah ada.']} key1="ada." />
  </AbsoluteFill>
);

const Scene4: React.FC<{t: number}> = ({t}) => {
  const cringe = t > T.nanti - 0.1;
  const shake = cringe ? Math.sin(t * 40) * 3 * (1 - pr(t, T.nanti + 0.5, 0.4)) : 0;
  return <AbsoluteFill style={{background: B.floor}}>
    <Cam t={t} a={S[3]} b={S[4]} s0={1.0} s1={1.06} ox="50% 45%">
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${shake}px)`}}>
        <Arti t={t} img="arti/bust_front.png" faceKey="bust_front" w={406} h={583} scale={1.6} x={215} y={537} expr={cringe ? 'cringe' : 'worried'} sweat={cringe} look={cringe ? [0, 0] : [-1, 0]} />
      </div>
    </Cam>
    <Headline t={t} at={S[3]} label="SATU PIKIRAN" lines={['yang bikin', 'nahan diri.']} key1="nahan" color="white" out={T.nanti - 0.3} />
    <Bubble t={t} at={T.nanti - 0.1} text="Nanti dibilang sok tahu..." x={90} y={240} w={620} thought size={46} />
    {[[720, 440, 0.3], [760, 600, 0.6], [30, 600, 0.9]].map(([x, y, d], i) => (
      <div key={i} style={{position: 'absolute', left: x, top: y, fontFamily: BODY, fontWeight: 600, fontSize: 46, color: '#FFFFFF', opacity: 0.5 * pr(t, T.nanti + d, 0.3)}}>sok tahu?</div>))}
  </AbsoluteFill>;
};

const Scene5: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <Cam t={t} a={S[4]} b={S[5]} s0={1.15} s1={1.5} ox="38% 56%">
      <RefRoom clock={[10, 10]} dim={0.25 * pr(t, S[4], 0.6)}><Row t={t} arti="pressed" zip={pr(t, T.diam2 - 0.15, 0.3)} look={[0, 1]} /></RefRoom>
    </Cam>
    <div style={{position: 'absolute', left: 80, top: 250, fontFamily: HEAD, fontSize: 250, color: B.orange, letterSpacing: -4, textShadow: '0 10px 30px #00000033',
      opacity: pr(t, T.jadi + 0.4, 0.3), transform: `scale(${0.85 + 0.15 * pr(t, T.jadi + 0.4, 0.45, back)})`, transformOrigin: 'left center'}}>DIAM.</div>
  </AbsoluteFill>
);

const Scene6: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <Cam t={t} a={S[5]} b={S[6]} s0={1.0} s1={1.07} ox="50% 60%">
      <RefRoom clock={[10, 12]}>
        <Row t={t} arti="down" look={[0, 1]} curlyTalk={t < T.angguk} nodAt={T.angguk - 0.7} checkAt={T.angguk - 0.4} />
        <Bulb x={590} y={880} size={90} on={1} />
      </RefRoom>
      <Bubble t={t} at={T.sampai + 0.1} text="Gimana kalau kita bikin..." x={630} y={760} w={400} tail="left" size={34} out={T.angguk - 0.5} />
    </Cam>
    <Headline t={t} at={S[5]} card label="IDE YANG MIRIP" lines={['semua orang', 'mengangguk.']} key1="mengangguk." />
  </AbsoluteFill>
);

const Night: React.FC<{t: number; children?: React.ReactNode}> = ({t, children}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(#12261C, #0B1A13)'}} />
    <div style={{position: 'absolute', left: 620, top: 620, width: 330, height: 300, background: '#1E3A5F', border: '14px solid #E9E4DA', borderRadius: 8, overflow: 'hidden'}}>
      <div style={{position: 'absolute', right: 40, top: 34, width: 74, height: 74, borderRadius: 37, background: '#F8E7A8', boxShadow: '0 0 40px #F8E7A8'}} />
      {[[40, 60], [120, 150], [200, 50], [70, 210], [240, 200]].map(([x, y], i) => <div key={i} style={{position: 'absolute', left: x, top: y, opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))}}><Icon kind="star" x={0} y={0} size={22} color="#F8E7A8" /></div>)}
    </div>
    <div style={{position: 'absolute', left: 80, top: 1010, width: 120, height: 220, background: '#2D4A3B', borderRadius: 10}} />
    <div style={{position: 'absolute', left: 60, top: 930, width: 160, height: 110, background: '#F3D9A0', borderRadius: '70px 70px 10px 10px', boxShadow: '0 0 140px 50px #F3D9A044'}} />
    {children}
    <div style={{position: 'absolute', left: 150, right: 40, top: 1250, height: 230, background: '#3D5E8C', borderRadius: '34px 34px 0 0'}} />
    <div style={{position: 'absolute', left: 150, right: 40, top: 1250, height: 40, background: '#4C70A2', borderRadius: '34px 34px 0 0'}} />
  </>
);

const Scene7: React.FC<{t: number}> = ({t}) => {
  const q = T.aku - 0.05;
  const confused = t > q;
  return <AbsoluteFill>
    <Cam t={t} a={S[6]} b={S[8]} s0={1.0} s1={1.1} ox="40% 70%">
      <Night t={t}>
        <Arti t={t} img="arti/bust_dark.png" faceKey="bust_dark" w={319} h={391} scale={1.75} x={180} y={640} expr={confused ? 'confused' : 'pensive'} look={confused ? [1, -1] : [0, -1]} />
      </Night>
    </Cam>
    <Headline t={t} at={S[6]} label="MALAMNYA" lines={['satu', 'pertanyaan.']} key1="pertanyaan." color="white" out={q - 0.25} />
    <Bubble t={t} at={q} text="Rendah hati?" x={80} y={300} w={400} thought size={46} />
    <Bubble t={t} at={T.atau - 0.1} text="Atau cuma takut?" x={500} y={430} w={480} thought size={46} />
    {[[520, 300, 0.2], [930, 330, 0.5], [70, 560, 0.8]].map(([x, y, d], i) => <Icon key={i} kind="q" x={x} y={y + Math.sin(t * 2 + i) * 10} size={56} p={pr(t, q + d, 0.35, back)} />)}
  </AbsoluteFill>;
};

const Scene9: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <StageBg />
    <Lingkaran t={t} at={T.pelan + 0.2} cx={540} cy={1080} r={340} />
    <Pijak x={540} y={1462} w={380} />
    <Arti t={t} img="arti/stand_present.png" w={464} h={738} scale={0.95} x={320} y={761} />
    {[[260, 820, 0], [840, 760, 0.12], [880, 1040, 0.24], [200, 1080, 0.36]].map(([x, y, d], i) => <Icon key={i} kind="spark" x={x} y={y} size={64} color={i % 2 ? B.floor : 'white'} p={pr(t, T.paham - 0.2 + d, 0.35, back)} />)}
    <Headline t={t} at={S[8]} label="PELAN-PELAN" lines={['dia paham.']} key1="paham." />
  </AbsoluteFill>
);

const Card2: React.FC<{t: number; at: number; n: string; title: string; body: string; icon: 'eye' | 'hand'; y: number}> = ({t, at, n, title, body, icon, y}) => {
  const p = pr(t, at, 0.5, back);
  return <div style={{position: 'absolute', left: 60, top: y, width: 660, background: 'white', borderRadius: 26, padding: '28px 30px', boxShadow: '0 18px 40px #171A1822',
    opacity: Math.min(1, p * 1.4), transform: `translateX(${(1 - p) * -80}px)`}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
      <div style={{fontFamily: HEAD, fontSize: 76, color: B.orange, lineHeight: 1}}>{n}</div>
      <div style={{fontFamily: HEAD, fontSize: 50, color: B.ink, textTransform: 'uppercase', whiteSpace: 'nowrap'}}>{title}</div>
    </div>
    <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 14}}>
      <div style={{position: 'relative', width: 90, height: 90, flex: 'none', borderRadius: 20, background: '#FFF1E8'}}><Icon kind={icon} x={45} y={45} size={70} p={pr(t, at + 0.3, 0.35, back)} /></div>
      <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 38, color: '#4A4D49', lineHeight: 1.25}}>{body}</div>
    </div>
  </div>;
};
const Scene10: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <StageBg />
    <Lingkaran t={t} at={S[9]} cx={830} cy={1200} r={210} />
    <Pijak x={830} y={1462} w={260} />
    <Arti t={t} img="arti/stand_present.png" w={464} h={738} scale={0.74} x={658} y={916} />
    <Headline t={t} at={S[9]} label="BEDANYA" lines={['rendah hati', 'dan pede.']} key1="pede." size={96} />
    <Card2 t={t} at={T.rendah + 0.15} n="01" title="Rendah hati" body="Cara kita memandang orang." icon="eye" y={560} />
    <Card2 t={t} at={T.sedangkan + 0.25} n="02" title="Pede" body="Berani menawarkan yang kita punya." icon="hand" y={880} />
  </AbsoluteFill>
);

const Scene11: React.FC<{t: number}> = ({t}) => {
  const m = pr(t, T.dua + 0.1, 1.6);
  return <AbsoluteFill>
    <StageBg />
    <Lingkaran t={t} at={T.bareng - 0.4} cx={540} cy={640} r={110} />
    <MergePath p={m} x={190} y={600} />
    <Icon kind="plus" x={540} y={640} size={110} color={B.ink} p={pr(t, T.bareng - 0.35, 0.4, back)} />
    <div style={{position: 'absolute', left: 90, top: 1130, padding: '16px 28px', borderRadius: 999, background: B.orange, color: 'white', fontFamily: HEAD, fontSize: 36, opacity: pr(t, S[10] + 0.1, 0.4)}}>RENDAH HATI</div>
    <div style={{position: 'absolute', right: 90, top: 1130, padding: '16px 28px', borderRadius: 999, background: B.floor, color: 'white', fontFamily: HEAD, fontSize: 36, opacity: pr(t, S[10] + 0.25, 0.4)}}>PEDE</div>
    <Arti t={t} img="arti/bust_front.png" faceKey="bust_front" w={406} h={583} scale={0.55} x={428} y={1150} expr="warm" />
    <Headline t={t} at={S[10]} label="DUA-DUANYA" lines={['bisa jalan', 'bareng.']} key1="bareng." />
  </AbsoluteFill>;
};

const Scene12: React.FC<{t: number}> = ({t}) => {
  const speaking = t > T.usulan - 0.05 && t < T.kalau - 0.2;
  return <AbsoluteFill>
    <Cam t={t} a={S[11]} b={S[12]} s0={1.0} s1={1.16} ox="40% 62%">
      <RefRoom clock={[9, 0]}>
        <Lingkaran t={t} at={T.kalimat - 0.3} cx={410} cy={990} r={250} />
        <Row t={t} arti={speaking ? 'talk' : t > T.usulan + 1.1 ? 'smile' : 'determined'} talk={speaking} checkAt={T.usulan + 0.9} />
      </RefRoom>
      <Bubble t={t} at={T.usulan - 0.15} text="Aku punya satu usulan." x={200} y={640} w={470} contoh tail="left" size={42} />
    </Cam>
    <Headline t={t} at={S[11]} card label="RAPAT BERIKUTNYA" lines={['cukup satu', 'kalimat.']} key1="kalimat." out={T.usulan - 0.35} />
  </AbsoluteFill>;
};

const Scene13: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: '#E5D9C6'}}>
    <Cam t={t} a={S[12]} b={S[13]} s0={1.12} s1={1.0} y0={40} y1={0} ox="50% 60%">
      <Img src={staticFile('arti/crowd.png')} style={{position: 'absolute', left: 0, top: 500, width: 1080, height: 950}} />
      {[[180, 640, 0], [540, 600, 0.15], [900, 640, 0.3], [360, 980, 0.45], [720, 980, 0.6]].map(([x, y, d], i) => <Icon key={i} kind="spark" x={x} y={y} size={46} color={B.orange} p={pr(t, T.sendiri - 0.3 + d, 0.35, back)} />)}
    </Cam>
    <Headline t={t} at={S[12]} card label="KALAU KAMU PERNAH JADI RAKA" lines={['kamu gak', 'sendirian.']} key1="sendirian." />
  </AbsoluteFill>
);

const Scene14: React.FC<{t: number}> = ({t}) => {
  const st = pr(t, S[13], 0.5);
  const walk = pr(t, S[13] + 0.3, 2.4);
  const pts: Array<[number, number]> = [[200, 1462], [410, 1350], [630, 1230], [900, 1110]];
  const seg = Math.min(2.999, walk * 3), k = Math.floor(seg), f = seg - k;
  const cx = pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f;
  const fy = pts[k][1] + (pts[k + 1][1] - pts[k][1]) * Math.min(1, f * 1.6) - Math.sin(f * Math.PI) * 40;
  const sc = 0.66, W = 464 * sc, H = 738 * sc;
  return <AbsoluteFill>
    <StageBg />
    <Stairs p={st} />
    <Arti t={t} img="arti/stand_present.png" w={464} h={738} scale={sc} x={cx - W / 2} y={fy - H} />
    <div style={{position: 'absolute', left: 80, top: 250, opacity: pr(t, S[13] + 0.2, 0.5)}}>
      <div style={{fontFamily: BODY, fontWeight: 600, fontSize: 42, color: B.ink}}>selangkah lebih</div>
      <div style={{fontFamily: HEAD, fontSize: 150, color: B.orange, lineHeight: 1, letterSpacing: -3}}>BERARTI.</div>
    </div>
    <Pill t={t} at={T.follow + 0.15} text="FOLLOW @FIRASBYZI" x={80} y={510} size={36} />
    <div style={{position: 'absolute', left: 80, top: 640, opacity: pr(t, T.end - 0.1, 0.4), display: 'flex', alignItems: 'baseline', gap: 16}}>
      <span style={{fontFamily: BODY, fontWeight: 700, fontSize: 96, color: B.orange, letterSpacing: -2}}>berarti.</span>
      <span style={{fontFamily: BODY, fontWeight: 600, fontSize: 24, letterSpacing: 10, color: B.ink}}>ACADEMY</span>
    </div>
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
  const cont = idx === 7;
  const inP = idx === 0 || cont ? 1 : pr(t, start, 0.24);
  // dynamic transition: quick slide-up wipe on scene change
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
