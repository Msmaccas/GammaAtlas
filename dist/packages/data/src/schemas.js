"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventsSchema = exports.eventWindowSchema = exports.surfaceSnapshotSchema = exports.optionContractSchema = void 0;
/*
 * JSON Schemas for validating input fixtures.  These are deliberately
 * permissive to allow unknown fields but require core properties.  Clients
 * may extend objects, but core fields must exist with correct types.
 */
// Schema for an option contract entry within a snapshot.
exports.optionContractSchema = {
    type: 'object',
    properties: {
        strike: { type: 'number' },
        expiry: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
        type: { type: 'string', enum: ['call', 'put'] },
        openInterest: { type: 'number' },
        volume: { type: 'number' },
        impliedVol: { type: 'number', nullable: true, optional: true },
        delta: { type: 'number', nullable: true, optional: true },
        gamma: { type: 'number', nullable: true, optional: true },
    },
    required: ['strike', 'expiry', 'type', 'openInterest', 'volume'],
    additionalProperties: true,
};
// Schema for a surface snapshot.  Contains an array of option contracts.
exports.surfaceSnapshotSchema = {
    type: 'object',
    properties: {
        instrument: { type: 'string' },
        timestamp: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}' },
        spotPrice: { type: 'number' },
        realisedVol: { type: 'number' },
        contracts: {
            type: 'array',
            items: exports.optionContractSchema,
        },
        ivTermStructure: {
            type: 'object',
            // keys are expiry strings; values are numbers (IV)
            additionalProperties: { type: 'number' },
        },
        skew: {
            type: 'object',
            additionalProperties: { type: 'number' },
        },
        openInterestChanges: {
            type: 'object',
            additionalProperties: { type: 'number' },
        },
        state: { type: 'string', enum: ['UNKNOWN', 'NOT_AVAILABLE', 'LOW_CONFIDENCE', 'MANUAL_REVIEW', 'OK'] },
    },
    required: ['instrument', 'timestamp', 'spotPrice', 'realisedVol', 'contracts', 'ivTermStructure', 'skew', 'openInterestChanges', 'state'],
    additionalProperties: true,
};
// Schema for an event window entry.
exports.eventWindowSchema = {
    type: 'object',
    properties: {
        instrument: { type: 'string' },
        eventType: { type: 'string', enum: ['EARNINGS', 'DIVIDEND', 'MACRO', 'NONE', 'OTHER'] },
        description: { type: 'string' },
        start: { type: 'string' },
        end: { type: 'string' },
    },
    required: ['instrument', 'eventType', 'description', 'start', 'end'],
    additionalProperties: true,
};
// Schema for an array of event windows.
exports.eventsSchema = {
    type: 'array',
    items: exports.eventWindowSchema,
    additionalItems: true,
};
//# sourceMappingURL=schemas.js.map