# GammaAtlas

**GammaAtlas** is a research‑grade, evidence‑first options surface intelligence system.  It continuously ingests option‑chain snapshots, implied volatility term structures, open‑interest changes, event calendars and spot context to map where dealer positioning may distort the underlying price.  Rather than acting as an options chain browser or a predictive trading signal generator, GammaAtlas classifies situations into hypotheses such as **pin risk**, **squeeze risk**, **volatility crush risk** and **liquidity hazard**.  Each hypothesis is accompanied by a confidence score, assumptions and disconfirming evidence.  A multi‑agent architecture synthesises data into narrative insights, enabling swing traders, options traders and small funds to avoid obvious traps.

## Capability matrix

| Capability | Description |
|---|---|
| **Venue‑agnostic data ingestion** | Providers fetch option‑chain snapshots and event windows from filesystem fixtures.  Interfaces are designed to accept alternative data sources (e.g., premium APIs) without changing business logic. |
| **Structured domain model** | Entities such as `SurfaceSnapshot`, `EventWindow`, `PositioningCluster` and `PositioningRisk` define the lifecycle of data through the pipeline with explicit `UNKNOWN`, `NOT_AVAILABLE`, `LOW_CONFIDENCE`, `MANUAL_REVIEW` and `OK` states. |
| **Multi‑agent analysis** | Specialised agents (surface analyst, event analyst, spot‑context analyst, liquidity sceptic and synthesis lead) transform raw data into hypotheses and evidence. |
| **Risk scoring and classification** | Simple heuristics evaluate gamma pins, call crowding, put protection crowds, volatility crush potential and liquidity holes.  Scores include rule breakdowns, assumptions and disconfirming evidence. |
| **Evidence ledger** | Every derived fact is recorded with a source, timestamp, confidence score, missing‑data reason and suggested next action.  Ledgers are persisted in JSON. |
| **Report generation** | The `reports` package produces human‑readable Markdown reports and machine‑readable JSON files.  A simple dashboard served by Express displays a heatmap of risks and narrative summaries. |
| **Watchlist mode** | Supply 20–50 instrument symbols via the environment variable `GAMMA_WATCHLIST`.  GammaAtlas will return the most distorted surfaces ranked by signal quality and confidence. |
| **Fault tolerance and hostile input handling** | The system validates all input files, rejects malformed data, sanitises unsafe CSV formulas, handles missing fields gracefully and falls back to `NOT_AVAILABLE` state when data cannot be parsed. |
| **Deterministic fixtures and golden outputs** | Sample data in `fixtures/` and expected outputs in `fixtures/golden/` provide reproducible smoke and unit tests. |
| **CLI, API and worker** | A compiled pipeline powers the CLI (via `npm start`), an Express API (`/api/run` and `/api/results`) and a daemon mode worker that refreshes results at intervals. |

## Install and build

GammaAtlas is a monorepo managed with npm workspaces.  Node >= 18 is recommended.

```bash
# clone the repository into a new folder
git clone <your-fork-url> gamma-atlas
cd gamma-atlas

# install dependencies exactly from the lockfile
npm ci

# compile TypeScript to the dist/ folder
npm run build

# run tests
npm test

# run a reproducible end‑to‑end smoke demo with fixtures
npm run smoke

# start the CLI/server (reads watchlist from environment)
GAMMA_WATCHLIST="AAPL,MSFT,SPY" npm start
```

## Commands

| Command | Purpose |
|---|---|
| `npm ci` | Install dependencies from `package-lock.json`. |
| `npm run build` | Compile TypeScript sources (packages, apps, tests) into the `dist/` directory. |
| `npm test` | Run the internal test runner against compiled tests.  See `scripts/test-runner.js` for details. |
| `npm run smoke` | Execute a smoke path using fixtures: compute risks for the watchlist and emit a report and evidence ledger into the `reports/` directory. |
| `npm start` | Start the compiled CLI and HTTP API server.  It processes instruments from the `GAMMA_WATCHLIST` environment variable and listens on the port defined by `PORT` (default `3000`). |
| `npm run clean` | Remove compiled artefacts (`dist/`). |

## API examples

After running `npm start`, the following HTTP endpoints become available:

* `GET /analyse/:symbol` – Analyse a single symbol using the configured data provider and return a JSON object with risks and evidence.
* `GET /watchlist?symbols=AAPL,MSFT` – Analyse a comma‑separated list of symbols and return a run result with risk rankings, evidence and warnings.
* `GET /report/:symbol` – Compute analysis for a single symbol and return a Markdown report.  The report is also saved into the `reports/` directory.
* `GET /health` – Simple health check returning `{ status: 'ok' }`.

## Interpretation guide

GammaAtlas does **not** produce trading signals.  It surfaces **hazards** in the option surface that could distort price or mislead traders.  Each risk classification contains:

* A **hypothesis** (e.g., “high gamma pin risk near 200”).  This is a qualitative description of the hazard.
* A **score** between 0 and 100 representing the strength of the signal based on current data; higher scores indicate greater concern.
* **Assumptions** and **disconfirming evidence**, explaining why the hypothesis may or may not hold.  This helps traders decide whether to act or avoid.
* A **confidence** level reflecting data quality: high confidence if all inputs are present and internally consistent; low confidence if data is stale, missing or contradictory.

## Limitations

* **Simulated data by default:** This early release ships with fixtures only.  Real‑time options data requires integration with a provider such as CBOE, FlashAlpha, ORATS or a brokerage API.  Provider integration is planned but not yet implemented.
* **Heuristic scoring:** The risk scores are based on simple heuristics (e.g., comparing implied to realised volatility, measuring concentration of open interest around spot).  They do **not** predict dealer books precisely.  Use them as directional indicators rather than absolute truths.
* **No execution layer:** GammaAtlas does not place trades or integrate directly with brokerage accounts.  It is purely analytic.  Users remain responsible for any trading decisions.
* **Limited asset classes:** The current data model targets equity options.  Adapting to futures options or crypto options is possible through the venue‑agnostic design but requires additional provider implementations.

## Roadmap

* **Live data connectors:** add providers for real‑time option chain snapshots, implied volatility curves, open‑interest feeds and corporate event calendars via environment‑defined API keys.
* **Extended risk factors:** incorporate vanna, charm, realised skew and cross‑asset positioning metrics once data is available.
* **Backtesting and historical analysis:** allow users to backtest the hazard detection logic on historical chains to calibrate scores and false‑positive rates.
* **Expanded visualisations:** integrate better charts (heatmaps, term‑structure plots) via a lightweight front‑end framework; allow user customisation of watchlists and alert thresholds.
* **Integration with agentic brokers:** produce structured messages suitable for consumption by platforms such as Public.com Agents or AI‑Trader while maintaining user control and compliance.

## Contributing

Contributions are welcome!  Please see `AGENTS.md` for operating rules and `docs/` for architectural guidelines.  All changes must include tests, documentation updates, and pass the CI matrix.  Always mark unknown or missing data rather than guessing, and never claim correctness without evidence.
