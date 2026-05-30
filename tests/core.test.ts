import assert from 'assert';
import { classifyPinRisk, classifySqueezeRisk, classifyVolCrushRisk, classifyLiquidityHazard } from '../packages/core/src/logic';
import { SurfaceSnapshot, PositioningCluster, EventWindow } from '../packages/core/src/types';

export async function runTests(): Promise<void> {
  const baseSnapshot: SurfaceSnapshot = {
    instrument: 'TEST',
    timestamp: '2026-05-30',
    spotPrice: 200,
    realisedVol: 0.2,
    contracts: [
      { strike: 200, expiry: '2026-06-01', type: 'call' as 'call', openInterest: 1000, volume: 10 },
      { strike: 200, expiry: '2026-06-01', type: 'put' as 'put', openInterest: 900, volume: 10 },
      { strike: 180, expiry: '2026-06-01', type: 'call' as 'call', openInterest: 200, volume: 5 },
    ],
    ivTermStructure: { '2026-06-01': 0.33 },
    skew: { '2026-06-01': 0.05 },
    openInterestChanges: {},
    state: 'OK',
  };
  {
    const clusters: PositioningCluster[] = [
      { strike: 200, expiry: '2026-06-01', callOpenInterest: 1000, putOpenInterest: 900, relativeDensity: 5 },
      { strike: 180, expiry: '2026-06-01', callOpenInterest: 200, putOpenInterest: 0, relativeDensity: 1 },
    ];
    const { risk } = classifyPinRisk(baseSnapshot, clusters);
    assert(risk !== null, 'Pin risk should not be null');
    if (risk) {
      assert.strictEqual(risk.type, 'PIN_RISK');
      assert(risk.score.score > 0, 'Pin risk score should be > 0');
    }
  }
  {
    const clusters: PositioningCluster[] = [
      { strike: 200, expiry: '2026-06-01', callOpenInterest: 1000, putOpenInterest: 100, relativeDensity: 1 },
      { strike: 180, expiry: '2026-06-01', callOpenInterest: 500, putOpenInterest: 50, relativeDensity: 1 },
    ];
    const { risk } = classifySqueezeRisk(baseSnapshot, clusters);
    assert(risk !== null, 'Squeeze risk should not be null');
    if (risk) {
      assert.strictEqual(risk.type, 'SQUEEZE_RISK');
      assert(risk.score.score > 0, 'Squeeze risk score should be > 0');
    }
  }
  {
    const events: EventWindow[] = [
      { instrument: 'TEST', eventType: 'EARNINGS', description: 'Earnings', start: '2026-06-02', end: '2026-06-02' },
    ];
    const snapshot = { ...baseSnapshot, ivTermStructure: { '2026-06-01': 0.5 }, realisedVol: 0.1 };
    const { risk } = classifyVolCrushRisk(snapshot, events);
    assert(risk !== null, 'Vol crush risk should not be null');
    if (risk) {
      assert.strictEqual(risk.type, 'VOL_CRUSH_RISK');
    }
  }
  {
    const snapshot = { ...baseSnapshot, contracts: [
      { strike: 200, expiry: '2026-06-01', type: 'call' as 'call', openInterest: 1000, volume: 10 },
      { strike: 220, expiry: '2026-06-01', type: 'call' as 'call', openInterest: 1, volume: 1 },
    ] };
    const { risk } = classifyLiquidityHazard(snapshot, []);
    assert(risk !== null, 'Liquidity hazard should not be null');
    if (risk) {
      assert.strictEqual(risk.type, 'LIQUIDITY_HAZARD');
    }
  }
}