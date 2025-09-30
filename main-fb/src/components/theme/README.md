# Theme Components

This directory contains theme management components for the DeepDSA application.

## Components

### ThemeProvider
The main theme provider that manages theme state and provides context to child components.

```tsx
import { ThemeProvider } from '@/components/theme'

export default function Layout() {
  return (
    <ThemeProvider>
      {/* Your app content */}
    </ThemeProvider>
  )
}
```

### ThemeToggle
A dropdown theme toggle component with three options: Light, Dark, and System.

```tsx
import { ThemeToggle } from '@/components/theme'

<ThemeToggle />
```

### SimpleThemeToggle
A simple button that cycles through light → dark → system themes.

```tsx
import { SimpleThemeToggle } from '@/components/theme'

<SimpleThemeToggle />
```

### useTheme Hook
A hook to access theme state and setter function.

```tsx
import { useTheme } from '@/components/theme'

function MyComponent() {
  const { theme, setTheme } = useTheme()
  
  return (
    <div>
      Current theme: {theme}
      <button onClick={() => setTheme('dark')}>
        Set to Dark
      </button>
    </div>
  )
}
```

## Features

- **Three Theme Options**: Light, Dark, and System (follows OS preference)
- **Persistent Storage**: Theme choice is saved to localStorage
- **System Theme Detection**: Automatically detects and applies system theme preference
- **Smooth Transitions**: CSS transitions for theme changes
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Usage

### Basic Setup
1. Wrap your app with `ThemeProvider`
2. Add `ThemeToggle` or `SimpleThemeToggle` to your navbar
3. The theme will automatically persist across sessions

### Customization
You can customize the theme icons by modifying the emoji in the toggle components:

```tsx
// In ThemeToggle.tsx or SimpleThemeToggle.tsx
const themes = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'System', icon: '💻' },
]
```

### CSS Variables
The theme system uses CSS variables defined in `globals.css`. You can customize colors by modifying these variables:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* ... other variables */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... other variables */
}
``` 