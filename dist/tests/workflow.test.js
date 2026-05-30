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
async function runTests() {
    const dataDir = path_1.default.resolve(__dirname, '..', '..', 'fixtures');
    {
        const provider = new index_1.FileProvider(dataDir);
        const { result, evidence, warnings } = await (0, index_2.analyseInstrument)('AAPL', provider);
        (0, assert_1.default)(result !== null, 'analyseInstrument should return a result for AAPL');
        (0, assert_1.default)(evidence.length > 0, 'evidence should not be empty');
        (0, assert_1.default)(warnings.length === 0, 'there should be no warnings for AAPL');
        if (result) {
            (0, assert_1.default)(result.risks.length > 0, 'result should contain risks');
        }
    }
    {
        const provider = new index_1.FileProvider(dataDir);
        const run = await (0, index_2.analyseWatchlist)(['AAPL', 'MISSING'], provider);
        (0, assert_1.default)(run.instrumentResults.length > 0, 'instrumentResults should not be empty');
        (0, assert_1.default)(run.warnings.some((w) => w.includes('no snapshot')), 'warnings should include missing snapshot');
    }
}
//# sourceMappingURL=workflow.test.js.map