# Reference Cases

这个目录用于后续沉淀实际案例，建议每个案例至少保留：

- 参考图
- layout 提取结果
- element 提取结果
- 第一版实现
- diff 结果
- refine 后结果

建议的案例结构：

## Case Name

### Reference
- screenshot

### Layout Extraction
- module list
- implementation hierarchy

### Element Extraction
- element inventory

### First Pass Implementation
- page / component output

### Diff
- key mismatches

### Refine
- what changed
- what is still missing

---

## Agent AI SaaS Landing Page

### Reference
- User-provided Image #1
- Aspect: wide desktop landing page
- Status: supported as a current test case

### What This Case Tests
- Outer rounded browser-like page frame
- Top nav with logo, centered links, divider, login, and CTA
- Dark hero panel with large serif headline
- Left-side metric badge, subcopy, testimonial row, CTA row
- Right-side avatar cluster, connected workflow tabs, prompt card, cloud logo row
- Bottom customer logo strip
- Small implementation details: nav dots, separators, star markers, pill buttons, icon chips, stacked avatars, faint background texture

### Suggested Test Prompt

```text
使用 image-to-frontend skill，把这张 Agent AI SaaS landing page 参考图实现成前端页面。
先输出 layout extraction 和 element extraction，再实现代码，最后用截图对比并 refine。
重点检查：导航结构、深色 hero、左侧大标题、右侧 workflow/prompt card、底部 logo strip。
```

### Expected Boundary Notes
- Avatar portraits and brand logos require real assets for high fidelity.
- Cloud provider logos can be approximated with text/icon placeholders if assets are unavailable.
- The faint dark background texture can be approximated with CSS gradients or overlays.

---

## Radiance Beauty Commerce Landing Page

### Reference
- User-provided Image #2
- Aspect: wide desktop ecommerce landing page
- Status: supported as a current test case

### What This Case Tests
- Clean white ecommerce layout
- Header with brand, centered nav, search input, and user avatar
- Left hero copy block with CTA and social proof avatars
- Right large product visual with arched image mask
- Promotional product card grid
- Small implementation details: search icon, arrow icon, plus badges, circular product thumbnails, soft card shadows, decorative flower line overlay

### Suggested Test Prompt

```text
使用 image-to-frontend skill，把这张 Radiance beauty commerce landing page 参考图实现成前端页面。
先输出 layout extraction 和 element extraction，再实现代码，最后用截图对比并 refine。
重点检查：左右 hero 比例、产品主视觉、促销商品卡片、搜索框和小装饰元素。
```

### Expected Boundary Notes
- Product photography is the main fidelity dependency; without the original product image, implementation can only approximate the visual.
- Decorative line/flower overlay can be approximated with CSS/SVG.
- Product cards are a good test for spacing, shadows, thumbnail sizing, and repeated component consistency.
