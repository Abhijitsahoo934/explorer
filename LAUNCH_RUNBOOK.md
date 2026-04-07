# Explorer Launch Runbook

## Goal
Ship a stable production release with predictable rollout, fast verification, and safe rollback.

Use release governance templates:
- Pull request template: `.github/pull_request_template.md`
- Go-live issue template: `.github/ISSUE_TEMPLATE/go-live-signoff.yml`
- Code ownership: `.github/CODEOWNERS`
- Branch protection guide: `.github/BRANCH_PROTECTION_SETUP.md`
- Monitoring runbook: `MONITORING_RUNBOOK.md`

## 1) Pre-Launch Gates (Must Pass)

Run locally on release branch:

```bash
npm run lint
npm run build
npm run qa:mobile
npm run preflight:prod:strict
npm run launch:check -- https://your-domain.com
```

Success criteria:
- No lint errors
- Type-check + build pass
- Mobile QA report generated in `reports/`
- Strict preflight passes with `VITE_APP_ENV=production`

## 2) Environment and Secrets

Required in hosting and CI:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_ENV=production`

Optional:
- `VITE_FOUNDER_EMAILS` (comma-separated allow-list for insights)

GitHub repository secrets for CI workflow:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_FOUNDER_EMAILS` (optional)

## 3) Database and Backend Readiness

Before rollout:
- Apply all `supabase/migrations` in order
- Verify RLS for `folders`, `apps`, `notifications`, `product_events`
- Verify Realtime for `folders`, `apps`, `notifications`
- Verify `delete_user` RPC works
- Deploy Edge Function `ai-recommend`
- Set function secret `GROQ_API_KEY`

## 4) Controlled Rollout

1. Deploy to preview/staging
2. Smoke test core flows:
   - Auth login (email + Google)
   - Password reset -> `/update-password`
   - Folder/app create/move operations
   - Command palette (`Ctrl/Cmd + K`)
   - Realtime updates in dashboard/explorer
3. Deploy to production
4. Monitor first 30-60 minutes:
   - Error logs
   - Auth callback failures
   - Slow route transitions
   - Edge function error rates

## 5) Immediate Post-Launch Checks

- Open production on mobile, tablet, desktop
- Verify settings modal, explorer DnD, and landing hero render correctly
- Confirm no console errors in critical pages
- Confirm analytics events are received
- Run smoke gate: `npm run smoke:prod -- https://your-domain.com` (or trigger GitHub workflow `Post Deploy Smoke`)

## 6) Rollback Plan

Trigger rollback if any of these occur:
- Auth/login regression
- Data mutation errors in create/move/delete flows
- Sustained 5xx from edge functions
- Major UI break on mobile

Rollback steps:
1. Revert to previous stable deployment in hosting platform
2. Disable risky feature flags (if any)
3. Post incident note with root cause + mitigation
4. Re-run strict preflight before next attempt

## 7) Release Evidence

Keep these artifacts per release:
- CI run link and commit SHA
- Latest mobile QA signoff report
- Preflight output summary
- Production smoke test notes
- Generated evidence bundle: `npm run evidence:release -- https://your-domain.com`
