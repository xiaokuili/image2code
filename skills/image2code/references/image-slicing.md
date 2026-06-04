# Reference Image Slicing Prompt

Use this after full-image inspection and before detailed layout extraction when the screenshot is dense, contains complex regions, or depends on raster visuals that may become frontend assets.

```text
You are a senior frontend engineer preparing a UI screenshot for implementation analysis.

Analyze the screenshot and decide whether it should be sliced into scoped reference regions and/or frontend asset candidates.

Do not generate code.
Do not infer business meaning.
Do not slice arbitrary decorative fragments unless they are asset-like image regions or important for frontend visual fidelity.

Goal:
Create a slicing plan that helps later layout extraction, element extraction, and frontend asset preparation. The full image must remain the global reference.

There are two slice types:
- analysis: a scoped reference used only to inspect dense layout or elements.
- frontend-asset-candidate: a visual region that may become a production asset for generated frontend code.

Slice when:
- A region has many unique, non-repeating visual elements.
- A region is too dense to inspect confidently at full-image scale.
- A region contains nested layout such as tables, dashboards, editors, forms, modals, card grids, toolbars, or complex control groups.
- Text, icons, separators, or spacing are too small to inspect accurately.
- A complex layout block likely needs recursive layout decomposition.
- A photo, product image, person, logo, illustration, device screenshot, texture, material effect, or decorative bitmap is needed for frontend visual fidelity.

Prefer slicing by implementation boundaries:
- page section
- header/sidebar/main/footer
- panel
- modal
- table
- card grid
- representative card/list item
- toolbar or control group

For frontend asset candidates, slice by asset boundary instead of layout boundary. Include enough padding to preserve shadows, transparency, edge antialiasing, and visual context needed for image-to-image editing.

For repeated patterns, slice one representative instance instead of every repeated item unless individual instances are structurally different.

Asset source decision:
For every `frontend-asset-candidate`, decide how the final frontend asset should be produced:
- `direct-crop`: use the cropped image directly when it is clean, high-resolution enough, not contaminated by unrelated UI, and visually matches the reference.
- `image-to-image`: use the crop as a source for AI image editing when it has the right subject/composition but needs cleanup, extension, background removal, higher resolution, or conversion into a reusable frontend asset.
- `web-similar-asset`: search the web for a similar asset when the reference crop is too low quality, heavily occluded, generic enough to replace, or likely represents a real product/place/person/logo that should use a closer public source. Record licensing/usage uncertainty when known.

Only classify image asset candidates here. Simple geometric marks, text, icons, separators, and other code-built details should stay in layout or element extraction instead of this asset source decision.

For each proposed slice provide:

1. Slice name
2. Parent path, for example `Full Image > MainPanel > MetricsGrid`
3. Approximate crop bounds as x, y, width, height when possible
4. Why the slice is needed
5. Slice type: `analysis` or `frontend-asset-candidate`
6. Whether it should be used for scoped layout extraction, element extraction, asset preparation, or a combination
7. Whether it represents a repeated pattern
8. For frontend asset candidates: visual description, intended frontend use, source strategy, strategy reason, expected output format/path, and known limitations
9. Confidence score (0-100)

Output in the following format:

SLICING PLAN

Slice 1
Name:
Parent Path:
Approximate Bounds:
Reason:
Slice Type:
Use For:
Repeated Pattern:
Visual Description:
Intended Frontend Use:
Source Strategy:
Strategy Reason:
Expected Output:
Known Limitations:
Confidence:

Finally provide:

STORAGE PLAN

Use this directory structure:

.codex/image2code/<task-id>/
  reference-full.png
  slices/
  asset-candidates/
  assets/
  manifest.json

MANIFEST NOTES

List the metadata that should be recorded for each slice: file, name, parentPath, bounds, reason, sliceType, useFor, repeatedPattern, visualDescription, intendedFrontendUse, sourceStrategy, strategyReason, expectedOutput, knownLimitations, confidence.
```
