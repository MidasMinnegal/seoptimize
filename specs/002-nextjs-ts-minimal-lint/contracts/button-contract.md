# Component Contract: Button

**Component**: `Button`  
**Path**: `components/ui/button/index.tsx`  
**Type**: Presentational UI Component  
**Status**: Defined

## Purpose

A reusable button component that demonstrates TypeScript prop typing, minimal code style, and serves as a pattern for future UI components.

## Public API

### Import

```typescript
import { Button } from '@components/ui/button'
```

### Props Interface

```typescript
export interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
}
```

### Default Props

```typescript
{
  variant: 'primary',
  size: 'medium',
  disabled: false,
  type: 'button'
}
```

## Usage Examples

### Basic Button

```typescript
<Button onClick={() => console.log('clicked')}>
  Click Me
</Button>
```

**Expected Behavior**: Renders a medium-sized primary button with text "Click Me". Clicking triggers console log.

### Variant Styles

```typescript
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
```

**Expected Behavior**: Renders three buttons with different visual styles matching variant names.

### Size Variations

```typescript
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>
```

**Expected Behavior**: Renders three buttons with different sizes.

### Form Submit Button

```typescript
<Button type="submit" variant="primary">
  Submit Form
</Button>
```

**Expected Behavior**: Renders a submit button for use within forms.

### Disabled State

```typescript
<Button disabled onClick={() => console.log('should not fire')}>
  Disabled
</Button>
```

**Expected Behavior**: Renders a disabled button. Click handler does not fire. Visual styling indicates disabled state.

### Custom Styling

```typescript
<Button className="custom-class">
  Custom Styled
</Button>
```

**Expected Behavior**: Renders button with additional custom CSS class applied.

## Behavior Contract

### Interactions

| Action                 | Condition                | Expected Result                            |
| ---------------------- | ------------------------ | ------------------------------------------ |
| Click                  | `disabled: false`        | Fires `onClick` handler if provided        |
| Click                  | `disabled: true`         | No action, handler does not fire           |
| Keyboard (Enter/Space) | Focused and not disabled | Fires `onClick` handler                    |
| Keyboard (Tab)         | Any state                | Receives/loses focus (keyboard accessible) |

### Rendering

| Prop State             | Visual Output                           |
| ---------------------- | --------------------------------------- |
| `variant: 'primary'`   | Solid background, high contrast         |
| `variant: 'secondary'` | Alternative solid background            |
| `variant: 'outline'`   | Outlined border, transparent background |
| `size: 'small'`        | Reduced padding and font size           |
| `size: 'medium'`       | Standard padding and font size          |
| `size: 'large'`        | Increased padding and font size         |
| `disabled: true`       | Reduced opacity, cursor not-allowed     |

### Accessibility

- ✅ Semantic `<button>` element used
- ✅ Keyboard accessible (Tab, Enter, Space)
- ✅ Disabled state communicated via `disabled` attribute
- ✅ Focus visible via browser default or custom styles
- ✅ No ARIA required (native button semantics sufficient)

## Type Safety Contract

### Compile-Time Guarantees

```typescript
// ✅ Valid usage
<Button>Text</Button>
<Button variant="primary">Text</Button>

// ❌ Type error: invalid variant
<Button variant="danger">Text</Button>

// ❌ Type error: missing children
<Button />

// ❌ Type error: invalid onClick signature
<Button onClick={(event) => console.log(event)}>Text</Button>
```

### Runtime Behavior

- **Invalid props**: TypeScript prevents at compile time
- **Missing required props**: TypeScript error at compile time
- **Undefined optional props**: Component uses documented defaults

## Implementation Requirements

### Minimal Code Style

```typescript
// ✅ Correct style
export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  type = 'button',
  className = ''
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} btn-${size} ${className}`}
    >
      {children}
    </button>
  )
}

// ❌ Incorrect: Uses semicolons, verbose syntax
export function Button(props: ButtonProps): JSX.Element {
  return (
    <button
      type={props.type || 'button'}
      onClick={props.onClick}
      disabled={props.disabled}
      className={`btn btn-${props.variant} btn-${props.size} ${props.className}`}
    >
      {props.children}
    </button>
  );
}
```

### Required Patterns

- Destructured props in function signature
- Default values inline with destructuring
- No semicolons
- Concise arrow function for simple expressions
- Template literals for className composition
- Early returns for conditional rendering

## Testing Contract (Future)

When testing framework is added, this component MUST have:

### Unit Tests

- ✅ Renders with required props only
- ✅ Renders each variant correctly
- ✅ Renders each size correctly
- ✅ Calls onClick when clicked and not disabled
- ✅ Does not call onClick when disabled
- ✅ Applies custom className correctly
- ✅ Sets correct type attribute

### Accessibility Tests

- ✅ Has valid button role
- ✅ Is keyboard accessible
- ✅ Has visible focus indicator
- ✅ Disabled state properly communicated

## Dependencies

- **React**: ^18.0.0 (core)
- **TypeScript**: ^5.0.0 (type checking)
- No external UI libraries

## Change Policy

### Breaking Changes

Changes requiring major version bump:

- Removing or renaming props
- Changing prop type definitions
- Changing default values
- Removing variant/size options

### Non-Breaking Changes

Changes allowed without version bump:

- Adding new optional props
- Adding new variant/size options
- Internal implementation changes (same output)
- Styling updates (same structure)

## Related Contracts

- [Header](./header-contract.md) - Uses Button for navigation
- [Footer](./footer-contract.md) - May use Button for actions (future)
