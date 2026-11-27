/**
 * BERARTI data layer: Google Sheets storage + Gmail sending, called only by the BERARTI server (Vercel).
 * Setup: Extensions > Apps Script in a NEW private Google Sheet, paste this file, set Script Property SECRET,
 * run setup() once, then Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone).
 */
const SHEETS = {
  leads: ['at', 'name', 'email', 'wa', 'consent', 'scores', 'total', 'archetype', 'reflection', 'utm'],
  purchases: ['code', 'refId', 'email', 'name', 'phone', 'tier', 'amount', 'status', 'createdAt', 'upgradedAt'],
  progress: ['code', 'data', 'updatedAt'],
  ai: ['code', 'day', 'count', 'total'],
  events: ['at', 'type', 'sid', 'detail', 'utm'],
};

function setup() {
  const ss = SpreadsheetApp.getActive();
  Object.keys(SHEETS).forEach(name => {
    const sh = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sh.getLastRow() === 0) sh.appendRow(SHEETS[name]);
    sh.setFrozenRows(1);
  });
  if (!PropertiesService.getScriptProperties().getProperty('SECRET')) throw new Error('Set Script Property SECRET first (Project Settings > Script properties).');
}

function out(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function sheet(name) { return SpreadsheetApp.getActive().getSheetByName(name); }
function rows(name) { const v = sheet(name).getDataRange().getValues(); const h = v.shift(); return v.map((r, i) => { const o = { _row: i + 2 }; h.forEach((k, j) => (o[k] = r[j])); return o; }); }
function append(name, obj) { sheet(name).appendRow(SHEETS[name].map(k => obj[k] === undefined ? '' : obj[k])); }
function setCell(name, row, key, val) { sheet(name).getRange(row, SHEETS[name].indexOf(key) + 1).setValue(val); }
function asPurchase(r) { if (!r) return null; const p = {}; SHEETS.purchases.forEach(k => (p[k] = r[k] instanceof Date ? r[k].toISOString() : String(r[k]))); return p; }

function doGet() { return out({ ok: true, service: 'berarti' }); }

function doPost(e) {
  let p; try { p = JSON.parse(e.postData.contents); } catch (x) { return out({ ok: false, error: 'bad json' }); }
  if (!p.secret || p.secret !== PropertiesService.getScriptProperties().getProperty('SECRET')) return out({ ok: false, error: 'forbidden' });
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const now = new Date().toISOString();
    switch (p.action) {
      case 'saveLead': append('leads', Object.assign({ at: now }, p.lead)); return out({ ok: true });
      case 'latestLead': { const l = rows('leads').filter(r => r.email === p.email).pop(); return out({ ok: true, lead: l ? { scores: String(l.scores), reflection: String(l.reflection), name: String(l.name) } : null }); }
      case 'logEvent': append('events', Object.assign({ at: now }, p.event)); return out({ ok: true });
      case 'findPurchaseByRef': return out({ ok: true, purchase: asPurchase(rows('purchases').find(r => String(r.refId) === p.refId)) });
      case 'createPurchase': append('purchases', p.purchase); return out({ ok: true });
      case 'getPurchase': return out({ ok: true, purchase: asPurchase(rows('purchases').find(r => r.code === p.code)) });
      case 'findSignatureByEmail': return out({ ok: true, purchase: asPurchase(rows('purchases').filter(r => r.email === p.email && r.tier === 'signature').pop()) });
      case 'setTier': { const r = rows('purchases').find(x => x.code === p.code); if (r) { setCell('purchases', r._row, 'tier', p.tier); setCell('purchases', r._row, 'upgradedAt', now); } return out({ ok: true }); }
      case 'loadProgress': { const r = rows('progress').find(x => x.code === p.code); return out({ ok: true, data: r ? JSON.parse(r.data) : null }); }
      case 'saveProgress': { const r = rows('progress').find(x => x.code === p.code), data = JSON.stringify(p.data);
        if (r) { setCell('progress', r._row, 'data', data); setCell('progress', r._row, 'updatedAt', now); } else append('progress', { code: p.code, data, updatedAt: now });
        return out({ ok: true }); }
      case 'incrAI': { const all = rows('ai').filter(x => x.code === p.code), total = all.reduce((a, x) => a + Number(x.count), 0) + 1, r = all.find(x => x.day === p.day);
        let today = 1; if (r) { today = Number(r.count) + 1; setCell('ai', r._row, 'count', today); setCell('ai', r._row, 'total', total); } else append('ai', { code: p.code, day: p.day, count: 1, total });
        return out({ ok: true, total, today }); }
      case 'sendMail': MailApp.sendEmail({ to: p.to, subject: p.subject, htmlBody: p.html, name: 'BERARTI' }); return out({ ok: true });
      default: return out({ ok: false, error: 'unknown action' });
    }
  } catch (x) { return out({ ok: false, error: String(x) }); }
  finally { lock.releaseLock(); }
}
