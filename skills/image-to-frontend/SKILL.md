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

3. Run layout extraction before writing code.
   - Identify implementation modules and hierarchy.
   - Use `references/layout-extraction.md` when a detailed prompt is useful.

4. Run element extraction after layout extraction.
   - Identify small implementation-relevant details such as separators, dots, chips, overlays, icons, shadows, and nested controls.
   - Use `references/element-extraction.md` when a detailed prompt is useful.

5. Implement the first pass.
   - Build stable parent layout first.
   - Add small elements after the structure is correct.
   - Prefer project-native components, styling conventions, and assets.
   - If assets are unavailable, approximate with CSS/SVG/placeholders and state the limitation.

6. Verify with a rendered screenshot when feasible.
   - Start the local app or static preview.
   - Capture the implementation at the same approximate viewport as the reference.
   - If screenshot tooling is unavailable, run the best available build/static checks and note the gap.

7. Compare reference vs implementation.
   - Focus on layout, spacing, grouping, alignment, sizing, missing/extra elements, and typography effects on layout.
   - Use `references/visual-diff.md` when a detailed diff prompt is useful.

8. Refine targeted issues.
   - Apply fixes in priority order.
   - Iterate 1-3 times when the environment supports screenshot comparison.
   - Stop when the result is close enough for the request or when remaining gaps require missing assets.

## Output Standard

The final code should be a working implementation in the user's project, not just a prompt or plan.

Final response should include:

- what was implemented
- where the code changed
- verification performed
- remaining visual limitations, if any

## Rules

- Treat `layout extraction` as the page skeleton and module plan.
- Treat `element extraction` as the detail inventory.
- Treat `diff/refine` as the quality gate.
- Do not claim pixel perfection unless a screenshot comparison was actually performed and the result supports it.
- Preserve existing project patterns unless the user explicitly asks for a new visual direction.
