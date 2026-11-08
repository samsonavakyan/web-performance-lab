# Web Performance Lab

MarketLab is a fake trading terminal for practicing performance work in Chrome DevTools. React + TypeScript on the frontend, Fastify with a WebSocket quote stream on the backend. All data is generated locally.

## Requirements

- Node.js 20.19+ (22 recommended)
- npm 10+
- Chrome

## Run

```bash
npm ci
npm run dev
```

Open http://localhost:5173. Vite serves the frontend and proxies `/api` and `/ws` to the API on port 8787.

You can also start the two parts separately:

```bash
npm run dev:api
npm run dev:web
```

## Exercises

The Performance Lab panel has six basic cases and five Advanced Lab cases. Use Basic and Advanced to find a case, then Open case to open it. The current case is highlighted. Baseline/Optimized and experiment settings are in the side panel. Use Back to market to return from an advanced case. Each one switches between `Baseline` and `Optimized`. Record the same interaction in both modes in DevTools → Performance and find out what makes the difference.

Reproduction steps are in [docs/EXERCISES.md](docs/EXERCISES.md). Work on one scenario at a time and keep the rest on Optimized, otherwise the traces get noisy.

On a fast laptop some differences are small. Turn on CPU throttling (4x or 6x) in the Performance panel. Record each case a few times before drawing conclusions.

For a production build with the local API:

```bash
npm run build
npm run preview
```

Open http://localhost:5173. Both dev and preview proxy `/api` and `/ws` to port 8787. All workloads and delays are generated fixtures. Elapsed times depend on the machine and throttling settings.

The Live feed case controls a shared server feed. Simulate sleep and Restart server affect every open tab.

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

Browser checks use an installed Google Chrome:

```bash
npm run test:e2e
```

The runner starts the local app and API if they are not already running. To check the production build, stop the dev server and run:

```bash
npm run build
LAB_PRODUCTION=1 npm run test:e2e
```

To use Playwright Chromium instead, install it with `npx playwright install chromium` and run with `PLAYWRIGHT_CHANNEL=chromium`. Browser checks include real offline network requests. They compare functional results and repeatable interactions; they are not cross-machine performance benchmarks.
