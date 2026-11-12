# Mobile workspace and optional teams — 2026-11-08

## Changes
- Home provides equal entries for match analysis, tactics and movement analysis on desktop and mobile. New copy supports Japanese, English, Spanish, Portuguese and Chinese.
- Teams are optional. An empty teamId denotes unassigned data; match/tag/tactic/report validation accepts this explicitly while rejecting unknown nonempty team IDs. Registered-team data remains separate. Existing IDs and records are unchanged.
- Event selection is an initially open disclosure, matching other numbered tag sections, including live capture.
- On phones and touch tablets, tagging and highlight workspaces split available height equally in portrait, width equally in landscape. Media stays visible while menus scroll. Highlight project controls, timelines, inspector and export share the menu pane. Touch landscape navigation collapses into a drawer.

## Validation
- Vite build succeeded: index-DnCC8kiw.js, index-C_ahjiz1.css, highlight-export-CYXLfXCL.js.
- Full regression: 98/100 passed on initial implementation. The initial page-load timeout was addressed in the test harness; the unassigned-team editor reference was fixed. Both targeted cases subsequently passed (mobile-home-export-checks.json).
- Final landscape CSS checks passed for 390×844, 844×390, 820×1180 and 1180×820. Media/menu ratios, visibility during menu scroll, collapsed mobile navigation, no horizontal page overflow, guest persistence and registered-team separation verified. Final screenshots reviewed.
- Consolidated regression result: 100/100 passed (test-results/mobile-home-final-verification.json). TypeScript noEmit passed (exit 0). Public HTML and all 12 assets verified by SHA-256.
- Tests cover actual fixture video in Chromium, touch drawing/timeline manipulation, key-only deletion, MP4 output, data restoration and team separation. Physical iOS/iPadOS Safari is not tested in this update.

Published version: 1d634254-11cb-4bf7-8170-1a41b9e4d825. Public asset verification passed (test-results/mobile-home-public-verification.json). Final TypeScript noEmit passed (exit 0), after removing a duplicate import from the added test.
