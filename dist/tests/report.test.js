"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTests = runTests;
const assert_1 = __importDefault(require("assert"));
const path_1 = __importDefault(require("path"));
const index_1 = require("../packages/providers/src/index");
const index_2 = require("../packages/workflows/src/index");
const index_3 = require("../packages/reports/src/index");
async function runTests() {
    const dataDir = path_1.default.resolve(__dirname, '..', '..', 'fixtures');
    const provider = new index_1.FileProvider(dataDir);
    const run = await (0, index_2.analyseWatchlist)(['AAPL'], provider);
    const md = (0, index_3.generateMarkdownReport)(run);
    const ledger = (0, index_3.generateEvidenceLedger)(run);
    (0, assert_1.default)(md.includes('# GammaAtlas Report'), 'Markdown report should contain header');
    (0, assert_1.default)(md.includes('AAPL'), 'Markdown report should mention instrument');
    (0, assert_1.default)(/PIN_RISK|SQUEEZE_RISK|VOL_CRUSH_RISK|LIQUIDITY_HAZARD/.test(md), 'Markdown report should list risk types');
    const parsed = JSON.parse(ledger);
    (0, assert_1.default)(Array.isArray(parsed.evidence), 'Evidence ledger should contain evidence array');
}
//# sourceMappingURL=report.test.js.map