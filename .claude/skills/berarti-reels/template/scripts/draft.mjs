import {browserOptions, getBundle} from './remotion-env.mjs';
const {renderMedia, selectComposition, openBrowser} = await import('@remotion/renderer');
const out = process.argv[2] ?? 'out/preview-draft.mp4';
const scale = Number(process.env.SCALE ?? 0.5);
const browser = browserOptions();
const {serveUrl} = await getBundle();
const puppeteerInstance = await openBrowser('chrome', {...browser, logLevel: 'error'});
const composition = await selectComposition({serveUrl, id: process.env.COMP ?? 'Reel', puppeteerInstance, ...browser, logLevel: 'error'});
let last = -1;
await renderMedia({serveUrl, composition, codec: 'h264', outputLocation: out, scale, crf: Number(process.env.CRF ?? 24), puppeteerInstance,
  concurrency: Number(process.env.CONC ?? 4), ...browser, logLevel: 'error',
  onProgress: ({progress}) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; console.log(`${p * 10}%`); } }});
await puppeteerInstance.close({silent: true});
console.log('done', out);
