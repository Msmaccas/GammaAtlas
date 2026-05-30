import { RunResult } from '../../core/src/types';
/**
 * Generate a Markdown report summarising the risks for each instrument.  The
 * report contains a table with risk types and scores along with commentary.
 */
export declare function generateMarkdownReport(run: RunResult): string;
/**
 * Generate a JSON evidence ledger string with pretty printing.  Includes
 * evidence items and warnings.
 */
export declare function generateEvidenceLedger(run: RunResult): string;
/**
 * Write the report and evidence ledger into the specified directory.  Files
 * are named deterministically based on the run date.
 */
export declare function writeReportFiles(run: RunResult, outputDir: string): {
    reportPath: string;
    ledgerPath: string;
};
