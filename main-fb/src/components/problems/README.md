# Problems Page Components

This directory contains all the components for the problems page, which recreates a LeetCode-like interface.

## Components

### `ProblemsPage.tsx`
The main container component that orchestrates the entire problems page layout. It includes:
- Responsive layout with left sidebar, main content, and right sidebar
- Toggleable sidebar with smooth animations
- Mobile menu functionality
- State management for topic selection and search
- Keyboard shortcuts (Ctrl+B to toggle sidebar)

### `Sidebar.tsx`
Left sidebar component with:
- Library navigation (Library, Study Plan)
- My Lists section with expandable functionality
- Favorite list with lock icon

### `FeaturedCourses.tsx`
Displays featured courses/challenges with:
- Gradient cards for different course types
- "Start Learning" buttons
- Responsive grid layout

### `TopicFilters.tsx`
Handles filtering and search functionality:
- Topic tags (Array, String, Hash Table, etc.)
- Filter buttons (All Topics, Algorithms, Database, etc.)
- Search input with progress indicator
- Sort functionality

### `ProblemList.tsx`
Displays the list of coding problems with:
- Problem number and title
- Success rate percentage
- Difficulty level (Easy, Medium, Hard)
- Progress bars
- Solved status indicators

### `RightSidebar.tsx`
Right sidebar with additional features:
- Calendar/Challenge progress
- Weekly Premium section
- Redeem functionality
- Trending Companies list

## Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Toggleable Sidebar**: Desktop sidebar can be hidden/shown with smooth animations
- **Keyboard Shortcuts**: Ctrl+B to toggle sidebar
- **Dark/Light Theme Support**: Uses shadcn/ui theme system
- **Interactive Elements**: Hover effects, transitions, and animations
- **Modular Architecture**: Each component is self-contained and reusable
- **TypeScript Support**: Full type safety throughout

## Usage

The problems page is accessible at `/problems` and includes:
- Navigation through the main navbar
- Mobile-friendly sidebar navigation
- Search and filtering capabilities
- Progress tracking
- Company-specific problem lists

## Styling

All components use Tailwind CSS classes and follow the shadcn/ui design system with:
- Consistent spacing and typography
- Proper color scheme support
- Responsive breakpoints
- Accessibility considerations 