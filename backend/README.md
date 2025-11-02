# Task Manager Backend API

Backend API cho ứng dụng Task Manager với authentication JWT.

## 🎯 Tính năng

- ✅ User registration với email & password
- ✅ User login với JWT authentication
- ✅ Password hashing với bcryptjs
- ✅ Protected routes với JWT middleware
- ✅ MongoDB database với Mongoose
- ✅ RESTful API design
- ✅ Error handling

## 📁 Cấu trúc thư mục

```
backend/
├── config/
│   └── db.js                    # MongoDB connection
├── src/
│   ├── controllers/
│   │   └── authController.js    # Authentication logic
│   ├── middlewares/
│   │   └── authMiddleware.js    # JWT protection middleware
│   ├── models/
│   │   └── User.js              # User model
│   └── routers/
│       └── authRoutes.js        # Auth routes
├── .env                         # Environment variables
├── index.js                     # Main server file
├── package.json
├── API_DOCUMENTATION.md         # Chi tiết API docs
└── README.md
```

## 🚀 Cài đặt

### 1. Clone và cài dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình môi trường (.env)

File `.env` đã được cấu hình sẵn:

```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=task_manager_jwt_secret_key_2025_change_this_in_production
```

### 3. Chạy server

```bash
# Development mode (với nodemon)
npm run dev

# Production mode
npm start
```

Server sẽ chạy tại: **http://localhost:5000**

## 📡 API Endpoints

### Public Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Đăng ký user mới |
| POST | `/api/auth/login` | Đăng nhập |
| GET | `/api/auth/users` | Lấy danh sách users |
| GET | `/api/auth/users/:id` | Lấy user theo ID |

### Protected Routes (Require JWT Token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/me` | Lấy thông tin user hiện tại |

## 🔐 Authentication Flow

### 1. Register/Login
```bash
# Register
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "123456"
}
```

Response sẽ trả về `token`:
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Sử dụng Protected Routes

Thêm token vào header:
```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🧪 Testing

### Với cURL:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Get Me (với token)
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Với Postman/Thunder Client:

1. Gửi POST request đến `/api/auth/login`
2. Copy token từ response
3. Trong protected routes:
   - Tab "Authorization" → Type: "Bearer Token"
   - Paste token

## 📦 Dependencies

```json
{
  "bcryptjs": "^2.4.3",        // Password hashing
  "cors": "^2.8.5",            // CORS middleware
  "dotenv": "^17.2.3",         // Environment variables
  "express": "^5.1.0",         // Web framework
  "jsonwebtoken": "^9.0.2",    // JWT authentication
  "mongoose": "^8.19.2"        // MongoDB ODM
}
```

## 🔒 Security

- Passwords được hash với bcryptjs (10 salt rounds)
- JWT tokens expire sau 30 ngày
- Password không được trả về trong response
- Email validation với regex
- Unique constraints cho username và email

## 📚 Tài liệu chi tiết

Xem file `API_DOCUMENTATION.md` để biết chi tiết về:
- Request/Response examples
- Error codes
- Authentication flow
- Testing examples

## 🎯 Next Steps

- [ ] Tạo API cho Categories
- [ ] Tạo API cho Tasks
- [ ] Thêm role-based authorization
- [ ] Thêm password reset
- [ ] Thêm email verification
- [ ] Thêm refresh token
- [ ] Rate limiting
- [ ] Request validation middleware

## 📞 Support

Nếu có vấn đề, kiểm tra:
1. MongoDB connection string trong `.env`
2. Server đã chạy chưa (`npm run dev`)
3. Dependencies đã cài đặt chưa (`npm install`)
4. Console logs để xem errors
