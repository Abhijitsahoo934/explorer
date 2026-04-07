## Summary

Describe what changed and why.

## Release Intent

- [ ] This PR is part of a production release cut
- [ ] Linked issue(s) and scope are clear
- [ ] No unrelated refactors mixed with release-critical changes

## UX and Product Quality

- [ ] Mobile, tablet, desktop behavior reviewed
- [ ] No obvious visual regressions on Landing, Auth, Explorer, Dashboard
- [ ] Drag and drop flows are smooth and stable
- [ ] Settings modal and critical dialogs are usable and accessible

## Functional Verification

- [ ] Auth login flow passes
- [ ] Password reset flow passes
- [ ] Add folder and add app flows pass
- [ ] Command palette works (`Ctrl/Cmd + K`)
- [ ] Realtime updates are visible for workspace changes

## Pre-merge Quality Gates

- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run qa:mobile`
- [ ] `npm run preflight:prod:strict`

## Post-deploy Smoke Plan

- [ ] Run `npm run smoke:prod -- https://your-domain.com` OR GitHub workflow `Post Deploy Smoke`
- [ ] Validate `/`, `/auth`, `/explorer`, `/auth/callback` return healthy responses

## Environment and Secrets

- [ ] `VITE_SUPABASE_URL` configured
- [ ] `VITE_SUPABASE_ANON_KEY` configured
- [ ] `VITE_APP_ENV=production` in deployment target
- [ ] GitHub repository secrets configured for quality gate

## Risk and Rollback

- [ ] Risk level is documented
- [ ] Rollback plan is documented and tested path is known
- [ ] Monitoring owner and first-hour watch window are assigned

## Evidence

Attach release evidence:
- Mobile QA report path
- CI run link
- Smoke run output
- Screenshots/GIFs for UI-sensitive changes
