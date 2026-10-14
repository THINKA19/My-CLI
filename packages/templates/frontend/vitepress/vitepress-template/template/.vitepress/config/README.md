# 多语言配置架构与维护

本目录负责站点设置、多语言配置、导航与侧边栏、搜索和 SEO。主入口 `.vitepress/config.ts`
只组合这些模块；文档内容位于 `src/`，菜单生成逻辑位于 `scripts/menus/`。

模板提供中文、英文和越南语，每种语言保留首页、Markdown 示例和运行时 API 示例。
示例正文采用 VitePress 官方模板内容，页面标题和首页按语言配置；侧边栏入口说明见 [侧边栏生成](sidebar/README.md)。

## 设计原则与数据流

```text
Markdown frontmatter + 可选的 src/menu.config.ts
    → scripts/menus 扫描、校验、生成
    → generated 保存共享结构与各语言菜单文字
    → nav/sidebar 汇总，locales 提供各语言站点与主题文案
    → i18n 校验目标页面、添加语言前缀、组装语言配置
    → .vitepress/config.ts 组合站点配置
```

菜单元数据与正文放在一起，页面路径由文件位置推导，新增或移动文档时无需维护另一份链接清单。
默认语言提供菜单层级、顺序和显示开关，各译文提供对应文字；同一份结构确保三种语言的栏目一致。
生成结果按栏目保存，便于检查和定位，但最终配置仍会汇总全部菜单。

公共站点行为与语言文案分开维护。各语言入口负责组合自己的 site、theme、search、seo 和菜单文字，
i18n 入口负责统一解析，便于在新增语言时检查配置是否完整。嵌套主题对象显式合并，
使语言文案可以覆盖标签，同时保留公共的大纲层级、编辑地址和时间格式。

菜单生成是显式的构建步骤。dev、build 和 typecheck 在启动前生成菜单；开发期间修改菜单元数据后，
运行 `pnpm menus:generate`。静态导入使生成文件进入 VitePress 的配置依赖，变化时重新加载配置。
这种方式让生成时机明确，正文的普通保存不会启动额外的菜单生成任务。

生成阶段检查 frontmatter、页面对应关系和菜单结构；配置加载阶段确认文案与目标页面可用。
两处校验分别覆盖输入和实际使用结果，错误在构建阶段暴露。搜索直接读取搜索文案，
不依赖完整菜单组装；SEO 和 sitemap 共用部署地址，避免路径拼接各自维护。

## 目录职责

日常菜单由文档生成，字段规范与命令见 [菜单生成说明](../../scripts/menus/README.md)。

```text
.vitepress/config/
├── generated/                  # 自动生成，不入库：栏目结构及多语言文字
│   ├── index.ts
│   ├── home.ts
│   └── ...                     # 文件名和数量由实际菜单决定
├── nav/index.ts                # 静态加载并汇总生成菜单
├── sidebar/index.ts            # 稳定侧边栏入口
├── locales/
│   ├── zh/                     # 手写：index、site、theme、search、seo
│   ├── en/
│   └── vi/
├── i18n/                       # index、registry、resolve、types、validate
├── site.ts
├── theme.ts
├── search.ts
├── seo.ts
├── sitemap.ts                  # 根据真实页面关联各语言替代链接
└── README.md
```

生成逻辑位于 `scripts/menus/`：index、schema、scan、build、output 五个实现文件。
有正文的节点在 Markdown frontmatter 中配置。需要外部链接或无正文分组时，
可自行创建 `src/menu.config.ts`；文件不存在时，生成器只读取文档菜单。

## 公共配置与语言差异

- `site.ts`：统一读取环境变量，维护构建目录、base、路由和 sitemap；不设置路径重写。
- `theme.ts`：维护 Logo、社交地址、大纲层级、编辑地址和时间格式。
- `search.ts`：维护搜索参数，直接组合各语言 search.ts 的文案，避免依赖完整 i18n 组装入口。
- `seo.ts`：维护公共标签，通过 transformHead 按页面生成 canonical、分享标题、描述及图片地址。
- `sitemap.ts`：按去掉语言前缀的页面路径关联译文，只列出真实存在的语言版本。中文的配置 key 为 root，
  实际路径为 /zh/，因此需要依据真实路径建立三语言的替代链接。
- `locales/*/site.ts`：仅保留站点标题、标题后缀和描述；语言代码由 registry.ts 登记。
- `locales/*/theme.ts`：仅保留主题文字，组装时明确合并 outline、editLink、lastUpdated 等嵌套对象。
- `locales/*/seo.ts`：仅保留作者、关键词和 Open Graph 语言标识；标题和描述复用当前页面数据。

VITE_SITE_URL 可填域名或带部署子路径的站点地址；子路径必须与 VITE_BASE 一致。
SEO 和 sitemap 统一使用该地址，避免重复添加 base。页面可通过 frontmatter 的 image
设置分享图片；已有的 canonical 和分享标签会保留。
默认图标使用模板提供的 `public/logo.svg`。没有显式分享图片时输出文字摘要卡片，不输出图片标签；
提供 `image` 或页面 head 中的分享图片时使用大图卡片，显式的 `twitter:card` 设置优先。
站内分享图片由维护者放入 `public/`，外部图片需提供可访问的 HTTP(S) 地址。
相对图片地址（如 `share.png`）以部署目录为根，`/share.png` 表示域名根路径，
`/docs/share.png` 已含部署路径时不会重复拼接；HTTP(S) 和 `//cdn.example.com/share.png` 支持外部图片。

## 新增菜单与栏目

1. 在各语言 src 目录新增对应 Markdown，提供 title 和所需 menu 元数据。
2. 普通文章默认进入侧边栏；顶部导航需要显式启用 nav.enabled。
3. 栏目 index.md 描述分组；结构和顺序以默认语言为准，文字取各语言文档。
4. 运行 `pnpm menus:generate`；开发和构建命令会先自动生成。开发期间修改菜单元数据后，手动重新生成。
5. 运行 `pnpm menus:check` 校验但不写文件；`pnpm test:menus` 验证生成逻辑。

菜单结构和菜单文字由文档生成。生成文件中的路径不带语言前缀和部署 base。
中文、英文、越南语分别使用 /zh/、/en/、/vi/，不使用路径重写。

## 新增语言

在 i18n/registry.ts 登记语言代码、VitePress configKey、标签、路径前缀、
正文目录和 fallback；在 locales 中提供对应语言配置，并加入 i18n/index.ts 的 localeTexts 和 search.ts 的 translations。
正文位于 `src/语言目录/`，访问路径保留该语言目录。

所有语言的栏目文案遵循同一组推导出的 key。配置加载时校验菜单、翻译、
重复项、语言前缀和各语言页面是否存在；缺少页面应先补齐或明确调整菜单，不会静默生成失效链接。
resolveText 支持文案回退，但当前菜单校验要求完整翻译，fallback 不表示自动跳转到原文页面。

## 文档菜单元数据

以下 frontmatter 由菜单生成脚本读取。修改后运行 `pnpm menus:generate` 更新菜单。

### 简单页面

在 Markdown 文件开头填写页面信息：

```md
---
title: 站点配置
description: 如何配置站点
---

# 站点配置
```

默认将普通文章加入所属目录的侧边栏，使用 `title` 作为菜单文字；
不单独加入顶部导航。页面链接从文件路径推导，不需要手写。

### 分别配置侧边栏和顶部导航

例如 `src/zh/configuration/site.md`：

```md
---
title: 站点配置
description: 如何配置站点
menu:
  id: configuration.site
  sidebar:
    enabled: true
    text: 站点配置
    order: 20
  nav:
    enabled: true
    text: 配置站点
    order: 30
    parent: configuration
    activeMatch: "^/configuration/"
---

# 站点配置
```

| 字段 | 含义 | 默认值或规则 |
| --- | --- | --- |
| `title` | 页面标题，也是菜单文字的默认来源 | 页面应提供标题 |
| `description` | 页面说明，供 SEO 等现有功能使用 | 可省略，遵循现有页面配置 |
| `menu.id` | 菜单稳定标识，用于匹配多语言页面和父分组 | 不带语言前缀的相对文档路径 |
| `menu.sidebar.enabled` | 是否进入侧边栏 | 普通文章为 `true` |
| `menu.sidebar.text` | 侧边栏显示文字，可与页面标题不同 | 使用 `title` |
| `menu.sidebar.order` | 所属分组内的排序，数值越小越靠前 | 未填写的排在显式排序之后；同序按文件名排序 |
| `menu.nav.enabled` | 是否作为顶部导航入口或下拉菜单项 | 普通文章为 `false` |
| `menu.nav.text` | 顶部导航显示文字 | 使用 `title` |
| `menu.nav.order` | 所属导航分组内的排序 | 与侧边栏排序规则相同，单独计算 |
| `menu.nav.parent` | 所属导航分组的 `menu.id` | 未填写时作为顶层入口 |
| `menu.nav.activeMatch` | 控制导航高亮的正则表达式字符串 | 不生成，使用主题默认匹配 |

这个例子表示：侧边栏显示“站点配置”，按 20 排序；导航中显示“配置站点”，
放入 ID 为 `configuration` 的分组，按 30 排序。两处排序互不影响。
父分组必须存在且支持下拉菜单，不能把普通页面当成父分组，也不能循环引用。

中文页面的地址为 `/zh/configuration/site`（部署时另加 base）。公共菜单结构保存
`/configuration/site`，语言前缀由现有 i18n 解析器添加。
`activeMatch` 示例匹配不带语言前缀的栏目路径；生成器需要按语言转换为
`^/zh/configuration/`、`^/en/configuration/` 等，不能直接原样用于当前语言地址。
匹配多个栏目时写成 `^/(guide|api)/`，分支只能放在括号分组中，各分支共用根路径起点。
`^/guide/|^/api/` 和 `^/guide/|/api/` 都会被拒绝，避免分支绕过当前语言前缀。

### 栏目首页与分组

目录中的 `index.md` 可以描述栏目，例如 `src/zh/configuration/index.md`：

```yaml
---
title: 配置
menu:
  id: configuration
  sidebar:
    enabled: true
    text: 配置指南
    order: 20
    collapsed: false
    linkToIndex: true
  nav:
    enabled: true
    text: 配置
    order: 20
    mode: dropdown
---
```

- `sidebar.collapsed`：分组初始折叠状态；`false` 表示初始展开，`true` 表示初始折叠，省略时不设置折叠状态。
- `sidebar.linkToIndex`：分组标题是否链接栏目首页；存在 `index.md` 时默认为 `true`。
- `nav.mode`：`link` 表示栏目链接，`dropdown` 表示下拉分组；默认为 `link`。
- 下拉分组只收集显式启用 `nav.enabled` 的后代，避免把全部文章放进顶部导航。
- 隐藏侧边栏分组时，整个分组不进入菜单，但页面仍可访问；根首页不自动形成侧边栏分组。

### 多语言和维护约定

默认语言提供层级、顺序和显示开关；其他语言提供页面标题及菜单文字。
对应页面使用相同 `menu.id`，或保持相同的相对文档路径；当前对应页面路径仍需一致。缺少翻译页面应报错，
不能生成不存在的链接。显式设置 ID 后，移动文件时保持 ID 不变，链接仍从新路径推导。
默认语言文档可设置 `translate: false`，入口只在默认语言菜单显示，其他语言跳过，不生成回退链接。

字段均按需要填写，不要求复制完整示例。新增可选字段应保留旧文档的默认行为；
拼错字段、类型错误、重复 ID、无效父分组和无效正则应明确报错。
使用一个 `pnpm menus:generate` 命令统一生成导航、侧边栏及菜单文案，
全部校验成功后再更新文件；`pnpm menus:check` 校验输入及内存菜单，不写文件，也不检查生成文件是否过期。
这两个命令已提供；dev 和 build 会先自动生成。

## 扩展约定

侧边栏按文档目录分组，默认主题最多六层；导航只展示明确启用的节点，最多两层分组。
生成数据按栏目输出，生成器会发现新增栏目，不需要手改汇总入口。
大规模菜单的解析有测试覆盖；拆分输出文件不会自动减少浏览器菜单体积。

## 验证

生成菜单后，`node --test tests/i18n/config.test.mjs` 检查菜单解析、页面校验、语言链接和 SEO。
`node node_modules/typescript/bin/tsc --noEmit -p tests/i18n/tsconfig.json` 检查文案类型约束。
tests/i18n/baseline.json 记录示例菜单的回归预期；有意修改示例菜单或文案时，同步更新该基线。
`pnpm typecheck` 检查全项目类型，`pnpm build` 验证配置加载、页面生成和 sitemap 输出。

## 导入约定

跨目录导入使用 `#config/` 别名，指向 `.vitepress/config/`；同目录保留 `./`。
相对导入写完整扩展名，例如 `./site.ts`；目录入口写 `./nav/index.ts`，
避免 Vite 原生配置加载的兼容性警告。TypeScript 仅检查类型，不输出文件。
例如 `import type { MenuText } from '#config/i18n/types'`。
目录入口显式使用 `#config/nav/index`。
别名由 package.json 的 imports 和 tsconfig.json 的 paths 对齐配置，
支持 VitePress 配置加载及类型检查，不依赖配置加载后的 Vite alias。
菜单结构和文字统一由 generated 中的栏目文件提供。
