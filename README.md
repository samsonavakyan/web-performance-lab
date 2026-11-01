# Web Performance Lab

MarketLab is a fake trading terminal for practicing performance work in Chrome DevTools. React + TypeScript on the frontend, Fastify with a WebSocket quote stream on the backend. All data is generated locally.

## Requirements

- Node.js 20.19+ (22 recommended)
- npm 10+
- Chrome

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173. Vite serves the frontend and proxies `/api` and `/ws` to the API on port 8787.

You can also start the two parts separately:

```bash
npm run dev:api
npm run dev:web
```

## Exercises

The Performance Lab panel on the right has six scenarios. Each one switches between `Baseline` and `Optimized`. Record the same interaction in both modes in DevTools → Performance and find out what makes the difference.

Tasks are in [docs/EXERCISES.md](docs/EXERCISES.md). Work on one scenario at a time and keep the rest on Optimized, otherwise the traces get noisy.

On a fast laptop some differences are small. Turn on CPU throttling (4x or 6x) in the Performance panel. Record each case a few times before drawing conclusions.

## Layout

```text
apps/api/   Fastify server, data generators, tests
apps/web/   React app
scripts/    dev runner
docs/       exercises
```

## Checks

```bash
npm run test
npm run typecheck
npm run build
```
