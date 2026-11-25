// BERARTI Reels: CONTENT of one video (C2 "Jangan buka presentasi pakai perkenalan").
// Copy this file's structure for a new video: timing, poses, narration blocks, scenes, sound cues, cover text.
import React from 'react';
import {Easing, Img, interpolate, staticFile} from 'remotion';
import {Pose} from './Char';
import {at, endOf, words} from './lib/words';
import {AUD, Badge, Blk, C, Card, Hi, Check, Chip, CoverStill, CW, Cue, DISPLAY, FONT, In, M, MONO, Person, Pop, ReelShell, ReelSpec, Row, Section, SH,
  clamp, expoOut, prog, springAt, useSpring, useT} from './kit';
import {Marker} from './cover';

// ============================================================ timing (from forced alignment)
const T = {
  perk: at('perkenalkan'), nama1: at('nama saya'), ganti1: at('Ganti'),
  s2: at('Di detik-detik'), dengar: at('didengerin'), nggak: at('atau nggak'), dan: at('Dan nama'), belum: at('belum'),
  s3: at('Ganti dengan'), satu: at('satu kalimat masalah'), misal: at('Misalnya'), keu: at('keuangan'), siapa: at('Siapa'), dua5: at('dua puluh lima'),
  sepuluh: at('sepuluh'), bingung: at('bingung'),
  s4: at('Kasih jeda'), dua: at('dua detik'), mikir: at('mikir'),
  s5: at('Baru setelah'), saya: at('Saya Firas'), hari: at('hari ini'), beres: at('beresin'),
  s6: at('Namamu'), cuma: at('Cuma sekarang'), alasan: at('alasan buat'),
  s7: at('Simpan'), end: Math.ceil((endOf('berikutnya') + 1.5) * 10) / 10,
};
const STAMP = T.nama1 + 0.5;
// the video opens on the cover frame, holds it through the hook line, then the cover breaks apart into S1
const CV = T.perk - 0.6;
const MORPH = 0.55;
const TAP = T.s7 + 0.75;
// ending: the character grows back on "kamu", then the save card turns back into the cover so the loop is seamless
const G = at('kamu berikutnya') - 0.08;
const L = T.end - 0.8;

// ============================================================ character performance
const POSES: Pose[] = [
  {t: 0, pose: 'tunjuk_kamu', expr: 'serius', mouth: 'flat', head: 0},           // cover pose: points at the viewer on "Berhenti"
  {t: 0.05, beat: true},
  {t: CV + 0.3, pose: 'tunjuk_atas', expr: 'netral', lid: 0.42, brow: 6, head: 3, lean: -1.2, ease: 0.35},   // bored lecture
  {t: T.ganti1 - 0.1, pose: 'semangat', expr: 'ceria', lid: 0, brow: 0, mouth: 'smile', head: 0, lean: 0, beat: true},
  {t: T.s2, pose: 'bertanya', expr: 'netral', brow: 3, browAsym: 6, head: 2, nod: true},
  {t: T.dengar, nod: true},
  {t: T.nggak, browAsym: 0, brow: 1, head: -2, lean: 1},
  {t: T.dan, pose: 'tunjuk_kamu', expr: 'serius', mouth: 'flat', head: 0, lean: 0, beat: true},
  {t: T.s3, pose: 'tawarkan', expr: 'ramah', mouth: 'smile', head: -2, beat: true},
  {t: T.satu, nod: true},
  {t: T.misal, pose: 'menyapa', head: 3},
  {t: T.siapa - 0.15, pose: 'sambutan', expr: 'ceria', mouth: 'grin', head: -3, lean: -1.2, ease: 0.25},
  {t: T.dua5, nod: true},
  {t: T.bingung - 0.05, expr: 'terkejut', beat: true, head: 3, lean: 1},
  {t: T.s4, pose: 'menyapa', expr: 'netral', brow: 2, mouth: 'smile', head: 0, lean: 0},
  {t: T.dua + 0.45, lid: 0.55, head: 3, ease: 0.6},
  {t: T.mikir - 0.25, pose: 'bertanya', lid: 0, browAsym: 7, head: -2},
  {t: T.s5, pose: 'hitung_tiga', expr: 'ramah', browAsym: 0, brow: 0, head: 0, beat: true},   // "three": step 3 of 3
  {t: T.saya, pose: 'tulus', head: -2, nod: true},
  {t: T.hari, pose: 'tawarkan', head: 1},
  {t: T.beres - 0.05, pose: 'tepuk', expr: 'ceria', beat: true, head: 0},
  {t: T.s6, pose: 'sambutan', expr: 'ramah', head: 2, lean: 1},
  {t: T.cuma, pose: 'semangat', expr: 'serius', nod: true, head: -2, lean: 0},
  {t: T.alasan, expr: 'ceria', beat: true},
  {t: T.s7, pose: 'tunjuk_kamu', expr: 'ramah', mouth: 'smile', head: -2, beat: true},
  {t: G + 0.75, wink: true, head: 2},
  {t: L + 0.1, expr: 'serius', mouth: 'flat', head: 0},   // lands on the cover face, same as frame 0
];

// close-up reaction shots that pop beside the character on emotional beats
const POPS: Pop[] = [
  {at: T.bingung - 0.05, dur: 1.35, img: 'cu_bingung', tilt: 6},
  {at: T.dua + 0.2, dur: 1.9, img: 'cu_merenung', tilt: -5},
  {at: T.alasan - 0.05, dur: 1.3, img: 'cu_semangat', tilt: 5},
];

// ============================================================ narration headline (word indices into src/words.json)
const BLOCKS: Blk[] = [
  {a: 4, b: 6}, {a: 7, b: 10}, {a: 11, b: 13}, {a: 14, b: 19}, {a: 20, b: 21, big: 21}, {a: 22, b: 27},
  {a: 28, b: 32}, {a: 33, b: 35}, {a: 36, b: 39}, {a: 40, b: 46}, {a: 47, b: 49}, {a: 50, b: 51, big: 51},
  {a: 52, b: 55}, {a: 56, b: 58, big: 58}, {a: 59, b: 61}, {a: 62, b: 69}, {a: 70, b: 72}, {a: 73, b: 74},
  {a: 75, b: 79, big: 79}, {a: 80, b: 85},
];
const FLOODS: [number, number][] = [[words[51].start - 0.1, words[52].start - 0.1], [words[79].start - 0.1, L]];
const TRANS = [T.s2, T.s3, T.s4, T.s5, T.s6, T.s7];
const KW = new Set([5, 8, 9, 12, 13, 19, 23, 25, 32, 35, 39, 44, 45, 46, 49, 53, 54, 55, 63, 68, 70, 77, 80]);
const UL = new Set([5, 25, 32, 53, 63, 80]);

// ============================================================ sound cues (SFX from public/audio/lemo)
const CUES: Cue[] = (() => {
  const c: Cue[] = [[0.0, 'pop_hi', 0.07], [CV - 0.05, 'whoosh', 0.15], [CV + 0.4, 'pop', 0.09]];
  for (let x = T.perk; x < T.nama1 + 0.4; x += 0.085) c.push([x, 'click', 0.05]);
  c.push([STAMP, 'thump', 0.4], [STAMP + 0.01, 'clack', 0.18], [T.ganti1, 'whoosh_short', 0.12], [T.ganti1 + 0.06, 'pop_hi', 0.08]);
  [T.s2, T.s3, T.s4, T.s5, T.s6, T.s7].forEach((s) => c.push([s - 0.08, 'whoosh', 0.16]));
  for (let k = 0; k < 7; k++) c.push([T.s2 + 0.12 + k, 'click_lo', 0.07]);
  c.push([T.dengar, 'pop', 0.08], [T.nggak + 0.05, 'click', 0.1], [T.nggak + 0.3, 'click', 0.07], [T.dan, 'whoosh_short', 0.1], [T.belum, 'pop_hi', 0.1]);
  c.push([T.s3 + 0.04, 'thump', 0.16], [T.satu, 'pop', 0.08], [T.keu - 0.05, 'whoosh_short', 0.1], [T.siapa - 0.08, 'whoosh_short', 0.1], [T.dua5, 'clack', 0.12], [T.sepuluh, 'clack', 0.12]);
  for (let k = 0; k < 4; k++) c.push([T.bingung + 0.08 + k * 0.09, 'pop', 0.05]);
  c.push([T.s4 + 0.04, 'thump', 0.16], [T.dua, 'click_lo', 0.12], [T.dua + 1, 'click_lo', 0.12], [T.mikir - 0.15, 'pop', 0.06]);
  [0, 1, 2].forEach((i) => c.push([T.s5 + 0.12 + i * 0.16, 'pop', 0.06]));
  c.push([T.s5 + 0.04, 'thump', 0.16], [T.saya - 0.05, 'whoosh_short', 0.1], [T.saya + 0.12, 'pop', 0.09], [T.beres + 0.05, 'ding', 0.14]);
  c.push([T.s6 + 0.12, 'pop', 0.08], [T.cuma - 0.05, 'whoosh_short', 0.1], [T.alasan, 'ding', 0.1]);
  POPS.forEach((p) => c.push([p.at, 'pop_hi', 0.1], [p.at + p.dur, 'whoosh_short', 0.05]));
  c.push([words[51].start - 0.1, 'thump', 0.16], [words[79].start - 0.1, 'thump', 0.13]);
  c.push([G - 0.06, 'whoosh', 0.14], [G + 0.55, 'pop', 0.07], [L - 0.05, 'whoosh_short', 0.12], [L + 0.5, 'pop_hi', 0.06]);
  c.push([T.s7 + 0.08, 'whoosh_short', 0.1], [TAP, 'click', 0.2], [TAP + 0.03, 'ding', 0.12], [TAP + 0.12, 'pop', 0.07]);
  return c;
})();

// ============================================================ scenes
const S1: React.FC = () => {
  const {t} = useT();
  const full = 'Perkenalkan, nama saya';
  const n = Math.floor(interpolate(t, [T.perk, T.nama1 + 0.4], [0, full.length], clamp));
  const sk = (k: number) => prog(t, T.nama1 + 0.05 + k * 0.08, 0.4);
  const st = useSpring(STAMP, {damping: 9, stiffness: 260, mass: 0.7});
  const dim = prog(t, STAMP, 0.3);
  return (
    <Section from={0} to={T.s2}>
      <In at={CV + 0.36} style={{left: M, top: 420}}>
        <Card w={CW} h={520} pad={0} sweep={CV + 0.75} style={{overflow: 'hidden'}}>
          <div style={{height: 66, background: '#F1EBE3', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 12, fontFamily: MONO, fontSize: 24, color: C.soft}}>
            {[C.red, '#E8B04A', '#4CB37A'].map((c) => <span key={c} style={{width: 16, height: 16, borderRadius: 9, background: c}} />)}
            <span style={{marginLeft: 14}}>presentasi.pptx</span><span style={{marginLeft: 'auto', color: C.faint}}>Slide 1 / 24</span>
          </div>
          <div style={{padding: '54px 56px', display: 'flex', gap: 44, opacity: 1 - dim * 0.55, filter: `grayscale(${dim})`}}>
            <div style={{width: 176, height: 176, borderRadius: 999, background: '#ECE5DB', flexShrink: 0, overflow: 'hidden', position: 'relative'}}>
              <div style={{position: 'absolute', left: 54, top: 30, width: 68, height: 68, borderRadius: 99, background: '#D3C9BC'}} />
              <div style={{position: 'absolute', left: 28, top: 108, width: 120, height: 90, borderRadius: '60px 60px 0 0', background: '#D3C9BC'}} />
            </div>
            <div style={{flex: 1}}>
              <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 54, color: C.ink, lineHeight: 1.1, minHeight: 120}}>
                {full.slice(0, n)}<span style={{display: 'inline-block', width: 5, height: 54, background: C.orange, marginLeft: 4, verticalAlign: -6, opacity: n < full.length && Math.floor(t * 4) % 2 ? 1 : 0}} />
              </div>
              {[0.9, 0.7, 0.8].map((w, k) => <div key={k} style={{height: 18, borderRadius: 9, background: '#EFE8DF', width: `${w * 100 * sk(k)}%`, marginTop: 22}} />)}
            </div>
          </div>
          <div style={{position: 'absolute', left: 56, bottom: 40, display: 'flex', gap: 14, opacity: 1 - dim * 0.55}}>
            {['Jabatan', 'Pengalaman', 'Hobi'].map((x, k) => <div key={x} style={{fontFamily: FONT, fontWeight: 700, fontSize: 26, color: C.soft, background: '#F4EFE8',
              padding: '10px 22px', borderRadius: 14, opacity: sk(k + 1)}}>{x}</div>)}
          </div>
          {t >= STAMP && <div style={{position: 'absolute', right: 70, top: 170, transform: `rotate(-12deg) scale(${2.4 - 1.4 * st})`, opacity: Math.min(1, st * 2),
            border: `8px solid ${C.red}`, color: C.red, borderRadius: 18, padding: '6px 26px', fontFamily: DISPLAY, fontWeight: 400, fontSize: 84, letterSpacing: 6}}>SKIP</div>}
        </Card>
      </In>
      <In at={T.ganti1} from="right" style={{right: 140, top: 960}}><Chip bg={C.orange} size={36}>⇄ ganti 1 kalimat</Chip></In>
    </Section>
  );
};

const S2: React.FC = () => {
  const {t, f, fps} = useT();
  const el = Math.max(0, t - T.s2 - 0.12);
  const tick = Math.floor(el) + interpolate(el % 1, [0, 0.16], [0, 1], {...clamp, easing: Easing.out(Easing.back(2.2))});
  const ang = tick * 45;
  return (
    <Section from={T.s2} to={T.s3}>
      <In at={T.s2 + 0.25} style={{left: M, top: 430}}>
        <Card w={CW} h={420} pad={40}>
          <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: FONT, fontWeight: 700, fontSize: 28, color: C.soft}}>
            <span>Dengerin atau skip?</span>
            <span style={{opacity: prog(t, T.nggak + 0.4, 0.3)}}><b style={{color: C.green}}>2</b> dengerin · <b style={{color: C.red}}>4</b> skip</span>
          </div>
          <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 52}}>
            {AUD.map((c, i) => {
              const yes = i === 1 || i === 4;
              const p1 = springAt(f, fps, T.dengar + i * 0.04);
              const p2 = springAt(f, fps, T.nggak + 0.05 + i * 0.07);
              const look = yes ? 0 : Math.min(1, p2);
              return <div key={i} style={{opacity: !yes ? 1 - 0.4 * look : 1, position: 'relative'}}>
                <Person c={c} size={124} look={look}>
                  {yes && <Badge p={p1} bg={C.green} style={{right: -8, top: -14}}>✓</Badge>}
                  {!yes && <div style={{position: 'absolute', left: 40, top: 70, width: 46, height: 64, borderRadius: 10, background: C.ink, transform: `translateY(${(1 - p2) * 40}px) scale(${p2})`}}>
                    <div style={{margin: 6, height: 40, borderRadius: 5, background: '#7FB2E5'}} /></div>}
                </Person>
              </div>;
            })}
          </div>
        </Card>
      </In>
      <In at={T.s2 + 0.12} from="pop" style={{right: M - 22, top: 368}}>
        <div style={{background: C.ink, borderRadius: 28, padding: '14px 16px 12px', boxShadow: SH, transform: `scale(${(1 + 0.06 * Math.max(0, 1 - (el % 1) * 5)) * (1 - prog(t, T.nggak + 0.15, 0.3, Easing.in(Easing.back(2))))})`}}>
          {/* stopwatch, no digits: "the first seconds" without implying a specific number */}
          <svg width={96} height={104} viewBox="0 0 96 104" style={{display: 'block'}}>
            <rect x={38} y={0} width={20} height={11} rx={4} fill="#fff" />
            <rect x={45} y={9} width={6} height={10} fill="#fff" />
            <rect x={76} y={18} width={12} height={8} rx={3} fill="#fff" transform="rotate(45 82 22)" />
            <circle cx={48} cy={60} r={38} fill="none" stroke="#3A3F3D" strokeWidth={9} />
            <circle cx={48} cy={60} r={38} fill="none" stroke={C.orange} strokeWidth={9} strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 38 * (((ang % 360) + 360) % 360) / 360} 999`} transform="rotate(-90 48 60)" />
            <line x1={48} y1={60} x2={48} y2={32} stroke="#fff" strokeWidth={6} strokeLinecap="round" transform={`rotate(${ang} 48 60)`} />
            <circle cx={48} cy={60} r={6} fill={C.orange} stroke="#fff" strokeWidth={3} />
          </svg>
        </div>
      </In>
      <In at={T.dan} from="left" style={{left: M, top: 900}}>
        <Card w={380} pad={24} style={{border: `4px solid ${C.green}`}}>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 22, color: C.green, letterSpacing: 3}}>HALO, NAMA SAYA</div>
          <div style={{fontFamily: DISPLAY, fontWeight: 400, fontSize: 52, color: C.ink}}>Firas</div>
        </Card>
      </In>
      <In at={T.belum - 0.05} from="pop" style={{left: M + 410, top: 924}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{fontFamily: DISPLAY, fontWeight: 400, fontSize: 84, color: C.orange, lineHeight: 1}}>≠</div>
          <Chip bg={C.orange} size={34}>alasan nyimak</Chip>
        </div>
      </In>
    </Section>
  );
};

const S3: React.FC = () => {
  const {t, f, fps} = useT();
  const q = 'Siapa yang gajian tanggal 25, tapi tanggal 10 udah bingung?'.split(' ');
  const qw = words.filter((w) => w.start >= T.siapa - 0.01 && w.start <= T.bingung + 0.01);
  const spokenCount = qw.filter((w) => t >= w.start).length;
  const per = [1, 1, 1, 1, 3, 1, 1, 1, 1];
  let acc = 0, vis = 0; per.forEach((n, i) => { acc += n; if (acc <= spokenCount) vis = i + 1; });
  const flip = (a: number) => interpolate(springAt(f, fps, a, {damping: 11, stiffness: 150, mass: 0.8}), [0, 1], [-95, 0]);
  return (
    <Section from={T.s3} to={T.s4}>
      <In at={T.satu} from="left" style={{left: M, top: 370}}><div style={{display: 'flex', gap: 14}}><Chip bg={C.ink} size={28}>1 kalimat</Chip><Chip bg={C.orangeTint} fg={C.orangeDeep} size={28}>dari sisi audiens</Chip></div></In>
      {t < T.keu - 0.05 && <In at={T.satu + 0.15} style={{left: M, top: 480}}>
        <Card w={CW} pad="34px 40px">
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 24, color: C.orange, letterSpacing: 4}}>TEMPLATE PEMBUKA</div>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 58, color: C.ink, marginTop: 14, display: 'flex', alignItems: 'flex-end', gap: 16, letterSpacing: -1}}>
            Siapa yang pernah
            <span style={{display: 'inline-block', height: 8, borderRadius: 4, background: C.orange, marginBottom: 14, width: 230 * prog(t, T.satu + 0.5, 0.7)}} />?
          </div>
          <div style={{display: 'flex', gap: 12, marginTop: 22, opacity: prog(t, T.satu + 1.2, 0.5)}}>
            <Chip bg={C.orangeTint} fg={C.orangeDeep} size={26}>masalah nyata</Chip><Chip bg={C.orangeTint} fg={C.orangeDeep} size={26}>dirasain audiens</Chip>
          </div>
        </Card>
      </In>}
      {t >= T.keu - 0.05 && t < T.siapa && <In at={T.keu - 0.05} style={{left: M, top: 480}}>
        <Card w={CW} pad={34} style={{display: 'flex', alignItems: 'center', gap: 30}}>
          <div style={{width: 116, height: 116, borderRadius: 30, background: C.greenTint, color: C.green, fontFamily: DISPLAY, fontWeight: 400, fontSize: 52, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Rp</div>
          <div><div style={{fontFamily: FONT, fontWeight: 700, fontSize: 26, color: C.soft, letterSpacing: 2}}>CONTOH TOPIK</div>
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 56, color: C.ink}}>Presentasi keuangan</div></div>
        </Card>
      </In>}
      {t >= T.siapa && <div style={{position: 'absolute', left: 540 - 230, width: 460, flexWrap: 'wrap', justifyContent: 'center', rowGap: 26, transform: 'scale(1.42)', transformOrigin: '50% 0%', top: 470, display: 'flex', gap: 20, alignItems: 'flex-end', perspective: 800}}>
        {([[T.dua5, '25', 'GAJIAN', C.green], [T.sepuluh, '10', 'BINGUNG', C.orange]] as [number, string, string, string][]).map(([a, n, l, c]) => (
          <div key={n} style={{transform: `rotateX(${flip(a)}deg)`, transformOrigin: 'top', opacity: t >= a ? 1 : 0}}>
            <Card w={196} pad={0} style={{overflow: 'hidden', textAlign: 'center'}}>
              <div style={{background: c, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: 2, padding: 10}}>{l}</div>
              <div style={{fontFamily: DISPLAY, fontWeight: 400, fontSize: 92, color: C.ink, padding: '2px 0 10px'}}>{n}</div>
            </Card>
          </div>
        ))}
        <div style={{display: 'flex', gap: 4, marginLeft: 0}}>
          {AUD.slice(0, 4).map((c, i) => {
            const p = springAt(f, fps, T.bingung + 0.08 + i * 0.09, {damping: 8, stiffness: 200, mass: 0.6});
            return <Person key={i} c={c} size={88}>
              <div style={{position: 'absolute', left: 64, top: 18, width: 18, height: 56, borderRadius: 99, background: c, filter: 'brightness(0.93)',
                transform: `translateY(${(1 - p) * 40}px) rotate(14deg)`, opacity: p > 0.02 ? 1 : 0}} />
            </Person>;
          })}
        </div>
      </div>}
    </Section>
  );
};

const S4: React.FC = () => {
  const {t, f, fps} = useT();
  const p = prog(t, T.dua, 2.0, Easing.linear);
  const n = Math.max(0, 2 - Math.floor(p * 2));
  const pulse = 1 + 0.12 * Math.max(0, 1 - ((t - T.dua) % 1) * 4) * (t >= T.dua && p < 1 ? 1 : 0);
  const R = 160, L = 2 * Math.PI * R;
  return (
    <Section from={T.s4} to={T.s5}>
      <In at={T.s4 + 0.1} style={{left: M, top: 380}}>
        <Card w={CW} h={540} pad={44} style={{display: 'flex', alignItems: 'center', gap: 56}}>
          <div style={{position: 'relative', width: 380, height: 380}}>
            <svg width={380} height={380}><circle cx={190} cy={190} r={R} stroke="#EEE7DD" strokeWidth={30} fill="none" />
              <circle cx={190} cy={190} r={R} stroke={C.green} strokeWidth={30} fill="none" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * p} transform="rotate(-90 190 190)" /></svg>
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 400, fontSize: 168, color: C.ink, transform: `scale(${pulse})`}}>{n}</div>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 30}}>
            {AUD.slice(0, 3).map((c, i) => {
              const q = springAt(f, fps, T.mikir - 0.15 + i * 0.12);
              return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 16}}>
                <Person c={c} size={96} />
                <div style={{opacity: Math.min(1, q), transform: `scale(${q})`, background: '#F4EFE8', borderRadius: 999, padding: '10px 18px', display: 'flex', gap: 8}}>
                  {[0, 1, 2].map((d) => <span key={d} style={{width: 14, height: 14, borderRadius: 9, background: C.soft, opacity: 0.35 + 0.65 * Math.max(0, Math.sin(t * 6 - d * 0.9))}} />)}
                </div>
              </div>;
            })}
          </div>
        </Card>
      </In>
      <In at={T.mikir} from="right" style={{right: 140, top: 960}}><Chip bg={C.green} size={34}>biarin mereka mikir</Chip></In>
    </Section>
  );
};

const S5: React.FC = () => {
  const {t} = useT();
  const sw = t >= T.saya ? -3 + 24 * Math.exp(-(t - T.saya) * 3.2) * Math.cos((t - T.saya) * 9) : 0;
  const ck = prog(t, T.beres + 0.05, 0.5);
  return (
    <Section from={T.s5} to={T.s6}>
      {t < T.saya + 0.3 && <div style={{position: 'absolute', left: M, top: 430, display: 'flex', alignItems: 'center', gap: 16,
        opacity: 1 - prog(t, T.saya - 0.15, 0.3), transform: `translateY(${-50 * prog(t, T.saya - 0.15, 0.3, Easing.in(Easing.cubic))}px)`}}>
        {[['Masalah', C.green, true], ['Jeda', C.green, true], ['Nama', C.orange, false]].map(([lab, col, done], i) => {
          const p = springAt(Math.round(t * 30), 30, T.s5 + 0.12 + i * 0.16, {damping: 12, stiffness: 200, mass: 0.7});
          return <React.Fragment key={i}>
            {i > 0 && <div style={{width: 40 * p, height: 6, borderRadius: 3, background: C.faint}} />}
            <div style={{transform: `scale(${0.4 + 0.6 * p})`, opacity: Math.min(1, p * 1.5)}}>
              <Chip bg={done ? '#fff' : (col as string)} fg={done ? (col as string) : '#fff'} size={42}>{done ? '\u2713 ' : ''}{lab as string}</Chip>
            </div>
          </React.Fragment>;
        })}
      </div>}
      <In at={T.saya - 0.05} from="drop" style={{left: M + 20, top: 410}}>
        <div style={{transform: `rotate(${sw}deg)`, transformOrigin: '50% -40px'}}>
          <div style={{position: 'absolute', left: '50%', top: -44, width: 6, height: 48, marginLeft: -3, background: C.faint, borderRadius: 3}} />
          <Card w={560} pad={0} sweep={T.saya + 0.5} style={{overflow: 'hidden'}}>
            <div style={{background: C.orange, color: '#fff', fontFamily: FONT, fontWeight: 800, fontSize: 30, letterSpacing: 4, padding: '18px 32px'}}>HALO, SAYA</div>
            <div style={{fontFamily: DISPLAY, fontWeight: 400, fontSize: 100, color: C.ink, padding: '14px 32px 30px', letterSpacing: -2}}>Firas</div>
          </Card>
        </div>
      </In>
      <In at={T.hari - 0.05} style={{left: M, top: 770}}>
        <Card w={CW} pad="30px 36px" style={{display: 'flex', alignItems: 'center', gap: 28}}>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 26, color: C.soft, letterSpacing: 3, width: 170}}>HARI INI</div>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 54, color: C.ink, flex: 1, letterSpacing: -1}}>kita beresin itu</div>
          <Check p={ck} size={84} />
        </Card>
      </In>
    </Section>
  );
};

const S6: React.FC = () => {
  const {t} = useT();
  const glow = interpolate(t, [T.alasan, T.alasan + 0.3, T.alasan + 1.2], [0, 1, 0.45], clamp);
  return (
    <Section from={T.s6} to={T.s7}>
      <In at={T.s6 + 0.12} style={{left: M, top: 430}}>
        <Card w={CW} pad={36} style={{opacity: 1 - 0.4 * prog(t, T.cuma, 0.4)}}>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 26, color: C.soft, letterSpacing: 4, marginBottom: 20}}>DULU</div>
          <Row items={['Nama', 'Jabatan', 'lupa']} a={T.s6 + 0.25} dimLast glow={0} hiOn={false} />
        </Card>
      </In>
      <In at={T.cuma - 0.05} style={{left: M, top: 680}}>
        <Card w={CW} pad={36} sweep={T.alasan + 0.1} style={{boxShadow: `${SH}, inset 0 0 0 4px ${C.orange}`}}>
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 26, color: C.orange, letterSpacing: 4, marginBottom: 20}}>SEKARANG</div>
          <Row items={['Masalah', 'Nama', 'diingat']} a={T.cuma + 0.1} hi={2} glow={glow} hiOn={t > T.alasan} />
        </Card>
      </In>
    </Section>
  );
};

const S7: React.FC = () => {
  const {t} = useT();
  const pressed = t > TAP;
  const mv = prog(t, T.s7 + 0.25, TAP - T.s7 - 0.25, Easing.bezier(0.65, 0, 0.35, 1));
  const press = interpolate(t, [TAP - 0.06, TAP, TAP + 0.16], [1, 0.8, 1], clamp);
  const burst = prog(t, TAP, 0.5);
  const bx = 920, by = 868;
  return (
    <Section from={T.s7} to={L}>
      <In at={T.s7 + 0.08} style={{left: M, top: 420}}>
        <Card w={CW} pad={36}>
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <div style={{width: 72, height: 72, borderRadius: 99, padding: 3, background: `linear-gradient(135deg, ${C.orange}, #FFB066)`}}>
              <Img src={staticFile('logo_academy.png')} style={{width: 66, height: 66, borderRadius: 99, border: '3px solid #fff', display: 'block', boxSizing: 'border-box'}} />
            </div>
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 32, color: C.ink}}>berarti.academy</div>
          </div>
          <div style={{marginTop: 24, borderRadius: 22, background: '#F4EFE8', padding: '34px 36px'}}>
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 46, color: C.ink, lineHeight: 1.14, letterSpacing: -1}}>Jangan buka presentasi<br />pakai nama. Pakai<br /><Hi>1 kalimat masalah.</Hi></div>
          </div>
          <div style={{height: 92}} />
        </Card>
      </In>
      <div style={{position: 'absolute', left: bx - 38, top: by - 38, width: 76, height: 76, opacity: prog(t, T.s7 + 0.2, 0.3)}}>
        {[...Array(8)].map((_, k) => (
          <div key={k} style={{position: 'absolute', left: 35, top: 38, width: 6, height: 22, borderRadius: 3, background: C.orange, opacity: burst > 0 && burst < 1 ? 1 - burst : 0,
            transform: `rotate(${k * 45}deg) translateY(${-34 - burst * 36}px)`, transformOrigin: '3px 0'}} />
        ))}
        <svg width={76} height={76} viewBox="0 0 24 24" style={{transform: `scale(${press * (pressed ? 1 + 0.15 * Math.max(0, 1 - burst * 2) : 1)})`}}>
          <path d="M6 3h12v18l-6-4.5L6 21z" fill={pressed ? C.orange : 'none'} stroke={pressed ? C.orange : C.ink} strokeWidth={1.8} strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{position: 'absolute', left: interpolate(mv, [0, 1], [860, bx - 10]), top: interpolate(mv, [0, 1], [975, by - 2]), opacity: prog(t, T.s7 + 0.2, 0.2), transform: `scale(${press})`}}>
        <svg width={70} height={70} viewBox="0 0 24 24"><path d="M9 11V4.5a1.5 1.5 0 0 1 3 0V10l5 1.2c.9.2 1.5 1.1 1.3 2l-1 5.3a2 2 0 0 1-2 1.5H11a2 2 0 0 1-1.6-.8L6 15c-.6-.8 0-2 1-2 .4 0 .8.2 1 .5L9 15z" fill="#fff" stroke={C.ink} strokeWidth={1.3} strokeLinejoin="round" /></svg>
      </div>
      <In at={TAP + 0.12} style={{left: M, top: 980}}><Chip bg={C.ink} size={32}>✓ Tersimpan</Chip></In>
    </Section>
  );
};


// ============================================================ cover (frame 0, also the uploaded thumbnail)
const COVER = {
  headline: <>BERHENTI BUKA<br />PRESENTASI <Marker>PAKAI INI</Marker></>,
  bubble: <>"Perkenalkan,<br />nama saya..."</>,
  pill: <>Gantinya &#8594; <span style={{color: C.orange}}>1 kalimat</span></>,
};

const SPEC: ReelSpec = {end: T.end, cv: CV, morph: MORPH, g: G, l: L, stamp: STAMP, poses: POSES, pops: POPS, cues: CUES,
  blocks: BLOCKS, kw: KW, ul: UL, floods: FLOODS, trans: TRANS, cover: COVER};
export const Reel: React.FC = () => <ReelShell spec={SPEC}><S1 /><S2 /><S3 /><S4 /><S5 /><S6 /><S7 /></ReelShell>;
export const Cover: React.FC = () => <CoverStill spec={SPEC} />;
export const CoverGuides: React.FC = () => <CoverStill spec={SPEC} guides />;
