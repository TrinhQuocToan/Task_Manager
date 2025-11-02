# OTP Authentication API Documentation

## 🔐 OTP Flow

```
User → Request OTP → Email với 6-digit code → Verify OTP → Reset Password → Success
```

---

## API Endpoints

### 1. Send OTP - Gửi Mã OTP

**Endpoint:** `POST /api/auth/send-otp`

**Description:** Gửi mã OTP (6 chữ số) qua email.

**Request Body:**
```json
{
  "email": "minh@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP code has been sent to your email",
  "data": {
    "email": "minh@example.com",
    "expiresIn": "10 minutes"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Please provide your email address"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Email could not be sent. Please try again later."
}
```

---

### 2. Verify OTP - Xác Thực Mã OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Description:** Xác thực mã OTP nhận được từ email.

**Request Body:**
```json
{
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP verified successfully. You can now reset your password.",
  "data": {
    "email": "minh@example.com",
    "verified": true
  }
}
```

**Error Response (400 - Missing fields):**
```json
{
  "success": false,
  "message": "Please provide email and OTP code"
}
```

**Error Response (400 - Invalid format):**
```json
{
  "success": false,
  "message": "OTP must be 6 digits"
}
```

**Error Response (400 - Invalid OTP):**
```json
{
  "success": false,
  "message": "Invalid OTP code"
}
```

**Error Response (400 - Expired):**
```json
{
  "success": false,
  "message": "Invalid or expired OTP code"
}
```

---

### 3. Reset Password with OTP - Đổi Mật Khẩu

**Endpoint:** `POST /api/auth/reset-password-otp`

**Description:** Đặt lại mật khẩu mới sau khi verify OTP thành công.

**Request Body:**
```json
{
  "email": "minh@example.com",
  "otp": "123456",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now login with your new password."
}
```

**Error Response (400 - Missing fields):**
```json
{
  "success": false,
  "message": "Please provide email, OTP, new password and confirm password"
}
```

**Error Response (400 - Password mismatch):**
```json
{
  "success": false,
  "message": "Passwords do not match"
}
```

**Error Response (400 - Password too short):**
```json
{
  "success": false,
  "message": "Password must be at least 6 characters"
}
```

**Error Response (400 - OTP not verified):**
```json
{
  "success": false,
  "message": "Please verify OTP first"
}
```

---

### 4. Resend OTP - Gửi Lại Mã OTP

**Endpoint:** `POST /api/auth/resend-otp`

**Description:** Gửi lại mã OTP mới nếu user chưa nhận được hoặc mã đã hết hạn.

**Request Body:**
```json
{
  "email": "minh@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "New OTP code has been sent to your email"
}
```

---

## 🔄 Complete Workflow

### Step 1: User Requests OTP

```bash
POST http://localhost:5000/api/auth/send-otp
Content-Type: application/json

{
  "email": "minh@example.com"
}
```

**Response:**
- User receives email với mã OTP 6 chữ số
- OTP có hiệu lực trong **10 phút**

### Step 2: User Enters OTP

```bash
POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "minh@example.com",
  "otp": "123456"
}
```

**Response:**
- OTP được xác thực
- User có thể proceed to reset password

### Step 3: User Resets Password

```bash
POST http://localhost:5000/api/auth/reset-password-otp
Content-Type: application/json

{
  "email": "minh@example.com",
  "otp": "123456",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}
```

**Response:**
- Password updated successfully
- User receives confirmation email

### Optional: Resend OTP

```bash
POST http://localhost:5000/api/auth/resend-otp
Content-Type: application/json

{
  "email": "minh@example.com"
}
```

---

## 🧪 Testing with cURL

### Send OTP
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"minh@example.com"}'
```

### Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"minh@example.com","otp":"123456"}'
```

### Reset Password
```bash
curl -X POST http://localhost:5000/api/auth/reset-password-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email":"minh@example.com",
    "otp":"123456",
    "newPassword":"newpass123",
    "confirmPassword":"newpass123"
  }'
```

### Resend OTP
```bash
curl -X POST http://localhost:5000/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"minh@example.com"}'
```

---

## 🧪 Testing with Postman

### Step 1: Send OTP
1. **Method**: POST
2. **URL**: `http://localhost:5000/api/auth/send-otp`
3. **Body** (raw JSON):
   ```json
   {
     "email": "minh@example.com"
   }
   ```
4. Check email inbox for OTP code

### Step 2: Verify OTP
1. **Method**: POST
2. **URL**: `http://localhost:5000/api/auth/verify-otp`
3. **Body** (raw JSON):
   ```json
   {
     "email": "minh@example.com",
     "otp": "123456"
   }
   ```

### Step 3: Reset Password
1. **Method**: POST
2. **URL**: `http://localhost:5000/api/auth/reset-password-otp`
3. **Body** (raw JSON):
   ```json
   {
     "email": "minh@example.com",
     "otp": "123456",
     "newPassword": "newpass123",
     "confirmPassword": "newpass123"
   }
   ```

---

## 🔒 Security Features

- ✅ OTP được hash với SHA256 trước khi lưu database
- ✅ OTP expires sau **10 phút**
- ✅ OTP chỉ dùng được 1 lần
- ✅ Phải verify OTP trước khi reset password
- ✅ OTP format: 6 chữ số (100000 - 999999)
- ✅ Password được hash với bcrypt
- ✅ Không tiết lộ email có tồn tại hay không

---

## 📧 Email Template

Email chứa:
- Mã OTP 6 chữ số với styling đẹp
- Thông báo expire time (10 phút)
- Warning nếu không phải user request

**Example:**
```
Hi minhdv,

You requested to reset your password.

Your OTP code is:

┌─────────┐
│ 123456  │
└─────────┘

⚠️ Important: This code will expire in 10 minutes.
```

---

## 📝 Database Changes

User model đã thêm 3 fields:

```javascript
{
  otpCode: String,           // Hashed OTP code
  otpExpires: Date,          // Expiration time
  otpVerified: Boolean       // OTP verification status
}
```

---

## ⚠️ Error Handling

### OTP đã hết hạn
- User cần request OTP mới (Resend OTP)

### OTP sai format
- OTP phải là 6 chữ số

### Email không tồn tại
- API vẫn trả success (security best practice)

### OTP chưa được verify
- User phải verify OTP trước khi reset password

---

## 🎯 Advantages of OTP vs Token

| Feature | OTP | Token Link |
|---------|-----|------------|
| User Experience | ✅ Simple (copy 6 digits) | ❌ Click link |
| Security | ✅ Short-lived (10 min) | ⚠️ Long-lived (1 hour) |
| Mobile Friendly | ✅ Easy to copy | ❌ Need to open link |
| Verification | ✅ Two-step (verify + reset) | ❌ One-step |
| Rate Limiting | ✅ Easy to implement | ⚠️ Complex |

---

## 🚀 Next Steps

- [ ] Rate limiting cho send-otp endpoint
- [ ] CAPTCHA cho send-otp
- [ ] Limit số lần gửi OTP (max 3 lần/hour)
- [ ] Log OTP requests
- [ ] SMS OTP option
- [ ] 2FA with OTP
- [ ] Brute force protection

---

## 📞 Support

**Configuration:**
```env
EMAIL_USER=projectfer202@gmail.com
EMAIL_PASSWORD=xlob inzp hewq szkn
FRONTEND_URL=http://localhost:5173
```

**Test Users:**
- minhdv (minh@example.com)
- toantq (toantrinhdth@gmail.com)
