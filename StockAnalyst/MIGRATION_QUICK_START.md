# 🚀 Quick Start: Database Migration

## Langkah Cepat (3 Menit)

### 1. Buka Halaman Migration
Buka browser ke: **http://localhost:7001/migrate**

### 2. Klik "Start Migration"
Halaman akan memberikan instruksi lengkap

### 3. Buka Supabase SQL Editor
Klik link yang disediakan atau buka manual:
**https://app.supabase.com/project/ahakrootuqwalgowcjqx/sql**

### 4. Copy & Paste SQL
1. Buka file: `supabase-education-schema.sql`
2. Copy SEMUA isinya (Cmd/Ctrl + A, Cmd/Ctrl + C)
3. Di Supabase SQL Editor, klik "+ New query"
4. Paste (Cmd/Ctrl + V)
5. Klik "Run" atau tekan Cmd/Ctrl + Enter

### 5. Verify Migration
Kembali ke: **http://localhost:7001/test-supabase**
Klik "Run Tests" untuk verify semua table sudah dibuat

---

## Troubleshooting

### Error: "relation already exists"
✅ Ini normal! Artinya table sudah dibuat sebelumnya. Migration berhasil.

### Error: "permission denied"
❌ Check apakah Anda login dengan akun yang benar di Supabase Dashboard

### Error: "syntax error"
❌ Pastikan Anda copy SEMUA isi file SQL, dari awal sampai akhir

---

## Setelah Migration Berhasil

✅ Semua 6 tables akan dibuat:
- users
- educator_profiles  
- education_posts
- post_reactions
- post_reports
- terms_acceptance

✅ RLS policies otomatis enabled
✅ Triggers untuk auto-update counts
✅ Helper functions tersedia

**Next:** Lanjut ke development auth pages!
