# Image2Figma Prompt

Use this prompt with Codex to turn a webpage screenshot into `image2figma.v5` JSON.

```text
You are generating JSON for my local Figma importer.

Input: a screenshot of a webpage viewport.
Goal: recreate the screenshot as editable Figma layers using image2figma JSON.

Output ONLY valid JSON. No markdown. No explanation.

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
- Use SVG nodes only for simple icons, logos, arrows, chevrons, stars, or line art.
- Use IMAGE nodes only as placeholders for complex screenshots or product-preview areas.
- Do not use gradients.
- Do not use image fills.
- Do not use unsupported properties.
- Do not flatten the whole screenshot into one image.
- Prioritize editable structure over pixel-perfect reproduction.

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

Step 4: Build each component from editable primitives.
- Text must be TEXT nodes.
- Buttons should be a RECTANGLE background plus a TEXT label.
- Pills/badges should be a RECTANGLE background plus TEXT.
- Icons should be small SVG nodes if simple, otherwise omit or approximate.
- Product screenshots or complex imagery should become IMAGE placeholder nodes or simplified editable frames.
- Use human-readable layer names.

Step 5: Preserve visual hierarchy.
- Match the screenshot's dominant spacing, typography scale, alignment, and contrast.
- Larger text should use larger font sizes and heavier weights.
- Secondary text should use lower contrast.
- Use rounded corners and strokes where visible.
- Keep the layout visually close enough for a short demo.

Step 6: Final assembly.
- The final root.children array should contain the major section FRAMEs in visual order.
- Each major section should contain its nested children.
- The final JSON must be complete and importable by the Figma plugin.

Return the complete image2figma.v5 JSON now.
```
