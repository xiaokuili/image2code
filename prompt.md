# Image2Figma Prompt

Use this prompt with Codex to turn a webpage screenshot into `image2figma.v5` JSON.

```text
You are generating JSON for my local Figma importer.

Input:
- a screenshot of a webpage viewport
- an icon inventory JSON generated from the same screenshot

Goal: recreate the screenshot as editable Figma layers using image2figma JSON.

Output ONLY valid JSON. No markdown. No explanation.

Required workflow:
- First generate or receive an icon inventory JSON for the screenshot.
- Then generate the image2figma JSON using that icon inventory as a checklist.
- The final JSON should cover at least 80% of the high importance icons in the inventory.
- After high icons are covered, add medium icons when they improve visual fidelity.
- Do not invent extra icons just to increase coverage.

Important:
- The final answer must be one complete JSON object.
- It must be parseable by JSON.parse.
- Do not include comments.
- Do not include any text outside the JSON.

Schema summary:
{
  "schema": "image2figma.v5",
  "meta": {},
  "page": {
    "name": "...",
    "background": { "r": 0, "g": 0, "b": 0, "a": 1 }
  },
  "root": {
    "type": "FRAME",
    "name": "...",
    "size": { "width": screenshot_width, "height": screenshot_height },
    "fills": [],
    "children": []
  }
}

Allowed node types:
- FRAME
- TEXT
- RECTANGLE
- IMAGE
- SVG

Hard rules:
- Use the screenshot's actual pixel dimensions for root.size.
- Do not hardcode 1440, 1280, or any fixed viewport unless it matches the screenshot.
- Use absolute positions for every visible child:
  "position": { "x": number, "y": number }
- Use size for every visible layout node:
  "size": { "width": number, "height": number }
- Use RGB colors from 0 to 1, not hex.
- Use Inter as the default font family.
- Use TEXT nodes for all readable text.
- Use RECTANGLE nodes for backgrounds, buttons, dividers, cards, panels, pills, and simple shapes.
- Use SVG nodes for visible icons, logos, arrows, chevrons, stars, symbols, and line art.
- Use IMAGE nodes only as placeholders for complex screenshots or product-preview areas.
- Do not use gradients.
- Do not use image fills.
- Do not use unsupported properties.
- Do not flatten the whole screenshot into one image.
- Prioritize editable structure over pixel-perfect reproduction.

Icon rules:
- Do not omit visible icons.
- Every visible logo mark, arrow, chevron, star, play icon, plus icon, search icon, menu icon, status icon, product UI icon, or decorative symbol must be represented.
- Use SVG nodes for icons whenever possible.
- If the exact icon is hard to identify, create a simple approximate SVG with the same size, color, stroke weight, and position.
- Do not replace icons with plain rectangles unless the icon is too tiny to matter visually.
- Navigation logo marks, CTA arrows, product preview toolbar icons, and sidebar icons are mandatory when visible.
- Identify icons by context first, then draw a similar SVG. For example:
  - text "Inbox" usually needs an inbox/tray icon.
  - text "My issues" usually needs a circular issue/status icon.
  - text "Reviews" usually needs a branch/git/review icon.
  - text "Pulse" usually needs a lightning/activity icon.
  - text "Projects" usually needs a cube/box icon.
  - text "More" usually needs a three-dots icon.
  - text "New ... ->" needs a right arrow icon.
  - app toolbars often need search, edit/new, link, copy, branch, expand, close, attach, and send icons.
- If the source webpage or screenshot context suggests a known icon family, use a simple lucide-style outline approximation. Do not fetch remote assets.
- Use the provided icon inventory instead of guessing a fixed count. If no inventory is provided, create an internal one first.
- Prioritize high importance icons. Stop only after at least 80% of high importance icons are represented.
- Preserve inventory icon names in SVG layer names whenever possible.

Decomposition workflow:
Step 1: Identify the root viewport.
- Determine the screenshot width and height.
- Create one root FRAME with that exact size.
- Set the page background and root background based on the screenshot.

Step 2: Split the screenshot into major sections.
- Identify large logical sections such as:
  - Navigation
  - Announcement bar
  - Hero
  - CTA group
  - Product preview
  - Social proof
  - Background decoration
- Create one FRAME for each major section.
- Each section FRAME must have a clear name and approximate position/size.
- Put all children of that section inside the section FRAME.
- Child positions must be relative to their parent FRAME.

Step 3: Split each section into components.
For each major section, create nested component-like FRAMEs when useful:
- Navigation:
  - Logo group
  - Nav links group
  - Right actions group
- Hero:
  - Eyebrow / badge
  - Headline
  - Subheadline
  - CTA buttons
- Product preview:
  - Outer container
  - Toolbar / header
  - Sidebar
  - Main content area
  - Cards / rows / controls
- Background:
  - Large blocks, lines, glow approximations, grids, or decorative shapes

List and row rules:
- Do not combine multiple visible menu/list rows into one multiline TEXT node when those rows have icons.
- Each sidebar item, toolbar item, activity row, status row, and card row should be its own FRAME.
- Each row FRAME should contain its icon SVG and text label as separate child nodes.
- Use multiline TEXT only for real paragraphs, long descriptions, or code-like blocks.

Step 4: Build each component from editable primitives.
- Text must be TEXT nodes.
- Buttons should be a RECTANGLE background plus a TEXT label.
- Pills/badges should be a RECTANGLE background plus TEXT.
- Icons must be SVG nodes when visible. Approximate the shape if needed.
- Product screenshots or complex imagery should become IMAGE placeholder nodes or simplified editable frames.
- Use human-readable layer names.

Step 5: Icon pass.
- Scan the screenshot again only for icons and symbols.
- First list the expected icon layers internally by section, or read the provided icon inventory if one exists: Navigation, Hero, Product Preview Sidebar, Product Preview Header, Main Panel, Details Panel, Agent Window.
- For each expected icon, classify:
  - semantic name, such as "Search Icon" or "Inbox Icon"
  - nearby text/context
  - approximate position and size
  - whether it is meaningful enough to affect visual fidelity
- Add missing SVG nodes for:
  - logo marks
  - navigation/action icons
  - button arrows
  - product preview toolbar icons
  - sidebar icons
  - status dots
  - small decorative symbols
- Keep SVG markup simple and valid.
- Use the same visual color as the screenshot.
- Name each icon layer clearly, for example "Search Icon", "CTA Arrow Icon", or "Linear Logo Mark".
- Before returning the final JSON, verify that all visible rows with icon spacing have an SVG icon child.
- If high importance icon coverage is below about 80%, continue the icon pass before returning JSON.
- Use icon inventory names as SVG node names when possible so automated coverage checks can match them.

Step 6: Preserve visual hierarchy.
- Match the screenshot's dominant spacing, typography scale, alignment, and contrast.
- Larger text should use larger font sizes and heavier weights.
- Secondary text should use lower contrast.
- Use rounded corners and strokes where visible.
- Keep the layout visually close enough for a short demo.

Step 7: Final assembly.
- The final root.children array should contain the major section FRAMEs in visual order.
- Each major section should contain its nested children.
- The final JSON must be complete and importable by the Figma plugin.

Return the complete image2figma.v5 JSON now.
```
