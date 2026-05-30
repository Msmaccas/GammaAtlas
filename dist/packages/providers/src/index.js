"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileProvider = void 0;
const path_1 = __importDefault(require("path"));
const index_1 = require("../../data/src/index");
/**
 * FileProvider loads data from the fixtures directory.  It accepts a base
 * directory and returns snapshots and events for a given instrument.  It
 * collects warnings generated during validation and allows retrieval via
 * `getWarnings()`.
 */
class FileProvider {
    constructor(baseDir) {
        this.baseDir = baseDir;
        this.warnings = [];
    }
    async fetchSnapshot(instrument) {
        const file = path_1.default.join(this.baseDir, 'options_chains', `${instrument}.json`);
        const { data, warnings } = (0, index_1.loadSurfaceSnapshot)(file);
        this.warnings.push(...warnings);
        return data;
    }
    async fetchEvents(instrument) {
        const file = path_1.default.join(this.baseDir, 'events', `${instrument}.json`);
        const { data, warnings } = (0, index_1.loadEventWindows)(file);
        this.warnings.push(...warnings);
        return data || [];
    }
    getWarnings() {
        return this.warnings;
    }
}
exports.FileProvider = FileProvider;
//# sourceMappingURL=index.js.map