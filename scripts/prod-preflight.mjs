import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const projectRoot = process.cwd();
const envPath = join(projectRoot, '.env');

const requiredEnvKeys = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

const recommendedEnvKeys = [
  'VITE_APP_ENV',
];

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const content = readFileSync(filePath, 'utf8');
  const env = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const equalsAt = line.indexOf('=');
    if (equalsAt <= 0) continue;

    const key = line.slice(0, equalsAt).trim();
    const value = line.slice(equalsAt + 1).trim();
    env[key] = value;
  }

  return env;
}

function getEnvValue(key, envFromFile) {
  return process.env[key] ?? envFromFile[key] ?? '';
}

function hasPlaceholder(value) {
  const normalized = String(value || '').toLowerCase();
  return normalized.includes('your-project-id') || normalized.includes('your-public-anon-key');
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function printHeader(title) {
  console.log(`\n=== ${title} ===`);
}

function main() {
  const strictMode = process.argv.includes('--strict');

  console.log('Explorer Production Preflight');
  console.log(`Project: ${projectRoot}`);
  console.log(`Node: ${process.version}`);
  console.log(`Mode: ${strictMode ? 'strict' : 'standard'}`);

  const envFromFile = parseEnvFile(envPath);

  printHeader('Environment');
  if (!existsSync(envPath)) {
    console.error('FAIL: .env file is missing.');
    process.exit(1);
  }

  const missingRequired = requiredEnvKeys.filter((key) => {
    const value = getEnvValue(key, envFromFile);
    return !value || hasPlaceholder(value);
  });

  if (missingRequired.length > 0) {
    console.error(`FAIL: Missing required env keys: ${missingRequired.join(', ')}`);
    process.exit(1);
  }

  console.log('PASS: Required env keys are set.');

  const missingRecommended = recommendedEnvKeys.filter((key) => !getEnvValue(key, envFromFile));
  if (missingRecommended.length > 0) {
    const message = `Missing recommended env keys: ${missingRecommended.join(', ')}`;
    if (strictMode) {
      console.error(`FAIL: ${message}`);
      process.exit(1);
    }
    console.warn(`WARN: ${message}`);
  } else {
    const appEnv = String(getEnvValue('VITE_APP_ENV', envFromFile)).toLowerCase();
    if (appEnv !== 'production') {
      const message = `VITE_APP_ENV is \"${appEnv}\" (required: production in strict mode).`;
      if (strictMode) {
        console.error(`FAIL: ${message}`);
        process.exit(1);
      }
      console.warn(`WARN: ${message}`);
    } else {
      console.log('PASS: VITE_APP_ENV=production');
    }
  }

  printHeader('Quality Gate');
  run('npm', ['run', 'ci:check']);

  printHeader('Mobile QA Sign-off');
  run('npm', ['run', 'qa:mobile']);

  printHeader('Result');
  console.log('PASS: Production preflight completed successfully.');
}

main();
