// POST /api/lead: save the test result + contact, email the result link
import { send, body, store, isEmail, clean, mailResult, CFG } from './_lib/server.js';
import { decodeScores, encodeScores, strongest, ARCHETYPES, total } from '../shared/index-model.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { ok: false });
  const b = body(req);
  const s = decodeScores(b.s), name = clean(b.name, 80), email = clean(b.email, 120).toLowerCase(), wa = clean(b.wa, 20).replace(/[^0-9]/g, '');
  if (!s || !name || !isEmail(email) || b.consent !== true) return send(res, 400, { ok: false, error: 'Data belum lengkap.' });
  const archetype = ARCHETYPES[strongest(s)].name, sc = encodeScores(s);
  const resultUrl = `${CFG.SITE_URL}/hasil?s=${sc}${b.reflection === 'ya' ? '&r=ya' : ''}`;
  try {
    await store('saveLead', { lead: { name, email, wa, consent: true, scores: sc, total: total(s), archetype, reflection: b.reflection === 'ya' ? 'ya' : (b.reflection === 'tidak' ? 'tidak' : ''), utm: clean(b.utm, 80) } });
    const m = mailResult({ name, archetype, resultUrl });
    await store('sendMail', { to: email, subject: m.subject, html: m.html });
  } catch (e) { console.error('lead', e.message); return send(res, 502, { ok: false, error: 'Hasilmu tetap tampil, tapi email belum terkirim. Coba lagi nanti.' }); }
  send(res, 200, { ok: true });
}
