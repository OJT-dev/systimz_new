# Production Deployment Guide

## Prerequisites

1. Replit account with deployment access
2. Node.js v20.16.0 or higher
3. Neon PostgreSQL database
4. Environment variables ready

## Environment Variables

Ensure these are set in Replit Secrets:

```bash
# Authentication
NEXTAUTH_SECRET=systimz_production_secret_key_123
NEXTAUTH_URL=https://systimznew.fooh.repl.co

# Database
DATABASE_URL=postgresql://neondb_owner:D0aCKpUjrFf1@ep-divine-bush-a49hwonr.us-east-1.aws.neon.tech/neondb?sslmode=require
PGHOST=ep-divine-bush-a49hwonr.us-east-1.aws.neon.tech
PGUSER=neondb_owner
PGPASSWORD=D0aCKpUjrFf1
PGDATABASE=neondb
PGPORT=5432

# API Keys
HEYGEN_API_KEY=MjYwZjg0OTFiMzQ5NGZiOTgwZTdhZDY0Njc3NTNjMGQtMTczMDg2Mzk1MQ==

# Application
NEXT_PUBLIC_APP_URL=https://systimznew.fooh.repl.co
```

## Deployment Steps

### 1. Database Setup

1. Verify Neon database connection:
   ```bash
   PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "\dt"
   ```

2. Apply database schema:
   ```bash
   PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f schema.sql
   ```

3. Verify schema deployment:
   ```bash
   PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "\d users"
   ```

### 2. Application Deployment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Start the production server:
   ```bash
   npm start
   ```

### 3. Replit Configuration

1. Configure build command in `.replit`:
   ```toml
   run = "npm start"
   
   [nix]
   channel = "stable-24_05"
   
   [deployment]
   run = ["sh", "-c", "npm start"]
   deploymentTarget = "cloudrun"
   
   [[ports]]
   localPort = 3000
   externalPort = 80
   
   [[ports]]
   localPort = 5432
   externalPort = 5432
   ```

2. Configure Nix packages in `replit.nix`:
   ```nix
   { pkgs }: {
     deps = [
       pkgs.postgresql_15
       pkgs.nodejs_20
     ];
     env = {
       DATABASE_URL = "postgresql://username:password@hostname/database?sslmode=require";
     };
   }
   ```

## Post-Deployment Verification

### 1. Database Checks
- Verify database connection
- Check schema version
- Test queries
- Monitor connection pool
- Verify SSL/TLS encryption

### 2. Application Checks
- Test authentication flow
- Verify WebSocket connections
- Check API endpoints
- Test avatar streaming
- Monitor error logs

### 3. Performance Checks
- Response times
- Memory usage
- CPU utilization
- Database query performance
- WebSocket latency

## Monitoring

### Key Metrics
- Server status
- Database connections
- Error rates
- Response times
- Memory usage
- CPU usage
- WebSocket connections
- Active sessions

### Logging
- Application logs
- Database logs
- Error reports
- Access logs
- Performance metrics

## Maintenance

### Regular Tasks
- Monitor error logs
- Check database performance
- Update dependencies
- Backup verification
- Security updates

### Database Maintenance
- Monitor connection pools
- Check query performance
- Verify backups
- Update indexes
- Clean old sessions

## Security

### SSL/TLS
- Verify SSL certificates
- Check SSL configuration
- Monitor SSL expiry
- Test SSL connection

### Authentication
- Monitor auth failures
- Check session management
- Verify token expiry
- Test OAuth providers

### Database
- Check connection encryption
- Monitor access patterns
- Verify backup encryption
- Test restore procedures

## Troubleshooting

### Common Issues
1. Database Connection
   - Check connection string
   - Verify SSL settings
   - Test network connectivity
   - Check credentials

2. Application Errors
   - Check error logs
   - Verify environment variables
   - Test memory usage
   - Monitor WebSocket status

3. Performance Issues
   - Check database queries
   - Monitor memory leaks
   - Verify caching
   - Test connection pools

## Rollback Procedures

1. Database
   - Access Neon console
   - Select backup point
   - Initiate restore
   - Verify data integrity

2. Application
   - Stop current deployment
   - Deploy previous version
   - Verify functionality
   - Monitor performance

## Support Contacts

- Neon Support: support@neon.tech
- Replit Support: https://replit.com/support
- HeyGen Support: [Contact Details]
- Team Lead: [Contact Details]
- DevOps: [Contact Details]
