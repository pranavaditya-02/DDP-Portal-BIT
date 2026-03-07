# Modern Components Quick Reference

## Component APIs at a Glance

### ModernCard
```tsx
<ModernCard 
  variant="default" | "glass" | "gradient" | "neumorphic"
  hover={true}           // Auto hover-lift effect
  animated={true}        // Auto fadeInUp animation
  onClick={() => {}}
>
  {children}
</ModernCard>
```

**Variants:**
- `default` - card-modern (subtle shadow)
- `glass` - Glassmorphic card
- `gradient` - bg-gradient-brand
- `neumorphic` - Soft extruded effect

---

### ModernStatCard
```tsx
<ModernStatCard
  label="Total Users"
  value={1234}
  unit="active"                // Optional suffix
  trend={15}                   // % change (positive/negative)
  trendLabel="from last month" // Optional context
  color="blue" | "emerald" | "amber" | "rose" | "purple"
  variant="default" | "glass" | "gradient"
  icon={<IconComponent />}     // Optional icon
  description="20 new this week" // Optional description
/>
```

**Color Variants:** blue, emerald, amber, rose, purple

---

### ModernButton
```tsx
<ModernButton
  variant="primary" | "secondary" | "ghost" | "glass" | "outline" | "danger"
  size="sm" | "md" | "lg" | "xl"
  icon={<IconComponent />}
  iconPosition="left" | "right"
  loading={false}        // Shows spinner
  fullWidth={false}
  disabled={false}
  onClick={() => {}}
>
  Click Me
</ModernButton>
```

**Size Mapping:**
- `sm` - 12px, 1.5px padding
- `md` - 14px, 2.5px padding
- `lg` - 16px, 3px padding
- `xl` - 18px, 4px padding

**Variants:**
- `primary` - Gradient brand (blue→purple)
- `secondary` - Slate colors
- `ghost` - Transparent background
- `glass` - Glassmorphic
- `outline` - Blue border
- `danger` - Rose gradient

---

### ModernSectionHeader
```tsx
<ModernSectionHeader
  title="Section Title"
  description="Optional subtitle text"
  icon={<IconComponent />}     // Optional icon with gradient bg
  action={<ModernButton />}    // Optional action on right
/>
```

---

### ModernGrid
```tsx
<ModernGrid 
  columns={1 | 2 | 3 | 4}
  gap="sm" | "md" | "lg" | "xl"
>
  {/* Grid items */}
</ModernGrid>
```

**Responsive Behavior:**
- `columns={1}` - Single column all sizes
- `columns={2}` - 1 col on mobile, 2 on sm+
- `columns={3}` - 1 col on mobile, 2 on md, 3 on lg
- `columns={4}` - 1 col on mobile, 2 on sm, 4 on lg

**Gap Mapping:**
- `sm` - gap-3 (12px)
- `md` - gap-4 (16px)
- `lg` - gap-6 (24px)
- `xl` - gap-8 (32px)

---

### ModernGlassPanel
```tsx
<ModernGlassPanel
  title="Panel Title"          // Optional header
  description="Subtitle"       // Optional description
  icon={<IconComponent />}     // Optional icon
  className="additional classes"
>
  {children}
</ModernGlassPanel>
```

---

### ModernHero
```tsx
<ModernHero
  // Pre-configured full-screen hero section
  // Includes animated background, feature list, CTA buttons, stats
  // Used for landing pages and major sections
/>
```

**Features:**
- Animated floating background meshes
- Headline with gradient highlight
- Features list with icons
- CTA buttons (primary + secondary)
- Stats grid
- Right-side dashboard preview mockup

---

## Animation Classes (CSS)

```css
/* Entrance Animations */
.animate-fadeInUp      /* Fade in + slide up */
.animate-fadeInDown    /* Fade in + slide down */
.animate-slideInRight  /* Slide in from left */
.animate-slideInLeft   /* Slide in from right */
.animate-scaleIn       /* Scale from center */

/* Continuous Animations */
.animate-float         /* Gentle bobbing */
.animate-glow          /* Pulsing brightness */
.animate-pulse-soft    /* Soft opacity pulse */

/* Utility Classes */
.hover-lift            /* Transform: translateY(-4px) on hover */
.hover-scale           /* Transform: scale(1.02) on hover */
.hover-brightness      /* Filter: brightness(1.1) on hover */
```

**Adding Animation Delays:**
```tsx
<div 
  className="animate-fadeInUp"
  style={{ animationDelay: '200ms' }}
>
  Content
</div>
```

---

## CSS Utility Classes (globals.css)

### Glass Effects
```css
.glass               /* Light glass effect */
.glass-dark          /* Dark glass effect */
```

### Neumorphism
```css
.neumorphic          /* Light neumorphic */
.neumorphic-dark     /* Dark neumorphic */
```

### Cards
```css
.card-modern         /* Standard modern card */
.card-modern-glass   /* Glass variant card */
```

### Buttons
```css
.btn-gradient        /* Primary gradient button */
.btn-gradient-ghost  /* Ghost variant button */
.btn-modern          /* Standard modern button */
```

### Forms
```css
.input-modern        /* Standard input field */
.input-modern-glass  /* Glass variant input */
```

### Badges & Tags
```css
.badge-soft-blue
.badge-soft-green
.badge-soft-amber
.badge-soft-rose
.badge-soft-purple
```

### Dividers
```css
.divider-gradient    /* Gradient divider line */
```

### Hover Effects
```css
.hover-lift          /* Lift on hover */
.hover-scale         /* Scale on hover */
.hover-brightness    /* Brightness on hover */
```

---

## Color Tokens

### Semantic Colors
```
--color-primary: #3b82f6      (Blue)
--color-secondary: #64748b    (Slate)
--color-success: #10b981      (Emerald)
--color-warning: #f59e0b      (Amber)
--color-danger: #f43f5e       (Rose)
--color-brand: #7366bd        (Purple)

/* Dark Mode */
--color-primary-dark: #1e40af
--color-bg-dark: #0f172a
--color-surface-dark: #1e293b
```

### Glass Colors
```
--glass-light: rgba(255, 255, 255, 0.7)
--glass-dark: rgba(15, 23, 42, 0.6)
--glass-border-light: rgba(226, 232, 240, 0.25)
--glass-border-dark: rgba(71, 85, 105, 0.25)
```

### Shadow Tokens
```
--shadow-xs: 0 1px 2px rgba(0,0,0,0.05)
--shadow-sm: 0 1px 3px rgba(0,0,0,0.1)
--shadow-md: 0 4px 6px rgba(0,0,0,0.1)
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1)
--shadow-xl: 0 20px 25px rgba(0,0,0,0.1)
--shadow-2xl: 0 25px 50px rgba(0,0,0,0.1)
```

---

## Real-World Examples

### Dashboard KPI Section
```tsx
import { 
  ModernSectionHeader, 
  ModernStatCard, 
  ModernGrid 
} from '@/components/modern'
import { TrendingUp, Users, Award, Zap } from 'lucide-react'

export function Dashboard() {
  return (
    <div className="space-y-8">
      <ModernSectionHeader 
        title="Performance Overview"
        description="Your achievement metrics at a glance"
        icon={TrendingUp}
      />
      
      <ModernGrid columns={3} gap="lg">
        <ModernStatCard
          label="Total Achievements"
          value={42}
          trend={12}
          color="blue"
          icon={Award}
        />
        <ModernStatCard
          label="Users"
          value={128}
          trend={5}
          trendLabel="new this week"
          color="emerald"
          icon={Users}
        />
        <ModernStatCard
          label="Engagement"
          value={87}
          unit="%"
          trend={-3}
          color="amber"
          icon={Zap}
        />
      </ModernGrid>
    </div>
  )
}
```

### Hero Section with CTA
```tsx
import { ModernHero } from '@/components/modern'

export function LandingPage() {
  return <ModernHero />
}
```

### Form with Modern Components
```tsx
import { ModernButton, ModernCard } from '@/components/modern'

export function SubmitForm() {
  const [loading, setLoading] = useState(false)
  
  return (
    <ModernCard variant="glass">
      <form className="space-y-4">
        <input 
          type="text" 
          className="input-modern-glass w-full"
          placeholder="Enter text..."
        />
        
        <ModernButton
          variant="primary"
          size="lg"
          loading={loading}
          fullWidth
          onClick={async () => {
            setLoading(true)
            // Submit logic
            setLoading(false)
          }}
        >
          Submit
        </ModernButton>
      </form>
    </ModernCard>
  )
}
```

---

## Dark Mode

All components automatically support dark mode via `dark:` prefix in Tailwind.

To enable dark mode on your page:
```tsx
// In app/layout.tsx
<html className="dark">  {/* Add 'dark' class */}
  {children}
</html>
```

Or use a toggle:
```tsx
const [darkMode, setDarkMode] = useState(true)

return (
  <html className={darkMode ? 'dark' : ''}>
    <button onClick={() => setDarkMode(!darkMode)}>
      Toggle Dark Mode
    </button>
  </html>
)
```

---

## Performance Tips

1. **Animations** - Use CSS transforms only (translateY, scale, rotate)
2. **Lazy Load** - Wrap hero sections with Suspense
3. **Images** - Always use Next.js Image component
4. **Fonts** - Preload Inter from Google Fonts
5. **Blur Effects** - Keep backdrop-blur values reasonable (8px-12px max)
6. **Multiple Animations** - Stagger delays to avoid 60fps drops

---

## Responsive Breakpoints

```
Mobile:  <640px
sm:      ≥640px
md:      ≥768px
lg:      ≥1024px
xl:      ≥1280px
2xl:     ≥1536px
```

---

## File Structure Reference

```
components/
├── modern/
│   ├── ModernCard.tsx           (40 lines)
│   ├── ModernStatCard.tsx       (110 lines)
│   ├── ModernButton.tsx         (95 lines)
│   ├── ModernSectionHeader.tsx  (35 lines)
│   ├── ModernGlassPanel.tsx     (40 lines)
│   ├── ModernGrid.tsx           (30 lines)
│   ├── ModernHero.tsx           (200 lines)
│   └── index.ts                 (barrel export)
├── DashboardShell.tsx
├── Sidebar.tsx
├── Navigation.tsx
├── RoleGuard.tsx
├── charts.tsx
└── ...

app/
├── globals.css                  (400+ lines)
├── layout.tsx
├── page.tsx
├── login/
│   └── page.tsx                 (modern design)
├── dashboard/
│   └── page.tsx                 (ready for components)
└── ...

tailwind.config.ts               (150+ lines)
```

---

## Tips & Best Practices

✅ **DO:**
- Use ModernCard for content grouping
- Use ModernStatCard for metrics
- Use ModernButton for all interactions
- Stack animations with staggered delays
- Test dark mode on all pages
- Use gap utilities in ModernGrid
- Keep padding consistent (16px, 24px, 32px)
- Use semantic color names (primary, success, danger)

❌ **DON'T:**
- Mix old button styles with ModernButton
- Use bare HTML buttons (never matches design)
- Animate without proper delays (causes jank)
- Forget dark: prefix for colors
- Use inline styles over CSS utilities
- Add too many animations (max 3 per component)
- Use custom colors (always use tokens)

---

## Getting Help

Check these files for more details:
- `MODERN_DESIGN_SYSTEM.md` - Comprehensive guide
- Component JSDoc comments - Inline documentation
- `globals.css` - All available utilities
- `tailwind.config.ts` - Theme configuration

---

**Happy Building! 🚀**
