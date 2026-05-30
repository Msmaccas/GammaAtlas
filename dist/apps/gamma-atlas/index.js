#!/usr/bin/env node
"use strict";
/*
 * Entry point for the GammaAtlas application. This file is located at the root of the
 * app (outside of the `src` directory) so that it compiles directly into
 * `dist/apps/gamma-atlas/index.js`. The root `package.json` specifies `npm start` to
 * execute that compiled file. In development you can run `npm start` after
 * building to launch the HTTP server.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../packages/server/src/index");
// Launch the HTTP server. This delegates all logic to the server package.
(0, index_1.startServer)();
//# sourceMappingURL=index.js.map