# GammaAtlas Product Overview

GammaAtlas is designed for serious swing traders, options traders and small funds who seek an **early warning system** for option‑driven distortions.  It sits between raw data feeds and trading execution platforms, mapping where dealer hedging flows and event‑driven positioning could trap naive market participants.  Unlike generic gamma dashboards or black‑box AI trading agents, GammaAtlas provides **evidence‑bound narratives** with transparent assumptions and confidence levels.

## Core Value Proposition

* **Evidence‑first risk mapping:** The system ingests option‑chain snapshots (including implied volatility term structure, skew, open‑interest changes and realised volatility) and event calendars to classify hazards such as pin risk, squeeze risk, volatility crush risk and liquidity hazards.
* **Multi‑agent intelligence:** A team of specialised agents produces structured analyses, synthesised by a lead agent into ranked hypotheses and narratives.  The modular architecture allows each agent to be enhanced independently as new data sources or algorithms become available.
* **Venue‑agnostic model:** Although the initial release focuses on U.S. equity options, the core data model is agnostic to exchanges or asset classes.  Adapting to futures or crypto options requires only new provider implementations.
* **Actionable but bounded:** GammaAtlas does not tell users what to trade.  Instead, it warns of distorted surfaces (“IV inflated relative to realised and historical reaction distributions”) or misleading mechanics (“spot move likely to look stronger than it is because of expiry pinning”).  Traders remain in control.
* **Private deployment:** Serious funds can run GammaAtlas in their own environment without sending data to third parties.  Configuration is via environment variables only; no secrets are checked into code or fixtures.

## Modules

1. **Core:** Domain models, scoring logic, confidence calculation and utility functions.
2. **Data:** Parses option‑chain and event data from JSON fixtures or alternative sources; handles hostile inputs.
3. **Providers:** Abstract interfaces for data sources; includes a filesystem provider reading sample fixtures.  Future providers can fetch live data from ORATS, FlashAlpha, CBOE DataShop, etc.
4. **Agents:** Specialised analysis modules (surface, event, spot context, liquidity) and a synthesis lead that produces ranked risks and narratives.
5. **Workflows:** Orchestrates the entire pipeline, injecting providers and coordinating agents.  Produces a run result and evidence ledger.
6. **Reports:** Generates human‑readable Markdown reports and JSON evidence files.  Future versions may include PDF and interactive visualisations.
7. **Server:** Express application exposing a JSON API and a minimal dashboard to visualise results.
8. **Worker:** Daemon executing the pipeline on a schedule.  Can run as a one‑off job or as a persistent service that refreshes data and updates reports.

## Operating Modes

* **Demo mode:** Uses the provided fixtures to demonstrate the pipeline end‑to‑end.  Suitable for running the smoke path (`npm run smoke`) or exploring the dashboard.
* **Watchlist mode:** Users supply a comma‑separated list of up to 50 symbols via the `WATCHLIST` environment variable.  GammaAtlas processes each symbol and returns a ranked list of distortions.  When no options data is available for a symbol, the system still runs, clearly marking the outputs as simulated examples.
* **Headless API:** In programmatic settings, other applications (e.g., trading bots, research notebooks) can call the REST API to retrieve the latest hazard map and evidence ledger.

## Deployment

GammaAtlas ships as a Node.js monorepo.  It can be deployed on a workstation, server or cloud VM.  All configuration is handled through environment variables (`PORT`, `FIXTURES_DIR`, `WATCHLIST`, `POLL_INTERVAL`).  A Dockerfile and container‑orchestrated deployments are on the roadmap.

## Limitations and Disclaimers

* GammaAtlas is **not a trading platform**.  It does not place trades or integrate with brokers.  The product is for informational purposes only.  Users are solely responsible for any financial decisions made based on the output.
* Risk scores are **heuristic** and rely on public proxies (open interest, implied vs realised volatility).  They do not reflect actual dealer positions.  Use caution when interpreting the results.
* The early release ships with simulated data.  Real‑time data integration is pending.

## Next Steps

Please consult `DEMO.md` for a guided demonstration and `PRICING.md` for licensing options.  The `ROADMAP` section in `README.md` outlines planned enhancements.  Contributions and feature requests are welcome via pull requests.
