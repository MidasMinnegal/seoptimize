# Component Contracts

**Feature**: Next.js TypeScript Project with Minimal Code Style  
**Last Updated**: 2025-10-26

## Overview

This directory contains API contracts for all components in the foundational Next.js project. Each contract defines the component's public interface, behavior, type safety guarantees, and testing requirements.

## Available Contracts

### UI Components

1. **[button-contract.md](./button-contract.md)**
   - Reusable button component
   - Demonstrates TypeScript prop typing
   - Variants: primary, secondary, outline
   - Sizes: small, medium, large

2. **[header-contract.md](./header-contract.md)**
   - Site header layout component
   - Navigation link composition
   - Next.js Link integration
   - Demonstrates component composition patterns

3. **[footer-contract.md](./footer-contract.md)**
   - Site footer layout component
   - Optional props with sensible defaults
   - Dynamic copyright year
   - Footer navigation links

## Contract Structure

Each contract document includes:

### 1. Purpose

- Component description
- Use case explanation
- Pattern demonstration goals

### 2. Public API

- Import statement
- Props interface (TypeScript)
- Default values
- Usage examples

### 3. Behavior Contract

- Interaction specifications
- Rendering rules
- Accessibility requirements
- Edge case handling

### 4. Type Safety Contract

- Compile-time guarantees
- TypeScript validation examples
- Runtime behavior specifications

### 5. Implementation Requirements

- Minimal code style examples
- Required patterns (destructuring, no semicolons, etc.)
- Structure requirements (semantic HTML)

### 6. Testing Contract

- Unit test requirements (future)
- Accessibility test requirements
- Integration test specifications

### 7. Dependencies

- React/Next.js version requirements
- External dependencies (if any)

### 8. Change Policy

- Breaking vs non-breaking changes
- Version bump requirements

## Using These Contracts

### For Implementation

When implementing a component:

1. Read the contract thoroughly
2. Follow the specified interface exactly
3. Implement required behavior
4. Apply minimal code style patterns
5. Ensure accessibility requirements met

### For Testing (Future)

When testing framework is added:

1. Review testing contract section
2. Implement all specified unit tests
3. Add accessibility tests
4. Verify behavior against contract

### For API Changes

Before modifying a component API:

1. Check change policy in contract
2. Determine if change is breaking
3. Update contract document
4. Version appropriately
5. Update dependent code

## Type Safety Guarantees

All contracts specify TypeScript interfaces that provide:

- **Compile-time validation**: Invalid props caught before runtime
- **IDE autocomplete**: Full IntelliSense support
- **Refactoring safety**: Rename operations propagate correctly
- **Documentation**: Types serve as living documentation

## Minimal Code Style

All implementation examples follow minimal code style:

- ✅ No semicolons
- ✅ Single quotes
- ✅ Destructured props
- ✅ Concise arrow functions
- ✅ Template literals
- ✅ Object shorthand
- ✅ Early returns

See individual contracts for specific examples.

## Accessibility Standards

All contracts specify WCAG 2.1 Level AA requirements:

- Semantic HTML elements
- Keyboard accessibility
- ARIA labels where needed
- Focus management
- Screen reader compatibility

## Relationship to Other Documents

### Related Documentation

- **[data-model.md](../data-model.md)**: Detailed type definitions and validation rules
- **[research.md](../research.md)**: Technology decisions and rationale
- **[quickstart.md](../quickstart.md)**: Development setup and workflow
- **[spec.md](../spec.md)**: Feature requirements and acceptance criteria

### Hierarchy

```
Feature Specification (spec.md)
    ↓
Implementation Plan (plan.md)
    ↓
Research (research.md) → Data Model (data-model.md)
    ↓                         ↓
Contracts (this directory) ← Type Definitions
    ↓
Implementation Tasks (tasks.md - future)
    ↓
Component Implementation
```

## Adding New Contracts

When adding new components:

1. Create contract file: `{component-name}-contract.md`
2. Follow existing contract structure
3. Define complete TypeScript interface
4. Specify all behavior rules
5. Include minimal code style examples
6. Document testing requirements
7. Update this README

### Contract Template Sections

```markdown
# Component Contract: {ComponentName}

**Component**: `{ComponentName}`
**Path**: `{path/to/component}`
**Type**: {Presentational/Layout/Container}
**Status**: {Defined/Implemented/Tested}

## Purpose

## Public API

## Usage Examples

## Behavior Contract

## Type Safety Contract

## Implementation Requirements

## Testing Contract

## Dependencies

## Change Policy

## Related Contracts
```

## Validation Checklist

Before implementation, verify contract includes:

- [ ] Complete TypeScript interface
- [ ] All required props documented
- [ ] Default values specified
- [ ] Usage examples provided
- [ ] Behavior rules defined
- [ ] Type safety examples included
- [ ] Minimal code style demonstrated
- [ ] Accessibility requirements listed
- [ ] Testing requirements specified
- [ ] Dependencies documented
- [ ] Change policy defined

## Questions or Issues

If a contract is:

- **Unclear**: Request clarification in PR comments
- **Incomplete**: Reference related documentation (data-model.md, spec.md)
- **Conflicting**: Constitution takes precedence, then spec, then contract
- **Outdated**: Submit PR to update contract (follow change policy)

## Summary

These contracts serve as the authoritative source for component APIs and behavior. They bridge the gap between design (data model) and implementation (code), ensuring consistency, type safety, and adherence to project standards.
