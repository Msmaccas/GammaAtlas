const fs = require('fs');
const path = require('path');

async function run() {
  const testsDir = path.join(__dirname, '..', 'dist', 'tests');
  const testFiles = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        testFiles.push(fullPath);
      }
    }
  }
  if (!fs.existsSync(testsDir)) {
    console.error('Compiled tests directory not found. Did you run build?');
    process.exit(1);
  }
  walk(testsDir);
  let failures = 0;
  for (const file of testFiles) {
    const relative = path.relative(path.join(__dirname, '..', 'dist'), file);
    try {
      const mod = require(file);
      if (mod && typeof mod.runTests === 'function') {
        await mod.runTests();
        console.log(`✓ ${relative}`);
      }
    } catch (err) {
      failures++;
      console.error(`✗ ${relative}:`, err);
    }
  }
  if (failures > 0) {
    console.error(`${failures} test(s) failed.`);
    process.exit(1);
  } else {
    console.log('All tests passed.');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});