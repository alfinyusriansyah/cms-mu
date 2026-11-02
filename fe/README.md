# Next CMS — Frontend (Next.js)

Frontend Next.js (App Router + TypeScript): login/register, dashboard artikel,
form artikel dengan upload cover image. **Tidak ada database di sini** — semua
data (User, Article) dan logic-nya ada di backend FastAPI terpisah
(lihat project `next-cms-backend`). Next.js hanya mengelola:

- Session/cookie login di sisi browser (via NextAuth), dengan kredensial yang
  diverifikasi lewat FastAPI (`POST /auth/login`), bukan query DB langsung.
- Tampilan (pages, komponen) yang fetch data dari FastAPI.

## Setup

1. Pastikan backend FastAPI (`next-cms-backend`) sudah jalan di
   `http://localhost:8000` — lihat README di project itu.
2. `npm install`
3. Salin `.env.example` -> `.env`, isi `NEXTAUTH_SECRET`
   (`openssl rand -base64 32`). `NEXT_PUBLIC_API_URL` default sudah mengarah
   ke `http://localhost:8000`.
4. `npm run dev` -> buka http://localhost:3000

## Struktur folder

```
src/
  app/
    page.tsx                  # homepage publik, fetch GET /articles ke FastAPI
    login/, register/         # halaman auth
    dashboard/                # area setelah login (dilindungi middleware.ts)
      page.tsx                # fetch GET /articles?mine=true (Bearer token)
      articles/new/           # form buat artikel
      articles/[id]/edit/     # form edit artikel
    api/
      auth/[...nextauth]/     # SATU-SATUNYA API route yang tersisa di Next.js
                               # (handler NextAuth, provider-nya call FastAPI)
  components/
    ArticleForm.tsx           # create/update artikel + upload, fetch LANGSUNG ke FastAPI
    Navbar.tsx, AuthProvider.tsx
  lib/
    auth.ts                   # config NextAuth: authorize() call POST /auth/login
    api.ts                    # helper fetch ke FastAPI (server component)
  types/                      # tipe ArticleDTO + augmentasi NextAuth (+ accessToken)
  middleware.ts               # proteksi route /dashboard
```

Perhatikan: **tidak ada folder `prisma/`** lagi, dan `app/api/articles`,
`app/api/upload`, `app/api/auth/register` sudah dihapus — semuanya sekarang
endpoint di FastAPI.

## Bagaimana auth bekerja sekarang

1. User isi form login -> NextAuth `CredentialsProvider.authorize()` di
   `lib/auth.ts` memanggil `POST {NEXT_PUBLIC_API_URL}/auth/login`.
2. FastAPI verifikasi email/password ke DB-nya sendiri, balikin
   `{ access_token, user }`.
3. `access_token` itu disimpan di JWT session Next.js (lewat callback `jwt`),
   dan diekspos ke client lewat `session.accessToken` (callback `session`).
4. Setiap kali komponen client (misal `ArticleForm.tsx`,
   `DeleteArticleButton.tsx`) mau create/update/delete artikel atau upload
   gambar, dia ambil `session.accessToken` lewat `useSession()` dan kirim
   sebagai header `Authorization: Bearer <token>` ke FastAPI.
5. Server component (misal `dashboard/page.tsx`) ambil token yang sama lewat
   `getServerSession(authOptions)`.

Jadi ada **dua JWT yang berbeda dan independen**:
- `NEXTAUTH_SECRET` (Next.js) — untuk session/cookie di browser.
- `JWT_SECRET` (FastAPI) — untuk otorisasi request ke API.

## Advice yang perlu diperhatikan

1. **CORS**: karena browser sekarang fetch LANGSUNG ke FastAPI (bukan lewat
   Next.js API route lagi), pastikan `CORS_ORIGINS` di backend FastAPI sudah
   mengizinkan origin Next.js-nya (`http://localhost:3000` untuk dev).
2. **`NEXT_PUBLIC_API_URL` jadi publik** (prefix `NEXT_PUBLIC_` artinya
   ke-bundle ke JS yang dikirim ke browser). Ini wajar untuk base URL API,
   tapi jangan pernah taruh secret apa pun di variabel `NEXT_PUBLIC_*`.
3. **Upload foto** masih ke disk lokal di sisi FastAPI (`static/uploads`) —
   untuk production ganti ke S3 (lihat README backend). Setelah pindah ke S3,
   update `images.remotePatterns` di `next.config.js` supaya `next/image` bisa
   load dari domain S3, bukan `localhost:8000`.
4. **Kalau frontend & backend beda origin di production** (misal
   `app.domain.com` vs `api.domain.com`), pastikan keduanya pakai HTTPS, dan
   pertimbangkan taruh keduanya di balik reverse proxy yang sama (misal Nginx)
   supaya nggak perlu CORS sama sekali kalau mau lebih ketat.
5. **Server component vs client component fetch ke API yang sama** — untuk
   starter ini dua-duanya pakai `NEXT_PUBLIC_API_URL` yang sama. Di production
   dengan skala lebih besar, server-to-server call (dari Next.js server ke
   FastAPI) idealnya lewat internal URL/private network yang lebih cepat &
   aman daripada round-trip lewat internet publik seperti request dari
   browser — ini optimasi lanjutan, belum perlu di tahap awal.
