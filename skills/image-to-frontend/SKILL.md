---
name: image-to-frontend
description: Use when implementing frontend UI from a reference image, screenshot, mockup, or visual design. Runs a structured image-to-code workflow: layout extraction, element extraction, code implementation, screenshot comparison, and targeted refinement for close visual reproduction.
---

# Image To Frontend

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
   - Store slices under `.codex/image-to-frontend/<task-id>/` when working inside a project.
   - Use `references/image-slicing.md` when a detailed slicing plan is useful.

4. Run layout extraction before writing code.
   - Identify implementation modules and hierarchy.
   - Use `references/layout-extraction.md` when a detailed prompt is useful.
   - Recursively decompose complex layout blocks before moving to element extraction.

5. Run element extraction after layout extraction.
   - Identify small implementation-relevant details such as separators, dots, chips, overlays, icons, shadows, and nested controls.
   - Use `references/element-extraction.md` when a detailed prompt is useful.

6. Implement the first pass.
   - Build stable parent layout first.
   - Add small elements after the structure is correct.
   - Prefer project-native components, styling conventions, and assets.
   - If assets are unavailable, approximate with CSS/SVG/placeholders and state the limitation.

7. Verify with a rendered screenshot when feasible.
   - Start the local app or static preview.
   - Capture the implementation at the same approximate viewport as the reference.
   - If screenshot tooling is unavailable, run the best available build/static checks and note the gap.

8. Compare reference vs implementation.
   - Focus on layout, spacing, grouping, alignment, sizing, missing/extra elements, and typography effects on layout.
   - Use `references/visual-diff.md` when a detailed diff prompt is useful.

9. Refine targeted issues.
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
- Treat `reference image slicing` as an analysis aid, not a replacement for full-image inspection.
- Treat `element extraction` as the detail inventory.
- Treat `diff/refine` as the quality gate.
- Do not claim pixel perfection unless a screenshot comparison was actually performed and the result supports it.
- Preserve existing project patterns unless the user explicitly asks for a new visual direction.

## Reference Image Slicing

Before detailed layout extraction, decide whether the reference image should be sliced into scoped regions. Always inspect the full image first and keep it as the global reference. Slices are auxiliary references for dense or complex regions.

Use slices when:

- The screenshot contains dense UI regions that are hard to inspect at full scale.
- A region has many unique, non-repeating elements.
- A region contains nested layout such as tables, dashboards, editors, forms, modals, or card grids.
- Text, icons, separators, or spacing are too small to inspect confidently in the full image.
- Recursive layout decomposition identifies a block that needs scoped analysis.

Slice by implementation boundaries such as page sections, header/sidebar/main/footer, panels, modals, tables, card grids, representative cards or list items, toolbars, and control groups. Do not slice arbitrary decorative fragments unless they are asset-like or visually ambiguous.

When working inside a project, save analysis slices under:

```text
.codex/image-to-frontend/<task-id>/
  reference-full.png
  slices/
    01-header.png
    02-main-panel.png
    03-card-grid.png
  manifest.json
```

The `manifest.json` should record source image, viewport, slice file names, parent paths, crop bounds, and the reason each slice exists. Do not place analysis slices in product asset directories such as `src/assets` unless the user explicitly wants to reuse them as production assets.

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
