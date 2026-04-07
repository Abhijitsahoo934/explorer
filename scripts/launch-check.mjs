import { spawnSync } from 'node:child_process';

const smokeUrl = (process.argv[2] ?? process.env.SMOKE_BASE_URL ?? '').trim();

function run(name, command, args, options = {}) {
  console.log(`\n=== ${name} ===`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: true,
    ...options,
  });

  if (result.status !== 0) {
    console.error(`FAIL: ${name} failed.`);
    process.exit(result.status ?? 1);
  }

  console.log(`PASS: ${name}`);
}

function main() {
  console.log('Explorer Launch Check');
  console.log(`Mode: strict release validation`);

  run('Strict preflight', 'npm', ['run', 'preflight:prod:strict']);

  if (smokeUrl) {
    run('Production smoke', 'node', ['scripts/smoke-prod.mjs', smokeUrl]);
    run('Release evidence', 'node', ['scripts/release-evidence.mjs', smokeUrl]);
  } else {
    console.log('\nWARN: No smoke URL provided. Smoke and URL-based evidence checks are skipped.');
    run('Release evidence', 'node', ['scripts/release-evidence.mjs']);
  }

  console.log('\nPASS: Launch check completed successfully.');
}

main();
