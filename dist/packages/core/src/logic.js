"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifyClusters = identifyClusters;
exports.classifyPinRisk = classifyPinRisk;
exports.classifySqueezeRisk = classifySqueezeRisk;
exports.classifyVolCrushRisk = classifyVolCrushRisk;
exports.classifyLiquidityHazard = classifyLiquidityHazard;
exports.computeRisks = computeRisks;
/**
 * Identify clusters of open interest around strikes.  A cluster is defined by
 * strikes where total open interest exceeds a multiple of the median.
 */
function identifyClusters(snapshot) {
    const byKey = {};
    snapshot.contracts.forEach((c) => {
        const key = `${c.strike}-${c.expiry}`;
        byKey[key] = byKey[key] || { callOI: 0, putOI: 0 };
        if (c.type === 'call') {
            byKey[key].callOI += c.openInterest;
        }
        else {
            byKey[key].putOI += c.openInterest;
        }
    });
    const densities = [];
    Object.values(byKey).forEach((val) => densities.push(val.callOI + val.putOI));
    const median = densities.sort((a, b) => a - b)[Math.floor(densities.length / 2)] || 0;
    const clusters = [];
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
function makeScore(value, confidence, state, breakdown) {
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
function daysToExpiry(snapshotTime, expiry) {
    const snap = new Date(snapshotTime);
    const exp = new Date(expiry);
    const diffMs = exp.getTime() - snap.getTime();
    return diffMs / (1000 * 60 * 60 * 24);
}
/**
 * Classify pin risk.  High when call and put open interest cluster around spot within ±5% and expiry is near.
 */
function classifyPinRisk(snapshot, clusters) {
    const evidence = [];
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
    const state = rawScore > 0 ? 'OK' : 'NOT_AVAILABLE';
    const breakdown = {
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
    const risk = {
        type: 'PIN_RISK',
        hypothesis: `High gamma pin risk near ${cluster.strike.toFixed(0)}`,
        score: makeScore(rawScore, densityFactor * timeFactor, state, breakdown),
    };
    return { risk, evidence };
}
/**
 * Classify squeeze risk.  Occurs when call demand vastly outweighs put demand across clusters and near‑dated expiries.
 */
function classifySqueezeRisk(snapshot, clusters) {
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
    const state = 'OK';
    const breakdown = {
        rules: [
            'ratioFactor = min(1, callPutRatio/5)',
            'skewFactor = min(1, avgSkew/0.1)',
        ],
        assumptions: [`callPutRatio=${callPutRatio.toFixed(2)}`, `avgSkew=${avgSkew.toFixed(4)}`],
        disconfirmingEvidence: [],
    };
    const evidence = [
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
    const risk = {
        type: 'SQUEEZE_RISK',
        hypothesis: 'Elevated call crowding; potential squeeze risk',
        score: makeScore(rawScore, ratioFactor * skewFactor, state, breakdown),
    };
    return { risk, evidence };
}
/**
 * Classify vol‑crush risk.  High when implied volatility is significantly above realised volatility and near an event.
 */
function classifyVolCrushRisk(snapshot, events) {
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
    const state = 'OK';
    const breakdown = {
        rules: ['ratioFactor = min(1, (IV/realised-1)/1.5)'],
        assumptions: [`avgIV=${avgIV.toFixed(3)}`, `realisedVol=${realised.toFixed(3)}`, `ratio=${ratio.toFixed(3)}`],
        disconfirmingEvidence: [],
    };
    const evidence = [
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
    const risk = {
        type: 'VOL_CRUSH_RISK',
        hypothesis: 'Elevated IV vs realised; risk of volatility crush',
        score: makeScore(rawScore, ratioFactor, state, breakdown),
    };
    return { risk, evidence };
}
/**
 * Classify liquidity hazard.  High when open interest and volume are very low or concentrated in a few strikes.
 */
function classifyLiquidityHazard(snapshot, clusters) {
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
    const state = 'OK';
    const breakdown = {
        rules: ['hazardFactor = min(1, (0.05 - minOI/avgOI)/0.05)'],
        assumptions: [`avgOI=${avgOI.toFixed(1)}`, `minOI=${minOI.toFixed(1)}`, `liquidityRatio=${liquidityRatio.toFixed(3)}`],
        disconfirmingEvidence: [],
    };
    const evidence = [
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
    const risk = {
        type: 'LIQUIDITY_HAZARD',
        hypothesis: 'Low option liquidity may amplify price moves',
        score: makeScore(rawScore, hazardFactor, state, breakdown),
    };
    return { risk, evidence };
}
/**
 * Compute all risks for a snapshot given events and clusters.
 */
function computeRisks(snapshot, events, clusters) {
    const risks = [];
    const evidence = [];
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
//# sourceMappingURL=logic.js.map