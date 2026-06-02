# Prompt-Driven Frontend Workflow

这套流程用于把参考图实现任务拆成一条更稳定的工程链路：

`layout extraction -> element extraction -> implementation -> diff -> refine`

## 1. Layout Extraction

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

## 2. Element Extraction

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

## 3. Implementation

实现阶段建议先做稳定模块，再对复杂模块继续拆内部 layout。

典型复杂块：
- nav
- hero dual-column
- avatar cluster
- tab row
- prompt card
- logo strip

## 4. Diff

实现完成后，把当前实现截图和参考图再做一次 diff。

关注：
- spacing
- alignment
- grouping
- sizing
- missing / extra elements
- typography side effects

## 5. Refine

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
