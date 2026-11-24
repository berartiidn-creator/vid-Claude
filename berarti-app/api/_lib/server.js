// Server helpers for the API functions: config, storage (Apps Script or local mock), codes, email, Gemini.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const CFG = {
  APPS_SCRIPT_URL: process.env.APPS_SCRIPT_URL || '',
  APPS_SCRIPT_SECRET: process.env.APPS_SCRIPT_SECRET || '',
  LYNK_MERCHANT_KEY: process.env.LYNK_MERCHANT_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  SITE_URL: (process.env.SITE_URL || 'http://localhost:8787').replace(/\/$/, ''),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
  AI_LIMIT_TOTAL: Number(process.env.AI_LIMIT_TOTAL || 400),
  AI_LIMIT_DAY: Number(process.env.AI_LIMIT_DAY || 40),
  // Lynk product titles (lowercase substrings) → package; the first match wins, so the upgrade comes first
  PRODUCT_MATCH: [
    ['upgrade', process.env.LYNK_TITLE_UPGRADE || 'upgrade'],
    ['arah90', process.env.LYNK_TITLE_ARAH90 || 'arah90'],
    ['signature', process.env.LYNK_TITLE_SIGNATURE || 'signature'],
  ],
};
export const MOCK = !CFG.APPS_SCRIPT_URL;

// ---------- HTTP ----------
export function send(res, status, obj) { res.status(status).json(obj); }
export function body(req) { const b = req.body; if (!b) return {}; if (typeof b === 'string') { try { return JSON.parse(b); } catch { return {}; } } return b; }
export const isEmail = s => typeof s === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
export const clean = (s, n = 200) => String(s ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);

// ---------- storage ----------
// Apps Script web app: POST {secret, action, ...} → JSON. Local mock: a JSON file (dev only).
const MOCK_FILE = path.join(process.cwd(), '.data', 'dev-store.json');
function mockLoad() { try { return JSON.parse(fs.readFileSync(MOCK_FILE, 'utf8')); } catch { return { leads: [], purchases: {}, progress: {}, ai: {}, events: [], mails: [] }; } }
function mockSave(db) { fs.mkdirSync(path.dirname(MOCK_FILE), { recursive: true }); fs.writeFileSync(MOCK_FILE, JSON.stringify(db, null, 1)); }
async function mockCall(action, p) {
  const db = mockLoad(); let out = { ok: true };
  if (action === 'saveLead') db.leads.push({ ...p.lead, at: new Date().toISOString() });
  else if (action === 'latestLead') out.lead = [...db.leads].reverse().find(l => l.email === p.email) || null;
  else if (action === 'logEvent') db.events.push({ ...p.event, at: new Date().toISOString() });
  else if (action === 'findPurchaseByRef') out.purchase = Object.values(db.purchases).find(x => x.refId === p.refId) || null;
  else if (action === 'createPurchase') db.purchases[p.purchase.code] = p.purchase;
  else if (action === 'getPurchase') out.purchase = db.purchases[p.code] || null;
  else if (action === 'findSignatureByEmail') out.purchase = Object.values(db.purchases).filter(x => x.email === p.email && x.tier === 'signature').pop() || null;
  else if (action === 'setTier') { if (db.purchases[p.code]) { db.purchases[p.code].tier = p.tier; db.purchases[p.code].upgradedAt = new Date().toISOString(); } }
  else if (action === 'loadProgress') out.data = db.progress[p.code] || null;
  else if (action === 'saveProgress') db.progress[p.code] = p.data;
  else if (action === 'incrAI') { const k = p.code, d = p.day; db.ai[k] = db.ai[k] || { total: 0, days: {} }; db.ai[k].total++; db.ai[k].days[d] = (db.ai[k].days[d] || 0) + 1; out.total = db.ai[k].total; out.today = db.ai[k].days[d]; }
  else if (action === 'sendMail') db.mails.push({ to: p.to, subject: p.subject, html: p.html, at: new Date().toISOString() });
  else return { ok: false, error: 'unknown action' };
  mockSave(db); return out;
}
export async function store(action, payload = {}) {
  if (MOCK) return mockCall(action, payload);
  const r = await fetch(CFG.APPS_SCRIPT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ secret: CFG.APPS_SCRIPT_SECRET, action, ...payload }), redirect: 'follow' });
  const txt = await r.text();
  let j; try { j = JSON.parse(txt); } catch { throw new Error('store: bad response ' + txt.slice(0, 200)); }
  if (!j.ok) throw new Error('store: ' + (j.error || 'failed'));
  return j;
}

// ---------- codes ----------
const ALPH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   // no 0/O/1/I
export function newCode() { const b = crypto.randomBytes(8); let s = ''; for (let i = 0; i < 8; i++) s += ALPH[b[i] % ALPH.length]; return `BRT-${s.slice(0, 4)}-${s.slice(4)}`; }
export const normCode = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^BRT/, 'BRT-').replace(/^(BRT-....)(....)$/, '$1-$2');
export async function getAccess(code) {
  const c = normCode(code); if (!/^BRT-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(c)) return null;
  const { purchase } = await store('getPurchase', { code: c });
  return purchase && purchase.status !== 'refunded' ? purchase : null;
}

// ---------- Lynk ----------
export function lynkSignatureOk(bodyObj, signature) {
  if (!CFG.LYNK_MERCHANT_KEY) return false;
  const d = bodyObj?.data, md = d?.message_data;
  const s = String(md?.totals?.grandTotal ?? '') + String(md?.refId ?? '') + String(d?.message_id ?? '') + CFG.LYNK_MERCHANT_KEY;
  const calc = crypto.createHash('sha256').update(s).digest('hex');
  const a = Buffer.from(calc), b = Buffer.from(String(signature || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
export function tierFromItems(items = []) {
  const titles = items.map(i => String(i.title || '').toLowerCase());
  for (const [tier, needle] of CFG.PRODUCT_MATCH) if (titles.some(t => t.includes(needle.toLowerCase()))) return tier;
  return null;
}

// ---------- email (sent by Apps Script with the owner's Gmail; mock writes to the dev store) ----------
const wrap = (title, inner) => `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#171A18">
<div style="background:#0F3822;color:#fff;padding:18px 22px;border-radius:14px 14px 0 0;font-weight:bold;font-size:20px">BERARTI</div>
<div style="background:#FAF3ED;padding:22px;border-radius:0 0 14px 14px"><h2 style="margin-top:0">${title}</h2>${inner}
<p style="font-size:12px;color:#6B6F6A;margin-top:28px">Kamu menerima email ini karena mengerjakan BERARTI Index atau membeli paket BERARTI. Balas email ini kalau ingin berhenti menerima email atau ingin datamu dihapus.</p></div></div>`;
const btn = (href, label) => `<p><a href="${href}" style="background:#FF5500;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:bold">${label}</a></p>`;
export function mailResult({ name, archetype, resultUrl }) {
  return { subject: `Hasil BERARTI Index kamu: ${archetype}`, html: wrap(`Halo ${name}, ini hasilmu`, `<p>Archetype kamu: <b>${archetype}</b>.</p><p>Buka link ini kapan saja, di HP atau laptop mana pun, untuk melihat hasil lengkapmu:</p>${btn(resultUrl, 'Lihat hasilku')}`) };
}
export function mailAccess({ name, tier, code, reportUrl, appUrl, upgradeNote }) {
  const what = tier === 'arah90' ? 'BERARTI Signature + Arah90' : 'BERARTI Signature';
  const extra = tier === 'arah90' ? `<p>Aplikasi Arah90 (Gali, Kanvas, Peta 90 Hari, Cek-in):</p>${btn(appUrl, 'Buka Arah90')}` : (upgradeNote ? `<p>${upgradeNote}</p>` : '');
  return { subject: `Kode akses ${what} kamu`, html: wrap(`Terima kasih, ${name}`, `<p>Pembayaranmu untuk <b>${what}</b> sudah kami terima.</p><p>Kode aksesmu:</p><p style="font-size:26px;font-weight:bold;letter-spacing:2px">${code}</p>${reportUrl ? `<p>Laporanmu:</p>${btn(reportUrl, 'Buka laporanku')}` : `<p>Buka halaman hasil BERARTI Index-mu, lalu masukkan kode ini di bagian "Sudah bayar?".</p>`}${extra}<p>Simpan email ini. Kode ini hanya untukmu, jangan dibagikan.</p>`) };
}

// ---------- Gemini ----------
export async function gemini(system, contents, { json = false, maxTokens = 900 } = {}) {
  if (!CFG.GEMINI_API_KEY) return null;   // caller falls back to the mock
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(CFG.GEMINI_MODEL)}:generateContent`;
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': CFG.GEMINI_API_KEY },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents, generationConfig: { temperature: .7, maxOutputTokens: maxTokens, ...(json ? { responseMimeType: 'application/json' } : {}) } }) });
  if (!r.ok) throw new Error('gemini ' + r.status + ' ' + (await r.text()).slice(0, 200));
  const j = await r.json();
  return (j.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('').trim();
}
export const today = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);   // WIB day
