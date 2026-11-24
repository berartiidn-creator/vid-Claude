// POST /api/lynk-webhook: Lynk.id payment.received → unique access code, emailed to the buyer
import { send, body, store, newCode, lynkSignatureOk, tierFromItems, mailAccess, CFG, clean } from './_lib/server.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { ok: false });
  const b = body(req), sig = req.headers['x-lynk-signature'];
  if (!lynkSignatureOk(b, sig)) return send(res, 401, { ok: false, error: 'bad signature' });
  const d = b.data || {}, md = d.message_data || {};
  if (b.event !== 'payment.received' || d.message_action !== 'SUCCESS') return send(res, 200, { ok: true, ignored: true });
  const refId = clean(md.refId, 80), email = clean(md.customer?.email, 120).toLowerCase(), name = clean(md.customer?.name, 80) || 'kamu', phone = clean(md.customer?.phone, 20);
  const tier = tierFromItems(md.items);
  try {
    const dup = await store('findPurchaseByRef', { refId });
    if (dup.purchase) return send(res, 200, { ok: true, duplicate: true });       // Lynk retries: never issue twice
    const notify = async (subject, html) => CFG.ADMIN_EMAIL && store('sendMail', { to: CFG.ADMIN_EMAIL, subject, html });
    if (!tier) { await notify('BERARTI: pembayaran Lynk tanpa paket dikenali', `<p>refId ${refId}, ${email}, judul: ${(md.items || []).map(i => i.title).join(', ')}</p>`); return send(res, 200, { ok: true, unknown: true }); }
    const { lead } = await store('latestLead', { email });
    const s = lead?.scores, r = lead?.reflection === 'ya' ? '&r=ya' : '';
    if (tier === 'upgrade') {
      const { purchase } = await store('findSignatureByEmail', { email });
      if (!purchase) { await notify('BERARTI: upgrade tanpa pembelian Signature', `<p>${name} (${email}) membayar upgrade, refId ${refId}, tapi tidak ada pembelian Signature dengan email ini. Cek manual.</p>`); await store('createPurchase', { purchase: { code: newCode(), refId, email, name, phone, tier: 'upgrade-unmatched', amount: md.totals?.grandTotal, status: 'review', createdAt: new Date().toISOString() } }); return send(res, 200, { ok: true, review: true }); }
      await store('setTier', { code: purchase.code, tier: 'arah90' });
      await store('createPurchase', { purchase: { code: purchase.code + '-UP', refId, email, name, phone, tier: 'upgrade-applied', amount: md.totals?.grandTotal, status: 'applied', createdAt: new Date().toISOString() } });
      const m = mailAccess({ name, tier: 'arah90', code: purchase.code, reportUrl: s ? `${CFG.SITE_URL}/laporan?s=${s}${r}&k=${purchase.code}` : '', appUrl: `${CFG.SITE_URL}/arah90?k=${purchase.code}` });
      await store('sendMail', { to: email, subject: m.subject, html: m.html });
      return send(res, 200, { ok: true, upgraded: true });
    }
    const code = newCode();
    await store('createPurchase', { purchase: { code, refId, email, name, phone, tier, amount: md.totals?.grandTotal, status: 'paid', createdAt: new Date().toISOString() } });
    const m = mailAccess({ name, tier, code, reportUrl: s ? `${CFG.SITE_URL}/laporan?s=${s}${r}&k=${code}` : '', appUrl: `${CFG.SITE_URL}/arah90?k=${code}`,
      upgradeNote: 'Mau mengubah laporan ini jadi Peta 90 Hari dengan aplikasi Arah90? Dalam 7 hari, kamu bisa upgrade dengan menambah Rp50.000. Pakai email yang sama saat membayar upgrade.' });
    await store('sendMail', { to: email, subject: m.subject, html: m.html });
    send(res, 200, { ok: true });
  } catch (e) { console.error('webhook', e.message); send(res, 500, { ok: false }); }
}
