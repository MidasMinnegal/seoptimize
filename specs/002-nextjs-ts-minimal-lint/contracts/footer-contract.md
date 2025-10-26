# Component Contract: Footer

**Component**: `Footer`  
**Path**: `components/ui/footer/index.tsx`  
**Type**: Layout Component  
**Status**: Defined

## Purpose

A site footer component that demonstrates optional props with defaults, composition patterns, and completes the basic page layout structure alongside Header.

## Public API

### Import

```typescript
import { Footer } from '@components/ui/footer'
```

### Props Interface

```typescript
export interface FooterProps {
  copyright?: string
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
  copyright: `© ${new Date().getFullYear()} SEOptimize`,
  links: [],
  className: ''
}
```

## Usage Examples

### Basic Footer (All Defaults)

```typescript
<Footer />
```

**Expected Behavior**: Renders footer with current year copyright "© 2025 SEOptimize" and no links.

### Custom Copyright

```typescript
<Footer copyright="© 2025 My Company. All rights reserved." />
```

**Expected Behavior**: Renders footer with custom copyright text.

### Footer with Links

```typescript
<Footer
  links={[
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/contact', label: 'Contact' }
  ]}
/>
```

**Expected Behavior**: Renders footer with default copyright and three footer links.

### Complete Footer

```typescript
<Footer
  copyright="© 2025 SEOptimize"
  links={[
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' }
  ]}
  className="sticky-footer"
/>
```

**Expected Behavior**: Renders footer with custom copyright, links, and additional CSS class.

## Behavior Contract

### Rendering

| Prop State          | Visual Output                        |
| ------------------- | ------------------------------------ |
| No props            | Default copyright, no links          |
| `copyright` only    | Custom copyright, no links           |
| `links` only        | Default copyright + links            |
| All props           | Custom copyright + links + className |
| Empty `links` array | No links section rendered            |

### Copyright Auto-Update

- Default copyright includes current year via `new Date().getFullYear()`
- Updates automatically on year change (no code changes needed)
- Custom copyright used as-is (no auto-year insertion)

### Navigation Links

| Action         | Expected Result                           |
| -------------- | ----------------------------------------- |
| Click link     | Navigates to `href` using Next.js routing |
| Hover link     | Visual feedback (underline, color change) |
| Tab navigation | Links receive focus in DOM order          |

### Accessibility

- ✅ Uses semantic `<footer>` element
- ✅ Copyright text in `<p>` element
- ✅ Links wrapped in `<nav>` if present
- ✅ Links are keyboard accessible
- ✅ Focus visible on interactive elements
- ✅ Footer identified as contentinfo landmark

## Type Safety Contract

### Compile-Time Guarantees

```typescript
// ✅ Valid usage - all scenarios
<Footer />
<Footer copyright="Custom text" />
<Footer links={[{ href: '/privacy', label: 'Privacy' }]} />
<Footer copyright="Text" links={[]} className="custom" />

// ❌ Type error: invalid link structure
<Footer links={[{ url: '/', text: 'Link' }]} />

// ❌ Type error: copyright must be string
<Footer copyright={2025} />

// ❌ Type error: missing required link fields
<Footer links={[{ href: '/page' }]} />  // missing label
<Footer links={[{ label: 'Page' }]} />  // missing href
```

### Runtime Behavior

- **No props**: Uses all defaults
- **Undefined copyright**: Uses default with current year
- **Empty copyright string**: Renders empty (valid edge case)
- **Undefined links**: Treated as empty array
- **Empty links array**: No links section rendered

## Implementation Requirements

### Minimal Code Style

```typescript
// ✅ Correct style
export function Footer({
  copyright = `© ${new Date().getFullYear()} SEOptimize`,
  links = [],
  className = ''
}: FooterProps) {
  return (
    <footer className={`site-footer ${className}`}>
      <p>{copyright}</p>
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
    </footer>
  )
}

// ❌ Incorrect: Verbose, semicolons, manual year calculation
export function Footer(props: FooterProps): JSX.Element {
  const currentYear = new Date().getFullYear();
  const copyrightText = props.copyright || `© ${currentYear} SEOptimize`;
  const links = props.links || [];

  return (
    <footer className={'site-footer ' + props.className}>
      <p>{copyrightText}</p>
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
    </footer>
  );
}
```

### Required Patterns

- Destructured props with inline defaults
- Default copyright includes dynamic year
- No semicolons
- Template literals for string composition
- Conditional rendering using `&&` operator
- Arrow functions in map callbacks
- Destructuring in map parameters
- Next.js `Link` component for navigation
- Unique `key` prop for list items (using `href`)

### Structure Requirements

- Root element: `<footer>`
- Copyright element: `<p>`
- Navigation wrapper: `<nav>` (conditional)
- Link list: `<ul>` with `<li>` children
- Next.js Link components for all navigation

## Testing Contract (Future)

When testing framework is added, this component MUST have:

### Unit Tests

- ✅ Renders with no props (all defaults)
- ✅ Default copyright includes current year
- ✅ Renders custom copyright correctly
- ✅ Renders with no links (empty array)
- ✅ Renders all provided links
- ✅ Applies custom className correctly
- ✅ Uses Next.js Link component
- ✅ Sets correct href on each link

### Integration Tests

- ✅ Links integrate with Next.js router
- ✅ Footer links navigate correctly

### Accessibility Tests

- ✅ Has valid footer landmark
- ✅ Copyright text is in paragraph
- ✅ Navigation has nav role (when links present)
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
import { Footer } from '@components/ui/footer'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header title="SEOptimize" />
        <main>{children}</main>
        <Footer
          links={[
            { href: '/privacy', label: 'Privacy' },
            { href: '/terms', label: 'Terms' }
          ]}
        />
      </body>
    </html>
  )
}
```

### Sticky Footer Pattern (Future)

```css
/* Future enhancement: sticky footer CSS */
body {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}

.site-footer {
  margin-top: auto;
}
```

## Styling Contract

### CSS Classes Applied

- `.site-footer` - Root footer element
- Custom classes via `className` prop
- Link styling via global CSS or CSS modules (future)

### Visual Hierarchy

1. Footer is full-width
2. Copyright is primary text
3. Links are secondary (smaller font or different color)
4. Clear visual separation from main content
5. Background color typically different from body

## Edge Cases

### Copyright Text

| Scenario          | Behavior                                |
| ----------------- | --------------------------------------- |
| No copyright prop | Uses default with current year          |
| Empty string      | Renders empty paragraph (valid)         |
| Very long text    | Wraps to multiple lines                 |
| HTML entities     | Rendered as-is (no XSS risk with React) |

### Links

| Scenario            | Behavior                              |
| ------------------- | ------------------------------------- |
| Empty links array   | No navigation section rendered        |
| Single link         | Valid, renders one item               |
| Many links (10+)    | All render, may wrap or scroll        |
| Duplicate hrefs     | All render (no de-duplication)        |
| Invalid href format | Rendered as-is (Next.js Link handles) |

### Performance

- Default copyright computed once per component instance
- No heavy computation
- Simple map operation over links
- No state or side effects
- Renders in < 1ms for typical data

## SEO Considerations

### Copyright for SEO

- Copyright text helps establish ownership
- Proper copyright format: `© YEAR Company Name`
- Keeps search engines informed of content ownership

### Footer Links for SEO

- Important pages (Privacy, Terms) accessible in footer
- Internal linking structure helps SEO
- Footer links crawled by search engines

## Change Policy

### Breaking Changes

Changes requiring major version bump:

- Changing prop interface (rename, remove, change types)
- Changing link object structure
- Removing default copyright
- Changing default copyright format
- Changing DOM structure significantly

### Non-Breaking Changes

Changes allowed without version bump:

- Adding new optional props
- Styling updates (same structure)
- Internal implementation optimization
- Adding ARIA attributes
- Adding social media links section (new optional prop)

## Future Enhancements

### Social Media Links

```typescript
export interface FooterProps {
  copyright?: string
  links?: Array<{ href: string; label: string }>
  socialLinks?: Array<{
    href: string
    icon: string // Icon name or component
    label: string // For accessibility
  }>
  className?: string
}
```

### Multiple Link Columns

```typescript
export interface FooterProps {
  copyright?: string
  linkGroups?: Array<{
    title: string
    links: Array<{ href: string; label: string }>
  }>
  className?: string
}
```

## Related Contracts

- [Header](./header-contract.md) - Complementary layout component
- [Button](./button-contract.md) - May be used in footer (future)
