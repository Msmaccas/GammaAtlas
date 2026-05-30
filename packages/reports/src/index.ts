import fs from 'fs';
import path from 'path';
import { RunResult, PositioningRisk } from '../../core/src/types';

/**
 * Generate a Markdown report summarising the risks for each instrument.  The
 * report contains a table with risk types and scores along with commentary.
 */
export function generateMarkdownReport(run: RunResult): string {
  const lines: string[] = [];
  lines.push(`# GammaAtlas Report – ${run.date}`);
  lines.push('');
  if (run.instrumentResults.length === 0) {
    lines.push('No instruments analysed.');
  }
  run.instrumentResults.forEach((res) => {
    lines.push(`## ${res.instrument}`);
    if (res.risks.length === 0) {
      lines.push('No notable positioning risks detected.');
    } else {
      lines.push('| Risk Type | Score | Confidence | Hypothesis |');
      lines.push('|---|---|---|---|');
      res.risks.forEach((risk) => {
        lines.push(`| ${risk.type} | ${risk.score.score} | ${risk.score.confidence.toFixed(2)} | ${risk.hypothesis} |`);
      });
    }
    lines.push('');
  });
  if (run.warnings.length) {
    lines.push('### Warnings');
    run.warnings.forEach((w) => lines.push(`- ${w}`));
  }
  return lines.join('\n');
}

/**
 * Generate a JSON evidence ledger string with pretty printing.  Includes
 * evidence items and warnings.
 */
export function generateEvidenceLedger(run: RunResult): string {
  return JSON.stringify({ date: run.date, evidence: run.evidence, warnings: run.warnings }, null, 2);
}

/**
 * Write the report and evidence ledger into the specified directory.  Files
 * are named deterministically based on the run date.
 */
export function writeReportFiles(run: RunResult, outputDir: string): { reportPath: string; ledgerPath: string } {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const timestamp = run.date.replace(/[:.]/g, '_');
  const reportPath = path.join(outputDir, `report_${timestamp}.md`);
  const ledgerPath = path.join(outputDir, `evidence_${timestamp}.json`);
  fs.writeFileSync(reportPath, generateMarkdownReport(run), 'utf-8');
  fs.writeFileSync(ledgerPath, generateEvidenceLedger(run), 'utf-8');
  return { reportPath, ledgerPath };
}