# Systimz: AI Avatar Platform

## Overview
Systimz is a powerful platform that enables businesses and individuals to create and deploy interactive AI avatars powered by custom knowledge bases. Using HeyGen's streaming technology, our platform provides real-time, engaging interactions through lifelike digital representatives.

## Features
- 🤖 Interactive AI Avatars
- 🗣️ Real-time Voice Interaction
- 📚 Custom Knowledge Bases
- 🔄 Real-time Updates
- 🌐 Multi-language Support
- 📊 Analytics & Insights

## Quick Start

### Prerequisites
- Node.js 18+
- npm/yarn
- HeyGen API Key
- Database (MySQL/PostgreSQL)

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/systimz.git
cd systimz

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Environment Variables
```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Database
DATABASE_URL=your-database-url

# HeyGen
HEYGEN_API_KEY=your-api-key
```

## Documentation

### Core Documentation
- [Project Overview](cline_docs/project_overview.md)
- [Project Roadmap](cline_docs/projectRoadmap.md)
- [Tech Stack](cline_docs/techStack.md)
- [Codebase Summary](cline_docs/codebaseSummary.md)

### Setup & Deployment
- [Development Guide](cline_docs/setup/development.md)
- [Production Guide](cline_docs/setup/production.md)
- [Deployment Checklist](cline_docs/deployment_checklist.md)
- [Replit Deployment](cline_docs/setup/replit-deployment.md)
- [GitHub-Replit Integration](cline_docs/setup/github-replit-integration.md)

### API Documentation
- [Authentication API](cline_docs/api/authentication.md)
- [Resources API](cline_docs/api/resources.md)
- [WebSocket API](cline_docs/api/websocket.md)
- [OpenAPI Spec](openapi.yaml)

### Testing
- [Setup Guide](cline_docs/testing/setup.md)
- [Component Testing](cline_docs/testing/component-testing.md)
- [API Testing](cline_docs/testing/api-testing.md)

### Integrations
- [HeyGen Integration](cline_docs/integrations/heygen.md)

## Development

### Directory Structure
```
systimz/
├── src/               # Source code
│   ├── app/          # Next.js pages
│   ├── components/   # React components
│   ├── lib/          # Core utilities
│   ├── services/     # External services
│   └── store/        # Redux store
├── prisma/           # Database schema
├── public/           # Static assets
└── cline_docs/       # Documentation
```

### Available Scripts
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server

# Testing
npm test            # Run tests
npm run test:watch  # Watch mode
npm run test:coverage # Coverage report

# Code Quality
npm run lint        # Run ESLint
npm run format      # Format code
```

## Testing
```bash
# Run all tests
npm test

# Run specific test file
npm test path/to/test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Deployment

### Replit Deployment
1. Import project to Replit
2. Configure environment variables in Replit Secrets
3. Let Replit handle build and deployment
4. Access your app at `https://your-repl-name.repl.co`

For detailed Replit deployment instructions, see:
- [Replit Deployment Guide](cline_docs/setup/replit-deployment.md)
- [GitHub-Replit Integration](cline_docs/setup/github-replit-integration.md)

### Production Build
```bash
# Build application
npm run build

# Start production server
npm start
```

### Deployment Checklist
1. Update environment variables
2. Run database migrations
3. Build application
4. Run tests
5. Deploy
6. Verify deployment

## Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support
- Documentation: [Project Docs](cline_docs/)
- Issues: [GitHub Issues](https://github.com/yourusername/systimz/issues)
- Email: support@systimz.com

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
