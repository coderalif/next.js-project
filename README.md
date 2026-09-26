# FitLog

FitLog is a responsive workout library and daily planner. Browse exercises, view instructions, and save workouts for today or later.

## Technologies

- Next.js 16 App Router
- React 19 and TypeScript
- FitLog REST API
- Responsive CSS
- LocalStorage

## Features

- Browse and search the workout library by name or muscle group.
- Sort workouts by duration, calories, or rating.
- View API-backed workout details and instructions.
- Add up to five workouts to today's plan or save them for later.
- Track planned exercises, total minutes, and calories.
- Mark workouts as done or remove them.
- Keep the plan and saved list after reloading.
- Use the responsive layout on mobile, tablet, and desktop.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

## Check the project

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Workout data and images are loaded from the FitLog API, so the deployed app needs access to `https://api.api-store.workers.dev/api/fitlog`.
