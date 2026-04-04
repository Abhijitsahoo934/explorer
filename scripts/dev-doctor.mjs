import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createServer } from 'node:net';

const projectRoot = process.cwd();
const envPath = join(projectRoot, '.env');
const nodeModulesPath = join(projectRoot, 'node_modules');
const defaultPort = Number(process.env.PORT || 5173);

const requiredEnvKeys = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const content = readFileSync(filePath, 'utf8');
  const out = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    out[key] = value;
  }

  return out;
}

function checkPortAvailability(port) {
  return new Promise((resolve) => {
    const server = createServer();

    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });

    server.listen(port, '0.0.0.0');
  });
}

function printHeader(title) {
  console.log(`\n=== ${title} ===`);
}

async function main() {
  console.log('Explorer Dev Doctor');
  console.log(`Project: ${projectRoot}`);
  console.log(`Node: ${process.version}`);

  const envFromFile = parseEnvFile(envPath);
  const missingKeys = requiredEnvKeys.filter((key) => {
    const value = process.env[key] ?? envFromFile[key];
    return !value || String(value).includes('your-project-id') || String(value).includes('your-public-anon-key');
  });

  printHeader('Environment');
  if (!existsSync(envPath)) {
    console.log('WARN: .env file missing. Copy .env.example to .env.');
  } else {
    console.log('OK: .env file exists.');
  }

  if (missingKeys.length > 0) {
    console.log(`WARN: Missing/placeholder env keys: ${missingKeys.join(', ')}`);
  } else {
    console.log('OK: Required env keys look configured.');
  }

  printHeader('Dependencies');
  if (!existsSync(nodeModulesPath)) {
    console.log('WARN: node_modules missing. Run npm install.');
  } else {
    console.log('OK: node_modules exists.');
  }

  printHeader('Port Check');
  const isPortAvailable = await checkPortAvailability(defaultPort);
  if (isPortAvailable) {
    console.log(`OK: Port ${defaultPort} available.`);
  } else {
    console.log(`WARN: Port ${defaultPort} already in use.`);
    console.log(`Tip: run npm run dev -- --port ${defaultPort + 1}`);
  }

  printHeader('Suggested Order');
  console.log('1. npm run doctor:dev');
  console.log('2. npm run lint');
  console.log('3. npm run dev');
  console.log('4. If dev fails, run: npm run dev -- --port 5174');
}

void main();
