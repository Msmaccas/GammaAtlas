import path from 'path';
import { FileProvider } from '../../providers/src/index';
import { analyseWatchlist } from '../../workflows/src/index';
import { writeReportFiles } from '../../reports/src/index';

/**
 * Run analysis once for a watchlist specified via environment variable or
 * passed as argument.  Writes reports to output directory.  Returns the
 * generated report paths for further inspection.
 */
export async function runOnce(watchlist: string[]): Promise<{ report: string; ledger: string }> {
  // When compiled, __dirname is dist/packages/worker/src.  Go up four levels to reach project root.
  const dataDir = process.env.GAMMA_DATA_DIR || path.resolve(__dirname, '..', '..', '..', '..', 'fixtures');
  const reportDir = process.env.GAMMA_REPORT_DIR || path.resolve(__dirname, '..', '..', '..', '..', 'reports');
  const provider = new FileProvider(dataDir);
  const run = await analyseWatchlist(watchlist, provider);
  const { reportPath, ledgerPath } = writeReportFiles(run, reportDir);
  return { report: reportPath, ledger: ledgerPath };
}

/**
 * Start a daemon that periodically analyses the watchlist.  The interval is
 * provided in minutes via GAMMA_INTERVAL.  This simple implementation uses
 * setInterval; in production, you might use a scheduler.
 */
export function startDaemon(watchlist: string[]): void {
  const intervalMinutes = parseInt(process.env.GAMMA_INTERVAL || '60', 10);
  const intervalMs = intervalMinutes * 60 * 1000;
  async function tick() {
    try {
      const { report } = await runOnce(watchlist);
      console.log(`Daemon generated report: ${report}`);
    } catch (err) {
      console.error('Daemon error:', err);
    }
  }
  // initial run
  tick();
  setInterval(tick, intervalMs);
}