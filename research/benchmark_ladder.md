# Benchmark Ladder

The benchmark ladder positions GammaAtlas relative to tools in adjacent layers: from narrowly focussed options‑surface dashboards to cross‑domain agent frameworks.  Each rung summarises the benchmark’s strengths, weaknesses, and lessons for GammaAtlas.  Only official documentation and release notes were consulted; all links include the access date (30 May 2026).

## Rung 1 – Same‑Niche Prototypes (Agentic Options Surface Mapping)

There are no publicly documented products that automatically **map option‑surface hazards** and communicate them via specialised agents.  The closest analogues are research experiments (e.g., TradingAgents) that do not ingest option chain data.  This absence underscores the opportunity for GammaAtlas to pioneer this niche.  

Lessons:

* Define clear agent roles (surface analyst, event analyst, spot‑context analyst, liquidity sceptic, synthesis lead) and ensure each produces structured artefacts for the next step.  
* Use evidence ledgers and confidence scores to avoid overclaiming predictive precision in a field that lacks direct dealer position data.  
* Provide narrative outputs that are actionable but bounded (e.g., “high pin risk near 200 with poor edge for breakout chasing”) rather than signals to buy/sell.

## Rung 2 – Same‑Subfield Tools (Options Analytics & Gamma Dashboards)

These tools compute gamma exposure, implied volatility surfaces and open‑interest metrics.  They are valuable references for GammaAtlas’s data model but do not provide agentic interpretations.

### SpotGamma TRACE

* **Strengths:** Institutional‑grade gamma exposure models with real‑time heatmaps and zero‑gamma levels; integrates 0DTE options and models net gamma across expiries【289001834426501†L42-L115】.  
* **Limitations:** Treats gamma exposure purely as a numeric indicator; does not classify volatility crushes or pin/squeeze risks; no agentic or narrative layer.  
* **Lesson for GammaAtlas:** Provide transparency into assumptions and avoid black‑box metrics; integrate multiple risk factors beyond net gamma.

### GEX‑Metrix

* **Strengths:** Offers free access to net gamma profiles, zero‑gamma levels, volume and open‑interest charts; premium tiers include delta, vanna and charm exposures and historical snapshots【728051659192713†L73-L100】.  
* **Limitations:** The dashboard is a data browser; users must interpret the charts themselves; no scoring or classification.  
* **Lesson:** Build a data model flexible enough to incorporate exposures like vanna and charm when available, but always translate raw data into hypotheses and confidence scores.

### Option Alpha Gamma Exposure Charts

* **Strengths:** Integrated into a retail options bot platform; visualises net gamma, absolute gamma and call vs put gamma by expiration【31996705521582†L59-L77】.  
* **Limitations:** Charts are passive; there is no hazard classification or integration with event windows; gamma exposure strategies are a future roadmap item【31996705521582†L63-L67】.  
* **Lesson:** Combine gamma analytics with event calendars and realised volatility to contextualise when elevated implied volatility is justified (e.g., earnings vs random spikes).

### FlashAlpha API and Other Data Providers

* **Strengths:** Provide comprehensive options data, greeks and gamma exposure metrics via APIs【364907918472032†L26-L34】.  
* **Limitations:** They are data sources rather than end‑user tools; no classification or narrative; rely on users to build their own models.  
* **Lesson:** Design GammaAtlas’s provider interfaces to be data‑agnostic so that premium data services can be plugged in later without rewriting business logic.

## Rung 3 – Category‑Defining Agentic Trading Platforms

### AI‑Trader

* **Strengths:** Provides an agent‑native marketplace where AI agents can publish trading signals, debate strategies and copy trades; supports all major markets including options【108348309174100†L11-L53】.  
* **Limitations:** Focuses on signal sharing and execution; does not perform surface analysis or explain gamma dynamics.  
* **Lesson:** The agent economy is growing; GammaAtlas must integrate with such ecosystems carefully, providing hazard‑mapping outputs rather than raw signals, and ensuring that user decisions remain self‑directed.

### Public.com Agents

* **Strengths:** Allows retail investors to create simple trading agents via natural‑language prompts; integrates with a licensed brokerage to execute orders【454174559471536†L80-L129】.  
* **Limitations:** Provides no analytic backbone; agents rely entirely on user prompts; there is no gamma or surface intelligence.  
* **Lesson:** A consumer‑facing agent should be guided by robust analytics; GammaAtlas’s watchlist mode can feed these agents with alerts while preserving user oversight and regulatory compliance.

### TradingAgents (Research Framework)

* **Strengths:** Demonstrates that role‑specialised LLM agents can collaborate to improve trading performance【601568901708399†L31-L56】.  The framework features analysts, researchers, traders and risk managers communicating through structured reports【601568901708399†L31-L90】.  
* **Limitations:** Focused on equities and general market signals; does not model options surfaces.  
* **Lesson:** Adopting multi‑agent collaboration patterns will improve GammaAtlas’s interpretability and modularity.

### FinRobot

* **Strengths:** Unifies LLMs, reinforcement learning and quantitative analytics for financial analysis and valuation【262770555373709†L31-L35】; provides a smart scheduler and modular layers【262770555373709†L91-L97】.  
* **Limitations:** Concentrates on equity research; options analysis is limited.  
* **Lesson:** Use a layered architecture with scheduler and modular pipelines; ensure reproducibility and calibration of scores.

## Rung 4 – Cross‑Domain Gold Standards

### QuantConnect (LEAN)

* **Strengths:** Offers end‑to‑end quant research, backtesting and live trading infrastructure with realistic transaction costs, margin modelling, and multi‑asset support【248448723698072†L35-L84】.  It emphasises research‑to‑production parity and parameter optimisation【248448723698072†L110-L166】.  
* **Limitations:** There is no built‑in narrative engine; all strategy logic must be coded by the user; no integrated gamma analytics.  
* **Lesson:** GammaAtlas should emulate QuantConnect’s reproducible workflow and strong testing harness but go further by providing domain‑specific interpretations.

### NautilusTrader

* **Strengths:** High‑performance trading engine with deterministic event replay and support for options and other derivatives【805708899575411†L26-L116】; exposes greeks on an internal message bus【805708899575411†L106-L109】.  
* **Limitations:** Requires significant engineering effort to build complete strategies; no agentic layer or hazard classifications.  
* **Lesson:** Use deterministic event logging and replay in GammaAtlas’s pipeline to ensure reproducibility; integrate event stores into the evidence ledger.

### FlashAlpha Fill‑Simulator & Other Libraries

* **Strengths:** Provide specific functionality (e.g., realistic limit‑order fills【364907918472032†L54-L59】) that can be integrated into larger systems.  
* **Limitations:** These are building blocks rather than end‑user solutions.  
* **Lesson:** GammaAtlas should remain modular so that components like fill simulators, volatility solvers, or price archives can be swapped in without touching core logic.

## Takeaways for GammaAtlas

1. **Close the gap** between raw gamma dashboards and agentic platforms by mapping positioning hazards into evidence‑bound narratives.  
2. **Design for modularity:** separate providers, agents, workflows, and reports so new data sources or scoring models can be integrated without breaking the pipeline.  
3. **Adopt reproducible research practices** from QuantConnect and NautilusTrader: deterministic event logs, golden output fixtures, and CI‑backed tests.  
4. **Prioritise transparency:** always expose the assumptions behind risk scores, highlight missing or uncertain data, and never overstate predictive power.  
5. **Focus on the human user:** present actionable insights (e.g., “elevated call crowding but low cross‑expiry confirmation”) rather than trading instructions; integrate watchlists and confidence rankings to help traders avoid trap scenarios.
