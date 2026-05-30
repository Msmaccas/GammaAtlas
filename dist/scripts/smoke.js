"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const index_1 = require("../packages/providers/src/index");
const index_2 = require("../packages/workflows/src/index");
const index_3 = require("../packages/reports/src/index");
async function runSmoke() {
    const watchlistEnv = process.env.GAMMA_WATCHLIST || 'AAPL';
    const symbols = watchlistEnv.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
    // When compiled, __dirname is dist/scripts.  Go up two levels to reach project root and fixtures.
    const dataDir = process.env.GAMMA_DATA_DIR || path_1.default.resolve(__dirname, '..', '..', 'fixtures');
    const provider = new index_1.FileProvider(dataDir);
    const run = await (0, index_2.analyseWatchlist)(symbols, provider);
    const reportDir = process.env.GAMMA_REPORT_DIR || path_1.default.resolve(__dirname, '..', '..', 'reports');
    const { reportPath, ledgerPath } = (0, index_3.writeReportFiles)(run, reportDir);
    console.log(`Smoke run complete for instruments: ${symbols.join(', ')}`);
    console.log(`Report written to ${reportPath}`);
    console.log(`Evidence ledger written to ${ledgerPath}`);
}
runSmoke().catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=smoke.js.map