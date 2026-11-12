<!-- stripe-projects-cli managed:agents-md:start -->
## Stripe Projects CLI

This repository is initialized for the Stripe project "Footballanalyzer".

## Tools used

- [Stripe CLI](https://docs.stripe.com/stripe-cli) with the `projects` plugin to manage third-party services, credentials, and deployments for this project. Use the stripe-projects-cli to manage deploying and access to third party services.
<!-- stripe-projects-cli managed:agents-md:end -->

## GitHub-centered development (user preference)

- The authoritative source is https://github.com/hkfootballacademy2026-glitch/football-analyzer, branch main. The desktop folder is a working copy.
- Start implementation work by checking local changes and fetching the GitHub branch. Preserve uncommitted work; reconcile concurrent changes without force-pushing.
- Include relevant verification, a source commit, and a push to GitHub when completing requested implementation work, unless the user explicitly limits the scope. Report the saved commit. Do not leave implemented changes only on the desktop.
- GitHub Actions in .github/workflows/verify.yml must pass for the commit being delivered. It installs dependencies, type-checks, tests, and builds from a clean GitHub checkout without local .env or .build-tools files.
- For a requested deployment, deploy the verified GitHub commit to the existing Cloudflare Worker football-analyzer-hk-20261105 and verify the published version. Keep the user informed separately about GitHub save and production publication. Follow the Stripe Projects CLI instructions above for service access.
- Keep credentials, .env values, .projects state, personal videos, and browser data out of Git. Authentication is managed by the service accounts and their credential stores. GitHub contains source and templates only.
- Use scripts/sync-source.ps1 for Windows source saves; it must work in a fresh clone without depending on desktop-specific Git credential configuration. Use GitHub CLI owner credentials only within the save process.
- Source backup does not include IndexedDB match records or recorded videos. Do not delete local personal files as part of code synchronization.
