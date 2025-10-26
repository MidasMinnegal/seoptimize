<!--
Sync Impact Report:
- Version change: Template initialization → 1.0.0
- Modified principles: N/A (initial creation)
- Added sections: All sections (Core Principles, Performance Standards, Development Workflow, Governance)
- Removed sections: N/A
- Templates requiring updates:
  ✅ plan-template.md - reviewed, aligns with constitution principles
  ✅ spec-template.md - reviewed, aligns with user story and requirements approach
  ✅ tasks-template.md - reviewed, aligns with testing and task organization principles
- Follow-up TODOs: None
-->

# SEOptimize Next.js Project Constitution

## Core Principles

### I. Type Safety First (NON-NEGOTIABLE)

TypeScript MUST be used throughout the entire codebase with strict mode enabled. All code MUST:

- Have explicit type annotations for function parameters and return values
- Avoid using `any` type unless absolutely necessary and justified in code comments
- Leverage TypeScript utility types (Partial, Pick, Omit, etc.) for type transformations
- Prefer `type` over `interface` for type definitions (types are more flexible, support unions/intersections, and align with minimal philosophy)
- Define types for all data structures, API responses, and component props
- Use const assertions and as const where appropriate for literal types

**Rationale**: Type safety catches bugs at compile time, improves IDE experience, enables confident refactoring, and serves as living documentation for the codebase.

### II. Component Architecture & Reusability

React components MUST follow a consistent architecture pattern. All components MUST:

- Be functional components using React hooks (no class components)
- Follow the Single Responsibility Principle - one clear purpose per component
- Separate presentational components from container/logic components
- Live in appropriate directories: `components/` for shared UI, `app/` for pages/routes
- Export component interfaces/prop types separately for reuse
- Use composition over prop drilling (Context API or state management when needed)

**Rationale**: Consistent architecture improves maintainability, enables component reuse, simplifies testing, and helps developers navigate the codebase efficiently.

### III. Test-Driven Development for Critical Paths (NON-NEGOTIABLE)

Testing MUST follow a risk-based approach focusing on critical functionality. Testing requirements:

- **Critical paths** (authentication, payments, data mutations): TDD mandatory - tests written → approved → fail → implement
- **User-facing features**: Integration tests covering primary user journeys MUST exist
- **Utility functions & hooks**: Unit tests MUST exist before code review approval
- **UI components**: Visual regression tests or snapshot tests for complex/shared components
- Test files MUST be colocated with source files or in `__tests__/` directories
- Minimum 80% coverage for critical business logic paths

**Test pyramid structure**:

- Unit tests (60%): Individual functions, hooks, utilities
- Integration tests (30%): User flows, API routes, database operations
- E2E tests (10%): Critical user journeys end-to-end

**Rationale**: TDD for critical paths ensures correctness where it matters most while balancing development velocity. Comprehensive testing prevents regressions and enables confident deployments.

### IV. Performance Budgets & Optimization

Next.js applications MUST meet defined performance standards. All features MUST:

- Adhere to Core Web Vitals targets: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Keep initial JavaScript bundle size under 200KB (gzipped)
- Lazy load routes and components using Next.js dynamic imports where appropriate
- Optimize images using next/image with proper sizing and formats (WebP, AVIF)
- Implement proper caching strategies (ISR, SSG where applicable)
- Use React Server Components for data fetching when possible (Next.js 13+ App Router)
- Profile and optimize re-renders using React DevTools profiler

**Performance monitoring**:

- Lighthouse CI integration in deployment pipeline (scores > 90)
- Real User Monitoring (RUM) for production performance tracking
- Bundle analysis on every PR to catch size regressions

**Rationale**: Performance directly impacts user experience, SEO rankings, and conversion rates. Proactive optimization prevents technical debt and ensures scalability.

### V. User Experience Consistency

UI/UX MUST maintain consistency across the application. All interfaces MUST:

- Follow a design system with reusable components (Button, Input, Card, etc.)
- Use a consistent color palette, typography scale, and spacing system (Tailwind/CSS-in-JS config)
- Implement proper loading states, error states, and empty states for all data-dependent UIs
- Provide accessible experiences: semantic HTML, ARIA labels, keyboard navigation
- Support responsive design with mobile-first approach (breakpoints: sm, md, lg, xl)
- Maintain consistent interaction patterns (form validation, modal behavior, navigation)

**Accessibility requirements** (WCAG 2.1 Level AA):

- Color contrast ratios ≥ 4.5:1 for normal text
- All interactive elements keyboard accessible
- Proper heading hierarchy (h1 → h2 → h3)
- Alt text for images, labels for form inputs
- Screen reader testing for critical flows

**Rationale**: Consistency reduces cognitive load, improves usability, ensures accessibility compliance, and creates a professional user experience that builds trust.

### VI. Code Quality & Standards

Code MUST be maintainable, readable, and follow established conventions. All code MUST:

- Follow ESLint configuration with Next.js recommended rules
- Use Prettier for consistent formatting (enforced via pre-commit hooks)
- Follow naming conventions:
  - PascalCase for components and types/interfaces
  - camelCase for functions, variables, and hooks
  - SCREAMING_SNAKE_CASE for constants
  - kebab-case for file names
- Include JSDoc comments for public APIs and complex logic
- Keep functions small and focused (max 50 lines, ideally < 30)
- Avoid deep nesting (max 3 levels of indentation)
- Use early returns to reduce complexity

**Code review requirements**:

- All PRs require at least one approval before merge
- PRs MUST pass all automated checks (lint, type-check, tests, build)
- Self-review checklist completed before requesting review
- No commented-out code or console.log statements in production code

**Rationale**: Consistent code quality enables team collaboration, reduces bugs, speeds up onboarding, and makes the codebase easier to evolve over time.

## Performance Standards

### Bundle Size Management

- **Critical JavaScript**: < 200KB gzipped for initial load
- **Route-based code splitting**: Each route bundle < 150KB gzipped
- **Third-party dependencies**: Audit quarterly, remove unused dependencies
- **Tree shaking**: Ensure all imports are tree-shakeable (named imports preferred)

### Runtime Performance

- **Time to Interactive (TTI)**: < 3.5s on 3G connection
- **First Contentful Paint (FCP)**: < 1.8s
- **Server response time**: API routes < 300ms p95, < 100ms p50
- **Database queries**: Optimized with proper indexing, N+1 queries prohibited
- **Memory usage**: Client-side memory stable (no memory leaks in SPAs)

### Monitoring & Alerting

- Performance regression alerts on Core Web Vitals degradation > 10%
- Error tracking with proper source maps (Sentry or similar)
- API endpoint monitoring with latency and error rate tracking
- Automated Lighthouse CI checks on every deployment

## Development Workflow

### Branch Strategy

- **main**: Production-ready code, protected branch
- **feature/###-feature-name**: Feature branches created from main
- **hotfix/###-issue-name**: Urgent production fixes
- Branches MUST be deleted after merge
- No direct commits to main

### Pull Request Process

1. Create feature branch from latest main
2. Implement changes following TDD for critical paths
3. Self-review using PR template checklist
4. Run local validation: `npm run type-check && npm run lint && npm run test`
5. Create PR with descriptive title and summary of changes
6. Address review feedback and re-request review
7. Merge after approval and passing CI

### Commit Standards

- Follow Conventional Commits specification:
  - `feat:` new features
  - `fix:` bug fixes
  - `refactor:` code restructuring without behavior change
  - `test:` adding or updating tests
  - `docs:` documentation changes
  - `perf:` performance improvements
  - `chore:` tooling, dependencies, configuration
- Commit messages MUST be descriptive and explain "why" not just "what"
- Atomic commits preferred (one logical change per commit)

### CI/CD Pipeline

All PRs and deployments MUST pass:

1. **Type checking**: `tsc --noEmit`
2. **Linting**: `eslint --max-warnings 0`
3. **Unit & integration tests**: > 80% coverage for critical paths
4. **Build verification**: `next build` succeeds
5. **Lighthouse CI**: Performance scores > 90
6. **Security scan**: Dependencies scanned for vulnerabilities
7. **E2E tests** (on main branch): Critical user journeys pass

### Deployment Strategy

- **Preview deployments**: Automatic for every PR (Vercel preview URLs)
- **Staging**: Deploy from main after merge for final validation
- **Production**: Deploy via manual approval or automated after staging validation
- **Rollback plan**: Previous deployment version easily restorable within 5 minutes

## Governance

### Constitutional Authority

This constitution serves as the authoritative source for development standards and practices. When conflicts arise between this document and other practices:

1. Constitution takes precedence
2. Exceptions MUST be documented in the PR description with clear justification
3. Repeated exceptions indicate need for constitutional amendment

### Amendment Process

Constitution changes require:

1. Proposal documented with rationale and impact analysis
2. Team review and discussion (minimum 3 business days for feedback)
3. Approval from technical lead or team consensus
4. Update of version number following semantic versioning
5. Migration plan for changes affecting existing code
6. Communication to all team members

### Compliance & Quality Gates

- **Pre-commit**: Format check, lint staged files (Husky + lint-staged)
- **Pre-push**: Type check and unit tests MUST pass
- **PR merge**: All CI checks MUST pass, peer review approved
- **Deployment**: Production build succeeds, E2E tests pass
- **Quarterly review**: Constitution relevance assessed, amendments proposed if needed

### Complexity Justification

Any deviation from these principles MUST be justified:

- Document the specific need in PR or Architecture Decision Record (ADR)
- Explain simpler alternatives and why they were rejected
- Get explicit approval from technical lead for architectural exceptions
- Tag as technical debt if temporary deviation (with remediation plan)

**Version**: 1.0.0 | **Ratified**: 2025-10-26 | **Last Amended**: 2025-10-26
