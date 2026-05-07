# Quick API Testing Guide - Profile Edit APIs

## 🚀 Start the Server

```bash
cd Event_backend
npm start
# or
node Server.js
```

Server should start on: `http://localhost:5000`

---

## 🧪 Test APIs using cURL or Postman

### Step 1: Login to Get Token

```bash
curl -X POST http://localhost:5000/User/Login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "user",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "your-email@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Copy the `token` value for next steps!**

---

### Step 2: Get User Profile

```bash
curl -X GET http://localhost:5000/User/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "user": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "email": "your-email@example.com",
    "phone": "9876543210",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "user",
    "is_verified": true,
    "is_active": true,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Step 3: Update User Profile

#### Update First Name Only
```bash
curl -X PUT http://localhost:5000/User/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Updated Name"
  }'
```

#### Update Multiple Fields
```bash
curl -X PUT http://localhost:5000/User/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Smith",
    "phone": "9999999999"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "email": "your-email@example.com",
    "phone": "9999999999",
    "first_name": "John",
    "last_name": "Smith",
    "user_type": "user",
    "is_verified": true,
    "is_active": true
  }
}
```

---

## 📱 Postman Collection

### 1. Create New Collection: "Profile Edit APIs"

### 2. Add Requests:

#### Request 1: Login
- **Method**: POST
- **URL**: `http://localhost:5000/User/Login`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```
- **Tests** (to auto-save token):
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("auth_token", jsonData.token);
}
```

#### Request 2: Get Profile
- **Method**: GET
- **URL**: `http://localhost:5000/User/profile`
- **Headers**: 
  - `Authorization: Bearer {{auth_token}}`

#### Request 3: Update Profile
- **Method**: PUT
- **URL**: `http://localhost:5000/User/profile`
- **Headers**: 
  - `Authorization: Bearer {{auth_token}}`
  - `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "first_name": "Updated Name",
  "last_name": "Updated Last Name",
  "phone": "9999999999"
}
```

---

## 🔍 Testing Scenarios

### ✅ Positive Test Cases

1. **Get Profile - Success**
   - Login → Get valid token → Call GET /profile
   - Expected: 200 OK with user data

2. **Update Profile - Single Field**
   - Update only first_name
   - Expected: 200 OK with updated data

3. **Update Profile - Multiple Fields**
   - Update first_name, last_name, phone
   - Expected: 200 OK with all updated data

4. **Update Profile - Partial Update**
   - Update only phone number
   - Expected: Other fields remain unchanged

---

### ❌ Negative Test Cases

1. **Get Profile - No Token**
   ```bash
   curl -X GET http://localhost:5000/User/profile
   ```
   - Expected: 401 Unauthorized

2. **Get Profile - Invalid Token**
   ```bash
   curl -X GET http://localhost:5000/User/profile \
     -H "Authorization: Bearer invalid_token_here"
   ```
   - Expected: 401 Unauthorized

3. **Update Profile - Duplicate Email**
   ```bash
   curl -X PUT http://localhost:5000/User/profile \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"email": "existing-email@example.com"}'
   ```
   - Expected: 400 Bad Request - "Email already exists"

4. **Update Profile - Duplicate Phone**
   ```bash
   curl -X PUT http://localhost:5000/User/profile \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"phone": "9876543210"}'
   ```
   - Expected: 400 Bad Request - "Phone number already exists"

5. **Update Profile - No Fields**
   ```bash
   curl -X PUT http://localhost:5000/User/profile \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{}'
   ```
   - Expected: 400 Bad Request - "At least one field is required"

---

## 🐛 Common Issues & Solutions

### Issue 1: "Access denied. No token provided"
**Cause**: Token missing in request
**Solution**: Add Authorization header with Bearer token

### Issue 2: "Invalid or expired token"
**Cause**: Token expired (1 hour validity)
**Solution**: Login again to get new token

### Issue 3: "Email already exists"
**Cause**: Trying to update email to one that's already registered
**Solution**: Use a different email or keep current email

### Issue 4: "User not found"
**Cause**: User deleted or UUID mismatch
**Solution**: Check database, re-register if needed

### Issue 5: CORS Error (from browser/mobile app)
**Cause**: Origin not allowed in CORS config
**Solution**: Add your mobile app origin in Server.js CORS config

---

## 📊 Expected Response Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | Success | Profile retrieved/updated successfully |
| 400 | Bad Request | Validation error, duplicate email/phone |
| 401 | Unauthorized | Missing/invalid token |
| 404 | Not Found | User not found |
| 500 | Server Error | Database or server issue |

---

## 🔐 Security Checklist

- [x] JWT token required for all profile operations
- [x] Token verification on every request
- [x] Email uniqueness check
- [x] Phone uniqueness check
- [x] Password not returned in responses
- [x] Token expiry (1 hour)
- [x] CORS protection enabled

---

## 📝 Notes

1. **Token Expiry**: Tokens expire after 1 hour. Login again to get new token.
2. **Partial Updates**: You can update only specific fields, no need to send all data.
3. **Email/Phone Validation**: Backend checks for duplicates before updating.
4. **Case Sensitivity**: Email comparison is case-insensitive in MySQL.
5. **Production**: Use HTTPS in production environment.

---

## 🎯 Quick Test Checklist

- [ ] Server starts without errors
- [ ] Login API works and returns token
- [ ] Get Profile API returns user data
- [ ] Update Profile API updates single field
- [ ] Update Profile API updates multiple fields
- [ ] Duplicate email check works
- [ ] Duplicate phone check works
- [ ] Invalid token returns 401
- [ ] Missing token returns 401
- [ ] Empty update body returns 400

---

**Happy Testing! 🚀**
