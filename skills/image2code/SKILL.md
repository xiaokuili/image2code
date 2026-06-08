---
name: image2code
description: Generate frontend code from an image by first extracting a Page -> Component tree, saving intermediate JSON files, then implementing code in depth-first batches from top-level components downward. Use when the task needs image-to-code, staged component generation, visible DFS steps, and support for slicing assets later via element placeholders.
---

# Image2Code

Use this skill when implementing UI from an image.

In this repo, this skill is the execution contract for `apps/web/tasks/<task-name>/`.

## Model

Use this tree:

`Page -> Component -> Component | Element`

- `Component`: a UI part with a clear responsibility
- `Element`: the smallest render unit for the current pass
- `layout`: a property on `Page` or `Component`, not a standalone node

## Output Layout

Write all generated artifacts inside the current task directory.

Repo-specific task layout:

```text
apps/web/tasks/<task-name>/
  source.png
  preview/
    index.html
  skills.json
  task.json
  work/
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

Rules:

- `source.png` is the required image input
- `preview/` contains the runnable HTML preview for the web app
- `skills.json` records the artifact paths produced by this skill
- `task.json` is optional metadata
- `work/` contains the DFS analysis tree and generated implementation files

Inside `work/`, use this layout:

```text
work/
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

1. Fetch the next task.
2. Read `source.png` and identify page structure.
3. Save `work/00_page.json`.
4. Put page-level layout into `work/00_page.json`.
5. Save `work/01_root-components.json` with top-level components only.
6. Expand components depth-first using nested folders under `work/`.
7. Save one `component.json` per component node.
8. Save one `*.element.json` per element leaf.
9. Implement code for that component branch before moving to the next branch.
10. Write runnable preview output under `preview/`.
11. If an image element is not sliced yet, keep it as a `placeholder`.
12. After structure is stable, place cut assets into `work/slices/` and replace placeholders.
13. Create or update `skills.json` so the web app can expose generated artifacts.

Rule: generate `Page` once, then generate top-level `Component`s one by one in DFS order.

## Task Intake

When this skill is used in this repo, fetch the next task from:

```text
apps/web/tasks/<task-name>/
```

Use:

```text
skills/image2code/scripts/get_next_task.py
```

The helper must be run from anywhere inside the repo. It walks upward from the current working directory until it finds `apps/web/tasks`, then resolves the task paths from there.

Expected task layout:

```text
apps/web/tasks/<task-name>/
  source.png
  preview/
    index.html
  skills.json
  task.json
  work/
```

This helper returns:

- task metadata from optional `task.json`
- source image path
- preview output path
- skills manifest path
- local task directory path relative to repo root

If `skills.json` does not exist yet, create it during execution.

Recommended initial shape:

```json
{
  "generator": "image2code",
  "artifactPaths": []
}
```

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

## Preview Rules

- `preview/index.html` is the main preview entry expected by the web app
- keep preview assets next to `index.html` when needed, for example `preview/styles.css`
- the preview should render without relying on files outside the task directory
- prefer emitting the preview from `work/src/`, then copying or materializing the runnable result into `preview/`

## Skills Manifest Rules

Update `skills.json` at the end of each run.

- set `generator` to `image2code`
- set `artifactPaths` to repo-relative paths
- include the key structured outputs first
- include preview artifacts when they are useful entry points

Recommended ordering:

1. `apps/web/tasks/<task-name>/work/00_page.json`
2. `apps/web/tasks/<task-name>/work/01_root-components.json`
3. additional DFS node files worth exposing
4. `apps/web/tasks/<task-name>/preview/index.html`
5. supporting preview assets if they matter

## What This Skill Produces

This skill should produce:

- one page JSON with page goal and page-level layout
- one root-component JSON with top-level components
- one DFS folder tree under `work/`
- one `component.json` for each component node
- one `*.element.json` for each element leaf
- generated frontend code under `work/src/`
- runnable preview output under `preview/`
- future sliced assets under `work/slices/`
- one updated `skills.json`

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
