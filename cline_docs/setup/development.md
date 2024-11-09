# Development Environment Setup

## Prerequisites

### Required Software
1. **Node.js and npm**
   - Node.js version 18.0.0 or higher
   - npm version 8.0.0 or higher
   ```bash
   # Check versions
   node --version
   npm --version
   ```

2. **Git**
   - Latest version recommended
   ```bash
   # Check version
   git --version
   ```

3. **Visual Studio Code**
   - Latest version recommended
   - Required extensions:
     - ESLint
     - Prettier
     - TypeScript and JavaScript Language Features
     - Prisma
     - Jest Runner

### System Requirements
- Operating System: Windows 10/11, macOS 10.15+, or Linux
- Memory: 8GB RAM minimum, 16GB recommended
- Storage: 1GB free space minimum
- Internet connection for package installation and API development

## Installation Steps

1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/systimz.git
cd systimz
```

2. **Install Dependencies**
```bash
npm install
```

3. **Set Up Environment Variables**
```bash
# Copy example environment file
cp .env.example .env.local

# Edit .env.local with your values
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
```

4. **Initialize Database**
```bash
# Generate Prisma client
npx prisma generate

# Create database and run migrations
npx prisma db push

# (Optional) Seed database with test data
npx prisma db seed
```

5. **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Configuration

### ESLint Configuration
```javascript
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### TypeScript Configuration
```javascript
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Prisma Configuration
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

## Local Development

### Development Workflow
1. Create a new branch for your feature/fix
```bash
git checkout -b feature/your-feature-name
```

2. Start development server
```bash
npm run dev
```

3. Run tests while developing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

4. Check linting and formatting
```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format
```

### Common Development Tasks

1. **Creating New Components**
```bash
# Create component directory
mkdir -p src/components/your-component

# Create component files
touch src/components/your-component/YourComponent.tsx
touch src/components/your-component/YourComponent.test.tsx
```

2. **Adding API Routes**
```bash
# Create API route directory
mkdir -p src/app/api/your-route

# Create route files
touch src/app/api/your-route/route.ts
touch src/app/api/your-route/route.test.ts
```

3. **Database Schema Changes**
```bash
# Edit schema.prisma file
# Then run:
npx prisma db push
npx prisma generate
```

### Debugging

1. **Client-Side Debugging**
- Use Chrome DevTools (F12)
- Use React DevTools extension
- Use Redux DevTools extension

2. **Server-Side Debugging**
```bash
# Start server in debug mode
NODE_OPTIONS='--inspect' npm run dev

# Then open Chrome DevTools and click the Node.js icon
```

3. **Test Debugging**
```bash
# Run tests in debug mode
npm run test:debug

# Add debugger statements in your tests
debugger;
```

## Common Issues and Solutions

1. **Module Not Found Errors**
- Check import paths
- Verify tsconfig.json paths
- Run `npm install` to update dependencies

2. **Database Connection Issues**
- Verify DATABASE_URL in .env.local
- Run `npx prisma db push`
- Check database file permissions

3. **Type Errors**
- Run `npm run build` to check all type errors
- Update @types packages if needed
- Check tsconfig.json settings

## Performance Optimization

1. **Development Build**
```bash
# Analyze bundle size
npm run analyze

# Check performance metrics
npm run lighthouse
```

2. **Code Splitting**
- Use dynamic imports
- Lazy load components
- Optimize images

## Security Considerations

1. **Environment Variables**
- Never commit .env files
- Use strong NEXTAUTH_SECRET
- Rotate secrets regularly

2. **API Routes**
- Implement rate limiting
- Validate input
- Use authentication/authorization

3. **Dependencies**
- Keep dependencies updated
- Run security audits
```bash
npm audit
npm audit fix
```

## Recommended VS Code Settings

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

## Git Hooks

1. **Install husky**
```bash
npx husky-init && npm install
```

2. **Add pre-commit hook**
```bash
npx husky add .husky/pre-commit "npm run lint && npm test"
```

## Continuous Integration

1. **GitHub Actions**
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

## Additional Resources

1. **Documentation**
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

2. **Community**
- [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)
- [Prisma Slack](https://slack.prisma.io/)
- [TypeScript Discord](https://discord.com/invite/typescript)
