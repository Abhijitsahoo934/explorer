import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const projectRoot = process.cwd();
const reportsDir = join(projectRoot, 'reports');
const smokeUrl = (process.argv[2] ?? process.env.SMOKE_BASE_URL ?? '').trim();

function run(command, args) {
  const result = spawnSync(command, args, { cwd: projectRoot, encoding: 'utf8' });
  return {
    code: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function getGitMeta() {
  const branch = run('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
  const commit = run('git', ['rev-parse', '--short', 'HEAD']);

  return {
    branch: branch.code === 0 ? branch.stdout.trim() : 'unknown',
    commit: commit.code === 0 ? commit.stdout.trim() : 'unknown',
  };
}

function getLatestMobileQaReport() {
  let files = [];
  try {
    files = readdirSync(reportsDir)
      .filter((file) => file.startsWith('mobile-qa-signoff-') && file.endsWith('.md'))
      .sort();
  } catch {
    return null;
  }

  if (files.length === 0) return null;
  return `reports/${files[files.length - 1]}`;
}

function runSmokeIfProvided(url) {
  if (!url) {
    return {
      status: 'skipped',
      summary: 'Smoke not executed (no URL provided).',
      details: '',
    };
  }

  const smoke = run('node', ['scripts/smoke-prod.mjs', url]);
  if (smoke.code === 0) {
    return {
      status: 'passed',
      summary: `Smoke passed for ${url}.`,
      details: smoke.stdout.trim(),
    };
  }

  return {
    status: 'failed',
    summary: `Smoke failed for ${url}.`,
    details: `${smoke.stdout}\n${smoke.stderr}`.trim(),
  };
}

function buildEvidenceDocument({ branch, commit, mobileQaReport, smokeResult }) {
  const timestamp = new Date().toISOString();

  return `# Release Evidence\n\nGenerated: ${timestamp}\n\n## Build Metadata\n\n- Branch: ${branch}\n- Commit: ${commit}\n\n## Validation Evidence\n\n- Lint: attach CI/local output\n- Build: attach CI/local output\n- Latest Mobile QA report: ${mobileQaReport ?? 'not found'}\n- Smoke status: ${smokeResult.status}\n- Smoke summary: ${smokeResult.summary}\n\n## Smoke Output\n\n\`\`\`\n${smokeResult.details || 'No smoke output captured.'}\n\`\`\`\n\n## Manual Signoff\n\n- [ ] Device matrix complete\n- [ ] DnD acceptance complete\n- [ ] Startup/navigation SLO met\n- [ ] Visual/theme consistency verified\n- [ ] Final release decision: Go\n\n## Notes\n\n- Add CI run URL\n- Add screenshots/GIFs for UI-sensitive changes\n- Add rollback owner + on-call contact\n`;
}

function main() {
  const gitMeta = getGitMeta();
  const mobileQaReport = getLatestMobileQaReport();
  const smokeResult = runSmokeIfProvided(smokeUrl);
  const content = buildEvidenceDocument({
    branch: gitMeta.branch,
    commit: gitMeta.commit,
    mobileQaReport,
    smokeResult,
  });

  const outputFile = `reports/release-evidence-${new Date().toISOString().replace(/[:.]/g, '-').replace('Z', '')}.md`;
  writeFileSync(join(projectRoot, outputFile), content, 'utf8');

  if (smokeResult.status === 'failed') {
    console.error(`FAIL: Release evidence generated, but smoke failed. See ${outputFile}`);
    process.exit(1);
  }

  console.log(`PASS: Release evidence generated at ${outputFile}`);
}

main();
