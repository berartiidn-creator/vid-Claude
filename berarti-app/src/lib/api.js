// Browser helpers: API calls, funnel events, small storage wrappers
const sid = (() => { try { let s = sessionStorage.getItem('brt_sid'); if (!s) { s = Math.random().toString(36).slice(2, 10); sessionStorage.setItem('brt_sid', s); } return s; } catch { return 'nosession'; } })();
export const utm = (() => { try { const q = new URLSearchParams(location.search); const u = q.get('utm_source') || q.get('src') || sessionStorage.getItem('brt_utm') || ''; if (u) sessionStorage.setItem('brt_utm', u); return u; } catch { return ''; } })();
export async function api(path, data) {
  const r = await fetch('/api/' + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  let j = {}; try { j = await r.json(); } catch {}
  if (!r.ok || !j.ok) throw new Error(j.error || 'Koneksi bermasalah. Coba lagi.');
  return j;
}
export function track(type, detail = '') { try { navigator.sendBeacon?.('/api/event', new Blob([JSON.stringify({ type, sid, detail, utm })], { type: 'application/json' })) || fetch('/api/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, sid, detail, utm }) }); } catch {} }
export const ls = {
  get(k, d = null) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};
export const rupiah = n => 'Rp' + n.toLocaleString('id-ID');
