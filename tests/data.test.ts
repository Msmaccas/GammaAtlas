import assert from 'assert';
import path from 'path';
import { loadSurfaceSnapshot, loadEventWindows } from '../packages/data/src/index';

export async function runTests(): Promise<void> {
  const fixturesDir = path.resolve(__dirname, '..', '..', 'fixtures');
  {
    const file = path.join(fixturesDir, 'options_chains', 'AAPL.json');
    const { data, warnings } = loadSurfaceSnapshot(file);
    assert(data !== null, 'AAPL snapshot should not be null');
    if (data) {
      assert.strictEqual(data.instrument, 'AAPL');
    }
    assert.strictEqual(warnings.length, 0, 'AAPL snapshot should have no warnings');
  }
  {
    const file = path.join(fixturesDir, 'events', 'AAPL.json');
    const { data, warnings } = loadEventWindows(file);
    assert(data !== null, 'AAPL events should not be null');
    assert.strictEqual(warnings.length, 0, 'AAPL events should have no warnings');
    if (data) {
      assert(data.length > 0, 'AAPL events should have entries');
      assert.strictEqual(data[0].instrument, 'AAPL');
    }
  }
  {
    const file = path.join(fixturesDir, 'hostile', 'options_chains', 'BAD.json');
    const { warnings } = loadSurfaceSnapshot(file);
    assert(warnings.length > 0, 'Hostile snapshot should produce warnings');
  }
}