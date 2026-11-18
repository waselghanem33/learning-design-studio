# Learning Design Studio v1.7 — Quality Assurance

This is a **staging branch**. The stable GitHub Pages site remains on `main` (v1.6.2). Do not merge before browser testing.

## Automated checks
Run `node tests/smoke.mjs` from the repository root. The script checks JavaScript syntax, locally referenced scripts and stylesheets, and essential navigation and training features.

## Instructor acceptance test (Arabic and English)
1. Open the homepage and run the guided tour; use Next, Previous, Skip, and Restart.
2. Switch languages; verify Arabic RTL layout, English LTR layout, and readable JSON/code text.
3. Load a discipline example; edit outcomes and before/during/after activities.
4. Save the module; refresh and verify persistence.
5. Export and import JSON; confirm the restored design matches the original.
6. Open AI Coach; generate a readable prompt without raw module JSON; copy it.
7. Paste a valid structured AI response; preview and selectively approve activities. Verify changes appear in Design Laboratory.
8. Open Alignment Studio; link outcomes to activities and set Bloom levels.
9. Add evidence and justification; download the alignment report.
10. Complete peer review and portfolio export; open downloaded files.
11. Repeat on a narrow mobile viewport; check overflow, tab focus, and buttons.
12. Try invalid or empty input; verify errors are understandable and existing work is not lost.

## Release gates
- All automated checks pass on the release branch.
- No loss of previously saved browser data.
- No broken navigation, missing resources, or inaccessible core controls.
- One complete instructor journey succeeds in Arabic and English.
- No API secrets or confidential learner data in the static frontend.
- Only then merge the tested branch into `main` and verify the public Pages deployment.

## Known limitations
Automated source checks do **not** establish browser functionality, accessibility compliance, pedagogical validity, or live deployment success. These require separate tests.
