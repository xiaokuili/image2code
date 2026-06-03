# image2code

一个用于 UI 复刻、design-to-code、以及 agent 驱动前端实现的工作流项目。

核心目标不是一句 prompt 直接生成页面，而是把任务拆成一条更稳定的链路：

`layout extraction -> element extraction -> implementation -> visual diff -> refine`

## 目录结构

- `prompts/`
  - `ui-analysis-prompts.md`
- `docs/`
  - `workflow.md`
- `examples/`
  - `reference-cases.md`
- `skills/`
  - `image-to-frontend/`

## 适用场景

- 给 AI 分析参考图
- 做 UI 复刻
- 做 design-to-code
- 做实现验收
- 做参考图 vs 实现图的结构 diff

## 使用顺序

1. 用 `layout prompt` 拆实现模块
2. 用 `element prompt` 拆关键元素
3. 写代码实现
4. 用 `diff prompt` 做实现对比
5. 按 diff 结果继续 refine

## Codex Skill

`skills/image-to-frontend/` 是这个流程的 Codex skill 版本。

它的职责不是让 Codex 一看到图就直接写代码，而是强制执行：

`reference image -> layout extraction -> element extraction -> implementation -> screenshot diff -> targeted refine`

适合用于：

- 输入 UI 截图并生成前端代码
- 按参考图复刻页面
- 让 Codex 在实现前先拆模块和细节
- 让 Codex 在实现后用截图对比继续微调

## 当前边界

这套方法可以明显提高 UI 复刻质量，但如果要进一步逼近像素级，还需要：

- 更准确的素材 / SVG / 切图
- 基于实现图和参考图的持续微调
