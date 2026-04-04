import { execSync } from 'node:child_process';
import { existsSync, chmodSync } from 'node:fs';
import { join } from 'node:path';

const hooksPath = '.githooks';
const prePushPath = join(process.cwd(), hooksPath, 'pre-push');

try {
  execSync(`git config core.hooksPath ${hooksPath}`, { stdio: 'inherit' });

  if (existsSync(prePushPath) && process.platform !== 'win32') {
    chmodSync(prePushPath, 0o755);
  }

  console.log('\nGit hooks configured successfully.');
  console.log('pre-push hook will run: npm run ci:check');
} catch (error) {
  console.error('Failed to configure git hooks.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
