# Authentication API Reference

## Overview
This document details the authentication endpoints, including registration, login, email verification, and password reset functionality.

## Base URL
```
https://api.systimz.com
```

## Authentication Endpoints

### 1. User Registration
Register a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Validation Rules:**
- `name`: Required, non-empty string
- `email`: Valid email format, unique in system
- `password`: Minimum 8 characters, must contain uppercase, lowercase, and number

**Success Response (201):**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  },
  "message": "Registration successful. Please check your email for verification."
}
```

**Error Responses:**
- `400 Bad Request`:
  ```json
  {
    "error": "Email already registered"
  }
  ```
- `400 Bad Request`:
  ```json
  {
    "error": "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  }
  ```
- `500 Internal Server Error`:
  ```json
  {
    "error": "Registration failed. Please try again later."
  }
  ```

### 2. User Login
Authenticate a user and create a session.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  }
}
```

**Error Responses:**
- `400 Bad Request`:
  ```json
  {
    "error": "Invalid email or password format"
  }
  ```
- `401 Unauthorized`:
  ```json
  {
    "error": "Invalid credentials"
  }
  ```
- `403 Forbidden`:
  ```json
  {
    "error": "Please verify your email before logging in"
  }
  ```
- `429 Too Many Requests`:
  ```json
  {
    "error": "Too many login attempts. Please try again later."
  }
  ```

### 3. Email Verification
Verify a user's email address.

**Endpoint:** `GET /api/auth/verify-email`

**Query Parameters:**
- `token`: Verification token string

**Success Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

**Error Responses:**
- `400 Bad Request`:
  ```json
  {
    "error": "Invalid verification token"
  }
  ```
- `400 Bad Request`:
  ```json
  {
    "error": "Token has expired. Please request a new verification email."
  }
  ```
- `500 Internal Server Error`:
  ```json
  {
    "error": "Email verification failed. Please try again later."
  }
  ```

### 4. Password Reset Request
Request a password reset token.

**Endpoint:** `POST /api/auth/password-reset/request`

**Request Body:**
```json
{
  "email": "string"
}
```

**Success Response (200):**
```json
{
  "message": "If an account exists with this email, a password reset link will be sent."
}
```

**Error Responses:**
- `400 Bad Request`:
  ```json
  {
    "error": "Invalid email format"
  }
  ```
- `400 Bad Request`:
  ```json
  {
    "error": "Please verify your email before requesting a password reset."
  }
  ```
- `429 Too Many Requests`:
  ```json
  {
    "error": "Please wait 15 minutes before requesting another reset."
  }
  ```

### 5. Password Reset
Reset a user's password using a valid token.

**Endpoint:** `POST /api/auth/password-reset/reset`

**Request Body:**
```json
{
  "token": "string",
  "password": "string"
}
```

**Success Response (200):**
```json
{
  "message": "Password has been reset successfully"
}
```

**Error Responses:**
- `400 Bad Request`:
  ```json
  {
    "error": "Invalid or expired token"
  }
  ```
- `400 Bad Request`:
  ```json
  {
    "error": "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  }
  ```
- `500 Internal Server Error`:
  ```json
  {
    "error": "Password reset failed. Please try again later."
  }
  ```

## Rate Limiting

### Login Endpoint
- 5 attempts per IP address per 15 minutes
- Lockout period: 15 minutes
- Reset after lockout period expires

### Password Reset Request
- 3 requests per email address per hour
- Lockout period: 1 hour
- Reset after lockout period expires

## Security Considerations

### Password Requirements
- Minimum length: 8 characters
- Must contain:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

### Token Expiration
- Email verification tokens: 24 hours
- Password reset tokens: 1 hour
- Tokens are single-use only

### Session Management
- Session duration: 7 days
- Sessions invalidated on password change
- Maximum 5 concurrent sessions per user

## Error Handling

### Common Error Codes
- `400`: Invalid request (validation errors)
- `401`: Authentication required
- `403`: Permission denied
- `404`: Resource not found
- `429`: Rate limit exceeded
- `500`: Server error

### Error Response Format
```json
{
  "error": "string",
  "details": "string" (optional)
}
```

## Testing

### Test Credentials
```json
{
  "email": "test@example.com",
  "password": "TestPass123"
}
```

### Test Tokens
- Verification: `test-verification-token`
- Password Reset: `test-reset-token`

## Implementation Examples

### Registration Request
```typescript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'SecurePass123',
  }),
});

const data = await response.json();
```

### Login Request
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePass123',
  }),
});

const data = await response.json();
