# Bonyan (بُنيان)

A modern donation platform for completing house construction projects. Built with Laravel 13 and React.

## Features

- Public donation flow (no account required, phone number required)
- Animated house progress visualization
- Arabic / English with full RTL / LTR support
- Admin dashboard (projects, donations, settings)
- API-first architecture ready for payment gateways and notifications

## Tech Stack

- **Backend:** Laravel 13, Sanctum (session API for admin)
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, shadcn-style UI, Framer Motion, i18next

## Setup

### MySQL

Create a database (Herd includes MySQL locally):

```sql
CREATE DATABASE bonyan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Configure `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bonyan
DB_USERNAME=root
DB_PASSWORD=
```

Adjust `DB_USERNAME` and `DB_PASSWORD` to match your MySQL user.

### Install

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm install
npm run build
```

Run development:

```bash
composer run dev
```

Or separately:

```bash
php artisan serve
npm run dev
```

## Default Admin

- **Email:** `admin@bonyan.test`
- **Password:** `password`

Change these immediately in production.

## API

Public endpoints under `/api/v1/public/`. Admin endpoints under `/api/v1/admin/` (authenticated, admin-only).

## Project Structure

```
app/
  Contracts/       # Payment gateway, notifications interfaces
  Enums/
  Http/
    Controllers/Api/
    Middleware/
    Requests/
    Resources/
  Models/
  Services/
resources/js/
  api/             # API client & endpoints
  components/
    house/         # HouseLifeScene progress visualization (step images)
  contexts/        # Locale context
  i18n/locales/    # ar.json, en.json
  layouts/
  pages/
```

## License

MIT
