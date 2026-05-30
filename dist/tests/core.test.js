"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTests = runTests;
const assert_1 = __importDefault(require("assert"));
const logic_1 = require("../packages/core/src/logic");
async function runTests() {
    const baseSnapshot = {
        instrument: 'TEST',
        timestamp: '2026-05-30',
        spotPrice: 200,
        realisedVol: 0.2,
        contracts: [
            { strike: 200, expiry: '2026-06-01', type: 'call', openInterest: 1000, volume: 10 },
            { strike: 200, expiry: '2026-06-01', type: 'put', openInterest: 900, volume: 10 },
            { strike: 180, expiry: '2026-06-01', type: 'call', openInterest: 200, volume: 5 },
        ],
        ivTermStructure: { '2026-06-01': 0.33 },
        skew: { '2026-06-01': 0.05 },
        openInterestChanges: {},
        state: 'OK',
    };
    {
        const clusters = [
            { strike: 200, expiry: '2026-06-01', callOpenInterest: 1000, putOpenInterest: 900, relativeDensity: 5 },
            { strike: 180, expiry: '2026-06-01', callOpenInterest: 200, putOpenInterest: 0, relativeDensity: 1 },
        ];
        const { risk } = (0, logic_1.classifyPinRisk)(baseSnapshot, clusters);
        (0, assert_1.default)(risk !== null, 'Pin risk should not be null');
        if (risk) {
            assert_1.default.strictEqual(risk.type, 'PIN_RISK');
            (0, assert_1.default)(risk.score.score > 0, 'Pin risk score should be > 0');
        }
    }
    {
        const clusters = [
            { strike: 200, expiry: '2026-06-01', callOpenInterest: 1000, putOpenInterest: 100, relativeDensity: 1 },
            { strike: 180, expiry: '2026-06-01', callOpenInterest: 500, putOpenInterest: 50, relativeDensity: 1 },
        ];
        const { risk } = (0, logic_1.classifySqueezeRisk)(baseSnapshot, clusters);
        (0, assert_1.default)(risk !== null, 'Squeeze risk should not be null');
        if (risk) {
            assert_1.default.strictEqual(risk.type, 'SQUEEZE_RISK');
            (0, assert_1.default)(risk.score.score > 0, 'Squeeze risk score should be > 0');
        }
    }
    {
        const events = [
            { instrument: 'TEST', eventType: 'EARNINGS', description: 'Earnings', start: '2026-06-02', end: '2026-06-02' },
        ];
        const snapshot = { ...baseSnapshot, ivTermStructure: { '2026-06-01': 0.5 }, realisedVol: 0.1 };
        const { risk } = (0, logic_1.classifyVolCrushRisk)(snapshot, events);
        (0, assert_1.default)(risk !== null, 'Vol crush risk should not be null');
        if (risk) {
            assert_1.default.strictEqual(risk.type, 'VOL_CRUSH_RISK');
        }
    }
    {
        const snapshot = { ...baseSnapshot, contracts: [
                { strike: 200, expiry: '2026-06-01', type: 'call', openInterest: 1000, volume: 10 },
                { strike: 220, expiry: '2026-06-01', type: 'call', openInterest: 1, volume: 1 },
            ] };
        const { risk } = (0, logic_1.classifyLiquidityHazard)(snapshot, []);
        (0, assert_1.default)(risk !== null, 'Liquidity hazard should not be null');
        if (risk) {
            assert_1.default.strictEqual(risk.type, 'LIQUIDITY_HAZARD');
        }
    }
}
//# sourceMappingURL=core.test.js.map