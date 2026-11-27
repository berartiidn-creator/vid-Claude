// POST /api/event: funnel log (start, finish, form, pay_click, redeem...). No personal data.
import { send, body, store, clean } from './_lib/server.js';
const TYPES = new Set(['view', 'start', 'q12', 'q24', 'finish', 'form', 'result', 'pay_click', 'redeem', 'story', 'app_open']);
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { ok: false });
  const b = body(req); if (!TYPES.has(b.type)) return send(res, 400, { ok: false });
  try { await store('logEvent', { event: { type: b.type, sid: clean(b.sid, 40), detail: clean(b.detail, 60), utm: clean(b.utm, 60) } }); } catch (e) { console.error('event', e.message); }
  send(res, 200, { ok: true });
}
