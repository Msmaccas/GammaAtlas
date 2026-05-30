# Agents and Operational Rules

GammaAtlas decomposes its analysis into a small team of specialised agents.  Each agent consumes structured input and produces structured output that feeds the next stage.  All agents run within the confines of this repository and must comply with the safe‑versus‑YOLO principles outlined in the reference project (`Msmaccas/agent-yolo-lab`).

## Agent Roles

### Surface Analyst

* **Input:** A `SurfaceSnapshot` containing option‑chain data, implied volatility term structure, skew and open‑interest changes for a single instrument.
* **Output:** Metrics such as concentration of open interest near the spot price, skewness indicators, implied‑versus‑realised volatility comparisons, and an initial list of positioning clusters (strikes/expiries where open interest or gamma exposure is unusually high).
* **Responsibilities:**
  - Flag potential pin‑risk zones where calls and puts cluster around spot.
  - Identify heavy call demand or put protection that may unwind.
  - Record any missing or suspicious data with `NOT_AVAILABLE` or `LOW_CONFIDENCE` state in the evidence ledger.

### Event Analyst

* **Input:** A list of `EventWindow` objects (earnings dates, macro events, corporate actions) for the instrument.
* **Output:** Annotations indicating whether the current date falls within or near an event window; contextual notes about typical implied‑volatility moves and historical reactions.
* **Responsibilities:**
  - Flag elevated implied volatility around earnings or macro catalysts.
  - Compare current IV to historical realised volatility distributions around similar events.
  - When events are absent, mark `UNKNOWN` state rather than assuming calm markets.

### Spot‑Context Analyst

* **Input:** Recent price series and realised volatility for the underlying (supplied via the `SurfaceSnapshot`).
* **Output:** Statistics such as realised volatility percentile, distance of spot from major strikes, and short‑term trend measures.
* **Responsibilities:**
  - Provide context for whether a move is significant relative to recent volatility.
  - Detect when price is pinning near a cluster of strikes or moving sharply into an area with sparse open interest.
  - Highlight if realised volatility is low relative to implied, suggesting potential volatility crush risk.

### Liquidity Sceptic

* **Input:** The same `SurfaceSnapshot` plus any additional liquidity metrics (e.g., bid/ask spreads, volume).  In the early release only open‑interest counts and notional volume are available.
* **Output:** Flags indicating if option liquidity is too thin to rely on the signals, or if concentrated positioning could cause outsized price moves due to dealer hedging.
* **Responsibilities:**
  - Identify expirations or strikes with very low open interest or volume, setting `LOW_CONFIDENCE` on any derived signals.
  - Detect high open‑interest zones in otherwise illiquid underlyings and flag potential liquidity traps.

### Synthesis Lead

* **Input:** All intermediate outputs, the list of positioning clusters and event annotations.
* **Output:** A ranked list of `PositioningRisk` objects for each instrument, narrative summaries, and an evidence ledger entry for each conclusion.
* **Responsibilities:**
  - Combine surface, event, spot and liquidity analyses to score hypotheses such as **PIN_RISK**, **SQUEEZE_RISK**, **VOL_CRUSH_RISK** and **LIQUIDITY_HAZARD**.
  - Provide assumptions, rule breakdowns and disconfirming evidence for each risk.
  - Assign confidence levels based on the weakest input (e.g., missing data anywhere propagates a lower confidence).
  - Ensure that narratives are actionable but bounded (e.g., “elevated call crowding but low cross‑expiry confirmation; poor edge for breakout chasing”).

## Operational rules

1. **Stay within the repository.**  Agents must never access external accounts, brokers or production databases.  All data must come from fixtures or approved providers via environment variables.
2. **Handle hostile input.**  Malformed files, missing fields, invalid dates, duplicated IDs and unsafe CSV formulas must be caught and recorded with an explicit `state` explaining the issue.  Never crash or silently discard data.
3. **Prefer `UNKNOWN` to guessing.**  When data is absent or inconsistent, mark the state accordingly rather than inferring values.
4. **Record evidence.**  Every calculation or classification must add an entry to the evidence ledger with source references and timestamps.  The ledger itself is persisted under `reports/` and referenced in the run result.
5. **Avoid forecasting.**  Agents classify hazards and provide context; they do not forecast price direction or recommend trades.
6. **Preserve determinism.**  All random processes must be seeded.  Use the provided fixtures for tests and golden outputs.  New data sources must be integrated behind deterministic interfaces.

## Run/build/verify/done criteria

* **Run:** Pipeline runs are triggered via the CLI (`npm start`) or API (`GET /watchlist?symbols=...`).  A run is not considered successful unless it produces both a report in `reports/` and a JSON evidence ledger.  Each run must log its start and finish times and all warnings.
* **Build:** All TypeScript must compile without errors using `npm run build`.  No `dist/` files are committed; compiled output is generated on demand.
* **Verify:** Unit tests must pass (`npm test`), including tests for hostile inputs, provider failures, rule breakdowns and golden output stability.  The smoke path (`npm run smoke`) must complete without uncaught exceptions and generate the expected golden files.  CI must succeed across the Node version matrix defined in `.github/workflows/ci.yml`.
* **Done:** A task is complete when there is visible evidence of success (logs, reports, golden outputs), tests proving coverage of critical paths, and no remaining TODOs.  You may not claim a feature is implemented until it is covered by a test or included in a generated report.
