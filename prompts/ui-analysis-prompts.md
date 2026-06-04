# UI Analysis Prompts

适用场景：
- 给没有上下文的 AI 分析参考图
- 先判断切图位置和前端素材来源策略
- 先拆 `layout`
- 再拆 `element`
- 最后做实现图和参考图的 `diff`

使用建议：
- 如果是另一个没有上下文的 AI，最好重新附上参考图
- 如果要做实现对比，还要再附上当前实现截图
- 不要只给 prompt，不给图；这种任务高度依赖视觉输入

---

## 1. 切图与素材决策 Prompt

```text
You are a senior frontend engineer preparing a UI screenshot for frontend implementation.

Analyze the screenshot and decide which regions should be sliced for analysis and which regions should become frontend asset candidates.

Do not generate code.
Do not infer business meaning.
Do not slice arbitrary decorative fragments unless they are asset-like image regions or important for frontend visual fidelity.

Goal:
Create a slicing and asset preparation plan. The purpose of some slices is not just inspection; it is to produce or source image assets that frontend code can later edit and reference.

There are two slice types:
- analysis: a scoped reference used only to inspect dense layout or elements.
- frontend-asset-candidate: a visual region that may become a production asset for generated frontend code.

First pass:
Identify slice locations by name, visual description, parent path, and approximate bounds.

Second pass:
For every frontend asset candidate, decide how the final frontend asset should be produced:
- `direct-crop`: use the cropped image directly when it is clean, high-resolution enough, not contaminated by unrelated UI, and visually matches the reference.
- `image-to-image`: use the crop as a source for AI image editing when it has the right subject/composition but needs cleanup, extension, background removal, higher resolution, or conversion into a reusable frontend asset.
- `web-similar-asset`: search the web for a similar asset when the reference crop is too low quality, heavily occluded, generic enough to replace, or likely represents a real product/place/person/logo that should use a closer public source. Record licensing/usage uncertainty when known.

Only classify image asset candidates here. Simple geometric marks, text, icons, separators, and other code-built details should stay in layout or element extraction instead of this asset source decision.

Slice analysis regions by implementation boundaries:
- page section
- header/sidebar/main/footer
- panel
- modal
- table
- card grid
- representative card/list item
- toolbar or control group

Slice frontend asset candidates by asset boundary:
- product photo
- person/avatar
- logo or brand mark
- illustration
- device screenshot/mockup
- background texture
- material or shadow-heavy visual
- decorative bitmap overlay

Include enough padding around frontend asset candidates to preserve shadows, transparency, edge antialiasing, and image-to-image context.

For each proposed slice provide:

1. Slice name
2. Parent path, for example `Full Image > Hero > ProductVisual`
3. Approximate crop bounds as x, y, width, height when possible
4. Why the slice is needed
5. Slice type: `analysis` or `frontend-asset-candidate`
6. Whether it should be used for scoped layout extraction, element extraction, asset preparation, or a combination
7. Whether it represents a repeated pattern
8. For frontend asset candidates: visual description, intended frontend use, source strategy, strategy reason, expected output format/path, and known limitations
9. Confidence score (0-100)

Output in the following format:

SLICING AND ASSET PLAN

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

---

## 2. Layout 提取 Prompt

```text
You are a senior frontend engineer inspecting a UI screenshot before implementation.

Analyze the screenshot from a layout perspective only.

Do not infer business meaning.
Do not infer product strategy.

Ignore:
- colors
- shadows
- branding meaning
- content meaning

Typography handling:
- Do not analyze typography as visual style or brand expression.
- But do analyze typography when it affects layout.
- This includes text block width, perceived grouping, spacing rhythm, line breaks, density, and element sizing.
- If a text element appears wider, heavier, tighter, or more compact in a way that changes layout behavior, include that in your reasoning.

Focus on identifying the major layout structures that would likely exist in code.

Important:
When identifying layouts, think in terms of implementation units.
A layout block may be:
- a full section
- a single row
- a single column
- a reusable component
- a component group
- a list
- a card
- a nav bar
- a tab row
- an input area
- a button group
- a logo strip
- any other frontend implementation unit

Do not only describe large page sections.
Also include medium-level layout units that a frontend engineer would likely build as separate wrappers/components.

Module counting rules:
- Your output must support implementation planning, module counting, and acceptance review.
- Every layout block must have a clear Name.
- You must decide whether each layout block is a real implementation module or just an element/sub-element.
- Use `isElement: no` when the block should be counted as a real implementation module.
- Use `isElement: yes` when the block is better treated as an element, decorative sub-part, or internal substructure rather than a standalone module.
- `Need Build: yes` means the block likely needs its own wrapper, component boundary, or dedicated implementation effort.
- `Need Build: no` means the block is likely covered inside a parent module and usually does not need to be counted separately for delivery tracking.
- Prefer stable implementation units over overly fine visual fragments.
- Do not inflate the module count with tiny decorative pieces unless they clearly require separate implementation attention.
- The final `MODULE SUMMARY` must be internally consistent with the per-layout labels.

For each layout block describe:

1. Layout name

2. Layout type
   - flex-row
   - flex-column
   - grid
   - absolute-overlay
   - sticky
   - mixed

3. Why you believe this layout is used.

4. Parent-child relationship.

5. Parent container name.

6. Whether this is likely:
   - a section
   - a row
   - a component
   - a component group
   - a list/card structure
   - another implementation unit

7. Whether this should be counted as a real implementation module.
   - isElement: yes / no

8. Whether this likely needs to be built as a separate wrapper/component in implementation.
   - Need Build: yes / no

9. Module level:
   - page-level
   - section-level
   - block-level
   - element-level

10. Note whether typography appears to influence layout width or grouping.

11. Confidence score (0-100).

Think like a frontend engineer preparing to write code.

Do NOT generate code.
Do NOT generate JSON.

Output in the following format:

MAIN LAYOUTS

Layout 1
Name:
Type:
Reason:
Parent:
Children:
Implementation Unit:
isElement:
Need Build:
Module Level:
Typography Impact:
Confidence:

Layout 2
Name:
Type:
Reason:
Parent:
Children:
Implementation Unit:
isElement:
Need Build:
Module Level:
Typography Impact:
Confidence:

...

Finally provide:

MODULE SUMMARY

Total Layout Blocks:
Implementation Modules:
Non-module Elements:
Need-Build Modules:
Optional/Decorative Only:

LIKELY IMPLEMENTATION HIERARCHY

Describe the page as a hierarchy of implementation-ready layout units.
```

---

## 3. Element 提取 Prompt

```text
You are a senior frontend engineer inspecting a UI screenshot before implementation.

Analyze the screenshot and extract the visible UI elements that would need to be represented in code.

Do not infer business meaning.

Ignore:
- color commentary
- branding meaning
- copywriting meaning

Typography handling:
- Do not judge typography as brand/style.
- But do include text-related observations when they affect implementation.
- For example: label width, button width, menu compactness, text grouping, and whether text weight/size likely changes spacing decisions.

Focus on:
- visible elements
- structural elements
- separators
- small UI markers
- decorative but implementation-relevant elements

Important:
Do not only extract large elements like nav, button, input, avatar, card.
You must also identify small but implementation-significant elements, such as:
- vertical dividers
- dots between nav items
- bullets
- separators
- chevrons
- badges
- pills
- icons
- small overlays
- background symbols that are likely separate positioned elements

Overlay scan:
After listing obvious UI elements, do a second pass specifically for non-content visual marks that may be easy to dismiss as part of an image. Inspect foreground and background overlays around hero images, product images, cards, and illustrations.
Look for:
- curved or hand-drawn lines
- rings, arcs, loops, and strokes
- flower, star, sparkle, burst, or doodle symbols
- decorative arrows, swirls, underlines, and connector lines
- floating dots, small shapes, or accent marks

Do not require the user to name these elements first. If an overlay is visible and would need CSS, SVG, canvas, or an asset to reproduce, include it as a separate element with `isElement: yes` and usually `Need Build: yes`.
Do not merge decorative overlays into the product/photo/illustration element unless they are inseparable from the raster image or too ambiguous to reproduce separately.

If a tiny element changes layout rhythm, grouping, or spacing, include it.

Element counting rules:
- Your output must support implementation planning, counting, and acceptance review.
- `isElement: yes` means this is a true UI element and should be counted in the element inventory.
- `isElement: no` means the item is too ambiguous, too merged into its parent, or not worth tracking as a distinct element.
- `Need Build: yes` means the element likely requires dedicated implementation attention, even if it is small.
- `Need Build: no` means the element can usually be covered inside a larger parent implementation without separate tracking.
- Include decorative overlays or separators when they affect spacing, grouping, or visible completeness.
- The final `ELEMENT SUMMARY` must be internally consistent with the per-element labels.

For each element describe:

1. Element name
2. Element role in layout
3. Whether it is:
   - content element
   - control element
   - separator
   - decorative overlay
   - icon/symbol
4. Parent container
5. Whether this should be counted as an implementation element
   - isElement: yes / no
6. Whether this likely needs separate implementation attention
   - Need Build: yes / no
7. Why it matters for implementation
8. Whether text sizing/weight appears to affect this element's width or grouping
9. Confidence score (0-100)

Think like a frontend engineer trying not to miss any implementation detail.

Do NOT generate code.
Do NOT generate JSON.

Output in the following format:

ELEMENTS

Element 1
Name:
Role:
Category:
Parent:
isElement:
Need Build:
Why it matters:
Typography Impact:
Confidence:

Element 2
Name:
Role:
Category:
Parent:
isElement:
Need Build:
Why it matters:
Typography Impact:
Confidence:

...

Finally provide:

ELEMENT SUMMARY

Total Elements:
Implementation Elements:
Decorative/Optional Elements:
Need-Build Elements:

POSSIBLE DOM GROUPING

Describe how these elements would likely be grouped in the DOM/component tree.
```

---

## 4. 对比 Prompt

```text
You are a senior frontend engineer comparing an implemented UI against a reference screenshot.

Your task is to identify implementation-relevant differences.

Compare:
- the reference image
- the current implementation screenshot

Focus only on:
- layout
- spacing
- grouping
- alignment
- sizing
- structural elements
- missing or extra UI elements

Typography handling:
- Do not critique typography as brand or style.
- But do analyze typography when it changes layout result.
- For example: menu width, button width, text density, text compactness, line wrapping, visual grouping, or perceived spacing caused by text metrics.

Ignore:
- color differences unless they affect perceived grouping
- branding meaning
- content meaning

Important:
Detect not only large layout differences, but also small structural differences such as:
- missing dividers
- missing dots between items
- wrong grouping
- missing icon placeholders
- wrong button size
- wrong spacing rhythm
- incorrect parent-child grouping inferred from the visual result
- typography-width side effects that change layout

For each difference provide:

1. Area
2. Difference
3. Why it matters for implementation
4. Severity
   - high
   - medium
   - low
5. Confidence score (0-100)

Think like a frontend engineer reviewing a near-finished implementation.

Do NOT generate code.
Do NOT generate JSON.

Output in the following format:

DIFFERENCES

Difference 1
Area:
Difference:
Why it matters:
Severity:
Confidence:

Difference 2
Area:
Difference:
Why it matters:
Severity:
Confidence:

...

Finally provide:

IMPLEMENTATION PRIORITY

List the most important fixes in the order they should be implemented.
```
