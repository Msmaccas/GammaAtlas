import assert from 'assert';
import path from 'path';
import { FileProvider } from '../packages/providers/src/index';
import { analyseInstrument, analyseWatchlist } from '../packages/workflows/src/index';

export async function runTests(): Promise<void> {
  const dataDir = path.resolve(__dirname, '..', '..', 'fixtures');
  {
    const provider = new FileProvider(dataDir);
    const { result, evidence, warnings } = await analyseInstrument('AAPL', provider);
    assert(result !== null, 'analyseInstrument should return a result for AAPL');
    assert(evidence.length > 0, 'evidence should not be empty');
    assert(warnings.length === 0, 'there should be no warnings for AAPL');
    if (result) {
      assert(result.risks.length > 0, 'result should contain risks');
    }
  }
  {
    const provider = new FileProvider(dataDir);
    const run = await analyseWatchlist(['AAPL', 'MISSING'], provider);
    assert(run.instrumentResults.length > 0, 'instrumentResults should not be empty');
    assert(run.warnings.some((w) => w.includes('no snapshot')), 'warnings should include missing snapshot');
  }
}