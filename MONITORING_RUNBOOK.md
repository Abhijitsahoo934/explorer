# Monitoring Runbook

## Purpose
Keep the first hour after launch controlled, measurable, and easy to roll back if anything regresses.

## Critical Signals
Watch these signals immediately after deployment:
- Auth callback failures
- 4xx/5xx spikes on `/`, `/auth`, `/explorer`, `/auth/callback`
- Supabase query or realtime failures
- Slow route transitions or blank shells on mobile
- Edge function failures for `ai-recommend`

## First-Hour Watch Window
Suggested watch cadence:
- T+0 to T+15 min: verify landing, auth, explorer, and callback routes
- T+15 to T+30 min: verify workspace actions and realtime updates
- T+30 to T+60 min: watch logs, errors, and user-reported friction

## Alert Thresholds
Treat these as rollback candidates:
- Any auth flow breakage
- Repeated callback failures
- Data mutation errors in add/move/delete actions
- Sustained API failures or realtime disconnects
- A mobile regression that blocks primary flows

## Observability Checklist
Make sure these are available before release:
- Error monitoring project active
- Uptime monitoring on the production domain
- Analytics events flowing
- Supabase logs accessible
- Hosting deployment logs accessible

## Incident Response Steps
1. Confirm the issue with a second check or affected user report.
2. Capture the exact route, device, and time window.
3. Check recent deploy SHA and release evidence report.
4. Decide whether the issue is a config rollback, code rollback, or backend mitigation.
5. Roll back fast if the issue is user-facing and reproducible.
6. Document root cause and the fix before next deploy.

## Rollback Triggers
Rollback immediately if any of these appear:
- Login or password recovery breaks
- Explorer becomes unusable on desktop or mobile
- Critical routes stop returning healthy responses
- Data loss or incorrect workspace mutations are observed

## Post-Incident Notes
Record:
- Incident summary
- Deploy SHA
- Scope of impact
- Rollback action taken
- Follow-up action items
