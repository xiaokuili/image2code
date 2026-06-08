# Web Tasks

这里存放 `apps/web` 的任务目录。Web 端直接按目录约定扫描并展示。

每个 task 目录结构：

```text
apps/web/tasks/<task-name>/
├─ source.<ext>
├─ preview/
│  └─ index.html
├─ skills.json
└─ task.json
```

约定：

- `source.<ext>` 是输入图片，扩展名保持上传文件原样
- `preview/` 里放生成后的 HTML 及其附属资源
- `skills.json` 记录 skill 生成产物路径，建议字段名使用 `artifactPaths`
- `task.json` 可选，只补充展示名、状态、创建时间等元信息

`skills.json` 示例：

```json
{
  "generator": "image2code",
  "artifactPaths": [
    "tasks/demo/work/00_page.json",
    "tasks/demo/work/01_root-components.json",
    "tasks/demo/work/src/index.html"
  ]
}
```
