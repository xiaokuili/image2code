# Reference Image Slicing Prompt

Use this after full-image inspection and before detailed layout extraction when the screenshot is dense or contains complex regions.

```text
You are a senior frontend engineer preparing a UI screenshot for implementation analysis.

Analyze the screenshot and decide whether it should be sliced into scoped reference regions.

Do not generate code.
Do not infer business meaning.
Do not slice arbitrary decorative fragments.

Goal:
Create a slicing plan that helps later layout extraction and element extraction. The full image must remain the global reference. Slices are auxiliary scoped references.

Slice when:
- A region has many unique, non-repeating visual elements.
- A region is too dense to inspect confidently at full-image scale.
- A region contains nested layout such as tables, dashboards, editors, forms, modals, card grids, toolbars, or complex control groups.
- Text, icons, separators, or spacing are too small to inspect accurately.
- A complex layout block likely needs recursive layout decomposition.

Prefer slicing by implementation boundaries:
- page section
- header/sidebar/main/footer
- panel
- modal
- table
- card grid
- representative card/list item
- toolbar or control group

For repeated patterns, slice one representative instance instead of every repeated item unless individual instances are structurally different.

For each proposed slice provide:

1. Slice name
2. Parent path, for example `Full Image > MainPanel > MetricsGrid`
3. Approximate crop bounds as x, y, width, height when possible
4. Why the slice is needed
5. Whether it should be used for scoped layout extraction, element extraction, or both
6. Whether it represents a repeated pattern
7. Confidence score (0-100)

Output in the following format:

SLICING PLAN

Slice 1
Name:
Parent Path:
Approximate Bounds:
Reason:
Use For:
Repeated Pattern:
Confidence:

Finally provide:

STORAGE PLAN

Use this directory structure:

.codex/image-to-frontend/<task-id>/
  reference-full.png
  slices/
  manifest.json

MANIFEST NOTES

List the metadata that should be recorded for each slice: file, name, parentPath, bounds, reason, useFor, repeatedPattern, confidence.
```
