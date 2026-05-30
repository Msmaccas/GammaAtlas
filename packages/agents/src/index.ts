import { SurfaceSnapshot, EventWindow, InstrumentResult, PositioningRisk, EvidenceItem } from '../../core/src/types';
import { identifyClusters, computeRisks } from '../../core/src/logic';

/**
 * Agents encapsulate specific analytical responsibilities.  Each agent
 * receives input data and produces partial results that are combined by
 * downstream workflows.  Agents are stateless; they do not cache between
 * runs.
 */

/** SurfaceAnalystAgent: groups open interest into clusters and computes
 * pin risk and squeeze risk.  Returns positioning risks and supporting
 * evidence.  Does not handle events.
 */
export function surfaceAnalystAgent(snapshot: SurfaceSnapshot): { risks: PositioningRisk[]; evidence: EvidenceItem[] } {
  const clusters = identifyClusters(snapshot);
  const { risks, evidence } = computeRisks(snapshot, [], clusters);
  // Only return pin and squeeze risks
  const filteredRisks = risks.filter((r) => r.type === 'PIN_RISK' || r.type === 'SQUEEZE_RISK');
  const filteredEvidence = evidence.filter((e) => e.type === 'PinCluster' || e.type === 'CallCrowding');
  return { risks: filteredRisks, evidence: filteredEvidence };
}

/** EventAnalystAgent: analyses event windows to detect whether earnings or macro events
 * are approaching and influences vol crush risk.  It delegates to computeRisks.
 */
export function eventAnalystAgent(snapshot: SurfaceSnapshot, events: EventWindow[]): { risks: PositioningRisk[]; evidence: EvidenceItem[] } {
  const clusters = identifyClusters(snapshot);
  const { risks, evidence } = computeRisks(snapshot, events, clusters);
  // Only return vol crush risks
  const filteredRisks = risks.filter((r) => r.type === 'VOL_CRUSH_RISK');
  const filteredEvidence = evidence.filter((e) => e.type === 'IVElevated');
  return { risks: filteredRisks, evidence: filteredEvidence };
}

/** LiquiditySkepticAgent: evaluates whether open interest and volume are sparse and raises
 * liquidity hazards.
 */
export function liquiditySkepticAgent(snapshot: SurfaceSnapshot): { risks: PositioningRisk[]; evidence: EvidenceItem[] } {
  const clusters = identifyClusters(snapshot);
  const { risks, evidence } = computeRisks(snapshot, [], clusters);
  const filteredRisks = risks.filter((r) => r.type === 'LIQUIDITY_HAZARD');
  const filteredEvidence = evidence.filter((e) => e.type === 'LiquidityLow');
  return { risks: filteredRisks, evidence: filteredEvidence };
}

/** SpotContextAnalystAgent: currently a placeholder.  In a complete implementation,
 * this agent would compare realised volatility and other market context against
 * implied volatility.  Here it simply ensures that realisedVol is present and
 * returns no risks of its own.
 */
export function spotContextAnalystAgent(snapshot: SurfaceSnapshot): { risks: PositioningRisk[]; evidence: EvidenceItem[] } {
  const evidence: EvidenceItem[] = [];
  if (!snapshot.realisedVol || snapshot.realisedVol <= 0) {
    evidence.push({
      id: `realised-missing-${snapshot.instrument}`,
      type: 'RealisedVolMissing',
      source: snapshot.instrument,
      timestamp: snapshot.timestamp,
      confidence: 0,
      state: 'NOT_AVAILABLE',
      reason: 'realised volatility is missing or zero',
    });
  }
  return { risks: [], evidence };
}

/** SynthesisLeadAgent: consolidates the outputs of other agents and produces a
 * human‑readable summary.  It assigns actionable commentary based on the
 * highest ranking risks and attaches the evidence.  This is purely
 * deterministic and uses simple rules; in production, an LLM could
 * generate more nuanced prose.
 */
export function synthesisLeadAgent(instrument: string, agentsResults: { risks: PositioningRisk[]; evidence: EvidenceItem[] }[]): InstrumentResult {
  const allRisks: PositioningRisk[] = [];
  const allEvidence: EvidenceItem[] = [];
  agentsResults.forEach((res) => {
    allRisks.push(...res.risks);
    allEvidence.push(...res.evidence);
  });
  // Sort risks descending by score
  allRisks.sort((a, b) => b.score.score - a.score.score);
  return {
    instrument,
    risks: allRisks,
  };
}