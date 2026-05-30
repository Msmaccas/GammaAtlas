export type RiskState = 'UNKNOWN' | 'NOT_AVAILABLE' | 'LOW_CONFIDENCE' | 'MANUAL_REVIEW' | 'OK';
/**
 * Represents a single option contract on a strike/expiry.
 */
export interface OptionContract {
    strike: number;
    expiry: string;
    type: 'call' | 'put';
    openInterest: number;
    volume: number;
    impliedVol?: number;
    delta?: number;
    gamma?: number;
}
/**
 * Snapshot of an option chain and related metrics at a specific time.
 */
export interface SurfaceSnapshot {
    instrument: string;
    timestamp: string;
    spotPrice: number;
    realisedVol: number;
    contracts: OptionContract[];
    ivTermStructure: Record<string, number>;
    skew: Record<string, number>;
    openInterestChanges: Record<string, number>;
    state: RiskState;
}
/**
 * Represents a window around a corporate or macro event (e.g., earnings).  Start and end are inclusive UTC timestamps.
 */
export interface EventWindow {
    instrument: string;
    eventType: 'EARNINGS' | 'DIVIDEND' | 'MACRO' | 'NONE' | 'OTHER';
    description: string;
    start: string;
    end: string;
}
/**
 * A cluster of positioning activity at a strike/expiry.  Used for initial grouping before assigning risk types.
 */
export interface PositioningCluster {
    strike: number;
    expiry: string;
    callOpenInterest: number;
    putOpenInterest: number;
    relativeDensity: number;
}
/**
 * Breakdown of how a score was computed.
 */
export interface ScoreBreakdown {
    rules: string[];
    assumptions: string[];
    disconfirmingEvidence: string[];
}
/**
 * A quantitative score with context and state.
 */
export interface RiskScore {
    score: number;
    confidence: number;
    state: RiskState;
    breakdown: ScoreBreakdown;
}
export type PositioningRiskType = 'PIN_RISK' | 'SQUEEZE_RISK' | 'VOL_CRUSH_RISK' | 'LIQUIDITY_HAZARD';
/**
 * A classified risk hypothesis for an instrument.
 */
export interface PositioningRisk {
    type: PositioningRiskType;
    hypothesis: string;
    score: RiskScore;
}
export interface InstrumentResult {
    instrument: string;
    risks: PositioningRisk[];
}
/**
 * Single evidence item used to support a risk hypothesis.
 */
export interface EvidenceItem {
    id: string;
    type: string;
    source: string;
    timestamp: string;
    confidence: number;
    state: RiskState;
    reason?: string;
}
/**
 * Top level run result produced by the pipeline.
 */
export interface RunResult {
    date: string;
    instrumentResults: InstrumentResult[];
    evidence: EvidenceItem[];
    warnings: string[];
}
