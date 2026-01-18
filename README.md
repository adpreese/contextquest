# ContextQuest

ContextQuest is scaffolded with Vite, React, TypeScript, Tailwind CSS, and shadcn/ui.

## Getting Started

```bash
npm install
npm run dev
```

## Available Scripts

- `npm run dev` - start the dev server
- `npm run build` - build the production bundle
- `npm run preview` - preview the production build
- `npm run lint` - run ESLint
- `npm run format` - run Prettier

## Project Structure

The `src/` folder is organized to make room for the main sub-systems:

- `src/engine/` - quest engine logic and runtime
- `src/ui/` - application UI components and views
- `src/cli/` - command-line tooling
- `src/shared/` - shared utilities and types

shadcn/ui is configured via `components.json`, and shared utilities live in
`src/lib/utils.ts`.
