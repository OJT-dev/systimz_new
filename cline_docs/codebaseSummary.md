# Codebase Summary

## Project Structure

### Core Directories
```
systimz_new/
├── src/
│   ├── app/             # Next.js app router pages
│   ├── components/      # React components
│   ├── lib/            # Core utilities
│   ├── services/       # External service integrations
│   ├── store/          # Redux store
│   ├── types/          # TypeScript definitions
│   └── utils/          # Helper functions
├── schema.sql          # PostgreSQL database schema
├── public/             # Static assets
└── cline_docs/         # Project documentation
```

## Key Components

### Avatar System
- `src/components/avatar/`
  - StreamingAvatar: HeyGen integration
  - Avatar controls and UI
  - Real-time streaming management
  - Event handling

### Chat Interface
- `src/components/chat/`
  - Message handling
  - Input management
  - Real-time updates
  - WebSocket integration

### Authentication
- `src/app/api/auth/`
  - User registration with PostgreSQL
  - Login/logout
  - Email verification
  - Password reset
  - Edge runtime support

### API Routes
- `src/app/api/`
  - Avatar management
  - Message handling
  - WebSocket connections
  - HeyGen integration
  - PostgreSQL queries

## Core Services

### HeyGen Integration
- `src/services/heygen/`
  - Avatar streaming
  - Token management
  - Session handling
  - Event processing

### WebSocket Service
- `src/services/chat/`
  - Real-time communication
  - Message broadcasting
  - Connection management
  - Error handling

### Authentication Service
- `src/lib/auth.ts`
  - Session management
  - Token validation
  - Permission control
  - Security measures

## State Management

### Redux Store
- `src/store/`
  - User state
  - Avatar state
  - Message state
  - UI state

### Slices
- `src/store/slices/`
  - authSlice: Authentication state
  - avatarSlice: Avatar management
  - messageSlice: Chat messages
  - uiSlice: Interface state

## Database Schema

### Core Tables
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email_verified TIMESTAMP,
    image VARCHAR(255),
    role VARCHAR(50) DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Avatars table
CREATE TABLE avatars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'user',
    user_id UUID NOT NULL,
    metadata TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Testing Structure

### Unit Tests
- Component tests
- Service tests
- Utility tests
- Redux tests

### Integration Tests
- API route tests
- Authentication flow
- WebSocket communication
- PostgreSQL operations

### End-to-End Tests
- User flows
- Avatar interactions
- Chat functionality
- Error scenarios

## Documentation

### API Documentation
- Authentication endpoints
- Resource endpoints
- WebSocket API
- Error handling
- PostgreSQL queries

### Integration Guides
- HeyGen setup
- WebSocket implementation
- Authentication flow
- PostgreSQL setup

### Development Guides
- Local setup
- Testing procedures
- Deployment process
- Best practices
- Database migrations

## Key Features

### Avatar Management
- Creation and customization
- Real-time streaming
- Voice synthesis
- Event handling

### Chat System
- Real-time messaging
- Message persistence
- User interactions
- Error handling

### User System
- Edge-compatible authentication
- Profile management
- Avatar ownership
- Access control

## Performance Considerations

### Optimization
- Code splitting
- Lazy loading
- Image optimization
- Connection pooling
- Edge runtime optimization

### Security
- Input validation
- XSS prevention
- CSRF protection
- Rate limiting
- SQL injection prevention

### Error Handling
- Graceful degradation
- User feedback
- Error logging
- Recovery procedures
- Database error handling

## Future Improvements

### Technical Debt
- Type safety enhancements
- Test coverage expansion
- Documentation updates
- Performance optimization
- Query optimization

### Planned Features
- Advanced avatar controls
- Enhanced chat capabilities
- Improved analytics
- Extended API functionality
- Full-text search

### Infrastructure
- Scaling considerations
- Monitoring improvements
- Backup solutions
- Security enhancements
- High availability setup
