import assert from 'assert';
import path from 'path';
import { FileProvider } from '../packages/providers/src/index';
import { analyseWatchlist } from '../packages/workflows/src/index';
import { generateMarkdownReport, generateEvidenceLedger } from '../packages/reports/src/index';

export async function runTests(): Promise<void> {
  const dataDir = path.resolve(__dirname, '..', '..', 'fixtures');
  const provider = new FileProvider(dataDir);
  const run = await analyseWatchlist(['AAPL'], provider);
  const md = generateMarkdownReport(run);
  const ledger = generateEvidenceLedger(run);
  assert(md.includes('# GammaAtlas Report'), 'Markdown report should contain header');
  assert(md.includes('AAPL'), 'Markdown report should mention instrument');
  assert(/PIN_RISK|SQUEEZE_RISK|VOL_CRUSH_RISK|LIQUIDITY_HAZARD/.test(md), 'Markdown report should list risk types');
  const parsed = JSON.parse(ledger);
  assert(Array.isArray(parsed.evidence), 'Evidence ledger should contain evidence array');
}