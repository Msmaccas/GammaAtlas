import { SurfaceSnapshot, PositioningCluster, PositioningRisk, EvidenceItem, EventWindow } from './types';
/**
 * Identify clusters of open interest around strikes.  A cluster is defined by
 * strikes where total open interest exceeds a multiple of the median.
 */
export declare function identifyClusters(snapshot: SurfaceSnapshot): PositioningCluster[];
/**
 * Classify pin risk.  High when call and put open interest cluster around spot within ±5% and expiry is near.
 */
export declare function classifyPinRisk(snapshot: SurfaceSnapshot, clusters: PositioningCluster[]): {
    risk: PositioningRisk | null;
    evidence: EvidenceItem[];
};
/**
 * Classify squeeze risk.  Occurs when call demand vastly outweighs put demand across clusters and near‑dated expiries.
 */
export declare function classifySqueezeRisk(snapshot: SurfaceSnapshot, clusters: PositioningCluster[]): {
    risk: PositioningRisk | null;
    evidence: EvidenceItem[];
};
/**
 * Classify vol‑crush risk.  High when implied volatility is significantly above realised volatility and near an event.
 */
export declare function classifyVolCrushRisk(snapshot: SurfaceSnapshot, events: EventWindow[]): {
    risk: PositioningRisk | null;
    evidence: EvidenceItem[];
};
/**
 * Classify liquidity hazard.  High when open interest and volume are very low or concentrated in a few strikes.
 */
export declare function classifyLiquidityHazard(snapshot: SurfaceSnapshot, clusters: PositioningCluster[]): {
    risk: PositioningRisk | null;
    evidence: EvidenceItem[];
};
/**
 * Compute all risks for a snapshot given events and clusters.
 */
export declare function computeRisks(snapshot: SurfaceSnapshot, events: EventWindow[], clusters: PositioningCluster[]): {
    risks: PositioningRisk[];
    evidence: EvidenceItem[];
};
