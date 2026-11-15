# CLAUDE.md — Claude / Codex 协作快查手册

本仓库是一套零后端依赖的双模式 WebGL2 3D FPS + 1P/2P 战棋开源项目。开始编写或重构代码前，请遵循以下最简工作契约：

1. **必读核心架构契约**：优先完整阅读 [AGENTS.md](AGENTS.md)，掌握压缩符号表与 6 条工程不变量，避免破坏桌面回归与移动端触屏布局。
2. **只改源码不改构建产物**：所有代码修改均应在 `src/styles/`、`src/modules/`、`src/presets/` 或 `src/core/` 中进行；**切勿**直接修改 `index.html` 或 `dist/*.html`。
3. **双速度强制验证闭环**：
   - 编辑期间秒级自检：`npm run build:all && npm run check`（验证槽位拼接准确性、JS 语法及纯净开源版清洗状态）。
   - 完成交付前强制运行：`npm run qa`（5 矩阵 Chrome CDP + WebGL2 真机视口布局与交互自动化测试）。
4. **复用并沉淀 Agent 工程剧本**：在动手解决移动端事件吞噬、战棋坐标投影、闭包热修补或 CDP 自动化难题前，先查阅 [docs/agent-playbook/](docs/agent-playbook/) 中的 01–06 号实战文档；解决新模式问题后也请将可复用经验补充到对应剧本中。
