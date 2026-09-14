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
4. Start the API from the repository root:

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

All responses use `{ "success": boolean, "data": ... }`. Authenticated endpoints require the token returned from register or login.
