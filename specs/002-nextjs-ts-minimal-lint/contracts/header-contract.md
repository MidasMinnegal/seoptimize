# Component Contract: Header

**Component**: `Header`  
**Path**: `components/ui/header/index.tsx`  
**Type**: Layout Component  
**Status**: Defined

## Purpose

A site header component that demonstrates component composition, TypeScript interface patterns, and establishes the navigation structure pattern for the application.

## Public API

### Import

```typescript
import { Header } from '@components/ui/header'
```

### Props Interface

```typescript
export interface HeaderProps {
  title: string
  links?: Array<{
    href: string
    label: string
  }>
  className?: string
}
```

### Default Props

```typescript
{
  links: [],
  className: ''
}
```

## Usage Examples

### Basic Header

```typescript
<Header title="SEOptimize" />
```

**Expected Behavior**: Renders header with site title "SEOptimize" and no navigation links.

### Header with Navigation

```typescript
<Header
  title="SEOptimize"
  links={[
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ]}
/>
```

**Expected Behavior**: Renders header with site title and three navigation links.

### Custom Styling

```typescript
<Header
  title="SEOptimize"
  links={[{ href: '/', label: 'Home' }]}
  className="sticky-header"
/>
```

**Expected Behavior**: Renders header with additional CSS class for custom styling.

## Behavior Contract

### Rendering

| Prop State           | Visual Output                                |
| -------------------- | -------------------------------------------- |
| `title` only         | Title/logo displayed, no navigation          |
| `title` + `links`    | Title/logo + horizontal navigation menu      |
| Empty `links` array  | Same as no links provided                    |
| `className` provided | Additional CSS class applied to root element |

### Navigation Links

| Action         | Expected Result                           |
| -------------- | ----------------------------------------- |
| Click link     | Navigates to `href` using Next.js routing |
| Hover link     | Visual feedback (underline, color change) |
| Tab navigation | Links receive focus in DOM order          |

### Accessibility

- ✅ Uses semantic `<header>` element
- ✅ Title wrapped in heading element (`<h1>`)
- ✅ Navigation wrapped in `<nav>` element
- ✅ Links are keyboard accessible
- ✅ Proper ARIA labels where needed
- ✅ Focus visible on interactive elements

## Type Safety Contract

### Compile-Time Guarantees

```typescript
// ✅ Valid usage
<Header title="Site" />
<Header title="Site" links={[]} />
<Header title="Site" links={[{ href: '/', label: 'Home' }]} />

// ❌ Type error: missing title
<Header />

// ❌ Type error: invalid link structure
<Header title="Site" links={[{ url: '/', text: 'Home' }]} />

// ❌ Type error: title must be string
<Header title={123} />

// ❌ Type error: missing href in link
<Header title="Site" links={[{ label: 'Home' }]} />
```

### Runtime Behavior

- **Invalid props**: TypeScript prevents at compile time
- **Empty string title**: Renders empty title (valid edge case)
- **Undefined links**: Treated as empty array
- **Duplicate links**: All rendered (de-duplication not enforced)

## Implementation Requirements

### Minimal Code Style

```typescript
// ✅ Correct style
export function Header({
  title,
  links = [],
  className = ''
}: HeaderProps) {
  return (
    <header className={`site-header ${className}`}>
      <h1>{title}</h1>
      {links.length > 0 && (
        <nav>
          <ul>
            {links.map(({ href, label }) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}

// ❌ Incorrect: Verbose, semicolons, no destructuring
export function Header(props: HeaderProps): JSX.Element {
  const links = props.links || [];
  return (
    <header className={'site-header ' + props.className}>
      <h1>{props.title}</h1>
      {links.length > 0 ? (
        <nav>
          <ul>
            {links.map((link) => {
              return (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              );
            })}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
```

### Required Patterns

- Destructured props with inline defaults
- No semicolons
- Template literals for string composition
- Conditional rendering using `&&` operator
- Arrow functions in map callbacks
- Destructuring in map parameters
- Next.js `Link` component for navigation
- Unique `key` prop for list items (using `href`)

### Structure Requirements

- Root element: `<header>`
- Title element: `<h1>`
- Navigation wrapper: `<nav>`
- Link list: `<ul>` with `<li>` children
- Next.js Link components for all navigation

## Testing Contract (Future)

When testing framework is added, this component MUST have:

### Unit Tests

- ✅ Renders title correctly
- ✅ Renders with no links
- ✅ Renders all provided links
- ✅ Applies custom className correctly
- ✅ Uses Next.js Link component
- ✅ Sets correct href on each link
- ✅ Uses href as key for list items

### Integration Tests

- ✅ Links integrate with Next.js router
- ✅ Navigation works end-to-end

### Accessibility Tests

- ✅ Has valid header landmark
- ✅ Title is h1 element
- ✅ Navigation has nav role
- ✅ Links are keyboard accessible
- ✅ Focus order is logical

## Dependencies

- **React**: ^18.0.0 (core)
- **Next.js**: ^14.0.0 (Link component, routing)
- **TypeScript**: ^5.0.0 (type checking)
- No external UI libraries

## Layout Integration

### Root Layout Usage

```typescript
// app/layout.tsx
import { Header } from '@components/ui/header'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header
          title="SEOptimize"
          links={[
            { href: '/', label: 'Home' },
            { href: '/about', label: 'About' }
          ]}
        />
        <main>{children}</main>
      </body>
    </html>
  )
}
```

### Responsive Behavior (Future)

- Desktop: Horizontal navigation inline with title
- Mobile: Hamburger menu pattern (future enhancement)
- Current: Basic responsive CSS (flexbox)

## Styling Contract

### CSS Classes Applied

- `.site-header` - Root header element
- Custom classes via `className` prop
- Link styling via global CSS or CSS modules (future)

### Visual Hierarchy

1. Header is full-width
2. Title is prominent (larger font, bold)
3. Navigation is secondary (smaller font)
4. Clear visual separation between elements

## Edge Cases

### Empty or Invalid Data

| Scenario            | Behavior                              |
| ------------------- | ------------------------------------- |
| Empty title string  | Renders empty h1 (valid)              |
| Empty links array   | No navigation rendered                |
| Single link         | Valid, renders one item               |
| Many links (20+)    | All render, may wrap on mobile        |
| Duplicate hrefs     | All render (no de-duplication)        |
| Invalid href format | Rendered as-is (Next.js Link handles) |

### Performance

- No heavy computation
- Simple map operation over links
- No state or side effects
- Renders in < 1ms for typical data

## Change Policy

### Breaking Changes

Changes requiring major version bump:

- Changing prop interface (rename, remove, change types)
- Changing link object structure
- Removing default values
- Changing DOM structure significantly

### Non-Breaking Changes

Changes allowed without version bump:

- Adding new optional props
- Styling updates (same structure)
- Internal implementation optimization
- Adding ARIA attributes
- Responsive behavior enhancements

## Related Contracts

- [Footer](./footer-contract.md) - Similar composition pattern
- [Button](./button-contract.md) - May be used in header (future)
