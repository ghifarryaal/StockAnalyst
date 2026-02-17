# Setup Database untuk Education Threads Module

## Langkah 1: Persiapan Supabase

Pastikan Anda sudah memiliki project Supabase. Jika belum, ikuti `SUPABASE_SETUP.md`.

## Langkah 2: Jalankan SQL Schema

1. Buka Supabase Dashboard → **SQL Editor**
2. Klik **+ New query**
3. Copy seluruh isi file `supabase-education-schema.sql`
4. Paste ke SQL editor
5. Klik **Run** atau tekan `Cmd/Ctrl + Enter`
6. Tunggu sampai selesai (sekitar 5-10 detik)

### Verifikasi Schema

Setelah SQL berhasil dijalankan, verifikasi di **Table Editor**:

✅ Harus ada 6 tables baru:
- `users`
- `educator_profiles`
- `education_posts`
- `post_reactions`
- `post_reports`
- `terms_acceptance`

## Langkah 3: Setup Authentication di Supabase

### Enable Email Auth

1. Di Supabase Dashboard → **Authentication** → **Providers**
2. Pastikan **Email** provider sudah enabled
3. (Optional) Disable **Confirm email** jika tidak ingin email verification

### Configure Email Templates (Optional)

Jika ingin custom email templates:
1. **Authentication** → **Email Templates**
2. Edit template untuk:
   - Confirm signup
   - Magic Link
   - Reset password

## Langkah 4: Create Admin User

### Via Supabase Dashboard

1. **Authentication** → **Users** → **Add user**
2. Isi:
   - **Email**: admin@stockanalyst.com (atau email Anda)
   - **Password**: (buat password kuat)
   - **Auto Confirm User**: ✅ (centang)
3. Klik **Create user**
4. Copy **User UID** yang muncul

### Insert Admin ke Database

1. Kembali ke **SQL Editor**
2. Jalankan query ini (ganti `YOUR_ADMIN_UUID` dengan UID dari step sebelumnya):

```sql
INSERT INTO public.users (id, email, full_name, role, is_verified)
VALUES (
  'YOUR_ADMIN_UUID',
  'admin@stockanalyst.com',
  'Super Admin',
  'admin',
  true
);
```

## Langkah 5: Test Database Connection

### Via SQL Editor

Jalankan query test ini:

```sql
-- Test 1: Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'educator_profiles', 'education_posts', 'post_reactions', 'post_reports', 'terms_acceptance');

-- Test 2: Check admin user
SELECT id, email, full_name, role FROM public.users WHERE role = 'admin';

-- Test 3: Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'educator_profiles', 'education_posts');
```

**Expected Results:**
- Test 1: Harus return 6 rows (semua tables)
- Test 2: Harus return admin user Anda
- Test 3: Semua tables harus `rowsecurity = true`

## Langkah 6: Update .env File

Pastikan file `.env` sudah memiliki credentials Supabase:

```bash
# Existing
VITE_N8N_WEBHOOK_URL=...
VITE_N8N_NEWS_URL=...

# Supabase (tambahkan jika belum ada)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Cara mendapatkan credentials:**
1. Supabase Dashboard → **Settings** → **API**
2. Copy **Project URL** → paste ke `VITE_SUPABASE_URL`
3. Copy **anon public** key → paste ke `VITE_SUPABASE_ANON_KEY`

## Langkah 7: Test dari Frontend

Setelah auth service dibuat, test dengan:

```javascript
// Di browser console
import { supabase } from './services/supabaseClient';

// Test connection
const { data, error } = await supabase.from('users').select('count');
console.log('Connection test:', data, error);
```

## Troubleshooting

### Error: "relation does not exist"
- SQL schema belum dijalankan
- Kembali ke Langkah 2

### Error: "JWT expired" atau "Invalid API key"
- Check `.env` file
- Pastikan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` benar
- Restart dev server setelah update `.env`

### Error: "new row violates row-level security policy"
- RLS policies belum di-setup dengan benar
- Re-run SQL schema

### Admin user tidak bisa login
- Pastikan user sudah di-create di **Authentication** → **Users**
- Pastikan user sudah di-insert ke table `public.users`
- Check role = 'admin' dan is_verified = true

## Next Steps

Setelah database setup selesai:
1. ✅ Implement auth service (`authService.js`)
2. ✅ Create login/register pages
3. ✅ Test authentication flow
4. ✅ Implement educator registration dengan sertifikat
