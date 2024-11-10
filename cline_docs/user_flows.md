# User Flows Documentation

## Authentication Flows

### Registration Flow
1. User submits registration form
   - Validates name, email, and password
   - Checks password requirements
   - Verifies email uniqueness

2. System creates user account
   - Hashes password securely
   - Creates unverified user record
   - Generates verification token
   - Sets 24-hour token expiration

3. Verification process
   - Generates secure verification URL
   - Displays URL in development mode
   - Stores token in verification_tokens table

4. Email verification
   - User clicks verification link
   - System validates token
   - Updates user email_verified status
   - Deletes used token
   - Redirects to login

5. Error handling
   - Invalid token errors
   - Expired token cleanup
   - Duplicate email prevention
   - Rate limiting
   - SQL injection prevention

### Login Flow
1. User submits login form
   - Email validation
   - Password validation
   - Rate limiting check

2. System authentication
   - Verifies email exists
   - Checks email verification status
   - Validates password hash
   - Handles error messages

3. Session management
   - Creates JWT token
   - Sets session cookie
   - Configures session expiry
   - Handles callback URLs

4. Error scenarios
   - Invalid credentials
   - Unverified email
   - Rate limit exceeded
   - Server errors

### Password Reset Flow
1. User requests reset
   - Email validation
   - Rate limiting
   - Token generation

2. Reset process
   - Creates reset token
   - Sets expiration time
   - Stores token securely
   - Sends reset URL

3. Password update
   - Validates token
   - Updates password
   - Invalidates token
   - Confirms success

4. Security measures
   - One-time tokens
   - Expiration handling
   - Rate limiting
   - Secure password update

## Security Measures

### Token Security
1. Generation
   - Cryptographically secure
   - Sufficient length (256 bits)
   - Random distribution
   - URL-safe encoding

2. Storage
   - Secure database storage
   - Encrypted at rest
   - Limited lifetime
   - Automatic cleanup

3. Validation
   - Expiration checking
   - One-time use
   - User association
   - SQL injection prevention

### Rate Limiting
1. Implementation
   - Per-user tracking
   - Time window based
   - IP-based limiting
   - Automatic reset

2. Thresholds
   - Login attempts: 5 per 15 minutes
   - Password reset: 3 per hour
   - Email verification: 3 per day
   - Registration: 3 per hour

### Error Handling
1. User feedback
   - Clear error messages
   - Security-conscious responses
   - Validation feedback
   - Success confirmations

2. System logging
   - Error tracking
   - Security events
   - Rate limit hits
   - Token usage

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email_verified TIMESTAMP,
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Verification Tokens
```sql
CREATE TABLE verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier UUID NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires TIMESTAMP NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (identifier) REFERENCES users(id) ON DELETE CASCADE
);
```

### Password Reset Tokens
```sql
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires TIMESTAMP NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Testing Scenarios

### Registration Tests
1. Successful registration
2. Duplicate email handling
3. Password validation
4. Token generation
5. Error responses

### Verification Tests
1. Valid token verification
2. Expired token handling
3. Invalid token response
4. Already verified users
5. Missing token handling

### Login Tests
1. Successful login
2. Invalid credentials
3. Unverified email
4. Rate limiting
5. Session management

### Security Tests
1. Token security
2. SQL injection prevention
3. Rate limit effectiveness
4. Password hashing
5. Session security
