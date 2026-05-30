"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMarkdownReport = generateMarkdownReport;
exports.generateEvidenceLedger = generateEvidenceLedger;
exports.writeReportFiles = writeReportFiles;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Generate a Markdown report summarising the risks for each instrument.  The
 * report contains a table with risk types and scores along with commentary.
 */
function generateMarkdownReport(run) {
    const lines = [];
    lines.push(`# GammaAtlas Report – ${run.date}`);
    lines.push('');
    if (run.instrumentResults.length === 0) {
        lines.push('No instruments analysed.');
    }
    run.instrumentResults.forEach((res) => {
        lines.push(`## ${res.instrument}`);
        if (res.risks.length === 0) {
            lines.push('No notable positioning risks detected.');
        }
        else {
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
function generateEvidenceLedger(run) {
    return JSON.stringify({ date: run.date, evidence: run.evidence, warnings: run.warnings }, null, 2);
}
/**
 * Write the report and evidence ledger into the specified directory.  Files
 * are named deterministically based on the run date.
 */
function writeReportFiles(run, outputDir) {
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir, { recursive: true });
    }
    const timestamp = run.date.replace(/[:.]/g, '_');
    const reportPath = path_1.default.join(outputDir, `report_${timestamp}.md`);
    const ledgerPath = path_1.default.join(outputDir, `evidence_${timestamp}.json`);
    fs_1.default.writeFileSync(reportPath, generateMarkdownReport(run), 'utf-8');
    fs_1.default.writeFileSync(ledgerPath, generateEvidenceLedger(run), 'utf-8');
    return { reportPath, ledgerPath };
}
//# sourceMappingURL=index.js.map