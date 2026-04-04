import { readFileSync } from 'node:fs';

const commitMessageFile = process.argv[2];

if (!commitMessageFile) {
  console.error('Usage: node scripts/validate-commit-message.mjs <commit-msg-file>');
  process.exit(1);
}

const raw = readFileSync(commitMessageFile, 'utf8');
const firstLine = raw
  .split(/\r?\n/)
  .map((line) => line.trim())
  .find((line) => line.length > 0) ?? '';

const conventionalPattern = /^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)(\([a-z0-9-]+\))?:\s.{1,72}$/;

if (!conventionalPattern.test(firstLine)) {
  console.error('\n[commit-msg] Invalid commit message format.');
  console.error('Expected: type(scope): short description');
  console.error('Example: fix(auth): handle oauth callback redirect safely');
  console.error(`Received: "${firstLine || '(empty)'}"\n`);
  process.exit(1);
}

console.log('[commit-msg] Commit message format valid.');
