# Web Performance Lab

MarketLab is a local trading-terminal testbed for exploring web performance with Chrome DevTools. It includes a React + TypeScript frontend, a Fastify API, WebSocket updates, and synthetic market data. No real account, trading service, or API key is involved.

## Requirements

- Node.js 20.19+ (Node 22 recommended)
- npm 10+
- Chrome or Chromium

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173. Vite serves the frontend on port 5173 and proxies `/api` and `/ws` to the Fastify server on port 8787.

To start the services separately:

```bash
npm run dev:api
npm run dev:web
```

## Performance exercises

The **Performance Lab** panel contains six scenarios. You can switch each between `Baseline` and `Optimized` and run the same interaction in Chrome DevTools → Performance. The goal is to investigate what happens, compare traces, and explain any difference using evidence.

See [docs/EXERCISES.md](docs/EXERCISES.md) for the tasks. Start with one Baseline scenario at a time; the other scenarios can stay Optimized to make recordings easier to interpret.

Results depend on hardware, browser version and recording conditions. Compare the same interaction several times under similar conditions, and do not treat one trace as a benchmark.

## Project layout

```text
apps/
  api/         Fastify REST and WebSocket server, market fixtures and tests
  web/         React terminal and performance scenarios
scripts/       development runner
docs/          exercises
```

## Checks

```bash
npm run test
npm run typecheck
npm run build
```

All quotes, charts and news are simulated. No database or external market service is required.
