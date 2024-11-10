# Production Deployment Guide

## Replit Deployment

### Prerequisites
1. GitHub repository with your project
2. Replit account
3. PostgreSQL database (provided by Replit)
4. Environment variables ready

### Environment Setup

#### 1. Environment Variables
Set up these environment variables in Replit Secrets (Tools > Secrets):
```
NEXTAUTH_SECRET=systimz_production_secret_key_123
NEXTAUTH_URL=https://systimznew.fooh.repl.co
DATABASE_URL=postgresql://neondb_owner:D0aCKpUjrFf1@ep-divine-bush-a49hwonr.us-east-1.aws.neon.tech/neondb?sslmode=require
HEYGEN_API_KEY=MjYwZjg0OTFiMzQ5NGZiOTgwZTdhZDY0Njc3NTNjMGQtMTczMDg2Mzk1MQ==
NEXT_PUBLIC_APP_URL=https://systimznew.fooh.repl.co
```

#### 2. PostgreSQL Setup
1. Enable PostgreSQL:
   - Click on "Tools" in Replit
   - Select "PostgreSQL"
   - Click "Enable PostgreSQL"
   - Wait for initialization

2. Database Migration:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

### Deployment Process

#### 1. Import Repository
1. Go to Replit dashboard
2. Click "Create Repl"
3. Choose "Import from GitHub"
4. Enter repository URL
5. Select "Node.js" as language

#### 2. Configuration Files

##### .replit
```toml
modules = ["nodejs-20", "web"]

[nix]
channel = "stable-24_05"

# Development configuration
run = """
npm install
npx prisma generate
npm run dev
"""

# Build configuration
[deployment]
build = [
  "npm install",
  "npx prisma generate",
  "npm run build"
]
run = ["npm", "start"]
deploymentTarget = "cloudrun"

# Port configuration
[[ports]]
localPort = 3000
externalPort = 80
```

##### Server Configuration (server.ts)
```typescript
const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
```

#### 3. Build and Start
1. Initial setup runs automatically:
   - Dependencies installation
   - Prisma client generation
   - Database migrations
   - Application build

2. Server starts automatically:
   - Next.js server
   - WebSocket server
   - Database connections

### Monitoring and Maintenance

#### 1. Logs and Monitoring
- Check Replit console for server logs
- Monitor WebSocket connections
- Track database performance
- Watch error reports

#### 2. Updates and Maintenance
- Push updates to GitHub
- Replit automatically pulls changes
- Run migrations when schema changes
- Monitor resource usage

#### 3. Troubleshooting
Common issues and solutions:

1. Database Connection Issues
   - Verify DATABASE_URL in Secrets
   - Check PostgreSQL status
   - Run `prisma generate`

2. WebSocket Connection Issues
   - Check port configuration
   - Verify WebSocket server status
   - Monitor connection logs

3. Build Issues
   - Clear .next directory
   - Rebuild node_modules
   - Check build logs

### Security Considerations

#### 1. Environment Variables
- Keep secrets in Replit Secrets
- Never commit sensitive data
- Rotate secrets periodically

#### 2. Database Security
- Use SSL connection
- Implement proper access controls
- Regular backups

#### 3. API Security
- Rate limiting
- CORS configuration
- Input validation

### Performance Optimization

#### 1. Build Optimization
- Enable output compression
- Optimize images
- Minimize bundle size

#### 2. Runtime Optimization
- Configure caching
- Optimize database queries
- Monitor memory usage

#### 3. Network Optimization
- CDN configuration
- API response optimization
- WebSocket efficiency

### Backup and Recovery

#### 1. Database Backups
- Regular automated backups
- Backup before migrations
- Test restore procedures

#### 2. Configuration Backups
- Version control for configs
- Document all changes
- Maintain recovery docs

#### 3. Recovery Procedures
1. Stop services
2. Restore backups
3. Verify data
4. Restart services
5. Confirm functionality

### Support and Resources

#### 1. Documentation
- API documentation
- Database schema
- Configuration guide
- Troubleshooting guide

#### 2. Support Channels
- Replit support
- GitHub issues
- Technical team contacts
- Emergency procedures

#### 3. Monitoring Tools
- Error tracking
- Performance metrics
- Usage statistics
- Alert systems
