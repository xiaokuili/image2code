# image2code

一个用于 UI 复刻、design-to-code、以及 agent 驱动前端实现的工作流项目。

核心目标不是一句 prompt 直接生成页面，而是把任务拆成一条更稳定的链路：

`full-image inspection -> optional slicing -> layout extraction -> element extraction -> implementation -> visual diff -> refine`

## 目录结构

- `prompts/`
  - `ui-analysis-prompts.md`
- `docs/`
  - `workflow.md`
- `examples/`
  - `reference-cases.md`
- `skills/`
  - `image2code/`

## 适用场景

- 给 AI 分析参考图
- 做 UI 复刻
- 做 design-to-code
- 做实现验收
- 做参考图 vs 实现图的结构 diff

## 使用顺序

1. 先全图预检，判断 viewport、页面边界和主要区域
2. 对复杂或高密度区域做可选切图，并保存 manifest
3. 用 `layout prompt` 拆实现模块，复杂模块可递归拆解
4. 用 `element prompt` 拆关键元素
5. 写代码实现
6. 用 `diff prompt` 做实现对比
7. 按 diff 结果继续 refine

## 快速测试 Skill

在 Codex 中使用这个仓库的 skill 时，可以直接把 UI 截图发给 Codex，并明确要求使用 `image2code`：

```text
使用 image2code skill，把这张参考图实现成前端页面。
请先做 layout extraction 和 element extraction，再实现代码，最后截图对比并 refine。
```

如果已有项目上下文，可以补充目标技术栈和落点：

```text
使用 image2code skill，把这张图实现到当前项目的首页。
技术栈按仓库现有方式来，不要新建无关框架。
```

如果只是想验证分析链路，不要求立即写代码：

```text
使用 image2code skill，只输出这张图的 layout extraction、element extraction 和实现计划。
```

## 安装 Skill

本仓库的 Codex skill 位于：

```text
skills/image2code/
```

本地安装到 Codex：

```bash
mkdir -p ~/.codex/skills
cp -R skills/image2code ~/.codex/skills/image2code
```

如果之前安装过旧版 `image-to-frontend`，先删除旧目录并重新安装：

```bash
rm -rf ~/.codex/skills/image-to-frontend ~/.codex/skills/image2code
cp -R skills/image2code ~/.codex/skills/image2code
```

安装后在新会话中使用：

```text
使用 image2code skill，把这张参考图实现成前端页面。
```

## Codex Skill

`skills/image2code/` 是这个流程的 Codex skill 版本。

它的职责不是让 Codex 一看到图就直接写代码，而是强制执行：

`reference image -> full-image inspection -> optional slicing -> layout extraction -> element extraction -> implementation -> screenshot diff -> targeted refine`

适合用于：

- 输入 UI 截图并生成前端代码
- 按参考图复刻页面
- 让 Codex 在实现前先拆模块和细节
- 让 Codex 在实现后用截图对比继续微调

## 当前可测试 Case

目前已确认适合用来测试 skill 的两类参考图：

- `Agent AI SaaS Landing Page`：深色 hero、大标题、导航、CTA、头像组、流程节点、prompt card、云服务 logo、底部品牌 logo strip。
- `Radiance Beauty Commerce Landing Page`：白色电商 hero、大标题、搜索框、用户头像、产品主视觉、商品卡片网格、促销区。

详见 [examples/reference-cases.md](examples/reference-cases.md)。

## 当前边界

这套方法可以明显提高 UI 复刻质量，但如果要进一步逼近像素级，还需要：

- 更准确的素材 / SVG / 切图
- 基于实现图和参考图的持续微调

重点边界已经单独列出在 [docs/boundaries.md](docs/boundaries.md)，包括：

- 多大尺寸的图更适合测试
- 动画应该如何提供和验收
- 光照、阴影、产品图质感如何处理
