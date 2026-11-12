# MP4 source access recovery — 2026-11-08

Reported failure: FileReaderSync.readAsArrayBuffer NotReadableError during highlight MP4 export on a phone.

Changes:
- External picker Files are copied asynchronously before loading FFmpeg and mounting WORKERFS. Up to a cumulative 128 MiB uses owned Blobs; larger sources stream in 4 MiB chunks to a unique temporary OPFS directory.
- Temporary OPFS copies are removed after success, failure or cancellation. No source file or saved edit is deleted.
- Source read failures identify the video and explain reselection / local download. Quota errors have a separate message.
- The source picker clears its input value so choosing the same file again refreshes playback and export references. Metadata validation has a timeout and names the failed source.
- Export progress and previous results reset for each attempt.

Production Vite build passed. Focused verification: 7/7 passed (test-results/mp4-source-verification.json): five snapshot / recovery / cleanup cases, phone-sized real MP4 export with worker-side FileReaderSync failure injection (negative control confirms NotReadableError), and existing edited MP4 export regression. Both output files were decoded in the browser and their durations checked (2 s and 4 s). Final typecheck and public asset verification are recorded separately. The injected condition is a regression simulation, not an assertion that every OS file permission failure can be recovered without reselection. Physical iPhone/iPad Safari not available.

Final TypeScript noEmit: exit 0 (test-results/mp4-source-typecheck.json).
Published version 7b3153d0-7971-40b0-bc19-9588595a04a2. Main index-k74qamnX.js; export highlight-export-dtTNqySs.js. Public HTML entry references and 12 SHA-256 comparisons passed (test-results/mp4-source-public-verification.json).
