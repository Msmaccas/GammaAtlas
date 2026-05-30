import {
  InstrumentResult,
  EvidenceItem,
  RunResult,
} from '../../core/src/types';
import { DataProvider } from '../../providers/src/index';
import {
  surfaceAnalystAgent,
  eventAnalystAgent,
  liquiditySkepticAgent,
  spotContextAnalystAgent,
  synthesisLeadAgent,
} from '../../agents/src/index';

/**
 * Analyse a single instrument by orchestrating provider calls and agent
 * processing.  Returns an InstrumentResult, evidence items, and warnings.
 */
export async function analyseInstrument(instrument: string, provider: DataProvider): Promise<{ result: InstrumentResult | null; evidence: EvidenceItem[]; warnings: string[] }> {
  const snapshot = await provider.fetchSnapshot(instrument);
  const events = await provider.fetchEvents(instrument);
  const warnings: string[] = provider.getWarnings();
  if (!snapshot) {
    warnings.push(`no snapshot available for ${instrument}`);
    return { result: null, evidence: [], warnings };
  }
  const surfaceRes = surfaceAnalystAgent(snapshot);
  const eventRes = eventAnalystAgent(snapshot, events);
  const liquidityRes = liquiditySkepticAgent(snapshot);
  const spotRes = spotContextAnalystAgent(snapshot);
  const result = synthesisLeadAgent(instrument, [surfaceRes, eventRes, liquidityRes, spotRes]);
  const evidence: EvidenceItem[] = [];
  [surfaceRes, eventRes, liquidityRes, spotRes].forEach((res) => evidence.push(...res.evidence));
  return { result, evidence, warnings };
}

/**
 * Analyse a watchlist of instruments.  Produces a RunResult with the
 * aggregated evidence and warnings.
 */
export async function analyseWatchlist(instruments: string[], provider: DataProvider): Promise<RunResult> {
  const instrumentResults: InstrumentResult[] = [];
  const evidence: EvidenceItem[] = [];
  const warnings: string[] = [];
  for (const instrument of instruments) {
    const { result, evidence: ev, warnings: w } = await analyseInstrument(instrument, provider);
    if (result) {
      instrumentResults.push(result);
    }
    evidence.push(...ev);
    warnings.push(...w);
  }
  return {
    date: new Date().toISOString(),
    instrumentResults,
    evidence,
    warnings,
  };
}