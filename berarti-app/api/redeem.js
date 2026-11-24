// POST /api/redeem {code, s?, r?}: check the code, return the paid report built on the server
import { send, body, store, getAccess } from './_lib/server.js';
import * as M from '../shared/index-model.js';
import { buildReport } from './_lib/content.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { ok: false });
  const b = body(req);
  try {
    const p = await getAccess(b.code);
    if (!p || !['signature', 'arah90'].includes(p.tier)) return send(res, 404, { ok: false, error: 'Kode belum cocok. Cek email setelah pembayaran atau hubungi kami di WhatsApp.' });
    let s = M.decodeScores(b.s), reflection = b.r === 'ya' ? 'ya' : '';
    if (!s) { const { lead } = await store('latestLead', { email: p.email }); s = M.decodeScores(lead?.scores); if (lead?.reflection === 'ya') reflection = 'ya'; }
    if (!s) return send(res, 409, { ok: false, error: 'Skormu belum ditemukan. Buka link hasil dari email, atau kerjakan tesnya dengan email yang sama.' });
    const upgradeUntil = p.tier === 'signature' ? new Date(new Date(p.createdAt).getTime() + 7 * 864e5).toISOString() : null;
    send(res, 200, { ok: true, tier: p.tier, code: p.code, scores: M.encodeScores(s), report: buildReport({ scores: s, tier: p.tier, reflection, model: M }), upgradeUntil });
  } catch (e) { console.error('redeem', e.message); send(res, 502, { ok: false, error: 'Server sedang sibuk. Coba lagi sebentar.' }); }
}
