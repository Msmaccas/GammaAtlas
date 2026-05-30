import { SurfaceSnapshot, EventWindow, InstrumentResult, PositioningRisk, EvidenceItem } from '../../core/src/types';
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
export declare function surfaceAnalystAgent(snapshot: SurfaceSnapshot): {
    risks: PositioningRisk[];
    evidence: EvidenceItem[];
};
/** EventAnalystAgent: analyses event windows to detect whether earnings or macro events
 * are approaching and influences vol crush risk.  It delegates to computeRisks.
 */
export declare function eventAnalystAgent(snapshot: SurfaceSnapshot, events: EventWindow[]): {
    risks: PositioningRisk[];
    evidence: EvidenceItem[];
};
/** LiquiditySkepticAgent: evaluates whether open interest and volume are sparse and raises
 * liquidity hazards.
 */
export declare function liquiditySkepticAgent(snapshot: SurfaceSnapshot): {
    risks: PositioningRisk[];
    evidence: EvidenceItem[];
};
/** SpotContextAnalystAgent: currently a placeholder.  In a complete implementation,
 * this agent would compare realised volatility and other market context against
 * implied volatility.  Here it simply ensures that realisedVol is present and
 * returns no risks of its own.
 */
export declare function spotContextAnalystAgent(snapshot: SurfaceSnapshot): {
    risks: PositioningRisk[];
    evidence: EvidenceItem[];
};
/** SynthesisLeadAgent: consolidates the outputs of other agents and produces a
 * human‑readable summary.  It assigns actionable commentary based on the
 * highest ranking risks and attaches the evidence.  This is purely
 * deterministic and uses simple rules; in production, an LLM could
 * generate more nuanced prose.
 */
export declare function synthesisLeadAgent(instrument: string, agentsResults: {
    risks: PositioningRisk[];
    evidence: EvidenceItem[];
}[]): InstrumentResult;
