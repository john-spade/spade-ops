# SPADE OPS - Deployment & Architecture Notes

## Project Structure
- **SPADE-OPS/frontend**: React + Vite Application
- **SPADE-OPS/backend**: Laravel 11 API

## Backend Specifications
- **Stack**: Laravel 11, MySQL, Sanctum
- **PHP Version**: 8.2+ (Developed on 8.5)
- **Database**: MySQL

## Deployment Guide (Hostinger / Shared Hosting)

### 1. Database Setup
- Create a new MySQL database via your hosting control panel.
- Note the `Database Name`, `Username`, and `Password`.
- Ensure PHP extensions `pdo_mysql`, `mbstring`, `openssl`, `xml`, `ctype`, `json` are enabled.

### 2. Backend Installation
1. Upload the `backend` folder to your server (e.g., outside `public_html` if possible, or inside).
2. If uploading to `public_html/api`:
   - Ensure the document root points to `public_html/api/public` OR use `.htaccess` to redirect.
3. Configure `.env`:
   ```env
   APP_NAME="SPADE OPS"
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://your-domain.com/api

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=u12345_spade_ops
   DB_USERNAME=u12345_user
   DB_PASSWORD=your_password
   ```
4. Install Dependencies (if not uploaded `vendor`):
   - Run `composer install --optimize-autoloader --no-dev` via SSH or Terminal.
5. Migration:
   - Run `php artisan migrate --force`.
6. Storage Link:
   - Run `php artisan storage:link` (if using file uploads).

### 3. Frontend Installation
1. In `frontend` directory (locally), update `.env`:
   ```env
   VITE_API_BASE_URL=https://your-domain.com/api
   ```
2. Build the project:
   ```bash
   npm run build
   ```
3. Upload the contents of `dist/` to `public_html`.

### 4. Scheduled Backups
Add a Cron Job to run every minute:
```bash
* * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1
```
The application handles the specific timing (Daily/Weekly) internally.

## Security Overview
- **Role-Based Access Control (RBAC)**: Implemented via `EnsureUserRole` middleware.
- **Sanctum Auth**: Secure API tokens for stateful/stateless authentication.
- **Data Safety**: Automated daily database dumps and weekly full backups.
