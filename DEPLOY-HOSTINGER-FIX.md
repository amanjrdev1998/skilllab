# SkillLab — Hostinger 403/500 Fix

## Problem kya tha (repo check karke confirm)

1. **403 Forbidden — `backend/` folder par koi `.htaccess` hi nahi tha.**
   API ka entry point `backend/public/index.php` hai, lekin `backend/`
   folder mein na `index.php` hai na routing file. Hostinger (LiteSpeed)
   aise folder ke liye directory listing band karke seedha
   **403 Forbidden** deta hai — `/backend/` aur bina rewrite ke
   `/backend/api/...` dono par.

2. **500 Error — ek asli PHP syntax bug repo mein tha.**
   `backend/app/Repositories/WalletRepository.php` line ~135:
   SQL string ke andar `'pending'` likha tha, jisse PHP string wahi
   band ho gayi → **Parse error**. Ye file har API request par load
   hoti hai, isliye poori API 500 de rahi thi (live par
   `/backend/api/v1/health` check mein 500 hi mila).

3. **`API_BASE_PATH=/backend` code mein kahin use hi nahi ho raha tha.**
   Router sirf `/api/v1/...` match karta hai, lekin browser se request
   `/backend/api/v1/...` aati hai → prefix strip na hone se har route
   404 hota. `Request.php` mein ab ye strip implement kar diya hai.

4. **Frontend (Next.js) Hostinger shared hosting par aise hi nahi chalta.**
   Repo ka root ek Next.js app hai — `public_html` mein daalne se homepage
   par bhi 403 aayega kyunki root mein koi `index.html/index.php` nahi hai.
   Frontend ke liye Node.js hosting (Hostinger Cloud/VPS ka Node app,
   ya Vercel) chahiye, jahan ye env mile:
   - `NEXT_PUBLIC_API_URL=https://skilllab.store/backend`
   - `BACKEND_API_URL=https://skilllab.store/backend`
   - `NEXT_PUBLIC_PAYPAL_CLIENT_ID=<live client id>`
   - `NEXT_PUBLIC_SITE_URL=https://skilllab.store`

## Is fix mein kya hai (4 files)

| File | Change |
|---|---|
| `backend/.htaccess` | **NAYI file.** Saari API requests `public/index.php` ko, `.env`/SQL/`app/`/`config/` direct access band (warna secrets leak honge), Authorization header passthrough |
| `backend/public/.htaccess` | **NAYI file.** Agar kabhi `api.` subdomain `backend/public` par point karo to wahan bhi pretty URLs chalein |
| `backend/app/Core/Request.php` | `API_BASE_PATH` prefix strip — `/backend/api/v1/...` ab sahi route match karega |
| `backend/app/Repositories/WalletRepository.php` | Parse error fix — `'pending'` ki jagah `:status` placeholder bind kiya |

## Deploy steps (Hostinger hPanel)

1. File Manager → `public_html/backend/` mein upar wali 4 files same
   path par upload/overwrite karo. (Dhyan: `.htaccess` hidden file hai —
   File Manager ki Settings mein "Show Hidden Files" on karna pad sakta hai.)
2. `public_html/backend/.env` file banao (agar nahi hai) aur apni
   production values daalo — wahi jo tumne bheji thi
   (`APP_URL=https://skilllab.store/backend`, `API_BASE_PATH=/backend`,
   DB `u911667125_skilllab`, PayPal live, `CORS_ORIGIN=https://skilllab.store`).
   **`.env` ko GitHub par kabhi commit mat karna.**
3. phpMyAdmin → database `u911667125_skilllab` → Import, is order mein:
   `001_create_tables.sql`, `002_...`, `003_seed_admin.sql`,
   `004_bind_course_pdfs.sql`, `005_affiliate_system.sql`
   (agar pehle se tables bane hain to dobara import par "table exists"
   error aayega — wo normal hai, skip karo.)
4. hPanel → PHP Configuration: version **8.1 ya upar**, extensions
   `pdo_mysql` aur `curl` ON hon.
5. Browser mein kholo: `https://skilllab.store/backend/api/v1/health`
   → `{"success":true,"data":{"service":"skilllab-api","status":"ok"}}`
   aana chahiye. Phir `/backend/api/v1/courses` par course list.
6. Admin login (`admin@skilllab.com`) ka default password
   `skilllab@123` hai — **pehle login ke baad turant badlo.**

## Local verification (Muse ne kiya)

Fix ke baad poora backend local MariaDB + saari 5 migrations ke saath
chalakar test kiya gaya:
- `GET /backend/api/v1/health` → 200 OK
- `GET /backend/api/v1/courses` → 200, DB se asli course list
- `POST /backend/api/v1/auth/login` (seed admin) → 200, token mila
- Unknown route → saaf JSON 404, Wallet route → 401 (auth required)

## Security note

Jo DB password aur PayPal live secret chat mein bheje gaye the, deploy
ke baad unhe **rotate** kar dena (PayPal dashboard → Live app → secret
reset; Hostinger → database user password change karke `.env` update).
Chat mein aaye hue secrets ko exposed hi maano.
