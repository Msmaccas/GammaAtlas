import { InstrumentResult, EvidenceItem, RunResult } from '../../core/src/types';
import { DataProvider } from '../../providers/src/index';
/**
 * Analyse a single instrument by orchestrating provider calls and agent
 * processing.  Returns an InstrumentResult, evidence items, and warnings.
 */
export declare function analyseInstrument(instrument: string, provider: DataProvider): Promise<{
    result: InstrumentResult | null;
    evidence: EvidenceItem[];
    warnings: string[];
}>;
/**
 * Analyse a watchlist of instruments.  Produces a RunResult with the
 * aggregated evidence and warnings.
 */
export declare function analyseWatchlist(instruments: string[], provider: DataProvider): Promise<RunResult>;
