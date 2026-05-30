import http, { IncomingMessage, ServerResponse } from 'http';
import url from 'url';
import path from 'path';
import fs from 'fs';
import { FileProvider } from '../../providers/src/index';
import { analyseInstrument, analyseWatchlist } from '../../workflows/src/index';
import { writeReportFiles } from '../../reports/src/index';

/**
 * Simple HTTP server without external dependencies.  Supports endpoints:
 *  - GET /analyse/:symbol
 *  - GET /watchlist?symbols=AAPL,BTC
 *  - GET /report/:symbol
 *  - GET /health
 */

export function startServer(): void {
  const port = parseInt(process.env.PORT || '3000', 10);
  // When compiled, __dirname is dist/packages/server/src.  Go up four levels to reach project root.
  const dataDir = process.env.GAMMA_DATA_DIR || path.resolve(__dirname, '..', '..', '..', '..', 'fixtures');
  const reportDir = process.env.GAMMA_REPORT_DIR || path.resolve(__dirname, '..', '..', '..', '..', 'reports');
  const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const parsed = url.parse(req.url || '', true);
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
        const provider = new FileProvider(dataDir);
        const { result, evidence, warnings } = await analyseInstrument(symbol, provider);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ instrument: symbol, result, evidence, warnings }));
        return;
      }
      // /watchlist
      if (pathname === '/watchlist') {
        const symbolsParam = (parsed.query.symbols as string) || '';
        const symbols = symbolsParam.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
        if (symbols.length === 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'no symbols specified' }));
          return;
        }
        const provider = new FileProvider(dataDir);
        const run = await analyseWatchlist(symbols, provider);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(run));
        return;
      }
      // /report/:symbol
      const reportMatch = pathname.match(/^\/report\/([A-Za-z0-9_-]+)$/);
      if (reportMatch) {
        const symbol = reportMatch[1].toUpperCase();
        const provider = new FileProvider(dataDir);
        const run = await analyseWatchlist([symbol], provider);
        const { reportPath } = writeReportFiles(run, reportDir);
        const content = fs.readFileSync(reportPath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/markdown' });
        res.end(content);
        return;
      }
      // Not found
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'not found' }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: (err as Error).message }));
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