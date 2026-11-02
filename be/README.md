# Next CMS — Backend (FastAPI)

Backend ini menggantikan peran Prisma sepenuhnya: skema database (`app/models.py`,
pakai SQLModel), auth (register/login, JWT), dan CRUD artikel + upload gambar
sekarang semuanya ada di sini. Next.js hanya jadi frontend yang fetch ke API ini.

## Setup

1. Buat virtual environment (opsional tapi disarankan):
   ```
   python -m venv .venv
   source .venv/bin/activate   # Windows: .venv\Scripts\activate
   ```
2. `pip install -r requirements.txt`
3. Salin `.env.example` -> `.env`, isi `DATABASE_URL` (PostgreSQL) dan
   `JWT_SECRET` (`openssl rand -hex 32`).
4. `uvicorn app.main:app --reload --port 8000`
5. Cek dokumentasi otomatis di http://localhost:8000/docs

Tabel dibuat otomatis saat startup (`init_db()` -> `SQLModel.metadata.create_all`).
Ini cukup untuk starter project; begitu schema mulai sering berubah di production,
pertimbangkan pindah ke **Alembic** untuk migration bertahap (peran yang dulu
dipegang `prisma migrate`).

## Struktur folder

```
app/
  main.py          # entry point: CORS, static files, routers, init_db
  config.py        # baca .env (DATABASE_URL, JWT_SECRET, dll)
  database.py      # engine + session SQLModel (pengganti Prisma client)
  models.py        # model User, Article (pengganti prisma/schema.prisma)
  schemas.py       # Pydantic request/response (pengganti validasi Zod)
  security.py      # hash password (bcrypt) + create/decode JWT
  deps.py          # dependency get_current_user (wajib & opsional)
  slug.py          # slugify helper
  routers/
    auth.py        # POST /auth/register, POST /auth/login
    articles.py     # GET/POST /articles, GET/PUT/DELETE /articles/{id}
    upload.py       # POST /upload
static/uploads/     # tempat file yang diupload disimpan (dev)
```

## Endpoint penting

| Method | Path                    | Auth?  | Keterangan |
|--------|--------------------------|--------|------------|
| POST   | /auth/register          | tidak  | Buat user baru |
| POST   | /auth/login             | tidak  | Return `access_token` + data user |
| GET    | /articles                | tidak  | List artikel yang `published=true` |
| GET    | /articles?mine=true      | ya     | List artikel milik user login |
| POST   | /articles                | ya     | Buat artikel |
| GET    | /articles/{id}           | tidak  | Detail satu artikel |
| PUT    | /articles/{id}           | ya (pemilik) | Update artikel |
| DELETE | /articles/{id}           | ya (pemilik) | Hapus artikel |
| POST   | /upload                  | ya     | Upload gambar, return `{ "url": "/static/uploads/xxx.jpg" }` |

Auth pakai `Authorization: Bearer <access_token>` di header.

## Advice tambahan

1. **`JWT_SECRET` di sini BEDA dengan `NEXTAUTH_SECRET`** di project Next.js.
   `JWT_SECRET` menandatangani token yang dipakai untuk otorisasi ke API ini;
   `NEXTAUTH_SECRET` menandatangani session cookie di sisi Next.js. Keduanya
   independen — jangan disamakan, dan jangan sampai salah satu leak ke publik.
2. **CORS** di `main.py` hanya mengizinkan origin yang ada di `CORS_ORIGINS`
   (default `http://localhost:3000`). Kalau frontend production di domain
   lain, tambahkan domainnya (pisahkan koma) di `.env`.
3. **Upload masih ke disk lokal** — sama seperti sebelumnya di Next.js, ini
   tidak cocok untuk deployment ke platform yang filesystem-nya ephemeral
   (misal container tanpa persistent volume). Untuk production ganti isi
   `app/routers/upload.py` supaya upload ke S3 (`boto3`), lalu return URL S3-nya.
4. **Password hashing pakai library `bcrypt` langsung** (bukan lewat `passlib`,
   yang sudah tidak di-maintain sejak 2020 dan sering konflik versi dengan
   `bcrypt` terbaru). Catatan: bcrypt punya limit keras 72 byte per password —
   ini bukan bug, tapi karakteristik algoritma bcrypt sendiri. Password normal
   (bahkan passphrase panjang wajar) tidak akan kena limit ini.
5. **Token expiry** diatur lewat `JWT_EXPIRE_MINUTES` (default 1 hari). Kalau
   mau ada refresh token / logout paksa (revoke), itu butuh tabel token
   tambahan — belum diimplementasikan di starter ini karena menambah
   kompleksitas yang mungkin belum perlu di tahap awal.
6. **Migrasi data lama (kalau sebelumnya sempat pakai Postgres dari Prisma)**:
   struktur tabel di SQLModel ini kompatibel secara konsep dengan schema Prisma
   sebelumnya (User, Article dengan field yang sama), tapi nama tabel/kolom
   Prisma (camelCase di kode, tapi biasanya snake_case di DB) vs SQLModel bisa
   berbeda persis. Kalau ada data lama yang harus dipertahankan, lebih aman
   mulai dari database baru/kosong untuk starter ini, bukan reuse DB lama.
