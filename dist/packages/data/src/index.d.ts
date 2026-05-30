import { SurfaceSnapshot, EventWindow } from '../../core/src/types';
/**
 * Data loading and validation utilities.
 *
 * These helper functions read JSON fixtures from disk and perform basic
 * validation, returning warnings for missing fields.  They avoid external
 * dependencies in favour of simple checks.
 */
export interface LoadResult<T> {
    data: T | null;
    warnings: string[];
}
/**
 * Load a surface snapshot for a given instrument from a file.  If the file
 * is missing, returns null.  Warnings are returned for validation issues.
 */
export declare function loadSurfaceSnapshot(filePath: string): LoadResult<SurfaceSnapshot>;
/**
 * Load event windows for an instrument from a file.  Returns empty array if
 * missing.  Warnings are returned for validation issues.
 */
export declare function loadEventWindows(filePath: string): LoadResult<EventWindow[]>;
