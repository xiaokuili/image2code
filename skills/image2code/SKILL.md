---
name: image2code
description: Generate frontend code from an image by first extracting a Page -> Component tree, saving intermediate JSON files, then implementing code in depth-first batches from top-level components downward. Use when the task needs image-to-code, staged component generation, visible DFS steps, and support for slicing assets later via element placeholders.
---

# Image2Code

Use this skill when implementing UI from an image.

## Model

Use this tree:

`Page -> Component -> Component | Element`

- `Component`: a UI part with a clear responsibility
- `Element`: the smallest render unit for the current pass
- `layout`: a property on `Page` or `Component`, not a standalone node

## Output Layout

Create work under one task folder:

```text
work/<task>/
  00_page.json
  01_root-components.json
  01_nav/
    component.json
    02_nav_brand/
      component.json
      03_logo.element.json
    04_nav_menu/
      component.json
      05_menu_item_1.element.json
  06_hero/
    component.json
    07_hero_bg.element.json
    08_hero_title.element.json
  slices/
  src/
```

- `00_page.json`: page goal
- `01_root-components.json`: top-level component list
- each component folder: one component node
- each element file: one element leaf
- numeric prefixes: DFS order
- `slices/`: future cut assets
- `src/`: generated code

## Flow

1. Read the image and identify page structure.
2. Save `00_page.json`.
3. Put page-level layout into `00_page.json`.
4. Save `01_root-components.json` with top-level components only.
5. Expand components depth-first using nested folders under `work/<task>/`.
6. Save one `component.json` per component node.
7. Save one `*.element.json` per element leaf.
8. Implement code for that component branch before moving to the next branch.
9. If an image element is not sliced yet, keep it as a `placeholder`.
10. After structure is stable, place cut assets into `slices/` and replace placeholders.

Rule: generate `Page` once, then generate top-level `Component`s one by one in DFS order.

## Slice Rules

Analyze slicing at the start of each `Component`, before writing that branch.

- only slice visuals that are expensive or unreliable to reproduce in code
- slice at the `Element` level, not at the whole-page level

Usually slice:

- photos
- illustrations
- complex backgrounds
- irregular decorative graphics
- brand-owned visual assets

Usually do not slice:

- text
- simple buttons
- common cards
- spacing
- simple icons
- basic shapes and shadows

Default target: generate the most complete pure-code version first, then slice only the remaining hard visual parts.

## JSON Rules

- Keep JSON minimal.
- Every node needs `name` and `type`.
- `Page` and `Component` may include `layout`.
- `Element` should include `style` when visual output depends on typography, size, spacing, color, border, radius, or background.
- `Element` may include `placeholder`.
- Record display size as CSS-oriented size, not source file size.

Use a minimal `style` object on `Element` nodes when needed. Prefer CSS-oriented fields such as:

- `width`
- `height`
- `fontSize`
- `fontWeight`
- `lineHeight`
- `color`
- `background`
- `border`
- `borderRadius`
- `padding`
- `margin`
- `gap`

If your pipeline uses named tokens, you may use `styleTokens` in addition to or instead of raw values.

Rules:

- add `placeholder` only when the current output is intentionally temporary and should be replaced later

See [references/schema.json](references/schema.json) for the minimal schema and example.

## What This Skill Produces

This skill should produce:

- one page JSON with page goal and page-level layout
- one root-component JSON with top-level components
- one DFS folder tree under `work/<task>/`
- one `component.json` for each component node
- one `*.element.json` for each element leaf
- generated frontend code under `src/`
- future sliced assets under `slices/`

This skill should make visible:

- the top-level component split
- the DFS expansion order
- the parent-child hierarchy
- which elements are still placeholders
- which visuals are still pending slicing

## Code Strategy

For each top-level component:

1. create the component shell
2. if needed, split into child components first
3. otherwise finish with elements
4. use placeholder blocks for late-sliced images
5. stop when the branch is complete

Do not generate the whole page in one pass unless the page is trivial.
