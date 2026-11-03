# SkillLab — US Launch Checklist

Everything below is the exact order to go live. Sandbox is already tested
and working; going live = swapping PayPal keys (step 5).

## 1. Domain + hosting

- Buy your domain (e.g. `skilllab.com`).
- **Frontend (Next.js):** deploy on Vercel (easiest) — connect the repo, set the
  env vars from `.env.example`.
- **Backend (Core PHP):** any PHP 8.1+ host with MySQL + cURL extension
  (cPanel shared hosting, VPS, etc.). Upload the `backend/` folder.
- Point DNS: `www` → Vercel, `api.yourdomain.com` → PHP host.

## 2. Database

1. Create MySQL database (e.g. `skilllab`) + user.
2. Run in order:
   - `backend/database/migrations/001_create_tables.sql`
   - `backend/database/migrations/002_create_payment_transactions.sql`
   - `backend/database/migrations/003_seed_admin.sql` ← creates the admin login
3. Admin login: `admin@skilllab.com` / `skilllab@123`
   **Change this password immediately after first login.**

## 3. Backend env (`backend/.env`)

Copy `backend/.env.example` → `backend/.env` and set:

```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com
DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD=<redacted>
CORS_ORIGIN=https://www.yourdomain.com
PAYPAL_ENV=sandbox            # <- change to "live" on launch day
PAYPAL_CLIENT_ID=<sandbox id> # <- swap to LIVE client id on launch day
PAYPAL_CLIENT_SECRET=<sandbox secret>  # <- swap to LIVE secret on launch day
PAYPAL_WEBHOOK_ID=<from step 4>
PAYPAL_CURRENCY=USD
```

## 4. PayPal webhook (recommended)

1. In the PayPal developer dashboard, open your app → add webhook.
2. URL: `https://www.yourdomain.com/paypal/responce`
3. Subscribe to event: `PAYMENT.CAPTURE.COMPLETED`
4. Copy the webhook ID → `PAYPAL_WEBHOOK_ID` in `backend/.env`.

(Without this, payments still complete via the capture API — the webhook is
a safety net that activates enrollments even if the buyer's browser closes
mid-checkout.)

## 5. GOING LIVE with PayPal (launch day — 2 keys only)

1. In https://developer.paypal.com/dashboard → **Live** mode → your app →
   copy **Live Client ID** and **Live Secret**.
2. `backend/.env`: set `PAYPAL_ENV=live`, paste the live ID + secret.
3. Frontend env: set `NEXT_PUBLIC_PAYPAL_CLIENT_ID` to the **live** Client ID.
4. Re-create the webhook (step 4) in the **live** app, update `PAYPAL_WEBHOOK_ID`.
5. Do one real $1 test purchase with your own PayPal account, then refund it
   from the PayPal dashboard.

That's it — nothing else in the code needs to change. Sandbox and live use
the same code paths; only the keys + `PAYPAL_ENV` switch.

## 6. Frontend env (Vercel / host dashboard)

```
NEXT_PUBLIC_API_URL=https://www.yourdomain.com      # if API proxied, else https://api.yourdomain.com
BACKEND_API_URL=https://api.yourdomain.com          # PHP API, server-side only
NEXT_PUBLIC_PAYPAL_CLIENT_ID=<live client id>
NEXT_PUBLIC_SITE_URL=https://www.yourdomain.com
```

## 7. SEO after launch

- `https://www.yourdomain.com/sitemap.xml` is auto-generated (courses included).
- `https://www.yourdomain.com/robots.txt` is auto-generated.
- Submit the sitemap in Google Search Console.
- Verify the Course rich-result with Google's Rich Results Test on any
  `/product-details?id=N` page.

## 8. Security reminders

- [ ] Changed admin password from `skilllab@123`
- [ ] `APP_DEBUG=false` in production
- [ ] `backend/.env` is NOT in git / not publicly accessible
- [ ] HTTPS everywhere (Vercel gives this free; enable on PHP host too)
- [ ] PayPal app is in **Live** mode with live webhook

## What was fixed/added in this delivery

- **Critical:** user registration was broken — `users.wallet` is NOT NULL but
  was never inserted. Fixed in `UserRepository::create()` + migration default.
- **Added:** admin seed migration (`003_seed_admin.sql`).
- **Added:** enrollment **Reject** endpoint (frontend called it, backend lacked it).
- **Added:** full admin **course CRUD** (add/edit/delete/publish) — backend +
  Next.js proxies + admin UI with modal form.
- **Fixed:** hardcoded `http://localhost:8000` in 5 frontend files → shared
  `lib/api.ts` using `NEXT_PUBLIC_API_URL`.
- **Fixed:** admin login page still had ecommerce ("shopping") copy → rebranded
  to courses/students.
- **Fixed:** `LayoutProps` TypeScript error in `app/layout.tsx`.
- **Added:** `app/sitemap.ts`, `app/robots.ts`, SEO metadata (keywords,
  OpenGraph, Twitter), JSON-LD Course schema on product pages.
- **Added:** frontend `.env.example` documenting the sandbox→live key swap.
- PayPal sandbox verified working end-to-end (OAuth + order creation, USD).
