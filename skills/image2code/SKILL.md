---
name: image2code
description: "Use when implementing frontend UI from a reference image, screenshot, mockup, or visual design. Runs a structured image-to-code workflow: layout extraction, element extraction, code implementation, screenshot comparison, and targeted refinement for close visual reproduction."
---

# Image2code

Use this skill when the user provides or references a UI image and wants frontend code that visually matches it.

Do not jump directly from image to code. Follow the staged workflow unless the user explicitly asks for a different approach.

## Workflow

1. Confirm the implementation target from local context:
   - framework and routing model
   - styling system
   - page/component location
   - existing design system constraints

2. Inspect the reference image.
   - Use visual inspection tools when available.
   - If the image is not available locally, ask for the image or path.
   - Identify viewport size, page bounds, major regions, and whether the image needs slicing.

3. Slice the reference image when useful.
   - Keep the full image as the global reference.
   - Create scoped crops for dense or complex regions before detailed layout extraction.
   - Store slices under `.codex/image2code/<task-id>/` when working inside a project.
   - Use `references/image-slicing.md` when a detailed slicing plan is useful.

4. Prepare frontend asset candidates when the reference image depends on raster visuals.
   - First identify asset-like regions by name, description, and position.
   - Decide whether each candidate should remain a direct crop, be edited with image-to-image generation, or be replaced by a similar web-sourced image asset.
   - Keep analysis slices separate from production-ready frontend assets.
   - Record source decisions, crop bounds, asset paths, licensing/usage notes when known, and confidence.

5. Run layout extraction before writing code.
   - Identify implementation modules and hierarchy.
   - Use `references/layout-extraction.md` when a detailed prompt is useful.
   - Recursively decompose complex layout blocks before moving to element extraction.
   - Save the layout extraction result as structured JSON before moving on.

6. Run element extraction after layout extraction.
   - Identify small implementation-relevant details such as separators, dots, chips, overlays, icons, shadows, and nested controls.
   - Use `references/element-extraction.md` when a detailed prompt is useful.
   - Save each element extraction result as a separate structured JSON file before moving on.

7. Implement the first pass.
   - Build stable parent layout first.
   - Add small elements after the structure is correct.
   - Prefer project-native components, styling conventions, and assets.
   - If assets are unavailable, approximate with CSS/SVG/placeholders and state the limitation.

8. Verify with a rendered screenshot when feasible.
   - Start the local app or static preview.
   - Capture the implementation at the same approximate viewport as the reference.
   - If screenshot tooling is unavailable, run the best available build/static checks and note the gap.

9. Compare reference vs implementation.
   - Focus on layout, spacing, grouping, alignment, sizing, missing/extra elements, and typography effects on layout.
   - Use `references/visual-diff.md` when a detailed diff prompt is useful.

10. Refine targeted issues.
   - Apply fixes in priority order.
   - Iterate 1-3 times when the environment supports screenshot comparison.
   - Stop when the result is close enough for the request or when remaining gaps require missing assets.

## Input Boundaries

- Prefer one clear page/section screenshot at a time.
- For very tall screenshots, split the work by section before implementation.
- Static screenshots do not define animation. Ask for or infer only simple UI motion such as hover, focus, loading, carousel, or subtle hero animation.
- Lighting, photography, avatars, logos, and product materials should use real assets when available; otherwise approximate them and state the limitation.

## Output Standard

The final code should be a working implementation in the user's project, not just a prompt or plan.

Final response should include:

- what was implemented
- where the code changed
- verification performed
- remaining visual limitations, if any

## Rules

- Treat `layout extraction` as the page skeleton and module plan.
- Treat `reference image slicing` as two possible workflows: analysis slicing for inspection and asset preparation for frontend implementation.
- Do not treat every crop as a production asset. Production asset candidates need a source decision and quality check.
- Treat `element extraction` as the detail inventory.
- Treat `diff/refine` as the quality gate.
- Do not claim pixel perfection unless a screenshot comparison was actually performed and the result supports it.
- Preserve existing project patterns unless the user explicitly asks for a new visual direction.
- Preserve intermediate analysis results on disk. Do not rely only on conversation context for layout, element, comparison, or refinement outputs.

## Intermediate Results

When working inside a project, create a task directory under:

```text
.codex/image2code/<task-id>/
```

Use sequential step folders for every workflow stage. Every stage must leave a file on disk, even when the result is a decision not to act.

```text
.codex/image2code/<task-id>/
  step1/
  step2/
  step3/
```

Each step folder must contain the artifacts produced in that step. Prefer JSON for analysis outputs so later steps can read them directly.

Required conventions:

- Save full-image inspection output as `image_inspection.json`.
- Save slicing and asset decisions as `slicing_manifest.json` or `asset_decisions.json`.
- Save layout extraction output as `layout.json` in the step folder that performed layout extraction.
- Save each element extraction output as one file per element or element group, using a stable snake_case name such as `primary_nav.json`, `pricing_card.json`, or `toolbar_buttons.json`.
- Save implementation notes as `implementation_result.json`, including changed files, assets used, and unresolved limitations.
- If a step analyzes multiple scoped regions, either place all region files in the same step folder with clear names or create a nested folder per region.
- If screenshot comparison or visual diff output is produced, save it as `visual_diff.json` in that step folder.
- If refinement decisions are produced, save them as `refinement_plan.json` or `refinement_result.json` in that step folder.
- Include source references in each JSON file, such as the full reference image path, slice path, viewport, parent layout path, and confidence when known.
- Do not overwrite previous step folders. Create the next numbered step folder when rerunning or refining analysis, for example `step4/` after `step3/`.
- If a stage is skipped, save a small JSON file such as `skip_decision.json` with the reason, owner stage, source references, and confidence.

Example:

```text
.codex/image2code/<task-id>/
  reference-full.png
  step1/
    image_inspection.json
  step2/
    slicing_manifest.json
    asset_decisions.json
  step3/
    layout.json
  step4/
    header.json
    pricing_card.json
    footer_links.json
  step5/
    implementation_result.json
  step6/
    visual_diff.json
  step7/
    refinement_result.json
```

## Reference Image Slicing

Before detailed layout extraction, decide whether the reference image should be sliced into scoped regions. Always inspect the full image first and keep it as the global reference.

There are two slice types:

- `analysis`: auxiliary scoped references for dense or complex regions.
- `frontend-asset-candidate`: visual regions that may become production assets used by the generated frontend code.

Use slices when:

- The screenshot contains dense UI regions that are hard to inspect at full scale.
- A region has many unique, non-repeating elements.
- A region contains nested layout such as tables, dashboards, editors, forms, modals, or card grids.
- Text, icons, separators, or spacing are too small to inspect confidently in the full image.
- Recursive layout decomposition identifies a block that needs scoped analysis.

Slice analysis regions by implementation boundaries such as page sections, header/sidebar/main/footer, panels, modals, tables, card grids, representative cards or list items, toolbars, and control groups.

Slice frontend asset candidates when the frontend needs image assets such as product photos, people, logos, screenshots inside devices, illustrations, detailed textures, realistic shadows/materials, or decorative bitmap overlays.

For every frontend asset candidate, record:

- asset name
- short visual description
- parent path and approximate bounds
- intended frontend use
- recommended source strategy: `direct-crop`, `image-to-image`, or `web-similar-asset`
- reason for the source strategy
- expected output format and path
- confidence and known limitations

When working inside a project, save analysis slices under:

```text
.codex/image2code/<task-id>/
  reference-full.png
  slices/
    01-header.png
    02-main-panel.png
    03-card-grid.png
  asset-candidates/
    01-hero-product.png
  manifest.json
```

The `manifest.json` should record source image, viewport, slice type, file names, parent paths, crop bounds, reason, use, source strategy, and confidence. Do not place analysis slices in product asset directories such as `src/assets`. Only place finalized frontend assets in product asset directories after the source decision and quality check are complete.

## Recursive Layout Decomposition

After the first layout extraction, inspect each `Need Build: yes` block and decide whether it should be analyzed again as its own scoped layout region.

Run a scoped layout extraction for a child block when one or more of these are true:

- The block contains too many unique or non-repeating visual elements to implement confidently as one component.
- The block uses a `mixed` layout or has nested rows, columns, overlays, cards, forms, tables, dashboards, editors, or repeated groups.
- The block has more than 5 meaningful children.
- The block would likely become more than one component in code.
- The block has dense controls, nested responsive behavior, or layout-critical typography.
- The block has low confidence, usually below 80.

When recursing:

- Treat the selected block as the new screenshot scope.
- Use an existing slice for the block when available, or create a new scoped slice if the region is too dense to inspect in the full image.
- Analyze only the block's internal layout.
- Preserve the parent-child path, for example `Page > MainPanel > PricingGrid > PlanCard`.
- Prefer repeated patterns over instance-by-instance analysis. If a grid has many similar cards, decompose one representative card and track the rest as repeated instances.
- Keep small details such as icons, dots, badges, dividers, labels, and simple buttons for element extraction unless they affect layout structure.

Stop recursing when:

- The block maps cleanly to one implementation component or a small obvious component group.
- Remaining children are simple elements rather than layout modules.
- Further decomposition would not change the DOM/component plan.
- The analysis reaches depth 3, unless the user explicitly asks for deeper decomposition.
