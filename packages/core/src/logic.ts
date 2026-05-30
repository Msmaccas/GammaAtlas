import {
  SurfaceSnapshot,
  PositioningCluster,
  PositioningRisk,
  PositioningRiskType,
  RiskScore,
  EvidenceItem,
  EventWindow,
  RiskState,
  ScoreBreakdown,
} from './types';

/**
 * Identify clusters of open interest around strikes.  A cluster is defined by
 * strikes where total open interest exceeds a multiple of the median.
 */
export function identifyClusters(snapshot: SurfaceSnapshot): PositioningCluster[] {
  const byKey: Record<string, { callOI: number; putOI: number }> = {};
  snapshot.contracts.forEach((c) => {
    const key = `${c.strike}-${c.expiry}`;
    byKey[key] = byKey[key] || { callOI: 0, putOI: 0 };
    if (c.type === 'call') {
      byKey[key].callOI += c.openInterest;
    } else {
      byKey[key].putOI += c.openInterest;
    }
  });
  const densities: number[] = [];
  Object.values(byKey).forEach((val) => densities.push(val.callOI + val.putOI));
  const median = densities.sort((a, b) => a - b)[Math.floor(densities.length / 2)] || 0;
  const clusters: PositioningCluster[] = [];
  Object.entries(byKey).forEach(([key, val]) => {
    const [strikeStr, expiry] = key.split('-');
    const totalOI = val.callOI + val.putOI;
    const rel = median === 0 ? 0 : totalOI / median;
    clusters.push({
      strike: parseFloat(strikeStr),
      expiry,
      callOpenInterest: val.callOI,
      putOpenInterest: val.putOI,
      relativeDensity: rel,
    });
  });
  return clusters;
}

/**
 * Utility to build a score object.
 */
function makeScore(value: number, confidence: number, state: RiskState, breakdown: ScoreBreakdown): RiskScore {
  return {
    score: Math.max(0, Math.min(100, Math.round(value))),
    confidence: Math.max(0, Math.min(1, confidence)),
    state,
    breakdown,
  };
}

/**
 * Compute days between now (snapshot timestamp) and an expiry string.
 */
function daysToExpiry(snapshotTime: string, expiry: string): number {
  const snap = new Date(snapshotTime);
  const exp = new Date(expiry);
  const diffMs = exp.getTime() - snap.getTime();
  return diffMs / (1000 * 60 * 60 * 24);
}

/**
 * Classify pin risk.  High when call and put open interest cluster around spot within ±5% and expiry is near.
 */
export function classifyPinRisk(
  snapshot: SurfaceSnapshot,
  clusters: PositioningCluster[],
): { risk: PositioningRisk | null; evidence: EvidenceItem[] } {
  const evidence: EvidenceItem[] = [];
  // find clusters within ±5% of spot
  const tolerance = 0.05 * snapshot.spotPrice;
  const nearSpot = clusters.filter((c) => Math.abs(c.strike - snapshot.spotPrice) <= tolerance);
  if (nearSpot.length === 0) {
    return { risk: null, evidence: [] };
  }
  // pick cluster with highest relative density
  const cluster = nearSpot.reduce((a, b) => (a.relativeDensity > b.relativeDensity ? a : b));
  const days = daysToExpiry(snapshot.timestamp, cluster.expiry);
  // compute score: relative density scaled 0-1, time factor 1 if <=3 days else declines
  const densityFactor = Math.min(1, cluster.relativeDensity / 3); // 1 when cluster is >=3x median
  const timeFactor = days <= 3 ? 1 : days <= 10 ? 0.5 : 0.1;
  const callPutBalance = cluster.callOpenInterest && cluster.putOpenInterest ? 1 : 0.5;
  const rawScore = 100 * densityFactor * timeFactor * callPutBalance;
  const state: RiskState = rawScore > 0 ? 'OK' : 'NOT_AVAILABLE';
  const breakdown: ScoreBreakdown = {
    rules: [
      'densityFactor = min(1, relativeDensity/3)',
      'timeFactor = 1 if daysToExpiry<=3, else 0.5 if <=10, else 0.1',
      'callPutBalance = 1 if both call and put OI > 0 else 0.5',
    ],
    assumptions: [`spot=${snapshot.spotPrice}`, `strike=${cluster.strike}`, `relativeDensity=${cluster.relativeDensity.toFixed(2)}`, `daysToExpiry=${days.toFixed(1)}`],
    disconfirmingEvidence: [],
  };
  evidence.push({
    id: `pin-${snapshot.instrument}-${cluster.strike}-${cluster.expiry}`,
    type: 'PinCluster',
    source: snapshot.instrument,
    timestamp: snapshot.timestamp,
    confidence: densityFactor,
    state,
    reason: `Cluster near spot (${cluster.strike}) with relative density ${cluster.relativeDensity.toFixed(2)}`,
  });
  const risk: PositioningRisk = {
    type: 'PIN_RISK',
    hypothesis: `High gamma pin risk near ${cluster.strike.toFixed(0)}`,
    score: makeScore(rawScore, densityFactor * timeFactor, state, breakdown),
  };
  return { risk, evidence };
}

/**
 * Classify squeeze risk.  Occurs when call demand vastly outweighs put demand across clusters and near‑dated expiries.
 */
export function classifySqueezeRisk(
  snapshot: SurfaceSnapshot,
  clusters: PositioningCluster[],
): { risk: PositioningRisk | null; evidence: EvidenceItem[] } {
  let aggregateCall = 0;
  let aggregatePut = 0;
  clusters.forEach((c) => {
    // weight by closeness to current price
    const weight = 1 / (1 + Math.abs(c.strike - snapshot.spotPrice));
    aggregateCall += c.callOpenInterest * weight;
    aggregatePut += c.putOpenInterest * weight;
  });
  const callPutRatio = aggregatePut === 0 ? aggregateCall : aggregateCall / aggregatePut;
  const skewValues = Object.values(snapshot.skew);
  const avgSkew = skewValues.length ? skewValues.reduce((a, b) => a + b, 0) / skewValues.length : 0;
  // Determine if there is heavy call demand: callPutRatio > 3 and skew > 0
  if (callPutRatio < 2 || avgSkew <= 0) {
    return { risk: null, evidence: [] };
  }
  const ratioFactor = Math.min(1, callPutRatio / 5);
  const skewFactor = Math.min(1, avgSkew / 0.1); // 0.1 ~ 10% IV skew threshold
  const rawScore = 100 * ratioFactor * skewFactor;
  const state: RiskState = 'OK';
  const breakdown: ScoreBreakdown = {
    rules: [
      'ratioFactor = min(1, callPutRatio/5)',
      'skewFactor = min(1, avgSkew/0.1)',
    ],
    assumptions: [`callPutRatio=${callPutRatio.toFixed(2)}`, `avgSkew=${avgSkew.toFixed(4)}`],
    disconfirmingEvidence: [],
  };
  const evidence: EvidenceItem[] = [
    {
      id: `squeeze-${snapshot.instrument}`,
      type: 'CallCrowding',
      source: snapshot.instrument,
      timestamp: snapshot.timestamp,
      confidence: ratioFactor * skewFactor,
      state,
      reason: `Call/put OI ratio ${callPutRatio.toFixed(2)}, avg skew ${avgSkew.toFixed(4)}`,
    },
  ];
  const risk: PositioningRisk = {
    type: 'SQUEEZE_RISK',
    hypothesis: 'Elevated call crowding; potential squeeze risk',
    score: makeScore(rawScore, ratioFactor * skewFactor, state, breakdown),
  };
  return { risk, evidence };
}

/**
 * Classify vol‑crush risk.  High when implied volatility is significantly above realised volatility and near an event.
 */
export function classifyVolCrushRisk(
  snapshot: SurfaceSnapshot,
  events: EventWindow[],
): { risk: PositioningRisk | null; evidence: EvidenceItem[] } {
  // Determine nearest expiry IV
  const ivs = Object.values(snapshot.ivTermStructure);
  const avgIV = ivs.length ? ivs.reduce((a, b) => a + b, 0) / ivs.length : 0;
  if (avgIV === 0) {
    return { risk: null, evidence: [] };
  }
  const realised = snapshot.realisedVol;
  const ratio = realised === 0 ? avgIV : avgIV / realised;
  // Check if there is an event within 5 days
  const upcomingEvent = events.find((ev) => {
    const start = new Date(ev.start);
    const snap = new Date(snapshot.timestamp);
    const diffMs = start.getTime() - snap.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 5;
  });
  if (!upcomingEvent || ratio < 1.3) {
    return { risk: null, evidence: [] };
  }
  // Score increases with IV/realised ratio
  const ratioFactor = Math.min(1, (ratio - 1) / 1.5);
  const rawScore = 100 * ratioFactor;
  const state: RiskState = 'OK';
  const breakdown: ScoreBreakdown = {
    rules: ['ratioFactor = min(1, (IV/realised-1)/1.5)'],
    assumptions: [`avgIV=${avgIV.toFixed(3)}`, `realisedVol=${realised.toFixed(3)}`, `ratio=${ratio.toFixed(3)}`],
    disconfirmingEvidence: [],
  };
  const evidence: EvidenceItem[] = [
    {
      id: `volcrush-${snapshot.instrument}`,
      type: 'IVElevated',
      source: snapshot.instrument,
      timestamp: snapshot.timestamp,
      confidence: ratioFactor,
      state,
      reason: `Average IV ${avgIV.toFixed(3)} vs realised ${realised.toFixed(3)}, event within 5 days`,
    },
  ];
  const risk: PositioningRisk = {
    type: 'VOL_CRUSH_RISK',
    hypothesis: 'Elevated IV vs realised; risk of volatility crush',
    score: makeScore(rawScore, ratioFactor, state, breakdown),
  };
  return { risk, evidence };
}

/**
 * Classify liquidity hazard.  High when open interest and volume are very low or concentrated in a few strikes.
 */
export function classifyLiquidityHazard(
  snapshot: SurfaceSnapshot,
  clusters: PositioningCluster[],
): { risk: PositioningRisk | null; evidence: EvidenceItem[] } {
  // Compute average and min open interest
  const oiValues = snapshot.contracts.map((c) => c.openInterest);
  const avgOI = oiValues.length ? oiValues.reduce((a, b) => a + b, 0) / oiValues.length : 0;
  const minOI = oiValues.length ? Math.min(...oiValues) : 0;
  if (avgOI === 0) {
    return { risk: null, evidence: [] };
  }
  // If min OI is <5% of average, liquidity hazard exists
  const liquidityRatio = minOI / avgOI;
  if (liquidityRatio > 0.05) {
    return { risk: null, evidence: [] };
  }
  const hazardFactor = Math.min(1, (0.05 - liquidityRatio) / 0.05);
  const rawScore = 100 * hazardFactor;
  const state: RiskState = 'OK';
  const breakdown: ScoreBreakdown = {
    rules: ['hazardFactor = min(1, (0.05 - minOI/avgOI)/0.05)'],
    assumptions: [`avgOI=${avgOI.toFixed(1)}`, `minOI=${minOI.toFixed(1)}`, `liquidityRatio=${liquidityRatio.toFixed(3)}`],
    disconfirmingEvidence: [],
  };
  const evidence: EvidenceItem[] = [
    {
      id: `liquidity-${snapshot.instrument}`,
      type: 'LiquidityLow',
      source: snapshot.instrument,
      timestamp: snapshot.timestamp,
      confidence: hazardFactor,
      state,
      reason: `minOI/avgOI = ${liquidityRatio.toFixed(3)}`,
    },
  ];
  const risk: PositioningRisk = {
    type: 'LIQUIDITY_HAZARD',
    hypothesis: 'Low option liquidity may amplify price moves',
    score: makeScore(rawScore, hazardFactor, state, breakdown),
  };
  return { risk, evidence };
}

/**
 * Compute all risks for a snapshot given events and clusters.
 */
export function computeRisks(
  snapshot: SurfaceSnapshot,
  events: EventWindow[],
  clusters: PositioningCluster[],
): { risks: PositioningRisk[]; evidence: EvidenceItem[] } {
  const risks: PositioningRisk[] = [];
  const evidence: EvidenceItem[] = [];
  const { risk: pinRisk, evidence: pinEvidence } = classifyPinRisk(snapshot, clusters);
  if (pinRisk) {
    risks.push(pinRisk);
    evidence.push(...pinEvidence);
  }
  const { risk: squeezeRisk, evidence: squeezeEvidence } = classifySqueezeRisk(snapshot, clusters);
  if (squeezeRisk) {
    risks.push(squeezeRisk);
    evidence.push(...squeezeEvidence);
  }
  const { risk: volRisk, evidence: volEvidence } = classifyVolCrushRisk(snapshot, events);
  if (volRisk) {
    risks.push(volRisk);
    evidence.push(...volEvidence);
  }
  const { risk: liqRisk, evidence: liqEvidence } = classifyLiquidityHazard(snapshot, clusters);
  if (liqRisk) {
    risks.push(liqRisk);
    evidence.push(...liqEvidence);
  }
  return { risks, evidence };
}
