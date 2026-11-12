# Pitch-first tactics workspace — 2026-11-08

## Behavior
- Creating or loading a tactics project opens a viewport-filling pitch automatically, including projects opened from match reconstruction.
- Portrait screens rotate the 2D pitch, keeping both goals and player labels visible. Pointer coordinates use the existing rotated mapping.
- Playback, scrubbing, time and speed remain available without opening editing controls.
- A pitch-only toggle hides transport and shared toolbars during viewing; a single restore button brings them back without stopping playback.
- Editing controls overlay the pitch without reducing its dimensions; mobile portrait uses a lower panel and landscape a narrow side panel. Project setup remains available in that panel.
- Exit / Escape restore page navigation and body scrolling and stop playback. CSS fullscreen works without the browser Fullscreen API.

## Verification
Production Vite build passed. Browser checks cover 1440×1000, 390×844, 844×390, 820×1180 and 1180×820, viewport bounds, transport / shared toolbar separation, minimum slider width, touch placement (including portrait rotation), save/reload, frame undo and exit cleanup. Final focused browser regression: 4/4 passed, including five viewport sizes and pitch-only hide/restore. Final TypeScript noEmit: exit 0. Results: test-results/pitch-regression-verification.json and test-results/pitch-typecheck.json. Publication asset verification is recorded separately.
Real iPhone/iPad Safari hardware is not available in this environment; emulated touch checks must not be reported as real-device validation.

## Publication
Version c147c516-126d-4bc8-b0cb-72c091f1bed8, https://football-analyzer-hk-20261105.football-analyzer.workers.dev/
Main index-DzS68Ai-.js; stylesheet index-CTicjyRE.css; export highlight-export-BVxb-Q90.js. Public HTML entry references and 12 asset SHA-256 comparisons passed (test-results/pitch-public-verification.json).
