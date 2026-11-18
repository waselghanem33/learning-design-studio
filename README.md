# Learning Design Studio

An open-source bilingual (English/Arabic) interactive instructional design training toolkit for university instructors.

**Author:** Dr. Wasel Ghanem · Birzeit University

## Features

- 120-minute instructor training academy with seven guided sessions.
- Seven authentic discipline examples: law, medicine, pharmacy, business, education, engineering, and social sciences.
- Interactive module design lab: learning outcomes, authentic problem, before/during/after activities, teacher role, delivery mode, resources and feedback.
- Visual analysis of the six learning types and total activity duration.
- Peer-review rubric with weighted scoring.
- Browser local storage, JSON import/export, print-to-PDF, checklist and facilitator schedule downloads.
- Arabic RTL and English LTR interfaces.

## New interactive workshop features (November 2026)

- **Scenarios / السيناريوهات:** Four bilingual multiple-choice instructional design cases with immediate explanatory feedback.
- **My Progress / تقدمي:** Five guided challenges and a module-readiness checklist, stored in the browser.
- **Portfolio / ملف الإنجاز:** Download a Markdown teaching portfolio combining outcomes, activities, learning-type distribution, peer-review scores, feedback, and scenario progress.
- **Training materials:** `training/facilitator-guide.md` and `training/participant-workbook.md`.

The scenario scores, challenge completion, and draft module are local to each browser; there is no cross-device synchronization or Moodle integration.

## v1.3 — AI Learning Design Coach

The **AI Coach / المدرب الذكي** tab provides five modes: outcomes, activities, assessment, critical review and Socratic coaching. It constructs a bilingual prompt from the locally saved module. Instructors review the prompt before copying it to their own ChatGPT account. The site makes **no API requests** and does **not** embed an API key.

To import a response, request the JSON code block shown in the prompt, paste it into the AI Coach, validate the schema, inspect the preview and explicitly approve application. Export a JSON backup before replacing activities. Reload the design laboratory after approval to see the imported design. The reflection is saved locally in the browser.

**Privacy:** The generated prompt contains the module text; remove student, patient and confidential information before sharing with an external AI provider. AI-generated pedagogical advice must be checked by the instructor.

## Getting started

Open `index.html` in a browser. No installation, backend or API key required.

## Publishing with GitHub Pages

Repository Settings → Pages → Build and deployment → Deploy from a branch → `main` → `/(root)` → Save.

Once Pages finishes deploying, visit: https://waselghanem33.github.io/learning-design-studio/

## Scope and privacy

This is an **independent training companion**, not an official UCL Learning Designer application. It does not write to UCL or Moodle. Designs are saved in the browser's local storage. Avoid entering personal student or patient data. No AI model API is used in this version.

Original tool: https://www.ucl.ac.uk/learning-designer/designer.php

## License

MIT License. Copyright © 2026 Dr. Wasel Ghanem.
