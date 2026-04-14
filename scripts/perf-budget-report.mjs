import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const DIST_ASSETS_DIR = path.resolve(process.cwd(), 'dist', 'assets');
const DIST_MANIFEST_PATH = path.resolve(process.cwd(), 'dist', '.vite', 'manifest.json');
const DIST_INDEX_PATH = path.resolve(process.cwd(), 'dist', 'index.html');
const CRITICAL_JS_TARGET_KB = 450;
const CRITICAL_JS_HARD_BUDGET_KB = 650;
const CRITICAL_CSS_BUDGET_KB = 180;
const TOTAL_JS_WARN_BUDGET_KB = 1100;

function toKb(bytes) {
  return Number((bytes / 1024).toFixed(2));
}

async function getAssetFiles() {
  const entries = await readdir(DIST_ASSETS_DIR, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const filePath = path.join(DIST_ASSETS_DIR, entry.name);
    const fileStats = await stat(filePath);
    files.push({
      name: entry.name,
      path: filePath,
      sizeBytes: fileStats.size,
      sizeKb: toKb(fileStats.size),
      ext: path.extname(entry.name),
    });
  }

  return files.sort((a, b) => b.sizeBytes - a.sizeBytes);
}

async function readManifest() {
  try {
    const raw = await readFile(DIST_MANIFEST_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

function toAssetPath(fileName) {
  return `assets/${fileName}`;
}

function collectCriticalAssets(manifest) {
  const entry = manifest['index.html'];
  if (!entry) {
    throw new Error('Vite manifest entry for index.html was not found.');
  }

  const jsSet = new Set();
  const cssSet = new Set();
  const visited = new Set();

  const walk = (chunk) => {
    if (!chunk) return;

    if (chunk.file) {
      jsSet.add(toAssetPath(chunk.file));
    }

    for (const cssFile of chunk.css ?? []) {
      cssSet.add(toAssetPath(cssFile));
    }

    for (const importKey of chunk.imports ?? []) {
      if (visited.has(importKey)) continue;
      visited.add(importKey);
      walk(manifest[importKey]);
    }
  };

  walk(entry);

  return {
    js: jsSet,
    css: cssSet,
  };
}

async function collectCriticalAssetsFromIndexHtml() {
  const html = await readFile(DIST_INDEX_PATH, 'utf8');
  const jsSet = new Set();
  const cssSet = new Set();

  const assetRegex = /(?:href|src)="\/(assets\/[^"]+)"/g;
  let match = assetRegex.exec(html);
  while (match) {
    const assetPath = match[1];
    if (assetPath.endsWith('.js')) {
      jsSet.add(assetPath);
    }
    if (assetPath.endsWith('.css')) {
      cssSet.add(assetPath);
    }
    match = assetRegex.exec(html);
  }

  return {
    js: jsSet,
    css: cssSet,
  };
}

function summarize(files, ext) {
  const matching = files.filter((file) => file.ext === ext);
  const totalKb = toKb(matching.reduce((sum, file) => sum + file.sizeBytes, 0));
  return {
    files: matching,
    totalKb,
  };
}

function summarizeCritical(files, criticalAssetPaths, ext) {
  const matching = files.filter((file) => file.ext === ext && criticalAssetPaths.has(`assets/${file.name}`));
  const totalKb = toKb(matching.reduce((sum, file) => sum + file.sizeBytes, 0));
  return {
    files: matching,
    totalKb,
  };
}

async function main() {
  const files = await getAssetFiles();
  const manifest = await readManifest();
  const criticalAssets = manifest
    ? collectCriticalAssets(manifest)
    : await collectCriticalAssetsFromIndexHtml();

  const js = summarize(files, '.js');
  const css = summarize(files, '.css');
  const criticalJs = summarizeCritical(files, criticalAssets.js, '.js');
  const criticalCss = summarizeCritical(files, criticalAssets.css, '.css');

  const criticalJsOverTarget = criticalJs.totalKb > CRITICAL_JS_TARGET_KB;
  const criticalJsOverHardBudget = criticalJs.totalKb > CRITICAL_JS_HARD_BUDGET_KB;
  const criticalCssOverBudget = criticalCss.totalKb > CRITICAL_CSS_BUDGET_KB;
  const totalJsOverWarnBudget = js.totalKb > TOTAL_JS_WARN_BUDGET_KB;

  console.log('\nPerformance budget report');
  console.log('-------------------------');
  console.log(
    `Critical JS:  ${criticalJs.totalKb} kB ${
      criticalJsOverHardBudget ? '(OVER HARD BUDGET)' : criticalJsOverTarget ? '(above target)' : '(ok)'
    }`
  );
  console.log(`Critical CSS: ${criticalCss.totalKb} kB ${criticalCssOverBudget ? '(OVER BUDGET)' : '(ok)'}`);
  console.log(`Total JS:     ${js.totalKb} kB ${totalJsOverWarnBudget ? '(warning)' : '(ok)'}`);
  console.log(`Total CSS:    ${css.totalKb} kB (informational)`);

  console.log('\nCritical path assets:');
  criticalJs.files.forEach((file) => {
    console.log(`- ${file.name}: ${file.sizeKb} kB (js)`);
  });
  criticalCss.files.forEach((file) => {
    console.log(`- ${file.name}: ${file.sizeKb} kB (css)`);
  });

  console.log('\nLargest assets:');

  files.slice(0, 8).forEach((file) => {
    console.log(`- ${file.name}: ${file.sizeKb} kB`);
  });

  if (criticalJsOverHardBudget || criticalCssOverBudget) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('Failed to build performance budget report:', error);
  process.exitCode = 1;
});
