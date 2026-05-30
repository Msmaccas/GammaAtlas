# GammaAtlas Demonstration Guide

This guide walks through a basic demonstration of **GammaAtlas** using the provided sample fixtures.  The demo runs entirely offline and does not require any API keys or external data sources.

## Prerequisites

* Node.js >= 18 and npm installed.
* The GammaAtlas repository cloned and checked out locally.
* No prior `node_modules` folder in the repository root (run `npm ci` from a clean clone).

## Step 1 – Install and Build

```bash
cd gamma-atlas
npm ci      # install dependencies using the lockfile
npm run build  # compile all TypeScript packages to dist/
```

This command should exit with no errors.  If it fails, ensure that your Node version is supported and that all dev dependencies are installed.

## Step 2 – Run the Smoke Path

The smoke path seeds sample option‑chain data and event windows, executes the full pipeline and writes a report.

```bash
npm run smoke
```

On success, you should see console output similar to:

```
Loaded fixtures for 3 instruments: AAPL, MSFT, SPY
Computing hazard map...
Hazard map generated.  Reports written to reports/run_YYYYMMDD_HHmmss.md and .json
Smoke test completed successfully.
```

The smoke script produces two artefacts in the `reports/` directory:

* `run_YYYYMMDD_HHmmss.md` – A human‑readable report summarising each instrument’s hazards, scores and narrative explanations.
* `run_YYYYMMDD_HHmmss.json` – The machine‑readable evidence ledger with structured data for each risk, including assumptions and confidence scores.

## Step 3 – Explore the Dashboard

Start the compiled CLI and Express server with the built artefacts:

```bash
# The watchlist can contain up to 50 comma‑separated symbols
WATCHLIST="AAPL,MSFT,SPY" PORT=3000 npm start
```

Open your browser to `http://localhost:3000/dashboard`.  The dashboard displays:

* A **heatmap** where rows correspond to instruments and columns correspond to risk types (pin risk, squeeze risk, vol‑crush risk, liquidity hazard).  Colours represent relative scores.
* A **summary table** listing the top distorted surfaces with their scores, confidence levels and narrative explanations.
* Links to download the latest evidence ledger and report.

You can trigger a fresh run by visiting `http://localhost:3000/api/run`.  The results are cached and can be retrieved via `http://localhost:3000/api/results`.

## Step 4 – Use Watchlist Mode

To analyse your own list of instruments (subject to data availability), set the `WATCHLIST` environment variable.  For example:

```bash
WATCHLIST="TSLA,AMZN,NVDA,QQQ" npm start
```

If fixtures for a symbol are missing, GammaAtlas will simulate the analysis using placeholder data and mark the results as `NOT_AVAILABLE` with low confidence.  Real‑time data integration is planned; until then, the system serves as a demonstration of the classification logic.

## Step 5 – Inspect the Evidence Ledger

The JSON evidence ledger contains fine‑grained details about each risk:

```json
{
  "date": "2026-05-30T08:00:00Z",
  "instrumentResults": [
    {
      "instrument": "AAPL",
      "risks": [
        {
          "type": "PIN_RISK",
          "hypothesis": "high gamma pin risk near 200",
          "score": {
            "score": 72,
            "confidence": 0.8,
            "state": "OK",
            "assumptions": ["call and put OI cluster at 195–205", "expiration in 2 days"],
            "disconfirmingEvidence": ["0DTE volume low"],
            "explanation": "open interest concentrated near spot; gamma exposure high"
          }
        }
        // ... more risks
      ]
    }
  ],
  "evidence": [
    {
      "id": "e1",
      "type": "OpenInterestCluster",
      "source": "fixtures/options_chains/AAPL.json",
      "timestamp": "2026-05-30T07:59:00Z",
      "confidence": 0.9,
      "state": "OK",
      "reason": "Large call and put OI within ±5% of spot"
    }
    // ... more evidence items
  ],
  "warnings": []
}
```

Use this ledger to audit the pipeline’s reasoning or integrate GammaAtlas into your own research tools.

## Troubleshooting

* **Compilation errors:** Ensure you ran `npm ci` and that your Node version matches the `.nvmrc` or recommended versions.  Delete any existing `node_modules` and reinstall.
* **Fixtures not found:** Check that `FIXTURES_DIR` points to the `fixtures/` directory.  The smoke script automatically sets this variable; when running manually you may need to export it.
* **Dashboard not loading:** Make sure the server is listening on the correct port (`PORT` environment variable).  Check the server logs for errors.

## Next steps

After exploring the demo, review `PRICING.md` to understand licensing options and `ROADMAP` in `README.md` to see planned enhancements.  Contributions and feature requests are welcome via pull requests.
