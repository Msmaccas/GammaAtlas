"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const http_1 = __importDefault(require("http"));
const url_1 = __importDefault(require("url"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const index_1 = require("../../providers/src/index");
const index_2 = require("../../workflows/src/index");
const index_3 = require("../../reports/src/index");
/**
 * Simple HTTP server without external dependencies.  Supports endpoints:
 *  - GET /analyse/:symbol
 *  - GET /watchlist?symbols=AAPL,BTC
 *  - GET /report/:symbol
 *  - GET /health
 */
function startServer() {
    const port = parseInt(process.env.PORT || '3000', 10);
    // When compiled, __dirname is dist/packages/server/src.  Go up four levels to reach project root.
    const dataDir = process.env.GAMMA_DATA_DIR || path_1.default.resolve(__dirname, '..', '..', '..', '..', 'fixtures');
    const reportDir = process.env.GAMMA_REPORT_DIR || path_1.default.resolve(__dirname, '..', '..', '..', '..', 'reports');
    const server = http_1.default.createServer(async (req, res) => {
        try {
            const parsed = url_1.default.parse(req.url || '', true);
            const pathname = parsed.pathname || '';
            if (pathname === '/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok' }));
                return;
            }
            // /analyse/:symbol
            const analyseMatch = pathname.match(/^\/analyse\/([A-Za-z0-9_-]+)$/);
            if (analyseMatch) {
                const symbol = analyseMatch[1].toUpperCase();
                const provider = new index_1.FileProvider(dataDir);
                const { result, evidence, warnings } = await (0, index_2.analyseInstrument)(symbol, provider);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ instrument: symbol, result, evidence, warnings }));
                return;
            }
            // /watchlist
            if (pathname === '/watchlist') {
                const symbolsParam = parsed.query.symbols || '';
                const symbols = symbolsParam.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
                if (symbols.length === 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'no symbols specified' }));
                    return;
                }
                const provider = new index_1.FileProvider(dataDir);
                const run = await (0, index_2.analyseWatchlist)(symbols, provider);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(run));
                return;
            }
            // /report/:symbol
            const reportMatch = pathname.match(/^\/report\/([A-Za-z0-9_-]+)$/);
            if (reportMatch) {
                const symbol = reportMatch[1].toUpperCase();
                const provider = new index_1.FileProvider(dataDir);
                const run = await (0, index_2.analyseWatchlist)([symbol], provider);
                const { reportPath } = (0, index_3.writeReportFiles)(run, reportDir);
                const content = fs_1.default.readFileSync(reportPath, 'utf-8');
                res.writeHead(200, { 'Content-Type': 'text/markdown' });
                res.end(content);
                return;
            }
            // Not found
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'not found' }));
        }
        catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
    });
    server.listen(port, () => {
        console.log(`GammaAtlas server listening on port ${port}`);
    });
}
// If run directly, start the server
if (require.main === module) {
    startServer();
}
//# sourceMappingURL=index.js.map