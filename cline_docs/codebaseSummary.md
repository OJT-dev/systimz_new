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
├── prisma/             # Database schema and migrations
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
  - User registration
  - Login/logout
  - Email verification
  - Password reset

### API Routes
- `src/app/api/`
  - Avatar management
  - Message handling
  - WebSocket connections
  - HeyGen integration

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

### Core Models
```prisma
// User model
model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified DateTime?
  avatars       Avatar[]
  messages      Message[]
}

// Avatar model
model Avatar {
  id          String    @id @default(cuid())
  name        String
  description String?
  userId      String
  user        User      @relation(fields: [userId], references: [id])
}

// Message model
model Message {
  id        String   @id @default(cuid())
  content   String
  type      String
  userId    String
  metadata  String?
  user      User     @relation(fields: [userId], references: [id])
}
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
- Database operations

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

### Integration Guides
- HeyGen setup
- WebSocket implementation
- Authentication flow
- Database setup

### Development Guides
- Local setup
- Testing procedures
- Deployment process
- Best practices

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
- Authentication
- Profile management
- Avatar ownership
- Access control

## Performance Considerations

### Optimization
- Code splitting
- Lazy loading
- Image optimization
- Cache management

### Security
- Input validation
- XSS prevention
- CSRF protection
- Rate limiting

### Error Handling
- Graceful degradation
- User feedback
- Error logging
- Recovery procedures

## Future Improvements

### Technical Debt
- Type safety enhancements
- Test coverage expansion
- Documentation updates
- Performance optimization

### Planned Features
- Advanced avatar controls
- Enhanced chat capabilities
- Improved analytics
- Extended API functionality

### Infrastructure
- Scaling considerations
- Monitoring improvements
- Backup solutions
- Security enhancements
