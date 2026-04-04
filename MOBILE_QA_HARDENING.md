# Mobile QA Hardening (Production Gate)

This checklist is the release gate for mobile-first quality on Explorer.

## 1) Devices and Browsers

Test on real devices (not only emulators):

- Android low-end: 4 GB RAM, Chrome latest.
- Android mid-range: 6-8 GB RAM, Chrome latest.
- iPhone Safari: iOS 17+.
- Optional fallback: Samsung Internet latest.

Target widths:

- 360x800
- 390x844
- 412x915

## 2) Startup and Navigation SLOs

Pass criteria:

- First route interactive within 3 seconds on mid-range Android over normal 4G/Wi-Fi.
- Route transitions should not freeze for more than 150 ms.
- No white flashes, layout jumps, or stuck overlays.

Checks:

- Open app, login, land on dashboard, navigate to Explorer.
- Open and close sidebar 10 times quickly.
- Navigate between root and nested folders repeatedly.

## 3) Drag-and-Drop UX Acceptance

Folder DnD:

- Drag folder into another folder.
- Drag folder to Vault Root.
- Invalid drop (self/descendant) must not move and must show invalid state.
- Hover-to-open nested folder should feel responsive and stable.

App DnD:

- Drag app into another folder.
- Drop into same folder should do nothing and not flicker.

Touch behavior:

- Vertical scrolling must remain smooth while not dragging.
- No accidental long-blocking touch states.

## 4) Performance and Smoothness

Manual performance checks:

- Scroll folder tree quickly for 20 seconds: no major jank.
- Scroll app grid quickly for 20 seconds: no frame collapse.
- Open notifications/profile dropdown while scrolling.

Visual checks:

- On mobile, heavy blur/noise effects should be reduced.
- Hover/drop states should match theme and avoid harsh white mismatch.

## 5) Reliability and Error Safety

- No console errors during normal usage.
- Failed drag API update should recover UI state after refresh.
- Realtime updates should not break active interactions.

## 6) Regression Commands

Run before release:

```bash
npm run build
```

Recommended automated gate:

```bash
npm run qa:mobile
```

This command builds production and generates a timestamped sign-off template in `reports/`.

Optional local smoke:

```bash
npm run dev -- --host
```

## 7) Sign-off Template

Use this before shipping:

- Device matrix complete: Yes/No
- DnD acceptance complete: Yes/No
- Startup/navigation SLO met: Yes/No
- Visual/theme consistency verified: Yes/No
- Build passed: Yes/No
- Final release decision: Go/No-Go

## 8) SLO Guardrails (Go/No-Go)

Use these targets as startup release gates:

- Command palette load p95: <= 800 ms (warn up to 1200 ms)
- Command palette failure rate: <= 0.5% (warn up to 2%)
- Drag-drop failure rate: <= 1% (warn up to 3%)
- LCP p50: <= 2500 ms (warn up to 4000 ms)
- TTFB p50: <= 800 ms (warn up to 1200 ms)
- CLS p50: <= 0.10 (warn up to 0.20)

Release decision policy:

- Any FAIL metric => No-Go
- More than one WARN metric => caution / rollback plan required
- All GOOD or max one WARN => Go
