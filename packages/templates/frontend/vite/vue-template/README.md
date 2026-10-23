# Vue + Vite 模板脚手架

生成最小 Vue + Vite + TypeScript 应用，保留 Router、Pinia 和 Vue DevTools。

## 用户使用（发布到 npm 后）

```sh
pnpm create @dengzhibo/vue-template@latest my-vue-app

# 等价的完整包名调用
pnpm dlx @dengzhibo/create-vue-template@latest my-vue-app

# 全选并安装依赖
pnpm create @dengzhibo/vue-template@latest my-vue-app --yes "--features=code-quality,unit-test,e2e" --install

# 不选任何功能，不安装依赖
pnpm create @dengzhibo/vue-template@latest my-vue-app --yes --features=
```

以上命令会从 npm 获取并运行脚手架，无需下载源码或全局安装；必须先发布对应包。`--install` 控制的是生成项目的依赖安装，不是脚手架自身的下载。每个示例独立执行，请使用空目录。

命令说明：[pnpm create](https://pnpm.io/cli/create)、[pnpm dlx](https://pnpm.io/cli/dlx)。

项目名取目标目录名，支持 my-vue-app 等带连字符名称；目录参数可使用相对路径、绝对路径或当前目录 .。目标目录必须为空，允许保留 .git。

向导顺序：创建位置 → 项目类型单选 → UI 组件库单选 → HTTP 请求库单选 → 基础开发配置多选 → 通用功能增强多选 → 是否安装依赖 → 确认、返回修改或取消。

功能默认全部不选，Space 勾选，Enter 确认，可任意组合；命令行 --features=all 可全选：

- 代码规范（code-quality）：ESLint + Oxlint + Oxfmt。
- 单元测试（unit-test）：Vitest、Vue Test Utils 和现有测试示例。
- 端到端测试（e2e）：Playwright 和现有测试示例。

Windows PowerShell 中，包含逗号的 `--features` 参数应加引号，如上例。

--yes 使用非交互模式；--features= 指定逗号分隔的功能，空值为全部不选；--install 执行 pnpm install，默认不安装。

未选择的功能不生成对应配置、依赖、脚本或编辑器推荐。测试的 ESLint 规则仅在代码规范与相应测试同时选择时生成。

不生成 Git hooks、CI 或 Docker；部署示例由 deployment 选项生成，不会操作服务器。保留 Vue、Router、Pinia 基础能力，移除默认欢迎页、Logo 和 About 示例。

CLI Node 要求见 package.json；生成应用的 Node 要求见 templates/base/package.json。

## 源码开发与维护

仅在本包源码目录中使用以下命令进行本地调试：

```sh
node bin/index.js my-vue-app
```

验证：

```sh
node --test tests/*.test.mjs
node scripts/check-package.mjs
```

测试覆盖七种 UI 库与 16 种功能组合、CLI 参数、向导返回修改、取消及目标目录保护。不要在 templates 内安装依赖。

## 发布文件范围

`bin/`、`lib/`、`templates/`、README、CHANGELOG、LICENSE 与 package.json 随 npm 包发布。测试、预检脚本、AGENTS.md 和本地缓存仅用于仓库维护，不需要上传 npm。`_gitignore` 在生成项目时恢复为 `.gitignore`。

未指定目录时默认在当前目录 `.` 创建，生成包名为 `vue-project`；指定目录时使用目录名作为包名。生成项目版本与本脚手架根 package.json 的版本一致。

## UI 组件库（必选一个）

向导使用单选，↑↓ 切换、Enter 确认，PC 中后台默认 Ant Design Vue，移动端 H5 默认 Vant。命令行使用一次 --ui=<包名>；不接受多值、重复参数、空值或未知组件库。

| 组件库 | 参数 | 场景 |
| --- | --- | --- |
| Vant | --ui=vant | 移动端 H5，默认 |
| NutUI | --ui=@nutui/nutui | 移动端 H5 |
| TDesign Mobile Vue | --ui=tdesign-mobile-vue | 移动端 H5 |
| Ant Design Vue | --ui=ant-design-vue | PC 中后台，默认 |
| Element Plus | --ui=element-plus | PC 中后台 |
| Naive UI | --ui=naive-ui | 桌面 / 中后台 |
| TDesign Vue Next | --ui=tdesign-vue-next | 桌面 / 中后台 |

示例：

```sh
node bin/index.js my-mobile-app --yes --type=mobile --ui=vant
node bin/index.js my-admin-app --yes --ui=element-plus --install
```

仅生成所选库的依赖、样式入口和首页示例。首页显示库名及真实组件库按钮，点击后计数递增。组件在 src/ui/UiDemo.vue 中显式导入，无需自动导入插件。src/app/main.ts 统一加载 src/ui/setup.ts；Naive UI 自动注入组件样式，其余库在 setup.ts 导入样式。现有可选测试同步验证按钮行为。本阶段不增加业务功能。

接入参考：[Vant](https://github.com/vant-ui/vant)、[Ant Design Vue](https://www.antdv.com/docs/vue/introduce)、[Element Plus](https://element-plus.org/en-US/guide/quickstart)、[Naive UI](https://github.com/tusen-ai/naive-ui)、[TDesign Vue Next](https://github.com/Tencent/tdesign-vue-next)。

## UI 模板维护

`templates/base` 保存公共应用基础，`templates/features` 保存可选功能，`templates/ui` 保存七个独立的 UI 模板。生成顺序为 base → 所选 UI → 所选 HTTP → 所选 features；依赖片段统一合并，重复文件及不一致的依赖版本会报错，不会静默覆盖。

每个 `templates/ui/h5/<库目录>/` 或 `templates/ui/pc/<库目录>/` 包含：

- `package.fragment.json`：该 UI 库的依赖及版本，不复制到生成项目。
- `src/ui/setup.ts`：样式初始化入口，由公共 main.ts 加载。
- `src/ui/UiDemo.vue`：独立的组件导入及可点击示例，由公共 HomeView.vue 渲染。

维护现有库时，在它自己的模板目录中修改依赖、初始化或示例即可。新增库时，按上述结构增加目录，并在 `lib/ui.js` 添加同名选项和显示名称，在 `lib/project-types.js` 配置所属类型、顺序及默认值，并更新生成器测试列表；生成器不需要增加该库的专用代码分支。`lib/ui.js` 维护选项显示名称和相对于 templates/ui 的模板路径。

## HTTP 请求库（必选一个）

Axios（默认）与 Alova 独立单选，和 UI 库任意搭配。使用一次 `--http=axios` 或 `--http=alova`，不接受重复参数、多值、空值或未知库。

```sh
node bin/index.js my-app --yes --type=mobile --ui=vant --http=alova --install
```

`templates/http/axios`、`templates/http/alova` 各自维护 `package.fragment.json`、`src/http/client.ts`、`src/http/example.ts`，生成时只复制所选模块。实例从环境配置读取 API 地址和超时，默认 10 秒。Mock 独立遵循 Vite BASE_URL，支持子目录部署。Alova 示例关闭 GET 缓存并将非成功 HTTP 状态转为异常。

公共 `public/mock/hello.json` 是静态 JSON，开发及构建后均可访问，不是业务 Mock 服务。`src/app/components/HttpDemo.vue` 调用统一的示例函数 getExample，展示加载、成功、失败及重试；两个库各自实现请求，不提供业务请求封装或 Token 策略。勾选单元测试后，还会生成真实本地 HTTP 请求和页面状态测试。

接入参考：[Axios](https://axios-http.com/docs/res_schema)、[Alova](https://alova.js.org/tutorial/getting-started/quick-start/)。

## 项目类型与 UI 联动

向导第一个问题为项目创建位置，第二个问题为项目类型，提供移动端 H5（mobile）和 PC 中后台（admin，默认）。移动端 UI 顺序：Vant（默认）、NutUI、TDesign Mobile Vue；PC UI 顺序：Ant Design Vue（默认）、Element Plus、Naive UI、TDesign Vue Next。类型和 UI 均为单选。

非交互参数使用 `--type=mobile` 或 `--type=admin`。省略 UI 时按类型确定默认值；显式指定不匹配的 UI 会报错并列出支持项。参数顺序不影响结果。返回修改时，同类型保留 UI，切换类型重置为新类型的默认 UI；HTTP、可选功能及安装偏好保留。

`lib/project-types.js` 维护类型、可用 UI 顺序和默认 UI，`lib/ui.js` 维护显示名称与模板路径。组件库模板按 `templates/ui/h5` 和 `templates/ui/pc` 分类维护。本次类型分组提供最小初始化，不额外生成后台或移动端业务布局。

### UI 模板分类目录

```text
templates/ui/
├─ h5/
│  ├─ vant/
│  ├─ nutui/
│  └─ tdesign-mobile-vue/
└─ pc/
   ├─ ant-design-vue/
   ├─ element-plus/
   ├─ naive-ui/
   └─ tdesign-vue-next/
```

NutUI 的选项与依赖包名仍为 `@nutui/nutui`，通过 lib/ui.js 的 template 字段映射到 `h5/nutui`。生成器统一读取该字段，不拼接 npm 包名或判断平台。分类只用于脚手架源码，生成项目仍为 `src/ui/setup.ts` 和 `src/ui/UiDemo.vue`。

## 通用开发能力

基础生成内容：

| 能力 | 文件或入口 |
| --- | --- |
| 环境校验 | src/shared/config/validate.ts、env.ts；.env.example、.env.development、.env.production |
| 开发代理 | config/environment.ts；DEV_PROXY_TARGET 启用 /api 代理，保留前缀 |
| 平台适配 | templates/platform/mobile、admin；输出 src/ui/styles/platform.css |
| 基础路由 | 标题元信息、懒加载、滚动恢复、404 返回首页 |
| HTTP 基础 | src/http/errors.ts 分类；请求实例读取环境；取消、上传下载示例 |
| 开发文档 | docs/DEVELOPMENT.md、MODULES.md、UPGRADING.md |

通用功能增强（独立多选）：

| 参数 | 内容 |
| --- | --- |
| theme | 浅色、深色、跟随系统、偏好持久化与公共设计变量 |
| i18n | Vue I18n，中英文文案、日期、数字格式与语言持久化 |
| tools | 可取消防抖、节流、命名空间存储校验、作用域自动清理的组合函数 |
| analyze | pnpm analyze 生成 stats.html，普通构建不输出报告 |
| diagnostics | Vue/window/Promise 错误入口、版本标识、脱敏、可替换 reporter，默认无网络上报 |
| deployment | 根路径和 /app/ 子目录 Nginx 示例、SPA 路由回退及资源缓存说明 |

```sh
node bin/index.js my-app --yes --features=all
node bin/index.js my-app --yes --features=theme,i18n,tools,analyze,diagnostics,deployment
node bin/index.js my-app --config=presets/admin.json --dry-run
node bin/index.js my-h5 --config=presets/mobile.json --yes
```

配置文件为 JSON，支持 location、type、ui、http、features、install；显式命令行参数覆盖同名配置。--dry-run 输出目标与完整文件清单，不创建目录、不安装依赖。交互确认页保留返回修改和取消。

环境变量在构建时确定，VITE_ 前缀均属于公开配置；密钥不应写入。开发代理仅用于 Vite 开发服务，生产 API 由托管环境反向代理或独立服务提供。环境与代理、Mock 与业务 API 的边界见生成项目 docs/DEVELOPMENT.md。

功能注册统一维护在 lib/features.js，应用安装入口、展示示例和 Vite 插件入口由生成器组合。部署模块只生成配置示例和说明，实际托管参数按环境配置。

模块检查采用基础组合、全部新模块的 64 种组合和代表性全量项目验证。勾选单元测试后，按已选模块生成对应测试，不会引用未选模块。新增模块按 docs/MODULES.md 的边界维护；升级到新模板参考 docs/UPGRADING.md。

维护者可运行 `node scripts/verify-project.mjs <已安装依赖的生成项目目录>`，依次检查类型、构建、已选测试、代码规范与分析报告。

生成项目不保留 .gitkeep 空占位目录。应用插件入口、示例聚合组件、主题包装及 Vite 扩展入口仅在有对应功能时输出，并同步移除未生成文件的引用。配置文件中的 location 必须是字符串，install 必须是布尔值。

## 功能分类

功能选择拆成两个连续的多选问题，均默认不选，各自可以全选或不选；确认页分别显示两类结果。返回修改时，两类各自保留已选项。

- 基础开发配置：代码规范、单元测试、端到端测试、JSX 支持。
- 通用功能增强：主题配置、国际化、通用工具与组合函数、构建分析、错误诊断、部署配置示例。

源码目录按 `templates/features/basic/` 和 `templates/features/enhanced/` 分类，模块实现与生成项目目录保持原样。`lib/features.js` 集中维护分类名称、模块所属分类和模板目录。

原有 `--features` 参数、`--features=all` 及 JSON 配置中的 features 数组保持兼容。分类不影响模块组合：例如基础类的单元测试和增强类的主题一起选择时，仍会生成主题测试。
