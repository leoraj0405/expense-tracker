# Expense Tracker Client (Next.js)

## Scripts

- `npm run dev` — start development server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — run production server

## Environment

```env
NEXT_PUBLIC_API_URL=http://localhost:1000
```

## Project structure

```
client/
├── app/              # Next.js App Router (route entry points)
├── views/            # Page-level UI components (one per screen)
├── components/       # Reusable UI (PageHero, Panel, charts, etc.)
├── layouts/          # AppShell, Auth, Parent shells
├── hooks/            # useAuth, useRequireAuth, useAppTheme, useQueryParams
├── services/         # API clients (user, expense, group, …)
├── types/            # TypeScript domain & API types
├── utils/            # authStorage, date, format, breadcrumbs, entity
├── styles/           # et-theme.css design system
└── theme.ts          # Mantine theme config
```

Each route in `app/` is a thin wrapper that exports a view from `views/`, e.g. `app/login/page.tsx` → `@/views/Login`.

## Notes

- Auth uses `localStorage` (client-only); pages are statically generated with client hydration.
- The legacy CRA `src/` folder can be removed once you confirm everything works.
