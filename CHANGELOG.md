# Changelog

All notable changes to Atlantic Weizard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with React + Express + PostgreSQL
- Guest checkout functionality
- Multi-currency support (INR/USD)
- PayU payment gateway integration
- Admin panel with authentication
- Product management (CRUD)
- Order management
- Transaction tracking
- Dashboard with analytics
- Responsive design with Tailwind CSS
- Type-safe development with TypeScript
- Database schema with Drizzle ORM
- Session-based authentication
- Shopping cart with localStorage persistence
- Environment configuration template (.env.example)
- Admin user seeding script
- Comprehensive documentation (README, CONTRIBUTING, SECURITY)
- Quick start guide
- PostgreSQL session storage for persistence
- Security improvements (sameSite cookies, SESSION_SECRET validation)

### Changed
- Updated .gitignore to exclude .env and sensitive files
- Improved session storage from in-memory to PostgreSQL
- Enhanced cookie security with sameSite attribute

### Fixed
- Session persistence issue (now uses PostgreSQL store)
- Missing environment variable validation
- Exposed credentials in .replit file

### Security
- Added SESSION_SECRET validation
- Implemented PostgreSQL session storage
- Added sameSite cookie attribute for CSRF protection
- Password hashing with bcrypt (10 rounds)
- PayU hash verification for payment security

## [1.0.0] - 2025-12-03

### Initial Release

First stable release of Atlantic Weizard e-commerce platform.

**Features:**
- Full-stack e-commerce solution
- Guest checkout (no account required)
- Secure payment processing with PayU
- Multi-currency support
- Admin panel for management
- Responsive, modern UI
- Type-safe codebase

---

## Version History

### Versioning Scheme

- **Major** (X.0.0): Breaking changes, major features
- **Minor** (1.X.0): New features, backwards compatible
- **Patch** (1.0.X): Bug fixes, minor improvements

### Release Notes Format

Each release includes:
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security improvements

---

**Note:** This changelog will be updated with each release.
