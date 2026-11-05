const { spawnSync } = require('node:child_process');
const path = require('node:path');
const suites = [
  'test-scenarios', 'test-phase4-scenarios', 'test-phase5-scenarios',
  'test-phase6-scenarios', 'test-ux-flow', 'test-phase7-scenarios',
  'test-parse-file', 'test-report-integrity', 'test-parser-route',
];
const selected = process.argv.slice(2);
if (selected.some(s => !suites.includes(s))) throw new Error('Unknown test suite');
for (const suite of selected.length ? selected : suites) {
  console.log(`\n=== ${suite} ===`);
  const result = spawnSync(process.execPath, ['--unhandled-rejections=strict', '-r', path.join(__dirname, 'register-tests.cjs'), `src/lib/${suite}.ts`], {
    stdio: 'inherit', cwd: path.resolve(__dirname, '..'), timeout: 120000,
    env: { ...process.env, GEMINI_API_KEY: '', NODE_ENV: 'test' },
  });
  if (result.error) console.error(result.error);
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log('\nAll selected regression suites passed.');
