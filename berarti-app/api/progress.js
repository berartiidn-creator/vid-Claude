// POST /api/progress {code, action: load|save, data}: Arah90 progress kept on the server (works across devices)
import { send, body, store, getAccess } from './_lib/server.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { ok: false });
  const b = body(req);
  try {
    const p = await getAccess(b.code); if (!p || p.tier !== 'arah90') return send(res, 403, { ok: false, error: 'Kode ini belum termasuk Arah90.' });
    if (b.action === 'load') { const { data } = await store('loadProgress', { code: p.code }); return send(res, 200, { ok: true, data: data || null, name: p.name }); }
    if (b.action === 'save') { const raw = JSON.stringify(b.data || {}); if (raw.length > 60000) return send(res, 413, { ok: false, error: 'Data terlalu besar.' }); await store('saveProgress', { code: p.code, data: b.data }); return send(res, 200, { ok: true }); }
    send(res, 400, { ok: false });
  } catch (e) { console.error('progress', e.message); send(res, 502, { ok: false, error: 'Gagal menyimpan. Coba lagi.' }); }
}
