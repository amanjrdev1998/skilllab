# SkillLab Core PHP API

A framework-free PHP REST API for the SkillLab Next.js frontend.

## Structure

- `public/index.php`: front controller and API entry point
- `app/Core`: request, response, router, and database abstractions
- `app/Controllers`: HTTP/application actions
- `app/Repositories`: database queries
- `app/Middleware`: CORS and authentication guards
- `app/Routes`: API route registration
- `config`: environment and PDO configuration
- `database/migrations`: MySQL schema and seed data

## Setup

1. Copy `backend/.env.example` to `backend/.env` and update the MySQL values.
2. Create the database named in `DB_NAME`.
3. Run `backend/database/migrations/001_create_tables.sql`.
4. Run `backend/database/migrations/002_create_payment_transactions.sql`.
5. Run `backend/database/migrations/003_seed_admin.sql
- `004_bind_course_pdfs.sql` — binds each course PDF filename (`backend/storage/pdfs/*.pdf`) to its course (`courses.pdf_url`)` — creates the admin login
   (`admin@skilllab.com` / `skilllab@123`; change the password after first login).
6. Set `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` in `backend/.env` using PayPal sandbox credentials for testing. Set `PAYPAL_ENV=live` only when ready to accept real payments. The PHP cURL extension must be enabled.
7. Set `NEXT_PUBLIC_PAYPAL_CLIENT_ID` in the Next.js environment to the same PayPal app client ID used by the backend.
8. Create a webhook in the matching PayPal app, subscribe to `PAYMENT.CAPTURE.COMPLETED`, and set its generated ID as `PAYPAL_WEBHOOK_ID` in `backend/.env`. Use the public callback URL `https://<your-site-domain>/paypal/responce` (or `https://<your-backend-domain>/paypal/responce` if registering the PHP API directly). Set `BACKEND_API_URL` in the Next.js deployment to the PHP API base URL when using the site callback.
9. Start the API from the repository root:

```bash
php -S localhost:8000 -t backend/public backend/public/index.php
```

The API is available at `http://localhost:8000/api/v1`.

## Endpoints

- `GET /health`
- `POST /auth/register` with `{ "name", "email", "password" }`
- `POST /auth/login` with `{ "email", "password" }`
- `GET /auth/me` with `Authorization: Bearer <token>`
- `GET /courses` for the published public course catalog
- `POST /enrollments` with `{ "course_id" }` and an authenticated bearer token to create a pending enrollment for a published course
- `GET /enrollments` with an authenticated bearer token to list the current user's non-cancelled enrollments
- `POST /payments/paypal/orders` with `{ "course_id" }` and an authenticated bearer token to create an order for a published paid course. The backend derives the amount from the course record and returns `order_id` and `unique_key`.
- `POST /payments/paypal/capture` with `{ "unique_key" }` and an authenticated bearer token to verify/capture the PayPal order and activate the enrollment. The payment must belong to the authenticated user.
- `POST /paypal/responce` as a public PayPal webhook. The endpoint verifies PayPal's transmission signature and activates the enrollment only when a completed capture matches a saved order, amount, and currency.
- `GET /admin/dashboard` with an administrator bearer token for published courses, student accounts, and all enrollments
- `POST /admin/enrollments/{id}/approve` with an administrator bearer token to change a pending enrollment to `active`
- `POST /admin/enrollments/{id}/reject` with an administrator bearer token to change a pending enrollment to `cancelled`
- `GET /admin/courses` with an administrator bearer token to list all courses (any status)
- `POST /admin/courses` with an administrator bearer token to create a course
- `PUT /admin/courses/{id}` with an administrator bearer token to update a course
- `DELETE /admin/courses/{id}` with an administrator bearer token to delete a course
- `GET /api/v1/courses/{id}/pdf` with an authenticated bearer token to stream the course's bound PDF inline. Requires an active (non-cancelled) enrollment for the course; admins bypass the enrollment check. The PDF bytes are never reachable by direct URL.
- `GET /api/v1/admin/pdfs` with an administrator bearer token to list PDF filenames in `backend/storage/pdfs/`
- `POST /api/v1/admin/courses/{id}/pdf` with an administrator bearer token and multipart field `pdf` to upload a PDF (max 25 MB) and bind it to the course

### Affiliate (wallet & withdrawals)

- `GET /api/v1/wallet` — balance, referral code, transactions (authenticated user)
- `POST /api/v1/wallet/withdraw` `{ amount, upi_id }` — request a withdrawal; the wallet is debited immediately and refunded on rejection (authenticated user)
- `GET /api/v1/wallet/withdrawals` — the user's own withdrawal requests
- `GET /api/v1/admin/withdrawals` — all requests with user details (admin)
- `POST /api/v1/admin/withdrawals/{id}/approve|reject|paid` — approve → pay via UPI manually → mark paid; reject refunds the wallet (admin)

How it works: the buyer may pass `referral_code` to `POST /api/v1/payments/paypal/orders`. On payment completion, `REFERRAL_COMMISSION_PERCENT` (default 10) of the course price is credited to the referral-code owner's wallet (`wallet_transactions` ledger). Migration `005_affiliate_system.sql` adds `payment_transactions.referral_code/referral_amount`, `wallet_transactions`, and `withdrawal_requests`.

### Payment notifications

On every completed payment (capture API or PayPal webhook), the admin is notified with course, amount, buyer, and PayPal capture/order ids. Configure in `.env`:
- WhatsApp via bridge: `NOTIFY_WHATSAPP_ENABLED=true`, `NOTIFY_WHATSAPP_URL=http://localhost:3001`, `ADMIN_WHATSAPP_NUMBER=919999999999`
- Email: `NOTIFY_EMAIL_ENABLED=true`, `ADMIN_EMAIL=admin@skilllab.store`, `MAIL_FROM=noreply@skilllab.store`
Notifications are best-effort and never break checkout.

### PayPal webhook

Register this URL in the PayPal Developer Dashboard (Sandbox app AND Live app separately):
`https://skilllab.store/api/paypal/webhook`
(legacy alias `/paypal/responce` still works). Subscribe to the `PAYMENT.CAPTURE.COMPLETED` event and paste the webhook ID into `PAYPAL_WEBHOOK_ID`. The handler verifies PayPal's signature, matches amount/currency against the stored payment, then completes it idempotently — the same completion path as the capture API, so double-processing is impossible.

## Course PDFs (protected)

PDFs live in `backend/storage/pdfs/` — outside the web root, so no direct URL can ever download them. `courses.pdf_url` stores only the file name. Migration `004_bind_course_pdfs.sql` binds the five shipped PDFs to their courses. Students open them at `/course-pdf/{id}` in the frontend, which renders pages with PDF.js (no download/print buttons, right-click disabled) after an authenticated, enrollment-checked fetch.

All responses use `{ "success": boolean, "data": ... }`. Authenticated endpoints require the token returned from register or login.

Admin endpoints require a logged-in user whose `users.role` is `admin`. New accounts default to `student`; grant administrator access only to trusted accounts through the database.

For an existing database where `enrollments.order_id` is already present, apply this once to enforce unique generated order IDs:

```sql
ALTER TABLE enrollments
    MODIFY order_id VARCHAR(40) NULL,
    ADD UNIQUE KEY unique_order_id (order_id);
```
