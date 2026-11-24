// Runs apps-script/Code.gs against fake Google services to check every action the server uses.
import fs from 'node:fs'; import vm from 'node:vm';
const sheets = {}; const mails = [];
const mkSheet = name => ({ data: [], appendRow(r) { this.data.push([...r]); }, getLastRow() { return this.data.length; }, setFrozenRows() {},
  getDataRange() { const d = this.data; return { getValues: () => d.map(r => [...r]) }; }, getRange(r, c) { const d = this.data; return { setValue: v => { d[r - 1][c - 1] = v; } }; } });
const ctx = {
  SpreadsheetApp: { getActive: () => ({ getSheetByName: n => sheets[n] || null, insertSheet: n => (sheets[n] = mkSheet(n)) }) },
  PropertiesService: { getScriptProperties: () => ({ getProperty: () => 's3cret' }) },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  ContentService: { MimeType: { JSON: 'json' }, createTextOutput: t => ({ setMimeType: () => JSON.parse(t) }) },
  MailApp: { sendEmail: m => mails.push(m) }, JSON, Date, String, Number, Object, console,
};
vm.createContext(ctx); vm.runInContext(fs.readFileSync(new URL('../apps-script/Code.gs', import.meta.url), 'utf8'), ctx);
ctx.setup();
const call = (action, p = {}) => ctx.doPost({ postData: { contents: JSON.stringify({ secret: 's3cret', action, ...p }) } });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
ok(ctx.doPost({ postData: { contents: JSON.stringify({ secret: 'x', action: 'getPurchase' }) } }).ok === false, 'wrong secret refused');
call('saveLead', { lead: { name: 'Rina', email: 'r@x.id', scores: '50-63-63-58-58-58', reflection: 'ya' } });
ok(call('latestLead', { email: 'r@x.id' }).lead.scores === '50-63-63-58-58-58', 'latestLead');
call('createPurchase', { purchase: { code: 'BRT-AAAA-BBBB', refId: 'ref1', email: 'r@x.id', tier: 'signature', status: 'paid', createdAt: '2026-11-24T00:00:00Z' } });
ok(call('findPurchaseByRef', { refId: 'ref1' }).purchase.code === 'BRT-AAAA-BBBB', 'findPurchaseByRef');
ok(call('findSignatureByEmail', { email: 'r@x.id' }).purchase.tier === 'signature', 'findSignatureByEmail');
call('setTier', { code: 'BRT-AAAA-BBBB', tier: 'arah90' }); ok(call('getPurchase', { code: 'BRT-AAAA-BBBB' }).purchase.tier === 'arah90', 'setTier');
call('saveProgress', { code: 'BRT-AAAA-BBBB', data: { a: 1 } }); call('saveProgress', { code: 'BRT-AAAA-BBBB', data: { a: 2 } });
ok(call('loadProgress', { code: 'BRT-AAAA-BBBB' }).data.a === 2 && sheets.progress.data.length === 2, 'progress upsert');
call('incrAI', { code: 'C', day: 'd1' }); call('incrAI', { code: 'C', day: 'd1' }); const r = call('incrAI', { code: 'C', day: 'd2' });
ok(r.total === 3 && r.today === 1, 'incrAI counts total and per day');
call('sendMail', { to: 'r@x.id', subject: 's', html: '<b>h</b>' }); ok(mails.length === 1 && mails[0].htmlBody === '<b>h</b>', 'sendMail');
ok(call('nope').ok === false, 'unknown action');
console.log(fails ? fails + ' failed' : 'apps script: all checks passed'); process.exit(fails ? 1 : 0);
