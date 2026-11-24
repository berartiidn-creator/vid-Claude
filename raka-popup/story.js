// Timeline (single source of truth). Word times come from the voice-over alignment (words.json).
export const DUR = 52.3;
export const T = {
  raka: .14, idenya: 2.34, dipakai: 2.66, tapi1: 3.60, padahal: 5.64, ide9: 7.98, tapi: 10.06, nanti: 13.04, jadi: 14.80, diam: 16.30,
  sampai: 17.02, temannya: 17.42, mirip: 18.88, semua: 19.98, angguk: 21.00, malam: 21.82, aku: 24.86, atau: 26.42, takut: 27.32,
  pelan: 28.12, paham: 28.82, rendah: 29.60, sedangkan: 32.84, berani: 34.56, menawarkan: 35.30, dua: 37.16, bareng: 39.54,
  rapat2: 40.38, kalimat: 42.56, usulan: 43.26, kalau: 44.90, gak: 46.84, follow: 47.88, ngomong: 50.96, end: 51.45,
};
// page turns [start, end]; spread 0 = meeting, 1 = night, 2 = next meeting
export const TURNS = [[21.15, 22.75], [39.95, 41.45]];
export const CLOSE = [48.9, 50.4];          // the book closes
// speech / thought bubbles: [who, t0, t1, text, kind]
export const BUB = [
  ['bimo', T.idenya + .05, T.padahal - .35, 'Gimana kalau kita...', 'say'],
  ['bimo', T.temannya, T.semua - .1, 'Aku ada ide, nih!', 'say'],
  ['raka', T.aku, T.pelan - .35, 'Aku ini rendah hati... atau cuma takut?', 'think'],
  ['raka', T.usulan - .05, T.kalau - .2, 'Aku punya satu usulan.', 'say'],
];
// narration subtitles are hidden while a bubble shows the same words
export const MUTE_SUBS = [[T.aku - .05, T.pelan - .2], [T.usulan - .1, T.kalau - .15]];
