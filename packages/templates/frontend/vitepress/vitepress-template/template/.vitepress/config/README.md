# 多语言配置维护

可运行的大规模菜单示例见 [扩展示例](sidebar/README.md)，包含六个分类和三种语言页面。

菜单结构只维护一份，语言文案按栏目提供。当前包含六个分类，各语言内容目录顶层仅保留 index.md。

## 目录职责

当前沿用“公共菜单结构 + 分语言文案 + i18n 组装”的设计，实际目录如下：

```text
.vitepress/config/
├── nav/
│   ├── index.ts                 # 组合顶部导航，决定栏目顺序
│   ├── getting-started.ts       # 入门导航
│   ├── configuration.ts         # 配置导航
│   ├── development.ts           # 开发导航
│   ├── deployment.ts            # 部署导航
│   ├── integrations.ts          # 集成导航
│   └── reference.ts             # 参考导航
├── sidebar/
│   ├── index.ts                 # 注册路径前缀及对应侧边栏
│   ├── getting-started.ts       # 入门侧边栏结构
│   ├── configuration.ts         # 配置侧边栏结构
│   ├── development.ts           # 开发侧边栏结构
│   ├── deployment.ts            # 部署侧边栏结构
│   ├── integrations.ts          # 集成侧边栏结构
│   ├── reference.ts             # 参考侧边栏结构
│   └── README.md                # 菜单扩展示例说明
├── locales/
│   ├── zh/
│   │   ├── index.ts             # 汇总中文配置与文案
│   │   ├── site.ts              # 站点标题、描述
│   │   ├── theme.ts             # 主题文字：按钮、页脚、404 等
│   │   ├── search.ts            # 搜索文字
│   │   ├── seo.ts               # 作者、关键词、分享语言标识
│   │   ├── nav/
│   │   │   ├── index.ts         # 汇总导航文案
│   │   │   ├── getting-started.ts
│   │   │   ├── configuration.ts
│   │   │   ├── development.ts
│   │   │   ├── deployment.ts
│   │   │   ├── integrations.ts
│   │   │   └── reference.ts
│   │   └── sidebar/
│   │       ├── index.ts         # 汇总侧边栏文案
│   │       ├── getting-started.ts
│   │       ├── configuration.ts
│   │       ├── development.ts
│   │       ├── deployment.ts
│   │       ├── integrations.ts
│   │       └── reference.ts
│   ├── en/                     # 与 zh 相同的文件结构，提供英文文案
│   └── vi/                     # 与 zh 相同的文件结构，提供越南语文案
├── i18n/
│   ├── index.ts                 # 组装 VitePress 多语言配置
│   ├── registry.ts              # 登记语言、路径前缀和回退语言
│   ├── resolve.ts               # 解析文案、链接及菜单
│   ├── types.ts                 # 菜单、文案 key 和语言类型约束
│   └── validate.ts              # 检查菜单、翻译和页面链接
├── site.ts                     # 公共站点与构建设置
├── theme.ts                    # 公共主题设置
├── search.ts                   # 搜索参数及多语言搜索文案组装
├── seo.ts                      # 公共 SEO 标签与页面元数据生成
└── README.md                   # 本维护说明
```

与早期草案的差异：栏目已替换为当前六个分类；`ui.ts` 已拆为独立的
`theme.ts`、`search.ts`，站点和 SEO 文案分别由 `site.ts`、`seo.ts` 管理。
增加了 `validate.ts`；不保留空的 `auto.ts`，以后需要自动生成时再添加。
菜单结构与文案目录均不再包含 `demo/` 层。

- `config/nav/`：顶部导航结构和组合顺序。
- `config/sidebar/`：侧边栏结构及路径分区。
- `config/locales/zh|en|vi/`：站点、界面、搜索、导航和侧边栏文字。
- `config/i18n/`：语言登记、共享类型、解析和校验。
- `config/theme.ts`：Logo、社交地址和其他公共主题设置。

## 公共配置与语言差异

- `site.ts`：统一读取环境变量，维护构建目录、base、路由和 sitemap；不设置路径重写。
- `theme.ts`：维护 Logo、社交地址、大纲层级、编辑地址和时间格式。
- `search.ts`：维护搜索参数，直接组合各语言 search.ts 的文案，避免依赖完整 i18n 组装入口。
- `seo.ts`：维护公共标签，通过 transformHead 按页面生成 canonical、分享标题、描述及图片地址。
- `locales/*/site.ts`：仅保留站点标题、标题后缀和描述；语言代码由 registry.ts 登记。
- `locales/*/theme.ts`：仅保留主题文字，组装时明确合并 outline、editLink、lastUpdated 等嵌套对象。
- `locales/*/seo.ts`：仅保留作者、关键词和 Open Graph 语言标识；标题和描述复用当前页面数据。

VITE_SITE_URL 可填域名或带部署子路径的站点地址；子路径必须与 VITE_BASE 一致。
SEO 和 sitemap 统一使用该地址，避免重复添加 base。页面可通过 frontmatter 的 image
设置分享图片；已有的 canonical 和分享标签会保留。

## 新增菜单与栏目

1. 在 nav 或 sidebar 的栏目文件定义结构，使用稳定且带命名空间的 key。
2. 站内链接写 `link: { path: '/guide/install' }`，不带语言前缀，不添加部署 base。
   外部链接、公共资源和当前页面锚点写 `link: { url: '...' }`，保持原值。
3. 各语言对应栏目文案使用 `satisfies MenuText<typeof 栏目结构>`，结构使用
   `as const satisfies readonly MenuNode[]`，确保缺失或拼错的 key 被类型检查发现。
4. 在相应 index.ts 中汇总。文案使用 `mergeText`，重复 key 会报错。
5. 有顶部导航才增加 nav 文件，有侧边栏才增加 sidebar 文件，不要求创建所有类别的文件。
6. 侧边栏在 sidebar/index.ts 注册 `id`、`prefix` 和 `items`；前缀以 / 开头和结尾。
   首页不显示侧边栏，更具体的分区匹配优先。
7. 运行 `pnpm test:i18n` 和 `pnpm typecheck`，再检查开发预览。

分组使用 `items`，侧边栏可使用 `collapsed`；顶部导航分组不能同时有链接。
沿用默认主题导航分组深度与侧边栏最多六层的限制。
页面目标以 cleanUrls 规则解析，正文目录与语言登记的 sourceDir 对应。
中文、英文、越南语分别使用 /zh/、/en/、/vi/，不使用路径重写。

## 新增语言

在 i18n/registry.ts 登记语言代码、VitePress configKey、标签、路径前缀、
正文目录和 fallback；在 locales 中提供对应语言配置，并加入 i18n/index.ts 的 localeTexts。
正文位于 `src/语言目录/`，访问路径保留该语言目录。

所有语言的栏目文案遵循同一组推导出的 key。配置加载时校验菜单、翻译、
重复项、语言前缀和各语言页面是否存在；缺少页面应先补齐或明确调整菜单，不会静默生成失效链接。
resolveText 支持文案回退，但当前菜单校验要求完整翻译，fallback 不表示自动跳转到原文页面。

## 扩展约定

栏目出现独立子模块或约 300 个节点时，考虑把 api.ts 升级为 api/index.ts、
core.ts、plugins.ts。约 300 项是提醒，不是硬性门槛。
结构与各语言文案保持相同逻辑分区和导出接口，物理文件可按维护需要拆分。
优先按栏目推导 key，不手写全站 key 清单；不复制整套菜单结构到各语言目录。

大量页面按路径分区展示。拆文件改善维护，但不会自动减少浏览器配置体积。
当前不提供自动菜单生成；将来可在 sidebar/ 增加工具，不必更换现有模块接口。

## 验证

`pnpm test:i18n` 检查菜单解析、页面校验、语言链接、原有菜单行为和文案类型约束。
tests/i18n/baseline.json 记录迁移前的示例菜单；有意修改示例菜单或文案时，同步更新该回归基线。
全项目 typecheck 可能报告其他模块已有错误，必须如实区分。

## 导入约定

跨目录导入使用 `#config/` 别名，指向 `.vitepress/config/`；同目录保留 `./`。
相对导入写完整扩展名，例如 `./site.ts`；目录入口写 `./nav/index.ts`，
避免 Vite 原生配置加载的兼容性警告。TypeScript 仅检查类型，不输出文件。
例如 `import type { MenuText } from '#config/i18n/types'`。
目录入口显式使用 `#config/nav/index`。
别名由 package.json 的 imports 和 tsconfig.json 的 paths 对齐配置，
支持 VitePress 配置加载及类型检查，不依赖配置加载后的 Vite alias。
栏目结构及三种语言文案直接按栏目组织，不再增加 demo 层。
