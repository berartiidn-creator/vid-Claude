# BERARTI web app

Satu situs untuk semuanya: landing page, tes BERARTI Index (36 pertanyaan), hasil gratis, laporan BERARTI Signature, dan aplikasi Arah90 (Gali, Kanvas, Peta 90, Cek-in).

```
Pengunjung → Landing → Tes → nama dan email → Hasil gratis (link berisi skor, dikirim ke email)
   → bayar di Lynk.id → webhook → kode unik per pembeli dikirim ke email
   → kode membuka laporan (isi laporan dibuat di server) dan aplikasi Arah90 (progres disimpan di server)
```

| Bagian | Tempat | Isi |
| --- | --- | --- |
| Tampilan | `src/` (React + Vite) | Landing, tes, hasil, laporan, Arah90, halaman privasi, syarat, refund |
| Logika tes | `shared/index-model.js` | Soal, skor, archetype, aturan seri. Sama dengan sheet Hasil Index di workbook |
| Server | `api/` (fungsi Vercel) | `lead`, `event`, `lynk-webhook`, `redeem`, `progress`, `ai` |
| Isi laporan berbayar | `api/_lib/content.js` | Hanya ada di server, tidak ikut ke halaman. Semua teks masih DRAF |
| Penyimpanan dan email | `apps-script/Code.gs` | Google Sheets milikmu dan Gmail |

## Yang harus disiapkan sebelum rilis

1. **Isi `src/config.js`**: tiga link produk Lynk.id, nomor WhatsApp, nomor layanan darurat (cek sendiri), dan `ADA_EBOOK`.
2. **Baca dan rapikan isi laporan** di `api/_lib/content.js`, serta halaman privasi, syarat, dan refund di `src/pages/Legal.jsx`. Semuanya draf.
3. **Foto Firas** untuk bagian "Di balik tes ini" (sekarang kotak abu-abu di `src/pages/Landing.jsx`).

## Pemasangan

### A. Google Sheets dan Apps Script
1. Buat Google Sheet baru. Biarkan aksesnya **Dibatasi**.
2. Extensions > Apps Script. Hapus isi `Code.gs`, tempel isi `apps-script/Code.gs`.
3. Project Settings > Script properties: tambah `SECRET` berisi teks acak panjang (minimal 32 karakter). Simpan teks ini, dipakai di langkah C.
4. Pilih fungsi `setup`, klik Run, izinkan aksesnya. Lima tab muncul: leads, purchases, progress, ai, events.
5. Deploy > New deployment > Web app. Execute as: **Me**. Who has access: **Anyone**. Salin URL web app-nya.
   Aman dibuka publik karena setiap permintaan wajib membawa `SECRET`.

### B. Lynk.id
1. Buat tiga produk digital. Judulnya harus mengandung kata kunci ini (bisa diubah lewat variabel di langkah C):
   - "Signature" untuk Rp49.000, misalnya "BERARTI Signature"
   - "Arah90" untuk Rp99.000, misalnya "BERARTI Signature + Arah90"
   - "Upgrade" untuk Rp50.000, misalnya "Upgrade ke Arah90" (kata "Upgrade" dicek lebih dulu)
2. Di pengaturan webhook Lynk.id, isi URL: `https://DOMAINMU/api/lynk-webhook`. Setelah disimpan, Lynk.id menampilkan **merchant key**; salin untuk langkah C.
3. Di deskripsi produk dan pesan terima kasih, tulis: "Kode akses dikirim ke email yang kamu pakai saat membayar. Pakai email yang sama dengan saat mengerjakan tes."

### C. Vercel
1. Import repo ini ke Vercel, Root Directory: `berarti-app`.
2. Environment Variables:

| Nama | Isi |
| --- | --- |
| `APPS_SCRIPT_URL` | URL web app dari langkah A5 |
| `APPS_SCRIPT_SECRET` | Teks `SECRET` dari langkah A3 |
| `LYNK_MERCHANT_KEY` | Merchant key dari langkah B2 |
| `GEMINI_API_KEY` | API key Google AI Studio |
| `SITE_URL` | Alamat situs, misalnya `https://berarti.id` |
| `ADMIN_EMAIL` | Email untuk notifikasi pembelian yang perlu dicek manual |
| `GEMINI_MODEL` (opsional) | Default `gemini-2.5-flash` |
| `AI_LIMIT_DAY`, `AI_LIMIT_TOTAL` (opsional) | Batas pemakaian AI per kode, default 40 per hari dan 400 total |

3. Deploy, lalu sambungkan domain dan pasang link-nya di bio Instagram.

## Uji sebelum rilis
1. Kerjakan tes sampai hasil muncul. Cek email hasil masuk dan baris baru muncul di tab `leads`.
2. Beli paket Signature dengan email yang sama, pakai nominal kecil atau voucher kalau Lynk.id mengizinkan. Cek email kode akses, baris di tab `purchases`, dan laporan terbuka.
3. Beli upgrade. Kode yang sama harus berubah menjadi Arah90.
4. Buka Arah90 di perangkat lain dengan kode yang sama. Coba Gali, Kanvas, dan Cek-in.

## Pengembangan lokal
```
npm install
npm run build && npm run serve        # http://localhost:8787, penyimpanan dan AI tiruan
node tests/e2e.mjs                    # uji alur lengkap (23 pemeriksaan)
```
Tanpa `APPS_SCRIPT_URL`, data disimpan di `.data/dev-store.json`. Tanpa `GEMINI_API_KEY`, AI membalas jawaban contoh.

## Batasan yang perlu diketahui
- Gmail akun pribadi bisa mengirim sekitar 100 email per hari lewat Apps Script. Kalau pendaftar sudah ratusan per hari, pindahkan pengiriman email ke layanan email khusus.
- Google Sheets cukup untuk ribuan baris. Kalau data sudah puluhan ribu baris, pindahkan ke database.
- Pembeli yang memakai email berbeda di Lynk.id dan di tes tetap menerima kode, tapi harus membuka link hasil dari email tesnya sendiri untuk melihat laporan.
