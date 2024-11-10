# Replit Dependency Management Guide

## Package Management

### 1. Nix Packages
Configure in `replit.nix`:
```nix
{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
  ];
}
```

### 2. Replit Configuration
Configure in `.replit`:
```toml
run = "npm run start"
hidden = [".build", ".config"]

[env]
DATABASE_URL = "postgresql://username:password@hostname/database?sslmode=require"

[deployment]
run = ["sh", "-c", "npm run start"]
deploymentTarget = "cloudrun"

[[ports]]
localPort = 3000
externalPort = 80

[[ports]]
localPort = 3001
externalPort = 3001
```

## Version Management

### 1. Node.js
- Currently using Node.js v20.16.0
- npm v10.8.1
- Use package-lock.json
- Regular security audits

## Troubleshooting

### 1. Nix Environment Issues
If encountering Nix channel or environment issues:
```bash
# Reset Nix environment
rm -rf ~/.nix-*
nix-channel --update
```

### 2. Dependency Issues
- Keep configuration minimal
- Use stable package versions
- Avoid version-specific channels
- Reset environment if needed

## Best Practices

### 1. Configuration
- Keep Nix configuration minimal
- Avoid specifying unstable channels
- Use proven package versions
- Test configuration changes

### 2. Environment
- Regular environment updates
- Clean environment when needed
- Monitor package versions
- Document working configurations

### 3. Security
- Regular security audits
- Keep dependencies updated
- Monitor advisories
- Follow best practices

## Support Resources

### 1. Documentation
- [Replit Docs](https://docs.replit.com)
- [Node.js Docs](https://nodejs.org/docs)
- [Nix Package Search](https://search.nixos.org/packages)

### 2. Support Channels
- Replit Support
- Community forums
- Stack Overflow
- GitHub issues
