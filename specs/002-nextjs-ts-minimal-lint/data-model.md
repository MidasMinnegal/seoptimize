# Data Model: Component Props and Type Definitions

**Feature**: Next.js TypeScript Project with Minimal Code Style  
**Date**: 2025-10-26  
**Status**: Complete

## Overview

This document defines the TypeScript type definitions for all components, configuration structures, and data entities in the foundational Next.js project. All types enforce strict type safety per constitutional requirements.

## Component Prop Interfaces

### 1. Button Component

**Purpose**: Reusable button component demonstrating typed props and minimal code style

**Interface**:

```typescript
export interface ButtonProps {
  /**
   * Button text content
   */
  children: React.ReactNode

  /**
   * Click handler
   */
  onClick?: () => void

  /**
   * Visual style variant
   * @default 'primary'
   */
  variant?: 'primary' | 'secondary' | 'outline'

  /**
   * Button size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large'

  /**
   * Disabled state
   * @default false
   */
  disabled?: boolean

  /**
   * HTML button type
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset'

  /**
   * Additional CSS classes
   */
  className?: string
}
```

**Validation Rules**:

- `children` is required (enforced by TypeScript)
- `variant`, `size`, `type` use string literal types for type safety
- All optional props have documented defaults
- `onClick` handler has no parameters (simple example)

**State Transitions**: None (stateless component)

**Usage Example**:

```typescript
<Button
  variant="primary"
  size="medium"
  onClick={() => console.log('clicked')}
>
  Click Me
</Button>
```

### 2. Header Component

**Purpose**: Site header component demonstrating composition and layout patterns

**Interface**:

```typescript
export interface HeaderProps {
  /**
   * Site title/logo text
   */
  title: string

  /**
   * Navigation links
   */
  links?: Array<{
    href: string
    label: string
  }>

  /**
   * Additional CSS classes
   */
  className?: string
}
```

**Validation Rules**:

- `title` is required string
- `links` is optional array of objects with strict shape
- Each link requires both `href` and `label`
- Empty array is valid (no navigation links)

**State Transitions**: None (stateless component)

**Usage Example**:

```typescript
<Header
  title="SEOptimize"
  links={[
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' }
  ]}
/>
```

### 3. Footer Component

**Purpose**: Site footer component demonstrating minimal layout structure

**Interface**:

```typescript
export interface FooterProps {
  /**
   * Copyright text
   */
  copyright?: string

  /**
   * Footer links
   */
  links?: Array<{
    href: string
    label: string
  }>

  /**
   * Additional CSS classes
   */
  className?: string
}
```

**Validation Rules**:

- All props optional (sensible defaults used)
- `links` follows same structure as Header for consistency
- `copyright` defaults to current year if omitted

**State Transitions**: None (stateless component)

**Usage Example**:

```typescript
<Footer
  copyright="© 2025 SEOptimize"
  links={[
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' }
  ]}
/>
```

## Configuration Type Definitions

### 1. ESLint Configuration Types

**Purpose**: Type-safe ESLint configuration structure

```typescript
/**
 * ESLint configuration object
 */
export interface ESLintConfig {
  extends: string[]
  plugins?: string[]
  rules: Record<string, 'error' | 'warn' | 'off' | [string, unknown]>
  parserOptions?: {
    ecmaVersion?: number | 'latest'
    sourceType?: 'module' | 'script'
    ecmaFeatures?: {
      jsx?: boolean
    }
  }
  env?: Record<string, boolean>
  settings?: Record<string, unknown>
}

/**
 * Minimal style ESLint rules
 */
export type MinimalStyleRules = {
  semi: ['error', 'never']
  quotes: ['error', 'single', { avoidEscape: boolean }]
  'comma-dangle': ['error', 'only-multiline' | 'never' | 'always']
  'arrow-body-style': ['error', 'as-needed']
  'prefer-const': 'error'
  'prefer-template': 'error'
  'object-shorthand': 'error'
  'no-var': 'error'
  'no-console': ['warn', { allow: string[] }]
}
```

### 2. Prettier Configuration Types

**Purpose**: Type-safe Prettier configuration structure

```typescript
/**
 * Prettier configuration object
 */
export interface PrettierConfig {
  semi: boolean
  singleQuote: boolean
  trailingComma: 'none' | 'es5' | 'all'
  tabWidth: number
  printWidth: number
  arrowParens: 'avoid' | 'always'
  bracketSpacing: boolean
  endOfLine: 'lf' | 'crlf' | 'cr' | 'auto'
}
```

### 3. TypeScript Configuration Types

**Purpose**: Path alias configuration types

```typescript
/**
 * TypeScript path alias mappings
 */
export interface PathAliases {
  '@/*': ['./*']
  '@components/*': ['components/*']
  '@lib/*': ['lib/*']
  '@types/*': ['types/*']
}

/**
 * TypeScript compiler options (subset)
 */
export interface TSConfigCompilerOptions {
  target: string
  lib: string[]
  strict: boolean
  noImplicitAny: boolean
  strictNullChecks: boolean
  paths: PathAliases
  moduleResolution: string
  jsx: string
}
```

## Shared Type Definitions

### 1. Common UI Types

**Purpose**: Reusable types across UI components

```typescript
/**
 * CSS class name type
 */
export type ClassName = string

/**
 * Link object structure
 */
export interface Link {
  href: string
  label: string
}

/**
 * Size variants
 */
export type Size = 'small' | 'medium' | 'large'

/**
 * Common button/element variants
 */
export type Variant = 'primary' | 'secondary' | 'outline'
```

### 2. Metadata Types

**Purpose**: Next.js metadata API types

```typescript
/**
 * Page metadata structure
 */
export interface PageMetadata {
  title: string
  description: string
  keywords?: string[]
  authors?: Array<{ name: string }>
  openGraph?: {
    title: string
    description: string
    images?: string[]
  }
}
```

## Type Organization Strategy

### File Structure

```
types/
├── index.ts              # Main export file (re-exports all types)
├── components.ts         # Component prop interfaces (future)
├── config.ts             # Configuration types (future)
└── common.ts             # Shared utility types (future)
```

**Current Implementation**: All types defined inline in component files initially. Extract to `types/` when:

- Type is used in 3+ files
- Type becomes complex (10+ properties)
- Type needs documentation/examples

### Naming Conventions

- **Component Props**: `{ComponentName}Props` (e.g., `ButtonProps`)
- **Configuration**: `{Tool}Config` (e.g., `ESLintConfig`)
- **Shared Types**: Descriptive name (e.g., `Link`, `PageMetadata`)
- **Type Aliases**: PascalCase (e.g., `ClassName`, `Variant`)
- **Enums**: Avoid (use string literal unions instead for minimal style)

## Type Safety Enforcement

### Strict Mode Flags

All types must comply with TypeScript strict mode:

```typescript
// ✅ Correct: Explicit types, no any
interface Props {
  name: string
  age: number
}

// ❌ Incorrect: Using any
interface Props {
  data: any // Error: no-explicit-any
}

// ✅ Correct: Use unknown for truly unknown types
interface Props {
  data: unknown
}
```

### Null Safety

```typescript
// ✅ Correct: Optional props clearly marked
interface Props {
  name: string      // Required
  age?: number      // Optional
}

// ✅ Correct: Explicit null handling
function render(data: Data | null) {
  if (data === null) return null
  return <div>{data.name}</div>
}
```

### Avoid Type Assertions

```typescript
// ❌ Incorrect: Type assertion without validation
const data = response as UserData

// ✅ Correct: Type guard with validation
function isUserData(data: unknown): data is UserData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    typeof (data as UserData).name === 'string'
  )
}

if (isUserData(response)) {
  // response is now safely typed as UserData
}
```

## Validation Rules Summary

| Entity       | Required Fields        | Optional Fields                                               | Validation Notes                      |
| ------------ | ---------------------- | ------------------------------------------------------------- | ------------------------------------- |
| ButtonProps  | `children`             | `onClick`, `variant`, `size`, `disabled`, `type`, `className` | String literals for variant/size/type |
| HeaderProps  | `title`                | `links`, `className`                                          | Links array validated at runtime      |
| FooterProps  | none                   | `copyright`, `links`, `className`                             | All optional with defaults            |
| Link         | `href`, `label`        | none                                                          | Both strings required                 |
| PageMetadata | `title`, `description` | `keywords`, `authors`, `openGraph`                            | Follows Next.js metadata API          |

## Future Extensions

### When Components Grow

Extract component prop types to `types/components.ts`:

```typescript
// types/components.ts
export * from './button.types'
export * from './header.types'
export * from './footer.types'
```

### Complex Form Types

When forms are added:

```typescript
// types/forms.ts
export interface FormField<T = string> {
  name: string
  value: T
  error?: string
  touched: boolean
  dirty: boolean
}

export interface FormState<T extends Record<string, unknown>> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isValid: boolean
  isSubmitting: boolean
}
```

### API Response Types

When API integration is added:

```typescript
// types/api.ts
export interface APIResponse<T> {
  data: T
  status: number
  message?: string
}

export interface APIError {
  message: string
  code: string
  details?: unknown
}
```

## Related Documentation

- [Contracts](./contracts/) - Component API contracts
- [Research](./research.md) - TypeScript configuration decisions
- [Constitution](../../.specify/memory/constitution.md) - Type safety requirements
