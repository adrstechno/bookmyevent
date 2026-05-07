# User Profile Management API Documentation

## Base URL
```
http://localhost:5000/api/user
```

## Authentication
All profile endpoints require authentication via JWT token. Token can be sent in two ways:
1. **Cookie**: `auth_token` (automatically set after login)
2. **Header**: `Authorization: Bearer <token>`

---

## 1. Get User Profile

### Endpoint
```
GET /profile
```

### Description
Retrieve the current user's profile information.

### Headers
```
Authorization: Bearer <your_jwt_token>
```
OR use cookie `auth_token` (automatically sent by browser)

### Response (Success - 200)
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "user": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
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

### Response (Error - 401)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Response (Error - 404)
```json
{
  "success": false,
  "message": "User not found"
}
```

---

## 2. Update User Profile

### Endpoint
```
PUT /profile
```

### Description
Update the current user's profile information. You can update one or more fields at a time.

### Headers
```
Authorization: Bearer <your_jwt_token>
Content-Type: application/json
```

### Request Body
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "9876543210",
  "email": "newemail@example.com"
}
```

**Note**: All fields are optional. Send only the fields you want to update.

### Response (Success - 200)
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "email": "newemail@example.com",
    "phone": "9876543210",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "user",
    "is_verified": true,
    "is_active": true
  }
}
```

### Response (Error - 400 - No fields provided)
```json
{
  "success": false,
  "message": "At least one field is required to update"
}
```

### Response (Error - 400 - Email already exists)
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### Response (Error - 400 - Phone already exists)
```json
{
  "success": false,
  "message": "Phone number already exists"
}
```

### Response (Error - 401)
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

## 3. Change Password (Existing API)

### Endpoint
```
POST /changePassword
```

### Description
Change the user's password (requires old password verification).

### Headers
```
Cookie: auth_token=<your_jwt_token>
Content-Type: application/json
```

### Request Body
```json
{
  "email": "user@example.com",
  "oldPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

### Response (Success - 200)
```json
{
  "message": "Password changed successfully"
}
```

### Response (Error - 401)
```json
{
  "message": "Invalid password"
}
```

---

## Mobile App Integration Example

### React Native / Flutter Example

#### 1. Get User Profile
```javascript
// React Native Example
const getUserProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    
    const response = await fetch('http://localhost:5000/api/user/profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('User Profile:', data.user);
      return data.user;
    } else {
      console.error('Error:', data.message);
    }
  } catch (error) {
    console.error('Network Error:', error);
  }
};
```

#### 2. Update User Profile
```javascript
// React Native Example
const updateUserProfile = async (profileData) => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    
    const response = await fetch('http://localhost:5000/api/user/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();
    
    if (data.success) {
      console.log('Profile Updated:', data.user);
      return data.user;
    } else {
      console.error('Error:', data.message);
      Alert.alert('Error', data.message);
    }
  } catch (error) {
    console.error('Network Error:', error);
    Alert.alert('Error', 'Failed to update profile');
  }
};

// Usage
updateUserProfile({
  first_name: 'John',
  last_name: 'Doe',
  phone: '9876543210'
});
```

---

## Testing with Postman/Thunder Client

### 1. Login First
```
POST http://localhost:5000/api/user/Login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```
Copy the `token` from response.

### 2. Get Profile
```
GET http://localhost:5000/api/user/profile
Authorization: Bearer <paste_token_here>
```

### 3. Update Profile
```
PUT http://localhost:5000/api/user/profile
Authorization: Bearer <paste_token_here>
Content-Type: application/json

{
  "first_name": "Updated Name",
  "phone": "9999999999"
}
```

---

## Error Codes Summary

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 404 | User not found |
| 500 | Server error |

---

## Notes

1. **Token Storage**: Store the JWT token securely in your mobile app (AsyncStorage for React Native, SharedPreferences for Flutter)
2. **Token Expiry**: Token expires after 1 hour. Handle 401 errors by redirecting to login
3. **Email/Phone Uniqueness**: System checks for duplicate email/phone before updating
4. **Partial Updates**: You can update only specific fields without sending all data
5. **Security**: Always use HTTPS in production environment
