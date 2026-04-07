const DEFAULT_TIMEOUT_MS = 12000;
const RETRIES = 2;

const inputBaseUrl = (process.env.SMOKE_BASE_URL ?? process.argv[2] ?? '').trim();

if (!inputBaseUrl) {
  console.error('FAIL: Missing base URL. Set SMOKE_BASE_URL or pass it as the first argument.');
  process.exit(1);
}

let baseUrl;
try {
  baseUrl = new URL(inputBaseUrl).origin;
} catch {
  console.error(`FAIL: Invalid URL provided: ${inputBaseUrl}`);
  process.exit(1);
}

const checks = [
  { path: '/', expected: ['<div id="root"></div>', 'Explorero'] },
  { path: '/auth', expected: ['<div id="root"></div>', 'Explorero'] },
  { path: '/explorer', expected: ['<div id="root"></div>', 'Explorero'] },
  { path: '/auth/callback', expected: ['<div id="root"></div>', 'Explorero'] },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'cache-control': 'no-cache',
        pragma: 'no-cache',
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

async function runCheck({ path, expected }) {
  const url = new URL(path, baseUrl).toString();
  let lastError = null;

  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, DEFAULT_TIMEOUT_MS);
      const body = await response.text();

      if (response.status >= 400) {
        throw new Error(`HTTP ${response.status}`);
      }

      const missingMarkers = expected.filter((marker) => !body.includes(marker));
      if (missingMarkers.length > 0) {
        throw new Error(`Missing expected markers: ${missingMarkers.join(', ')}`);
      }

      return {
        path,
        status: response.status,
        ok: true,
      };
    } catch (error) {
      lastError = error;
      if (attempt < RETRIES) {
        await sleep((attempt + 1) * 500);
      }
    }
  }

  return {
    path,
    status: 'failed',
    ok: false,
    error: String(lastError?.message ?? lastError ?? 'Unknown error'),
  };
}

async function main() {
  console.log('Explorer Production Smoke Test');
  console.log(`Target: ${baseUrl}`);
  console.log(`Checks: ${checks.length}`);

  const results = [];
  for (const check of checks) {
    const result = await runCheck(check);
    results.push(result);
    if (result.ok) {
      console.log(`PASS ${result.path} -> ${result.status}`);
    } else {
      console.log(`FAIL ${result.path} -> ${result.error}`);
    }
  }

  const failures = results.filter((result) => !result.ok);
  if (failures.length > 0) {
    console.error(`\nFAIL: ${failures.length}/${checks.length} smoke checks failed.`);
    process.exit(1);
  }

  console.log(`\nPASS: ${checks.length}/${checks.length} smoke checks passed.`);
}

main().catch((error) => {
  console.error(`FAIL: Smoke test crashed: ${String(error?.message ?? error)}`);
  process.exit(1);
});
