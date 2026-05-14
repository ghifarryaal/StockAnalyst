# Panduan Pemisahan Frontend & Backend (Cloudflare Ready)

Saya telah merapikan struktur proyek Anda agar frontend, backend, dan PocketBase terpisah secara bersih. Ini akan memudahkan deployment ke platform yang berbeda seperti Cloudflare Pages untuk frontend dan VPS/PaaS untuk backend.

## 1. Struktur Folder Baru
Sekarang proyek Anda terbagi menjadi:
- `/frontend`: Aplikasi React + Vite.
- `/backend`: API FastAPI (Python).
- `/pocketbase`: Konfigurasi dan data PocketBase.
- `/docs`: Dokumentasi, schema SQL, dan file setup lama.

## 2. Persiapan Cloudflare Pages (Frontend)
Untuk memindahkan frontend ke Cloudflare:
1.  **Repository**: Pastikan kode sudah di-push ke GitHub/GitLab.
2.  **Cloudflare Pages**: 
    - Buka Dashboard Cloudflare > Workers & Pages > Create > Pages > Connect to Git.
    - Pilih repository Anda.
3.  **Build Settings**:
    - **Framework Preset**: `Vite` (atau `None`).
    - **Build command**: `npm run build`
    - **Build output directory**: `dist`
    - **Root directory**: `frontend` (PENTING: Karena sekarang folder frontend ada di sub-direktori).
4.  **Environment Variables**: 
    - Masukkan variabel dari `.env.example` ke bagian "Environment variables" di dashboard Cloudflare.

## 3. Menjalankan Backend secara Lokal (Docker)
Saya telah menyediakan `docker-compose.yml` di root untuk menjalankan semuanya sekaligus jika dibutuhkan:

```bash
# Di root direktori
docker-compose up --build
```

## 4. Instalasi Manual (Tanpa Docker)

### Backend (Python)
```bash
cd backend
python -m venv venv
source venv/bin/activate # atau venv\Scripts\activate di Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend (Node.js)
```bash
cd frontend
npm install
npm run dev
```

### PocketBase
```bash
cd pocketbase
./pocketbase serve # Sesuaikan dengan binary yang Anda miliki
```

## 5. File Konfigurasi Baru
- `frontend/wrangler.toml`: Untuk konfigurasi Cloudflare Pages (opsional via CLI).
- `backend/Dockerfile`: Untuk deploy backend ke server/VPS.
- `docker-compose.yml`: Untuk orkestrasi full-stack.
