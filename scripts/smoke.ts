import path from 'path';
import { FileProvider } from '../packages/providers/src/index';
import { analyseWatchlist } from '../packages/workflows/src/index';
import { writeReportFiles } from '../packages/reports/src/index';

async function runSmoke(): Promise<void> {
  const watchlistEnv = process.env.GAMMA_WATCHLIST || 'AAPL';
  const symbols = watchlistEnv.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
  // When compiled, __dirname is dist/scripts.  Go up two levels to reach project root and fixtures.
  const dataDir = process.env.GAMMA_DATA_DIR || path.resolve(__dirname, '..', '..', 'fixtures');
  const provider = new FileProvider(dataDir);
  const run = await analyseWatchlist(symbols, provider);
  const reportDir = process.env.GAMMA_REPORT_DIR || path.resolve(__dirname, '..', '..', 'reports');
  const { reportPath, ledgerPath } = writeReportFiles(run, reportDir);
  console.log(`Smoke run complete for instruments: ${symbols.join(', ')}`);
  console.log(`Report written to ${reportPath}`);
  console.log(`Evidence ledger written to ${ledgerPath}`);
}

runSmoke().catch((err) => {
  console.error(err);
  process.exit(1);
});