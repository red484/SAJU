# Epic Reading Update

## Scope

- Opening statue and all three poster scene subtrees are preserved.
- Supplied transparent PNG replaces the SVG route; it starts at the original voyage line and ends 16px above the three-story conclusion.
- ResizeObserver keeps the route endpoint correct when poster disclosures expand. Reduced motion shows the whole route immediately.
- SIREN and WISDOM share contrasting sea compositions. Mobile uses vertically connected dark and light water.
- Five reading chapters alternate large sea scenes with restrained prose. Descent carries the strongest dark/light contrast; Ithaca leaves open sea below its headline.
- The ending keeps its statement above disclosure questions and quiet save/share controls.
- Text is a labeled creative sample, not a computed personal reading. Existing age/year recalculation from birth year was removed because it was not a verified chart calculation.
- Exact onboarding responses are no longer copied into the public result. There is no model API or chart computation connected to this static file.

## Files

- `result.html`: static reviewed content and semantic disclosures.
- `epic.css`: lower-page compositions and supplied ribbon styling.
- `result.js`: interactions and ribbon geometry.
- `epic.sample.json`: complete sample content.
- `RESULT-GENERATION-PROMPT.md`: generation instructions, input contract, quote sources and output structure.
- `validate-result.mjs`: dependency-free structural and copy-length checks.

## Verification

- JSON counts, references, character limits, quote allowlist and terminology isolation passed.
- All 25 chapter paragraphs match the sample data; 10 disclosures and 8 inline chevron icons are present.
- DOM comparison confirmed the original opening statue and three poster scenes are unchanged.
- All local HTML/CSS asset references resolve.
- Mock geometry checks passed at 320, 390, 768 and 1440px widths, including expansion and reduced motion. These are logic checks, not rendered viewport tests.
- Browser security policy prevented visual browser verification. Actual typography, compositing and mobile screenshots still require visual review.

The previous version is available beside the output directory as `myth-before-epic.zip`.
