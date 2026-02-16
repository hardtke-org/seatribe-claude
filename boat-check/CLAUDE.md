# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Vite dev server at http://localhost:5173
npm run build    # TypeScript check (tsc -b) + Vite production build
npm run lint     # ESLint
npm run preview  # Preview production build
```

## Architecture

Single-page React app (Vite + TypeScript + Tailwind v4) for a boat handover checklist. German UI. Zero backend — all data lives in `localStorage`.

### Data Flow

`useStore.ts` implements a custom store using `useSyncExternalStore`. It hydrates from localStorage (key `boat-check-data`) on mount, falling back to seed data. Every mutation calls `saveData()` → `emit()` to persist and notify subscribers.

```
App.tsx (filter/search/grouping, import/export/reset)
├── TaskCard.tsx (swipe gestures via Pointer Events, inline note editing)
└── ProgressBar.tsx (color-coded % bar, excludes skipped tasks)
```

### State Model

- **Cluster**: `{ id, title, order }` — 4 fixed groups
- **Task**: `{ id, clusterId, title, note?, status: 'open'|'done'|'skip', order }` — 80 seed items
- `seed.ts` contains all initial data; `types.ts` has the TypeScript interfaces

### Key Patterns

- **Swipe gestures**: `TaskCard` uses `pointerdown/move/up` with `setPointerCapture`, direction locking after 10px, 80px threshold. Left swipe = done, right = skip.
- **Filtering**: `App.tsx` uses `useMemo` for filtered/grouped task lists derived from store state.
- **Persistence**: Immediate save on every status/note change. Import validates `clusters` + `tasks` arrays. Reset uses `structuredClone(seed)`.

## Conventions

- All UI text is in German
- Tailwind v4 via `@tailwindcss/vite` plugin (no `tailwind.config` file — uses `@import "tailwindcss"` in CSS)
- Mobile-first responsive: `grid-cols-1 sm:grid-cols-2`
- No external state library — the custom `useSyncExternalStore` hook is intentional for minimal dependencies
