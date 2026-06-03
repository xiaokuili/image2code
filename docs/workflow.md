# Prompt-Driven Frontend Workflow

这套流程用于把参考图实现任务拆成一条更稳定的工程链路：

`full-image inspection -> optional slicing -> layout extraction -> element extraction -> implementation -> diff -> refine`

## 1. Full-Image Inspection

先看全图，不直接写代码，也不急着切图。

目标：
- 确认 viewport 和页面边界
- 找出主要区域
- 判断哪些区域可能需要切图
- 保留全局布局关系，避免局部分析丢失整体对齐和 section spacing

## 2. Optional Slicing

当参考图很长、细节密度高，或者某个区域有大量独特元素时，先按实现边界切图，再进入详细 layout。

切图建议保存到：

```text
.codex/image-to-frontend/<task-id>/
  reference-full.png
  slices/
  manifest.json
```

`manifest.json` 记录 source、viewport、slice 文件、parent path、bounds、reason 等信息。

切图边界优先按：
- header / sidebar / main / footer
- panel / modal
- table / card grid
- representative card / list item
- toolbar / control group

不要把切图当成产品素材默认放进 `src/assets`；它默认是分析产物。

## 3. Layout Extraction

先不写代码，先拆布局。

目标：
- 找出实现模块
- 标出父子关系
- 判断哪些是真正的模块
- 判断哪些只是元素或装饰

输出最好支持：
- 模块计数
- Need Build 判断
- 实现层级
- 后续验收

复杂 layout block 可以递归拆解，尤其是：
- 独特、非重复元素太多
- mixed layout
- 子元素超过 5 个
- 内部包含 card、table、form、dashboard、editor、复杂 control group
- 低置信度，通常低于 80

默认递归深度上限为 3。重复列表或网格优先拆一个代表项，不逐个拆每个实例。

## 4. Element Extraction

在 layout 之后继续拆 element。

重点不是重复大结构，而是补齐会影响完成度的小元素：
- 分隔线
- 点状分隔
- pills
- icons
- overlays
- chip rows
- avatar stacking

很多“不够像”的问题，根源都在这一层。

## 5. Implementation

实现阶段建议先做稳定模块，再对复杂模块继续拆内部 layout。

典型复杂块：
- nav
- hero dual-column
- avatar cluster
- tab row
- prompt card
- logo strip

## 6. Diff

实现完成后，把当前实现截图和参考图再做一次 diff。

关注：
- spacing
- alignment
- grouping
- sizing
- missing / extra elements
- typography side effects

## 7. Refine

根据 diff 结果做二次和三次收敛。

更接近像素级的结果，通常不是一次生成，而是：

`first pass + targeted refine`

## 当前边界

如果参考图强依赖资产，只靠代码近似会有上限：
- 头像
- logo
- SVG 图标
- 插画
- 产品截图

所以要继续提高效果，通常还需要：
- 更准确素材
- 基于实现图和参考图的 AI 微调闭环

更完整的尺寸、动画、光照边界见 [boundaries.md](boundaries.md)。
