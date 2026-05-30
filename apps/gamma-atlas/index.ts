#!/usr/bin/env node
/*
 * Entry point for the GammaAtlas application. This file is located at the root of the
 * app (outside of the `src` directory) so that it compiles directly into
 * `dist/apps/gamma-atlas/index.js`. The root `package.json` specifies `npm start` to
 * execute that compiled file. In development you can run `npm start` after
 * building to launch the HTTP server.
 */

import { startServer } from '../../packages/server/src/index';

// Launch the HTTP server. This delegates all logic to the server package.
startServer();