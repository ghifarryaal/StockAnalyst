# Setup Supabase untuk Stock Analyst

## Langkah 1: Buat Akun Supabase

1. Buka https://supabase.com
2. Klik "Start your project"
3. Sign up dengan GitHub/Google/Email
4. Verify email Anda

## Langkah 2: Buat Project Baru

1. Setelah login, klik "New Project"
2. Isi form:
   - **Name**: `stock-analyst-cache` (atau nama lain)
   - **Database Password**: Buat password yang kuat (simpan di tempat aman!)
   - **Region**: Pilih `Southeast Asia (Singapore)` untuk latency terbaik
   - **Pricing Plan**: Pilih **Free** (sudah cukup)
3. Klik "Create new project"
4. Tunggu ~2 menit sampai project selesai dibuat

## Langkah 3: Jalankan SQL Schema

1. Di dashboard Supabase, klik menu **SQL Editor** (ikon database di sidebar)
2. Klik "+ New query"
3. Copy seluruh isi file `supabase-schema.sql` dari project Anda
4. Paste ke SQL editor
5. Klik "Run" atau tekan `Cmd/Ctrl + Enter`
6. Pastikan muncul "Success. No rows returned" (ini normal)

## Langkah 4: Verifikasi Table

1. Klik menu **Table Editor** di sidebar
2. Anda harus melihat table baru: `stock_analysis_cache`
3. Klik table tersebut untuk melihat strukturnya

## Langkah 5: Copy API Credentials

1. Klik menu **Settings* * (ikon gear di sidebar)
2. Klik **API** di submenu
3. Scroll ke bagian **Project API keys**
4. Copy 2 values ini:
   - **Project URL** (contoh: `https://xxxxx.supabase.co`)
   - **anon public** key (key yang panjang, bukan service_role!)

## Langkah 6: Update .env File

1. Buka file `.env` di project Anda
2. Tambahkan credentials:

```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_CACHE_TTL_HOURS=6
```

3. **JANGAN commit .env ke Git!** (sudah ada di .gitignore)

## Langkah 7: Test Locally

```bash
# Restart dev server
npm run dev
```

Buka browser console (F12), coba analisa saham:
- Ketik "BBCA"
- Lihat console log: harus muncul "✅ Supabase cache service initialized"
- Analisa BBCA lagi (kedua kali) → harus instant dari cache!

## Langkah 8: Deploy ke VPS

1. SSH ke VPS Anda
2. Navigate ke project directory
3. Update `.env` di VPS dengan credentials Supabase
4. Rebuild dan restart:

```bash
# Jika pakai Docker
docker-compose down
docker-compose up -d --build

# Jika manual
npm run build
# restart nginx/pm2
```

## Troubleshooting

### Error: "Supabase not configured"
- Cek apakah `.env` sudah benar
- Pastikan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` ada
- Restart dev server setelah update `.env`

### Error: "relation stock_analysis_cache does not exist"
- SQL schema belum dijalankan
- Kembali ke Langkah 3

### Cache tidak berfungsi
- Buka browser console (F12)
- Cek error messages
### Error: "email rate limit exceeded" (429)
- Ini terjadi karena Supabase membatasi jumlah email auth per jam (default: 3).
- **Solusi 1 (Production)**: Setup SMTP eksternal (Gmail/SendGrid/dll) di menu **Authentication** -> **Email Templates** -> **SMTP Settings**.
- **Solusi 2 (Development)**: Naikkan limit di **Authentication** -> **Settings** -> **Rate Limits** (ubah "Max Emails per Hour" menjadi misal 30).
- **Solusi 3 (Bypass)**: Matikan "Confirm email" di **Authentication** -> **Settings** -> **Email Auth** agar bisa login tanpa menunggu email.

## Monitoring Cache

Untuk melihat data cache di Supabase:

1. Buka **Table Editor**
2. Klik `stock_analysis_cache`
3. Lihat semua cached analysis
4. Bisa manual delete jika perlu

## Optional: Setup Cron Job untuk Cleanup

Di Supabase Dashboard:
1. Klik **Database** → **Cron Jobs**
2. Create new cron job:
   - **Name**: `cleanup_expired_cache`
   - **Schedule**: `0 */6 * * *` (setiap 6 jam)
   - **SQL**: `SELECT cleanup_expired_cache();`
3. Save

Ini akan auto-delete expired cache setiap 6 jam.
