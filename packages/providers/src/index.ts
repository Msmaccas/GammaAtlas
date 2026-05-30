import path from 'path';
import { SurfaceSnapshot, EventWindow } from '../../core/src/types';
import { loadSurfaceSnapshot, loadEventWindows, LoadResult } from '../../data/src/index';

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
export class FileProvider implements DataProvider {
  private baseDir: string;
  private warnings: string[];
  constructor(baseDir: string) {
    this.baseDir = baseDir;
    this.warnings = [];
  }
  async fetchSnapshot(instrument: string): Promise<SurfaceSnapshot | null> {
    const file = path.join(this.baseDir, 'options_chains', `${instrument}.json`);
    const { data, warnings } = loadSurfaceSnapshot(file);
    this.warnings.push(...warnings);
    return data;
  }
  async fetchEvents(instrument: string): Promise<EventWindow[]> {
    const file = path.join(this.baseDir, 'events', `${instrument}.json`);
    const { data, warnings } = loadEventWindows(file);
    this.warnings.push(...warnings);
    return data || [];
  }
  getWarnings(): string[] {
    return this.warnings;
  }
}