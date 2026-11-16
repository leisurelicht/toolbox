# AGENTS.md

本文件为 AI 编码代理（以及人类协作者）提供本仓库的工作约定。**动手修改前请先读完。**

---

## 1. 项目概览

微信小程序「工具箱」：一个包含多种小工具的合集，工具会持续增加。

- **AppID**：`wx195058f990d236c7`
- **小程序根目录**：`miniprogram/`（注意：不是仓库根目录）
- **当前工具**：

| 分类 | 工具 | 路径 |
|------|------|------|
| 日常 | 计数器 | `pages/counter/counter` |
| 日常 | 随机数 | `pages/random/random` |
| 音乐 | 调号速查 | `pages/key-signature/key-signature` |
| 音乐 | 音名对照 | `pages/note-names/note-names` |
| 音乐 | 频率对照 | `pages/pitch-frequency/pitch-frequency` |

> 新增或下线工具时**必须**同步更新上表（见 §6）。

---

## 2. 技术栈

| 项 | 说明 |
|----|------|
| 语言 | TypeScript；`tsconfig.json` 开启 `strict`、`noUnusedLocals`、`noUnusedParameters` 等严格选项；无 ESLint/Prettier，风格见 §4.6 |
| 样式 | SCSS（`sass` 编译插件）。`project.config.json` 配了 `scssCommonUseFilePath: "global.scss"`，但仓库中**没有** `global.scss`，因此**没有**任何自动注入的公共变量/mixin |
| 渲染引擎 | **Skyline**（`rendererOptions.skyline`，`sdkVersionBegin: 3.0.0`） |
| 组件框架 | glass-easel |
| 基础库 | `libVersion: 2.32.3`（`project.config.json`） |
| 类型声明 | 内置副本，源自 `miniprogram-api-typings` 2.8.x，位于 `typings/types/wx/*.d.ts`；`package.json` 里的 devDependency 只是声明，仓库**没有** `node_modules` |
| 依赖 | 无运行时依赖，**不要**引入 npm 包或第三方 UI 库 |

---

## 3. 目录结构

```
.
├── project.config.json          # 微信开发者工具项目配置（勿改 appid）
├── project.private.config.json  # 开发者工具个人配置（含 compileHotReLoad 等）
├── tsconfig.json                # strict / noUnusedLocals / noUnusedParameters
├── typings/                     # 内置微信 API 类型声明（勿改、勿升级）
│   ├── index.d.ts               # IAppOption，全局类型扩展放这里
│   └── types/wx/*.d.ts
└── miniprogram/
    ├── app.json                 # 页面注册 + 自定义 TabBar + Skyline 配置
    ├── app.ts                   # App 实例
    ├── app.scss                 # 全局 CSS 变量与 page 基础样式
    ├── sitemap.json
    ├── custom-tab-bar/          # 自定义底部 TabBar（index.{json,wxml,ts,scss}）
    ├── components/
    │   └── navigation-bar/      # 自定义导航栏组件（所有页面都在用）
    ├── utils/util.ts            # logs 页面依赖其中的 formatTime
    └── pages/
        ├── index/               # 首页：分类 Tab + 工具列表（数据驱动）
        ├── counter/             # 计数器
        ├── random/              # 随机数
        ├── key-signature/       # 调号速查
        ├── note-names/          # 音名对照
        ├── pitch-frequency/     # 频率对照
        ├── mine/                # 我的
        └── logs/                # 模板遗留页，可用于调试（保持注册，勿删）
```

---

## 4. 核心约定

### 4.1 页面四件套

每个页面必须是 `pages/<name>/` 下的 4 个文件，缺一不可：

```
<name>.json    # usingComponents 引入 navigation-bar
<name>.wxml
<name>.ts      # 一律使用 Component({})，不用 Page({})
<name>.scss
```

**所有页面统一使用 `Component({})`** 而非 `Page({})`，以便使用 `pageLifetimes`。

### 4.2 导航栏

导航栏是普通文档流元素（不是 fixed），**位置取决于滚动模式**（见 §5.3）：

- **页面整体滚动**（index / mine / note-names）：放在 `.wxml` 顶部、页面容器之外。
- **固定顶栏 + 局部滚动**（key-signature / pitch-frequency）：放进 `position: fixed` 的 `.page-container` 内部。
- 导航栏前允许有注释；"首行"不是硬性要求，**层级位置**才是。

```html
<navigation-bar title="页面标题" back="{{true}}" color="#2D2D3A" background="#FBFBFD"></navigation-bar>
```

- TabBar 页面（index / mine）：`back="{{false}}"`
- 工具子页面：`back="{{true}}"`

`app.json` 中 `navigationStyle: "custom"`，所以**不要**依赖原生导航栏。

### 4.3 工具注册（数据驱动）

首页工具列表由 `pages/index/index.ts` 中的 `ALL_CATEGORIES` 数组驱动，**不要**在 WXML 里硬编码工具卡片。

```ts
{
  id: 'tool-id',                  // 必须与页面目录名一致
  name: '显示名称',
  symbol: '计',                   // 卡片图标：1–2 个字符的排版符号，禁止 Emoji
  description: '一句话描述',
  iconBg: '#EEF2FF',              // 图标底色（浅色）
  iconColor: '#4C6EF5',           // 图标文字色（同色系深色）
  borderColor: '#DBE4FF',
  comingSoon: false,              // 未上线工具置 true，点击时提示
  path: '/pages/tool-id/tool-id',
}
```

`totalCount` 由 `countTools()` 自动计算，**不要**手改。

### 4.4 图标规范

- **工具图标（`symbol`）禁止使用 Emoji**（跨平台渲染不一致，观感差）
- 使用 1–2 个字符的排版符号或中文单字：`计`、`?`、`♯`、`CD`、`Hz`
- 图标统一放入圆角色块：`width/height: 88rpx; border-radius: 22rpx`
- 分类图标（`Category.icon`，当前为 `🛠` / `🎵`）是另一套规则，**不要**顺手改成排版符号

### 4.5 设计系统

**配色**

```
主色        #4C6EF5
页面底色    #FBFBFD
主文字      #1E1E2E
次要文字    #9CA3AF
弱化文字    #B0B5C0
导航栏文字  #2D2D3A
边框        rgba(0,0,0,0.04)
卡片底      #FFFFFF
```

`app.scss` 只定义了 `--color-primary / bg / text / muted / border` 5 个变量，页面实现基本直接写十六进制。新增页面直接沿用上表色值即可，不必强行改用 CSS 变量。

**排版**

```
页面主标题  52rpx / 800
卡片标题    30rpx / 700
正文        28rpx / 400
描述文字    24rpx / 400
辅助小字    22rpx / 600
```

**间距**

- 页面左右内边距：`32rpx`
- 卡片内边距：`28rpx`
- 卡片圆角：`24rpx`
- 卡片间距：`16rpx`
- 底部留白：`140rpx`，**仅 TabBar 页面（index / mine）需要**，用于避开自定义 TabBar；工具页不要加

### 4.6 代码风格

- 2 空格缩进、单引号、行尾**不写分号**；`pages/random/random.ts` 现有代码带分号，改动时跟随该文件既有风格即可。
- 函数参数/返回值按需标注类型；`dataset` 取出后立即断言或 `Number()`。
- 事件参数统一 `WechatMiniprogram.TouchEvent`。
- 未使用的变量/参数会被 `noUnusedLocals` / `noUnusedParameters` 拒绝，删干净。
- 注释用中文，分节注释沿用现有风格（`/* ===== xxx ===== */`）。

---

## 5. Skyline 限制与坑（重要）

本项目运行在 Skyline 渲染引擎上，以下约束是**踩过坑后确认的**。每条都对应过真实故障，改动相关代码前务必对照。

### 5.1 通用约束

1. **不要用 CSS Grid** —— Skyline 支持有限。布局一律用 `flex`。
2. **不要在 WXML 里调用方法** —— WXML 表达式只支持取值和基础运算，`toFixed()`、`Math.pow()`、`indexOf()` 等在模板中一律不可用。**所有格式化必须在 TS 中预先完成**，以字符串形式存进 data。
   - 参考 `pages/pitch-frequency/pitch-frequency.ts` 的 `fmt()` 函数。
   - 症状：模板静默渲染为空，且**切换数据也不更新**，极易被误判为"点击没生效"。
3. **`::before` / `::after` 可用但能力受限** —— 不要依赖它做复杂装饰、遮罩或尺寸占位；装饰元素优先用真实 `<view>`。参考 `pages/index` 的 `tab-indicator`。
4. **`transform: translateX(-50%)` 居中不可靠** —— 用 `left: 50%; margin-left: -<半宽>rpx;` 代替。
5. **`transition` / `:active` 的 `transform: scale()` 慎用** —— 点击反馈优先用 `opacity` 或背景色变化。
6. **`disableScroll: true` 只用于模式 B（禁用页面滚动）** —— 写在页面 `.json` 里，同时页面内部必须有 `scroll-view` 承担滚动（见 §5.3）。

### 5.2 WXSS 语法红线（写错会直接 `compile .wxss error`，整页白屏）

以下选择器/伪元素 WXSS **不支持**，出现即编译失败。报错只在控制台显示 `.wxss error`，页面变成一片白，没有任何内容。

| 禁止写法 | 症状 | 替代方案 |
|:---|:---|:---|
| `* { ... }` 通配选择器 | 编译失败 | 在具体类上逐个声明，如 `.page-container { box-sizing: border-box; }` |
| `::-webkit-scrollbar { ... }` | 编译失败 | 隐藏滚动条用 `<scroll-view ... show-scrollbar="{{false}}">` |
| `:not(.xxx)` | 编译失败 | 改写成"基类 + 覆盖类"，如 `.row { border-top: … }` + `.row.header { border-top: none; }` |
| `.a + .b` / `.a ~ .b` | 有编译风险 | 用 `border-bottom` + `:last-child { border-bottom: none; }` 实现分隔线 |
| `[data-x]` 等复杂属性选择器 | 不可靠 | 用 class 控制 |

> ✅ 可用的有：类、id、元素、`::before`/`::after`（能力受限）、`:active`、`:last-child`、`:first-child`、`gap`、`calc()`、`env()`。

### 5.3 布局与滚动

先选滚动模式，再写 WXML/SCSS。仓库现有三种，选错就会出现"顶部跟着滚""底部被裁""双滚动条"。

**模式 A：页面整体滚动**（index / mine / note-names）

- 导航栏在 `.wxml` 顶部，由页面自身滚动，或用一个 `height: 100vh` 的 `scroll-view` 承担滚动。
- 用 `100vh` 时导航栏也在文档流里额外占高，底部内容可能被裁；需要精确控制或固定顶栏时改用模式 C，或把滚动区高度扣掉导航栏。
- 适合内容自然滚动、不需要固定顶栏的页面。
- 不需要 `disableScroll`。

**模式 B：禁用页面滚动 + 局部滚动**（counter）

- 页面 `.json` 写 `"disableScroll": true`，页面内用 `scroll-view` 承担滚动。
- 导航栏在容器之外，容器用 `height: 100vh` + `overflow: hidden`。
- 此时页面总高 = 导航栏 + `100vh`，底部会超出视口；**必须真机确认底部按钮/内容没有被裁**。底部留白加在滚动内容里，不要指望页面滚动。

**模式 C：固定容器 + JS 测高**（key-signature / pitch-frequency）

- `.page-container`：`position: fixed; top: 0; right: 0; bottom: 0; left: 0; display: flex; flex-direction: column; overflow: hidden;`（比 `height: 100vh` 更稳）
- `<navigation-bar>` **放在**这个固定容器内部；固定区（导航栏、Tab、筛选条）加 `flex-shrink: 0`。
- 滚动区：`<scroll-view scroll-y enhanced show-scrollbar="{{false}}">`，高度**首选 JS 精确计算**：

```ts
// 量 容器高度 − 顶栏底部
function applyScrollHeight(inst: any) {
  const query = wx.createSelectorQuery()
  query.select('.page-container').boundingClientRect()
  query.select('.top-bar').boundingClientRect()
  query.exec((res: any[]) => {
    const container = res && res[0]
    const topBar = res && res[1]
    if (!container || !topBar) return
    const h = Math.round(container.height - (topBar.bottom - container.top))
    if (h > 0) inst.setData({ scrollHeight: h })
  })
}
```

  完整实现含"测不到时用 `wx.getSystemInfoSync()` 兜底"，见 `pages/key-signature/key-signature.ts`。WXML 侧写 `style="height: {{scrollHeight}}px"`。
- 备选方案：`flex: 1; height: 0;`，只在容器高度确定时可靠。
- 适合有固定顶栏、筛选条、需要精确控制滚动区的页面。

其余通用规则：

1. **横向 `padding` 不要直接加在 `scroll-view` 上** —— `scroll-view` 宽度按 `100%` 解析，默认 `content-box` 会把 padding 加到 `100%` 之外，整体溢出屏幕（右侧被裁、左边距丢失）。横向 padding 放到内层普通 `<view class="scroll-inner">` 上。
2. **所有容器显式写 `width: 100%; box-sizing: border-box;`** —— 包括页面容器、滚动内层、卡片、列表项。缺一层都可能让长文本把父级撑宽。
3. **flex 子项一律加 `min-width: 0`** —— 否则子元素不会收缩，`text-overflow: ellipsis` 永远不生效，长内容直接把布局顶变形。
4. **`text-overflow: ellipsis` 用在 `<text>` 上必须配 `display: block`** —— `<text>` 默认是 inline。单行截断三件套：`display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`
5. **横向筛选条不要用 `scroll-x`** —— 4 个以内选项直接 `flex: 1` 等分四列，从根上消除横向滚动。

### 5.4 TS / 类型与 API 坑

1. **类型声明是内置的旧版本** —— `typings/types/wx/` 来自 `miniprogram-api-typings` 2.8.x，里面**没有** `wx.getWindowInfo()` / `wx.getDeviceInfo()`（已核实）。统一用 `wx.getSystemInfoSync()`（取 `windowHeight` / `windowWidth` / `statusBarHeight`）。**不要**为了一个 API 去升级 typings 或 `npm install`。
2. **`dataset` 取出的值一律是字符串** —— 与数字比较或参与计算前必须 `Number()`，否则 `'3' === 3` 恒为 false，表现为「点击无反应」。参考 `onToggleOctave`。
3. **`Component` 的 `lifetimes` 里 `this` 类型推断可能拿不到 `methods`** —— 需要复用的测量逻辑写成**模块级函数**，签名 `function xxx(inst: any)`，在 `ready()` 里 `xxx(this)` 调用，避免 `this.measureXxx()` 的类型报错。

### 5.5 快速排查顺序

出问题时按这个顺序定位，能省掉大量反复试错：

1. **白屏 / 整页空白** → 看控制台是否有 `compile .wxss error`，按 §5.2 逐条比对非法选择器
2. **内容超出屏幕 / 右侧被裁** → 按 §5.3 检查：`scroll-view` 是否带横向 padding、容器是否缺 `width: 100%`、flex 子项是否漏了 `min-width: 0`
3. **顶部跟着滚动** → 检查是否用了模式 C 的固定容器、导航栏是否在容器内部
4. **点击无反应 / 数据不刷新** → 先看 WXML 里有没有方法调用（§5.1 第 2 条），再查 `dataset` 类型（§5.4 第 2 条）
5. **页面打不开 / 白页无报错** → 检查 `app.json` 的 `pages` 是否注册、路径大小写是否与目录一致

---

## 6. 新增一个工具的完整流程

1. **先定滚动模式**（§5.3）：普通列表页用模式 A；必须固定顶栏用模式 C；只有确实要禁用页面滚动时才用模式 B。
2. **建页面四件套**：`miniprogram/pages/<tool-id>/<tool-id>.{json,wxml,ts,scss}`
   - `.json` 引入 `navigation-bar`；模式 B 才加 `"disableScroll": true`
   - `.ts` 用 `Component({})`
   - 测高滚动参考 `key-signature`；`wx.showModal` 二次确认、撤销逻辑参考 `counter`；历史列表参考 `random`
3. **注册页面**：在 `miniprogram/app.json` 的 `pages` 数组中加 `"pages/<tool-id>/<tool-id>"`，**放在 `pages/mine/mine` 之前**（唯一例外是 `pages/logs/logs`，它固定在末尾）。
4. **注册到首页**：在 `pages/index/index.ts` 的 `ALL_CATEGORIES` 对应分类的 `tools` 中加一条数据。
5. **更新本文件 §1 的工具表格**。
6. **自检**：
   - [ ] 滚动模式已选定；导航栏层级符合 §4.2
   - [ ] `id` 与目录名、`path` 完全一致
   - [ ] 图标是排版符号而非 Emoji（分类图标未动）
   - [ ] 配色取自设计系统
   - [ ] 没有在 WXML 中调用方法（`toFixed` / `indexOf` / `Math.*` 等）
   - [ ] 没有使用 CSS Grid；伪元素只做轻量装饰
   - [ ] SCSS 中**没有** `*` 通配选择器、`::-webkit-*`、`:not()`、`+` / `~` 选择器（见 §5.2）
   - [ ] 横向 padding 写在 `.scroll-inner` 内层，**不在** `scroll-view` 上
   - [ ] 页面容器、滚动内层、卡片都有 `width: 100%; box-sizing: border-box;`
   - [ ] 所有可能放长文本的 flex 子项都有 `min-width: 0`，并配省略号截断
   - [ ] 模式 C：`<navigation-bar>` 在固定容器内部，滚动区高度已测准
   - [ ] 模式 B：底部内容在真机上没有被裁
   - [ ] `dataset` 数值做过 `Number()` 转换
   - [ ] 底部留白仅在 TabBar 页面添加
   - [ ] `app.json`、`pages/index/index.ts`、本文件 §1 三处都已更新

---

## 7. 交互规范

| 场景 | 做法 |
|------|------|
| 破坏性操作（归零、清空） | **必须** `wx.showModal` 二次确认，`confirmColor` 用警示色 `#F76707` |
| 轻量反馈 | `wx.showToast({ icon: 'none', duration: 800–1500 })` |
| 计数/生成类操作 | 配 `wx.vibrateShort` 触觉反馈，默认 `type: 'light'`；生成类可用 `medium` |
| 未上线工具点击 | Toast「即将上线，敬请期待」 |
| 局部滚动区 | 必须有明确的高度上限（如 25vh），不超过屏幕 1/4 的小区域不抢占主内容空间，并配独立底色做视觉区分 |

---

## 8. 开发与验证

- **无构建脚本**（`package.json` 的 `scripts` 为空）。编译由微信开发者工具完成（TypeScript + Sass 插件）。
- 验证方式：用微信开发者工具打开**仓库根目录**（`project.config.json` 所在处），热重载查看真机/模拟器效果。
- 修改 `app.json` 的 `pages` 后需要重新编译。
- **本地没有 `node_modules` / `tsc`**，跑不了 `tsc --noEmit`；类型错误只能靠开发者工具和人工检查。改动后不要声称"类型检查通过"。
- 项目无自动化测试，改动后请用开发者工具手动验证所改页面。
- 热重载开关在 `project.private.config.json` 的 `compileHotReLoad`（当前为 `true`），若修改不生效先看这里。

---

## 9. 不要做的事

- ❌ 不要改 `project.config.json` 里的 `appid`
- ❌ 不要引入 npm 依赖或第三方 UI 库（无构建流程，会破坏编译）
- ❌ 不要 `npm install` 或升级 `typings/`（内置类型是刻意锁定的旧版本）
- ❌ 不要把工具卡片写死在 WXML 里
- ❌ 不要用 `Page({})` 写新页面
- ❌ 不要在 `app.scss` 里放页面专属样式（只放全局变量与基础 reset）
- ❌ 不要删除 `pages/logs`（可作调试入口）或 `utils/util.ts`（`logs` 依赖 `formatTime`）
- ❌ 不要在 SCSS 里使用未定义的全局变量 —— `global.scss` 并不存在，没有自动注入
- ❌ 修 bug 时不要顺手重构无关页面；发现新坑请补进本文件 §5
