# Development Setup Guide

## Prerequisites

- Node.js v20.16.0 or higher
- Git
- VSCode or preferred IDE
- Neon PostgreSQL account

## Initial Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd systimz
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env.local` file:
```env
# Authentication
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@hostname/database?sslmode=require
PGHOST=hostname
PGUSER=username
PGPASSWORD=password
PGDATABASE=database
PGPORT=5432

# HeyGen API
HEYGEN_API_KEY=your-api-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Database Setup**
```bash
# Apply database schema
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f schema.sql
```

## Development Workflow

### Starting the Development Server
```bash
npm run dev
```

### Code Quality
```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Formatting
npm run format
```

### Testing
```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Check test coverage
npm run test:coverage
```

## Project Structure

```
├── src/
│   ├── app/             # Next.js app directory
│   ├── components/      # React components
│   ├── lib/            # Utility libraries
│   ├── services/       # Business logic
│   ├── store/          # State management
│   └── types/          # TypeScript types
├── public/             # Static assets
├── schema.sql          # Database schema
└── tests/             # Test files
```

## Database Management

### Connecting to Database
```bash
psql -h $PGHOST -U $PGUSER -d $PGDATABASE
```

### Common Database Operations
```sql
-- List tables
\dt

-- Describe table
\d table_name

-- Run query
SELECT * FROM users;
```

### Schema Updates
1. Update schema.sql file
2. Apply changes:
```bash
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f schema.sql
```

## Troubleshooting

### Database Connection Issues
- Verify environment variables
- Check SSL/TLS settings
- Confirm firewall rules
- Test connection string

### Development Server Issues
- Clear .next directory
- Remove node_modules and reinstall
- Check port availability
- Verify environment variables

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [@vercel/postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Neon Documentation](https://neon.tech/docs)

## Getting Help

- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)
- [TypeScript Discord](https://discord.com/invite/typescript)
- [Neon Support](https://neon.tech/docs/introduction/support)

## Best Practices

1. **Code Quality**
   - Follow ESLint rules
   - Write comprehensive tests
   - Document complex logic
   - Use TypeScript strictly

2. **Database**
   - Use parameterized queries
   - Handle connection errors
   - Keep transactions short
   - Monitor query performance

3. **Security**
   - Never commit secrets
   - Validate all inputs
   - Use HTTPS in production
   - Keep dependencies updated

4. **Performance**
   - Optimize database queries
   - Use connection pooling
   - Implement caching
   - Monitor memory usage
