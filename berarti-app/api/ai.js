// POST /api/ai {code, task, payload}: the Arah90 AI (Gemini, key kept on the server). Tasks: gali, gali_summary, kanvas, cekin.
import { send, body, store, getAccess, gemini, today, CFG, clean } from './_lib/server.js';
import { DIMS } from '../shared/index-model.js';

const BASE = `Kamu adalah pendamping refleksi di aplikasi BERARTI Arah90. Bahasa Indonesia santai dan sopan, sapaan "kamu", kalimat pendek.
Kamu bukan psikolog dan tidak memberi diagnosis. Jangan memakai dalil agama sebagai dasar klaim; refleksi iman hanya kalau pengguna sendiri membawanya.
Jangan memakai tanda pisah panjang (em dash) dan jangan memakai simbol ampersand.
Kalau pengguna menyebut ingin menyakiti diri atau merasa tidak aman, berhenti dari latihan, tunjukkan empati, dan sarankan menghubungi orang terdekat atau layanan profesional.`;
const dimName = id => (DIMS.find(d => d.id === id) || {}).name || id;
const txt = (role, text) => ({ role, parts: [{ text: clean(text, 2000) }] });

function mock(task, p) {
  if (task === 'gali') return { reply: `Terima kasih sudah cerita. Coba ceritakan satu contoh nyata minggu ini yang berhubungan dengan ${dimName(p.pillar).toLowerCase()}. Apa yang terjadi, dan apa yang kamu rasakan?` };
  if (task === 'gali_summary') return { summary: `Di pilar ${dimName(p.pillar)}, kamu sedang belajar mengenali pola dirimu. Hal yang paling terasa: kamu butuh langkah kecil yang konkret, bukan rencana besar.` };
  if (task === 'kanvas') return { kanvas: { siapaAku: 'Orang yang belajar dengan mencoba dan peduli pada dampak.', nilaiku: 'Jujur, bertumbuh, bermanfaat.', arahku: 'Menguji satu arah karier selama 90 hari.', alasanku: 'Ingin hidup yang terasa berarti, bukan sekadar sibuk.', kekuatanku: 'Berani mulai, cepat belajar.', langkahPertama: 'Ngobrol dengan satu orang yang sudah menjalani arah ini minggu ini.' } };
  if (task === 'cekin') return { feedback: 'Kamu tetap bergerak walau minggu ini berat. Itu yang paling penting.', nextWeek: ['Kerjakan satu aksi dari Peta 90 Hari selama 30 menit di hari Selasa.', 'Tulis satu hal yang berhasil di hari Jumat.'] };
  return {};
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { ok: false });
  const b = body(req), task = b.task, p = b.payload || {};
  if (!['gali', 'gali_summary', 'kanvas', 'cekin'].includes(task)) return send(res, 400, { ok: false });
  try {
    const acc = await getAccess(b.code); if (!acc || acc.tier !== 'arah90') return send(res, 403, { ok: false, error: 'Kode ini belum termasuk Arah90.' });
    const lim = await store('incrAI', { code: acc.code, day: today() });
    if (lim.total > CFG.AI_LIMIT_TOTAL || lim.today > CFG.AI_LIMIT_DAY) return send(res, 429, { ok: false, error: 'Batas pemakaian AI hari ini sudah tercapai. Lanjutkan besok, progresmu aman tersimpan.' });
    if (!CFG.GEMINI_API_KEY) return send(res, 200, { ok: true, mock: true, ...mock(task, p) });
    const ctx = `Archetype pengguna: ${clean(p.archetype, 60)}. Skor 6 dimensi: ${clean(p.scoresText, 200)}.`;
    if (task === 'gali') {
      const sys = `${BASE}\n${ctx}\nTugas: membantu pengguna menggali pilar "${dimName(p.pillar)}". Ajukan SATU pertanyaan lanjutan yang spesifik berdasarkan jawaban terakhirnya. Maksimal 2 kalimat, tanpa nasihat panjang.`;
      const history = (p.history || []).slice(-10).map(m => txt(m.role === 'ai' ? 'model' : 'user', m.text));
      const out = await gemini(sys, history.length ? history : [txt('user', 'Mulai')], { maxTokens: 200 });
      return send(res, 200, { ok: true, reply: out });
    }
    if (task === 'gali_summary') {
      const sys = `${BASE}\n${ctx}\nTugas: rangkum percakapan tentang pilar "${dimName(p.pillar)}" jadi 2 sampai 3 kalimat insight yang jujur dan menguatkan, memakai kata-kata pengguna sendiri. Tanpa daftar, tanpa judul.`;
      const history = (p.history || []).slice(-12).map(m => txt(m.role === 'ai' ? 'model' : 'user', m.text));
      return send(res, 200, { ok: true, summary: await gemini(sys, history, { maxTokens: 220 }) });
    }
    if (task === 'kanvas') {
      const sys = `${BASE}\n${ctx}\nTugas: isi Life Design Canvas dari insight pengguna. Balas JSON dengan kunci persis: siapaAku, nilaiku, arahku, alasanku, kekuatanku, langkahPertama. Tiap nilai satu kalimat pendek (maks 20 kata), konkret, memakai bahasa pengguna.`;
      const ins = Object.entries(p.insights || {}).map(([k, v]) => `${dimName(k)}: ${clean(v, 600)}`).join('\n');
      const raw = await gemini(sys, [txt('user', ins || 'Belum ada insight.')], { json: true, maxTokens: 500 });
      let kanvas; try { kanvas = JSON.parse(raw); } catch { return send(res, 502, { ok: false, error: 'AI belum bisa mengisi canvas. Coba lagi.' }); }
      return send(res, 200, { ok: true, kanvas });
    }
    if (task === 'cekin') {
      const sys = `${BASE}\n${ctx}\nTugas: cek-in mingguan Peta 90 Hari. Fokus fase sekarang: "${clean(p.fokus, 120)}". Aksi minggu ini: ${clean((p.aksi || []).join(' | '), 400)}.
Balas JSON dengan kunci: feedback (2 kalimat, jujur dan hangat, sebut satu kemajuan nyata), nextWeek (array 2 aksi untuk minggu depan, masing-masing satu kalimat, konkret, bisa dikerjakan di bawah 1 jam, disesuaikan dengan hambatan dan energinya).`;
      const a = p.answers || {};
      const raw = await gemini(sys, [txt('user', `Minggu ke-${Number(p.week) || 1}. Yang sudah dikerjakan: ${clean(a.done, 500)}. Hambatan: ${clean(a.hambatan, 500)}. Energi (1-5): ${clean(a.energi, 2)}.`)], { json: true, maxTokens: 400 });
      let j; try { j = JSON.parse(raw); } catch { return send(res, 502, { ok: false, error: 'AI belum bisa membaca cek-in. Coba lagi.' }); }
      return send(res, 200, { ok: true, feedback: j.feedback, nextWeek: (j.nextWeek || []).slice(0, 3) });
    }
  } catch (e) { console.error('ai', e.message); send(res, 502, { ok: false, error: 'AI sedang sibuk. Coba lagi sebentar.' }); }
}
