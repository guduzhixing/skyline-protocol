# Agent 工程剧本 04：零第三方依赖 Chrome CDP + WebGL2 无头自动化 QA

**适用场景**：AI Agent 完成 WebGL / 触屏响应式改造后，绝不能仅靠静态代码审查宣称“移动端适配完美”。如何不引入庞大的 Playwright / Puppeteer `node_modules`，仅用几十行原生 Node.js `>= 22.0.0` 代码就在本地与 GitHub Actions CI 上稳定跑通真机触屏、3D 渲染与 DOM 几何审计？

---

## 1. 零外部依赖 CDP 客户端架构（Node.js `>= 22.0.0`）

[scripts/cdp-qa/layout-audit.mjs](../../scripts/cdp-qa/layout-audit.mjs) 利用 Node.js 22 内置的**全局 `WebSocket`** 与原生 `fetch`，直接通过 Chrome DevTools Protocol 驱动本机 Chrome / Edge / Chromium：

1. **必须避开硬编码调试端口冲突 —— `--remote-debugging-port=0`**：
   - 早期硬编码 `--remote-debugging-port=9242` 在 CI 并发或残留进程下极易绑定失败。
   - **正确做法**：启动 Chrome 时传入 `--remote-debugging-port=0`，实时监听子进程 `stderr`，正则解析真实监听端口：
     ```js
     const m = procErrTail.match(/DevTools listening on (ws:\/\/\S+)/);
     if (m) devtoolsHost = new URL(m[1]).host;
     ```
2. **Linux CI 容器与 SwiftShader WebGL2 必须启动参数**：
   - 非 Windows 下删除过期 `DBUS_SESSION_BUS_ADDRESS` 避免 dbus 阻塞崩溃；
   - 启用无 GPU 环境软件光栅化渲染 3D 场景：
     `--headless=new`、`--no-sandbox`、`--disable-dev-shm-usage`、`--enable-webgl`、`--use-gl=angle`、`--use-angle=swiftshader`、`--enable-unsafe-swiftshader`。
3. **禁止对 `WebSocket` 初始化包裹静默 `catch {}`**：
   - 轮询 `/json/list` 时应保留 `lastPollErr` 与 Chrome `stderr` 头尾摘要，若 30s 超时直接抛出详细上下文，方便定位缺库或环境问题。

---

## 2. 条件等待优于固定 `sleep()`

在 GitHub Actions 的共享 CPU 上用软件 WebGL2（SwiftShader）渲染 3D 世界，帧耗时远高于桌面硬件 GPU。固定写 `sleep(450)` 必将产生偶发竞态失败！

[run-4matrix-qa.mjs](../../scripts/cdp-qa/run-4matrix-qa.mjs) 通过 `window.__ready && window.__frames > 4` 确认 3D 引擎真正跑通前 4 帧才介入操作，并在旋转、切态前使用显式条件轮询函数 `waitUntil(ev, expr, msg, maxMs)`。

---

## 3. 两两矩形交集几何审计算法（`> 2px` 重叠 & `1px` 越界容差）

肉眼很难盯住所有 4 种屏幕尺寸不撞车。`checkOverlaps(selectors)` 在页面上下文获取每个可见元素 `getBoundingClientRect()`，逐对计算精确像素交集：

```js
const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
if (ix > 2 && iy > 2) overlaps.push({ a: a.sel, b: b.sel, ix, iy, boxA: a, boxB: b });
```

同时检查出界元素 `oob`：
```js
const oob = rects.filter(r => r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1);
```
只有当 `overlaps.length === 0` 且 `oob.length === 0` 时矩阵才放行。

---

## 4. 本项目落地的 5 矩阵全量自动化防线

运行 `npm run qa`（实测总耗时 `52,526 ms`，详见 [latest-qa-report.json](../benchmarks/latest-qa-report.json)）依次自动验证：
1. **手机竖屏 `390×844`**：触屏仿真下 `DEPLOY` 按钮全进首屏、12 控件零重叠、点击滑屏不触发鼠标锁定提示、一键自动开火开关可切。
2. **手机横屏 `844×390`**：挂载 `is-touch` + `is-landscape`、左右拇指安全区 12 控件零重叠。
3. **3D 战棋 1P / 2P 传玩**：11 节点生成、安全走廊零碰撞（`markerCollisions: 0`）、2P 换手遮罩触发后目标 `3.142 rad`（实测 `3.117 rad`）旋转及退出零 DOM 残留。
4. **桌面端 `1440×900` 回归**：`isTouchClass: false`、`billboardsAfterDeploy: 3`、FPS 模式正常启动。
5. **Pure 纯净版启动验收**：加载 [dist/skyline-protocol-open.html](../../dist/skyline-protocol-open.html)，验证 `fatal: null` 且页面 DOM 专有品牌残留 `brandHitsInDOM: 0`。
