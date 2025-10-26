# Quickstart Guide: Next.js TypeScript Minimal Lint Project

**Feature**: Next.js TypeScript Project with Minimal Code Style  
**Last Updated**: 2025-10-26  
**Time to Complete**: 5-10 minutes

## Overview

This guide walks you through setting up a new Next.js project with TypeScript, minimal code style enforcement, and automated development workflow. After completion, you'll have a production-ready foundation for building the SEOptimize application.

## Prerequisites

Before starting, ensure you have:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: v2.0.0 or higher
- **Code Editor**: VS Code recommended (with extensions)

### Verify Installation

```bash
node --version  # Should output v18.x.x or higher
npm --version   # Should output v9.x.x or higher
git --version   # Should output v2.x.x or higher
```

### Recommended VS Code Extensions

- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier** (esbenp.prettier-vscode)
- **TypeScript** (built-in, ensure enabled)

## Quick Start (5 minutes)

### Step 1: Clone and Install

```bash
# Clone the repository (if not already cloned)
git clone <repository-url>
cd seoptimize

# Checkout the feature branch
git checkout 002-nextjs-ts-minimal-lint

# Install dependencies
npm install
```

**Expected output**: Dependencies install without errors. Should take 1-2 minutes.

### Step 2: Start Development Server

```bash
npm run dev
```

**Expected output**:

```
▲ Next.js 14.x.x
- Local: http://localhost:3000
- Ready in XXXms
```

### Step 3: View Application

Open browser to: **http://localhost:3000**

**Expected result**: Landing page displays with:

- Header component with site title
- Main content area
- Footer component with copyright and links

### Step 4: Verify Type Safety

```bash
# In a new terminal (keep dev server running)
npm run type-check
```

**Expected output**: No TypeScript errors. Clean compilation.

### Step 5: Verify Code Quality

```bash
npm run lint
```

**Expected output**: No ESLint errors or warnings (or only expected warnings).

## Configuration Verification

### TypeScript Configuration

Check that TypeScript strict mode is enabled:

```bash
cat tsconfig.json | grep strict
```

**Expected output**: `"strict": true`

### ESLint Configuration

Verify minimal style rules:

```bash
cat .eslintrc.json
```

**Should include**:

- `"semi": ["error", "never"]` (no semicolons)
- `"quotes": ["error", "single"]` (single quotes)
- Next.js recommended config

### Prettier Configuration

```bash
cat .prettierrc
```

**Should include**:

- `"semi": false`
- `"singleQuote": true`
- `"printWidth": 100`

## Development Workflow

### Making Code Changes

1. **Create or edit a file**
2. **Save the file** (format-on-save triggers automatically in VS Code)
3. **File is formatted** according to minimal style rules
4. **TypeScript checks** run automatically (if using VS Code)

### Committing Changes

1. **Stage changes**:

   ```bash
   git add <files>
   ```

2. **Attempt commit**:

   ```bash
   git commit -m "feat: add new feature"
   ```

3. **Pre-commit hook runs**:
   - Formats staged files with Prettier
   - Fixes ESLint violations automatically
   - Re-stages fixed files
   - **Aborts commit** with message

4. **Review changes**:

   ```bash
   git diff --staged
   ```

5. **Re-commit** (now passes):
   ```bash
   git commit -m "feat: add new feature"
   ```

**Note**: This workflow ensures you review all auto-fixes before committing.

## Available Commands

### Development

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Create production build
npm run start        # Start production server (after build)
```

### Code Quality

```bash
npm run type-check   # Run TypeScript compiler (no output)
npm run lint         # Run ESLint on all files
npm run lint:fix     # Auto-fix ESLint violations
npm run format       # Format all files with Prettier
npm run format:check # Check formatting without writing
```

### Combined Validation

```bash
npm run validate     # Run type-check + lint + build (CI simulation)
```

## Project Structure Tour

### Key Directories

```
seoptimize/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout (Header, Footer)
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # Reusable components
│   └── ui/                  # UI components
│       ├── button/
│       │   └── index.tsx    # Button component
│       ├── header/
│       │   └── index.tsx    # Header component
│       └── footer/
│           └── index.tsx    # Footer component
├── lib/                     # Utility functions
│   ├── utils/               # Helper utilities
│   └── hooks/               # Custom React hooks
├── types/                   # TypeScript type definitions
│   └── index.ts             # Shared types
└── public/                  # Static assets
```

### Configuration Files

```
seoptimize/
├── tsconfig.json            # TypeScript configuration
├── .eslintrc.json           # ESLint rules
├── .prettierrc              # Prettier formatting
├── .prettierignore          # Prettier ignore patterns
├── next.config.js           # Next.js configuration
├── package.json             # Dependencies and scripts
└── .husky/                  # Git hooks
    └── pre-commit           # Pre-commit validation
```

## Using Path Aliases

Path aliases simplify imports and make code more maintainable.

### Available Aliases

- `@/*` - Project root
- `@components/*` - `components/` directory
- `@lib/*` - `lib/` directory
- `@types/*` - `types/` directory

### Examples

```typescript
// ❌ Without aliases (relative imports)
import { Button } from '../../../components/ui/button'
import { formatDate } from '../../../lib/utils/date'

// ✅ With aliases (clean imports)
import { Button } from '@components/ui/button'
import { formatDate } from '@lib/utils/date'
```

### IDE Support

VS Code automatically:

- Recognizes path aliases from `tsconfig.json`
- Provides autocomplete for aliased imports
- Allows "Go to Definition" navigation

## Example: Creating a New Component

### 1. Create Component Folder

```bash
mkdir -p components/ui/card
```

### 2. Create Component File

```bash
touch components/ui/card/index.tsx
```

### 3. Implement Component

```typescript
// components/ui/card/index.tsx

export interface CardProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function Card({ title, children, className = '' }: CardProps) {
  return (
    <div className={`card ${className}`}>
      <h2>{title}</h2>
      <div className="card-content">
        {children}
      </div>
    </div>
  )
}
```

### 4. Use Component

```typescript
// app/page.tsx
import { Card } from '@components/ui/card'

export default function HomePage() {
  return (
    <Card title="Welcome">
      <p>This is a card component</p>
    </Card>
  )
}
```

### 5. Verify

```bash
npm run type-check  # Should pass
npm run lint        # Should pass
```

## Minimal Code Style Examples

### ✅ Correct Minimal Style

```typescript
// No semicolons
const message = 'Hello'

// Single quotes
const name = 'SEOptimize'

// Concise arrow functions
const double = (x: number) => x * 2

// Object shorthand
const user = { name, age }

// Template literals
const greeting = `Hello, ${name}!`

// Destructuring
const { title, description } = data

// Prefer const
const value = 42

// Early returns
function validate(data: Data) {
  if (!data) return false
  if (!data.name) return false
  return true
}
```

### ❌ Incorrect (Verbose Style)

```typescript
// With semicolons
const message = 'Hello'

// Double quotes
const name = 'SEOptimize'

// Verbose arrow functions
const double = (x: number) => {
  return x * 2
}

// No shorthand
const user = { name: name, age: age }

// String concatenation
const greeting = 'Hello, ' + name + '!'

// No destructuring
const title = data.title
const description = data.description

// Using var
var value = 42

// Nested conditionals
function validate(data: Data) {
  if (data) {
    if (data.name) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}
```

## Troubleshooting

### Development Server Won't Start

**Problem**: Port 3000 already in use

**Solution**:

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### TypeScript Errors After Install

**Problem**: `Cannot find module` errors

**Solution**:

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Restart TypeScript server in VS Code
# Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

### Pre-commit Hook Not Running

**Problem**: Commits succeed without lint checks

**Solution**:

```bash
# Reinstall Husky hooks
npm run prepare

# Verify hook exists
ls -la .husky/pre-commit

# Test hook manually
.husky/pre-commit
```

### ESLint and Prettier Conflicts

**Problem**: ESLint complains about formatting after Prettier runs

**Solution**:

```bash
# Verify eslint-config-prettier is installed
npm list eslint-config-prettier

# Check .eslintrc.json extends array includes "prettier"
cat .eslintrc.json | grep prettier
```

### Path Aliases Not Working

**Problem**: VS Code shows errors for path alias imports

**Solution**:

1. Verify `tsconfig.json` has `paths` configuration
2. Restart TypeScript server: Cmd+Shift+P -> "TypeScript: Restart TS Server"
3. Reload VS Code window: Cmd+Shift+P -> "Developer: Reload Window"

### Format on Save Not Working

**Problem**: Files don't format when saved in VS Code

**Solution**:

1. Install Prettier extension (esbenp.prettier-vscode)
2. Check `.vscode/settings.json` exists with:
   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode"
   }
   ```
3. Reload VS Code

## Next Steps

After completing this quickstart:

1. **Explore Example Components**: Review Button, Header, Footer implementations
2. **Read Contracts**: See `specs/002-nextjs-ts-minimal-lint/contracts/` for component APIs
3. **Create Your First Component**: Follow the example above
4. **Set Up Testing**: (Separate feature, to be implemented)
5. **Configure CI/CD**: (Separate feature, to be implemented)

## Additional Resources

### Documentation

- **Plan**: `specs/002-nextjs-ts-minimal-lint/plan.md`
- **Research**: `specs/002-nextjs-ts-minimal-lint/research.md`
- **Data Model**: `specs/002-nextjs-ts-minimal-lint/data-model.md`
- **Contracts**: `specs/002-nextjs-ts-minimal-lint/contracts/`

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)

## Getting Help

If you encounter issues:

1. Check this quickstart's troubleshooting section
2. Review error messages carefully (often contain solutions)
3. Check the specification: `specs/002-nextjs-ts-minimal-lint/spec.md`
4. Review constitutional requirements: `.specify/memory/constitution.md`

## Summary Checklist

After completing this guide, verify:

- ✅ Development server runs at http://localhost:3000
- ✅ Landing page displays with Header and Footer
- ✅ TypeScript compilation succeeds (`npm run type-check`)
- ✅ ESLint passes (`npm run lint`)
- ✅ Pre-commit hooks work (test with dummy commit)
- ✅ Format-on-save works in VS Code
- ✅ Path aliases work in imports
- ✅ Example components render correctly

**Total Setup Time**: 5-10 minutes  
**You're ready to build!** 🚀
