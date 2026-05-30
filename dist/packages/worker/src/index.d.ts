/**
 * Run analysis once for a watchlist specified via environment variable or
 * passed as argument.  Writes reports to output directory.  Returns the
 * generated report paths for further inspection.
 */
export declare function runOnce(watchlist: string[]): Promise<{
    report: string;
    ledger: string;
}>;
/**
 * Start a daemon that periodically analyses the watchlist.  The interval is
 * provided in minutes via GAMMA_INTERVAL.  This simple implementation uses
 * setInterval; in production, you might use a scheduler.
 */
export declare function startDaemon(watchlist: string[]): void;
