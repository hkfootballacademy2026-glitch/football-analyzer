# Workspace upgrade — 2026-11-08

## Scope
Common team management; removal of game-model UI; match edit/delete; event tagging direction and optional players; visual reports; tactical frame editing; production movement analysis with bundled pose model; persistent guidance and five-language primary UI.

## Data compatibility
Legacy model definitions are copied into each match before clearing model/revision references. Tag IDs, event IDs, criteria, drawings, and match-local data are preserved. Existing backups are normalized before duplicate comparison. Removing a match clears its tags/reports and detaches related tactics without deleting tactics or original video files.

## Pose validation
Bundled official MediaPipe Pose Landmarker Lite float16 version 1 (5,777,746 bytes). Chromium smoke test loaded the local model, created the CPU/XNNPACK delegate, and executed video inference. Synthetic fixture validation confirms execution, not real-world pose accuracy. Knee angles use image pixel aspect ratio; results are two-dimensional observations, not an automatic performance score.

## Language coverage
Japanese, English, Spanish, Portuguese and Simplified Chinese are selectable and persisted. Main navigation, primary controls, tag/pitch labels, editing controls, and contextual guides have translations. Some detailed descriptions and diagnostic messages remain Japanese. Player names and notes are preserved verbatim.

## Browser coverage
Chromium uses real mouse/touch event tests. Windows WebKit uses iPhone/iPad viewport and user-agent presets, native touch taps and mouse-pointer drags. No physical iPhone/iPad Safari is connected.

## Validation status
TypeScript full no-emit check passed. First regression run: 77/78 passed; player-count accessible name corrected. Additional smartphone language/guide persistence passed. Final release build and regression results recorded below after completion.

## Final verification
- Full TypeScript no-emit check: PASS.
- Final build: index-CS3j8Yc4.js / index-CvDC_d-c.css / highlight-export-C94XTZYg.js.
- Chromium regression suite: 79/79 PASS, including all new upgrade cases, native touch manipulation, clip export, and pose model execution.
- WebKit: iPhone/iPad portrait/landscape 4/4 PASS with IndexedDB reload and persistent-browser restart. Initial CloudDock profile I/O delays were eliminated using isolated local temporary profiles; no application error was reported in final runs.
- Physical iOS/iPadOS Safari remains untested.

## Mobile visual follow-up
Visual review found that wrapped toolbar controls and contextual hints could cover video. Added measured header height to the workspace layout and anchored hints near their control. Responsive regression re-run passed at 1440×900, 1024×768, 390×844 and 844×390, explicitly asserting video begins below the sticky header. Compact QR label is applied in source CSS and as a post-build CSS addition to the candidate artifact.
Final candidate assets: index-C4t1Cnh5.js, index-BBC2LJqI.css, highlight-export-CEVH-sa6.js.

Mobile follow-up checks: responsive video visibility PASS (4 sizes); five-language/guide persistence PASS after QR label post-processing. Screenshot reviewed: compact QR button and language/guide controls visible on one row at 390px.

Published and verified: 2026-11-08. Version 6f960a60-fa16-41fe-b849-a87902e6132f. Public HTML references index-C4t1Cnh5.js and index-BBC2LJqI.css. SHA-256 matched JavaScript/CSS/export chunk, QR/PWA assets, manifest/service worker, and bundled pose_landmarker_lite.task.
