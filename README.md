# RoBIOS 项目主页

使用 HTML、CSS 和原生 JavaScript 的静态网站，无需安装依赖。米白底色、绿色点缀，桌面端提供固定阅读目录，移动端目录可折叠。

## 本地预览

```sh
npm run dev
```

打开 http://localhost:5173。页头右侧的「中文 / EN」切换整页语言，选择会在当前浏览器中保存。也可直接访问 `/?lang=zh` 或 `/?lang=en` 分享指定语言的页面。

## 内容维护

- `index.html`：结构与静态文案。中文为默认内容，`data-en` 保存对应英文；无障碍标签使用 `data-en-aria-label`、`data-en-alt` 等属性。
- `styles.css`：视觉样式、闭环与架构示意图、响应式布局。
- `app.js`：插件与实验的双语文案、语言切换、场景和环境选择、目录、视频和详细架构图弹窗。
- `assets/robios-architecture.png`：原始详细架构图，可通过正文中的「详细原图」放大查看。

正文示意图使用 HTML/CSS 与内联 SVG，文字可随语言切换，缩放后仍清晰。语言切换位于页头右侧，正文以单一目录导航。

正文先展示整体框架，再以独立的物理内核章节说明执行裁决、状态管理、闭环调度和异常处理。目录直接读取正文标题，切换语言时同步更新名称与编号。

插件说明使用紧凑卡片，下方以“插件装配流程”说明声明、组合和启动装配。

五组实验保留为连续章节。视频和指标明确标记为待补充，没有模拟成绩；预算敏感实验区保持空白。四个 RoboDojo 场景暂用编号，等待补充具体任务。仓库、文档与技术报告等待真实地址。

添加视频时，在 `app.js` 的 `videoSources` 中配置媒体路径，支持 MP4/WebM。ID 包括 `hero`、`scene-1` 至 `scene-4`、`sim-robodojo`、`sim-robocasa`、`sim-behavior`、`robot-galaxea`、`robot-stardust`、`robot-unitree` 和 `migration`。配置后自动显示播放入口；没有视频的区域显示静态待补充状态。

运行 `npm run check` 检查 JavaScript 语法。可以直接部署整个目录到静态托管服务。

## 部署到 GitHub Pages

项目仓库：https://github.com/NativeAI-Group/robios-project

发布地址：https://nativeai-group.github.io/robios-project/

将网页文件和 `assets/` 提交到 `main` 分支，在仓库的 **Settings → Pages** 中选择 **Deploy from a branch → main → /(root)**。根目录的 `.nojekyll` 用于直接发布静态文件，无需构建。后续推送到 `main` 后自动更新网站；`.preview/` 为本地预览文件，不提交。
