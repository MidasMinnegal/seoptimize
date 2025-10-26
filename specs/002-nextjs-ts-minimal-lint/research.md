# Phase 0: Research & Technology Decisions

**Feature**: Next.js TypeScript Project with Minimal Code Style  
**Date**: 2025-10-26  
**Status**: Complete

## Research Questions

Based on the Technical Context, the following areas required research to resolve NEEDS CLARIFICATION items and establish best practices.

## 1. Testing Framework Selection (Deferred)

**Decision**: Explicitly deferred to separate feature per specification

**Rationale**:

- Testing framework setup is marked as out of scope in the feature specification
- Constitution requires testing but acknowledges phased implementation
- Foundation must be established before testing infrastructure

**Action Required**: Plan separate testing feature after this foundation is complete

**Alternatives Considered**:

- Jest + React Testing Library (industry standard for React)
- Vitest (modern, faster alternative)
- Playwright (E2E testing)

**Future Recommendation**: Jest + React Testing Library for unit/integration, Playwright for E2E to align with Next.js ecosystem best practices

## 2. ESLint Configuration for Minimal Code Style

**Decision**: Use Next.js recommended ESLint config as baseline + custom rules for minimal style

**Rationale**:

- Next.js provides `eslint-config-next` with React/Next.js best practices built-in
- Extends from core rules: `eslint:recommended`, `plugin:react/recommended`, `plugin:react-hooks/recommended`
- Minimal style requires specific rule overrides and additions
- Prettier integration via `eslint-config-prettier` to avoid conflicts

**Configuration Strategy**:

```json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "semi": ["error", "never"],
    "quotes": ["error", "single", { "avoidEscape": true }],
    "comma-dangle": ["error", "only-multiline"],
    "arrow-body-style": ["error", "as-needed"],
    "prefer-const": "error",
    "prefer-template": "error",
    "object-shorthand": "error",
    "prefer-destructuring": ["error", { "object": true, "array": false }],
    "no-var": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "sort-imports": ["error", { "ignoreDeclarationSort": true }],
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "warn"
  }
}
```

**Alternatives Considered**:

- Airbnb style guide: Too opinionated, includes semicolons, conflicts with minimal philosophy
- Standard.js: Close match but less flexible for TypeScript and Next.js specifics
- XO: Similar philosophy but requires more custom configuration

**Best Practices**:

- Use `eslint-config-prettier` to disable ESLint formatting rules that conflict with Prettier
- Enable `no-console` warnings (not errors) to allow development logging
- Import sorting handled by ESLint (`simple-import-sort` plugin) for consistency
- TypeScript-specific rules via `@typescript-eslint/eslint-plugin`

## 3. Prettier Configuration for Minimal Formatting

**Decision**: Minimal Prettier configuration with ESLint integration

**Rationale**:

- Prettier handles formatting, ESLint handles code quality
- Minimal configuration matches specification requirements
- Auto-fix capability essential for pre-commit workflow

**Configuration**:

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100,
  "arrowParens": "avoid",
  "bracketSpacing": true,
  "endOfLine": "lf"
}
```

**Key Decisions**:

- `semi: false` - No semicolons (core minimal requirement)
- `singleQuote: true` - Single quotes for strings
- `trailingComma: "es5"` - Trailing commas in objects/arrays (cleaner diffs)
- `printWidth: 100` - Max line length per constitution and spec clarifications
- `arrowParens: "avoid"` - Omit parens for single-param arrows (minimal)
- `endOfLine: "lf"` - Unix line endings for consistency

**Alternatives Considered**:

- Standard.js formatting: Similar but less configurable
- Rome/Biome: Too new, ecosystem immature, limited Next.js support
- dprint: Fast but smaller ecosystem, less IDE integration

**Best Practices**:

- Use `.prettierignore` to exclude build artifacts, node_modules
- Integrate with ESLint via `eslint-config-prettier` to disable conflicting rules
- Enable format-on-save in editor configuration

## 4. Pre-commit Hook Strategy

**Decision**: Husky + lint-staged with auto-fix and commit abortion for review

**Rationale**:

- Husky: Industry standard Git hooks manager, zero-config with npm
- lint-staged: Runs commands on staged files only (faster than full codebase)
- Auto-fix + abort strategy per specification: safer than auto-commit, shows changes

**Workflow**:

1. Developer attempts commit
2. Pre-commit hook triggers via Husky
3. lint-staged runs on staged files:
   - `prettier --write` (format)
   - `eslint --fix` (auto-fix violations)
4. Fixed files are re-staged automatically
5. Commit aborts with message: "Files were auto-fixed. Review changes and commit again."
6. Developer runs `git diff --staged` to review changes
7. Developer re-commits (now passes)

**Configuration** (lint-staged):

```json
{
  "*.{js,jsx,ts,tsx}": ["prettier --write", "eslint --fix", "git add"],
  "*.{json,md,css}": ["prettier --write", "git add"]
}
```

**Alternatives Considered**:

- lefthook: Faster but less mature, smaller ecosystem
- pre-commit (Python): Different ecosystem, more complex for Node.js projects
- Auto-commit without abortion: Less safe, hides changes from developer
- No pre-commit hooks: Relies on developer discipline, fails constitutional automation requirement

**Best Practices**:

- Keep hook execution fast (< 10s per spec)
- Show clear messages about what was fixed
- Allow `--no-verify` flag for emergency commits (document usage)
- Include type-check in pre-push hook (slower, less frequent)

## 5. TypeScript Configuration Best Practices

**Decision**: Next.js TypeScript starter + strict mode + path aliases

**Rationale**:

- Next.js provides optimized `tsconfig.json` baseline via `create-next-app`
- Strict mode required by constitution (Type Safety First principle)
- Path aliases improve import readability and enable refactoring

**Configuration**:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"],
      "@components/*": ["components/*"],
      "@lib/*": ["lib/*"],
      "@types/*": ["types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Key Features**:

- All `strict` family flags enabled explicitly
- `noUnusedLocals` and `noUnusedParameters` catch dead code
- Path aliases simplify imports: `@components/ui/button` vs `../../components/ui/button`
- `moduleResolution: "bundler"` for Next.js 13+ compatibility

**Next.js Integration**:

- Next.js automatically recognizes `tsconfig.json` path aliases
- No additional configuration needed in `next.config.js` for path resolution
- IDE autocomplete works automatically via tsconfig

**Alternatives Considered**:

- Relaxed strict mode: Violates constitution, unacceptable
- Different path alias patterns (@ui, @utilities): Less standard, more cognitive load
- No path aliases: Acceptable but reduces code maintainability

**Best Practices**:

- Use `strict: true` + explicit flags for maximum clarity
- Enable `incremental` compilation for faster rebuilds
- Keep `skipLibCheck: true` to avoid type errors in dependencies
- Use Next.js plugin for App Router type safety

## 6. Next.js Version and App Router Setup

**Decision**: Next.js 14.x (latest stable) with App Router architecture

**Rationale**:

- App Router is required by specification and constitutional component architecture
- Next.js 14 provides stable App Router, React Server Components, and performance improvements
- App Router enables constitutional performance goals (server components, streaming, automatic code splitting)

**Key Features Used**:

- **React Server Components**: Default in App Router, reduces client bundle
- **Layouts**: `app/layout.tsx` for shared UI structure
- **File-based routing**: `app/page.tsx` for routes
- **Metadata API**: SEO-friendly metadata in layouts/pages
- **Automatic code splitting**: Per-route bundles

**Directory Conventions**:

- `app/layout.tsx`: Root layout (required)
- `app/page.tsx`: Home page route
- `app/globals.css`: Global styles
- Special files: `loading.tsx`, `error.tsx` (future use)

**Alternatives Considered**:

- Pages Router (Next.js legacy): Explicitly rejected by specification
- Next.js 13: Stable but missing 14.x improvements
- Remix/other frameworks: Different philosophy, less ecosystem

**Best Practices**:

- Use Server Components by default (add 'use client' only when needed)
- Co-locate related components in feature folders
- Use `next/image` for all images
- Leverage metadata API for SEO

## 7. Import Sorting and Organization

**Decision**: ESLint plugin `eslint-plugin-simple-import-sort` for automatic import sorting

**Rationale**:

- Consistent import order reduces merge conflicts
- Automatic sorting via ESLint auto-fix
- Simple, zero-config plugin aligned with minimal philosophy

**Import Order**:

1. React imports
2. External dependencies (node_modules)
3. Internal absolute imports (path aliases: @components, @lib, @types)
4. Relative imports
5. Style imports

**Configuration**:

```json
{
  "plugins": ["simple-import-sort"],
  "rules": {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error"
  }
}
```

**Alternatives Considered**:

- `eslint-plugin-import`: More features but complex configuration
- Manual sorting: Error-prone, inconsistent
- Prettier import sorting: Not natively supported, requires plugins

**Best Practices**:

- Auto-fix imports on save and pre-commit
- Group imports logically (external vs internal)
- Remove unused imports automatically

## 8. Component Folder Structure Pattern

**Decision**: Component-folder-with-index pattern for all components

**Rationale**:

- Clean imports: `import { Button } from '@components/ui/button'` (no `/index` needed)
- Co-location ready: Future tests, styles can live alongside component
- Scalability: Easy to add related files without restructuring
- Standard pattern in React/Next.js ecosystem

**Pattern**:

```
components/ui/button/
├── index.tsx          # Component implementation
├── button.types.ts    # (future) Type definitions
├── button.test.tsx    # (future) Tests
└── button.module.css  # (future) Styles
```

**Current Implementation** (minimal):

```
components/ui/button/
└── index.tsx          # Component with inline types
```

**Alternatives Considered**:

- Flat files: `components/button.tsx` - doesn't scale, no co-location
- Named files: `components/button/button.tsx` - redundant, verbose imports
- Feature folders: Premature for basic components

**Best Practices**:

- Export component as named export: `export function Button() {}`
- Define prop types in same file initially, extract when complex
- Use folder name in kebab-case: `button/`, `header/`, `footer/`

## Summary of Resolved Clarifications

| Original Question           | Decision                                      | Documented In |
| --------------------------- | --------------------------------------------- | ------------- |
| Testing framework?          | Deferred to separate feature                  | Section 1     |
| ESLint configuration?       | Next.js baseline + minimal rules              | Section 2     |
| Prettier settings?          | Minimal config (no semi, single quotes, etc.) | Section 3     |
| Pre-commit strategy?        | Husky + lint-staged with auto-fix + abort     | Section 4     |
| TypeScript strict settings? | All strict flags + path aliases               | Section 5     |
| Next.js version/router?     | Next.js 14.x with App Router                  | Section 6     |
| Import organization?        | ESLint simple-import-sort plugin              | Section 7     |
| Component file structure?   | Folder-with-index pattern                     | Section 8     |

## Technology Stack Summary

**Core**:

- Next.js 14.x
- React 18.x
- TypeScript 5.x

**Code Quality**:

- ESLint 8.x + `eslint-config-next` + `eslint-config-prettier`
- Prettier 3.x
- `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin`
- `eslint-plugin-simple-import-sort`

**Development Workflow**:

- Husky 8.x (Git hooks)
- lint-staged 15.x (staged file processing)

**Editor Integration**:

- VS Code settings for format-on-save
- ESLint extension
- Prettier extension

## Risk Assessment

**Low Risk**:

- Well-established technology choices
- Mature ecosystem with strong community support
- Clear migration path for future updates

**Potential Challenges**:

- ESLint/Prettier rule conflicts (mitigated by `eslint-config-prettier`)
- Path alias resolution in different tools (mitigated by standard tsconfig configuration)
- Pre-commit hook performance on large changesets (mitigated by lint-staged optimizations)

**Mitigation Strategies**:

- Test configurations on sample files before full implementation
- Document common issues in project documentation
- Provide clear error messages in pre-commit hooks
- Include troubleshooting guide in README

## Next Steps

Proceed to **Phase 1: Design & Contracts** to:

1. Define data models for component props
2. Generate component contracts (TypeScript interfaces)
3. Create quickstart documentation
4. Update agent context with technology decisions
