# Tools Module Setup Guide

This guide will help you set up the complete Tools Module for your Laravel + Next.js platform.

## 🚀 What's Included

The Tools Module provides:
- **Frontend**: React components for browsing, adding, editing, and deleting tools
- **Backend**: Laravel API with full CRUD operations
- **Image Upload**: File upload functionality with storage management
- **Filtering**: Advanced filtering by category, role, tag, and search
- **Authentication**: Protected routes for creating/editing tools
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 📁 Files Created

### Backend (Laravel)
```
backend/laravel/
├── app/Http/Controllers/ToolController.php     # Main API controller
├── app/Models/Tool.php                         # Tool model (already existed)
├── app/Models/Tag.php                          # Tag model (already existed)
├── database/migrations/
│   ├── 2024_09_16_000003_create_tags_table.php
│   ├── 2024_09_16_000004_create_tools_table.php
│   ├── 2024_09_16_000005_create_tool_categories_table.php
│   ├── 2024_09_16_000006_create_tool_roles_table.php
│   └── 2024_09_16_000007_create_tool_tags_table.php
├── database/seeders/ToolsSeeder.php            # Sample categories and roles
├── routes/api.php                              # Updated with tools routes
└── storage/app/public/tools/                   # Image storage directory
```

### Frontend (Next.js)
```
frontend/nextjs/app/
├── tools/page.tsx                              # Main tools page
├── components/
│   ├── ToolCard.tsx                           # Individual tool display
│   ├── ToolForm.tsx                           # Add/edit tool form
│   ├── ToolsFilter.tsx                        # Search and filter component
│   └── Navbar.tsx                             # Updated with tools navigation
├── lib/
│   ├── api.ts                                 # Updated with tools API methods
│   └── types.ts                               # TypeScript type definitions
```

## 🛠 Setup Instructions

### 1. Database Setup

Run the migrations to create the required tables:

```bash
cd backend/laravel
php artisan migrate
```

### 2. Seed the Database

Populate with initial categories and roles:

```bash
php artisan db:seed --class=ToolsSeeder
```

### 3. Storage Setup

Create the storage link for public file access:

```bash
php artisan storage:link
```

Ensure the uploads directory exists:

```bash
mkdir -p storage/app/public/tools
chmod 755 storage/app/public/tools
```

### 4. Environment Configuration

Make sure your `.env` file in the Laravel backend has:

```env
FILESYSTEM_DRIVER=public
```

In your Next.js frontend `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 5. Install Dependencies (if needed)

The frontend components use existing dependencies, but if you need to install them:

```bash
cd frontend/nextjs
npm install axios
```

## 📋 API Endpoints

### Public Endpoints (No Authentication Required)
- `GET /api/tools` - List all tools with optional filters
- `GET /api/tools/{id}` - Get specific tool details
- `GET /api/categories` - Get all categories
- `GET /api/roles` - Get all roles
- `GET /api/tags` - Get all tags

### Protected Endpoints (Authentication Required)
- `POST /api/tools` - Create new tool
- `PUT /api/tools/{id}` - Update tool (only by creator)
- `DELETE /api/tools/{id}` - Delete tool (only by creator)
- `POST /api/tools/upload` - Upload images
- `DELETE /api/tools/images` - Delete specific image

### Query Parameters for Filtering
- `search` - Search by tool name
- `category` - Filter by category name
- `role` - Filter by role name
- `tag` - Filter by tag name

Example: `/api/tools?search=react&category=Frontend Development&role=Frontend Developer`

## 🎨 Frontend Features

### Tools Page (`/tools`)
- **Browse Tools**: View all available tools in a card layout
- **Advanced Filtering**: Filter by search, category, role, and tag
- **Add New Tool**: Create new tools (requires authentication)
- **Edit/Delete**: Manage your own tools
- **Responsive Design**: Works on mobile and desktop

### Tool Card Features
- Tool name, description, and usage instructions
- Links to official website and documentation
- Screenshot gallery with thumbnail view
- Category, role, and tag badges
- Creator information
- Edit/delete buttons for tool owners

### Tool Form Features
- Complete form with validation
- Multi-select for categories and roles
- Tag input with comma separation
- Image upload (up to 5 images)
- Image preview and deletion
- Real-time form validation

## 🔧 Customization

### Adding New Categories/Roles
You can add new categories and roles directly through the database or by extending the seeder:

```sql
INSERT INTO categories (name, created_at, updated_at) VALUES ('New Category', NOW(), NOW());
INSERT INTO roles (name, created_at, updated_at) VALUES ('New Role', NOW(), NOW());
```

### Styling
The components use Tailwind CSS classes. You can customize the appearance by modifying the class names in the component files.

### Image Storage
By default, images are stored in `storage/app/public/tools/`. You can change this by modifying the `uploadImages` method in `ToolController.php`.

## 🔒 Security Features

- **Authentication**: Only logged-in users can create/edit tools
- **Authorization**: Users can only edit/delete their own tools
- **File Upload Validation**: Images are validated for type and size
- **SQL Injection Protection**: Uses Eloquent ORM with parameter binding
- **XSS Protection**: Frontend sanitizes user input

## 🚦 Testing the Module

1. **Start your development servers**:
   ```bash
   # Backend
   cd backend/laravel && php artisan serve

   # Frontend
   cd frontend/nextjs && npm run dev
   ```

2. **Visit the tools page**: `http://localhost:3000/tools`

3. **Test the features**:
   - Browse tools without authentication
   - Login to create/edit tools
   - Upload images and test filtering
   - Test responsive design on mobile

## 🐛 Troubleshooting

### Images not displaying
- Check if `php artisan storage:link` was run
- Verify `FILESYSTEM_DRIVER=public` in `.env`
- Check file permissions on storage directory

### API errors
- Verify database migrations ran successfully
- Check Laravel logs: `tail -f storage/logs/laravel.log`
- Ensure API URL is correct in frontend `.env.local`

### Form submission issues
- Check browser network tab for API errors
- Verify authentication token is being sent
- Check CORS settings if frontend/backend are on different ports

## 🎯 Next Steps

1. **Add more categories/roles** based on your team's needs
2. **Customize styling** to match your platform's design
3. **Add more fields** to tools (difficulty level, video tutorials, etc.)
4. **Implement favorites** or rating system
5. **Add tool reviews** or comments feature

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify all setup steps were completed
3. Check Laravel and browser console logs for errors
4. Ensure all file permissions are correct

The Tools Module is now fully integrated into your platform! 🎉