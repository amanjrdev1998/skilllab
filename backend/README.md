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
5. Set `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` in `backend/.env` using PayPal sandbox credentials for testing. Set `PAYPAL_ENV=live` only when ready to accept real payments. The PHP cURL extension must be enabled.
6. Set `NEXT_PUBLIC_PAYPAL_CLIENT_ID` in the Next.js environment to the same PayPal app client ID used by the backend.
7. Create a webhook in the matching PayPal app, subscribe to `PAYMENT.CAPTURE.COMPLETED`, and set its generated ID as `PAYPAL_WEBHOOK_ID` in `backend/.env`. Use the public callback URL `https://<your-site-domain>/paypal/responce` (or `https://<your-backend-domain>/paypal/responce` if registering the PHP API directly). Set `BACKEND_API_URL` in the Next.js deployment to the PHP API base URL when using the site callback.
8. Start the API from the repository root:

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

All responses use `{ "success": boolean, "data": ... }`. Authenticated endpoints require the token returned from register or login.

Admin endpoints require a logged-in user whose `users.role` is `admin`. New accounts default to `student`; grant administrator access only to trusted accounts through the database.

For an existing database where `enrollments.order_id` is already present, apply this once to enforce unique generated order IDs:

```sql
ALTER TABLE enrollments
    MODIFY order_id VARCHAR(40) NULL,
    ADD UNIQUE KEY unique_order_id (order_id);
```
