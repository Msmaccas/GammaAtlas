import assert from 'assert';
import path from 'path';
import { FileProvider } from '../packages/providers/src/index';

export async function runTests(): Promise<void> {
  const dataDir = path.resolve(__dirname, '..', '..', 'fixtures');
  {
    const provider = new FileProvider(dataDir);
    const snapshot = await provider.fetchSnapshot('AAPL');
    assert(snapshot !== null, 'Provider should return snapshot for AAPL');
    if (snapshot) {
      assert.strictEqual(snapshot.instrument, 'AAPL');
      assert(snapshot.contracts.length > 0, 'Snapshot should contain contracts');
    }
    const events = await provider.fetchEvents('AAPL');
    assert(events.length > 0, 'Provider should return events for AAPL');
    assert.strictEqual(events[0].instrument, 'AAPL');
    const warnings = provider.getWarnings();
    assert.strictEqual(warnings.length, 0, 'Provider should have no warnings for AAPL');
  }
  {
    const provider = new FileProvider(dataDir);
    const snapshot = await provider.fetchSnapshot('MISSING');
    assert.strictEqual(snapshot, null, 'Provider should return null for missing instrument');
    const events = await provider.fetchEvents('MISSING');
    assert.strictEqual(events.length, 0, 'Provider should return empty events for missing instrument');
  }
}