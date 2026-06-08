# Apps Architecture

这个文件是 `apps/` 的主架构说明。

## 技术栈

- Web framework: `TanStack`
- Deploy target: `Cloudflare`
- UI entry: `apps/web`

当前目标不是多应用平台，而是先把 `apps/web` 做成单页工作台。

## 核心需求

`apps/web` 负责这条主链路：

1. web 页面提供一个放入图片的地方
2. 图片上传后生成一个 task
3. task 基于 `Cloudflare` 存储
4. Codex 获取 task 并执行
5. task 的执行逻辑放到 `skills/image2code`
6. 执行完成后生成 HTML
7. web 页面展示生成后的 HTML
8. web 页面提供所有上传任务和结果的列表

## 主流程

### 1. 上传

- 用户在 `apps/web` 上传图片
- web 应用创建一个 task
- task 元数据和输入图片写入 Cloudflare 存储

### 2. 执行

- Codex 从 task 存储中获取待处理图片
- Codex 按 `skills/image2code` 的规则执行任务
- 执行过程中生成结构化产物和最终前端代码

### 3. 输出

- 任务执行完成后生成 HTML 结果
- HTML 结果回写到 task 对应存储
- web 页面读取该结果并展示

### 4. 列表

- web 页面需要展示 task 列表
- 每个 task 要能看到输入图片、执行状态、结果入口
- 已完成 task 要能直接打开 HTML 结果

## 主架构

### `apps/web`

`apps/web` 是唯一前端应用。

职责：

- 提供图片上传入口
- 创建和读取 task
- 展示任务列表
- 展示单个 task 的 HTML 结果

### Task Storage

task 以 Cloudflare 为主存储。

当前主架构约定：

- 图片输入存到 Cloudflare 对象存储
- task 元数据存到 Cloudflare 可查询存储
- HTML 结果存到 Cloudflare 对象存储

当前推荐映射：

- `R2`: 原图、切片、HTML、静态产物
- `D1`: task 元数据、状态、结果索引

如果后面需要异步调度，再增加：

- `Queues`: task 派发和重试

### Codex / Skill Execution

Codex 不直接承担业务状态管理，只负责消费 task 并执行。

执行约定：

- web 负责创建 task
- Codex 负责获取待执行 task
- 具体执行规则收敛到 `skills/image2code`
- skill 负责把输入图片转换为结构化产物和 HTML

这条边界必须保持清楚：

- `apps/web` 管理用户交互和结果展示
- `skills/image2code` 管理图片转代码的执行规则

### 部署

部署目标是 `Cloudflare`。

当前约定：

- `wrangler.jsonc` 放在 `apps/web/`
- `src/worker.ts` 是 Cloudflare Worker 入口
- 前端静态资源由 Cloudflare Assets 提供

## 目录约定

```text
apps/
├─ README.md
└─ web/
   ├─ package.json
   ├─ wrangler.jsonc
   ├─ tasks/
   └─ src/
      ├─ routes/
      ├─ pages/
      ├─ components/
      └─ worker.ts
```

### `src/routes`

- 只负责路由映射
- 不承载页面细节组件

当前约定：

- `index.tsx` 对应首页
- 任务列表和结果入口都从首页进入

### `src/pages`

- 只放 page
- page 负责页面编排，不承载底层组件实现

当前约定：

- `pages/studio/page.tsx` 是首页主页面
- 首页同时承担上传区、任务列表区、结果预览区

### `src/components`

- 按 page 名分组
- 共享组件放 `shared/`

当前约定：

```text
src/components/
├─ studio/
│  ├─ image-dropzone.tsx
│  └─ html-preview-frame.tsx
└─ shared/
   └─ app-shell.tsx
```

后续如果补任务列表，组件继续落在 `src/components/studio/`：

```text
src/components/studio/
├─ image-dropzone.tsx
├─ task-list.tsx
├─ task-list-item.tsx
└─ html-preview-frame.tsx
```

## 任务目录约定

本地开发时，task 可以映射到 `apps/web/tasks/<task-id>/`。

线上主架构里，task 以 Cloudflare 存储为准，本地目录只作为开发映射。

```text
apps/web/tasks/<task-id>/
├─ task.json
├─ original/
│  └─ source.<ext>
├─ extracted/
├─ run/
├─ preview/
│  └─ index.html
└─ logs/
```

含义：

- `task.json`: 任务元信息
- `original/`: 用户上传原图
- `extracted/`: 可选中间分析结果
- `run/`: `image2code` skill 产物
- `preview/`: 最终 HTML 预览
- `logs/`: 运行日志

其中：

- `task.json` 对应线上 task 元数据
- `preview/index.html` 对应线上最终展示结果

## 说明文件约定

从现在开始，说明文件按下面规则放：

- 根 `README.md`: 只写仓库总览
- `docs/apps-architecture.md`: 作为 `apps` 的主架构说明
- `skills/*/SKILL.md`: 只写 skill 本身的工作流和规则

规则：

- 总览写在上层
- 具体约定写在所属目录
- 不再额外新建分散的顶层架构文档
