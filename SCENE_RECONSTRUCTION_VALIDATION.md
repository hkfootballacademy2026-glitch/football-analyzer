# Scene reconstruction validation — 2026-11-08

Scope: one paused video frame converted to a new tactics project after four-point calibration and user review. Local EfficientDet-Lite0 detection; no paid inference service.

- TypeScript noEmit passed. Vite scene-build succeeded.
- Regression and new tests: 89/89 pass across full and targeted runs; consolidated in test-results/scene-final-verification.json.
- Actual bundled detector detected a person in a video generated from the official MediaPipe pose.jpg fixture; verified roster assignment, single-piece save and calibration reuse. This is not a football accuracy benchmark.
- Mobile Chromium 390×844: touch move, pointer cancellation rollback, manual addition, save, and horizontal overflow checked. Screenshot visually reviewed. Physical iOS/iPadOS Safari not tested for this feature.
- Pure tests cover homography, invalid calibration, duplicate suppression, unknown/out-of-bounds rejection, color ambiguity, schema persistence and no invented players/ball.
- Test-only fixture generation improved using explicit canvas requestFrame and a 30-second video readiness allowance; initial fixture readiness timeout and malformed test assertion corrected before final pass.

Limits: distant/occluded people and ball can be missed; referee/spectator and team correction are manual. Offscreen players, identity, body orientation and ball height are not inferred. Camera changes require recalibration. Automatic motion reconstruction is not included.

Build: index-CZg7vC1n.js; index-DcQbtUSt.css; highlight-export-DTHy_abY.js.
Published 2026-11-08. Version bb6a8c03-c909-42ca-8d48-ba97aa2e9a11. Public HTML and SHA-256 verified for main/CSS/export, PWA assets, pose model and efficientdet_lite0.tflite. TypeScript and Vite passed; 89/89 consolidated regression checks passed (test-results/scene-final-verification.json). Real model detection tested on official person fixture, not a football accuracy benchmark; physical iOS/iPadOS Safari untested for scene reconstruction.

## 2026-11-08: visible landmarks / manual placement (validation pending)
- Four image-to-pitch correspondences selected independently from named pitch line intersections/landmarks; arbitrary correspondence order, no rectangle required. Reject duplicate, collinear, incomplete or inconsistent correspondences.
- New optional targets in saved calibration; older rectangular calibration remains compatible. Manual mode saves no new calibration and retains any prior match calibration.
- Manual additions can be placed directly on pitch by mouse/touch. Detected/source-image candidates must each be explicitly placed; no guessed positions.
- Adjacent save status lists calibration, unclassified, unplaced, out-of-bounds, missing players, multiple balls and confirmation blockers.

Validation completed: final Vite build succeeded; 95/95 full regression and browser checks passed. Actual model detection, legacy rectangle calibration, custom landmark save/reuse, mobile touch manual placement and adjacent blocker messages passed. Mobile screenshot visually reviewed. TypeScript diagnostics: 0 using actual project sources and declaration files in a normalized in-memory compiler host; test-results/scene-landmarks-typecheck.json. Initial CLI typecheck/build had captured a JSX syntax error; corrected source was rechecked and rebuilt.
Build: index-CZO7vf5z.js; index-76ZLb_t5.css; highlight-export-CmkM_22R.js. Deployment verification pending.

Published and verified 2026-11-08. Version 5cc80337-d62e-481c-8898-cd40014b35fb. Main index-CZO7vf5z.js, CSS index-76ZLb_t5.css, export highlight-export-CmkM_22R.js. Public HTML and SHA-256 verified for JS/CSS/export, PWA assets and both bundled models. 95/95 regression tests passed; final TypeScript diagnostics 0. Custom landmark calibration, backward-compatible rectangular calibration, manual placement without four points, and adjacent save blockers verified. Physical iOS/iPadOS Safari not tested for this update.

## Follow-up editor and manual workspace (validation in progress)
- Numbered tag sections and direct optional player name/number fields with backward-compatible playerDetails storage.
- Separate selected-clip and full-project playback.
- Drawing/effect key deletion via timeline keyboard/touch controls; drawing time-edit Delete never falls back to deleting entire overlay.
- Manual reconstruction uses persistent paired video/pitch views with independently scrolling settings, phone/tablet portrait/landscape checks.

Follow-up validation: tsc --noEmit exit 0; final build editor-build/index.html (index-Cvh3PFcM.js, index-DaPAQ2Jj.css, highlight-export-Cp-_a9MI.js); 98/98 regression checks passed, including direct player details persistence/re-edit, section numbering, individual and whole-project playback, drawing/effect key-only keyboard/touch deletion plus undo/persistence, and paired view visibility/hit testing after scrolling settings at 390×844, 844×390, 820×1180, 1180×820. Screenshots reviewed. Physical iOS/iPadOS Safari not tested in this update.
Final build used .build-tools/vite-fast.config.mjs with an entry re-exporting the exact 17 used Lucide icons and publicDir:false; unchanged public assets remain in dist and are served from public in the test harness. This avoids repeatedly copying large local models/FFmpeg files and loading unused icon modules.
Deployment verification pending.

Published and verified 2026-11-08. Version 57ea18c5-ada7-4de7-bec4-2d4ff9bb4faa. Main index-Cvh3PFcM.js, stylesheet index-DaPAQ2Jj.css, export highlight-export-Cp-_a9MI.js. Public HTML and SHA-256 checks passed for JS/CSS/export, PWA assets and both bundled models. TypeScript noEmit exit 0; 98/98 regression checks passed (test-results/editor-followup-final-verification.json).

## Safari-engine follow-up — 2026-11-08

Published build index-Cvh3PFcM.js tested locally with Windows Playwright WebKit, iPhone 13 and iPad gen 7 profiles in portrait/landscape (390×844, 844×390, 820×1180, 1180×820). Final run 4/4 passed; test-results/webkit-scene-fixture.json; scripts/verify-webkit-scene.cjs --snapshot-fixture.

Verified paired snapshot/pitch visibility and hit testing before/after settings scroll and viewport height reduction; native touch tap addition/reposition; mouse-pointer drag; manual tactic save/reload; drawing key-only touch/Delete removal, edit/Undo; effect key-only touch removal; explicit save; pagehide flush with 800ms debounce disabled; IndexedDB persistence across browser restart. No application source change or redeployment was needed for these checks.

Limits: physical iOS/iPadOS Safari and native finger drag were not tested. Windows WebKit could not decode either the MP4 or WebM fixture even in an isolated page without app/routing (NotSupportedError, media error 4). Layout tests therefore use a synthetic canvas snapshot and overridden test-only media readiness; this does NOT verify actual video decoding/frame capture. One initial parallel-run browser profile reported a SQLite transaction startup error; final sequential four-profile run passed, so this is not established as an application defect. Initial layout assertions sampled React state before paint and were corrected to poll the resulting coordinates. Screenshots reviewed for phone portrait/landscape; existing Chromium actual-media regression coverage is separate.
