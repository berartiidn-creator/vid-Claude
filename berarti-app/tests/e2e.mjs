// End-to-end run in mock mode: test → lead → Lynk webhooks (Signature, upgrade, Arah90) → report → Arah90 app.
// Usage: npm run build && node tests/e2e.mjs   (starts its own server on port 8799 with a fresh mock store)
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');   // the pre-installed Playwright
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PORT = 8799, BASE = `http://localhost:${PORT}`, KEY = 'test-merchant-key', SHOTS = path.join(ROOT, 'tests', 'shots');
fs.rmSync(path.join(ROOT, '.data'), { recursive: true, force: true }); fs.mkdirSync(SHOTS, { recursive: true });
const srv = spawn('node', ['dev-server.mjs'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT), LYNK_MERCHANT_KEY: KEY, SITE_URL: BASE, ADMIN_EMAIL: 'admin@example.com', APPS_SCRIPT_URL: '', GEMINI_API_KEY: '' }, stdio: 'inherit' });
await new Promise(r => setTimeout(r, 900));
const db = () => JSON.parse(fs.readFileSync(path.join(ROOT, '.data', 'dev-store.json'), 'utf8'));
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };

async function webhook(title, amount, email, refId) {
  const message_id = 'API_CALL_' + refId;
  const body = { event: 'payment.received', data: { message_action: 'SUCCESS', message_code: '0', message_id, message_data: { refId, customer: { email, name: 'Rina', phone: '0812' }, items: [{ title, price: amount, qty: 1 }], totals: { grandTotal: amount } } } };
  const sig = crypto.createHash('sha256').update(String(amount) + refId + message_id + KEY).digest('hex');
  const r = await fetch(`${BASE}/api/lynk-webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Lynk-Signature': sig }, body: JSON.stringify(body) });
  return r.json();
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = []; page.on('pageerror', e => errors.push(e.message)); page.on('console', m => m.type() === 'error' && errors.push(m.text()));
try {
  await page.goto(BASE); await page.screenshot({ path: `${SHOTS}/01-landing.png`, fullPage: true });
  await page.getByRole('button', { name: 'Mulai Tes Gratis' }).first().click();
  await page.getByRole('button', { name: 'Mulai' }).click();
  for (let i = 0; i < 36; i++) { await page.locator('.answer').nth(i % 5 === 0 ? 4 : 3).click(); await page.waitForTimeout(220); if (i === 5) await page.screenshot({ path: `${SHOTS}/02-question.png` }); }
  await page.getByRole('button', { name: 'Ya' }).click();
  await page.screenshot({ path: `${SHOTS}/03-form.png`, fullPage: true });
  await page.getByRole('button', { name: 'Lihat Hasilku' }).click();
  ok(await page.locator('.err').isVisible(), 'form blocks empty name');
  await page.fill('#n', 'Rina'); await page.fill('#e', 'rina@example.com'); await page.check('input[type=checkbox]');
  await page.getByRole('button', { name: 'Lihat Hasilku' }).click();
  await page.waitForURL(/\/hasil\?s=/); await page.waitForTimeout(500);
  const url = page.url(); ok(/s=\d+-\d+-\d+-\d+-\d+-\d+/.test(url) && url.includes('r=ya'), 'result URL carries scores and reflection: ' + url.split('?')[1]);
  await page.screenshot({ path: `${SHOTS}/04-result.png`, fullPage: true });
  const d1 = db(); ok(d1.leads.length === 1 && d1.leads[0].email === 'rina@example.com', 'lead stored'); ok(d1.mails.some(m => m.to === 'rina@example.com' && m.html.includes('/hasil?s=')), 'result email queued with link');
  ok(['start', 'finish', 'form', 'result'].every(t => d1.events.some(e => e.type === t)), 'funnel events logged');

  // wrong signature is refused
  const bad = await fetch(`${BASE}/api/lynk-webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Lynk-Signature': 'nope' }, body: JSON.stringify({ event: 'payment.received', data: {} }) });
  ok(bad.status === 401, 'webhook rejects bad signature');
  // Signature purchase → code
  await webhook('BERARTI Signature', 49000, 'rina@example.com', 'ref-sig-1');
  const dup = await webhook('BERARTI Signature', 49000, 'rina@example.com', 'ref-sig-1'); ok(dup.duplicate, 'webhook retry does not issue a second code');
  const sigP = Object.values(db().purchases).find(p => p.refId === 'ref-sig-1'); ok(sigP && sigP.tier === 'signature', 'signature purchase stored: ' + sigP?.code);
  const accessMail = db().mails.find(m => m.subject.includes('Kode akses')); ok(accessMail && accessMail.html.includes(sigP.code) && accessMail.html.includes('/laporan?s='), 'access email has code and report link');

  await page.fill('#code', sigP.code); await page.getByRole('button', { name: 'Buka', exact: true }).click(); await page.waitForTimeout(600);
  ok(await page.getByText('Pola khasmu').first().isVisible(), 'signature report opens');
  ok(!(await page.getByText('Peta 90 Hari').first().isVisible().catch(() => false)) || await page.getByText('Upgrade ke Arah90 Rp50rb').isVisible(), 'signature shows upgrade, not the plan');
  await page.screenshot({ path: `${SHOTS}/05-report-signature.png`, fullPage: true });
  // upgrade
  await webhook('Upgrade ke Arah90', 50000, 'rina@example.com', 'ref-up-1');
  ok(db().purchases[sigP.code].tier === 'arah90', 'upgrade turns the same code into Arah90');
  await page.reload(); await page.waitForTimeout(800);
  ok(await page.getByRole('button', { name: 'Buka aplikasi Arah90' }).isVisible(), 'report shows Arah90 after upgrade');
  // upgrade without a Signature purchase goes to review
  const lone = await webhook('Upgrade ke Arah90', 50000, 'orang@lain.com', 'ref-up-2'); ok(lone.review, 'unmatched upgrade flagged for review');

  // Arah90 app
  await page.getByRole('button', { name: 'Buka aplikasi Arah90' }).click(); await page.waitForTimeout(900);
  await page.screenshot({ path: `${SHOTS}/06-arah90-home.png`, fullPage: true });
  await page.getByRole('button', { name: 'Gali', exact: true }).click();
  for (let k = 0; k < 3; k++) { await page.fill('textarea', 'Jawaban percobaan nomor ' + (k + 1)); await page.locator('button.btn-primary').last().click(); await page.waitForTimeout(500); }
  ok(await page.getByText('Insight').first().isVisible(), 'Gali produces an insight after follow-ups');
  await page.screenshot({ path: `${SHOTS}/07-gali.png`, fullPage: true });
  await page.getByRole('button', { name: 'Kanvas', exact: true }).click(); await page.getByRole('button', { name: 'Isi dari jawabanku' }).click(); await page.waitForTimeout(600);
  ok((await page.locator('.kbox textarea').first().inputValue()).length > 5, 'Kanvas filled');
  await page.screenshot({ path: `${SHOTS}/08-kanvas.png`, fullPage: true });
  await page.getByRole('button', { name: 'Cek-in', exact: true }).click();
  await page.locator('textarea').nth(0).fill('Ngobrol dengan mentor'); await page.locator('textarea').nth(1).fill('Waktu sempit'); await page.getByRole('button', { name: 'Kirim cek-in' }).click(); await page.waitForTimeout(800);
  ok(await page.getByText('Untuk minggu depan').isVisible(), 'Cek-in returns next week');
  await page.getByRole('button', { name: 'Peta 90', exact: true }).click(); await page.locator('.todo input').first().check(); await page.waitForTimeout(1200);
  await page.screenshot({ path: `${SHOTS}/09-peta.png`, fullPage: true });
  const prog = db().progress[sigP.code]; ok(prog && prog.gali && Object.keys(prog.kanvas).length === 6 && prog.cekin.length === 1 && Object.values(prog.peta).some(Boolean), 'progress saved on the server');
  // another device: fresh context, only the code
  const p2 = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await p2.goto(`${BASE}/arah90`); await p2.fill('#c', sigP.code.toLowerCase()); await p2.getByRole('button', { name: 'Masuk' }).click(); await p2.waitForTimeout(900);
  ok(await p2.getByText('Sudah diisi').isVisible(), 'progress loads on another device (code typed in lowercase)');
  await p2.screenshot({ path: `${SHOTS}/10-desktop-arah90.png` });
  // direct Arah90 purchase with no lead: report link absent, code still works in the app
  await webhook('BERARTI Signature + Arah90', 99000, 'baru@example.com', 'ref-a90-1');
  const a90 = Object.values(db().purchases).find(p => p.refId === 'ref-a90-1'); ok(a90?.tier === 'arah90', 'direct Arah90 purchase');
  const red = await (await fetch(`${BASE}/api/redeem`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: a90.code }) })).json();
  ok(!red.ok && /Skormu belum ditemukan/.test(red.error), 'redeem without scores explains what to do');
  // legal pages
  await page.goto(`${BASE}/refund`); ok(await page.getByRole('heading', { name: 'Kebijakan Refund' }).isVisible(), 'refund page');
  ok(errors.length === 0, 'no page errors ' + errors.join(' | '));
} catch (e) { console.error(e); fails++; }
await browser.close(); srv.kill();
console.log(fails ? `\n${fails} check(s) failed` : '\nall checks passed');
process.exit(fails ? 1 : 0);
