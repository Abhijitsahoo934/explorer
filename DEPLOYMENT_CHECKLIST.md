# Explorer Deployment Checklist

## Environment

- Set `VITE_SUPABASE_URL`
- Set `VITE_SUPABASE_ANON_KEY`
- Set `VITE_APP_ENV=production`
- Confirm `https://yourdomain.com/auth/callback` is added in Supabase Auth redirect URLs
- Confirm `http://localhost:5173/auth/callback` remains enabled for local development

## Supabase

- Enable Google provider
- Run all SQL files in `supabase/migrations` in order before testing the hosted app
- Verify RLS on `folders`, `apps`, `notifications`, `product_events`
- Verify Realtime enabled for `folders`, `apps`, `notifications`
- Create `product_events` table used by Insights
- Create `delete_user` RPC if account deletion is supported
- Deploy Edge Function: `supabase functions deploy ai-recommend`
- Set Edge Function secret: `supabase secrets set GROQ_API_KEY=...`
- Confirm AI recommendations return non-empty results for query `supa` in Add App modal

## UX + Reliability Smoke Test

- Email login works
- Google login works
- Password reset opens `/update-password`
- Sidebar folder click navigates correctly
- Add folder updates without refresh
- Add app updates without refresh
- Command palette opens with `Ctrl/Cmd + K`
- Workflow macros execute correctly
- Notifications update live
- Clear local cache preserves the active session

## Performance

- Run `npm run preflight:prod`
- Run `npm run preflight:prod:strict` before final release cut
- Run `npm run lint`
- Run `npx tsc --noEmit -p tsconfig.app.json`
- Run `npx tsc --noEmit -p tsconfig.node.json`
- Run `npm run build`
- Check initial route load and post-login route transitions

## Launch Readiness

- Set custom domain on hosting platform
- Add error monitoring
- Add uptime monitoring
- Add analytics review cadence
- Add backup/export process for critical data
