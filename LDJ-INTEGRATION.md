# UCL Learning Designer LDJ integration (work in progress)

The Learning Design Studio currently stores a browser-local design in `localStorage["lds-design"]`. This branch adds `ldj-export.js`, a deterministic mapping and validation layer. **It does not yet generate a verified LDJ file.**

## Why no direct LDJ button yet?
The UCL tool supports importing LDJ, but the actual serialized schema must be verified using an exported sample. Changing a JSON extension to `.ldj` is not sufficient.

## Required acceptance test
1. Export a minimal design from the current UCL Learning Designer: one TLA with all six learning types if possible, including title, aims/outcomes, duration, group size, teacher presence, synchronous/online options, instructions, and resources.
2. Inspect its LDJ structure and implement an encoder matching the exact structure, including required metadata and nested TLA/activity records.
3. Import generated LDJ in UCL Learning Designer; verify title, outcomes, learning type, timing, grouping, modes and instructions.
4. Export that imported design again and compare semantically.
5. Add the UI download action only after successful round-trip. Keep the existing JSON backup unchanged.

## Known mapping
Acquisition → Read Watch Listen; Inquiry → Investigate; Discussion → Discuss; Practice → Practice; Collaboration → Collaborate; Production → Produce.

## Data gaps to resolve
Current studio fields combine teacher role with teacher presence and combine resources with student guidance; UCL may require separate flags/fields. Synchronous status, class size and aims are not yet captured. Any unknown fields must be surfaced to the user rather than silently guessed.
