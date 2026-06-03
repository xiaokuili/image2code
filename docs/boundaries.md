# Current Boundaries

这份文档用于说明 `image2code` skill 当前适合测试什么，以及哪些地方需要额外输入才能稳定复刻。

## 1. Reference Image Size

当前建议用单屏或单个页面 section 截图测试。

推荐输入：
- 宽度：`1200px - 2200px`
- 高度：`700px - 1800px`
- 内容：一个完整首屏、一个 dashboard 页面、一个 landing section、或一个清晰组件区域
- 格式：PNG 或 JPG

谨慎输入：
- 超长整页截图，例如高度超过 `3000px`
- 极小图，例如宽度低于 `800px`
- 被压缩到文字和 icon 已经看不清的图
- 同时包含多个页面状态或多个设备尺寸的拼图

处理建议：
- 长页面先拆成多个 section 分别实现和验收。
- 大图可以先按目标 viewport 缩放到常见桌面尺寸。
- 移动端和桌面端最好分开给图，不要放在同一张参考图里。

## 2. Animation Support

静态截图不能可靠推断动画。skill 可以实现动画，但需要用户明确动画目标。

当前支持：
- hover / active / focus 状态
- button、card、tab、menu 的 transition
- loading、ticker、marquee、carousel 等常见 UI 动效
- hero 中的轻量 CSS animation
- 如果项目已有 Framer Motion、GSAP、Three.js 等库，优先沿用项目现有方案

需要额外输入：
- 动画持续时间
- easing 类型
- 进入 / 退出方向
- 循环方式
- hover 或滚动触发规则
- 关键状态截图或短视频参考

不建议只靠单张静态图推断：
- 复杂时间轴动画
- 交互式 3D 动画
- 精确的品牌动效
- 需要逐帧一致的转场

## 3. Lighting, Shadow, And Material Support

skill 可以通过 CSS、图片素材和现有渲染库近似光照与质感，但不能从静态截图中自动还原真实摄影布光。

当前支持：
- CSS box-shadow、drop-shadow、text-shadow
- radial-gradient、linear-gradient、overlay、backdrop-filter
- 产品卡片、玻璃拟态、柔和投影、暗色 hero 的层次感
- 使用现有图片资产保留真实产品光照
- 需要 3D 场景时，可使用 Three.js 实现基础灯光和材质

需要额外素材：
- 产品照片
- logo / SVG
- 头像
- 背景图
- 纹理图
- 3D model 或明确的材质要求

当前限制：
- 没有真实素材时，只能近似产品图、人物头像、复杂 logo 和摄影级光照。
- 对高光、反射、透明瓶身、金属、玻璃材质的像素级复刻，需要原始素材或专门的图像生成 / 图像编辑流程。
- 如果参考图主视觉是照片，最佳方式是直接使用同一张或同源图片资产。

## 4. Acceptance Guidance

测试时建议按这个顺序验收：

1. 页面结构是否一致。
2. 模块数量和父子关系是否一致。
3. 主要间距、对齐、尺寸是否接近。
4. 关键小元素是否存在，例如 dots、dividers、chips、badges、icons。
5. 截图 diff 后是否针对高优先级问题 refine。
6. 素材缺失导致的差异是否被明确说明。
