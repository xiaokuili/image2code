# Visual Diff Prompt

Use this after the first implementation screenshot is available.

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

Finally provide:

IMPLEMENTATION PRIORITY

List the most important fixes in the order they should be implemented.
```
