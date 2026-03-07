# Design System Guide - Faculty Achievement Tracking System

**Version:** 1.0  
**Last Updated:** March 7, 2026

---

## Overview

This document defines the unified design system for the Faculty Achievement Tracking System. All UI components, colors, typography, and spacing should follow these guidelines to ensure consistency across the application.

### Design Philosophy
- **Inspired by:** IndiGo Airlines (Professional, Clean, Modern)
- **Approach:** Utility-first CSS with Tailwind + reusable component classes
- **Tool:** Tailwind CSS with custom CSS variables for theming

---

## Color Palette

### Primary Colors (Brand Identity)

| Color Name | Hex Value | Usage | Tailwind Class |
|-----------|-----------|-------|-----------------|
| Navy Deep | `#0b1b5e` | Primary brand color, main buttons | `bg-slate-900`, primary buttons |
| Navy Medium | `#1e3a8a` | Secondary actions | `bg-blue-900` |
| Blue Royal | `#2563eb` | Link text, accents | `text-blue-700` |
| Blue Bright | `#3b82f6` | Interactive elements, hover states | `bg-blue-600`, focus rings |

### Semantic Colors

| State | Color | Hex | Tailwind Class |
|-------|-------|-----|-----------------|
| Success | Emerald | `#10b981` | `bg-emerald-600`, `text-emerald-700` |
| Warning | Amber | `#f59e0b` | `bg-amber-600`, `text-amber-700` |
| Danger | Red | `#ef4444` | `bg-red-600`, `text-red-700` |
| Info | Blue | `#3b82f6` | `bg-blue-600`, `text-blue-700` |

### Neutral Colors (Grays)

| Usage | Color | Hex | Tailwind Class |
|-------|-------|-----|-----------------|
| Lightest | Gray Light | `#f8fafc` | `bg-slate-50` |
| Light | Gray Lighter | `#f1f5f9` | `bg-slate-100` |
| Border | Gray Border | `#e2e8f0` | `border-slate-200` |
| Medium | Gray Medium | `#64748b` | `text-slate-500` |
| Dark | Gray Dark | `#475569` | `text-slate-600` |
| Darkest | Dark | `#0f172a` | `text-slate-900` |

---

## Typography

### Font Family
- **Body Text:** Inter (Google Fonts) - Default system font
- **Code/Monospace:** JetBrains Mono - For technical content

### Font Sizes & Hierarchy

```css
h1 { @apply text-3xl font-semibold tracking-tight; }  /* Page titles */
h2 { @apply text-2xl font-semibold tracking-tight; }  /* Section headers */
h3 { @apply text-xl font-semibold tracking-tight; }   /* Subsection headers */
h4 { @apply text-lg font-semibold tracking-tight; }   /* Card titles */

body { font-size: 1rem (16px); }                        /* Regular text */
.text-sm { font-size: 0.875rem (14px); }              /* Labels, captions */
.text-xs { font-size: 0.75rem (12px); }               /* Small text */
```

### Font Weights
- `font-normal` (400) - Body text, regular content
- `font-medium` (500) - Labels, buttons
- `font-semibold` (600) - Section headers, important text
- `font-bold` (700) - Page titles, emphasized text

---

## Component Styles

### Reusable CSS Classes

All reusable component classes are defined in `app/globals.css` under the `@layer components` section.

#### Form Elements

**`.form-section-primary`** - Container for main form sections
```tsx
<div className="form-section-primary">
  {/* Content */}
</div>
// Output: Blue background with border, padding, and spacing
```

**`.form-label`** - Form input labels
```tsx
<label className="form-label">Label Text *</label>
// Output: Small bold text in slate-700 with margin
```

**`.form-input`** - Text inputs, date inputs
```tsx
<input className="form-input" type="text" />
// Output: Full-width input with blue focus ring
```

**`.form-select`** - Select dropdowns
```tsx
<select className="form-select">
  <option>Option</option>
</select>
// Output: Full-width select with blue focus ring
```

**`.form-textarea`** - Multi-line text areas
```tsx
<textarea className="form-textarea"></textarea>
// Output: Resizable textarea with blue focus ring
```

#### Buttons

**`.btn-primary`** - Main action buttons
```tsx
<button className="btn-primary">Click me</button>
// Output: Blue background with white text
```

**`.btn-secondary`** - Secondary action buttons
```tsx
<button className="btn-secondary">Cancel</button>
// Output: Gray background
```

**`.btn-danger`** - Delete/destructive actions
```tsx
<button className="btn-danger">Delete</button>
// Output: Red background
```

**`.btn-success`** - Confirmation/positive actions
```tsx
<button className="btn-success">Approve</button>
// Output: Green background
```

#### Cards & Containers

**`.card`** - Basic card component
```tsx
<div className="card">
  {/* Content */}
</div>
// Output: White card with subtle border and padding
```

**`.card-lg`** - Large card component
```tsx
<div className="card-lg">
  {/* Content */}
</div>
// Output: White card with more padding, used for major sections
```

**`.stat-card`** - Statistics/metric card
```tsx
<div className="stat-card">
  {/* Metric content */}
</div>
```

#### File Upload

**`.file-upload-area`** - Drag-and-drop file upload zones
```tsx
<label className="file-upload-area">
  {/* Icon and text */}
</label>
// Output: Dashed border, blue hover state
```

#### Alerts

**`.alert-info`** - Information alerts
```tsx
<div className="alert-info">
  Information message
</div>
```

**`.alert-success`** - Success messages
```tsx
<div className="alert-success">
  Success message
</div>
```

**`.alert-warning`** - Warning messages
```tsx
<div className="alert-warning">
  Warning message
</div>
```

**`.alert-danger`** - Error messages
```tsx
<div className="alert-danger">
  Error message
</div>
```

#### Badges

**`.badge-primary`** - Primary badge
```tsx
<span className="badge-primary">Badge Text</span>
```

**`.badge-success`** - Success badge
```tsx
<span className="badge-success">Approved</span>
```

**`.badge-warning`** - Warning badge
```tsx
<span className="badge-warning">Pending</span>
```

**`.badge-danger`** - Danger badge
```tsx
<span className="badge-danger">Rejected</span>
```

#### Dividers

**`.divider`** - Standard divider line
```tsx
<div className="divider"></div>
```

**`.divider-primary`** - Primary colored divider
```tsx
<div className="divider-primary"></div>
```

---

## Spacing System

Tailwind uses a consistent 4px spacing unit (1 = 4px).

### Common Spacing Values
- `p-2` = 8px padding
- `p-3` = 12px padding
- `p-4` = 16px padding ← **Standard**
- `p-5` = 20px padding
- `p-6` = 24px padding ← **Large sections**
- `gap-2` = 8px gap (use for small spacing)
- `gap-4` = 16px gap ← **Standard**

### Margins
- `mb-2` = 8px bottom margin
- `mb-3` = 12px bottom margin
- `mb-4` = 16px bottom margin ← **Standard**
- `mt-4` = 16px top margin

---

## Border Radius

| Size | Value | Usage |
|------|-------|-------|
| `rounded-lg` | 0.5rem (8px) | Inputs, buttons, small cards |
| `rounded-xl` | 0.75rem (12px) | Large cards, sections |
| `rounded-full` | 9999px | Badges, pills, avatars |

---

## Forms - Best Practices

### Complete Form Section Example

```tsx
<div className="form-section-primary">
  <h3 className="font-semibold text-slate-800">Section Title</h3>
  
  {/* Single input field */}
  <div>
    <label className="form-label">Field Label *</label>
    <input 
      type="text" 
      className="form-input"
      placeholder="Placeholder text"
    />
  </div>

  {/* Two-column layout */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div>
      <label className="form-label">Label 1 *</label>
      <input className="form-input" type="text" />
    </div>
    <div>
      <label className="form-label">Label 2 *</label>
      <select className="form-select">
        <option>Option 1</option>
        <option>Option 2</option>
      </select>
    </div>
  </div>

  {/* Text area */}
  <div>
    <label className="form-label">Description</label>
    <textarea className="form-textarea" rows={3}></textarea>
  </div>
</div>
```

### File Upload Example

```tsx
<div>
  <label className="form-label">Upload Document *</label>
  <input 
    type="file" 
    id="file-input"
    className="hidden"
    accept=".pdf,.doc,.docx"
  />
  <label htmlFor="file-input" className="file-upload-area">
    {preview ? (
      <div className="text-center">
        <p className="text-sm text-slate-600">{fileName}</p>
        <p className="text-xs text-slate-500 mt-1">Click to change</p>
      </div>
    ) : (
      <div className="text-center">
        <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
        <p className="text-sm font-medium text-slate-600">Choose File</p>
        <p className="text-xs text-slate-500 mt-1">Drop file or click to choose</p>
      </div>
    )}
  </label>
</div>
```

---

## Responsive Design

### Breakpoints
- `sm` (640px) - Tablets
- `md` (768px) - Small laptops
- `lg` (1024px) - Desktops
- `xl` (1280px) - Large screens

### Grid Examples
```tsx
// Stack on mobile, 2 columns on tablet, 3 on desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## DO's and DON'Ts

### ✅ DO

- Use the component classes from `globals.css`
- Use Tailwind's utility classes for spacing, sizing, positioning
- Use semantic colors for their intended purpose (success, danger, warning)
- Keep focus rings consistent (`focus:ring-2 focus:ring-blue-500`)
- Use the defined typography hierarchy for headings
- Test on mobile (sm), tablet (md), and desktop (lg) breakpoints

### ❌ DON'T

- Don't hardcode colors outside the defined palette
- Don't create custom inline styles for common components
- Don't use multiple different hover/focus styles
- Don't add new color variants without updating this guide
- Don't use different button styles for the same action type
- Don't ignore responsive design - test all breakpoints

---

## CSS Variables (Advanced)

For theme customization, edit CSS variables in `app/globals.css`:

```css
:root {
  --primary: #0b1b5e;
  --accent: #3b82f6;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;
}
```

---

## Examples by Feature

### Submit Form Page
- Use `.form-section-primary` for each form section
- Use `.form-label`, `.form-input`, `.form-select` for fields
- Use `.btn-primary` for submit button
- Use `.file-upload-area` for document uploads

### Dashboard
- Use `.stat-card` for KPI metrics
- Use `.card-lg` for chart containers
- Use `.badge-*` for status indicators

### Verification Queue
- Use `.alert-warning` for pending items
- Use `.alert-success` for approved items
- Use `.badge-danger` for rejected items
- Use `.btn-primary` and `.btn-secondary` for actions

---

## Maintenance

To update the design system:
1. Modify CSS variables in `app/globals.css`
2. Update component classes under `@layer components`
3. Update this document with changes
4. Test all pages to ensure consistency
5. Commit changes with `design-system:` prefix

---

## Questions?

Refer to:
- **Tailwind CSS Docs:** https://tailwindcss.com/docs
- **Color System:** See color palette section above
- **Component Classes:** See `app/globals.css` → `@layer components`
