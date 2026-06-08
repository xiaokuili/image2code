# image2code

当前仓库根目录只保留四类内容：

- `apps/`: 实际应用代码
- `test/`: 测试输入和生成样例
- `skills/`: Codex skills
- `README.md`: 项目说明

`apps/` 的主架构说明见 [docs/apps-architecture.md](/Users/root1/code/image2code/docs/apps-architecture.md:1)。

## 当前应用结构

`apps/web` 是单页 web 应用，流程是：

1. 上传图片
2. 触发 Codex / `image2code` skill 生成
3. 直接展示生成出的 HTML

目录约定：

```text
apps/web/
├─ src/
│  ├─ routes/
│  │  └─ index.tsx
│  ├─ pages/
│  │  └─ studio/
│  │     └─ page.tsx
│  └─ components/
│     ├─ studio/
│     │  ├─ image-dropzone.tsx
└─ wrangler.jsonc
```

规则：

- `routes/` 只负责 URL 映射
- `pages/` 只放 page
- `components/` 按 page 名和 `shared/` 划分

## 测试样例

- `test/vercel-landing/`: 原始测试图片分段
- `test/work-samples/vercel-ai-cloud/`: 已生成的样例任务
