# Contributing to Atlantic Weizard

Thank you for your interest in contributing to Atlantic Weizard! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors. We expect everyone to:

- Be respectful and considerate
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL 16.x or higher
- Git
- A code editor (VS Code recommended)

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/AtlanticWeizard.git
   cd AtlanticWeizard
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/AtlanticWeizard.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

6. **Set up database**
   ```bash
   npm run db:push
   npm run seed:admin
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Creating a Feature Branch

Always create a new branch for your work:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### Keeping Your Fork Updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types when possible
- Use proper type annotations

### Code Style

We follow these conventions:

**Naming:**
- `camelCase` for variables and functions
- `PascalCase` for components and classes
- `kebab-case` for file names
- `UPPER_SNAKE_CASE` for constants

**Formatting:**
- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Trailing commas in objects/arrays

**React Components:**
```typescript
// Good
export function ProductCard({ product }: ProductCardProps) {
  const { formatPrice } = useCurrency();
  
  return (
    <Card>
      {/* Component content */}
    </Card>
  );
}

// Avoid
export default ({ product }) => {
  // Component content
}
```

**API Routes:**
```typescript
// Good
app.get("/api/products", async (req, res) => {
  try {
    const products = await storage.getProducts();
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Avoid - missing error handling
app.get("/api/products", async (req, res) => {
  const products = await storage.getProducts();
  res.json(products);
});
```

### File Organization

- Keep files focused and under 500 lines
- Group related functionality
- Use index files for clean imports
- Separate concerns (UI, logic, data)

### Comments

- Write self-documenting code
- Add comments for complex logic
- Document public APIs
- Explain "why", not "what"

```typescript
// Good
// Using GREATEST to prevent negative stock in race conditions
stock: sql`GREATEST(0, stock - ${item.quantity})`

// Avoid
// Subtract quantity from stock
stock: product.stock - item.quantity
```

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**
```bash
feat(checkout): add multi-step checkout wizard

- Implemented 4-step checkout flow
- Added form validation with Zod
- Integrated with PayU payment gateway

Closes #123

fix(cart): prevent negative quantities

- Added validation to prevent negative quantities
- Fixed edge case when removing items
- Updated tests

Fixes #456
```

### Commit Best Practices

- Keep commits atomic (one logical change)
- Write clear, descriptive messages
- Reference issues when applicable
- Don't commit commented-out code
- Don't commit console.logs

## Pull Request Process

### Before Submitting

1. **Update your branch**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests** (when implemented)
   ```bash
   npm test
   ```

3. **Check TypeScript**
   ```bash
   npm run check
   ```

4. **Test manually**
   - Test your changes thoroughly
   - Check responsive design
   - Test in different browsers

### Submitting a Pull Request

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request** on GitHub

3. **Fill out the PR template**
   - Describe what changed
   - Why the change was needed
   - How to test it
   - Screenshots (if UI changes)
   - Related issues

4. **Wait for review**
   - Address feedback promptly
   - Make requested changes
   - Keep discussion professional

### PR Title Format

```
<type>: <description>
```

Examples:
- `feat: Add product search functionality`
- `fix: Resolve stock deduction race condition`
- `docs: Update installation instructions`

## Testing

### Writing Tests

When adding new features, include tests:

```typescript
// Example unit test
describe('PayU Integration', () => {
  it('should generate valid hash', () => {
    const params = {
      txnid: 'TEST123',
      amount: '100.00',
      // ...
    };
    
    const hash = generatePayuHash(params);
    expect(hash).toBeDefined();
    expect(hash.length).toBe(128);
  });
});
```

### Test Coverage

- Aim for 80%+ coverage on new code
- Test edge cases
- Test error conditions
- Test user interactions

## Areas for Contribution

We welcome contributions in these areas:

### High Priority
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Implement rate limiting
- [ ] Add email notifications
- [ ] Implement product search
- [ ] Add pagination

### Medium Priority
- [ ] Add image upload functionality
- [ ] Implement order tracking
- [ ] Add customer accounts
- [ ] Improve admin dashboard analytics
- [ ] Add export functionality (CSV, PDF)

### Low Priority
- [ ] Add dark mode toggle
- [ ] Implement wishlist
- [ ] Add product reviews
- [ ] Multi-language support
- [ ] Advanced filtering

## Questions?

If you have questions:

1. Check existing issues
2. Read the documentation
3. Ask in discussions
4. Create a new issue

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to Atlantic Weizard! 🌊
