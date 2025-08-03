# Postanos Dark Theme Guide

## Overview

Postanos uses a **dark-only theme** with a deep blue background, white text, and bright orange accent colors. This guide ensures consistency across all components and pages.

## Color Palette

### Primary Colors
- **Background**: `hsl(220 91% 8%)` - Deep dark blue
- **Foreground**: `hsl(0 0% 98%)` - White text
- **Primary**: `hsl(25 95% 60%)` - Bright orange (buttons, CTAs)
- **Secondary**: `hsl(220 65% 25%)` - Medium blue (secondary elements)

### Surface Colors
- **Card**: `hsl(220 84% 12%)` - Slightly lighter blue for cards
- **Muted**: `hsl(220 50% 20%)` - Muted blue backgrounds
- **Border**: `hsl(220 50% 25%)` - Subtle borders

### Text Colors
- **Foreground**: `hsl(0 0% 98%)` - Primary white text
- **Muted Foreground**: `hsl(0 0% 70%)` - Secondary gray text
- **Primary Foreground**: `hsl(220 91% 8%)` - Dark text on orange buttons

## CSS Variables

All colors are defined as CSS variables in `app/globals.css`:

```css
:root {
  --background: 220 91% 8%;
  --foreground: 0 0% 98%;
  --primary: 25 95% 60%;
  --secondary: 220 65% 25%;
  /* ... and more */
}
```

## Tailwind Classes

Use these Tailwind classes for consistent styling:

### Backgrounds
- `bg-background` - Main page background
- `bg-card` - Card/surface background
- `bg-primary` - Orange buttons
- `bg-secondary` - Blue secondary elements

### Text Colors
- `text-foreground` - White text
- `text-muted-foreground` - Gray text
- `text-primary-foreground` - Dark text on orange
- `text-card-foreground` - White text on cards

### Interactive Elements
- `bg-primary hover:bg-accent` - Primary buttons
- `bg-secondary hover:bg-secondary/80` - Secondary buttons
- `border-border` - Consistent borders

## Utility Classes

Use the predefined utility classes from `app/globals.css`:

### Buttons
```jsx
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary Action</button>
<button className="btn-ghost">Ghost Button</button>
```

### Cards
```jsx
<div className="card">
  <div className="card-header">
    <h3>Card Title</h3>
  </div>
  <div className="card-content">
    <p>Card content goes here</p>
  </div>
</div>
```

### Form Elements
```jsx
<input className="input" placeholder="Enter text..." />
<textarea className="textarea" placeholder="Enter description..." />
<label className="form-label">Field Label</label>
```

## Component Guidelines

### 1. Always Use Theme Colors
❌ **Don't use arbitrary colors:**
```jsx
<div className="bg-blue-500 text-white"> // Don't do this
```

✅ **Use theme variables:**
```jsx
<div className="bg-primary text-primary-foreground"> // Do this
```

### 2. Consistent Button Styling
All buttons should use the predefined button classes:

```jsx
// Primary actions (main CTAs)
<button className="btn-primary">Get Started</button>

// Secondary actions
<button className="btn-secondary">Learn More</button>

// Subtle actions
<button className="btn-ghost">Cancel</button>
```

### 3. Card Components
All card-like components should use the card classes:

```jsx
<div className="card">
  <div className="card-header">
    <h3 className="text-card-foreground">Title</h3>
  </div>
  <div className="card-content">
    <p className="text-muted-foreground">Description</p>
  </div>
</div>
```

### 4. Form Styling
All form elements should be consistent:

```jsx
<div className="form-group">
  <label className="form-label">Email Address</label>
  <input type="email" className="input" />
  <p className="form-helper">We'll never share your email</p>
</div>
```

## Page Layout

Use these classes for consistent page structure:

```jsx
export default function MyPage() {
  return (
    <main className="min-h-screen">
      <div className="page-container">
        <header className="page-header">
          <h1 className="page-title">Page Title</h1>
          <p className="page-description">Page description goes here</p>
        </header>
        
        <div className="space-y-8">
          {/* Page content */}
        </div>
      </div>
    </main>
  )
}
```

## Dark Theme Only

**Important**: This app uses a dark theme ONLY. Do not implement light mode toggles or light theme variants. All components should be designed with the assumption that the background is dark blue and text is white.

## Future Development

When creating new components:

1. Always test against the dark blue background
2. Ensure sufficient contrast for accessibility
3. Use the predefined utility classes
4. Maintain the orange + blue color scheme
5. Follow the existing button and card patterns

## Testing

When developing new features, test that:
- Text is readable against dark backgrounds
- Buttons have proper hover states
- Focus states are visible
- All interactive elements use orange/accent colors
- Cards have proper contrast and borders

## Clerk Authentication Styling

The Clerk authentication components have been styled to match the dark theme:

```jsx
// Example from app/(auth)/sign-in/page.tsx
<SignIn 
  appearance={{
    elements: {
      // All text elements forced to white
      headerTitle: "!text-white",
      headerSubtitle: "!text-gray-300",
      formFieldLabel: "!text-white",
      formFieldInput: "!text-white placeholder:!text-gray-400",
      socialButtonsBlockButtonText: "!text-white",
      footerActionText: "!text-gray-300",
      dividerText: "!text-gray-300",
      
      // Orange primary buttons
      formButtonPrimary: "!bg-orange-500 hover:!bg-orange-600",
      
      // Dark theme backgrounds
      card: "bg-card border-border shadow-2xl",
      formFieldInput: "bg-input border-border",
    },
  }}
/>
```

### Global Clerk Overrides

Additional CSS overrides in `app/globals.css` ensure all Clerk text is white:

```css
.cl-headerTitle,
.cl-formFieldLabel,
.cl-dividerText {
  color: white !important;
}
```

## Examples

See `app/page.tsx` for a complete example of how to implement the theme correctly.
See `app/(auth)/sign-in/page.tsx` and `app/(auth)/sign-up/page.tsx` for authentication styling examples.