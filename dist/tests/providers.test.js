"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTests = runTests;
const assert_1 = __importDefault(require("assert"));
const path_1 = __importDefault(require("path"));
const index_1 = require("../packages/providers/src/index");
async function runTests() {
    const dataDir = path_1.default.resolve(__dirname, '..', '..', 'fixtures');
    {
        const provider = new index_1.FileProvider(dataDir);
        const snapshot = await provider.fetchSnapshot('AAPL');
        (0, assert_1.default)(snapshot !== null, 'Provider should return snapshot for AAPL');
        if (snapshot) {
            assert_1.default.strictEqual(snapshot.instrument, 'AAPL');
            (0, assert_1.default)(snapshot.contracts.length > 0, 'Snapshot should contain contracts');
        }
        const events = await provider.fetchEvents('AAPL');
        (0, assert_1.default)(events.length > 0, 'Provider should return events for AAPL');
        assert_1.default.strictEqual(events[0].instrument, 'AAPL');
        const warnings = provider.getWarnings();
        assert_1.default.strictEqual(warnings.length, 0, 'Provider should have no warnings for AAPL');
    }
    {
        const provider = new index_1.FileProvider(dataDir);
        const snapshot = await provider.fetchSnapshot('MISSING');
        assert_1.default.strictEqual(snapshot, null, 'Provider should return null for missing instrument');
        const events = await provider.fetchEvents('MISSING');
        assert_1.default.strictEqual(events.length, 0, 'Provider should return empty events for missing instrument');
    }
}
//# sourceMappingURL=providers.test.js.map