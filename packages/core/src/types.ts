/*
 * Core domain types for GammaAtlas.
 *
 * These types define the lifecycle of data through the pipeline.  Each object
 * includes a `state` indicating data quality.  Use explicit values rather
 * than nulls to avoid confusion.
 */

export type RiskState =
  | 'UNKNOWN'
  | 'NOT_AVAILABLE'
  | 'LOW_CONFIDENCE'
  | 'MANUAL_REVIEW'
  | 'OK';

/**
 * Represents a single option contract on a strike/expiry.
 */
export interface OptionContract {
  strike: number;
  expiry: string; // ISO date string (YYYY-MM-DD)
  type: 'call' | 'put';
  openInterest: number;
  volume: number;
  impliedVol?: number; // undefined if not provided
  delta?: number;
  gamma?: number;
}

/**
 * Snapshot of an option chain and related metrics at a specific time.
 */
export interface SurfaceSnapshot {
  instrument: string;
  timestamp: string; // ISO date string
  spotPrice: number;
  realisedVol: number; // realised volatility over a lookback window (annualised)
  contracts: OptionContract[];
  ivTermStructure: Record<string, number>; // expiry -> implied vol
  skew: Record<string, number>; // expiry -> call minus put IV difference
  openInterestChanges: Record<string, number>; // strike-expiry key -> change in OI vs previous snapshot
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
  relativeDensity: number; // ratio of OI at cluster vs average across chain
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
  score: number; // 0-100
  confidence: number; // 0-1
  state: RiskState;
  breakdown: ScoreBreakdown;
}

export type PositioningRiskType =
  | 'PIN_RISK'
  | 'SQUEEZE_RISK'
  | 'VOL_CRUSH_RISK'
  | 'LIQUIDITY_HAZARD';

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
