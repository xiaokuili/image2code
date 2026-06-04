# Prompt-Driven Frontend Workflow

这套流程用于把参考图实现任务拆成一条更稳定的工程链路：

`full-image inspection -> slicing and asset decisions -> layout extraction -> element extraction -> implementation -> diff -> refine`

## 1. Full-Image Inspection

先看全图，不直接写代码，也不急着切图。

目标：
- 确认 viewport 和页面边界
- 找出主要区域
- 判断哪些区域可能需要切图
- 保留全局布局关系，避免局部分析丢失整体对齐和 section spacing

落盘文件：
- `image_inspection.json`

## 2. Slicing And Asset Decisions

当参考图很长、细节密度高，或者某个区域有大量独特元素时，先按实现边界切图，再进入详细 layout。

切图还有第二个目的：产出后续编辑前端代码可用的素材图。这里不能只做机械裁剪，需要先判断素材应该怎么来。

切图分两类：
- `analysis`：只用于分析 layout / element，不直接进前端资产目录。
- `frontend-asset-candidate`：可能成为前端代码引用的图片素材。

切图建议保存到：

```text
.codex/image2code/<task-id>/
  reference-full.png
  slices/
  asset-candidates/
  assets/
  manifest.json
```

`manifest.json` 记录 source、viewport、slice 文件、parent path、bounds、reason、slice type、useFor、confidence 等信息。

切图边界优先按：
- header / sidebar / main / footer
- panel / modal
- table / card grid
- representative card / list item
- toolbar / control group

不要把切图当成产品素材默认放进 `src/assets`；它默认是分析产物。

如果是 `frontend-asset-candidate`，需要额外记录：
- 素材名字
- 视觉描述
- 在全图里的位置和裁剪 bounds
- 前端用途，例如 hero product、card thumbnail、avatar、logo、background texture
- 来源策略：`direct-crop`、`image-to-image`、`web-similar-asset`
- 策略原因和已知限制
- 预计输出格式和路径

来源策略判断：
- `direct-crop`：原图局部足够干净、清晰、没有 UI 污染，可以直接作为素材。
- `image-to-image`：裁剪图主体正确，但需要去背景、补边、提高清晰度、去掉遮挡或改成更通用的前端素材。
- `web-similar-asset`：原裁剪质量差、遮挡严重、或是通用摄影/真实产品/logo，需要从网上找更接近的公开素材。需要记录授权不确定性。
这里只判断图片素材来源。简单几何、icon、线条、分隔符、文字等非图片元素，交给 layout / element extraction 和前端实现阶段处理。

落盘文件：
- `slicing_manifest.json`
- `asset_decisions.json`
- 如果跳过切图或没有图片素材候选，写 `skip_decision.json` 说明原因

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

落盘文件：
- `layout.json`
- 递归分析时，为每个 scoped region 写独立 JSON

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

落盘文件：
- 每个元素或元素组一个 JSON，例如 `primary_nav.json`、`hero_overlay.json`

## 5. Implementation

实现阶段建议先做稳定模块，再对复杂模块继续拆内部 layout。

典型复杂块：
- nav
- hero dual-column
- avatar cluster
- tab row
- prompt card
- logo strip

落盘文件：
- `implementation_result.json`，记录改动文件、使用的素材、未解决限制

## 6. Diff

实现完成后，把当前实现截图和参考图再做一次 diff。

关注：
- spacing
- alignment
- grouping
- sizing
- missing / extra elements
- typography side effects

落盘文件：
- `visual_diff.json`

## 7. Refine

根据 diff 结果做二次和三次收敛。

更接近像素级的结果，通常不是一次生成，而是：

`first pass + targeted refine`

落盘文件：
- `refinement_plan.json`
- `refinement_result.json`

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
