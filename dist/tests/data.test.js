"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTests = runTests;
const assert_1 = __importDefault(require("assert"));
const path_1 = __importDefault(require("path"));
const index_1 = require("../packages/data/src/index");
async function runTests() {
    const fixturesDir = path_1.default.resolve(__dirname, '..', '..', 'fixtures');
    {
        const file = path_1.default.join(fixturesDir, 'options_chains', 'AAPL.json');
        const { data, warnings } = (0, index_1.loadSurfaceSnapshot)(file);
        (0, assert_1.default)(data !== null, 'AAPL snapshot should not be null');
        if (data) {
            assert_1.default.strictEqual(data.instrument, 'AAPL');
        }
        assert_1.default.strictEqual(warnings.length, 0, 'AAPL snapshot should have no warnings');
    }
    {
        const file = path_1.default.join(fixturesDir, 'events', 'AAPL.json');
        const { data, warnings } = (0, index_1.loadEventWindows)(file);
        (0, assert_1.default)(data !== null, 'AAPL events should not be null');
        assert_1.default.strictEqual(warnings.length, 0, 'AAPL events should have no warnings');
        if (data) {
            (0, assert_1.default)(data.length > 0, 'AAPL events should have entries');
            assert_1.default.strictEqual(data[0].instrument, 'AAPL');
        }
    }
    {
        const file = path_1.default.join(fixturesDir, 'hostile', 'options_chains', 'BAD.json');
        const { warnings } = (0, index_1.loadSurfaceSnapshot)(file);
        (0, assert_1.default)(warnings.length > 0, 'Hostile snapshot should produce warnings');
    }
}
//# sourceMappingURL=data.test.js.map