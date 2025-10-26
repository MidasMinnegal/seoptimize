# Code Style Guide

## Minimal Code Style Philosophy

This project follows a **minimal code style** approach, emphasizing clean, modern JavaScript/TypeScript patterns with reduced syntactic noise.

## Core Principles

### 1. No Semicolons

```typescript
// ✅ Correct
const name = 'SEOptimize'
const fn = () => console.log('test')

// ❌ Incorrect
const name = 'SEOptimize'
const fn = () => console.log('test')
```

### 2. Single Quotes

```typescript
// ✅ Correct
const message = 'Hello world'

// ❌ Incorrect
const message = 'Hello world'
```

### 3. Modern Patterns

#### Prefer const

```typescript
// ✅ Correct
const value = 10

// ❌ Incorrect
var value = 10
let value = 10 // only if reassignment needed
```

#### Template Literals

```typescript
// ✅ Correct
const greeting = `Hello ${name}`

// ❌ Incorrect
const greeting = 'Hello ' + name
```

#### Object Shorthand

```typescript
// ✅ Correct
const obj = { name, value }

// ❌ Incorrect
const obj = { name: name, value: value }
```

#### Destructuring

```typescript
// ✅ Correct
const { title, links } = props

// ❌ Incorrect (when multiple properties used)
const title = props.title
const links = props.links
```

### 4. Import Organization

Imports are automatically sorted by `simple-import-sort` plugin:

```typescript
// ✅ Correct order
import React from 'react'
import { Button } from '@components/ui/button'
import { formatDate } from '@lib/utils'
```

### 5. Console Statements

- `console.log()` - ❌ Error (use during development only)
- `console.warn()` - ✅ Allowed
- `console.error()` - ✅ Allowed

## Automated Enforcement

### ESLint

Enforces code quality and style rules:

```bash
npm run lint        # Check for violations
npm run lint:fix    # Auto-fix violations
```

### Prettier

Handles code formatting:

```bash
npm run format        # Format all files
npm run format:check  # Check formatting
```

### Pre-commit Hook

Automatically runs on `git commit`:

1. Formats staged files with Prettier
2. Fixes ESLint violations
3. Re-stages modified files
4. Aborts commit for manual review

To bypass in emergencies:

```bash
git commit --no-verify -m "message"
```

## Editor Integration

### VS Code

Settings are configured in `.vscode/settings.json`:

- Format on save enabled
- Prettier as default formatter
- ESLint auto-fix on save

## Path Aliases

Use clean imports with path aliases:

```typescript
// ✅ Correct
import { Button } from '@components/ui/button'
import { formatDate } from '@lib/utils'
import { UserType } from '@types/user'

// ❌ Incorrect
import { Button } from '../../../components/ui/button'
```

Available aliases:

- `@components/*` → `components/*`
- `@lib/*` → `lib/*`
- `@types/*` → `types/*`

## TypeScript

- Strict mode enabled
- Explicit return types optional (inferred)
- No `any` type allowed (use `unknown` if needed)
