# Hinakko Style Expense Web App

## Goal
Build a fast, mobile-first PWA expense tracker inspired by Hinakko Expense UI.

## Tech Stack
- TanStack Start
- React
- TypeScript
- Tailwind CSS
- Drizzle ORM
- SQLite for local dev
- Turso/PostgreSQL-ready database layer
- PWA support
- Zod for validation
- Zustand or TanStack Store for client state
- Recharts for charts

## Core Features
1. Daily expense list
2. Monthly summary
3. Income / Expense tracking
4. Categories
5. Cash / Credit / Installment payment type
6. Calendar view
7. Category summary
8. Add / edit / delete transaction
9. Search and filter
10. Offline-first behavior
11. Responsive mobile UI
12. App-like bottom navigation

## UI Direction
Design should feel like a cute finance mobile app:
- Mint green header
- Soft coral bottom navigation
- Rounded cards
- Compact transaction rows
- Emoji/category icons
- Daily grouped list
- Monthly balance at top
- iPhone-like layout
- Smooth micro interactions
- Very fast loading

## Pages
- `/` Dashboard / Daily transactions
- `/add` Add transaction
- `/calendar` Calendar view
- `/categories` Category summary
- `/settings` App settings

## Database Models
### transactions
- id
- type: income | expense
- title
- amount
- category_id
- payment_method: cash | credit | installment
- transaction_date
- note
- created_at
- updated_at

### categories
- id
- name
- icon
- color
- type

### accounts
- id
- name
- balance
- type

## Requirements
- Use TypeScript strictly
- Use reusable components
- Do not create over-engineered architecture
- Prioritize performance
- Use mobile-first layout
- Keep code clean and production-ready

## PWA Documentation

See [docs/pwa.md](./docs/pwa.md) for the service worker build pipeline and [docs/pwa-checklist.md](./docs/pwa-checklist.md) for pre-deploy smoke tests.