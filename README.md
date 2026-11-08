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

The Performance Lab panel lists six Basic and five Advanced cases. Each case has a Baseline and an Optimized mode. Pick a case, record the same interaction in both modes in DevTools and compare.

Steps for each case are in [docs/EXERCISES.md](docs/EXERCISES.md). Test one case at a time and keep the others on Optimized, otherwise the traces get noisy.

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

To use Playwright Chromium instead, install it with `npx playwright install chromium` and run with `PLAYWRIGHT_CHANNEL=chromium`. These checks verify behavior in both modes. They do not measure performance across machines.
