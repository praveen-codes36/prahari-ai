# frontend/

This is the React (Vite) + Tailwind CSS dashboard — the map, stats cards,
report list, login/register pages, and alert system.

## What goes here

- `src/App.jsx`, `src/main.jsx`, `src/index.css`, `src/App.css`
- Any additional components split out of `App.jsx` as the app grows
- `package.json`, `vite.config.js` (created automatically by Vite)

## Setup

```bash
npm install
npm install lucide-react
npm run dev
```

## Notes

- Uses Tailwind v4 (`@import "tailwindcss";` in `index.css`) — make sure
  `@tailwindcss/vite` is in `vite.config.js` plugins.
- Copy `.env.example` from the repo root into this folder as `.env` if you
  need `VITE_API_BASE_URL` to point at the backend.
