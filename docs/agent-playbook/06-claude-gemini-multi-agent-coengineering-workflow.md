# Agent 工程剧本 06：多 Agent（Claude / Gemini / Codex）协同开发工程范式

**适用场景**：当多个不同模型或会话中的 AI Agent（如负责整体架构拆分规划的 Claude/Planner、负责浏览器视觉 QA 与 CI 调试的 Gemini/Codex Executor，以及后续介入二次开发的社区 Agent）共同接力维护同一个复杂前端工程时，如何消除失真记忆、避免互相破坏彼此不变量？

---

## 1. 四段式多 Agent 职责分工与契约护栏

| 阶段 | 负责角色 | 核心输入 | 必须交付的客观产物 |
| :--- | :--- | :--- | :--- |
| **Stage 1：架构冻结与契约书面化** | 架构 Agent | 原始闭源原型与新需求 | 明确写出 [AGENTS.md](../../AGENTS.md) 中的核心符号映射表与不可破坏不变量（如 Ghost Pointer-Event Trap 禁令） |
| **Stage 2：模块化槽位重构** | 编码 Agent | 唯一真相源 `src/*` 与 `scripts/build.mjs` | 将 UI、CSS、状态机逻辑切片写入独立槽位模块；严格禁止直接编辑构建产物 |
| **Stage 3：无头真机 QA 验证** | QA Agent | `scripts/cdp-qa/*.mjs` | 在 Chrome CDP SwiftShader 真机模拟视口产出零重叠、零越界的 [latest-qa-report.json](../benchmarks/latest-qa-report.json) 与截图集 |
| **Stage 4：双速度 CI 与开源合规收口** | 发布 Agent | GitHub Actions & 预设 JSON | 确认 `Pure` 版实现 `brandHitsInDOM === 0` 并推通 CI Pages 自动发布 |

---

## 2. “双速度验证循环（Two-Speed Verification Loop）”

避免每次改两行 CSS 就空等一分钟 Chrome 渲染，也绝不能只跑语法检查就敢提交 PR：

- **Fast Loop（快循环：`< 1 s`）**：运行 `npm run build:all && npm run check`。
  - 验证所有 `replaceExact` 槽位唯一命中、抽离 `<script>` 通过 `node --check` 零语法报错、且 Pure 开源版无商标泄漏。
- **Deep Loop（深循环：约 `50–60 s`，最近实测 `51,573 ms`）**：运行 `npm run qa`。
  - 真实拉起无头 Chrome 跑完竖屏 `390×844`、横屏 `844×390`、1P/2P 战棋翻转、桌面 `1440×900` 与 Pure 引导共 5 大矩阵。

---

## 3. 防幻觉声明纪律与 Git 提交卫生（Anti-Hallucination Hygiene）

在本项目的协同演化中，以下几条规则被验证是最能防止 Agent “一本正经胡说八道”的工程习惯：

1. **用工具实证代替记忆引述**：回答人类或写入文档前，只引用当前会话直接从文件或命令输出读到的精确字节数、符号拼写、commit SHA、Actions Run ID 与 CDP 日志；没重新跑过的检查绝不宣称“已通过”。
2. **禁止隐式放宽校验门禁**：如果遇到测试超时或环境报错，必须修复根因（例如把固定 port 改成 `--remote-debugging-port=0` 探测、在渲染主循环里补 `_svW/_svH` 自同步），绝不删除或跳过断言条款来“绿灯交差”。
3. **干净仓库边界卫生**：所有临时 Chrome `user-data-dir` 写在系统 `os.tmpdir()` 并随 `close()` 清理；测试截图与临时录制文件 `.mp4`、敏感本地凭证绝不提交进 Git 主干。
4. **遇到可泛化经验立即入库**：每一个耗时排出的真实深坑，都应第一时间按结构沉淀到 `docs/agent-playbook/` 与 [AGENTS.md](../../AGENTS.md)，让下一个打开本仓库的 Agent 直接站在稳固地基上继续前进。
