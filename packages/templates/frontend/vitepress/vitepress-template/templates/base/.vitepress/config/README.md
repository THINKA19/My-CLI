# 站点配置

主入口为 `.vitepress/config.ts`，文档内容位于 `src/`。

- `site.ts`：部署 base、站点地址、目录与构建设置。
- `language.ts`：本项目选择的单语言或多语言配置。
- `locales/`：所选语言的站点、主题、搜索及 SEO 文案。
- `menu/registry.ts`：当前语言、默认语言和源码目录。
- `menu/`：导航、侧边栏文案解析及校验工具。
- `nav/`、`sidebar/`：组合生成的导航与侧边栏。
- `generated/`：自动生成的栏目结构与文案，不要手动修改。
- `search.ts`、`seo.ts`：站内搜索和页面 SEO。
- `sitemap.ts`：仅多语言项目包含，关联实际存在的翻译页面。

单语言页面直接位于 `src/`；多语言页面使用 `src/{语言代码}/`，根入口跳转至默认语言。

修改文档后运行 `pnpm menus:generate`；`dev`、`build` 和 `typecheck` 已先执行菜单生成。
菜单字段与使用方式见 [菜单生成说明](../../scripts/menus/README.md)。
