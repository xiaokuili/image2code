# Icon Repair Prompt

Use this prompt when the generated JSON imports correctly but has too few icons.

```text
You are repairing an existing image2figma.v5 JSON file.

Inputs:
1. The original webpage screenshot.
2. The existing image2figma.v5 JSON.
3. An icon inventory JSON generated from the screenshot.

Goal:
Add missing visible icons as SVG nodes while preserving the existing layout.

Output ONLY the full repaired JSON object. No markdown. No explanation.

Hard rules:
- Do not rewrite the whole design.
- Do not remove existing nodes unless they are clearly wrong.
- Preserve root.size, page, text content, frame names, and overall layout.
- Add SVG nodes for missing visible icons.
- Use the icon inventory as the source of truth for expected icons.
- If a visible row currently exists as a multiline TEXT node but should contain icons, split that section into row FRAMEs only when necessary.
- Keep positions relative to the existing parent frames.
- Use simple valid inline SVG.
- Use approximate lucide-style outline icons when exact icons are hard to identify.
- Use the screenshot's apparent icon color, usually muted gray on dark UI.
- The repaired JSON must pass:
  - issueCount = 0
  - TEXT >= 25
  - FRAME >= 8
  - high importance icon coverage >= 80%

Icon discovery workflow:
Step 1: Scan the screenshot for visible icon locations.
- Logo marks
- Navigation/action icons
- Announcement arrows
- Sidebar item icons
- Workspace/favorites chevrons
- Product preview header icons
- Details panel icons
- Activity feed icons
- Agent window toolbar icons
- Input attachment/send icons
- Build an internal expected icon inventory. Do not rely on a fixed SVG count.
- Use the external icon inventory instead of rebuilding from scratch. Only adjust it if the screenshot clearly contradicts it.
- Ignore icons that are too tiny, hidden, or visually meaningless for the demo.

Step 2: Match icon type from nearby text and context.
- "Inbox" -> inbox/tray icon.
- "My issues" -> circle/status icon.
- "Reviews" -> branch/review icon.
- "Pulse" -> lightning/activity icon.
- "Initiatives" -> target/mountain icon.
- "Projects" -> cube/box icon.
- "More" -> three dots icon.
- "Favorites" -> chevron down.
- "Coding Sessions ->" -> right arrow icon.
- "In Progress" -> status circle icon.
- "High" -> bar chart/priority icon.
- Toolbar actions -> search, edit/new, link, copy, branch, expand, close.
- Composer/input actions -> attach, send, loading/status.

Step 3: Add SVG nodes.
- Put each icon inside the correct parent frame.
- Name icons clearly, e.g. "Inbox Icon", "Search Icon", "CTA Arrow Icon".
- Match each icon's x/y/size to the screenshot and nearby text.
- Prefer 16-24 px icons for product UI and 24-42 px icons for logo marks.

Step 4: Verify before returning.
- Compare added SVG icon layer names against the expected icon inventory.
- If high importance icon coverage is below about 80%, continue adding missing high importance icons.
- After high importance icons are covered, add medium importance icons when they materially improve visual fidelity.
- Preserve inventory icon names in SVG layer names whenever possible.
- Ensure all SVG strings are valid XML-like SVG snippets.
- Return the complete merged JSON only.
```
