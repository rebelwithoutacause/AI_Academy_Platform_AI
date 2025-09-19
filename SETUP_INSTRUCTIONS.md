# AI Tools Platform Setup Instructions

## Prerequisites
- Docker and Docker Compose installed
- Git installed

## Step-by-Step Setup

### 1. Create Laravel Project
```bash
# Navigate to the platform directory
cd C:\Users\User\Desktop\Platform

# Create Laravel project
composer create-project laravel/laravel:^10.0 laravel
cd laravel

# Install Laravel Breeze for authentication
composer require laravel/breeze --dev
php artisan breeze:install api
npm install && npm run build
```

### 2. Configure Environment
Create `.env` file in `laravel` directory:
```env
APP_NAME="AI Tools Platform"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=ai_platform
DB_USERNAME=root
DB_PASSWORD=password

BROADCAST_DRIVER=log
CACHE_DRIVER=redis
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=redis
SESSION_LIFETIME=120

REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### 3. Start the Platform
```bash
# From the root directory (C:\Users\User\Desktop\Platform)
docker-compose up -d

# Check if all services are running
docker-compose ps
```

### 4. Access the Platform
- **Laravel Backend**: http://localhost:8000
- **Next.js Frontend**: http://localhost:3000
- **MySQL Database**: localhost:3306
- **Redis**: localhost:6379

### 5. Default User Accounts
After setup, you can login with these accounts:
- **Admin**: ivan@admin.local / password
- **Frontend Developer**: elena@frontend.local / password
- **Backend Developer**: petar@backend.local / password

## Troubleshooting

### If Laravel container fails to start:
```bash
docker-compose logs laravel
```

### If database connection fails:
```bash
# Check MySQL is ready
docker-compose exec mysql mysql -u root -ppassword -e "SHOW DATABASES;"

# Run migrations manually
docker-compose exec laravel php artisan migrate:fresh --seed
```

### If Next.js fails to start:
```bash
docker-compose logs nextjs

# Rebuild Next.js container
docker-compose build nextjs
docker-compose up -d nextjs
```

### Reset everything:
```bash
docker-compose down -v
docker-compose up -d
```