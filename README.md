# SEOptimize

A Next.js 14 application built with TypeScript, demonstrating minimal code style and modern development practices.

## Features

- **Next.js 14** with App Router architecture
- **TypeScript 5** with strict mode enabled
- **Minimal Code Style** - clean, modern JavaScript patterns
- **Automated Code Quality** - ESLint + Prettier + pre-commit hooks
- **Path Aliases** - clean imports with `@components`, `@lib`, `@types`
- **Example Components** - Button, Header, Footer with TypeScript interfaces

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd seoptimize

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Development Commands

```bash
# Development
npm run dev          # Start dev server (localhost:3000)

# Building
npm run build        # Create production build
npm start            # Start production server

# Code Quality
npm run lint         # Check for linting errors
npm run lint:fix     # Auto-fix linting errors
npm run type-check   # Run TypeScript type checking
npm run format       # Format all files with Prettier
npm run format:check # Check formatting without modifying
```

## Project Structure

```
seoptimize/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with Header/Footer
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   └── ui/               # UI components
│       ├── button/       # Button component
│       ├── header/       # Header component
│       └── footer/       # Footer component
├── lib/                   # Utilities and hooks
│   ├── utils/            # Utility functions
│   └── hooks/            # Custom React hooks
├── types/                 # TypeScript type definitions
├── public/                # Static assets
└── specs/                 # Feature specifications
```

## Code Style

This project follows a **minimal code style** philosophy:

- ✅ No semicolons
- ✅ Single quotes
- ✅ Modern ES2022+ patterns (const, template literals, destructuring)
- ✅ Sorted imports
- ✅ Path aliases for clean imports

See [CODE_STYLE.md](./CODE_STYLE.md) for complete style guide.

### Example

```typescript
import { Button } from '@components/ui/button'
import { formatDate } from '@lib/utils'

export default function Example() {
  const handleClick = () => {
    console.warn('Button clicked')
  }

  return (
    <div>
      <Button onClick={handleClick} variant="primary">
        Click Me
      </Button>
    </div>
  )
}
```

## Automated Workflows

### Pre-commit Hook

Every commit automatically:

1. Formats code with Prettier
2. Fixes ESLint violations
3. Re-stages modified files
4. Aborts commit if errors remain (for manual review)

To bypass in emergencies:

```bash
git commit --no-verify -m "emergency fix"
```

### Editor Integration

VS Code settings are configured in `.vscode/settings.json`:

- Format on save
- Auto-fix ESLint issues
- Prettier as default formatter

## TypeScript Configuration

- **Strict mode** enabled for maximum type safety
- **Path aliases** for clean imports
- **ESNext target** for modern JavaScript features
- All strict flags enabled (`noImplicitAny`, `strictNullChecks`, etc.)

## Component Architecture

All UI components follow a consistent pattern:

```typescript
// components/ui/example/index.tsx
'use client'  // if interactive

export interface ExampleProps {
  title: string
  onClick?: () => void
  className?: string
}

export function Example({ title, onClick, className = '' }: ExampleProps) {
  return (
    <div className={`example ${className}`}>
      {title}
    </div>
  )
}
```

## Performance

- Development server start: < 5s
- TypeScript compilation: < 10s
- ESLint execution: < 10s
- Production bundle: ~88KB first load JS

## Documentation

- [Code Style Guide](./CODE_STYLE.md) - Detailed style conventions
- [Quickstart Guide](./specs/002-nextjs-ts-minimal-lint/quickstart.md) - Getting started
- [Component Contracts](./specs/002-nextjs-ts-minimal-lint/contracts/) - API specifications

## Technology Stack

- **Framework**: Next.js 14.x (App Router)
- **UI Library**: React 18.x
- **Language**: TypeScript 5.x
- **Linting**: ESLint 8.x
- **Formatting**: Prettier 3.x
- **Git Hooks**: Husky 8.x
- **Staged Files**: lint-staged 15.x

## License

Private project - All rights reserved

## Contributing

1. Follow the code style guide
2. Ensure all tests pass
3. TypeScript strict mode must pass
4. No ESLint warnings allowed
5. Pre-commit hooks must pass
