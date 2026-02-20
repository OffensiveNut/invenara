# Invenara - Electrical Component Inventory Management

A modern, production-ready inventory management system for electrical components, built with React, TypeScript, and Bun.

## Features

- **Component Management**: Track and manage electrical components with detailed specifications
- **Real-time Search & Filtering**: Quickly find components with advanced search
- **Stock Management**: Monitor stock levels with low-stock alerts
- **BOM/Picking Lists**: Create and manage bill of materials for projects
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode**: Built-in light and dark theme support

## Tech Stack

- **Runtime**: Bun
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed on your system

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun dev

# Build for production
bun build

# Preview production build
bun preview
```

## Project Structure

```
src/
├── components/        # Reusable UI components
│   ├── ui/           # Base UI components (buttons, inputs, etc.)
│   ├── Header.tsx
│   └── StateComponents.tsx
├── pages/            # Page components
│   ├── InventoryPage.tsx
│   ├── ComponentDetailPage.tsx
│   ├── PickingPage.tsx
│   └── SettingsPage.tsx
├── services/         # API and data services
│   └── api.ts
├── hooks/            # Custom React hooks
│   └── useApi.ts
├── types/            # TypeScript type definitions
│   └── index.ts
├── lib/              # Utility functions
│   └── utils.ts
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## Key Improvements from Original

### Architecture
- ✅ Organized code into clear separation of concerns (pages, components, services, types)
- ✅ Removed Figma-specific code and dependencies
- ✅ Proper TypeScript typing throughout the application

### Data Management
- ✅ Abstracted API calls into a service layer
- ✅ Custom hooks for data fetching with loading/error states
- ✅ Real async patterns (simulated with delays for demo)

### Navigation
- ✅ Implemented React Router for proper client-side routing
- ✅ Removed fake view switching logic

### User Experience
- ✅ Added loading states for async operations
- ✅ Added empty states with helpful CTAs
- ✅ Added error states with retry functionality
- ✅ Improved form validation and feedback

### Code Quality
- ✅ Responsive Flexbox/Grid layouts (no fixed pixel values)
- ✅ Semantic HTML elements
- ✅ ARIA labels for accessibility
- ✅ Consistent component patterns
- ✅ Reduced nesting and simplified logic

### Styling
- ✅ Tailwind CSS with design tokens
- ✅ Responsive breakpoints
- ✅ Dark mode support
- ✅ Consistent spacing and typography

## Database Schema

The application includes a complete PostgreSQL/Supabase schema (`schema.sql`) with:
- Components table with specifications
- Picking lists and history
- Stock transaction tracking
- Row-level security policies
- Helpful views and functions

## Development

The application uses mock data by default. To connect to a real backend:

1. Create a `.env` file with your API endpoint:
   ```
   VITE_API_URL=https://your-api-endpoint.com
   ```

2. Update the API service in `src/services/api.ts` to make real HTTP calls

## Scripts

- `bun dev` - Start development server
- `bun build` - Build for production
- `bun preview` - Preview production build
- `bun lint` - Run ESLint (when configured)

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

## License

MIT
