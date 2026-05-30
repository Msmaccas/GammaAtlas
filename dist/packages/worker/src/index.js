"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runOnce = runOnce;
exports.startDaemon = startDaemon;
const path_1 = __importDefault(require("path"));
const index_1 = require("../../providers/src/index");
const index_2 = require("../../workflows/src/index");
const index_3 = require("../../reports/src/index");
/**
 * Run analysis once for a watchlist specified via environment variable or
 * passed as argument.  Writes reports to output directory.  Returns the
 * generated report paths for further inspection.
 */
async function runOnce(watchlist) {
    // When compiled, __dirname is dist/packages/worker/src.  Go up four levels to reach project root.
    const dataDir = process.env.GAMMA_DATA_DIR || path_1.default.resolve(__dirname, '..', '..', '..', '..', 'fixtures');
    const reportDir = process.env.GAMMA_REPORT_DIR || path_1.default.resolve(__dirname, '..', '..', '..', '..', 'reports');
    const provider = new index_1.FileProvider(dataDir);
    const run = await (0, index_2.analyseWatchlist)(watchlist, provider);
    const { reportPath, ledgerPath } = (0, index_3.writeReportFiles)(run, reportDir);
    return { report: reportPath, ledger: ledgerPath };
}
/**
 * Start a daemon that periodically analyses the watchlist.  The interval is
 * provided in minutes via GAMMA_INTERVAL.  This simple implementation uses
 * setInterval; in production, you might use a scheduler.
 */
function startDaemon(watchlist) {
    const intervalMinutes = parseInt(process.env.GAMMA_INTERVAL || '60', 10);
    const intervalMs = intervalMinutes * 60 * 1000;
    async function tick() {
        try {
            const { report } = await runOnce(watchlist);
            console.log(`Daemon generated report: ${report}`);
        }
        catch (err) {
            console.error('Daemon error:', err);
        }
    }
    // initial run
    tick();
    setInterval(tick, intervalMs);
}
//# sourceMappingURL=index.js.map