# Agent 工程剧本 01：槽位叠加构建器 vs 暴力拆分单闭包内核

**适用场景**：当你面对一个 500KB–2MB 的高密度单文件 HTML / Canvas / WebGL 应用（如内嵌了压缩版 Three.js 核心、物理引擎、音频合成与完整主循环的单闭包程序），既希望拥有清晰的模块化源码目录（`src/styles/`、`src/modules/`、`src/presets/`），又不能因暴力拆分而破坏隐藏闭包作用域或零网络请求单文件分发形态时，应采用本剧本的**槽位叠加组装器（Slot-Overlay Assembler）**模式。

---

## 1. 核心冲突：为什么不能“直接暴力拆分”单闭包引擎？

在 [src/core/engine-base.html](../../src/core/engine-base.html)（`1,590,585 B`）中，渲染、物理、状态机与 HUD 逻辑全部封装在一个紧凑主闭包的 `<script>` 标签内（如 `M2="180"`、`mM(i)`、`dm(i)`、`YC()`）。

如果你直接尝试用传统 ES Module 把函数剪切拆分成几十个独立 `.js` 文件：
1. **隐式闭包变量瞬间失效**：压缩后的内部短标识符（例如相机对象、音效触发函数 `a(i.audio,...)`、输入句柄 `f`、状态对象 `c`/`l`/`r`）彼此深度交叉引用，任意一个未导出变量都会引发大片 `ReferenceError`。
2. **破坏“单文件即开即玩”交付属性**：直接拆成外链脚本会导致用户离线双击打开 HTML 时遭遇浏览器 `file://` CORS 拦截。

---

## 2. 正解：精确锚点“槽位叠加构建器（Slot-Overlay Assembler）”

项目通过零外部依赖的 [scripts/build.mjs](../../scripts/build.mjs) 实现了一个确定性编译模型：**保留未经破坏的单闭包引擎作为底层基线（`engine-base.html`），然后用独立模块的 `PATCHES` 数组按唯一精确锚点叠加新能力**。

关键核心原语 `replaceExact`（源自 [scripts/build.mjs](../../scripts/build.mjs)）强制保证每一处补丁**既不会漏匹配，也不会误伤重复文本**：

```js
function replaceExact(source, target, replacement, label) {
  const idx = source.indexOf(target);
  if (idx === -1) {
    throw new Error(`Anchor not found [${label}]: ${target.slice(0, 120)}`);
  }
  const idx2 = source.indexOf(target, idx + target.length);
  if (idx2 !== -1) {
    throw new Error(`Anchor not unique [${label}]`);
  }
  return {
    text: source.slice(0, idx) + replacement + source.slice(idx + target.length),
    offset: idx
  };
}
```

---

## 3. 秒级内联语法门禁（`< 100ms` 拦截引号/括号/花括号注入灾难）

做代码槽位注入最容易犯的错误是：模板字符串里漏掉一个反引号 `` ` `` 或闭合花括号 `}`，直到打开浏览器渲染几十秒后才抛出 `SyntaxError`。

[scripts/verify-build.mjs](../../scripts/verify-build.mjs) 在构建后立即剥离HTML 最后一段 `<script>...</script>` 并调用 Node 内置语法检查器 `node --check`：

```js
function checkJsSyntax(code, tag) {
  const tmp = path.join(os.tmpdir(), `skyline_check_${tag}_${process.pid}.mjs`);
  fs.writeFileSync(tmp, code, 'utf8');
  try {
    execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' });
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }
}
```

这一招能在 `< 100 ms` 内抓出任何槽位注入导致的语法损坏，彻底免除“盲猜哪里少了个分号”。

---

## 4. 可跨项目复用的 3 条铁律

1. **宁可唯一长锚点失败报错，绝不使用模糊正则替换**：正则很容易匹配多处或因换行符差异导致隐蔽注入错位；`replaceExact` 的严格双查重（`idx === -1` 与 `idx2 !== -1` 均直接中断构建）才是可信任的构建合同。
2. **源码只改 `src/` 模块层，底层基线非必要不微调**：把新系统做成标准 ES 模块常量数组（如 `MOBILE_PATCHES` 与 `TABLETOP_PATCHES`），能极大幅度减少 Git Diff 噪音与 AI 上下文消耗。
3. **同一构建脚本分支产出多发行预设**：如 `--mode=showcase` 与 `--mode=pure`，共用同一套引擎代码，仅在最终输出前通过预设 JSON 切换图片（Base64 PNG vs 内联 SVG）与专有词条，天然实现商业演示版与纯开源版同步维护。
