---
description: Alur untuk memperbarui aplikasi di VPS (Vite + Nginx/Host)
---

// turbo-all
Berikut adalah langkah-langkah untuk memperbarui aplikasi **StockAnalyst** Anda di VPS.

### 1. Persiapan di Lokal (Local Machine)
Pastikan semua perubahan sudah di-commit dan di-push ke repository Git Anda.

```bash
git add .
git commit -m "Update: fitur baru dan perbaikan bug"
git push origin master
```

### 2. Update di VPS (Server)
SSH ke dalam VPS Anda, masuk ke direktori proyek, lalu jalankan perintah berikut:

```bash
# SSH ke VPS (Ganti user@ip dengan milik Anda)
ssh user@your-vps-ip

# Masuk ke folder aplikasi (Ganti path/to/ dengan lokasi asli di VPS Anda)
cd /path/to/your/actual/location/StockAnalyst

# Ambil perubahan terbaru dari Git
git pull origin main

# Rebuild dan jalankan ulang container
# Coba 'docker compose' (tanpa tanda hubung) terlebih dahulu, jika gagal baru 'docker-compose'
docker compose up --build -d
```

### 3. Masalah "Command not found"?
Jika `docker compose` atau `docker-compose` tidak ditemukan, coba jalankan perintah ini untuk memastikan Docker terpasang:
```bash
docker --version
```
Jika Docker ada tapi Compose tidak, Anda mungkin perlu menginstalnya atau menggunakan perintah `docker compose` (versi terbaru).

### 3. Verifikasi Nginx
Pastikan Nginx mengarah ke folder `dist` hasil build terbaru. Biasanya tidak perlu restart Nginx jika path-nya sudah benar, namun untuk memastikan:

```bash
sudo systemctl restart nginx
```

---
> [!TIP]
> **Data Database:** Jika ada perubahan pada skema database, jangan lupa jalankan query SQL terbaru dari file `supabase-education-schema.sql` di SQL Editor Supabase Anda.
