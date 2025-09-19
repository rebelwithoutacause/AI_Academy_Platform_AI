# 🚀 AI Tools Platform

A comprehensive platform for discovering, managing, and collaborating on AI development tools. Built with Next.js 15, Laravel 11, and Docker.

## ✨ Features

- 🔐 **Two-Factor Authentication** with Email, Telegram, and Google Auth
- 🛠️ **Tool Management** with ratings, comments, and categories
- 👥 **Role-Based Access Control** with Owner, Admin, Developer, and Manager roles
- 💬 **Community Features** including comments and tool discussions
- 📊 **Analytics Dashboard** with real-time metrics
- 🌓 **Dark Mode Support** throughout the application
- 📱 **Responsive Design** for all device types

## 🏗️ Architecture

- **Frontend**: Next.js 15.5.3 with TypeScript and Tailwind CSS
- **Backend**: Laravel 11 with PHP 8.3
- **Database**: MySQL 8.0
- **Cache**: Redis 7
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Docker Desktop
- Git
- Node.js 18+ (for local development)
- PHP 8.3+ (for local development)

## 🚀 Quick Start with Docker

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Platform
```

### 2. Start with Docker Compose
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Access the Application
- **Frontend**: http://localhost:3003
- **Backend API**: http://localhost:8000
- **Database**: localhost:3307

### 4. Default Login Credentials
```
Email: ivan.ivanov@company.com
Password: password
2FA Code: 123456
```

## 🛠️ Local Development Setup

### Frontend Setup
```bash
cd frontend/nextjs
npm install
npm run dev
# Runs on http://localhost:3000
```

### Backend Setup
```bash
cd backend/laravel

# Install dependencies
composer install

# Set up environment
cp .env.example .env
php artisan key:generate

# Run migrations and seeders
php artisan migrate
php artisan db:seed

# Start development server
php artisan serve
# Runs on http://localhost:8000
```

### Environment Variables

Create `.env` files in both frontend and backend directories:

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend (.env)**:
```env
APP_NAME="AI Tools Platform"
APP_ENV=local
APP_KEY=base64:54w+Ogc0J2trcNKsgum1e9afW81H9vYAduQif5iQhbs=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=ai_platform
DB_USERNAME=root
DB_PASSWORD=password

REDIS_HOST=localhost
REDIS_PASSWORD=null
REDIS_PORT=6379
```

## 🔧 Adding New Tools

### Method 1: Database Seeder (Recommended)

1. **Edit the Tools Seeder**:
```bash
# Edit backend/laravel/database/seeders/ToolsSeeder.php
```

2. **Add your tool to the $tools array**:
```php
[
    'name' => 'Your Tool Name',
    'link' => 'https://yourtool.com',
    'documentation' => 'https://docs.yourtool.com',
    'description' => 'Tool description here...',
    'usage' => 'How to use this tool...',
    'examples' => 'Input: example | Output: result',
    'difficulty_level' => 'Beginner', // Beginner, Intermediate, Advanced
    'rating' => 4.5,
    'created_by' => $user->id,
    'categories' => [$categoryId], // Array of category IDs
    'roles' => [$roleId] // Array of role IDs
]
```

3. **Run the seeder**:
```bash
docker exec ai-platform-laravel php artisan db:seed --class=ToolsSeeder
```

### Method 2: API Endpoint

**POST** `/api/tools`
```json
{
    "name": "Tool Name",
    "link": "https://tool.com",
    "documentation": "https://docs.tool.com",
    "description": "Tool description",
    "usage": "How to use",
    "examples": "Input/Output examples",
    "difficulty_level": "Beginner",
    "rating": 4.5
}
```

### Method 3: Admin Panel

1. Login as an **Owner** or **Admin**
2. Navigate to **Admin Panel** → **Tools**
3. Click **"Add New Tool"**
4. Fill in the tool information
5. Assign categories and roles

## 👥 Role System & Permissions

### Role Hierarchy

| Role | Level | Permissions |
|------|-------|-------------|
| **Owner** | 4 | Full system access, user management, system settings |
| **Admin** | 3 | User management, tool management, analytics |
| **Manager** | 2 | Tool management, team coordination, reports |
| **Developer** | 1 | Tool usage, comments, basic features |

### Detailed Permissions

#### 🔰 Owner
- ✅ **Full System Control**
- ✅ **User Management** (create, edit, delete users)
- ✅ **Role Assignment** (assign any role)
- ✅ **System Settings** (configuration, security)
- ✅ **Analytics** (all metrics and reports)
- ✅ **Tool Management** (add, edit, delete tools)
- ✅ **Category Management**

#### 🛡️ Admin
- ✅ **User Management** (create, edit users - not Owners)
- ✅ **Role Assignment** (assign roles below Admin)
- ✅ **Tool Management** (full CRUD operations)
- ✅ **Analytics** (platform metrics)
- ✅ **Category Management**
- ✅ **Comment Moderation**

#### 📊 Manager
- ✅ **Tool Management** (add, edit tools)
- ✅ **Team Coordination** (view team metrics)
- ✅ **Reports** (generate usage reports)
- ✅ **Tool Categories** (manage categories)
- ❌ User management
- ❌ System settings

#### 👨‍💻 Developer
- ✅ **Tool Usage** (view and use all tools)
- ✅ **Comments** (add, edit own comments)
- ✅ **Tool Ratings** (rate and review tools)
- ✅ **Profile Management** (edit own profile)
- ❌ Tool management
- ❌ User management
- ❌ Admin features

### Role-Based Navigation

The platform automatically adjusts the navigation and available features based on the user's role:

```typescript
// Navigation items shown based on role
Owner/Admin: Dashboard, Tools, Users, Analytics, Settings
Manager: Dashboard, Tools, Reports, Team
Developer: Dashboard, Tools, Profile
```

## 👥 Demo Accounts

### Test Users

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Owner | ivan.ivanov@company.com | password | Full access |
| Admin | elena.petrova@company.com | password | Admin features |
| Manager | maria.dimitrova@company.com | password | Management tools |
| Developer | peter.georgiev@company.com | password | Basic user |
| Developer | stefan.nikolov@company.com | password | QA Engineer |
| Developer | anna.petrova@company.com | password | Designer |

**All accounts use:**
- **Password**: `password`
- **2FA Code**: `123456`

## 🔐 Authentication & Security

### Two-Factor Authentication (2FA)

All users must complete 2FA after standard login:

1. **Email** 📧 - Mock email verification
2. **Telegram** ✈️ - Mock Telegram bot integration
3. **Google Auth** 🔒 - Mock authenticator app

**Test 2FA Code**: `123456`

### Security Features

- 🔒 **JWT Token Authentication**
- 🛡️ **Role-based access control**
- 🔐 **Password encryption**
- 🚫 **CSRF protection**
- ⏰ **Session management**
- 🔄 **Token refresh**

## 📊 API Documentation

### Authentication Endpoints

```bash
POST /api/login
POST /api/logout
GET  /api/user
```

### Tools Endpoints

```bash
GET    /api/tools           # List all tools
POST   /api/tools           # Create new tool (Admin+)
GET    /api/tools/{id}      # Get specific tool
PUT    /api/tools/{id}      # Update tool (Admin+)
DELETE /api/tools/{id}      # Delete tool (Admin+)
```

### Users Endpoints (Admin+)

```bash
GET    /api/users           # List users
POST   /api/users           # Create user
GET    /api/users/{id}      # Get user
PUT    /api/users/{id}      # Update user
DELETE /api/users/{id}      # Delete user
```

### Comments Endpoints

```bash
GET    /api/tools/{id}/comments     # Get tool comments
POST   /api/tools/{id}/comments     # Add comment
PUT    /api/comments/{id}           # Edit own comment
DELETE /api/comments/{id}           # Delete own comment
```

## 🐳 Docker Services

### Service Overview

| Service | Container | Port | Description |
|---------|-----------|------|-------------|
| **Laravel** | ai-platform-laravel | 8000 | Backend API |
| **Next.js** | ai-platform-nextjs | 3003 | Frontend App |
| **MySQL** | ai-platform-mysql | 3307 | Database |
| **Redis** | ai-platform-redis | 6379 | Cache |

### Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Execute commands in containers
docker exec ai-platform-laravel php artisan migrate
docker exec ai-platform-mysql mysql -u root -p ai_platform

# Rebuild containers
docker-compose build --no-cache
docker-compose up -d --force-recreate
```

### Database Access

```bash
# Connect to MySQL
docker exec -it ai-platform-mysql mysql -u root -p
# Password: password

# Use the database
USE ai_platform;

# View tables
SHOW TABLES;
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend/nextjs
npm test
npm run test:e2e
```

### Backend Testing
```bash
cd backend/laravel
./vendor/bin/phpunit
```

## 🏗️ Updated Architecture

### Backend (Laravel 11)
- **Authentication**: Laravel Sanctum with 2FA
- **Database**: MySQL 8.0 with comprehensive schema
- **API Routes**: Tools, Users, Comments, Authentication
- **CORS**: Configured for multiple frontends
- **Features**: Role-based permissions, tool management, comments

### Frontend (Next.js 15)
- **Framework**: Next.js 15.5.3 with TypeScript
- **Styling**: Tailwind CSS with dark mode
- **Authentication**: Custom hooks with 2FA flow
- **Components**: ToolCard, Dashboard, Comments, Navigation
- **Features**: Real-time updates, responsive design, role-based UI

### Database Schema
```sql
users table:
- id, name, email, role, password
- created_at, updated_at

tools table:
- id, name, link, documentation, description
- usage, examples, difficulty_level, rating
- created_by, created_at, updated_at

categories table:
- id, name, created_at, updated_at

roles table:
- id, name, created_at, updated_at

comments table:
- id, tool_id, user_id, content
- created_at, updated_at

tool_categories table:
- tool_id, category_id

tool_roles table:
- tool_id, role_id
```

## 🔧 Troubleshooting

### Common Issues

**1. Docker containers not starting**
```bash
# Check Docker status
docker ps
docker-compose logs

# Restart services
docker-compose down
docker-compose up -d
```

**2. Database connection errors**
```bash
# Reset database
docker-compose down -v
docker-compose up -d
docker exec ai-platform-laravel php artisan migrate:fresh --seed
```

**3. Frontend build errors**
```bash
# Clear Next.js cache
cd frontend/nextjs
rm -rf .next
npm install
npm run dev
```

**4. Permission errors**
```bash
# Fix Laravel permissions
docker exec ai-platform-laravel chmod -R 775 storage bootstrap/cache
```

### Port Conflicts

If ports are in use, modify `docker-compose.yml`:

```yaml
ports:
  - "3004:80"  # Change 3003 to 3004
  - "8001:80"  # Change 8000 to 8001
  - "3308:3306" # Change 3307 to 3308
```

## 📚 Development Guidelines

### Code Style

- **Frontend**: ESLint + Prettier with TypeScript
- **Backend**: PSR-12 PHP coding standards
- **Git**: Conventional commits

### Contributing

1. Fork the repository
2. Create a feature branch
3. Follow coding standards
4. Add tests for new features
5. Submit a pull request

### Project Structure

```
Platform/
├── frontend/nextjs/          # Next.js frontend
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── hooks/              # Custom hooks
│   └── data/               # Mock data
├── backend/laravel/         # Laravel backend
│   ├── app/                # Application logic
│   ├── database/           # Migrations & seeders
│   └── routes/             # API routes
└── docker-compose.yml      # Docker configuration
```

## 📞 Support

For questions or issues:

1. Check the troubleshooting section
2. Review Docker logs
3. Open an issue on GitHub
4. Contact the development team

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

---

**Happy Coding!** 🚀✨