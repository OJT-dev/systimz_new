# Replit Dependency Management Guide

## Overview
Replit provides an integrated dependency management system through its GUI interface, supporting multiple programming languages and system-level dependencies.

## Package Management Interface

### Location
- Access through the "Dependencies" tab in the sidebar
- Two main sections:
  1. Imports: Language-specific package management
  2. System (Advanced): System-level dependencies

## Node.js Dependencies

### Package Manager
- Supports multiple package managers:
  - npm
  - yarn
  - pnpm
  - bun

### Features
- Visual package management interface
- Version display for installed packages
- Package search functionality
- One-click installation/removal
- Automatic package.json updates

### Usage
1. Open Dependencies tab
2. Select Node.js packager
3. Click "+ Add new package"
4. Search for desired package
5. Click "Install" to add package

## Python Dependencies

### Package Manager
- Supports:
  - poetry
  - pip

### Features
- Package version management
- Direct installation interface
- Requirements file management
- Dependency resolution

### Usage
1. Open Dependencies tab
2. Select Python packager
3. Click "+ Add new package"
4. Search for desired package
5. Click "Install" to add package

## System Dependencies

### Features
- Advanced system-level package management
- Nix package integration
- Version control for system packages
- Automatic dependency resolution

### Nix Configuration
The project uses a specific Nix configuration in `replit.nix` to ensure consistent environments:

```nix
{ pkgs }:
pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs-20    # Node.js v20.16.0 for application runtime
    pkgs.postgresql_15  # PostgreSQL 15 for database
  ];
}
```

This configuration:
- Uses `mkShell` for proper environment isolation
- Specifies exact versions of required dependencies
- Ensures consistent development environments

### Management
- Access through "System (Advanced)" tab
- Add/remove system packages
- View installed packages and versions
- Manage system configurations

## Best Practices

### Package Management
1. Use the GUI interface for package management when possible
2. Keep dependencies up to date
3. Remove unused packages
4. Monitor package versions
5. Review dependency changes before deployment

### Version Control
1. Commit package manifests (package.json, requirements.txt)
2. Track lock files for deterministic builds
3. Document major dependency changes
4. Review dependency updates regularly

### Security
1. Regular security audits of dependencies
2. Update packages with known vulnerabilities
3. Use trusted package sources
4. Monitor dependency licenses

## Troubleshooting

### Common Issues
1. Package installation failures
   - Check package compatibility
   - Verify package name and version
   - Review error messages

2. Version conflicts
   - Review dependency tree
   - Update conflicting packages
   - Check compatibility requirements

3. System package issues
   - Verify system requirements
   - Check package availability
   - Review system logs

### Nix Environment Issues
1. Environment compilation failures
   - Verify replit.nix syntax
   - Check package names and versions
   - Use mkShell for proper environment setup
   - Review Nix channel compatibility

### Resolution Steps
1. Clear package cache if needed
2. Reinstall problematic packages
3. Update package manager
4. Check for system updates
5. Review documentation for specific errors

## Documentation
- Keep dependency documentation updated
- Document specific version requirements
- Note any special configuration needs
- Track breaking changes
