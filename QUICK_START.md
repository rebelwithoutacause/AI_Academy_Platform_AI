# 🚀 Quick Start Guide - AI Tools Platform

## ⚡ Get Started in 5 Minutes

### Step 1: Clone or Download
Download all files to `C:\Users\User\Desktop\Platform\`

### Step 2: Create Laravel Project
```bash
cd C:\Users\User\Desktop\Platform
composer create-project laravel/laravel:^10.0 laravel
cd laravel
composer require laravel/breeze --dev
php artisan breeze:install api
npm install && npm run build
```

### Step 3: Create Next.js Project
```bash
cd C:\Users\User\Desktop\Platform
npx create-next-app@14 nextjs --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

### Step 4: Copy Configuration Files
All the configuration files are already created in the proper directories. Make sure:
- `laravel/.env` exists (copy from `.env.example`)
- All component files are in `nextjs/app/`
- Docker files are in place

### Step 5: Start Everything
```bash
# From C:\Users\User\Desktop\Platform\
docker-compose up -d
```

### Step 6: Wait & Access
Wait 30-60 seconds for all services to start, then access:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000

## 🔑 Login Credentials

| User | Email | Password | Role |
|------|-------|----------|------|
| **Иван Иванов** | ivan@admin.local | password | owner |
| **Елена Петрова** | elena@frontend.local | password | frontend |
| **Петър Георгиев** | petar@backend.local | password | backend |

## ✅ Success Checklist

- [ ] Docker containers running: `docker-compose ps`
- [ ] Laravel accessible: http://localhost:8000/health
- [ ] Next.js accessible: http://localhost:3000
- [ ] Can login with demo accounts
- [ ] Dashboard shows user info and role

## 🛠️ If Something Goes Wrong

### Laravel Issues:
```bash
docker-compose logs laravel
docker-compose exec laravel php artisan migrate:fresh --seed
```

### Next.js Issues:
```bash
docker-compose logs nextjs
docker-compose restart nextjs
```

### Database Issues:
```bash
docker-compose logs mysql
docker-compose exec mysql mysql -u root -ppassword -e "SHOW DATABASES;"
```

### Nuclear Option:
```bash
docker-compose down -v
docker-compose up -d
```

## 🎯 What You Get

✅ **Complete Authentication System**
✅ **Role-based Dashboard**
✅ **Real-time UI Updates**
✅ **Responsive Design**
✅ **API Integration**
✅ **Docker Development Environment**
✅ **Demo Users Ready**

## 🚀 Next Steps

1. **Add AI Tools**: Create CRUD for tools management
2. **User Management**: Admin panel for user operations
3. **File Uploads**: Tool screenshots and documentation
4. **Search & Filter**: Advanced tool discovery
5. **Analytics**: Usage tracking and reporting

---

**🎉 You now have a fully functional AI Tools Platform!**