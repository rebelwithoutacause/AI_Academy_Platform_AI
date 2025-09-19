# 🚀 AI Tools Platform API Documentation

Complete REST API documentation for the AI Tools Management Platform.

## 📋 Base Information

- **Base URL**: `http://localhost:8000/api`
- **Authentication**: Bearer Token (Laravel Sanctum)
- **Content-Type**: `application/json`
- **Response Format**: JSON

---

## 🔐 Authentication

### Login
```http
POST /login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "frontend"
  },
  "token": "1|abc123..."
}
```

### Get Current User
```http
GET /user
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "user@example.com",
  "role": "frontend",
  "role_display": "Frontend Developer",
  "role_color": "blue"
}
```

### Logout
```http
POST /logout
Authorization: Bearer {token}
```

---

## 🛠 Tools Management

### Get All Tools (Public)
```http
GET /tools
```

**Query Parameters:**
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `search` | string | Search in name, description, usage | `search=react` |
| `category` | string | Filter by category name | `category=Frontend Development` |
| `role` | string | Filter by role name | `role=Frontend Developer` |
| `tag` | string | Filter by tag name | `tag=ai` |
| `difficulty` | string | Filter by difficulty level | `difficulty=Beginner` |
| `min_rating` | number | Minimum rating filter | `min_rating=4.0` |
| `has_videos` | boolean | Filter tools with videos | `has_videos=true` |
| `sort_by` | string | Sort field | `sort_by=rating` |
| `sort_order` | string | Sort direction | `sort_order=desc` |
| `per_page` | number | Items per page (max 100) | `per_page=20` |

**Valid sort_by values:** `created_at`, `name`, `rating`, `difficulty_level`

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "GitHub Copilot",
      "link": "https://github.com/features/copilot",
      "documentation": "https://docs.github.com/en/copilot",
      "description": "AI-powered code completion tool...",
      "usage": "Install GitHub Copilot extension...",
      "examples": "Type a comment like...",
      "difficulty_level": "Beginner",
      "video_links": ["https://youtube.com/watch?v=example"],
      "rating": 4.8,
      "images": ["path/to/image.jpg"],
      "created_by": {
        "id": 1,
        "name": "John Doe",
        "email": "user@example.com"
      },
      "categories": [
        {"id": 1, "name": "Frontend Development"},
        {"id": 2, "name": "Backend Development"}
      ],
      "roles": [
        {"id": 1, "name": "Frontend Developer"},
        {"id": 2, "name": "Backend Developer"}
      ],
      "tags": [
        {"id": 1, "name": "ai"},
        {"id": 2, "name": "productivity"}
      ],
      "created_at": "2024-09-16T12:00:00Z",
      "updated_at": "2024-09-16T12:00:00Z"
    }
  ],
  "current_page": 1,
  "per_page": 20,
  "total": 7,
  "last_page": 1
}
```

### Get Single Tool
```http
GET /tools/{id}
```

**Response:** Same as single tool object above.

### Create Tool (Authenticated)
```http
POST /tools
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "New AI Tool",
  "link": "https://example.com",
  "documentation": "https://docs.example.com",
  "description": "Description of the tool",
  "usage": "How to use this tool",
  "examples": "Example usage scenarios",
  "difficulty_level": "Intermediate",
  "video_links": [
    "https://youtube.com/watch?v=example1",
    "https://vimeo.com/example2"
  ],
  "rating": 4.5,
  "images": ["uploaded/image/path.jpg"],
  "categories": [1, 2],
  "roles": [1, 3],
  "tags": ["ai", "productivity", "new-tool"]
}
```

**Validation Rules:**
- `name`: required, string, max 255 chars
- `link`: required, valid URL
- `documentation`: optional, string
- `description`: required, string
- `usage`: required, string
- `examples`: optional, string
- `difficulty_level`: optional, one of: Beginner, Intermediate, Advanced
- `video_links`: optional, array of valid URLs
- `rating`: optional, number between 0-5
- `images`: optional, array of strings
- `categories`: optional, array of category IDs
- `roles`: optional, array of role IDs
- `tags`: optional, array of tag names

**Response:** Created tool object with 201 status.

### Update Tool (Authenticated, Owner Only)
```http
PUT /tools/{id}
Authorization: Bearer {token}
```

**Request Body:** Same as create, all fields optional except name, link, description, usage.

**Response:** Updated tool object.

### Delete Tool (Authenticated, Owner Only)
```http
DELETE /tools/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Tool deleted successfully"
}
```

---

## 📁 File Upload

### Upload Images
```http
POST /tools/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Request Body:**
```
images[]: file (max 5 files, 2MB each)
```

**Validation:**
- File types: jpeg, png, jpg, gif
- Max size: 2MB per file
- Max files: 5

**Response:**
```json
{
  "urls": [
    "tools/abc123.jpg",
    "tools/def456.png"
  ]
}
```

### Delete Image
```http
DELETE /tools/images
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "tool_id": 1,
  "image_url": "tools/abc123.jpg"
}
```

**Response:**
```json
{
  "message": "Image deleted successfully",
  "images": ["remaining/image/paths.jpg"]
}
```

---

## 🏷 Categories, Roles & Tags

### Get All Categories
```http
GET /categories
```

**Response:**
```json
[
  {"id": 1, "name": "Frontend Development"},
  {"id": 2, "name": "Backend Development"},
  {"id": 3, "name": "Database"}
]
```

### Get All Roles
```http
GET /roles
```

**Response:**
```json
[
  {"id": 1, "name": "Frontend Developer"},
  {"id": 2, "name": "Backend Developer"},
  {"id": 3, "name": "Full Stack Developer"}
]
```

### Get All Tags
```http
GET /tags
```

**Response:**
```json
[
  {"id": 1, "name": "ai"},
  {"id": 2, "name": "productivity"},
  {"id": 3, "name": "security"}
]
```

### Get Filter Options
```http
GET /tools/filters/options
```

**Response:**
```json
{
  "categories": [...],
  "roles": [...],
  "tags": [...],
  "difficulty_levels": ["Beginner", "Intermediate", "Advanced"],
  "sort_options": [
    {"value": "created_at", "label": "Date Created"},
    {"value": "name", "label": "Name"},
    {"value": "rating", "label": "Rating"},
    {"value": "difficulty_level", "label": "Difficulty"}
  ]
}
```

---

## 📊 Advanced Filtering Examples

### Search with Multiple Filters
```http
GET /tools?search=ai&difficulty=Intermediate&min_rating=4.0&sort_by=rating&sort_order=desc
```

### Filter by Category and Role
```http
GET /tools?category=Frontend Development&role=Frontend Developer&has_videos=true
```

### Pagination with Sorting
```http
GET /tools?per_page=10&page=2&sort_by=name&sort_order=asc
```

---

## 🚨 Error Responses

### Validation Error (422)
```json
{
  "errors": {
    "name": ["The name field is required."],
    "link": ["The link must be a valid URL."]
  }
}
```

### Unauthorized (401)
```json
{
  "message": "Unauthenticated."
}
```

### Forbidden (403)
```json
{
  "error": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "error": "Tool not found"
}
```

### Server Error (500)
```json
{
  "error": "Internal server error"
}
```

---

## 🔄 Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Access denied |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error - Server error |

---

## 🧪 Testing Examples

### Using cURL

**Get all tools:**
```bash
curl -X GET "http://localhost:8000/api/tools" \
  -H "Accept: application/json"
```

**Create a tool:**
```bash
curl -X POST "http://localhost:8000/api/tools" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Tool",
    "link": "https://example.com",
    "description": "A test tool",
    "usage": "For testing purposes",
    "difficulty_level": "Beginner",
    "rating": 4.0,
    "categories": [1],
    "roles": [1],
    "tags": ["test", "example"]
  }'
```

**Upload images:**
```bash
curl -X POST "http://localhost:8000/api/tools/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "images[]=@/path/to/image1.jpg" \
  -F "images[]=@/path/to/image2.png"
```

### Using JavaScript/Fetch

**Get tools with filters:**
```javascript
const response = await fetch('/api/tools?search=ai&difficulty=Beginner&min_rating=4.0', {
  headers: {
    'Accept': 'application/json'
  }
});
const data = await response.json();
```

**Create a tool:**
```javascript
const response = await fetch('/api/tools', {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'New Tool',
    link: 'https://example.com',
    description: 'Tool description',
    usage: 'How to use it',
    difficulty_level: 'Intermediate',
    rating: 4.5,
    categories: [1, 2],
    roles: [1],
    tags: ['ai', 'productivity']
  })
});
```

---

## 📈 Rate Limiting

- **Public endpoints**: 60 requests per minute
- **Authenticated endpoints**: 100 requests per minute per user
- **File uploads**: 10 uploads per minute per user

---

## 🔧 Development Notes

### Database Schema
- **Tools**: Main tools table with all fields
- **Categories**: Predefined categories for organization
- **Roles**: User roles that benefit from tools
- **Tags**: Flexible tagging system
- **Pivot Tables**: Many-to-many relationships

### Authentication
- Uses Laravel Sanctum for API token authentication
- Tokens are stored in `personal_access_tokens` table
- Token expires on logout or manual revocation

### File Storage
- Images stored in `storage/app/public/tools/`
- Accessible via `/storage/tools/` URL
- Automatic cleanup on tool deletion

---

## 🎯 Future Enhancements

### Planned Features
- [ ] Tool reviews and comments
- [ ] User favorites system
- [ ] Tool analytics and usage stats
- [ ] Advanced search with Elasticsearch
- [ ] Tool recommendations based on user role
- [ ] API versioning (v2, v3)
- [ ] WebSocket real-time notifications
- [ ] GraphQL endpoint alternative

### Performance Optimizations
- [ ] Database indexing for search fields
- [ ] Redis caching for frequent queries
- [ ] CDN for image delivery
- [ ] Pagination optimization
- [ ] Query optimization with eager loading

---

This API documentation provides a complete reference for integrating with the AI Tools Platform. All endpoints are production-ready and include comprehensive validation, authentication, and error handling.