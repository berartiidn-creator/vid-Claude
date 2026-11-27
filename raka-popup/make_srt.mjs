// subtitles_id.srt from the same cue builder the picture uses
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const { buildCues } = await import('./hud.js');
const { MUTE_SUBS } = await import('./story.js');
const cues = buildCues(JSON.parse(fs.readFileSync(path.join(HERE, 'words.json'))).words);
const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60; return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
cues.forEach((c, i) => { if (cues[i + 1]) c.t1 = Math.min(c.t1, cues[i + 1].t0 - .04); });
const out = cues.map((c, i) => `${i + 1}\n${ts(Math.max(0, c.t0))} --> ${ts(c.t1)}\n${c.text}\n`).join('\n');
fs.writeFileSync(path.join(HERE, 'subtitles_id.srt'), out); console.log('cues', cues.length);
