# Phase 1 Sprint

## Goal

This phase is not about building a full product.

The goal is:

- attract the first `10` interested users
- show a convincing visual demo
- prove that `image or URL -> editable Figma result` is worth attention

## Working Mode

This phase is manual.

- generation can be done manually with Codex
- no need to fully automate the pipeline yet
- speed of implementation matters more than backend completeness

## Input / Output

Input:

- one image
- one URL

Output:

- a `before / after` presentation
- left side is the original image or captured URL result
- right side is the generated Figma result

The main UI job in this phase is not infrastructure.
It is making the comparison feel impressive.

## Core Requirement

The UI should clearly communicate:

- source on the left
- editable Figma result on the right
- transformation is obvious
- result looks clean and desirable

If people understand the value in 3 seconds, the UI is doing its job.

## Phase 1 Priorities

1. make the UI attractive
2. make the before / after comparison easy to understand
3. make the generated result feel editable and structured
4. make the flow believable for a small demo audience

## Non-Goals

Do not optimize for these yet:

- batch processing
- full automation
- large-scale backend architecture
- generic support for every kind of page
- pixel-perfect accuracy
- production-grade pipeline robustness

## UI Direction

The product surface should focus on one thing:

`input -> transformation -> visible result`

Recommended structure:

- input area for image or URL
- large side-by-side comparison area
- left panel labeled `Before`
- right panel labeled `After`
- right panel should visually emphasize the Figma result

The right side should feel more valuable than the left side.

## Success Criteria

This phase is successful if:

- the demo is clear without explanation
- the before / after layout feels visually strong
- the right side looks like a usable Figma outcome
- at least `10` people would want to try it or ask for access

## Two-Day Plan

### Day 1

1. Rewrite the product framing in the UI

- center the experience around `Before / After`
- remove extra complexity from the first screen
- make the main comparison large and obvious

Acceptance:

- the page communicates the concept in one glance

2. Define the exact input story

- image upload is supported
- URL input is supported
- both inputs should lead to the same comparison experience

Acceptance:

- user can understand both entry points immediately

3. Decide the visual style of the result area

- make the `After` side feel premium
- give the Figma side stronger framing and emphasis
- avoid a raw tool or debug aesthetic

Acceptance:

- the result area looks like a product demo, not an internal tool

### Day 2

1. Polish the comparison UI

- improve spacing
- improve panel proportions
- improve typography hierarchy
- improve CTA clarity

Acceptance:

- the screen feels attractive enough to share publicly

2. Prepare 3 to 5 strong examples

- choose examples where the result looks good
- make sure before / after contrast is obvious
- prefer examples that show structure improvement clearly

Acceptance:

- examples are good enough to convince early viewers

3. Final review against the phase goal

Ask:

- would this attract 10 real people
- is the core value obvious
- does the UI create curiosity

Acceptance:

- the page is good enough to publish as an early demo

## Release Standard

Release when all of these are true:

- image and URL are both represented as inputs
- before / after is the main experience
- left is source
- right is Figma result
- the UI feels polished enough to attract attention

That is enough for phase 1.
