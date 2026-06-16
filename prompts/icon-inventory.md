# Icon Inventory Prompt

Use this before generating or repairing `image2figma` JSON. It turns a screenshot into a checklist of meaningful visible icons.

```text
You are analyzing a webpage screenshot before it is converted into editable Figma layers.

Goal:
Identify the meaningful visible icons that should be represented as SVG nodes in the final image2figma JSON.

Output ONLY valid JSON. No markdown. No explanation.

Return this shape:
{
  "page": "short page name",
  "viewport": {
    "width": screenshot_width,
    "height": screenshot_height
  },
  "icons": [
    {
      "name": "Search Icon",
      "section": "Product Preview Sidebar",
      "nearbyText": "Linear",
      "semanticType": "search",
      "importance": "high",
      "position": { "x": 930, "y": 1110 },
      "size": { "width": 22, "height": 22 },
      "visualDescription": "Muted gray magnifying glass outline",
      "match": ["search icon"]
    }
  ]
}

Rules:
- Identify icons before thinking about Figma JSON.
- Include only meaningful visible icons that affect visual fidelity.
- Ignore icons that are too tiny, too blurry, mostly hidden, or decorative noise.
- Prefer 12-24 meaningful icons for a complex SaaS viewport, but do not invent icons just to reach a count.
- Use approximate screenshot coordinates.
- Use these importance levels:
  - high: visible and important to page recognition
  - medium: useful for fidelity
  - low: optional tiny/detail icon
- The final generator should cover at least 80% of high + medium icons.
- Use human-readable names that can become SVG layer names.
- The "match" array should include lowercase-friendly terms that can be found in SVG layer names during automated checks.

Section examples:
- Navigation
- Hero
- Product Preview Sidebar
- Product Preview Header
- Main Issue Panel
- Details Panel
- Agent Window
- Composer

Common semantic types:
- logo
- arrow-right
- chevron-down
- search
- edit
- inbox
- issue
- review
- pulse
- initiative
- project
- more
- status
- priority
- user/avatar
- link
- copy
- branch
- expand
- close
- attach
- send

Now analyze the screenshot and return the icon inventory JSON.
```
