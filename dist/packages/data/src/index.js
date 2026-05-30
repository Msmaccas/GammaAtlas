"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadSurfaceSnapshot = loadSurfaceSnapshot;
exports.loadEventWindows = loadEventWindows;
const fs_1 = __importDefault(require("fs"));
/**
 * Read and parse a JSON file.  Returns null if file does not exist or cannot
 * be parsed.  Throws on I/O errors (other than file not found).
 */
function readJson(filePath) {
    if (!fs_1.default.existsSync(filePath)) {
        return null;
    }
    const content = fs_1.default.readFileSync(filePath, 'utf-8');
    try {
        return JSON.parse(content);
    }
    catch (err) {
        throw new Error(`Failed to parse JSON at ${filePath}: ${err.message}`);
    }
}
/**
 * Validate a surface snapshot object and collect warnings for missing or invalid
 * fields.  The returned object has missing optional fields filled with
 * defaults.
 */
function validateSurfaceSnapshot(raw) {
    const warnings = [];
    if (!raw || typeof raw !== 'object') {
        warnings.push('snapshot is not an object');
        return { snapshot: null, warnings };
    }
    // Required fields on the snapshot
    const requiredFields = [
        'instrument',
        'timestamp',
        'spotPrice',
        'realisedVol',
        'contracts',
        'ivTermStructure',
        'skew',
        'openInterestChanges',
        'state',
    ];
    requiredFields.forEach((field) => {
        if (raw[field] === undefined) {
            warnings.push(`missing field ${String(field)}`);
        }
    });
    // Validate contracts
    const contracts = Array.isArray(raw.contracts) ? raw.contracts : [];
    contracts.forEach((c, idx) => {
        ['strike', 'expiry', 'type', 'openInterest', 'volume'].forEach((f) => {
            if (c[f] === undefined)
                warnings.push(`contract[${idx}] missing ${f}`);
        });
    });
    const snapshot = {
        instrument: typeof raw.instrument === 'string' ? raw.instrument : '',
        timestamp: typeof raw.timestamp === 'string' ? raw.timestamp : '',
        spotPrice: typeof raw.spotPrice === 'number' ? raw.spotPrice : 0,
        realisedVol: typeof raw.realisedVol === 'number' ? raw.realisedVol : 0,
        contracts: contracts.map((c) => ({
            strike: typeof c.strike === 'number' ? c.strike : 0,
            expiry: typeof c.expiry === 'string' ? c.expiry : '',
            type: c.type === 'call' || c.type === 'put' ? c.type : 'call',
            openInterest: typeof c.openInterest === 'number' ? c.openInterest : 0,
            volume: typeof c.volume === 'number' ? c.volume : 0,
            impliedVol: typeof c.impliedVol === 'number' ? c.impliedVol : undefined,
            delta: typeof c.delta === 'number' ? c.delta : undefined,
            gamma: typeof c.gamma === 'number' ? c.gamma : undefined,
        })),
        ivTermStructure: typeof raw.ivTermStructure === 'object' && raw.ivTermStructure ? raw.ivTermStructure : {},
        skew: typeof raw.skew === 'object' && raw.skew ? raw.skew : {},
        openInterestChanges: typeof raw.openInterestChanges === 'object' && raw.openInterestChanges ? raw.openInterestChanges : {},
        state: raw.state || 'UNKNOWN',
    };
    return { snapshot, warnings };
}
/**
 * Validate an array of events.
 */
function validateEventsArray(raw) {
    const warnings = [];
    const events = [];
    if (!Array.isArray(raw)) {
        warnings.push('events file is not an array');
        return { events, warnings };
    }
    raw.forEach((e, idx) => {
        const missing = [];
        if (!e.instrument)
            missing.push('instrument');
        if (!e.eventType)
            missing.push('eventType');
        if (!e.description)
            missing.push('description');
        if (!e.start)
            missing.push('start');
        if (!e.end)
            missing.push('end');
        if (missing.length)
            warnings.push(`event[${idx}] missing ${missing.join(',')}`);
        events.push({
            instrument: e.instrument || '',
            eventType: e.eventType || 'OTHER',
            description: e.description || '',
            start: e.start || '',
            end: e.end || '',
        });
    });
    return { events, warnings };
}
/**
 * Load a surface snapshot for a given instrument from a file.  If the file
 * is missing, returns null.  Warnings are returned for validation issues.
 */
function loadSurfaceSnapshot(filePath) {
    const raw = readJson(filePath);
    if (!raw) {
        return { data: null, warnings: [`snapshot file not found: ${filePath}`] };
    }
    const { snapshot, warnings } = validateSurfaceSnapshot(raw);
    return { data: snapshot, warnings };
}
/**
 * Load event windows for an instrument from a file.  Returns empty array if
 * missing.  Warnings are returned for validation issues.
 */
function loadEventWindows(filePath) {
    const raw = readJson(filePath);
    if (!raw) {
        return { data: [], warnings: [`events file not found: ${filePath}`] };
    }
    const { events, warnings } = validateEventsArray(raw);
    return { data: events, warnings };
}
//# sourceMappingURL=index.js.map