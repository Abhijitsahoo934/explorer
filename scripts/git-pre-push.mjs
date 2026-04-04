import { spawnSync } from 'node:child_process';

const result = spawnSync('npm run ci:check', {
  stdio: 'inherit',
  shell: true,
});

if (result.status !== 0) {
  console.error('\n[pre-push] Blocked: lint/build checks failed. Fix issues and push again.');
  process.exit(result.status ?? 1);
}

console.log('\n[pre-push] Passed: code quality checks are green.');
