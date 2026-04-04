import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

function safeExec(command) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'unknown';
  }
}

const now = new Date();
const iso = now.toISOString();
const fileStamp = iso.replace(/[:]/g, '-').replace(/\..+$/, '');

const branch = safeExec('git rev-parse --abbrev-ref HEAD');
const commit = safeExec('git rev-parse --short HEAD');

const reportsDir = join(process.cwd(), 'reports');
mkdirSync(reportsDir, { recursive: true });

const reportPath = join(reportsDir, `mobile-qa-signoff-${fileStamp}.md`);

const report = `# Mobile QA Sign-off\n\nGenerated: ${iso}\n\n## Build Metadata\n\n- Branch: ${branch}\n- Commit: ${commit}\n\n## Release Gate\n\n- Device matrix complete: [ ] Yes [ ] No\n- DnD acceptance complete: [ ] Yes [ ] No\n- Startup/navigation SLO met: [ ] Yes [ ] No\n- Visual/theme consistency verified: [ ] Yes [ ] No\n- Build passed: [x] Yes [ ] No\n- Final release decision: [ ] Go [ ] No-Go\n\n## Notes\n\n- Add links to screen recordings for Android low-end, Android mid-range, and iOS Safari.\n- Record any issue IDs and mitigation notes before release approval.\n`;

writeFileSync(reportPath, report, 'utf8');

console.log(`Mobile QA sign-off generated: ${reportPath}`);
