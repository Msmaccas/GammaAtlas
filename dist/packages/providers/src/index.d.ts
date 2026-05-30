import { SurfaceSnapshot, EventWindow } from '../../core/src/types';
/**
 * Provider interface for fetching option surface snapshots and event windows.
 */
export interface DataProvider {
    fetchSnapshot(instrument: string): Promise<SurfaceSnapshot | null>;
    fetchEvents(instrument: string): Promise<EventWindow[]>;
    getWarnings(): string[];
}
/**
 * FileProvider loads data from the fixtures directory.  It accepts a base
 * directory and returns snapshots and events for a given instrument.  It
 * collects warnings generated during validation and allows retrieval via
 * `getWarnings()`.
 */
export declare class FileProvider implements DataProvider {
    private baseDir;
    private warnings;
    constructor(baseDir: string);
    fetchSnapshot(instrument: string): Promise<SurfaceSnapshot | null>;
    fetchEvents(instrument: string): Promise<EventWindow[]>;
    getWarnings(): string[];
}
