/**
 * Simple HTTP server without external dependencies.  Supports endpoints:
 *  - GET /analyse/:symbol
 *  - GET /watchlist?symbols=AAPL,BTC
 *  - GET /report/:symbol
 *  - GET /health
 */
export declare function startServer(): void;
