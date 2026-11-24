// The Courage to Speak, Episode 01: a pop-up book on a real desk.
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clamp, lerp, seg, ss, eio, eo, back, TAU, mulberry, track, spring } from './engine/lib.js';
import { cv } from './engine/paper.js';
import { makeBook, coverCanvases, texOf, BW, BD, PG } from './engine/book.js';
import { cutMesh, blobShadow, thread, particles } from './engine/cutmesh.js';
import { makePost } from './engine/post.js';
import * as A from './art.js';
import { T, DUR, TURNS, CLOSE, BUB } from './story.js';
import * as HUD from './hud.js';

const W = 1080, H = 1920;
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('stage').appendChild(renderer.domElement);
const ov = document.getElementById('ov'), OX = ov.getContext('2d');
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(36, W / H, .004, 30);
const post = makePost(renderer, scene, cam, W, H);

// ---------- assets ----------
await Promise.all(['500 40px Fredoka', '600 40px Fredoka', '700 40px Fredoka', '40px "Lilita One"', 'italic 40px "IM Fell English"'].map(f => document.fonts.load(f, 'Aa')));
const WORDS = (await (await fetch('words.json')).json()).words;
const CUES = HUD.buildCues(WORDS);
const LIB = '/core/assets/polyhaven/';
const hdr = await new RGBELoader().loadAsync(LIB + 'lythwood_lounge_2k.hdr'); hdr.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = hdr; scene.background = hdr; scene.backgroundBlurriness = .24; scene.environmentIntensity = .32; scene.backgroundIntensity = .55;
scene.backgroundRotation.set(0, 2.3, 0); scene.environmentRotation.set(0, 2.3, 0);
const tl = new THREE.TextureLoader();
const wt = n => { const t = tl.load(LIB + `walnut_${n}.jpg`); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.2, 1.4); t.anisotropy = 12; return t; };
const wdiff = wt('diff'); wdiff.colorSpace = THREE.SRGBColorSpace;
const desk = new THREE.Mesh(new THREE.BoxGeometry(2.6, .04, 1.7), new THREE.MeshStandardMaterial({ map: wdiff, normalMap: wt('nor'), roughnessMap: wt('rough'), color: '#c9a88a', envMapIntensity: .8 }));
desk.position.set(0, -.02, .25); desk.receiveShadow = true; scene.add(desk);
const gl = new GLTFLoader();
async function prop(name, x, z, s, ry) {
  const m = (await gl.loadAsync(LIB + `${name}/${name}.gltf`)).scene;
  m.position.set(x, 0, z); m.scale.setScalar(s); m.rotation.y = ry;
  m.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
  scene.add(m); return m;
}
const lamp = await prop('desk_lamp_arm_01', -.347, .51, .55, -.76);
lamp.traverse(o => { if (o.isMesh && o.material.name.includes('light')) { o.material = o.material.clone(); o.material.emissive = new THREE.Color('#ffd9a0'); o.material.emissiveIntensity = 6; } });
const tea = await prop('tea_set_01', .02, .02, 1, 0);
{ const keep = { tea_set_01_cup_small_01: [.3, .46, 2.2], tea_set_01_saucer_circular_04: [.3, .46, 0], tea_set_01_teapot_01: [.48, .2, .5], tea_set_01_teapot_01_lid: [.48, .2, .5] }, dead = [];
  tea.traverse(o => { if (!o.name.startsWith('tea_set_01_')) return; const k = keep[o.name]; if (!k) dead.push(o); else { o.position.x = k[0]; o.position.z = k[1]; o.rotation.y = k[2]; } });
  dead.forEach(o => o.parent && o.parent.remove(o)); }

// ---------- book ----------
const iconC = cv(A.CW, A.CH); A.drawPerson(iconC.getContext('2d'), A.LOOKS.raka, { eyes: 'happy', mouth: 'grin', armR: 2.7, elbR: .2, handR: 'open' });
const book = makeBook(coverCanvases((x, px, py, w, h) => x.drawImage(iconC, px, py, w, h)));
scene.add(book.root);
const TX = { meet: texOf(A.wallMeeting('day')), morning: texOf(A.wallMeeting('morning')), mfloor: texOf(A.floorMeeting()), night: texOf(A.wallNight('night')), dawn: texOf(A.wallNight('dawn')), nfloor: texOf(A.floorNight()) };
const S = book.stage, K = book.sky;

// pop-up pieces: each has visible windows [[up, down], ...]; it rises around its bottom edge with overshoot and folds back down
const POPS = [];
function pop(parent, item, x, y, z, wins, o = {}) {
  const g = new THREE.Group(); g.position.set(x, y, z);
  const m = item.isObject3D ? item : cutMesh(item, o); g.add(m); parent.add(g);
  const r = { g, m, wins, dir: o.dir ?? (z > .15 ? 1 : -1), sway: o.sway || 0, ph: x * 40, stage: parent === S, d: o.d || 0 };
  POPS.push(r); return r;
}
function popK(r, t) {
  let k = 0;
  for (const [a, b] of r.wins) { const up = back(seg(t, a + r.d, a + r.d + .55), 1.7), dn = 1 - ss(seg(t, b + r.d * .5, b + r.d * .5 + .4)); k = Math.max(k, Math.min(up, dn)); }
  return k;
}
function updatePops(t) {
  for (const r of POPS) {
    const k = popK(r, t); r.g.visible = k > .002; if (!r.g.visible) continue;
    if (r.stage) r.g.rotation.x = r.dir * (Math.PI / 2) * (1 - k); else r.g.scale.setScalar(Math.max(.001, k));
    if (r.sway) r.m.rotation.z = Math.sin(t * 1.6 + r.ph) * r.sway * k;
  }
}
const SP0 = [[-5, TURNS[0][0] + .3]], SP1 = [[TURNS[0][1] - .85, TURNS[1][0] + .3]], SP2 = [[TURNS[1][1] - .85, CLOSE[0] - .6]];
const COLLEAGUES0 = [[-5, T.padahal - .1], [T.sampai - .35, TURNS[0][0] + .3]];

// --- spread 0 + 2: the meeting room ---
pop(K, A.whiteboard(.11), .1, .13, .004, [...SP0, ...SP2]);
const clockG = new THREE.Group(), clockFace = cutMesh(A.clockFace(.048)); clockG.add(clockFace);
const hHour = cutMesh(A.clockHand(.013, .0035, '#3a2a24')), hMin = cutMesh(A.clockHand(.019, .0025, '#ff5500'));
hHour.position.z = .0012; hMin.position.z = .0018; clockG.add(hHour, hMin);
pop(K, clockG, .175, .235, .004, [...SP0, ...SP2]);
pop(S, A.plant(.07), .19, 0, .05, [...SP0, ...SP2], { sway: .04 });
pop(S, A.plant(.06), -.2, 0, .06, [...SP0, ...SP2], { sway: .04 });
// table + things on it
pop(S, A.table(.27), .0, 0, .158, SP0);
pop(S, A.laptop(.03), .029, .016, .152, COLLEAGUES0);
pop(S, A.mug(.012), -.055, .016, .153, COLLEAGUES0);
pop(S, A.table(.28), .05, 0, .158, SP2);
pop(S, A.laptop(.03), .12, .016, .152, SP2);
pop(S, A.mug(.012), .03, .016, .153, SP2);

// hanging cards (on strings)
function hanger(item, len = .2) { const g = new THREE.Group(), m = cutMesh(item); g.add(m); const th = thread(len); th.position.z = -.0012; g.add(th); S.add(g); return { g, m }; }
// --- spread 1: night ---
pop(S, A.plant(.075), .18, 0, .07, SP1, { sway: .05 });
const sill = pop(S, A.table(.2), .0, 0, .075, SP1);
const sunG = new THREE.Group(); { const st = cutMesh(A.stick(.12)); st.position.y = -.12; const dsc = cutMesh(A.disc(.07)); dsc.position.y = .0; sunG.add(st, dsc); }
S.add(sunG); sunG.position.set(0, -.1, .062);
const cardL = hanger(A.hangCard(.046, 'RENDAH HATI', 'cara kita memandang orang', '#0f3822', 'people'), .22);
const cardR = hanger(A.hangCard(.046, 'PERCAYA DIRI', 'berani menawarkan yang kita punya', '#ff5500', 'mega'), .22);
const pathTex = texOf(A.pathStrip(.05, .14));
const pathM = new THREE.Mesh(new THREE.PlaneGeometry(.05, .14), new THREE.MeshStandardMaterial({ map: pathTex, alphaTest: .5, roughness: .9 }));
pathM.rotation.x = -Math.PI / 2; pathM.receiveShadow = true; const pathG = new THREE.Group(); pathG.add(pathM); pathM.position.z = .07; S.add(pathG); pathG.position.set(0, .0007, .155);

// --- spread 2: the orange disc behind Raka ---
const disc2 = pop(S, A.disc(.075), -.14, .045, .135, [[T.kalimat - .35, CLOSE[0] - .6]], {});

// hanging cards (on strings, in the sky frame or above heads)
const bulb1 = hanger(A.bulb(.022)), bulb2 = hanger(A.bulb(.022));
const cloudIdea = hanger(A.cloudCard(.062, 'idea')), cloudWorry = hanger(A.cloudCard(.075, 'worry'));
const checks = [0, 1, 2, 3, 4].map(() => hanger(A.check(.016), .25));

// ---------- characters ----------
function dynPlane(c, h, side) {
  const t = texOf(c), w = h * c.width / c.height;
  const g = new THREE.PlaneGeometry(w, h); g.translate(0, h / 2 - h * (1 - 1460 / A.CH), 0);
  const m = new THREE.MeshStandardMaterial({ map: t, alphaTest: .5, alphaToCoverage: true, roughness: .85, side });
  const mesh = new THREE.Mesh(g, m); mesh.receiveShadow = true; mesh.castShadow = true;
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: t, alphaTest: .5, side: THREE.DoubleSide });
  return { mesh, t };
}
const HP = .078;
function makeActor(look, withBack = false) {
  const cF = cv(A.CW, A.CH); A.drawPerson(cF.getContext('2d'), look, {});
  const F = dynPlane(cF, HP, withBack ? THREE.FrontSide : THREE.DoubleSide);
  const root = new THREE.Group(), body = new THREE.Group(); body.add(F.mesh); root.add(body);
  let B = null, cB = null;
  if (withBack) { cB = cv(A.CW, A.CH); A.drawPersonBack(cB.getContext('2d'), look, {}); B = dynPlane(cB, HP, THREE.BackSide); body.add(B.mesh); }
  const shadow = blobShadow(HP * .22, .45);
  let key = '';
  return { root, body, shadow,
    pose(p) { const k = JSON.stringify(p, (kk, v) => typeof v === 'number' ? Math.round(v * 30) / 30 : v); if (k === key) return; key = k;
      A.drawPerson(cF.getContext('2d'), look, p); F.t.needsUpdate = true; if (B) { A.drawPersonBack(cB.getContext('2d'), look, p); B.t.needsUpdate = true; } },
    head(v = new THREE.Vector3()) { return v.set(0, HP * .97, 0).applyMatrix4(body.matrixWorld); } };
}
const raka = makeActor(A.LOOKS.raka, true), sari = makeActor(A.LOOKS.sari), bimo = makeActor(A.LOOKS.bimo), nadia = makeActor(A.LOOKS.nadia);
for (const a of [raka, sari, bimo, nadia]) { S.add(a.root); S.add(a.shadow); }

// ---------- acting ----------
const blink = (t, ph = 0) => { const p = (t + ph) % 3.7; return p < .12 ? Math.sin(p / .12 * Math.PI) : 0; };
const k01 = (t, a, d = .35) => eio(seg(t, a, a + d));
const lp = (o, a, b, k) => { const r = {}; for (const key in a) r[key] = typeof a[key] === 'number' ? lerp(a[key], b[key] ?? a[key], k) : (k < .5 ? a[key] : b[key] ?? a[key]); for (const key in b) if (!(key in r)) r[key] = b[key]; return r; };
// keyframed pose: list of [t, pose, dur]
function poseAt(t, keys) { let cur = keys[0][1]; for (let i = 1; i < keys.length; i++) { const [tk, p, d = .35] = keys[i]; if (t < tk) break; cur = lp(null, cur, { ...cur, ...p }, eio(seg(t, tk, tk + d))); } return cur; }
const talk = (t, a, b) => { for (const w of WORDS) { if (w.start < a - .01 || w.start > b) continue; if (t >= w.start && t <= w.end) { const syl = Math.max(1, (w.word.toLowerCase().match(/[aiueo]+/g) || []).length); return .3 + .7 * Math.abs(Math.sin((t - w.start) / Math.max(.08, w.end - w.start) * syl * Math.PI)); } } return 0; };

const TYPE = { armL: .35, armR: .35, elbL: -1.9, elbR: -1.9 };
const HOLD = { armL: .1, armR: .1, elbL: -1.2, elbR: -1.2 };
const RAKA0 = [
  [0, { ...HOLD, eyes: 'open', brows: 'worried', mouth: 'worried', look: [.6, 0], tilt: 0 }],
  [1.3, { look: [-.2, .5] }, .3], [1.9, { look: [.8, -.1] }, .3],
  [T.idenya, { eyes: 'wide', brows: 'up', mouth: 'o' }, .25],
  [T.tapi1, { eyes: 'down', brows: 'sad', mouth: 'sad', look: [.2, .8], tilt: .1, slump: 1 }, .6],
  [T.padahal, { eyes: 'open', brows: 'calm', mouth: 'calm', look: [-.6, -.6], tilt: 0, slump: 0, armL: .1, armR: .1, elbL: -1.2, elbR: -1.2 }, .5],
  [T.ide9 - .1, { armR: -.25, elbR: -2.6, brows: 'think', mouth: 'pressed', look: [.7, -.8], tilt: -.08 }, .5],
  [8.82, { armR: 2.55, elbR: .3, handR: 'point', eyes: 'wide', brows: 'up', mouth: 'grin', look: [.4, -.6], tilt: 0 }, .35],
  [T.tapi, { armR: .1, elbR: -1.2, handR: 'fist', eyes: 'open', brows: 'worried', mouth: 'pressed', look: [-.3, .6] }, .5],
  [11.4, { look: [.5, -.5] }, .4], [12.3, { look: [-.2, .5] }, .4],
  [T.nanti - .1, { eyes: 'down', brows: 'worried', mouth: 'worried', look: [-.6, .5], tilt: -.1, slump: 1 }, .35],
  [T.jadi + .05, { armR: 1.9, elbR: .7, handR: 'open', eyes: 'wide', brows: 'up', mouth: 'o', look: [.5, -.3], tilt: 0, slump: 0 }, .4],
  [T.jadi + .7, { armR: 1.75, elbR: .9, brows: 'worried', mouth: 'pressed', tilt: -.08 }, .25],
  [T.jadi + 1.15, { armR: .1, elbR: -1.2, handR: 'fist', eyes: 'down', brows: 'sad', mouth: 'sad', look: [-.3, 1], tilt: .12, slump: 1 }, .75],
  [T.mirip, { look: [.8, 0], brows: 'worried', mouth: 'pressed', eyes: 'open' }, .4],
  [T.semua + .2, { look: [.2, .9], eyes: 'down', brows: 'sad', mouth: 'sad', tilt: .14 }, .6],
];
const RAKA1 = [
  [0, { armL: .1, armR: .1, elbL: 0, elbR: 0, eyes: 'open', brows: 'sad', mouth: 'calm', look: [.5, -.5], tilt: .06 }],
  [23.0, { armR: -.25, elbR: -2.6, brows: 'think', mouth: 'pressed', look: [.6, -.8], tilt: -.08 }, .6],
  [T.atau, { tilt: .06, look: [.8, -.6] }, .5],
  [T.takut - .1, { armR: .1, elbR: -1.4, eyes: 'wide', brows: 'worried', mouth: 'o', look: [0, 0], tilt: 0 }, .25],
  [T.paham - .06, { armL: .5, armR: .5, elbL: .4, elbR: .4, handL: 'open', handR: 'open', eyes: 'wide', brows: 'up', mouth: 'grin', look: [0, -.3] }, .4],
  [T.paham + .5, { armL: .1, armR: .1, elbL: 0, elbR: 0, handL: 'fist', handR: 'fist', eyes: 'open', brows: 'calm', mouth: 'smile', look: [0, 0] }, .3],
  [T.rendah - .05, { armR: 1.3, elbR: .3, handR: 'open', look: [-.9, 0], tilt: .06 }, .45],
  [T.sedangkan - .3, { armR: .1, elbR: 0, handR: 'fist', look: [0, 0], tilt: 0 }, .35],
  [T.sedangkan + .05, { armL: 1.3, elbL: .3, handL: 'open', look: [.9, 0], tilt: -.06 }, .45],
  [T.berani - .05, { armL: 2.3, elbL: 1.2, handL: 'fist', brows: 'determined', mouth: 'grin', look: [0, -.2], tilt: 0 }, .3],
  [T.menawarkan, { armL: 1.0, elbL: .6, armR: 1.0, elbR: .6, handL: 'open', handR: 'open', brows: 'calm', mouth: 'smile', look: [0, 0] }, .4],
  [T.dua - .1, { armL: .1, elbL: 0, armR: .1, elbR: 0, handL: 'fist', handR: 'fist' }, .35],
  [T.bareng - .3, { eyes: 'happy', mouth: 'smile' }, .3],
];
const RAKA2 = [
  [0, { armL: .1, armR: .1, elbL: 0, elbR: 0, eyes: 'open', brows: 'determined', mouth: 'calm', look: [.6, 0] }],
  [T.kalimat - .2, { brows: 'calm', mouth: 'smile', look: [.8, -.1] }, .4],
  [T.usulan - .45, { armR: -.15, elbR: -.4, handR: 'open' }, .15],
  [T.usulan - .3, { armR: 2.75, elbR: .15, handR: 'open', brows: 'up' }, .4],
  [T.usulan + .45, { armR: .1, elbR: 0, handR: 'fist', armL: 1.0, elbL: .6, handL: 'open', brows: 'calm' }, .45],
  [T.kalau - .1, { armL: .1, elbL: 0, handL: 'fist', look: [0, 0], mouth: 'smile' }, .4],
  [T.gak - .2, { armL: -.35, elbL: -2.35, handL: 'flat', eyes: 'happy', tilt: .08 }, .45],
];
function rakaState(t) {
  const st = { vis: true, x: -.087, y: 0, z: .125, sy: 1, face: 1, pose: null, sit: true };
  let keys = RAKA0;
  if (t >= TURNS[0][1] - .85 && t < TURNS[1][1] - .85) { keys = RAKA1; st.x = 0; st.z = .14; st.sit = false; }
  else if (t >= TURNS[1][1] - .85) { keys = RAKA2; st.x = -.14; st.z = .175; st.sit = false; }
  const p = { ...poseAt(t, keys) }; p.blink = blink(t); st.pose = p;
  if (keys === RAKA0) { // seated behind the table; rises a little when the hand goes up
    st.y = .0 - (p.slump || 0) * .003;
    if (t > T.ide9 && t < T.tapi) st.y += 0;
  }
  if (keys === RAKA1) { // walks forward along the paper path
    const w = seg(t, T.dua + .45, T.bareng + .4); st.z = lerp(.14, .215, w);
    if (w > 0 && w < 1) { const ph = (st.z - .14) / .012 * Math.PI; p.step = Math.sin(ph); st.y = Math.abs(Math.sin(ph)) * .0012; }
  }
  if (keys === RAKA2) { // walks in from the left
    const w = seg(t, TURNS[1][1] - .3, T.rapat2 + 1.6); st.x = lerp(-.2, -.14, eo(w));
    if (w > 0 && w < 1) { const ph = w * 6 * Math.PI; p.step = Math.sin(ph) * (1 - w); st.y = Math.abs(Math.sin(ph)) * .001 * (1 - w); }
    if (t > T.usulan - .05 && t < T.kalau - .1) p.talk = talk(t, T.usulan - .05, T.kalau - .2);
    st.y += Math.sin(seg(t, T.usulan - .3, T.usulan + .1) * Math.PI) * .004;
  }
  // squash on big moments
  const sq = (a, amt = .06) => { const k = seg(t, a, a + .22); if (k > 0 && k < 1) st.sy *= 1 - Math.sin(k * Math.PI) * amt; };
  sq(8.66); sq(T.paham - .2, .08); sq(T.berani - .2); sq(T.usulan - .45);
  return st;
}
const B0 = [[0, { ...TYPE, eyes: 'open', mouth: 'calm', look: [-.2, .6] }], [T.idenya - .2, { armR: .1, elbR: -.5 }, .2],
  [T.idenya, { armR: 2.5, elbR: .35, handR: 'point', eyes: 'wide', brows: 'up', mouth: 'smile', look: [-.2, -.4] }, .35],
  [T.tapi1, { armR: 1.0, elbR: .6, handR: 'open', armL: 1.0, elbL: .6, handL: 'open', brows: 'calm', look: [-.7, 0] }, .4]];
const B4 = [[0, { ...TYPE, eyes: 'open', mouth: 'calm', look: [.3, .4] }], [T.temannya - .1, { armR: 1.0, elbR: .6, handR: 'open', armL: 1.0, elbL: .6, handL: 'open', brows: 'up', mouth: 'smile', look: [.6, 0] }, .4],
  [T.mirip - .1, { armR: 2.5, elbR: .35, handR: 'point', armL: .1, elbL: 0, handL: 'fist', look: [-.2, -.4] }, .35],
  [T.semua, { armR: 1.2, elbR: .4, handR: 'open', armL: 1.2, elbL: .4, handL: 'open', look: [0, 0], eyes: 'happy' }, .4]];
const B2 = [[0, { ...TYPE, eyes: 'open', mouth: 'calm', look: [-.9, 0] }], [T.usulan + .3, { eyes: 'wide', brows: 'up', mouth: 'o' }, .3], [T.usulan + .9, { armL: 2.3, elbL: 1.2, handL: 'fist', eyes: 'happy', mouth: 'grin' }, .35]];
function nodAt(t, t0, n = 3, gap = .3) { const k = (t - t0) / gap; if (k < 0 || k > n) return 0; return Math.sin(k * Math.PI) ** 2 * .1; }
function sideState(t, who) {
  const st = { vis: false, x: 0, y: 0, z: .125, sy: 1, pose: null };
  const s0 = t < TURNS[0][1] - .85, s2 = t >= TURNS[1][1] - .85;
  if (!s0 && !s2) return st;
  const base = { ...TYPE, eyes: 'open', mouth: 'calm', look: [.2, .5] };
  const typing = (a, b) => { if (t > a && t < b) { const f = Math.floor(t * 7) % 2; base.elbL = f ? -1.75 : -2.05; base.elbR = f ? -2.05 : -1.75; } };
  if (s0) {
    const vis = COLLEAGUES0.some(([a, b]) => t > a && t < b + .6); if (!vis) return st;
    if (who === 'bimo') { st.x = .029; st.pose = { ...poseAt(t, t < T.padahal ? B0 : B4) }; st.talk = t < T.padahal ? [T.idenya, T.padahal - .2] : [T.temannya, T.semua - .1];
      if (t > T.temannya - .3 && t < TURNS[0][0] + .3) st.y = back(seg(t, T.temannya - .3, T.temannya + .2), 1.6) * .014; }
    else {
      st.x = who === 'sari' ? -.029 : .087; typing(0, 2.3); typing(T.sampai, T.mirip);
      const t0 = who === 'sari' ? T.tapi1 + .1 : T.semua + .12;
      st.pose = { ...base, ...(t > 2.4 ? { look: [who === 'sari' ? .8 : -.8, 0], mouth: 'smile', brows: 'up' } : {}) };
      if (who === 'nadia' && t < T.padahal) st.pose.look = [-.8, 0];
      st.pose.tilt = nodAt(t, t0) + (who === 'sari' ? nodAt(t, T.semua) : 0);
    }
  } else {
    if (who === 'bimo') { st.x = .06; st.pose = { ...poseAt(t, B2) }; }
    else { st.x = who === 'sari' ? .0 : .12; typing(TURNS[1][1] - .5, 42.1);
      st.pose = { ...base, ...(t > 42.1 ? { look: [-.9, 0] } : {}), ...(t > T.usulan + .2 ? { brows: 'up', mouth: 'smile' } : {}) };
      st.pose.tilt = nodAt(t, T.usulan + .8, 2) * (who === 'sari' ? 1 : -1); }
  }
  st.pose.blink = blink(t, who.length * .7);
  st.vis = true; return st;
}
const charRise = (t, wins) => { let k = 0; for (const [a, b] of wins) k = Math.max(k, Math.min(back(seg(t, a + .15, a + .7), 1.6), 1 - ss(seg(t, b, b + .4)))); return k; };

// ---------- camera ----------
// shot = list of [t, px,py,pz, tx,ty,tz, fov, aper, focus]; a new list = a cut
const SH = [
  [[0, -.06, .082, .37, -.07, .058, .12, 34, 2.6, 0], [2.2, -.074, .078, .32, -.08, .058, .12, 34, 2.6, 0]],
  [[2.25, -.02, .082, .34, .025, .062, .12, 34, 2.6, 0], [3.5, -.016, .08, .32, .025, .062, .12, 34, 2.6, 0]],
  [[3.55, -.082, .072, .26, -.087, .064, .12, 32, 2.8, 0], [5.45, -.085, .07, .235, -.087, .064, .12, 32, 2.8, 0]],
  [[5.5, -.03, .17, .52, -.04, .055, .11, 36, 1.4, 0], [7.85, -.06, .115, .42, -.065, .065, .11, 36, 1.6, 0]],
  [[7.9, -.065, .1, .4, -.068, .085, .12, 34, 2.2, 0], [10.0, -.068, .097, .38, -.07, .084, .12, 34, 2.2, 0], [12.9, -.072, .094, .36, -.072, .082, .12, 34, 2.4, 0], [14.7, -.076, .09, .34, -.076, .08, .12, 34, 2.4, 0]],
  [[14.75, -.08, .078, .27, -.087, .07, .12, 32, 2.6, 0], [16.85, -.08, .082, .31, -.085, .072, .12, 32, 2.6, 0]],
  [[16.9, 0, .11, .68, 0, .058, .12, 36, 1.8, 0], [T.semua, 0, .105, .64, 0, .058, .12, 36, 1.8, 0], [21.1, -.06, .08, .34, -.085, .062, .12, 34, 2.2, 0]],
  [[21.15, -.02, .22, .62, 0, .08, .1, 38, 1.2, 0], [22.6, 0, .28, .62, 0, .09, .1, 38, 1.2, 0], [24.6, 0, .09, .4, 0, .065, .14, 34, 2.2, 0]],
  [[24.7, 0, .082, .3, 0, .07, .14, 32, 2.6, 0], [27.9, 0, .078, .27, 0, .07, .14, 32, 2.8, 0]],
  [[28.0, 0, .078, .27, 0, .07, .14, 32, 2.8, 0], [28.75, 0, .078, .27, 0, .07, .14, 32, 2.8, 0], [29.4, 0, .11, .5, 0, .07, .16, 38, 1.6, 0], [36.9, .004, .115, .52, 0, .07, .16, 38, 1.6, 0]],
  [[37.0, 0, .095, .46, 0, .058, .2, 34, 2.0, 0], [39.9, 0, .088, .43, 0, .062, .22, 34, 2.2, 0]],
  [[39.95, 0, .25, .62, 0, .09, .1, 38, 1.2, 0], [41.4, -.06, .13, .5, -.08, .065, .14, 36, 1.6, 0], [42.7, -.115, .088, .4, -.13, .068, .175, 34, 2.2, 0]],
  [[42.75, -.12, .082, .35, -.135, .072, .175, 32, 2.4, 0], [43.75, -.12, .082, .34, -.135, .072, .175, 32, 2.4, 0], [44.7, 0, .1, .52, 0, .058, .14, 36, 1.8, 0]],
  [[44.8, -.168, .1, .075, -.075, .052, .6, 50, 2.2, .1], [47.7, -.168, .097, .085, -.07, .052, .6, 50, 2.2, .092]],
  [[47.8, 0, .3, .72, 0, .03, .14, 38, 1.4, 0], [CLOSE[0], 0, .42, .8, 0, .02, .14, 38, 1.2, 0], [DUR, 0, .62, .95, 0, .0, .14, 38, 1.0, 0]],
];
const SHOTS = SH.map(keys => ({ t0: keys[0][0], f: track(keys.map(k => [k[0], k.slice(1)])) }));
function camAt(t) { let s = SHOTS[0]; for (const x of SHOTS) if (t >= x.t0) s = x; const v = s.f(t); return { pos: new THREE.Vector3(v[0], v[1], v[2]), tgt: new THREE.Vector3(v[3], v[4], v[5]), fov: v[6], aper: v[7], focus: v[8] }; }

// ---------- lights ----------
const lampHead = new THREE.Vector3(-.28, .375, .44);
const spot = new THREE.SpotLight('#fff0dc', 1, 3, .75, .55, 2); spot.position.copy(lampHead); spot.target.position.set(.02, 0, .2);
spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.bias = -.00006; spot.shadow.normalBias = .0004; spot.shadow.radius = 5; spot.shadow.camera.near = .05; spot.shadow.camera.far = 2;
scene.add(spot, spot.target);
const sun = new THREE.DirectionalLight('#fff3e0', 2.4); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -.00008; sun.shadow.normalBias = .0003; sun.shadow.radius = 4;
Object.assign(sun.shadow.camera, { left: -.3, right: .3, top: .3, bottom: -.3, near: .1, far: 3 }); sun.position.set(-.3, .55, .75); sun.target.position.set(0, .05, .12); scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight('#cfe6ff', '#caa27a', .5); scene.add(hemi);
function lightsAt(t) {
  const night = seg(t, TURNS[0][0] + .6, TURNS[0][1]) * (1 - seg(t, T.paham - .3, T.bareng));
  const morning = seg(t, T.padahal - .1, T.padahal + .5) * (1 - seg(t, T.sampai - .4, T.sampai));
  const closing = seg(t, CLOSE[0] - .6, CLOSE[1]);
  return { sunI: 1.75 - night * 1.3 + morning * .15 - closing * 1.0, sunCol: new THREE.Color('#fff3e0').lerp(new THREE.Color('#ffc98a'), morning).lerp(new THREE.Color('#8fa5ff'), night),
    lampI: .18 + night * .55 + closing * .7, hemiI: .42 - night * .26 - closing * .15 };
}

// ---------- particles ----------
function spriteTex(fn, n = 64) { const c = cv(n, n), x = c.getContext('2d'); fn(x, n); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const starTex = spriteTex((x, n) => { x.translate(n / 2, n / 2); x.fillStyle = '#fff'; x.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = i % 2 ? n * .1 : n * .48; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill(); }, 128);
const glowTex = spriteTex((x, n) => { const g = x.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, n, n); });
const quad = new THREE.PlaneGeometry(1, 1), camQ = new THREE.Quaternion();
const addMat = (map, col) => new THREE.MeshBasicMaterial({ map, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
const bb = fn => (i, t) => { const p = fn(i, t); if (p) { const e = new THREE.Euler().setFromQuaternion(camQ); p.rx = e.x; p.ry = e.y; p.rz = e.z + (p.spin || 0); } return p; };
const SPARK = [[8.85, -.087, .11, .12], [T.paham, 0, .08, .14], [T.bareng - .2, 0, .06, .21], [T.usulan - .2, -.14, .1, .175]];
const PS = [];
const sparks = particles(quad, addMat(starTex, new THREE.Color(2.4, 1.9, .9)), 80, bb((i, t) => {
  const s = SPARK[i % SPARK.length], R = mulberry(i * 13 + 5), t0 = s[0] + R() * .5, life = .8 + R() * .7, k = (t - t0) / life; if (k < 0 || k > 1) return null;
  const a = R() * TAU, r = .015 + R() * .03;
  return { x: s[1] + Math.cos(a) * r * eo(k), y: s[2] + Math.sin(a) * r * eo(k) * .8 + k * .01, z: s[3], s: .004 * Math.sin(k * Math.PI) * (.6 + R()), spin: t * 2 + i };
}));
S.add(sparks); PS.push(sparks);
const dust = particles(quad, addMat(glowTex, new THREE.Color(1.2, 1.0, .75)), 70, bb((i, t) => {
  const R = mulberry(i * 7 + 1), u = R(), v = R(), w = R(), sp = .004 + R() * .006;
  return { x: lerp(-.3, .15, u) + Math.sin(t * .3 + i) * .02, y: .02 + ((v * .38 + t * sp) % .38), z: lerp(.15, .6, w) + Math.cos(t * .23 + i) * .02, s: (.0014 + R() * .002) * (.5 + .5 * Math.sin(t * 1.3 + i * 2)) };
}));
scene.add(dust); PS.push(dust);

// ---------- sound events ----------
const EV = [];
for (const r of POPS) for (const [a, b] of r.wins) { if (a > 0) EV.push({ t: a + r.d + .1, type: 'pop' }); if (b < DUR) EV.push({ t: b + .1, type: 'fold' }); }
for (const [a, b] of TURNS) EV.push({ t: a + .3, type: 'page', d: b - a - .5 });
EV.push({ t: CLOSE[0] + .2, type: 'creak' }, { t: CLOSE[1] - .05, type: 'thump' });
for (let i = 0; i < 20; i++) EV.push({ t: .1 + i * .11, type: 'tick' });
EV.push({ t: T.padahal - .05, type: 'spin', d: .6 });
EV.push({ t: T.dipakai, type: 'ding' }, { t: T.mirip, type: 'ding' }, { t: 8.85, type: 'ding' }, { t: T.ide9 - .2, type: 'string' }, { t: T.nanti - .15, type: 'string' }, { t: T.tapi, type: 'dim' });
EV.push({ t: T.diam - .1 + .45, type: 'sign' }, { t: T.follow + .9 + .45, type: 'sign' });
for (let i = 0; i < 3; i++) EV.push({ t: T.semua + .2 + i * .12, type: 'check' });
for (let i = 0; i < 2; i++) EV.push({ t: T.usulan + .9 + i * .12, type: 'check' });
EV.push({ t: T.paham, type: 'sparkle', d: 1.2 }, { t: T.kalimat - .2, type: 'pop' }, { t: T.dua - .1, type: 'unroll', d: .8 }, { t: T.paham - .3, type: 'slide', d: 1.2 });
for (const e of HUD.blipTimes()) EV.push(e);
{ let prev = 0; for (let f = 0; f < DUR * 30; f++) { const t = f / 30, s = rakaState(t), st = s.pose.step || 0; if (Math.sign(st) !== Math.sign(prev) && Math.abs(st) > .01 && Math.abs(prev) > .01) EV.push({ t, type: 'step' }); prev = st; } }
EV.sort((a, b) => a.t - b.t);
window.EV = EV; window.DUR = DUR;

// ---------- render ----------
function toScreen(v) { const p = v.clone().project(cam); if (p.z > 1) return null; return [(p.x * .5 + .5) * W, (-p.y * .5 + .5) * H]; }
const placeHanger = (h, x, y, z, t0, t1, t, sw = 0) => {
  const vis = t > t0 - .05 && t < t1 + .6; h.g.visible = vis; if (!vis) return;
  const drop = t < t1 ? (1 - spring(t - t0, 5, .4)) : -ss(seg(t, t1, t1 + .5));
  h.g.position.set(x, y + drop * .14 * (t < t1 ? 1 : -1.4), z); h.g.rotation.z = Math.sin((t - t0) * 3 + sw) * .05 * (1 - seg(t, t0, t0 + 2.5));
};
let Tnow = 0;
window.render = function (t) {
  Tnow = t;
  // book open, then closing at the end
  book.setOpen(Math.PI / 2 * (1 - eio(seg(t, CLOSE[0], CLOSE[1]))));
  let spread = t < TURNS[0][0] + .45 ? 0 : t < TURNS[1][0] + .45 ? 1 : 2;
  const turning = t >= TURNS[0][0] + .45 && t < TURNS[0][1] - .3 ? 0 : t >= TURNS[1][0] + .45 && t < TURNS[1][1] - .3 ? 1 : -1;
  const morning = t > T.padahal - .1 && t < T.sampai - .35;
  const sky = [morning ? TX.morning : TX.meet, t > T.bareng - .4 ? TX.dawn : TX.night, TX.meet], ground = [TX.mfloor, TX.nfloor, TX.mfloor];
  book.groundMat.map = ground[spread]; book.backMat.map = sky[turning >= 0 ? turning : spread]; book.groundMat.needsUpdate = book.backMat.needsUpdate = true;
  if (turning >= 0) {
    const [a, b] = TURNS[turning];
    book.leafFront.material.map = ground[turning]; book.leafBack.material.map = sky[turning + 1];
    book.leafFront.material.emissiveMap = book.leafFront.material.map; book.leafBack.material.emissiveMap = book.leafBack.material.map;
    book.leafFront.material.needsUpdate = book.leafBack.material.needsUpdate = true;
    book.setLeaf(eio(seg(t, a + .45, b - .3)));
  } else book.setLeaf(0);
  updatePops(t);
  if (t > 44.75 && t < 47.78) disc2.g.visible = false;
  // clock: 10 minutes fly by, rewinds to 09:00 for the flashback, back to 10:10, next meeting 09:58
  let mins = 10 * 60 + 600 * eo(seg(t, .1, 2.3)) / 60;
  if (t > T.padahal - .1) mins = lerp(10 * 60 + 10, 9 * 60, eio(seg(t, T.padahal - .1, T.padahal + .5)));
  if (t > T.padahal + .5) mins = 9 * 60 + (t - T.padahal) * 6;
  if (t > T.sampai - .4) mins = lerp(9 * 60 + 70, 10 * 60 + 14, eio(seg(t, T.sampai - .4, T.sampai + .2)));
  if (spread === 2) mins = 9 * 60 + 58 + (t - 41) * .2;
  hMin.rotation.z = -(mins % 60) / 60 * TAU; hHour.rotation.z = -((mins / 60) % 12) / 12 * TAU;
  // morning sun disc (night spread): rises at "paham"
  sunG.visible = spread === 1 || turning === 0; sunG.position.y = lerp(-.11, .06, back(seg(t, T.paham - .3, T.paham + .9), 1.3)) + lerp(0, .03, ss(seg(t, T.bareng - .5, T.bareng + .5)));
  sunG.rotation.z = Math.sin(t * 1.2) * .03;
  // paper path unrolls
  const pk = eo(seg(t, T.dua - .1, T.dua + .7)); pathG.visible = spread === 1 && pk > .01; pathG.scale.set(1, 1, Math.max(.001, pk));
  // hanging cards
  placeHanger(bulb1, .046, .108, .118, T.dipakai, T.padahal - .2, t);
  placeHanger(bulb2, .046, .125, .118, T.mirip, TURNS[0][0], t);
  placeHanger(cloudIdea, -.055, .112, .112, T.ide9 - .2, T.nanti - .25, t, 1);
  placeHanger(cloudWorry, -.06, .11, .108, T.nanti - .15, T.jadi - .1, t, 2);
  if (cloudIdea.g.visible) { cloudIdea.m.rotation.x = 0; cloudIdea.g.scale.setScalar(1); const dim = seg(t, T.tapi, T.tapi + .4); cloudIdea.g.rotation.z += Math.sin(t * 40) * .02 * dim * (1 - seg(t, T.tapi + .4, T.tapi + .6)); }
  placeHanger(cardL, -.037, .098, .17, T.rendah - .05, TURNS[1][0] + .2, t, 1);
  placeHanger(cardR, .037, .098, .17, T.sedangkan + .05, TURNS[1][0] + .2, t, 2);
  const CK = [[-.029, .115, .118, T.semua + .2], [.087, .115, .118, T.semua + .32], [.029, .13, .118, T.semua + .44], [.0, .115, .118, T.usulan + .9], [.06, .115, .118, T.usulan + 1.02]];
  checks.forEach((c, i) => placeHanger(c, CK[i][0], CK[i][1], CK[i][2], CK[i][3], i < 3 ? TURNS[0][0] : CLOSE[0] - .7, t));
  // characters
  const rs = rakaState(t);
  raka.pose(rs.pose); raka.root.position.set(rs.x, rs.y, rs.z); raka.body.scale.set(2 - rs.sy, rs.sy, 1);
  const rv = (t < TURNS[0][0] + .3) || (t > TURNS[0][1] - .85 && t < TURNS[1][0] + .3) || (t > TURNS[1][1] - .85 && t < CLOSE[0] - .6);
  const rk = t < TURNS[0][0] + .3 ? charRise(t, [[-5, TURNS[0][0] + .3]]) : t < TURNS[1][0] + .3 ? charRise(t, [[TURNS[0][1] - .85, TURNS[1][0] + .3]]) : charRise(t, [[TURNS[1][1] - .85, CLOSE[0] - .6]]);
  raka.root.visible = rv && rk > .002; raka.root.rotation.x = -(Math.PI / 2) * (1 - rk);
  raka.shadow.visible = raka.root.visible && !rs.sit; raka.shadow.position.set(rs.x, .0005, rs.z);
  for (const [a, who] of [[sari, 'sari'], [bimo, 'bimo'], [nadia, 'nadia']]) {
    const s = sideState(t, who); a.shadow.visible = false;
    const wins = t < TURNS[0][1] ? COLLEAGUES0.map(([p, q]) => [p, q]) : [[TURNS[1][1] - .85, CLOSE[0] - .6]];
    const k = charRise(t, wins);
    a.root.visible = s.vis && k > .002; if (!a.root.visible) continue;
    if (s.talk) s.pose.talk = talk(t, s.talk[0], s.talk[1]);
    a.pose(s.pose); a.root.position.set(s.x, s.y, s.z); a.root.rotation.x = -(Math.PI / 2) * (1 - k);
  }
  // camera
  const C = camAt(t);
  cam.position.copy(C.pos); cam.fov = C.fov; cam.lookAt(C.tgt); cam.updateProjectionMatrix(); cam.updateMatrixWorld(); camQ.copy(cam.quaternion);
  // lights
  const Lt = lightsAt(t);
  sun.intensity = Lt.sunI; sun.color.copy(Lt.sunCol); spot.intensity = Lt.lampI; hemi.intensity = Lt.hemiI;
  for (const p of PS) p.userData.update(t);
  scene.updateMatrixWorld(true);
  post.dof.focus = C.focus > .001 ? C.focus : C.pos.distanceTo(C.tgt); post.dof.aper = C.aper; post.dof.maxCoc = 14;
  post.vig.uniforms.warm.value = .05; post.vig.uniforms.fade.value = 1 - seg(t, DUR - .6, DUR) * .9;
  post.composer.render();
  // overlay
  OX.clearRect(0, 0, W, H);
  const anchors = {};
  for (const [who, a] of [['raka', raka], ['bimo', bimo]]) if (a.root.visible) { const s = toScreen(a.head()); if (s) anchors[who] = s; }
  HUD.drawBubbles(OX, t, anchors);
  HUD.drawSigns(OX, t, T);
  HUD.drawSubs(OX, t, CUES);
  if (t < .5) { OX.fillStyle = `rgba(0,0,0,${1 - seg(t, 0, .5)})`; OX.fillRect(0, 0, W, H); }
  if (t > DUR - .6) { OX.fillStyle = `rgba(0,0,0,${seg(t, DUR - .6, DUR)})`; OX.fillRect(0, 0, W, H); }
};
window.TEXTS = t => [...HUD.subsTexts(t, CUES), ...HUD.bubbleTexts(t), ...HUD.signTexts(t, T)];
window.DBG = { raka, book, cam };
window.render(0);
window.READY = true;
