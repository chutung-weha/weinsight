---
paths:
  - "src/**/*"
  - "**/*.ts"
  - "**/*.tsx"
---

# Code Conventions

## Code Style

- Use TypeScript strict mode
- Functional components with hooks only
- Server Components by default, Client Components only when needed
- Use `cn()` utility (clsx + tailwind-merge) for conditional classes
- Vietnamese content in components (with diacritics), English for code/comments
- File naming: kebab-case for files, PascalCase for components

## Folder Structure

```
src/
  app/
    (public)/          # Public pages layout
    (auth)/            # Auth pages layout
    (candidate)/       # Candidate portal layout
    admin/             # Admin dashboard layout
    api/               # API routes
  components/
    ui/                # Reusable UI components (Button, Card, Input, etc.)
    layout/            # Header, Footer, Sidebar
    jobs/              # Job-related components
    cv/                # CV upload and display components
    ai/                # AI results display components
  lib/
    prisma.ts          # Prisma client
    auth.ts            # Auth config
    ai/                # AI analysis modules
    utils.ts           # Utility functions
  types/               # TypeScript type definitions
```

## Key Conventions

- All API responses follow `{ success: boolean, data?: T, error?: string }` format
- Use Zod for form and API validation
- Use React Hook Form for forms
- Loading states with skeleton components
- Error boundaries for graceful error handling
- SEO meta tags on all public pages (Vietnamese)
