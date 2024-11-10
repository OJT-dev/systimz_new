# Nix and UPM Reference Guide

This document serves as a reference for Nix and UPM (Universal Package Manager). It includes key details from the official documentation and repositories.

---

## Nix

### Official Documentation

- [Nix Manual (Version 2.18)](https://nix.dev/manual/nix/2.18/)
- [Nix GitHub Repository](https://github.com/NixOS/nix)

### Key Details

**Nix** is a powerful package manager for Linux and other Unix systems that makes package management reliable and reproducible.

- **Declarative Package Management**: Nix allows you to declare your system configuration and dependencies in code, ensuring consistency across environments.
- **Reproducible Builds**: By isolating package dependencies, Nix ensures that builds are reproducible.
- **Isolation**: Installed packages do not interfere with each other, avoiding "dependency hell".
- **Atomic Upgrades and Rollbacks**: Nix can safely perform upgrades and rollbacks without affecting the system's state.

### Installation

To install Nix, run the following command in your terminal:

```bash
curl -L https://nixos.org/nix/install | sh
```

### Basic Usage

- **Install a Package**:

  ```bash
  nix-env -iA nixpkgs.<package-name>
  ```

- **Search for Packages**:

  ```bash
  nix-env -qaP | grep <search-term>
  ```

- **Upgrade Packages**:

  ```bash
  nix-env -u '*'
  ```

- **List Installed Packages**:

  ```bash
  nix-env -q
  ```

- **Remove a Package**:

  ```bash
  nix-env -e <package-name>
  ```

- **Rollback to Previous Generation**:

  ```bash
  nix-env --rollback
  ```

### Learning Resources

- **Nix Pills**: A series of articles to get familiar with Nix internals.
- **Nix by Example**: Practical examples to learn Nix.

---

## UPM (Universal Package Manager)

### Official Resources

- [Replit's Blog Post on UPM](https://blog.replit.com/packager)
- [UPM GitHub Repository](https://github.com/replit/upm)

### Key Details

**UPM** is Replit's Universal Package Manager designed to manage dependencies across multiple languages and platforms within the Replit environment.

- **Multi-Language Support**: Manage packages for various languages like Node.js, Python, Ruby, and more.
- **Simplified Dependency Management**: Handle all dependencies with consistent commands.
- **Integration with Replit**: UPM is integrated into Replit, making it easy to manage packages in your projects.

### Basic Usage

- **Install Dependencies**:

  ```bash
  upm install
  ```

- **Add a Dependency**:

  ```bash
  upm add <dependency-name>
  ```

- **Remove a Dependency**:

  ```bash
  upm remove <dependency-name>
  ```

- **List Dependencies**:

  ```bash
  upm list
  ```

### Configuration

UPM uses a configuration file named `replit.nix` for Nix-based projects or language-specific files like `package.json` for Node.js projects.

### Example `replit.nix` File

```nix
{ pkgs }:
pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs
    pkgs.python39
  ];
}
```