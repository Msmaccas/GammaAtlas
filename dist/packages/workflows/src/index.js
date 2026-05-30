"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyseInstrument = analyseInstrument;
exports.analyseWatchlist = analyseWatchlist;
const index_1 = require("../../agents/src/index");
/**
 * Analyse a single instrument by orchestrating provider calls and agent
 * processing.  Returns an InstrumentResult, evidence items, and warnings.
 */
async function analyseInstrument(instrument, provider) {
    const snapshot = await provider.fetchSnapshot(instrument);
    const events = await provider.fetchEvents(instrument);
    const warnings = provider.getWarnings();
    if (!snapshot) {
        warnings.push(`no snapshot available for ${instrument}`);
        return { result: null, evidence: [], warnings };
    }
    const surfaceRes = (0, index_1.surfaceAnalystAgent)(snapshot);
    const eventRes = (0, index_1.eventAnalystAgent)(snapshot, events);
    const liquidityRes = (0, index_1.liquiditySkepticAgent)(snapshot);
    const spotRes = (0, index_1.spotContextAnalystAgent)(snapshot);
    const result = (0, index_1.synthesisLeadAgent)(instrument, [surfaceRes, eventRes, liquidityRes, spotRes]);
    const evidence = [];
    [surfaceRes, eventRes, liquidityRes, spotRes].forEach((res) => evidence.push(...res.evidence));
    return { result, evidence, warnings };
}
/**
 * Analyse a watchlist of instruments.  Produces a RunResult with the
 * aggregated evidence and warnings.
 */
async function analyseWatchlist(instruments, provider) {
    const instrumentResults = [];
    const evidence = [];
    const warnings = [];
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
//# sourceMappingURL=index.js.map