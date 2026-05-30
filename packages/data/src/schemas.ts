// Stub out JSONSchemaType to avoid external dependency on ajv.  This file
// remains only for reference and is not used by runtime code.
export type JSONSchemaType<T> = any;
import { OptionContract, SurfaceSnapshot, EventWindow } from '../../core/src/types';

/*
 * JSON Schemas for validating input fixtures.  These are deliberately
 * permissive to allow unknown fields but require core properties.  Clients
 * may extend objects, but core fields must exist with correct types.
 */

// Schema for an option contract entry within a snapshot.
export const optionContractSchema: JSONSchemaType<OptionContract> = {
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
export const surfaceSnapshotSchema: JSONSchemaType<SurfaceSnapshot> = {
  type: 'object',
  properties: {
    instrument: { type: 'string' },
    timestamp: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}' },
    spotPrice: { type: 'number' },
    realisedVol: { type: 'number' },
    contracts: {
      type: 'array',
      items: optionContractSchema,
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
export const eventWindowSchema: JSONSchemaType<EventWindow> = {
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
export const eventsSchema: JSONSchemaType<EventWindow[]> = {
  type: 'array',
  items: eventWindowSchema,
  additionalItems: true,
};